const asyncHandler = require('express-async-handler');
const path = require('path');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { extractTextFromBuffer } = require('../utils/textExtractor');
const aiService = require('../services/aiService');
const { sendResumeAnalyzedEmail } = require('../services/emailService');

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const fileType = ext === '.pdf' ? 'pdf' : 'docx';

  const resume = await Resume.create({
    user: req.user._id,
    originalName: req.file.originalname,
    fileType,
    fileSizeKB: Math.round(req.file.size / 1024),
    status: 'uploaded',
  });

  res.status(202).json({
    success: true,
    message: 'Resume uploaded successfully. Analysis in progress.',
    resumeId: resume._id,
  });

  processResumeFromBuffer(req.file.buffer, fileType, resume, req);
});

const processResumeFromBuffer = async (buffer, fileType, resume, req) => {
  try {
    resume.status = 'processing';
    await resume.save();

    const extractedText = await extractTextFromBuffer(buffer, fileType);

    resume.extractedText = extractedText;
    await resume.save();

    const targetRole = req.body?.targetRole || '';
    const analysis = await aiService.analyzeResume(extractedText, targetRole);

    resume.analysis = analysis;
    resume.status = 'analyzed';
    await resume.save();

    const user = await User.findById(req.user._id);
    if (user) {
      user.totalAtsScore += analysis.atsScore || 0;
      if (analysis.atsScore > user.bestAtsScore) {
        user.bestAtsScore = analysis.atsScore;
      }
      user.resumeCount += 1;
      user.lastActive = new Date();
      await user.save();
    }

    try {
      await sendResumeAnalyzedEmail(user, resume);
    } catch (emailErr) {
      console.warn('Failed to send resume analyzed email:', emailErr.message);
    }
  } catch (error) {
    resume.status = 'failed';
    resume.errorMessage = error.message;
    await resume.save();
    console.error('Resume analysis failed:', error.message);
  }
};

const getResumes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [resumes, total] = await Promise.all([
    Resume.find({ user: req.user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Resume.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    resumes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }
  if (resume.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this resume');
  }
  res.json({ success: true, resume });
});

const getResumeStatus = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id).select('status analysis.atsScore');
  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }
  if (resume.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this resume');
  }
  res.json({
    success: true,
    status: resume.status,
    atsScore: resume.analysis?.atsScore || null,
  });
});

const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }
  if (resume.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this resume');
  }

  await resume.deleteOne();

  res.json({ success: true, message: 'Resume deleted successfully' });
});

const reanalyzeResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }
  if (resume.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to reanalyze this resume');
  }
  if (!resume.extractedText) {
    res.status(400);
    throw new Error('No extracted text available. Please re-upload the resume.');
  }

  res.status(202).json({
    success: true,
    message: 'Reanalysis started.',
    resumeId: resume._id,
  });

  try {
    resume.status = 'processing';
    await resume.save();

    const targetRole = req.body?.targetRole || '';
    const analysis = await aiService.analyzeResume(resume.extractedText, targetRole);

    resume.analysis = analysis;
    resume.status = 'analyzed';
    await resume.save();

    const user = await User.findById(req.user._id);
    if (user) {
      user.totalAtsScore += analysis.atsScore || 0;
      if (analysis.atsScore > user.bestAtsScore) {
        user.bestAtsScore = analysis.atsScore;
      }
      user.lastActive = new Date();
      await user.save();
    }
  } catch (error) {
    resume.status = 'failed';
    resume.errorMessage = error.message;
    await resume.save();
    console.error('Resume reanalysis failed:', error.message);
  }
});

module.exports = {
  uploadResume,
  getResumes,
  getResume,
  getResumeStatus,
  deleteResume,
  reanalyzeResume,
};

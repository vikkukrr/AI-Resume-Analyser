const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { extractText } = require('../utils/textExtractor');
const { analyzeResume } = require('../services/aiService');
const { resumeAnalyzedEmail } = require('../services/emailService');

// POST /api/resumes/upload
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }

  const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
  const fileType = ext === 'pdf' ? 'pdf' : 'docx';

  const resume = await Resume.create({
    user: req.user._id,
    originalName: req.file.originalname,
    filename: req.file.filename,
    filePath: req.file.path,
    fileType,
    fileSizeKB: Math.round(req.file.size / 1024),
    status: 'processing',
  });

  res.status(202).json({ success: true, resumeId: resume._id, message: 'Upload successful. Analysis in progress…' });

  // Async processing (don't await)
  processResume(resume._id, req.file.path, fileType, req.body.targetRole || req.user.targetRole, req.user).catch(console.error);
});

async function processResume(resumeId, filePath, fileType, targetRole, user) {
  try {
    const text = await extractText(filePath, fileType);
    const analysis = await analyzeResume(text, targetRole);

    await Resume.findByIdAndUpdate(resumeId, {
      extractedText: text,
      analysis,
      status: 'analyzed',
    });

    // Update user stats
    const atsScore = analysis.atsScore || 0;
    const update = {
      $inc: { resumeCount: 1, totalAtsScore: atsScore },
      $max: { bestAtsScore: atsScore },
      lastActive: new Date(),
    };
    await User.findByIdAndUpdate(user._id, update);

    resumeAnalyzedEmail(user.name, user.email, atsScore).catch(() => {});
  } catch (err) {
    console.error('Resume processing failed:', err.message);
    await Resume.findByIdAndUpdate(resumeId, { status: 'failed', errorMessage: err.message });
  }
}

// GET /api/resumes
exports.getResumes = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [resumes, total] = await Promise.all([
    Resume.find({ user: req.user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Resume.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, resumes, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/resumes/:id
exports.getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) { res.status(404); throw new Error('Resume not found'); }
  res.json({ success: true, resume });
});

// GET /api/resumes/:id/status
exports.getResumeStatus = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id }).select('status analysis.atsScore errorMessage');
  if (!resume) { res.status(404); throw new Error('Resume not found'); }
  res.json({ success: true, status: resume.status, atsScore: resume.analysis?.atsScore, error: resume.errorMessage });
});

// DELETE /api/resumes/:id
exports.deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) { res.status(404); throw new Error('Resume not found'); }

  if (resume.filePath && fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
  await Resume.deleteOne({ _id: resume._id });
  await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: -1 } });

  res.json({ success: true, message: 'Resume deleted' });
});

// POST /api/resumes/:id/reanalyze
exports.reanalyzeResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) { res.status(404); throw new Error('Resume not found'); }
  if (resume.status === 'processing') { res.status(409); throw new Error('Analysis already in progress'); }

  await Resume.findByIdAndUpdate(resume._id, { status: 'processing', errorMessage: '' });
  res.json({ success: true, message: 'Re-analysis started' });

  processResume(resume._id, resume.filePath, resume.fileType, req.body.targetRole || req.user.targetRole, req.user).catch(console.error);
});

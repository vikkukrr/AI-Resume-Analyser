const asyncHandler = require('express-async-handler');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { sendInterviewCompleteEmail } = require('../services/emailService');

const startInterview = asyncHandler(async (req, res) => {
  const { targetRole, difficulty, resumeId } = req.body;

  if (!targetRole || !difficulty) {
    res.status(400);
    throw new Error('Target role and difficulty are required');
  }

  let resumeText = '';
  if (resumeId) {
    const resume = await Resume.findById(resumeId).select('+extractedText');
    if (resume && resume.user.toString() === req.user._id.toString()) {
      resumeText = resume.extractedText || '';
    }
  }

  const data = await aiService.generateInterviewQuestions(targetRole, difficulty, resumeText);

  const interview = await Interview.create({
    user: req.user._id,
    resume: resumeId || undefined,
    targetRole,
    difficulty,
    questions: data.questions,
    status: 'in_progress',
    startedAt: new Date(),
  });

  const user = await User.findById(req.user._id);
  if (user) {
    user.lastActive = new Date();
    await user.save();
  }

  res.status(201).json({ success: true, interview });
});

const answerQuestion = asyncHandler(async (req, res) => {
  const { questionIndex, userAnswer } = req.body;

  if (questionIndex === undefined || questionIndex === null) {
    res.status(400);
    throw new Error('Question index is required');
  }
  if (!userAnswer) {
    res.status(400);
    throw new Error('Answer is required');
  }

  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }
  if (interview.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (interview.status !== 'in_progress') {
    res.status(400);
    throw new Error('Interview is not in progress');
  }

  const question = interview.questions[questionIndex];
  if (!question) {
    res.status(400);
    throw new Error('Invalid question index');
  }
  if (question.answered) {
    res.status(400);
    throw new Error('Question already answered');
  }

  question.userAnswer = userAnswer;
  question.answered = true;

  const evaluation = await aiService.evaluateAnswer(
    question.question,
    userAnswer,
    interview.targetRole,
    question.expectedTopics
  );

  question.evaluation = evaluation;
  await interview.save();

  const answeredCount = interview.questions.filter((q) => q.answered).length;
  interview.completionPercentage = Math.round((answeredCount / interview.questions.length) * 100);
  await interview.save();

  res.json({ success: true, evaluation });
});

const skipQuestion = asyncHandler(async (req, res) => {
  const { questionIndex } = req.body;

  if (questionIndex === undefined || questionIndex === null) {
    res.status(400);
    throw new Error('Question index is required');
  }

  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }
  if (interview.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (interview.status !== 'in_progress') {
    res.status(400);
    throw new Error('Interview is not in progress');
  }

  const question = interview.questions[questionIndex];
  if (!question) {
    res.status(400);
    throw new Error('Invalid question index');
  }

  question.skipped = true;
  await interview.save();

  res.json({ success: true, message: 'Question skipped' });
});

const completeInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }
  if (interview.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (interview.status === 'completed') {
    res.status(400);
    throw new Error('Interview already completed');
  }

  const answeredQuestions = interview.questions.filter(
    (q) => q.answered && q.evaluation && q.evaluation.score !== undefined
  );

  let totalScore = 0;
  let confidenceScore = 0;
  let technicalScore = 0;
  let communicationScore = 0;

  if (answeredQuestions.length > 0) {
    totalScore = parseFloat(
      (
        answeredQuestions.reduce((sum, q) => sum + (q.evaluation.score || 0), 0) /
        answeredQuestions.length
      ).toFixed(1)
    );
    confidenceScore = parseFloat(
      (
        answeredQuestions.reduce((sum, q) => sum + (q.evaluation.depth || 0), 0) /
        answeredQuestions.length
      ).toFixed(1)
    );
    technicalScore = parseFloat(
      (
        answeredQuestions.reduce((sum, q) => sum + (q.evaluation.technicalAccuracy || 0), 0) /
        answeredQuestions.length
      ).toFixed(1)
    );
    communicationScore = parseFloat(
      (
        answeredQuestions.reduce((sum, q) => sum + (q.evaluation.communication || 0), 0) /
        answeredQuestions.length
      ).toFixed(1)
    );
  }

  interview.totalScore = totalScore;
  interview.confidenceScore = confidenceScore;
  interview.technicalScore = technicalScore;
  interview.communicationScore = communicationScore;
  interview.completionPercentage = 100;
  interview.status = 'completed';
  interview.completedAt = new Date();

  try {
    const feedback = await aiService.generateOverallFeedback(
      interview.questions,
      interview.targetRole,
      totalScore
    );
    interview.overallFeedback = feedback;
  } catch (err) {
    console.warn('Failed to generate overall feedback:', err.message);
  }

  await interview.save();

  const user = await User.findById(req.user._id);
  if (user) {
    user.interviewCount += 1;
    user.totalInterviewScore += totalScore;
    user.avgInterviewScore = parseFloat(
      (user.totalInterviewScore / user.interviewCount).toFixed(1)
    );
    user.lastActive = new Date();
    await user.save();

    try {
      await sendInterviewCompleteEmail(user, interview);
    } catch (emailErr) {
      console.warn('Failed to send interview complete email:', emailErr.message);
    }
  }

  res.json({ success: true, interview });
});

const getInterviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [interviews, total] = await Promise.all([
    Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Interview.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    interviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }
  if (interview.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  res.json({ success: true, interview });
});

const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }
  if (interview.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  await interview.deleteOne();
  res.json({ success: true, message: 'Interview deleted successfully' });
});

module.exports = {
  startInterview,
  answerQuestion,
  skipQuestion,
  completeInterview,
  getInterviews,
  getInterview,
  deleteInterview,
};

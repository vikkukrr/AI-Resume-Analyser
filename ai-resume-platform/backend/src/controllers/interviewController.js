const asyncHandler = require('express-async-handler');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { generateInterviewQuestions, evaluateAnswer, generateOverallFeedback } = require('../services/aiService');
const { interviewCompleteEmail } = require('../services/emailService');

// POST /api/interviews/start
exports.startInterview = asyncHandler(async (req, res) => {
  const { targetRole, difficulty, resumeId } = req.body;
  if (!targetRole) { res.status(400); throw new Error('targetRole is required'); }

  let resumeText = '';
  if (resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (resume) resumeText = resume.extractedText || '';
  }

  const rawQuestions = await generateInterviewQuestions(targetRole, difficulty || 'intermediate', resumeText);

  const interview = await Interview.create({
    user: req.user._id,
    resume: resumeId || undefined,
    targetRole,
    difficulty: difficulty || 'intermediate',
    questions: rawQuestions.map((q) => ({
      question: q.question,
      category: q.category || 'General',
      difficulty: q.difficulty || 'medium',
      expectedTopics: q.expectedTopics || [],
    })),
    status: 'in_progress',
    startedAt: new Date(),
  });

  res.status(201).json({ success: true, interview });
});

// POST /api/interviews/:id/answer
exports.submitAnswer = asyncHandler(async (req, res) => {
  const { questionId, answer } = req.body;
  if (!questionId) { res.status(400); throw new Error('questionId is required'); }

  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) { res.status(404); throw new Error('Interview not found'); }
  if (interview.status === 'completed') { res.status(409); throw new Error('Interview already completed'); }

  const question = interview.questions.id(questionId);
  if (!question) { res.status(404); throw new Error('Question not found'); }

  const evaluation = await evaluateAnswer(
    question.question, answer, interview.targetRole, question.expectedTopics
  );

  question.userAnswer = answer;
  question.answered = true;
  question.evaluation = evaluation;
  await interview.save();

  res.json({ success: true, evaluation });
});

// POST /api/interviews/:id/skip
exports.skipQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.body;
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) { res.status(404); throw new Error('Interview not found'); }

  const question = interview.questions.id(questionId);
  if (question) { question.skipped = true; question.answered = true; }
  await interview.save();

  res.json({ success: true, message: 'Question skipped' });
});

// POST /api/interviews/:id/complete
exports.completeInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) { res.status(404); throw new Error('Interview not found'); }
  if (interview.status === 'completed') return res.json({ success: true, interview });

  const answered = interview.questions.filter((q) => q.answered && !q.skipped);
  const total = interview.questions.length;
  const completionPct = Math.round((answered.length / total) * 100);

  const avgScore = answered.length
    ? Math.round(answered.reduce((s, q) => s + (q.evaluation?.score || 0), 0) / answered.length)
    : 0;
  const techScore = answered.length
    ? Math.round(answered.reduce((s, q) => s + (q.evaluation?.technicalAccuracy || 0) * 10, 0) / answered.length)
    : 0;
  const commScore = answered.length
    ? Math.round(answered.reduce((s, q) => s + (q.evaluation?.communication || 0) * 10, 0) / answered.length)
    : 0;
  const confidenceBonus = Math.min(10, Math.round(completionPct / 10));

  const overallFeedback = await generateOverallFeedback(interview.questions, interview.targetRole, avgScore);

  interview.totalScore = avgScore;
  interview.technicalScore = techScore;
  interview.communicationScore = commScore;
  interview.confidenceScore = Math.min(100, avgScore + confidenceBonus);
  interview.completionPercentage = completionPct;
  interview.durationSeconds = interview.startedAt ? Math.round((Date.now() - interview.startedAt) / 1000) : 0;
  interview.overallFeedback = overallFeedback;
  interview.status = 'completed';
  interview.completedAt = new Date();
  await interview.save();

  // Update user stats
  const user = await User.findById(req.user._id);
  const newCount = user.interviewCount + 1;
  const newAvg = Math.round((user.totalInterviewScore + avgScore) / newCount);
  await User.findByIdAndUpdate(req.user._id, {
    interviewCount: newCount,
    totalInterviewScore: user.totalInterviewScore + avgScore,
    avgInterviewScore: newAvg,
    lastActive: new Date(),
  });

  interviewCompleteEmail(user.name, user.email, avgScore, interview.targetRole).catch(() => {});

  res.json({ success: true, interview });
});

// GET /api/interviews
exports.getInterviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const [interviews, total] = await Promise.all([
    Interview.find({ user: req.user._id })
      .select('-questions.userAnswer -questions.evaluation.modelAnswer')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Interview.countDocuments({ user: req.user._id }),
  ]);
  res.json({ success: true, interviews, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/interviews/:id
exports.getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate('resume', 'originalName');
  if (!interview) { res.status(404); throw new Error('Interview not found'); }
  res.json({ success: true, interview });
});

// DELETE /api/interviews/:id
exports.deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!interview) { res.status(404); throw new Error('Interview not found'); }
  res.json({ success: true, message: 'Interview deleted' });
});

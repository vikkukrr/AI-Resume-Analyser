const asyncHandler = require('express-async-handler');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const User = require('../models/User');
const { generateCareerRoadmap } = require('../services/aiService');

// GET /api/dashboard/stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [user, resumes, interviews] = await Promise.all([
    User.findById(userId),
    Resume.find({ user: userId, status: 'analyzed' })
      .select('analysis.atsScore createdAt originalName')
      .sort({ createdAt: -1 })
      .limit(12),
    Interview.find({ user: userId, status: 'completed' })
      .select('totalScore confidenceScore targetRole completionPercentage createdAt durationSeconds')
      .sort({ createdAt: -1 })
      .limit(12),
  ]);

  const atsHistory = resumes.map((r) => ({
    date: r.createdAt,
    score: r.analysis?.atsScore || 0,
    name: r.originalName,
  })).reverse();

  const interviewHistory = interviews.map((i) => ({
    date: i.createdAt,
    score: i.totalScore,
    role: i.targetRole,
    confidence: i.confidenceScore,
  })).reverse();

  const roleDistribution = interviews.reduce((acc, i) => {
    acc[i.targetRole] = (acc[i.targetRole] || 0) + 1;
    return acc;
  }, {});

  const recentResumes = await Resume.find({ user: userId })
    .select('originalName status analysis.atsScore createdAt fileType')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentInterviews = await Interview.find({ user: userId })
    .select('targetRole totalScore status difficulty createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    stats: {
      totalResumes: user.resumeCount,
      bestAtsScore: user.bestAtsScore,
      avgAtsScore: resumes.length ? Math.round(resumes.reduce((s, r) => s + (r.analysis?.atsScore || 0), 0) / resumes.length) : 0,
      totalInterviews: user.interviewCount,
      avgInterviewScore: user.avgInterviewScore,
      bestInterviewScore: interviews.length ? Math.max(...interviews.map((i) => i.totalScore)) : 0,
      streak: user.streak,
    },
    atsHistory,
    interviewHistory,
    roleDistribution,
    recentResumes,
    recentInterviews,
  });
});

// GET /api/dashboard/roadmap
exports.getCareerRoadmap = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const roadmap = await generateCareerRoadmap(user);
  res.json({ success: true, roadmap });
});

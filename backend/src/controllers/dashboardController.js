const asyncHandler = require('express-async-handler');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const User = require('../models/User');
const aiService = require('../services/aiService');

const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [resumes, interviews, atsHistory, interviewHistory] = await Promise.all([
    Resume.find({ user: userId, status: 'analyzed' }).select('analysis.atsScore targetRole createdAt'),
    Interview.find({ user: userId, status: 'completed' }).select('totalScore targetRole createdAt'),
    Resume.find({ user: userId, status: 'analyzed' })
      .sort({ createdAt: -1 })
      .limit(12)
      .select('analysis.atsScore createdAt'),
    Interview.find({ user: userId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(12)
      .select('totalScore targetRole createdAt'),
  ]);

  const totalResumes = resumes.length;
  const bestAtsScore = resumes.length > 0 ? Math.max(...resumes.map((r) => r.analysis?.atsScore || 0)) : 0;
  const avgAtsScore =
    resumes.length > 0
      ? parseFloat(
          (resumes.reduce((sum, r) => sum + (r.analysis?.atsScore || 0), 0) / resumes.length).toFixed(1)
        )
      : 0;

  const totalInterviews = interviews.length;
  const avgInterviewScore =
    interviews.length > 0
      ? parseFloat(
          (interviews.reduce((sum, i) => sum + (i.totalScore || 0), 0) / interviews.length).toFixed(1)
        )
      : 0;
  const bestInterviewScore =
    interviews.length > 0 ? Math.max(...interviews.map((i) => i.totalScore || 0)) : 0;

  const roleCounts = {};
  resumes.forEach((r) => {
    if (r.targetRole) {
      roleCounts[r.targetRole] = (roleCounts[r.targetRole] || 0) + 1;
    }
  });
  const roleDistribution = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

  const recentResumes = resumes.slice(0, 5);
  const recentInterviews = interviews.slice(0, 5);

  res.json({
    success: true,
    stats: {
      totalResumes,
      bestAtsScore,
      avgAtsScore,
      totalInterviews,
      avgInterviewScore,
      bestInterviewScore,
    },
    atsHistory: atsHistory.reverse().map((r) => ({
      score: r.analysis?.atsScore || 0,
      date: r.createdAt,
    })),
    interviewHistory: interviewHistory.reverse().map((i) => ({
      score: i.totalScore || 0,
      role: i.targetRole,
      date: i.createdAt,
    })),
    roleDistribution,
    recentResumes,
    recentInterviews,
  });
});

const getRoadmap = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const userProfile = {
    name: user.name,
    targetRole: user.targetRole,
    skills: user.skills,
    bio: user.bio,
    bestAtsScore: user.bestAtsScore,
    avgInterviewScore: user.avgInterviewScore,
    interviewCount: user.interviewCount,
    resumeCount: user.resumeCount,
    location: user.location,
  };

  const roadmap = await aiService.generateCareerRoadmap(userProfile);
  res.json({ success: true, roadmap });
});

module.exports = { getStats, getRoadmap };

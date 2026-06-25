const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, targetRole, skills, linkedIn, github, website, location } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (targetRole !== undefined) user.targetRole = targetRole;
  if (skills !== undefined) user.skills = skills;
  if (linkedIn !== undefined) user.linkedIn = linkedIn;
  if (github !== undefined) user.github = github;
  if (website !== undefined) user.website = website;
  if (location !== undefined) user.location = location;

  const updated = await user.save();

  res.json({ success: true, user: updated });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const sortBy = req.query.sortBy || 'ats';
  const limit = parseInt(req.query.limit, 10) || 50;

  let users;
  if (sortBy === 'interview') {
    users = await User.find({ isActive: true, interviewCount: { $gt: 0 } })
      .sort({ avgInterviewScore: -1 })
      .limit(limit)
      .select('name avatar targetRole avgInterviewScore interviewCount');
  } else {
    users = await User.find({ isActive: true, resumeCount: { $gt: 0 } })
      .sort({ bestAtsScore: -1 })
      .limit(limit)
      .select('name avatar targetRole bestAtsScore resumeCount');
  }

  const ranked = users.map((u, i) => ({
    rank: i + 1,
    name: u.name,
    avatar: u.avatar,
    targetRole: u.targetRole,
    score: sortBy === 'interview' ? u.avgInterviewScore : u.bestAtsScore,
  }));

  res.json({ success: true, leaderboard: ranked });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email -loginCount -lastLogin');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (!user.isActive) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = false;
  await user.save();
  res.json({ success: true, message: 'Account deactivated successfully' });
});

module.exports = { getProfile, updateProfile, getLeaderboard, getUserById, deleteAccount };

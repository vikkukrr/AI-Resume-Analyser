const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: user.toPublicJSON() });
});

// PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'bio', 'targetRole', 'skills', 'linkedIn', 'github', 'website', 'location', 'avatar'];
  const updates = {};
  allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user: user.toPublicJSON() });
});

// GET /api/users/leaderboard
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const sortBy = req.query.sortBy === 'ats' ? { bestAtsScore: -1 } : { avgInterviewScore: -1 };

  const users = await User.find({ isActive: true, interviewCount: { $gt: 0 } })
    .select('name avatar targetRole avgInterviewScore bestAtsScore interviewCount resumeCount streak')
    .sort(sortBy)
    .limit(limit);

  const myRank = users.findIndex((u) => u._id.toString() === req.user._id.toString()) + 1;

  res.json({ success: true, leaderboard: users, myRank: myRank || null, total: users.length });
});

// GET /api/users/:id (public profile)
exports.getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name avatar bio targetRole skills linkedIn github website avgInterviewScore bestAtsScore interviewCount resumeCount'
  );
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

// DELETE /api/users/account
exports.deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  res.json({ success: true, message: 'Account deactivated successfully' });
});

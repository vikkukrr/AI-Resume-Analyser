const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const Feedback = require('../models/Feedback');

// GET /api/admin/stats
exports.getStats = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, totalResumes, totalInterviews, pendingFeedback] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', isActive: true }),
    Resume.countDocuments(),
    Interview.countDocuments({ status: 'completed' }),
    Feedback.countDocuments({ status: 'open' }),
  ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  const topUsers = await User.find({ role: 'user', isActive: true })
    .select('name email avgInterviewScore bestAtsScore interviewCount resumeCount lastLogin')
    .sort({ avgInterviewScore: -1 })
    .limit(10);

  res.json({
    success: true,
    stats: { totalUsers, activeUsers, totalResumes, totalInterviews, newUsersThisMonth, pendingFeedback },
    topUsers,
  });
});

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const search = req.query.search || '';
  const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
});

// PATCH /api/admin/users/:id/toggle
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(403); throw new Error('Cannot deactivate admin accounts'); }
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, isActive: user.isActive, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
});

// PATCH /api/admin/users/:id/role
exports.changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) { res.status(400); throw new Error('Invalid role'); }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

// GET /api/admin/feedback
exports.getFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, feedback });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(403); throw new Error('Cannot delete admin accounts'); }
  await User.deleteOne({ _id: user._id });
  res.json({ success: true, message: 'User permanently deleted' });
});

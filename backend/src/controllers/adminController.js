const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');

const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalResumes, totalInterviews, topUsers] = await Promise.all([
    User.countDocuments(),
    Resume.countDocuments(),
    Interview.countDocuments(),
    User.find({ isActive: true, interviewCount: { $gt: 0 } })
      .sort({ avgInterviewScore: -1 })
      .limit(10)
      .select('name email avatar targetRole avgInterviewScore interviewCount'),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalResumes,
      totalInterviews,
    },
    topUsers,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const toggleUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user });
});

const setRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role || !['user', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Role must be either "user" or "admin"');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.role = role;
  await user.save();
  res.json({ success: true, message: 'Role updated successfully', user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await Resume.deleteMany({ user: user._id });
  await Interview.deleteMany({ user: user._id });
  await user.deleteOne();
  res.json({ success: true, message: 'User and all associated data deleted successfully' });
});

module.exports = { getStats, getUsers, toggleUser, setRole, deleteUser };

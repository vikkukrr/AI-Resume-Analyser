const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateAccessToken } = require('../middleware/auth');
const { welcomeEmail } = require('../services/emailService');

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateAccessToken(user._id);
  res.status(statusCode).json({ success: true, token, user: user.toPublicJSON() });
};

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, targetRole } = req.body;
  const user = await User.create({ name, email, password, targetRole: targetRole || '' });
  welcomeEmail(user.name, user.email).catch(() => {});
  sendTokenResponse(user, 201, res);
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact support.');
  }
  user.lastLogin = new Date();
  user.loginCount += 1;
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });
  sendTokenResponse(user, 200, res);
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: user.toPublicJSON() });
});

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

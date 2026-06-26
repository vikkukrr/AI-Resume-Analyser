const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'careerai_fallback_secret_key_2024', {
    expiresIn: '30d'
  });
};

exports.register = asyncHandler(async (req, res) => {
  console.log('REGISTER REQUEST BODY:', req.body);

  const { name, email, password, targetRole } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    targetRole: targetRole || '',
    isActive: true,
  });

  console.log('USER CREATED:', user._id);

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetRole: user.targetRole,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      resumeCount: user.resumeCount,
      interviewCount: user.interviewCount,
      avgInterviewScore: user.avgInterviewScore,
      bestAtsScore: user.bestAtsScore,
      createdAt: user.createdAt,
    }
  });
});

exports.login = asyncHandler(async (req, res) => {
  console.log('LOGIN REQUEST BODY:', { email: req.body.email });

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  console.log('USER FOUND:', !!user);

  if (!user) {
    res.status(401);
    throw new Error('No account found with this email');
  }

  const isMatch = await user.matchPassword(password);
  console.log('PASSWORD MATCH:', isMatch);

  if (!isMatch) {
    res.status(401);
    throw new Error('Incorrect password');
  }

  user.lastLogin = new Date();
  user.loginCount = (user.loginCount || 0) + 1;
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetRole: user.targetRole,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      resumeCount: user.resumeCount,
      interviewCount: user.interviewCount,
      avgInterviewScore: user.avgInterviewScore,
      bestAtsScore: user.bestAtsScore,
      createdAt: user.createdAt,
    }
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetRole: user.targetRole,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      linkedIn: user.linkedIn,
      github: user.github,
      website: user.website,
      location: user.location,
      resumeCount: user.resumeCount,
      interviewCount: user.interviewCount,
      avgInterviewScore: user.avgInterviewScore,
      bestAtsScore: user.bestAtsScore,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  });
});

exports.logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id);
  res.json({ success: true, token, message: 'Password changed successfully' });
});

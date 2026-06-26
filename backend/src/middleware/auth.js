const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'careerai_fallback_secret_key_2024';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized - no token');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401);
    throw new Error('Not authorized - invalid token');
  }
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  throw new Error('Admin access required');
};

const generateAccessToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

module.exports = { protect, adminOnly, generateAccessToken };

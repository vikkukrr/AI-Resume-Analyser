const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: { type: String },
    bio: { type: String },
    targetRole: { type: String },
    skills: [{ type: String }],
    linkedIn: { type: String },
    github: { type: String },
    website: { type: String },
    location: { type: String },
    totalAtsScore: { type: Number, default: 0 },
    bestAtsScore: { type: Number, default: 0 },
    resumeCount: { type: Number, default: 0 },
    interviewCount: { type: Number, default: 0 },
    avgInterviewScore: { type: Number, default: 0 },
    totalInterviewScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date },
    isEmailVerified: { type: Boolean, default: true },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

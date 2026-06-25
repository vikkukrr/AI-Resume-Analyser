const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'], default: '' },
    targetRole: {
      type: String,
      enum: [
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Java Developer',
        'Python Developer',
        'Data Scientist',
        'DevOps Engineer',
        'Mobile Developer',
        '',
      ],
      default: '',
    },
    skills: [{ type: String, trim: true }],
    linkedIn: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
    location: { type: String, default: '' },

    /* Stats */
    totalAtsScore: { type: Number, default: 0 },
    bestAtsScore: { type: Number, default: 0 },
    resumeCount: { type: Number, default: 0 },
    interviewCount: { type: Number, default: 0 },
    avgInterviewScore: { type: Number, default: 0 },
    totalInterviewScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },

    /* Auth helpers */
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/* Indexes */
userSchema.index({ email: 1 });
userSchema.index({ avgInterviewScore: -1 });
userSchema.index({ bestAtsScore: -1 });

/* Hash password before save */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

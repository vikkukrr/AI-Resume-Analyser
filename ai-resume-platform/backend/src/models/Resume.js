const mongoose = require('mongoose');

const sectionScoreSchema = new mongoose.Schema(
  { score: Number, maxScore: Number, feedback: String, suggestions: [String] },
  { _id: false }
);

const jobMatchSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    matchScore: Number,
    requiredSkills: [String],
    description: String,
    salary: String,
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    filePath: { type: String },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    fileSizeKB: { type: Number },
    extractedText: { type: String, default: '' },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'analyzed', 'failed'],
      default: 'uploaded',
    },
    errorMessage: { type: String },

    analysis: {
      atsScore: { type: Number, min: 0, max: 100, default: 0 },
      experienceLevel: {
        type: String,
        enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Principal', ''],
        default: '',
      },
      estimatedYearsExperience: { type: Number, default: 0 },
      detectedRoles: [String],

      sections: {
        contact: sectionScoreSchema,
        summary: sectionScoreSchema,
        experience: sectionScoreSchema,
        education: sectionScoreSchema,
        skills: sectionScoreSchema,
        projects: sectionScoreSchema,
        certifications: sectionScoreSchema,
        formatting: sectionScoreSchema,
      },

      detectedSkills: [String],
      missingSkills: [String],
      keywords: [String],
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      overallSummary: { type: String, default: '' },

      jobMatches: [jobMatchSchema],
      careerRoadmap: {
        currentLevel: String,
        nextLevel: String,
        timeToNextLevel: String,
        nextSteps: [String],
        longTermGoals: [String],
        recommendedCourses: [{ name: String, platform: String, url: String }],
        salaryRange: { current: String, next: String },
      },
    },

    isDefault: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    tags: [String],
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ 'analysis.atsScore': -1 });

module.exports = mongoose.model('Resume', resumeSchema);

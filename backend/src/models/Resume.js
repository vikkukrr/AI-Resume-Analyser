const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: { type: String },
    filename: { type: String },
    filePath: { type: String },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
    },
    fileSizeKB: { type: Number },
    extractedText: { type: String, select: false },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'analyzed', 'failed'],
      default: 'uploaded',
    },
    errorMessage: { type: String },
    analysis: {
      atsScore: { type: Number, min: 0, max: 100 },
      experienceLevel: { type: String },
      estimatedYearsExperience: { type: Number },
      detectedRoles: [{ type: String }],
      sections: {
        contact: {
          score: Number,
          maxScore: Number,
          feedback: String,
          suggestions: [String],
        },
        summary: {
          score: Number,
          maxScore: Number,
          feedback: String,
          suggestions: [String],
        },
        experience: {
          score: Number,
          maxScore: Number,
          feedback: String,
          suggestions: [String],
        },
        education: {
          score: Number,
          maxScore: Number,
          feedback: String,
          suggestions: [String],
        },
        skills: {
          score: Number,
          maxScore: Number,
          feedback: String,
          suggestions: [String],
        },
        projects: {
          score: Number,
          maxScore: Number,
          feedback: String,
          suggestions: [String],
        },
        certifications: {
          score: Number,
          maxScore: Number,
          feedback: String,
          suggestions: [String],
        },
        formatting: {
          score: Number,
          maxScore: Number,
          feedback: String,
          suggestions: [String],
        },
      },
      detectedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      keywords: [{ type: String }],
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      recommendations: [{ type: String }],
      overallSummary: { type: String },
      jobMatches: [
        {
          title: String,
          company: String,
          matchScore: Number,
          requiredSkills: [String],
          description: String,
          salary: String,
        },
      ],
      careerRoadmap: {
        currentLevel: String,
        nextLevel: String,
        timeToNextLevel: String,
        nextSteps: [String],
        longTermGoals: [String],
        recommendedCourses: [
          {
            name: String,
            platform: String,
            url: String,
          },
        ],
        salaryRange: {
          current: String,
          next: String,
        },
      },
    },
    isDefault: { type: Boolean, default: false },
    notes: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);

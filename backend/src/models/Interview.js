const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    targetRole: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    questions: [
      {
        question: String,
        category: String,
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
        },
        expectedTopics: [String],
        userAnswer: String,
        answered: { type: Boolean, default: false },
        skipped: { type: Boolean, default: false },
        evaluation: {
          score: { type: Number, min: 0, max: 10 },
          technicalAccuracy: { type: Number, min: 0, max: 10 },
          communication: { type: Number, min: 0, max: 10 },
          depth: { type: Number, min: 0, max: 10 },
          feedback: String,
          strengths: [String],
          improvements: [String],
          modelAnswer: String,
        },
      },
    ],
    totalScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    overallFeedback: {
      summary: String,
      strengths: [String],
      areasToImprove: [String],
      nextSteps: [String],
      recommendedResources: [{ name: String, url: String }],
      readinessLevel: String,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'abandoned'],
      default: 'pending',
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);

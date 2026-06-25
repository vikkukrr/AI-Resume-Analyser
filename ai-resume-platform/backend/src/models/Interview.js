const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 100, default: 0 },
    feedback: { type: String, default: '' },
    strengths: [String],
    improvements: [String],
    modelAnswer: { type: String, default: '' },
    technicalAccuracy: { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    depth: { type: Number, min: 0, max: 10, default: 0 },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    expectedTopics: [String],
    userAnswer: { type: String, default: '' },
    evaluation: evaluationSchema,
    timeSpentSeconds: { type: Number, default: 0 },
    answered: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
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
      ],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    questions: [questionSchema],

    /* Scores */
    totalScore: { type: Number, min: 0, max: 100, default: 0 },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    technicalScore: { type: Number, min: 0, max: 100, default: 0 },
    communicationScore: { type: Number, min: 0, max: 100, default: 0 },
    completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
    durationSeconds: { type: Number, default: 0 },

    overallFeedback: {
      summary: { type: String, default: '' },
      strengths: [String],
      areasToImprove: [String],
      nextSteps: [String],
      recommendedResources: [String],
      readinessLevel: {
        type: String,
        enum: ['Not Ready', 'Developing', 'Almost Ready', 'Interview Ready', ''],
        default: '',
      },
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

interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ totalScore: -1 });

module.exports = mongoose.model('Interview', interviewSchema);

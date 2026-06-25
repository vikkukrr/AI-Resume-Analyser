const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['bug', 'feature', 'general', 'interview', 'resume'], default: 'general' },
    rating: { type: Number, min: 1, max: 5 },
    message: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
    adminReply: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);

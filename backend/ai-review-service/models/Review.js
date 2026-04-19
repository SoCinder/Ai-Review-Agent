const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    description: { type: String, required: true },
  },
  { _id: false }
);

const retrievedChunkSchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true },
    source: { type: String, required: true },
    title: { type: String },
    content: { type: String, required: true },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  draftId: {
    type: String,
    default: null,
  },
  summary: { type: String, required: true },
  issues: { type: [issueSchema], default: [] },
  suggestions: { type: [String], default: [] },
  citations: { type: [String], default: [] },
  retrievedChunks: { type: [retrievedChunkSchema], default: [] },
  initialConfidence: { type: Number, required: true },
  finalConfidence: { type: Number, required: true },
  reflectionNotes: { type: [String], default: [] },
  evidenceStatus: {
    type: String,
    enum: ['sufficient', 'weak', 'none', null],
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'completed',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

reviewSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Review', reviewSchema);

const mongoose = require('mongoose');

const implementationDraftSchema = new mongoose.Schema({
  featureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeatureRequest', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ImplementationDraft', implementationDraftSchema);

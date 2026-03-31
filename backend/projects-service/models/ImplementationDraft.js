const mongoose = require('mongoose');

const implementationDraftSchema = new mongoose.Schema({
  featureId: { type: String, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ImplementationDraft', implementationDraftSchema);

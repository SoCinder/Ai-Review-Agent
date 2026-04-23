const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeatureRequest', featureSchema);
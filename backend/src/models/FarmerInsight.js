const mongoose = require('mongoose');

const farmerInsightSchema = new mongoose.Schema({
  insightKey: { type: String, required: true },
  type: { type: String, required: true, enum: ['positive', 'warning', 'info', 'danger'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  version: { type: Number, default: 1 },
  generatedAt: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, collection: 'farmerinsights' });

farmerInsightSchema.index({ insightKey: 1, generatedAt: -1 });
farmerInsightSchema.index({ type: 1 });

module.exports = mongoose.model('FarmerInsight', farmerInsightSchema);

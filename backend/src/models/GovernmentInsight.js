const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  sourceCollection: { type: String, required: true },
  insight: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  lastDataUpdate: { type: Date },
  totalDocuments: { type: Number, default: 0 },
  insightVersion: { type: Number, default: 1 },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, collection: 'governmentinsights' });

insightSchema.index({ sourceCollection: 1, status: 1, generatedAt: -1 });

module.exports = mongoose.model('GovernmentInsight', insightSchema);

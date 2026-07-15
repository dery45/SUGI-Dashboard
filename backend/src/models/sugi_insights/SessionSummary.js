const mongoose = require('mongoose');
const insightsConnection = require('./index');

const sessionSummarySchema = new mongoose.Schema({
  insight_id: { type: String, required: true },
  category: { type: String, required: true },
  char_count: { type: Number, default: 0 },
  pushed_at: { type: Date, default: null },
  session_id: { type: String, required: true },
  summary: { type: String, default: '' },
  timestamp: { type: Date, default: null },
}, { timestamps: false });

sessionSummarySchema.index({ pushed_at: -1 });
sessionSummarySchema.index({ session_id: 1 });
sessionSummarySchema.index({ category: 1 });
sessionSummarySchema.index({ timestamp: -1 });

module.exports = insightsConnection.model('SessionSummary', sessionSummarySchema, 'session_summaries');

const mongoose = require('mongoose');
const conn = require('./index');

const nlpResultSchema = new mongoose.Schema({
  insight_id: { type: String, unique: true, index: true },
  session_id: { type: String, index: true },
  category: { type: String, index: true },
  char_count: Number,
  pushed_at: { type: Date, index: true },
  timestamp: Date,
  original_text: String,
  tokens: [String],
  filtered_tokens: [String],
  stemmed_tokens: [String],
  entities: [{
    type: { type: String },
    value: String,
    source: String,
    count: Number,
  }],
  intent: { type: String, index: true },
  intent_confidence: Number,
  intent_scores: mongoose.Schema.Types.Mixed,
  sentiment: { type: String, index: true },
  sentiment_score: Number,
  sentiment_positive: Number,
  sentiment_negative: Number,
  emotions: mongoose.Schema.Types.Mixed,
  entity_types: [String],
  locations: [{
    type: { type: String },
    value: String,
    source: String,
    count: Number,
  }],
  commodities: [{
    type: { type: String },
    value: String,
    source: String,
    count: Number,
  }],
  processed_at: Date,
}, { timestamps: true });

module.exports = conn.model('NlpResult', nlpResultSchema, 'nlp_results');

const mongoose = require('mongoose');

const activityTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String },
  description: { type: String },
  default_duration_hours: { type: Number },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('ActivityType', activityTypeSchema);

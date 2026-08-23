const mongoose = require('mongoose');

const activityTypeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    category: { type: String },
    description: { type: String },
    duration_hours: { type: Number },
    color: { type: String },
    unit: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ActivityType || mongoose.model('ActivityType', activityTypeSchema);
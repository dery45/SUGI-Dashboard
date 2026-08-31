const mongoose = require('mongoose');

const ACTIVITY_CATEGORY = ['Lainnya', 'Pemupukan - Perawatan - Penyemprotan', 'Panen'];

const activityTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, enum: ACTIVITY_CATEGORY, default: 'Lainnya' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

activityTypeSchema.statics.CATEGORIES = ACTIVITY_CATEGORY;

module.exports = mongoose.models.ActivityType || mongoose.model('ActivityType', activityTypeSchema);
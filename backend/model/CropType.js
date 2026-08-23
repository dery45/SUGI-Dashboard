const mongoose = require('mongoose');

const cropTypeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    scientific_name: { type: String },
    category: { type: String },
    duration_days: { type: Number },
    yield_per_ha: { type: Number },
    unit: { type: String },
    description: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.CropType || mongoose.model('CropType', cropTypeSchema);
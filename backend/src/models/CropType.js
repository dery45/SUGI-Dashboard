const mongoose = require('mongoose');

const cropTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  scientific_name: { type: String },
  category: { type: String },
  planting_duration_days: { type: Number },
  harvest_duration_days: { type: Number },
  description: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('CropType', cropTypeSchema);

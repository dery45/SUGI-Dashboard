const mongoose = require('mongoose');

const agriculturalInputSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['Fertilizer', 'Nutrient', 'Medicine'], required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    description: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

agriculturalInputSchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.models.AgriculturalInput || mongoose.model('AgriculturalInput', agriculturalInputSchema);

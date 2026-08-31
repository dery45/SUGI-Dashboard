const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    grade_name: { type: String, required: true },
    estimated_price_per_unit: { type: Number, required: true, min: 0 },
  },
  { _id: true, timestamps: true }
);

const cropVarietySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    crop_type: { type: mongoose.Schema.Types.ObjectId, ref: 'CropType', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    description: { type: String },
    grades: [gradeSchema],
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

cropVarietySchema.index({ crop_type: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.CropVariety || mongoose.model('CropVariety', cropVarietySchema);

const mongoose = require('mongoose');

const fertilizerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    description: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Fertilizer || mongoose.model('Fertilizer', fertilizerSchema);

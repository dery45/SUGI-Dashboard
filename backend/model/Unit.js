const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    symbol: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Unit || mongoose.model('Unit', unitSchema);

const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmMaster', required: true },
  area_ha: { type: Number, required: true },
  polygon: [{ lat: Number, lng: Number }],
  soil_type: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'Planted', 'Harvested'], default: 'Active' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

blockSchema.index({ farm: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Block', blockSchema);

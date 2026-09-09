const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmMaster', required: true },
    area_ha: { type: Number, required: true },
    polygon: [{ lat: Number, lng: Number }],
    soil_type: { type: String },
    water_source: { type: String },
    status: { type: String, enum: ['Active', 'Inactive', 'Planted', 'Harvested'], default: 'Active' },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

blockSchema.index({ farm: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Block || mongoose.model('Block', blockSchema);

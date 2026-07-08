const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  area_hectares: { type: Number, required: true },
  region: { type: String },
  soil_type: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'Under_Maintenance'], default: 'Active' },
  master_farm: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmMaster' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

farmSchema.index({ organization_id: 1 });
farmSchema.index({ owner_id: 1 });
farmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', farmSchema);

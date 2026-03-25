const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Can be an individual farmer
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  area_hectares: { type: Number, required: true },
  region: { type: String },
  soil_type: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'Under_Maintenance'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

farmSchema.index({ organization_id: 1 });
farmSchema.index({ owner_id: 1 });
farmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', farmSchema);

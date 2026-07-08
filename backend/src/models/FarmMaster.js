const mongoose = require('mongoose');

const farmMasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  province: { type: String },
  city: { type: String },
  district: { type: String },
  village: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  land_owner: { type: String },
  responsible_person: { type: String },
  contact: { type: String },
  total_area_ha: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FarmMaster', farmMasterSchema);

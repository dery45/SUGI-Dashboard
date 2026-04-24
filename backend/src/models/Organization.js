const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Company', 'Cooperative', 'Independent'], required: true },
  contact_email: { type: String },
  contact_phone: { type: String },
  address: { type: String },
  region: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

organizationSchema.index({ type: 1 });
organizationSchema.index({ region: 1 });

module.exports = mongoose.model('Organization', organizationSchema);

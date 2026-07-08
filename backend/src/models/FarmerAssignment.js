const mongoose = require('mongoose');

const farmerAssignmentSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmMaster', required: true },
  access_stages: [{ type: String, enum: ['Land_Preparation', 'Planting', 'Maintenance', 'Harvesting'] }],
  assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

farmerAssignmentSchema.index({ farmer: 1, block: 1 }, { unique: true });

module.exports = mongoose.model('FarmerAssignment', farmerAssignmentSchema);

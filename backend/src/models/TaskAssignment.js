const mongoose = require('mongoose');

const taskAssignmentSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop_cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle', required: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmMaster', required: true },
  stages: [{ type: String, enum: ['Land_Preparation', 'Planting', 'Maintenance', 'Harvesting'] }],
  assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

taskAssignmentSchema.index({ farmer: 1, crop_cycle: 1 }, { unique: true });

module.exports = mongoose.model('TaskAssignment', taskAssignmentSchema);

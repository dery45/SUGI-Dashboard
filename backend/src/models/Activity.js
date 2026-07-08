const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  crop_cycle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle' },
  cycle: { type: String },
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  farm_master: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmMaster' },
  block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  executor: { type: String },
  activity_type: { type: String },
  activity_type_ref: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivityType' },
  description: { type: String },
  date: { type: Date, required: true },
  assigned_farmers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  um_responsible_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  executor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'In_Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  labor_hours: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

activitySchema.index({ crop_cycle_id: 1 });
activitySchema.index({ farm_master: 1 });
activitySchema.index({ block: 1 });
activitySchema.index({ date: -1 });

module.exports = mongoose.model('Activity', activitySchema);

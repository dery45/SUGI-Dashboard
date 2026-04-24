const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  crop_cycle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle' },
  cycle: { type: String },
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  executor: { type: String },
  
  activity_type: { 
    type: String, 
    enum: ['Land_Clearing', 'Planting', 'Fertilizing', 'Spraying', 'Pruning', 'Harvesting', 'Inspection', 'Other'],
    required: true
  },
  
  description: { type: String },
  date: { type: Date, required: true },
  
  um_responsible_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UM' }, // UM overseeing this
  executor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Worker/Farmer who did it
  
  status: { type: String, enum: ['Pending', 'In_Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  
  // Resource usage
  labor_hours: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  
  // Auditable
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

activitySchema.index({ crop_cycle_id: 1 });
activitySchema.index({ um_responsible_id: 1 });
activitySchema.index({ date: -1 });

module.exports = mongoose.model('Activity', activitySchema);

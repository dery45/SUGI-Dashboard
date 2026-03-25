const mongoose = require('mongoose');

const harvestPeriodSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  crop_cycle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle', required: true },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  
  harvest_opening_date: { type: Date, required: true },
  harvest_closing_date: { type: Date },
  
  expected_yield_window_start: { type: Date },
  expected_yield_window_end: { type: Date },
  
  total_yield_kg: { type: Number, default: 0 },
  quality_grade: { type: String, enum: ['A', 'B', 'C', 'Reject'] },
  
  um_responsible_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UM' },
  
  // Auditing
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 1 }
}, { timestamps: true });

// Auto flag logic can be evaluated based on these dates
harvestPeriodSchema.index({ crop_cycle_id: 1, status: 1 });
harvestPeriodSchema.index({ organization_id: 1 });

harvestPeriodSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.version += 1;
  }
  next();
});

module.exports = mongoose.model('HarvestPeriod', harvestPeriodSchema);

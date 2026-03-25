const mongoose = require('mongoose');

const landRecordSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  crop_cycle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle', required: true },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  
  status: { type: String, enum: ['Open', 'In_Progress', 'Closed'], default: 'Open' },
  
  land_opening_date: { type: Date, required: true },
  land_closing_date: { type: Date },
  
  clearing_cost: { type: Number, default: 0 },
  soil_analysis_url: { type: String }, // Link to uploaded PDF/Image
  
  um_responsible_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UM' },
  
  // Auditing
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 1 }
}, { timestamps: true });

landRecordSchema.index({ farm_id: 1, crop_cycle_id: 1 });
landRecordSchema.index({ status: 1 });

// Middleware to update version on save
landRecordSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.version += 1;
  }
  next();
});

module.exports = mongoose.model('LandRecord', landRecordSchema);

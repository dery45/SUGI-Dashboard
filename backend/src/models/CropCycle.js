const mongoose = require('mongoose');

const cropCycleSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  farm_master: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmMaster' },
  block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  cycle: { type: String },
  crop_type: { type: String },
  crop_type_ref: { type: mongoose.Schema.Types.ObjectId, ref: 'CropType' },
  variety: { type: String },
  planting_density: { type: Number },
  area_ha: { type: Number },
  seedling_count: { type: Number },
  planting_date: { type: Date },
  executor: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting', 'Completed', 'Failed'], default: 'Planned' },
  land_opening_date: { type: Date },
  land_closing_date: { type: Date },
  harvest_opening_date: { type: Date },
  harvest_closing_date: { type: Date },
  expected_yield_kg: { type: Number },
  actual_yield_kg: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

cropCycleSchema.index({ farm_id: 1 });
cropCycleSchema.index({ farm_master: 1 });
cropCycleSchema.index({ block: 1 });

module.exports = mongoose.model('CropCycle', cropCycleSchema);

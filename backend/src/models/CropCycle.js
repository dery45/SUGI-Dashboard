const mongoose = require('mongoose');

const cropCycleSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  cycle: { type: String },
  crop_type: { type: String, enum: ['Oil_Palm', 'Coffee', 'Rice', 'Corn'], required: true },
  variety: { type: String },
  planting_density: { type: Number }, // trees per hectare
  area_ha: { type: Number },
  seedling_count: { type: Number },
  planting_date: { type: Date },
  executor: { type: String },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting', 'Completed', 'Failed'],
    default: 'Planned'
  },
  
  // Land Preparation Window
  land_opening_date: { type: Date },
  land_closing_date: { type: Date },
  
  // Harvesting Window
  harvest_opening_date: { type: Date },
  harvest_closing_date: { type: Date },
  
  expected_yield_kg: { type: Number },
  actual_yield_kg: { type: Number, default: 0 },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

cropCycleSchema.index({ farm_id: 1 });
cropCycleSchema.index({ organization_id: 1 });
cropCycleSchema.index({ status: 1 });

module.exports = mongoose.model('CropCycle', cropCycleSchema);

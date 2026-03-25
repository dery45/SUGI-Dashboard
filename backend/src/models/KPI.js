const mongoose = require('mongoose');

// While KPIs are typically derived via Aggregation, 
// caching daily snapshots can be incredibly performant for dashboards.
const kpiSnapshotSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  date: { type: Date, required: true },
  
  // Aggregate Metrics
  total_active_farms: { type: Number, default: 0 },
  total_yield_kg: { type: Number, default: 0 },
  average_yield_per_ha: { type: Number, default: 0 },
  cost_per_kg: { type: Number, default: 0 },
  roi_percentage: { type: Number, default: 0 },
  
  // UM Overviews
  top_performing_um_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UM' },
  issues_detected: { type: Number, default: 0 }
}, { timestamps: true });

kpiSnapshotSchema.index({ organization_id: 1, date: -1 });

module.exports = mongoose.model('KPI', kpiSnapshotSchema);

const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  crop_cycle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle', required: true },
  farm_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },

  buyer_name: { type: String, required: true },
  buyer_type: { type: String, enum: ['Mill', 'Middleman', 'Direct', 'Government'], required: true },

  quantity_kg:   { type: Number, required: true, min: 0 },
  price_per_kg:  { type: Number, required: true, min: 0 },
  total_revenue: { type: Number }, // auto-computed pre-save

  transport_notes: { type: String },
  invoice_ref:     { type: String },
  sale_date:       { type: Date, required: true, default: Date.now },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-compute total_revenue before save
saleSchema.pre('save', function () {
  this.total_revenue = this.quantity_kg * this.price_per_kg;
});

saleSchema.index({ organization_id: 1, sale_date: -1 });
saleSchema.index({ farm_id: 1 });
saleSchema.index({ crop_cycle_id: 1 });

module.exports = mongoose.model('Sale', saleSchema);

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  crop_cycle_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle' },
  farm_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  organization_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },

  category: {
    type: String,
    enum: ['Fertilizer', 'Labor', 'Transport', 'Equipment', 'Pesticide', 'Land_Rent', 'Other'],
    required: true
  },

  amount_idr:  { type: Number, required: true, min: 0 },
  description: { type: String },
  expense_date:{ type: Date, required: true, default: Date.now },

  um_responsible_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receipt_ref:       { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

expenseSchema.index({ organization_id: 1, expense_date: -1 });
expenseSchema.index({ farm_id: 1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);

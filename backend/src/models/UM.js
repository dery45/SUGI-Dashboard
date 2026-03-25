const mongoose = require('mongoose');

const umSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  um_id: { type: String, required: true, unique: true }, // Custom ID string
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  assigned_processes: [{
    type: String,
    enum: ['Land_Preparation', 'Planting', 'Maintenance', 'Harvesting', 'Distribution']
  }],
  assigned_farms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farm' }],
  start_date: { type: Date, required: true },
  end_date: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  performance_metrics: {
    overall_score: { type: Number, default: 0 },
    tasks_completed: { type: Number, default: 0 },
    efficiency_rating: { type: Number, default: 0 }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

umSchema.index({ organization_id: 1, status: 1 });
umSchema.index({ user_id: 1 });

module.exports = mongoose.model('UM', umSchema);

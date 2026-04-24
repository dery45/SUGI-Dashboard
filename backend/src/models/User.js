const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Should be hashed
  role: { 
    type: String, 
    enum: ['Farmer', 'Group_Admin', 'Company_Admin', 'Government', 'UM'], 
    default: 'Farmer' 
  },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null }, // For Companies/Cooperatives
  phone: { type: String },
  address: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Index for role based queries
userSchema.index({ role: 1, organization_id: 1 });

module.exports = mongoose.model('User', userSchema);

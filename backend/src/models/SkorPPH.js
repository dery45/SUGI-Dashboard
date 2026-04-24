const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tahun: { type: String, required: true }, pph_ketersediaan: { type: String, required: true }, keterangan: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SkorPPH', schema);

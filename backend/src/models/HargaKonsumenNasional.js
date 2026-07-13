const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  komoditas: { type: String, required: true }, tahun: { type: String, required: true }, bulan: { type: String, required: true }, harga: { type: Number, required: true }
}, { timestamps: true });

schema.index({ tahun: 1, bulan: 1, komoditas: 1 });
module.exports = mongoose.model('HargaKonsumenNasional', schema);

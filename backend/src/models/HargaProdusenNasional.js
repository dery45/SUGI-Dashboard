const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  komoditas: { type: String, required: true }, tahun: { type: String, required: true }, bulan: { type: String, required: true }, harga: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('HargaProdusenNasional', schema);

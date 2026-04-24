const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tahun: { type: String, required: true }, bulan: { type: String, required: true }, jumlah_donasi_kg: { type: Number, required: true }, penerima_manfaat_jiwa: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PenyaluranDonasi', schema);

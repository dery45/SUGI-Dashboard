const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tahun: { type: String, required: true }, bulan: { type: String, required: true }, provinsi: { type: String, required: true }, kode_provinsi: { type: String, required: true }, kab_kota: { type: String, required: true }, kode_kab_kota: { type: String, required: true }, pelaksana: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('GerakanPanganMurah', schema);

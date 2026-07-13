const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  kode_provinsi: { type: String, required: true }, nama_provinsi: { type: String, required: true }, komoditas: { type: String, required: true }, tahun: { type: String, required: true }, bulan: { type: String, required: true }, harga: { type: Number, required: true }
}, { timestamps: true });

schema.index({ tahun: 1, nama_provinsi: 1, komoditas: 1 });
schema.index({ harga: -1 });
module.exports = mongoose.model('HargaProdusenProvinsi', schema);

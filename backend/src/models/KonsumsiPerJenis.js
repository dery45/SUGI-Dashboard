const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  kelompok_bahan_pangan: { type: String, required: true }, komoditas: { type: String, required: true }, konsumsi_pangan: { type: String, required: true }, satuan: { type: String, required: true }, tahun: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('KonsumsiPerJenis', schema);

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tahun: { type: String, required: true }, bulan: { type: String, required: true }, jumlah_donasi_kg: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PanganTerselamatkan', schema);

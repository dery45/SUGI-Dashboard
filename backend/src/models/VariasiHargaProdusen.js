const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  kode_wilayah: { type: String, required: true }, provinsi: { type: String, required: true }, komoditas: { type: String, required: true }, tahun: { type: String, required: true }, bulan: { type: String, required: true }, koefisien_variasi: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('VariasiHargaProdusen', schema);

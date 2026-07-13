const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tahun: { type: String, required: true }, bulan: { type: String, required: true }, kode_wilayah: { type: String, required: true }, wilayah: { type: String, required: true }, cppd_ton: { type: Number, required: true }
}, { timestamps: true });

schema.index({ tahun: 1, wilayah: 1 });
schema.index({ cppd_ton: -1 });
module.exports = mongoose.model('CadanganPanganProvinsi', schema);

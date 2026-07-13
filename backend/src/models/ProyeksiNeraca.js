const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tahun: { type: String, required: true }, bulan: { type: String, required: true }, status: { type: String, required: true }, tingkat: { type: String, required: true }, komoditas: { type: String, required: true }, ketersediaan: { type: Number, required: true }, kebutuhan: { type: Number, required: true }, neraca: { type: Number, required: true }, satuan: { type: String, required: true }
}, { timestamps: true });

schema.index({ tahun: 1, tingkat: 1, komoditas: 1 });
schema.index({ neraca: -1 });
module.exports = mongoose.model('ProyeksiNeraca', schema);

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tahun: { type: String, required: true }, pou: { type: String, required: true }, jumlah_penduduk: { type: Number, required: true }, penduduk_undernourish: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('KetidakcukupanNasional', schema);

const mongoose = require('mongoose');

const foodInsecuritySchema = new mongoose.Schema({
  tahun: { type: Number, required: true },
  pou: { type: Number, required: true },
  jumlah_penduduk: { type: Number },
  penduduk_undernourish: { type: Number },
  provinsi: { type: String, default: 'Nasional' }
}, { timestamps: true });

module.exports = mongoose.model('FoodInsecurity', foodInsecuritySchema);

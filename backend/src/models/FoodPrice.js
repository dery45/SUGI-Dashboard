const mongoose = require('mongoose');

const foodPriceSchema = new mongoose.Schema({
  komoditas: { type: String, required: true },
  tahun: { type: Number, required: true },
  bulan: { type: String, required: true },
  harga: { type: Number, required: true },
  tingkat: { type: String, enum: ['Produsen', 'Konsumen'] },
  provinsi: { type: String, default: 'Nasional' }
}, { timestamps: true });

module.exports = mongoose.model('FoodPrice', foodPriceSchema);

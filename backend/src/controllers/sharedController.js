const getConsumerPrices = (req, res) => {
  // Dummy data representing Consumer Prices
  res.status(200).json([
    { komoditas: 'Beras Premium', tahun: 2021, bulan: 'Januari', harga: 12319 },
    { komoditas: 'Bawang Merah', tahun: 2021, bulan: 'Januari', harga: 30329 }
  ]);
};

module.exports = {
  getConsumerPrices
};

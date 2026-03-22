const getProducerPrices = (req, res) => {
  // Dummy data representing "Data 9: Rata-rata Harga Pangan Bulanan Tingkat Produsen Nasional"
  res.status(200).json([
    { komoditas: 'GKP Tingkat Petani (Rp/Kg)', tahun: 2019, bulan: 'Januari', harga: 4889 },
    { komoditas: 'Beras Premium Tk. Penggilingan', tahun: 2019, bulan: 'Januari', harga: 10729 }
  ]);
};

const getPriceVariation = (req, res) => {
  // Dummy data representing "Data 11: Koefisien Variasi Harga Pangan Tingkat Produsen"
  res.status(200).json([
    { provinsi: 'Aceh', komoditas: 'GKP Tingkat Petani', koefisien: '7.09%' },
    { provinsi: 'Bali', komoditas: 'GKP Tingkat Petani', koefisien: '7.15%' }
  ]);
};

module.exports = {
  getProducerPrices,
  getPriceVariation
};

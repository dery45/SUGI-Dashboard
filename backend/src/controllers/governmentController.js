const getPouData = (req, res) => {
  // Dummy data representing PoU Nasional
  res.status(200).json([
    { tahun: 2011, pou: 16.97, jumlah_penduduk: 241990736 },
    { tahun: 2012, pou: 13.83, jumlah_penduduk: 245425244 }
  ]);
};

const getConsumptionData = (req, res) => {
  res.status(200).json([
    { kelompok: 'Padi-padian', komoditas: 'Beras', konsumsi: 97.1, tahun: 2018 }
  ]);
};

const getDonationData = (req, res) => {
  res.status(200).json([
    { tahun: 2024, bulan: 'Januari', donasi_kg: 16712.64, penerima_jiwa: 33364 }
  ]);
};

const getBalanceProjection = (req, res) => {
  res.status(200).json([
    { tahun: 2026, bulan: 'Januari', komoditas: 'Beras', ketersediaan: 14335076, kebutuhan: 2630718 }
  ]);
};

module.exports = {
  getPouData,
  getConsumptionData,
  getDonationData,
  getBalanceProjection
};

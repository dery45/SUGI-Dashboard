export const importTemplates = {
  KetidakcukupanNasional: {
    modelName: 'KetidakcukupanNasional',
    columns: [
      { header: 'No', field: 'no', type: 'number', required: false, skipInDb: true },
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'PoU', field: 'pou', type: 'string', required: true },
      { header: 'Jumlah_Penduduk', field: 'jumlah_penduduk', type: 'number', required: true },
      { header: 'Penduduk_Undernourish', field: 'penduduk_undernourish', type: 'number', required: true }
    ]
  },
  KetidakcukupanProvinsi: {
    modelName: 'KetidakcukupanProvinsi',
    columns: [
      { header: 'No', field: 'no', type: 'number', required: false, skipInDb: true },
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Kode_Provinsi', field: 'kode_provinsi', type: 'string', required: true, isKey: true },
      { header: 'Provinsi', field: 'provinsi', type: 'string', required: true },
      { header: 'PoU', field: 'pou', type: 'string', required: true },
      { header: 'Jumlah_Penduduk', field: 'jumlah_penduduk', type: 'number', required: true },
      { header: 'Penduduk_Undernourish', field: 'penduduk_undernourish', type: 'number', required: true }
    ]
  },
  KonsumsiPerJenis: {
    modelName: 'KonsumsiPerJenis',
    columns: [
      { header: 'No', field: 'no', type: 'number', required: false, skipInDb: true },
      { header: 'Kelompok Bahan Pangan', field: 'kelompok_bahan_pangan', type: 'string', required: true, isKey: true },
      { header: 'Komoditas', field: 'komoditas', type: 'string', required: true, isKey: true },
      { header: 'konsumsi_pangan', field: 'konsumsi_pangan', type: 'string', required: true },
      { header: 'Satuan', field: 'satuan', type: 'string', required: true },
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true }
    ]
  },
  PenyaluranDonasi: {
    modelName: 'PenyaluranDonasi',
    columns: [
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Jumlah Donasi (kg)', field: 'jumlah_donasi_kg', type: 'number', required: true },
      { header: 'Penerima Manfaat (Jiwa)', field: 'penerima_manfaat_jiwa', type: 'number', required: true }
    ]
  },
  ProyeksiNeraca: {
    modelName: 'ProyeksiNeraca',
    columns: [
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Status', field: 'status', type: 'string', required: true },
      { header: 'Tingkat', field: 'tingkat', type: 'string', required: true },
      { header: 'Komoditas', field: 'komoditas', type: 'string', required: true, isKey: true },
      { header: 'Ketersediaan', field: 'ketersediaan', type: 'number', required: true },
      { header: 'Kebutuhan', field: 'kebutuhan', type: 'number', required: true },
      { header: 'Neraca', field: 'neraca', type: 'number', required: true },
      { header: 'Satuan', field: 'satuan', type: 'string', required: true }
    ]
  },
  GerakanPanganMurah: {
    modelName: 'GerakanPanganMurah',
    columns: [
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Provinsi', field: 'provinsi', type: 'string', required: true },
      { header: 'Kode_Provinsi', field: 'kode_provinsi', type: 'string', required: true, isKey: true },
      { header: 'Kab_Kota', field: 'kab_kota', type: 'string', required: true },
      { header: 'Kode_Kab_Kota', field: 'kode_kab_kota', type: 'string', required: true, isKey: true },
      { header: 'Jumlah_Pelaksanaan_Gerakan_Pangan_Murah', field: 'pelaksana', type: 'number', required: true }
    ]
  },
  HargaKonsumenProvinsi: {
    modelName: 'HargaKonsumenProvinsi',
    columns: [
      { header: 'Kode Provinsi', field: 'kode_provinsi', type: 'string', required: true, isKey: true },
      { header: 'Nama Provinsi', field: 'nama_provinsi', type: 'string', required: true },
      { header: 'Komoditas', field: 'komoditas', type: 'string', required: true, isKey: true },
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Harga', field: 'harga', type: 'number', required: true }
    ]
  },
  HargaKonsumenNasional: {
    modelName: 'HargaKonsumenNasional',
    columns: [
      { header: 'Komoditas', field: 'komoditas', type: 'string', required: true, isKey: true },
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Harga', field: 'harga', type: 'number', required: true }
    ]
  },
  HargaProdusenNasional: {
    modelName: 'HargaProdusenNasional',
    columns: [
      { header: 'Komoditas', field: 'komoditas', type: 'string', required: true, isKey: true },
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Harga', field: 'harga', type: 'number', required: true }
    ]
  },
  HargaProdusenProvinsi: {
    modelName: 'HargaProdusenProvinsi',
    columns: [
      { header: 'Kode Provinsi', field: 'kode_provinsi', type: 'string', required: true, isKey: true },
      { header: 'Nama Provinsi', field: 'nama_provinsi', type: 'string', required: true },
      { header: 'Komoditas', field: 'komoditas', type: 'string', required: true, isKey: true },
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Harga', field: 'harga', type: 'number', required: true }
    ]
  },
  VariasiHargaProdusen: {
    modelName: 'VariasiHargaProdusen',
    columns: [
      { header: 'Kode Wilayah', field: 'kode_wilayah', type: 'string', required: true, isKey: true },
      { header: 'Provinsi', field: 'provinsi', type: 'string', required: true },
      { header: 'Komoditas', field: 'komoditas', type: 'string', required: true, isKey: true },
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Koefisien Variasi', field: 'koefisien_variasi', type: 'number', required: true }
    ]
  },
  SkorPPH: {
    modelName: 'SkorPPH',
    columns: [
      { header: 'No', field: 'no', type: 'number', required: false, skipInDb: true },
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'PPH Ketersediaan', field: 'pph_ketersediaan', type: 'string', required: true },
      { header: 'Keterangan', field: 'keterangan', type: 'string', required: true }
    ]
  },
  PanganTerselamatkan: {
    modelName: 'PanganTerselamatkan',
    columns: [
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Jumlah Donasi (kg)', field: 'jumlah_donasi_kg', type: 'number', required: true }
    ]
  },
  CadanganPanganProvinsi: {
    modelName: 'CadanganPanganProvinsi',
    columns: [
      { header: 'Tahun', field: 'tahun', type: 'string', required: true, isKey: true },
      { header: 'Bulan', field: 'bulan', type: 'string', required: true, isKey: true },
      { header: 'Kode_Wilayah', field: 'kode_wilayah', type: 'string', required: true, isKey: true },
      { header: 'Wilayah', field: 'wilayah', type: 'string', required: true },
      { header: 'CPPD_Ton', field: 'cppd_ton', type: 'number', required: true }
    ]
  }
};

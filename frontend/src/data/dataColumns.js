export const columns1 = [
  { header: 'No', accessor: 'no' },
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'PoU', accessor: 'pou' },
  { header: 'Jumlah Penduduk', accessor: 'jumlah_penduduk', format: (v) => v.toLocaleString('id-ID') },
  { header: 'Penduduk Undernourish', accessor: 'penduduk_undernourish', format: (v) => v.toLocaleString('id-ID') },
];

export const columns2 = [
  { header: 'No', accessor: 'no' },
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Kode Provinsi', accessor: 'kode_provinsi' },
  { header: 'Provinsi', accessor: 'provinsi' },
  { header: 'PoU', accessor: 'pou' },
  { header: 'Jumlah Penduduk', accessor: 'jumlah_penduduk', format: (v) => v.toLocaleString('id-ID') },
  { header: 'Penduduk Undernourish', accessor: 'penduduk_undernourish', format: (v) => v.toLocaleString('id-ID') },
];

export const columns3 = [
  { header: 'No', accessor: 'no' },
  { header: 'Kelompok Bahan Pangan', accessor: 'kelompok_bahan_pangan' },
  { header: 'Komoditas', accessor: 'komoditas' },
  { header: 'Konsumsi Pangan', accessor: 'konsumsi_pangan' },
  { header: 'Satuan', accessor: 'satuan' },
  { header: 'Tahun', accessor: 'tahun' },
];

export const columns4 = [
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Jumlah Donasi (kg)', accessor: 'jumlah_donasi_kg', format: (v) => v.toLocaleString('id-ID') },
  { header: 'Penerima Manfaat (Jiwa)', accessor: 'penerima_manfaat_jiwa', format: (v) => v.toLocaleString('id-ID') },
];

export const columns5 = [
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Status', accessor: 'status' },
  { header: 'Tingkat', accessor: 'tingkat' },
  { header: 'Komoditas', accessor: 'komoditas' },
  { header: 'Ketersediaan', accessor: 'ketersediaan', format: (v) => v.toLocaleString('id-ID') },
  { header: 'Kebutuhan', accessor: 'kebutuhan', format: (v) => v.toLocaleString('id-ID') },
  { header: 'Neraca', accessor: 'neraca', format: (v) => v.toLocaleString('id-ID') },
  { header: 'Satuan', accessor: 'satuan' },
];

export const columns6 = [
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Provinsi', accessor: 'provinsi' },
  { header: 'Kode Provinsi', accessor: 'kode_provinsi' },
  { header: 'Kab/Kota', accessor: 'kab_kota' },
  { header: 'Kode Kab/Kota', accessor: 'kode_kab_kota' },
  { header: 'Jumlah Pelaksanaan Gerakan Pangan Murah', accessor: 'pelaksana' },
];

export const columns7 = [
  { header: 'Kode Provinsi', accessor: 'kode_provinsi' },
  { header: 'Nama Provinsi', accessor: 'nama_provinsi' },
  { header: 'Komoditas', accessor: 'komoditas' },
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Harga', accessor: 'harga' },
];

export const columns8 = [
  { header: 'Komoditas', accessor: 'komoditas' },
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Harga', accessor: 'harga' },
];

export const columns9 = [
  { header: 'Komoditas', accessor: 'komoditas' },
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Harga', accessor: 'harga' },
];

export const columns10 = [
  { header: 'Kode Provinsi', accessor: 'kode_provinsi' },
  { header: 'Nama Provinsi', accessor: 'nama_provinsi' },
  { header: 'Komoditas', accessor: 'komoditas' },
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Harga', accessor: 'harga' },
];

export const columns11 = [
  { header: 'Kode Wilayah', accessor: 'kode_wilayah' },
  { header: 'Provinsi', accessor: 'provinsi' },
  { header: 'Komoditas', accessor: 'komoditas' },
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Koefisien Variasi', accessor: 'koefisien_variasi' },
];

export const columns12 = [
  { header: 'No', accessor: 'no' },
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'PPH Ketersediaan', accessor: 'pph_ketersediaan' },
  { header: 'Keterangan', accessor: 'keterangan' },
];

export const columns13 = [
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Jumlah Donasi (kg)', accessor: 'jumlah_donasi_kg', format: (v) => v.toLocaleString('id-ID') },
];

export const columns14 = [
  { header: 'Tahun', accessor: 'tahun' },
  { header: 'Bulan', accessor: 'bulan' },
  { header: 'Kode Wilayah', accessor: 'kode_wilayah' },
  { header: 'Wilayah', accessor: 'wilayah' },
  { header: 'CPPD Ton', accessor: 'cppd_ton' },
];

export const foodSecurityData = {
  // 1. PoU Nasional
  pouNasional: [
    { tahun: 2011, pou: 16.97, jumlah_penduduk: 241990736, undernourish: 41065828 },
    { tahun: 2012, pou: 13.83, jumlah_penduduk: 245425244, undernourish: 33945256 },
    { tahun: 2013, pou: 12.36, jumlah_penduduk: 248818215, undernourish: 30765153 },
    { tahun: 2014, pou: 12.89, jumlah_penduduk: 252164786, undernourish: 32504041 },
    { tahun: 2015, pou: 10.73, jumlah_penduduk: 255461686, undernourish: 27401360 },
    { tahun: 2016, pou: 8.93, jumlah_penduduk: 258704986, undernourish: 23091634 },
    { tahun: 2017, pou: 8.23, jumlah_penduduk: 261890872, undernourish: 21553619 },
  ],

  // 2. PoU Provinsi 2018
  pouProvinsi: [
    { kode: 11, provinsi: "ACEH", pou: 8.66, penduduk: 5243400, undernourish: 454185 },
    { kode: 12, provinsi: "SUMATERA UTARA", pou: 5.73, penduduk: 14476000, undernourish: 829915 },
    { kode: 13, provinsi: "SUMATERA BARAT", pou: 5.45, penduduk: 5411800, undernourish: 294684 },
    { kode: 14, provinsi: "RIAU", pou: 9.63, penduduk: 6717600, undernourish: 646660 },
    { kode: 15, provinsi: "JAMBI", pou: 10.04, penduduk: 3527100, undernourish: 354285 },
    { kode: 16, provinsi: "SUMATERA SELATAN", pou: 10.84, penduduk: 8391500, undernourish: 909295 },
    { kode: 17, provinsi: "BENGKULU", pou: 8.7, penduduk: 1948600, undernourish: 169556 },
    { kode: 18, provinsi: "LAMPUNG", pou: 12.1, penduduk: 8377700, undernourish: 1013397 },
    { kode: 19, provinsi: "KEPULAUAN BANGKA BELITUNG", pou: 10.06, penduduk: 1432100, undernourish: 144060 },
    { kode: 21, provinsi: "KEPULAUAN RIAU", pou: 4.39, penduduk: 2174800, undernourish: 95430 },
    { kode: 31, provinsi: "DKI JAKARTA", pou: 1.46, penduduk: 10428000, undernourish: 152656 },
  ],

  // 3. Konsumsi Nasional 2018
  konsumsiPangan: [
    { kelompok: "Padi-padian", komoditas: "Beras", nilai: 97.1 },
    { kelompok: "Padi-padian", komoditas: "Jagung", nilai: 1.6 },
    { kelompok: "Padi-padian", komoditas: "Terigu", nilai: 18.2 },
    { kelompok: "Umbi-umbian", komoditas: "Umbi-umbian", nilai: 16.4 },
    { kelompok: "Umbi-umbian", komoditas: "Singkong", nilai: 9.5 },
    { kelompok: "Umbi-umbian", komoditas: "Ubi Jalar", nilai: 3.4 },
    { kelompok: "Umbi-umbian", komoditas: "Kentang", nilai: 2.4 },
  ],

  // 4. Donasi Pangan 2024
  donasiPangan: [
    { bulan: "Januari", donasi_kg: 16712.64, penerima: 33364 },
    { bulan: "Februari", donasi_kg: 27956.83, penerima: 55034 },
    { bulan: "Maret", donasi_kg: 224858.71, penerima: 455328 },
    { bulan: "April", donasi_kg: 1285.4, penerima: 2193 },
    { bulan: "Mei", donasi_kg: 38649.51, penerima: 77292 },
  ],

  // 5. Proyeksi Neraca Pangan 2026
  proyeksiNeraca: [
    { bulan: "Januari", ketersediaan: 14335076, kebutuhan: 2630718, neraca: 11704359 },
    { bulan: "Februari", ketersediaan: 14614708, kebutuhan: 2381224, neraca: 12233484 },
    { bulan: "Maret", ketersediaan: 17584401, kebutuhan: 2749524, neraca: 14834876 },
    { bulan: "April", ketersediaan: 19789499, kebutuhan: 2545856, neraca: 17243643 },
    { bulan: "Mei", ketersediaan: 20023657, kebutuhan: 2632839, neraca: 17390817 },
    { bulan: "Juni", ketersediaan: 19581292, kebutuhan: 2545856, neraca: 17035436 },
    { bulan: "Juli", ketersediaan: 19654303, kebutuhan: 2630718, neraca: 17023585 },
    { bulan: "Agustus", ketersediaan: 20091891, kebutuhan: 2630718, neraca: 17461173 },
  ],

  // 6. Gerakan Pangan Murah
  gerakanPanganMurah: [
    { provinsi: "Aceh", kab_kota: "Kab. Aceh Barat", jumlah: 2 },
    { provinsi: "Bali", kab_kota: "Kab. Buleleng", jumlah: 4 },
    { provinsi: "Bengkulu", kab_kota: "Kota Bengkulu", jumlah: 14 },
    { provinsi: "DI Yogyakarta", kab_kota: "Kab. Sleman", jumlah: 1 },
    { provinsi: "DI Yogyakarta", kab_kota: "Kota Yogyakarta", jumlah: 2 },
    { provinsi: "Jawa Barat", kab_kota: "Kab. Bandung", jumlah: 3 },
  ],

  // 7. Harga Konsumen Provinsi
  hargaKonsumenProv: [
    { provinsi: "Aceh", komoditas: "Beras Premium", harga: 12072 },
    { provinsi: "Sumatera Utara", komoditas: "Beras Premium", harga: 12523 },
    { provinsi: "Sumatera Barat", komoditas: "Beras Premium", harga: 13096 },
    { provinsi: "Riau", komoditas: "Beras Premium", harga: 14605 },
    { provinsi: "Jambi", komoditas: "Beras Premium", harga: 12323 },
    { provinsi: "Sumatera Selatan", komoditas: "Beras Premium", harga: 11675 },
    { provinsi: "Bengkulu", komoditas: "Beras Premium", harga: 11752 },
    { provinsi: "Lampung", komoditas: "Beras Premium", harga: 11428 },
  ],

  // 8. Harga Konsumen Nasional
  hargaKonsumenNasional: [
    { komoditas: "Beras Premium", harga: 12319 },
    { komoditas: "Beras Medium", harga: 10865 },
    { komoditas: "Kedelai Biji Kering", harga: 10607 },
    { komoditas: "Bawang Merah", harga: 30329 },
    { komoditas: "Bawang Putih (Bonggol)", harga: 26308 },
    { komoditas: "Cabai Merah Keriting", harga: 47968 },
  ],

  // 9. Harga Produsen Nasional
  hargaProdusenNasional: [
    { komoditas: "GKP Tingkat Petani", harga: 4889 },
    { komoditas: "GKP Tingkat Penggilingan", harga: 5170 },
    { komoditas: "GKG Tingkat Penggilingan", harga: 5756 },
    { komoditas: "Beras Medium Tk. Penggilingan", harga: 9497 },
    { komoditas: "Beras Premium Tk. Penggilingan", harga: 10729 },
  ],

  // 10. Harga Produsen Provinsi
  hargaProdusenProv: [
    { provinsi: "Aceh", komoditas: "GKP Tk. Petani", harga: 5494 },
    { provinsi: "Sumatera Utara", komoditas: "GKP Tk. Petani", harga: 5465 },
    { provinsi: "Sumatera Barat", komoditas: "GKP Tk. Petani", harga: 6760 },
    { provinsi: "Riau", komoditas: "GKP Tk. Petani", harga: null },
    { provinsi: "Jambi", komoditas: "GKP Tk. Petani", harga: 5224 },
    { provinsi: "Sumatera Selatan", komoditas: "GKP Tk. Petani", harga: 5230 },
    { provinsi: "Bengkulu", komoditas: "GKP Tk. Petani", harga: null },
  ],

  // 11. Koefisien Variasi
  koefisienVariasi: [
    { provinsi: "Aceh", cv: 7.09 },
    { provinsi: "Bali", cv: 7.15 },
    { provinsi: "Banten", cv: 3.88 },
    { provinsi: "Bengkulu", cv: null },
    { provinsi: "DI Yogyakarta", cv: 3.20 },
  ],

  // 12. Skor PPH
  skorPPH: [
    { tahun: 2018, skor: 90.81 },
    { tahun: 2019, skor: 93.40 },
    { tahun: 2020, skor: 95.77 },
    { tahun: 2021, skor: 96.78 },
    { tahun: 2022, skor: 96.00 },
    { tahun: 2023, skor: 96.05 },
    { tahun: 2024, skor: 96.54 },
    { tahun: 2025, skor: 97.55 },
  ],

  // 13. Pangan Terselamatkan
  panganTerselamatkan: [
    { bulan: "Januari", kg: 19327.84 },
    { bulan: "Februari", kg: 27891.03 },
    { bulan: "Maret", kg: 225044.71 },
    { bulan: "April", kg: 1059.40 },
    { bulan: "Mei", kg: 38649.71 },
    { bulan: "Juni", kg: 12771.85 },
  ],

  // 14. CPPD
  cppdProvinsi: [
    { wilayah: "Aceh", ton: 191.10 },
    { wilayah: "Sumatera Utara", ton: 57.27 },
    { wilayah: "Sumatera Barat", ton: 119.34 },
    { wilayah: "Riau", ton: 85.10 },
    { wilayah: "Jambi", ton: 66.14 },
    { wilayah: "Sumatera Selatan", ton: 0.00 },
    { wilayah: "Bengkulu", ton: 84.15 }
  ]
};

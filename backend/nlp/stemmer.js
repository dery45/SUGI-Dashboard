const fs = require('fs');
const path = require('path');

const PREFIXES = ['meng', 'meny', 'mem', 'men', 'me', 'per', 'penge', 'peng', 'peny', 'pem', 'pen', 'pe', 'ber', 'be', 'ter', 'di', 'ke', 'se'];
const SUFFIXES = ['kan', 'an', 'i', 'nya'];

class IndonesianStemmer {
  constructor() {
    this.baseWords = new Set();
    this._loadBaseWords();
  }

  _loadBaseWords() {
    const common = [
      'ada', 'akan', 'aku', 'alat', 'ambil', 'anak', 'anggur', 'api', 'arah', 'atas',
      'baca', 'badan', 'bagi', 'baik', 'bakar', 'banyak', 'baru', 'batas', 'bawah',
      'benar', 'beras', 'berat', 'besar', 'biaya', 'bibit', 'biji', 'bilang', 'bisa',
      'buah', 'buat', 'buka', 'buku', 'bulan', 'buruh', 'cabai', 'cara', 'cocok',
      'cepat', 'cuaca', 'dapat', 'daging', 'data', 'dengan', 'duduk', 'dulu', 'empat',
      'hasil', 'harga', 'hari', 'hama', 'hidup', 'hujan', 'ikan', 'ingin', 'inti',
      'induk', 'industri', 'jalan', 'jam', 'jagung', 'jenis', 'jumlah', 'kali',
      'kantor', 'karet', 'kasar', 'kebutuhan', 'kedelai', 'kecil', 'kering', 'kerja',
      'kertas', 'kotor', 'kualitas', 'lahan', 'lain', 'lama', 'lebar', 'lihat',
      'lokal', 'lulus', 'luar', 'makan', 'malam', 'masa', 'masalah', 'masuk',
      'media', 'meja', 'minat', 'minyak', 'modal', 'mulai', 'murah', 'naik',
      'nama', 'negara', 'nilai', 'obat', 'olah', 'orang', 'pabrik', 'padi',
      'pagar', 'paham', 'panas', 'pangan', 'panjang', 'panen', 'pasar', 'pasok',
      'pekarangan', 'peluang', 'pembelian', 'pemerintah', 'pendapatan', 'pengairan',
      'pengelolaan', 'pengembangan', 'penjualan', 'peningkatan', 'peralatan',
      'peraturan', 'perawatan', 'percaya', 'perkebunan', 'perlindungan', 'permintaan',
      'produksi', 'produk', 'pupuk', 'racun', 'rata', 'rendah', 'rumah', 'sawah',
      'sebab', 'sedang', 'selalu', 'semaian', 'sementara', 'sendiri', 'sentral',
      'seperti', 'serta', 'siang', 'sistem', 'sukses', 'suling', 'surat', 'surplus',
      'susut', 'tablet', 'tahun', 'taman', 'tanam', 'tanah', 'target', 'tawar',
      'tebu', 'teknologi', 'telur', 'tempat', 'tengah', 'tentang', 'tepat', 'terang',
      'terima', 'ternak', 'tersier', 'terus', 'tetap', 'tidur', 'tiga', 'timur',
      'tomat', 'tumbuh', 'tunggu', 'turun', 'ubah', 'uang', 'udara', 'ukur',
      'umur', 'undang', 'untung', 'usaha', 'variasi', 'waktu', 'wilayah',
      'ada', 'air', 'akar', 'akhir', 'alih', 'ambil', 'anggota', 'antara',
      'awal', 'bagian', 'bahasa', 'bahan', 'bantu', 'bentuk', 'beri', 'berat',
      'bijak', 'bila', 'bina', 'bisa', 'budi', 'bumi', 'daerah', 'dalam',
      'dapat', 'dasar', 'data', 'daun', 'defisit', 'desa', 'dukung', 'edar',
      'efek', 'ekspor', 'faktor', 'fokus', 'fungsi', 'gabah', 'gagal', 'ganti',
      'garam', 'garis', 'gerak', 'gizi', 'gudang', 'gula', 'guna', 'habis',
      'hama', 'handal', 'hasil', 'hati', 'hayati', 'henti', 'hormat', 'hutan',
      'ibukota', 'iklim', 'impor', 'informasi', 'inisiatif', 'inovas', 'inta',
      'investasi', 'izin', 'jaga', 'jasmani', 'jawab', 'jelas', 'jenis',
      'jual', 'juta', 'kabupaten', 'kadar', 'kagum', 'kait', 'kaku', 'kalah',
      'kalau', 'kamus', 'karakter', 'karbon', 'karya', 'kategori', 'kawasan',
      'kaya', 'kendali', 'kendala', 'kepala', 'kering', 'kertas', 'khas',
      'kini', 'kinerja', 'koleksi', 'komoditas', 'kompetensi', 'komunitas',
      'kondisi', 'konsumen', 'konsumsi', 'kontribusi', 'koordinasi',
      'kota', 'kritis', 'kuat', 'kultur', 'kurang', 'kuasa', 'label',
      'ladang', 'lain', 'laju', 'laku', 'laman', 'lambat', 'lampau',
      'lancar', 'langka', 'langsung', 'lanjut', 'lapang', 'laporan',
      'larut', 'latih', 'lawan', 'layak', 'layan', 'lebah', 'lebih',
      'leleh', 'lemah', 'lembaga', 'lepas', 'letak', 'limbah', 'lima',
      'lintas', 'liat', 'logam', 'loteng', 'luas', 'luhur', 'lumpuh',
      'lunas', 'mahal', 'maju', 'makan', 'mampu', 'manajemen', 'manfaat',
      'mapan', 'maret', 'masyarakat', 'mata', 'media', 'melar', 'memar',
      'merah', 'mesin', 'milik', 'mobil', 'moga', 'mudah', 'mukim',
      'mulus', 'murni', 'musim', 'musnah', 'nafas', 'nasional', 'natur',
      'navigasi', 'nelayan', 'netral', 'nikmat', 'nilai', 'niscaya',
      'nomor', 'norma', 'nuklir', 'nutrisi', 'nyaman', 'nyata', 'oleh',
      'omset', 'ongkos', 'operasi', 'opini', 'optimal', 'orbit', 'organik',
      'otomatis', 'otoritas', 'padat', 'pahit', 'pakar', 'paling', 'palu',
      'pandu', 'pangsa', 'panili', 'para', 'paruh', 'pasang', 'pasif',
      'patok', 'patuh', 'patut', 'pawai', 'peduli', 'pegunungan', 'pekat',
      'pekerjaan', 'pelaksanaan', 'pelatihan', 'pemasaran', 'pembibitan',
      'pemupukan', 'penanaman', 'pencapaian', 'pendekatan', 'pendidikan',
      'penelitian', 'penggunaan', 'penyakit', 'penyimpanan', 'penyiangan',
      'perbaikan', 'perdagangan', 'perencanaan', 'perikanan', 'permodalan',
      'pertanian', 'pertumbuhan', 'perusahaan', 'pestisida', 'petani',
      'peternak', 'pilar', 'pilih', 'pipa', 'piring', 'piutang', 'polusi',
      'pulih', 'punya', 'pusat', 'putar', 'putih', 'putus',
    ];
    common.forEach(w => this.baseWords.add(w));
  }

  stem(word) {
    word = word.toLowerCase().trim();
    if (!word || word.length < 2) return word;
    if (this.baseWords.has(word)) return word;

    let stemmed = word;

    stemmed = this._removeSuffix(stemmed);
    stemmed = this._removePrefix(stemmed);

    if (!this.baseWords.has(stemmed) && stemmed !== word) {
      if (this.baseWords.has(stemmed)) return stemmed;
    }

    return stemmed;
  }

  _removeSuffix(word) {
    for (const suffix of SUFFIXES) {
      if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
        const candidate = word.slice(0, -suffix.length);
        if (this.baseWords.has(candidate)) return candidate;
      }
    }
    return word;
  }

  _removePrefix(word) {
    for (const prefix of PREFIXES) {
      if (word.startsWith(prefix) && word.length - prefix.length >= 2) {
        const candidate = word.slice(prefix.length);
        if (this.baseWords.has(candidate)) return candidate;
        const alt = this._fixPrefix(candidate, prefix);
        if (alt && this.baseWords.has(alt)) return alt;
      }
    }
    return word;
  }

  _fixPrefix(word, prefix) {
    if (prefix === 'men' || prefix === 'meng' || prefix === 'meny' || prefix === 'mem') {
      if (word.startsWith('s')) return 's' + word;
      if (word.startsWith('k')) return 'k' + word;
      if (word.startsWith('p')) return 'p' + word;
      if (word.startsWith('t')) return 't' + word;
    }
    if (prefix === 'peng' || prefix === 'peny' || prefix === 'pem' || prefix === 'pen') {
      if (word.startsWith('s')) return 's' + word;
      if (word.startsWith('k')) return 'k' + word;
    }
    return null;
  }
}

module.exports = new IndonesianStemmer();

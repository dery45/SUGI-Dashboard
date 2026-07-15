const INTENT_KEYWORDS = {
  Informasi: [
    'apa', 'siapa', 'kapan', 'dimana', 'mengapa', 'bagaimana', 'berapa', 'jelaskan',
    'terangkan', 'definisi', 'pengertian', 'informasi', 'info', 'tahu', 'ketahui',
    'makna', 'maksud', 'arti', 'contoh', 'sebutkan', 'sebut', 'ceritakan',
  ],
  Rekomendasi: [
    'rekomendasi', 'saran', 'sarankan', 'menyarankan', 'anjurkan', 'anjuran',
    'sebaiknya', 'seharusnya', 'ide', 'usul', 'usulan', 'masukan', 'masukkan',
    'solusi', 'jalan keluar', 'alternatif', 'pilihan', 'terbaik', 'bagus',
  ],
  Permasalahan: [
    'masalah', 'kendala', 'hambatan', 'kesulitan', 'sulit', 'susah', 'gagal',
    'kegagalan', 'error', 'bug', 'rusak', 'kerusakan', 'mati', 'bermasalah',
    'terkendala', 'terhambat', 'macet', 'berhenti', 'stop', 'tidak bisa',
    'tidak dapat', 'tidak mau', 'kenapa', 'kenapa', 'penyebab',
  ],
  Keluhan: [
    'keluhan', 'mengeluh', 'komplain', 'protes', 'kecewa', 'tidak puas',
    'kurang baik', 'buruk', 'jelek', 'parah', 'memprihatinkan', 'terlambat',
    'molor', 'tidak sesuai', 'mengecewakan', 'sebal', 'kesal', 'jengkel',
  ],
  Cuaca: [
    'cuaca', 'suhu', 'temperatur', 'kelembaban', 'hujan', 'kemarau', 'musim',
    'iklim', 'angin', 'curah hujan', 'panas', 'dingin', 'berawan', 'cerah',
    'badai', 'pancaroba', 'prediksi cuaca', 'ramalan cuaca', 'prakiraan',
  ],
  Budidaya: [
    'budidaya', 'menanam', 'tanam', 'cocok tanam', 'bercocok tanam', 'pembibitan',
    'bibit', 'benih', 'semai', 'persemaian', 'pemupukan', 'pupuk', 'pemupuk',
    'pengairan', 'irigasi', 'penyiraman', 'perawatan', 'merawat', 'pemeliharaan',
    'pemangkasan', 'penjarangan', 'pengendalian', 'pestisida', 'insektisida',
    'penyemprotan', 'pengolahan tanah', 'olah tanah', 'pembajakan',
    'penggemburan', 'bedeng', 'guludan', 'polibag', 'polybag', 'pot',
    'media tanam', 'tanah', 'kompos', 'bokashi', 'mulsa',
  ],
  Panen: [
    'panen', 'memanen', 'pemetikan', 'pemanenan', 'pasca panen', 'pascapanen',
    'hasil panen', 'produksi', 'produktivitas', 'hasil', 'produk', 'memproduksi',
    'menghasilkan', 'tonase', 'kuantitas', 'kualitas panen', 'sortasi',
    'grading', 'pengemasan', 'packaging', 'penyimpanan', 'storage', 'pengeringan',
    'penggilingan', 'perontokan', 'pembersihan', 'pencucian',
  ],
  Penyakit: [
    'penyakit', 'hama', 'patogen', 'virus', 'bakteri', 'jamur', 'nematoda',
    'infeksi', 'serangan', 'gejala', 'pencegahan', 'pengobatan', 'obat',
    'insektisida', 'fungisida', 'bakterisida', 'wereng', 'ulat', 'tikus',
    'kutu', 'tungro', 'blas', 'hawar', 'karat', 'busuk', 'layu', 'bercak',
    'antraknosa', 'embun tepung', 'moler', 'kresek',
  ],
  Harga: [
    'harga', 'biaya', 'ongkos', 'tarif', 'nilai', 'uang', 'rp', 'rupiah',
    'murah', 'mahal', 'naik', 'turun', 'stabil', 'fluktuasi', 'pasar',
    'permintaan', 'penawaran', 'jual', 'beli', 'transaksi', 'omset',
    'pendapatan', 'keuntungan', 'untung', 'rugi', 'modal', 'investasi',
    'ekonomi', 'bisnis', 'dagang', 'usaha',
  ],
  Pasar: [
    'pasar', 'pemasaran', 'distribusi', 'supply chain', 'rantai pasok', 'tengkulak',
    'pengepul', 'pedagang', 'pengecer', 'grosir', 'agen', 'ekspor', 'impor',
    'perdagangan', 'komoditas', 'permintaan pasar', 'tren pasar', 'analisa pasar',
    'riset pasar', 'segmentasi', 'target pasar', 'konsumen', 'pelanggan',
    'customer', 'pangsa pasar', 'market share', 'promosi', 'iklan',
  ],
  Teknologi: [
    'teknologi', 'digital', 'aplikasi', 'software', 'hardware', 'internet',
    'iot', 'sensor', 'drone', 'otomatis', 'robot', 'smart farming', 'precision agri',
    'hidroponik', 'aquaponik', 'aeroponik', 'greenhouse', 'screenhouse',
    'irigasi tetes', 'drip irrigation', 'sprinkler', 'big data', 'AI',
    'artificial intelligence', 'machine learning', 'data mining',
  ],
  Lainnya: [],
};

class IntentClassifier {
  classify(text) {
    if (!text || typeof text !== 'string') return 'Lainnya';
    const lower = text.toLowerCase();
    const scores = {};

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (intent === 'Lainnya') continue;
      scores[intent] = 0;
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw.replace(/[-\s]/g, '[-\\s]')}\\b`, 'i');
        if (regex.test(lower)) {
          scores[intent] += 1;
        }
      }
    }

    let best = 'Lainnya';
    let bestScore = 0;
    for (const [intent, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }

    return best;
  }

  classifyWithConfidence(text) {
    if (!text || typeof text !== 'string') return { intent: 'Lainnya', confidence: 0 };
    const lower = text.toLowerCase();
    const scores = {};
    let totalScore = 0;

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (intent === 'Lainnya') continue;
      scores[intent] = 0;
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw.replace(/[-\s]/g, '[-\\s]')}\\b`, 'i');
        if (regex.test(lower)) scores[intent] += 1;
      }
      totalScore += scores[intent];
    }

    let best = 'Lainnya';
    let bestScore = 0;
    for (const [intent, score] of Object.entries(scores)) {
      if (score > bestScore) { bestScore = score; best = intent; }
    }

    return {
      intent: best,
      confidence: totalScore > 0 ? bestScore / totalScore : 0,
      scores,
    };
  }
}

module.exports = new IntentClassifier();

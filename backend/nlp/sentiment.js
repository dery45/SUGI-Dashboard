const POSITIVE_WORDS = [
  'baik', 'bagus', 'hebat', 'luar biasa', 'istimewa', 'unggul', 'prima', 'berkualitas',
  'berhasil', 'sukses', 'berkembang', 'meningkat', 'memuaskan', 'untung', 'menguntungkan',
  'produktif', 'efisien', 'mudah', 'praktis', 'cepat', 'lancar', 'laku', 'laris',
  'cerah', 'sehat', 'subur', 'makmur', 'sejahtera', 'berkah', 'nikmat', 'lezat',
  'enak', 'empuk', 'renyah', 'manis', 'segar', 'bersih', 'steril', 'aman',
  'nyaman', 'indah', 'asri', 'lestari', 'optimal', 'tepat', 'akurat', 'presisi',
  'inovatif', 'modern', 'maju', 'canggih', 'cerdas', 'pintar', 'ahli', 'profesional',
  'kompeten', 'andal', 'tangguh', 'kuat', 'kokoh', 'stabil', 'konsisten',
  'kompak', 'bersatu', 'gotong royong', 'solid', 'transparan', 'jujur', 'adil',
  'merata', 'berdaya', 'mandiri', 'berdikari', 'percaya diri', 'optimis',
  'senang', 'gembira', 'bangga', 'syukur', 'terima kasih', 'berterima kasih',
  'bermanfaat', 'berguna', 'efektif', 'efisien', 'tepat guna', 'berdampak',
  'solutif', 'konstruktif', 'positif', 'progresif', 'dinamis',
  'layak', 'pantas', 'wajar', 'normal', 'standar', 'terjangkau', 'murah',
  'gratis', 'subsidi', 'bantuan', 'dukungan', 'apresiasi', 'penghargaan',
  'rekomendasi', 'saran', 'masukan', 'perbaiki', 'tingkatkan', 'semangat',
  'selamat', 'sukses', 'maju', 'jaya', 'berkat', 'anugerah', 'rahmat',
  'terbaik', 'terdepan', 'terunggul', 'terkenal', 'populer', 'favorit',
  'disukai', 'diminati', 'dicari', 'dibutuhkan', 'diandalkan',
];

const NEGATIVE_WORDS = [
  'buruk', 'jelek', 'payah', 'parah', 'menyedihkan', 'memprihatinkan', 'kritis',
  'gagal', 'kegagalan', 'turun', 'menurun', 'penurunan', 'merosot', 'anjlok',
  'ambruk', 'collapse', 'hancur', 'rusak', 'kerusakan', 'bencana', 'musibah',
  'kerugian', 'rugi', 'defisit', 'minus', 'negatif', 'merugikan', 'percuma',
  'sia-sia', 'mubazir', 'boros', 'pemborosan', 'salah', 'keliru', 'error',
  'bug', 'cacat', 'kekurangan', 'kelemahan', 'kendala', 'hambatan', 'masalah',
  'kesulitan', 'sulit', 'susah', 'payah', 'berat', 'sengsara', 'derita',
  'penderitaan', 'kelaparan', 'kemiskinan', 'keterbelakangan', 'terbelakang',
  'sakit', 'penyakit', 'wabah', 'epidemi', 'endemi', 'pandemi', 'demam',
  'kematian', 'mati', 'bangkai', 'busuk', 'kadaluarsa', 'kedaluwarsa',
  'racun', 'beracun', 'toksik', 'limbah', 'polusi', 'pencemaran', 'tercemar',
  'kotor', 'jorok', 'kumuh', 'pengap', 'sesak', 'panas', 'gerah',
  'banjir', 'longsor', 'gempa', 'tsunami', 'kekeringan', 'kebakaran',
  'konflik', 'pertengkaran', 'perang', 'sengketa', 'kriminal', 'kejahatan',
  'korupsi', 'nepotisme', 'kolusi', 'penipuan', 'manipulasi', 'pemalsuan',
  'marah', 'kesal', 'jengkel', 'sebal', 'benci', 'dendam', 'iri', 'dengki',
  'kecewa', 'frustasi', 'frustrasi', 'stress', 'stres', 'cemas', 'cemas',
  'takut', 'khawatir', 'kegalauan', 'galau', 'resah', 'gelisah',
  'sedih', 'murung', 'depresi', 'tertekan', 'berat hati', 'malas', 'ogah',
  'bosan', 'jenuh', 'lesu', 'lemah', 'loyo', 'lesu', 'lunglai',
  'ancaman', 'mengancam', 'membahayakan', 'berbahaya', 'risiko', 'resiko',
  'larangan', 'dilarang', 'terlarang', 'pantangan', 'tabu', 'awas',
  'waspada', 'bahaya', 'darurat', 'genting', 'kritis', 'rawan', 'rentan',
  'tidak aman', 'tidak layak', 'tidak sehat', 'tidak subur', 'tidak cocok',
  'korban', 'terdampak', 'terkena', 'tercemar', 'terkontaminasi',
];

const EMOTION_WORDS = {
  Joy: ['senang', 'gembira', 'riang', 'bahagia', 'bangga', 'puas', 'syukur',
    'terima kasih', 'bersyukur', 'nikmat', 'indah', 'ceria', 'ceria',
    'tersenyum', 'tertawa', 'girang', 'suka', 'cinta', 'sayang', 'kagum',
    'takjub', 'terpesona', 'hebat', 'fantastis', 'sempurna', 'luar biasa'],
  Trust: ['percaya', 'yakin', 'optimis', 'berharap', 'aman', 'nyaman',
    'amanah', 'jujur', 'transparan', 'andal', 'terpercaya', 'setia',
    'taat', 'patuh', 'loyal', 'dedikasi', 'komitmen', 'bertanggung jawab',
    'konsisten', 'stabil', 'terjamin', 'pasti', 'pasti'],
  Fear: ['takut', 'khawatir', 'cemas', 'gelisah', 'resah', 'parno', 'panik',
    'ngeri', 'horor', 'mencekam', 'mengerikan', 'menakutkan', 'mengkhawatirkan',
    'waswas', 'ragu', 'bimbang', 'terancam', 'terintimidasi', 'gentar'],
  Anger: ['marah', 'kesal', 'jengkel', 'sebal', 'geram', 'berang', 'naik pitam',
    'emosi', 'memarahi', 'mengomeli', 'protes', 'demo', 'mogok', 'membenci',
    'benci', 'dendam', 'sakit hati', 'tersinggung', 'ngamuk', 'mengamuk',
    'marah besar', 'kasar', 'kasar', 'sumpah serapah'],
  Sadness: ['sedih', 'murung', 'pilu', 'haru', 'iba', 'prihatin', 'memprihatinkan',
    'memilukan', 'menyedihkan', 'berduka', 'duka', 'kehilangan', 'sunyi',
    'sepi', 'sendiri', 'kesepian', 'patah hati', 'putus asa', 'menangis',
    'tangis', 'air mata', 'terisak', 'luka', 'terluka', 'nestapa'],
  Surprise: ['kaget', 'terkejut', 'heran', 'aneh', 'ajaib', 'mukjizat',
    'tiba-tiba', 'mendadak', 'tak terduga', 'tak disangka', 'wah',
    'astaga', 'astagfirullah', 'masya allah', 'subhanallah', 'wow',
    'tidak menyangka', 'sangat terkejut', 'speechless', 'melongo'],
  Anticipation: ['nanti', 'akan', 'segera', 'menanti', 'menunggu', 'mengharap',
    'berniat', 'berencana', 'berkeinginan', 'bercita-cita', 'target',
    'sasaran', 'tujuan', 'cita-cita', 'ambisi', 'mimpi', 'harapan',
    'berharap', 'doa', 'semoga', 'ingin', 'mau', 'bermaksud'],
  Disgust: ['jijik', 'muak', 'mual', 'benci', 'tidak suka', 'nggak suka',
    'menjijikkan', 'memuakkan', 'busuk', 'kotor', 'jorok', 'kumuh',
    'najis', 'jorok', 'kotor', 'menjijikan', 'gelinya', 'seram'],
};

class SentimentAnalyzer {
  analyze(text) {
    if (!text || typeof text !== 'string') {
      return { sentiment: 'Neutral', score: 0, positive: 0, negative: 0, emotions: {} };
    }
    const lower = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    for (const word of POSITIVE_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lower)) positiveScore++;
    }
    for (const word of NEGATIVE_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lower)) negativeScore++;
    }

    let sentiment = 'Neutral';
    const netScore = positiveScore - negativeScore;
    if (netScore > 0) sentiment = 'Positive';
    else if (netScore < 0) sentiment = 'Negative';

    const emotions = {};
    for (const [emotion, words] of Object.entries(EMOTION_WORDS)) {
      let count = 0;
      for (const word of words) {
        const regex = new RegExp(`\\b${word.replace(/ /g, '\\s+')}\\b`, 'i');
        if (regex.test(lower)) count++;
      }
      if (count > 0) emotions[emotion] = count;
    }

    return { sentiment, score: netScore, positive: positiveScore, negative: negativeScore, emotions };
  }

  generateWordCloud(text, sentiment) {
    if (!text) return { positive: [], neutral: [], negative: [] };
    const preprocessor = require('./preprocessor');
    const processed = preprocessor.process(text);
    const tokens = processed.stemmed;

    const wordData = { positive: [], neutral: [], negative: [] };

    for (const word of [...new Set(tokens)]) {
      const lower = word.toLowerCase();
      let isPos = POSITIVE_WORDS.some(w => lower.includes(w));
      let isNeg = NEGATIVE_WORDS.some(w => lower.includes(w));

      if (isPos || (sentiment === 'Positive' && !isNeg)) {
        wordData.positive.push({ word, weight: tokens.filter(t => t === word).length });
      } else if (isNeg || (sentiment === 'Negative' && !isPos)) {
        wordData.negative.push({ word, weight: tokens.filter(t => t === word).length });
      } else {
        wordData.neutral.push({ word, weight: tokens.filter(t => t === word).length });
      }
    }

    for (const key of Object.keys(wordData)) {
      wordData[key] = wordData[key].sort((a, b) => b.weight - a.weight).slice(0, 50);
    }

    return wordData;
  }
}

module.exports = new SentimentAnalyzer();

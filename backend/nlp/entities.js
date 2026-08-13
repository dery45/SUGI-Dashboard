const COMMODITIES = [
  'beras', 'jagung', 'kedelai', 'cabai', 'bawang merah', 'bawang putih',
  'tomat', 'kentang', 'wortel', 'kubis', 'kol', 'sawi', 'bayam', 'kangkung',
  'terong', 'mentimun', 'labu', 'kacang panjang', 'buncis', 'kacang tanah',
  'kacang hijau', 'kacang kedelai', 'karet', 'kelapa sawit', 'kopi', 'teh',
  'tebu', 'tembakau', 'coklat', 'kakao', 'lada', 'pala', 'cengkeh', 'kayu manis',
  'jahe', 'kunyit', 'lengkuas', 'kencur', 'temulawak', 'sereh', 'daun bawang',
  'seledri', 'peterseli', 'paprika', 'brokoli', 'kembang kol', 'asparagus',
  'ubi kayu', 'singkong', 'ubi jalar', 'talas', 'sagu', 'gandum', 'sorgum',
  'semangka', 'melon', 'pepaya', 'pisang', 'mangga', 'jeruk', 'apel', 'anggur',
  'nanas', 'rambutan', 'duku', 'durian', 'manggis', 'sirsak', 'jambu',
  'sawo', 'belimbing', 'markisa', 'salak', 'kelapa', 'kemiri', 'sapi', 'kerbau',
  'kambing', 'domba', 'babi', 'ayam', 'itik', 'bebek', 'entok', 'burung puyuh',
  'ikan lele', 'ikan nila', 'ikan mas', 'ikan gurame', 'ikan mujair', 'ikan patin',
  'ikan bandeng', 'ikan tuna', 'ikan cakalang', 'ikan tongkol', 'ikan kakap',
  'udang', 'kepiting', 'rajungan', 'kerang', 'cumi-cumi', 'gurita', 'rumput laut',
];

const PROVINCES = [
  'aceh', 'sumatera utara', 'sumatera barat', 'riau', 'jambi', 'sumatera selatan',
  'bengkulu', 'lampung', 'kepulauan bangka belitung', 'kepulauan riau',
  'jakarta', 'dki jakarta', 'jawa barat', 'jawa tengah', 'di yogyakarta', 'jawa timur',
  'banten', 'bali', 'nusa tenggara barat', 'nusa tenggara timur',
  'kalimantan barat', 'kalimantan tengah', 'kalimantan selatan', 'kalimantan timur',
  'kalimantan utara', 'sulawesi utara', 'sulawesi tengah', 'sulawesi selatan',
  'sulawesi tenggara', 'gorontalo', 'sulawesi barat', 'maluku', 'maluku utara',
  'papua', 'papua barat', 'papua selatan', 'papua tengah', 'papua pegunungan',
];

const CITIES = [
  'bandung', 'surabaya', 'jakarta', 'medan', 'semarang', 'yogyakarta', 'solo',
  'malang', 'denpasar', 'makassar', 'palembang', 'pekanbaru', 'padang',
  'bandar lampung', 'jambi', 'bengkulu', 'pontianak', 'banjarmasin',
  'samarinda', 'balikpapan', 'manado', 'palu', 'kendari', 'gorontalo',
  'ambon', 'ternate', 'jayapura', 'manokwari', 'batam', 'tanjung pinang',
  'pangkal pinang', 'serang', 'cilegon', 'bogor', 'depok', 'tangerang',
  'bekasi', 'cianjur', 'sukabumi', 'garut', 'tasikmalaya', 'cirebon',
  'indramayu', 'karawang', 'subang', 'purwakarta', 'sumedang', 'majalengka',
  'kuningan', 'brebes', 'tegal', 'pemalang', 'pekalongan', 'kudus', 'demak',
  'kediri', 'blitar', 'pasuruan', 'probolinggo', 'jember', 'banyuwangi',
  'bojonegoro', 'gresik', 'sidoarjo', 'mojokerto', 'lamongan', 'tuban',
];

const WEATHER_KEYWORDS = ['suhu', 'temperatur', 'kelembaban', 'humiditas', 'curah hujan',
  'angin', 'kecepatan angin', 'tekanan udara', 'sinar matahari', 'intensitas cahaya',
  'cuaca', 'iklim', 'musim', 'musim hujan', 'musim kemarau', 'musim pancaroba',
  'berawan', 'cerah', 'hujan', 'gerimis', 'badai', 'petir'];

const DISEASE_KEYWORDS = [
  'hawar', 'karat', 'busuk', 'layu', 'bercak', 'tungro', 'blas', 'antraknosa',
  'embun tepung', 'moler', 'rebah kecambah', 'kresek', 'hawar daun',
  'virus', 'bakteri', 'jamur', 'nematoda', 'kutu', 'ulat', 'wereng',
  'tikus', 'babihutan', 'burung', 'keong', 'siput', 'belalang', 'walang sangit',
  'hama', 'penyakit', 'gulma', 'OPT', 'organisme pengganggu',
];

const FERTILIZER_KEYWORDS = [
  'urea', 'npk', 'za', 'sp-36', 'kcl', 'pupuk kandang', 'pupuk kompos',
  'pupuk hijau', 'pupuk organik', 'pupuk kimia', 'pupuk anorganik', 'pupuk buatan',
  'pupuk daun', 'pupuk akar', 'pupuk kalsium', 'pupuk mikroba', 'pupuk hayati',
  'pestisida', 'insektisida', 'fungisida', 'herbisida', 'rodentisida', 'bakterisida',
  'mulsa', 'plastik mulsa', 'kapur pertanian', 'dolomit', 'zeolit',
];

class EntityExtractor {
  extract(text) {
    const entities = [];
    const lower = text.toLowerCase();

    for (const c of COMMODITIES) {
      if (new RegExp(`\\b${c.replace(/ /g, '\\s+')}\\b`, 'i').test(lower)) {
        entities.push({ type: 'Komoditas', value: c, source: 'commodity_list' });
      }
    }

    for (const p of PROVINCES) {
      if (new RegExp(`\\b${p.replace(/ /g, '\\s+')}\\b`, 'i').test(lower)) {
        entities.push({ type: 'Provinsi', value: this._title(p), source: 'province_list' });
      }
    }

    for (const c of CITIES) {
      if (new RegExp(`\\b${c.replace(/ /g, '\\s+')}\\b`, 'i').test(lower)) {
        entities.push({ type: 'Kota', value: this._title(c), source: 'city_list' });
      }
    }

    for (const w of WEATHER_KEYWORDS) {
      if (new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'i').test(lower)) {
        entities.push({ type: 'Cuaca', value: w, source: 'weather_keyword' });
      }
    }

    for (const d of DISEASE_KEYWORDS) {
      if (new RegExp(`\\b${d.replace(/ /g, '\\s+')}\\b`, 'i').test(lower)) {
        entities.push({ type: 'Penyakit/Hama', value: this._title(d), source: 'disease_keyword' });
      }
    }

    for (const f of FERTILIZER_KEYWORDS) {
      if (new RegExp(`\\b${f.replace(/ /g, '\\s+')}\\b`, 'i').test(lower)) {
        entities.push({ type: 'Pupuk/Pestisida', value: f, source: 'fertilizer_keyword' });
      }
    }

    const measurementMatch = lower.match(/(\d+[.,]?\d*)\s*(kg|liter|ton|kwintal|hektar|meter|cm|mm|ha|ml|gr|gram|kilogram|kilo|kw|ton)/gi);
    if (measurementMatch) {
      measurementMatch.forEach(m => {
        entities.push({ type: 'Ukuran', value: m.toLowerCase(), source: 'measurement_regex' });
      });
    }

    const dateMatch = lower.match(new RegExp('\\b(\\d{1,2}\\s+[a-z]+(?:\\s+\\d{4})?|\\d{4}-\\d{2}-\\d{2}|\\d{2}/\\d{2}/\\d{4})\\b', 'gi'));
    if (dateMatch) {
      dateMatch.forEach(d => {
        entities.push({ type: 'Tanggal', value: d, source: 'date_regex' });
      });
    }

    const percentageMatch = lower.match(/\b\d+[.,]?\d*\s*%/g);
    if (percentageMatch) {
      percentageMatch.forEach(p => {
        entities.push({ type: 'Persentase', value: p.trim(), source: 'percentage_regex' });
      });
    }

    const numericMatch = lower.match(/\b(?:rp\s*)?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\b(?:rb|juta|milyar)?/gi);
    if (numericMatch) {
      numericMatch.forEach(n => {
        if (!isNaN(parseFloat(n.replace(/[.,]/g, '')))) {
          entities.push({ type: 'Ukuran', value: n.toLowerCase(), source: 'numeric_regex' });
        }
      });
    }

    const orgKeywords = ['pemerintah', 'dinas', 'kementerian', 'balai', 'bpp', 'uptd',
      'kelompok tani', 'gapoktan', 'koperasi', 'bank', 'bri', 'btn', 'asuransi',
      'pusat penelitian', 'universitas', 'institut', 'sekolah', 'politeknik'];
    for (const o of orgKeywords) {
      if (lower.includes(o)) {
        entities.push({ type: 'Organisasi', value: this._title(o), source: 'org_keyword' });
      }
    }

    const techKeywords = ['irigasi', 'drip', 'sprinkler', 'greenhouse', 'rumah kaca',
      'drone', 'sensor', 'iot', 'digital', 'aplikasi', 'smart farming', 'precision farming',
      'hidroponik', 'aquaponik', 'aeroponik', 'organik', 'polibag', 'polybag',
      'bibit unggul', 'varietas', 'rekayasa genetika', 'kultur jaringan'];
    for (const t of techKeywords) {
      if (lower.includes(t)) {
        entities.push({ type: 'Teknologi', value: this._title(t), source: 'tech_keyword' });
      }
    }

    const entitiesMap = new Map();
    const entityOrder = ['Komoditas', 'Provinsi', 'Kota', 'Cuaca', 'Penyakit/Hama',
      'Pupuk/Pestisida', 'Ukuran', 'Tanggal', 'Persentase', 'Organisasi', 'Teknologi'];
    for (const e of entities) {
      const key = `${e.type}|${e.value}`;
      if (!entitiesMap.has(key)) {
        entitiesMap.set(key, { ...e, count: 0 });
      }
      entitiesMap.get(key).count++;
    }

    return Array.from(entitiesMap.values())
      .sort((a, b) => entityOrder.indexOf(a.type) - entityOrder.indexOf(b.type));
  }

  extractTypes(text) {
    const entities = this.extract(text);
    const types = new Set(entities.map(e => e.type));
    return Array.from(types);
  }

  extractLocations(text) {
    const entities = this.extract(text);
    return entities.filter(e => e.type === 'Provinsi' || e.type === 'Kota');
  }

  extractCommodities(text) {
    const entities = this.extract(text);
    return entities.filter(e => e.type === 'Komoditas');
  }

  _title(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }
}

module.exports = new EntityExtractor();

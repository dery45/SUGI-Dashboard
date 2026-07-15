const PROBLEM_PATTERNS = {
  Masalah: [
    /(?:masalah|kendala|hambatan|kesulitan|problem)\s+(?:yang\s+)?(?:dihadapi|terjadi|dialami|muncul|ada)?\s*(?:adalah|berupa|yakni|yaitu)?\s*(.+?)(?:\.|!)/gi,
    /(?:terdapat|ada|muncul|terjadi)\s+(?:beberapa\s+)?(?:masalah|kendala|hambatan|kesulitan)\s+(.+?)(?:\.|!)/gi,
  ],
  Risiko: [
    /(?:risiko|resiko|bahaya|ancaman|potensi\s+bahaya)\s+(?:yang\s+)?(?:mungkin|dapat|bisa)?\s*(?:terjadi|timbul|muncul)?\s*(?:adalah|berupa|yakni|yaitu)?\s*(.+?)(?:\.|!)/gi,
    /(?:berisiko|berbahaya|rawan|rentan)\s+(?:mengalami|terkena|terdampak)\s+(.+?)(?:\.|!)/gi,
  ],
  Keluhan: [
    /(?:mengeluh|keluhan|komplain|protes|kecewa|tidak\s+puas)\s+(?:tentang|akan|atas|mengenai|terhadap)?\s*(.+?)(?:\.|!)/gi,
    /(?:kualitas\s+buruk|pelayanan\s+buruk|harga\s+ mahal|terlambat|tidak\s+sesuai)\s+(.+?)(?:\.|!)/gi,
  ],
  Penyakit: [
    /(?:terserang|terinfeksi|terkena|menderita)\s+(?:penyakit|hama|virus|bakteri|jamur)\s+(.+?)(?:\.|!)/gi,
    /(?:gejala|tanda-tanda)\s+(?:penyakit|infeksi|serangan)\s+(.+?)(?:\.|!)/gi,
    /(?:penyakit|hama)\s+(?:yang\s+)?(?:menyerang|menginfeksi|menjangkit)\s+(.+?)(?:\.|!)/gi,
  ],
  Hama: [
    /(?:hama|wereng|ulat|tikus|belalang|walang\s+sangit|keong|siput|burung|babi\s+hutan)\s+(?:menyerang|merusak|memakan|menggerek|menghisap)\s+(.+?)(?:\.|!)/gi,
    /(?:serangan\s+hama|hama\s+tanaman)\s+(?:berupa|yakni|yaitu|adalah)\s+(.+?)(?:\.|!)/gi,
  ],
  Peringatan: [
    /(?:peringatan|waspada|awas|hati-hati|caution|alert|siaga)\s+(.+?)(?:\.|!)/gi,
    /(?:potensi|kemungkinan|prediksi)\s+(?:terjadinya|munculnya|adanya)\s+(.+?)(?:\.|!)/gi,
  ],
  Keterbatasan: [
    /(?:keterbatasan|kelangkaan|kekurangan|minim|terbatas)\s+(?:modal|dana|pupuk|bibit|air|lahan|tenaga\s+kerja|teknologi|informasi)\s+(.+?)(?:\.|!)/gi,
    /(?:tidak\s+memiliki|belum\s+memiliki|kurangnya|minimnya)\s+(.+?)(?:\.|!)/gi,
  ],
};

class ProblemMiner {
  mine(documents) {
    const problems = [];

    for (const doc of documents) {
      if (!doc.summary) continue;
      const lower = doc.summary.toLowerCase();

      for (const [type, patterns] of Object.entries(PROBLEM_PATTERNS)) {
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(lower)) !== null) {
            const text = match[1] || match[0];
            const severity = this._assessSeverity(text);

            problems.push({
              type,
              text: this._clean(match[0]),
              insight: this._clean(text),
              severity,
              session_id: doc.session_id,
              insight_id: doc.insight_id,
              pushed_at: doc.pushed_at,
              entities: this._extractEntities(doc.summary),
            });
          }
        }
      }
    }

    const typeDistribution = {};
    problems.forEach(p => { typeDistribution[p.type] = (typeDistribution[p.type] || 0) + 1; });

    return {
      problems: problems.sort((a, b) => b.severity - a.severity),
      total: problems.length,
      typeDistribution: Object.entries(typeDistribution).map(([type, count]) => ({ type, count })),
      topProblems: problems
        .filter(p => p.severity >= 7)
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 10),
    };
  }

  _assessSeverity(text) {
    let score = 5;
    if (/gagal|mati|rusak|parah|kritis|darurat|bencana|puso/i.test(text)) score += 4;
    if (/serius|berat|akut|kronis|signifikan|besar/i.test(text)) score += 3;
    if (/(menyebar|meluas|merembet|banyak)/i.test(text)) score += 2;
    if (/sedikit|ringan|kecil|sebagian|minor/i.test(text)) score -= 2;
    if (/meningkat|melonjak|menggila|eksplosif/i.test(text)) score += 2;
    return Math.max(1, Math.min(10, score));
  }

  _extractEntities(text) {
    const entityExtractor = require('./entities');
    const entities = entityExtractor.extract(text);
    return entities.map(e => ({ value: e.value, type: e.type }));
  }

  _clean(text) {
    return text.trim().replace(/\s+/g, ' ');
  }
}

module.exports = new ProblemMiner();

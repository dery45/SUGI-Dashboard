const preprocessor = require('./preprocessor');

const RECOMMENDATION_PATTERNS = [
  /(?:disarankan|direkomendasikan|sebaiknya|seharusnya|alangkah baiknya|saya sarankan|kami rekomendasikan|saya rekomendasikan)\s+(.+?)(?:\.|!)/gi,
  /(?:rekomendasi|saran|anjuran|usulan|masukan)(?:\s+yang\s+)?(?:\s+dapat\s+)?(?:\s+adalah\s+)?(.+?)(?:\.|!)/gi,
  /(?:lebih baik|sebaiknya|seharusnya|semestinya|alangkah baiknya jika|idealnya)\s+(.+?)(?:\.|!)/gi,
  /(?:dapat|bisa|perlu|harus|wajib)\s+(?:dilakukan|diterapkan|diperbaiki|ditingkatkan|dioptimalkan|dikembangkan|dibuat|dibangun)\s+(.+?)(?:\.|!)/gi,
  /(?:cara|langkah|tips|triks|strategi|metode|teknik)\s+(?:untuk|agar|supaya|memperbaiki|mengatasi|meningkatkan)\s+(.+?)(?:\.|!)/gi,
  /(?:solusi|jalan keluar|alternatif|opsi|pilihan)\s+(?:terbaik|tepat|ideal|alternatif)?\s*(?:adalah|berupa|yakni|yaitu)\s+(.+?)(?:\.|!)/gi,
  /(?:penting|krusial|esensial|vital)\s+(?:untuk|bagi|agar|supaya)\s+(.+?)(?:\.|!)/gi,
];

class RecommendationMiner {
  mine(documents) {
    const recommendations = [];

    for (const doc of documents) {
      if (!doc.summary) continue;
      const lower = doc.summary.toLowerCase();

      for (const pattern of RECOMMENDATION_PATTERNS) {
        let match;
        while ((match = pattern.exec(lower)) !== null) {
          const text = match[1] || match[0];
          const entities = this._extractEntities(doc.summary);
          const category = this._categorize(text);

          recommendations.push({
            text: this._clean(match[0]),
            insight: this._clean(text),
            category,
            entities,
            session_id: doc.session_id,
            insight_id: doc.insight_id,
            pushed_at: doc.pushed_at,
            char_count: doc.char_count,
            relevance_score: this._score(text, entities),
          });
        }
      }
    }

    const categories = [...new Set(recommendations.map(r => r.category))];
    const entityCounts = {};
    recommendations.forEach(r => {
      r.entities.forEach(e => { entityCounts[e] = (entityCounts[e] || 0) + 1; });
    });

    return {
      recommendations: recommendations.sort((a, b) => b.relevance_score - a.relevance_score),
      total: recommendations.length,
      categories,
      topEntities: Object.entries(entityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([value, count]) => ({ value, count })),
      categoryDistribution: categories.map(c => ({
        category: c,
        count: recommendations.filter(r => r.category === c).length,
      })),
    };
  }

  _categorize(text) {
    if (/budidaya|tanam|bibit|benih|semai|pupuk|pemupukan/i.test(text)) return 'Budidaya';
    if (/panen|pasca panen|pemetikan|sortasi|grading/i.test(text)) return 'Panen';
    if (/harga|pasar|jual|beli|permintaan|penawaran|ekonomi/i.test(text)) return 'Pasar & Harga';
    if (/hama|penyakit|pestisida|obat|pengendalian/i.test(text)) return 'Pengendalian Hama';
    if (/cuaca|suhu|iklim|musim|air|irigasi/i.test(text)) return 'Cuaca & Irigasi';
    if (/teknologi|digital|aplikasi|iot|drone|modernisasi/i.test(text)) return 'Teknologi';
    if (/modal|kredit|pinjaman|bantuan|subsidi|asuransi/i.test(text)) return 'Pembiayaan';
    if (/pemerintah|dinas|kebijakan|program|regulasi/i.test(text)) return 'Kebijakan';
    return 'Umum';
  }

  _score(text, entities) {
    let score = 1;
    if (text.length > 50) score += 1;
    if (text.length > 100) score += 1;
    score += entities.length * 0.5;
    if (/sebaiknya|harus|wajib|penting|krusial|solusi|rekomendasi|saran/i.test(text)) score += 1;
    return Math.min(score, 10);
  }

  _extractEntities(text) {
    const entityExtractor = require('./entities');
    const entities = entityExtractor.extract(text);
    return entities.map(e => e.value);
  }

  _clean(text) {
    return text.trim().replace(/\s+/g, ' ');
  }
}

module.exports = new RecommendationMiner();

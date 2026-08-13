class CoverageAnalyzer {
  analyze(documents, nlpResults, knowledgeGraph) {
    const topicCoverage = this._analyzeTopicCoverage(documents);
    const commodityCoverage = this._analyzeCommodityCoverage(nlpResults);
    const locationCoverage = this._analyzeLocationCoverage(nlpResults);
    const intentCoverage = this._analyzeIntentCoverage(nlpResults);
    const entityCoverage = this._analyzeEntityCoverage(nlpResults);
    const kgCoverage = this._analyzeKnowledgeGraphCoverage(knowledgeGraph, nlpResults);
    const duplicates = this._detectDuplicates(documents);
    const missing = this._detectMissingEntities(nlpResults);
    const semanticDiversity = this._calcSemanticDiversity(nlpResults);
    const dataCompleteness = this._calcDataCompleteness(documents);

    const scores = {
      topicCoverage: topicCoverage.score,
      commodityCoverage: commodityCoverage.score,
      locationCoverage: locationCoverage.score,
      intentCoverage: intentCoverage.score,
      entityCoverage: entityCoverage.score,
      kgCoverage: kgCoverage.score,
      semanticDiversity: semanticDiversity,
      dataCompleteness: dataCompleteness,
    };

    const overall = Object.values(scores).reduce((s, v) => s + v, 0) / Object.keys(scores).length;

    return {
      overall: Math.round(overall * 100) / 100,
      scores,
      topicCoverage,
      commodityCoverage,
      locationCoverage,
      intentCoverage,
      entityCoverage,
      kgCoverage,
      duplicates,
      missingEntities: missing,
      semanticDiversity,
      dataCompleteness,
      recommendations: this._generateRecommendations(scores),
    };
  }

  _analyzeTopicCoverage(documents) {
    const categories = [...new Set(documents.filter(d => d.category).map(d => d.category))];
    const expected = ['session_summary', 'general_insight', 'price_insight', 'weather_insight',
      'government_insight', 'farmer_insight', 'planting_suggestion'];
    const covered = expected.filter(e => categories.includes(e));
    return { score: expected.length > 0 ? covered.length / expected.length : 0, total: expected.length, covered: covered.length, categories };
  }

  _analyzeCommodityCoverage(nlpResults) {
    const allCommodities = this._collectEntities(nlpResults, 'Komoditas');
    const expected = ['beras','jagung','kedelai','cabai','bawang merah','bawang putih','tomat'];
    const covered = expected.filter(e => allCommodities.includes(e));
    return { score: expected.length > 0 ? covered.length / expected.length : 0, total: expected.length, covered: covered.length, commodities: allCommodities.slice(0, 20) };
  }

  _analyzeLocationCoverage(nlpResults) {
    const locations = this._collectEntities(nlpResults, 'Provinsi');
    const expected = ['Jawa Barat','Jawa Tengah','Jawa Timur','Sumatera Utara','Sulawesi Selatan'];
    const covered = expected.filter(e => locations.includes(e));
    return { score: expected.length > 0 ? covered.length / expected.length : 0, total: expected.length, covered: covered.length, locations: locations.slice(0, 20) };
  }

  _analyzeIntentCoverage(nlpResults) {
    const intents = [...new Set(nlpResults.filter(r => r.intent).map(r => r.intent))];
    const expected = ['Informasi','Rekomendasi','Permasalahan','Keluhan','Cuaca','Budidaya','Panen','Penyakit','Harga','Pasar','Teknologi','Lainnya'];
    const covered = expected.filter(e => intents.includes(e));
    return { score: expected.length > 0 ? covered.length / expected.length : 0, total: expected.length, covered: covered.length, intents };
  }

  _analyzeEntityCoverage(nlpResults) {
    const types = [...new Set(nlpResults.flatMap(r => r.entity_types || []))];
    const expected = ['Komoditas','Provinsi','Kota','Cuaca','Penyakit/Hama','Pupuk/Pestisida','Organisasi','Teknologi'];
    const covered = expected.filter(e => types.includes(e));
    return { score: expected.length > 0 ? covered.length / expected.length : 0, total: expected.length, covered: covered.length, types };
  }

  _analyzeKnowledgeGraphCoverage(kg, nlpResults) {
    if (!kg || !kg.nodes || kg.nodes.length === 0) return { score: 0, total: 0, covered: 0 };
    const allEntities = new Set(nlpResults.flatMap(r => r.entity_types || []));
    const nodeTypes = new Set(kg.nodes.map(n => n.type));
    const covered = [...allEntities].filter(e => nodeTypes.has(e));
    return { score: allEntities.size > 0 ? covered.length / allEntities.size : 0, total: allEntities.size, covered: covered.length };
  }

  _detectDuplicates(documents) {
    const groups = {};
    documents.forEach(doc => {
      if (!doc.summary) return;
      const key = doc.summary.slice(0, 50).toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc.insight_id || doc._id);
    });
    const duplicates = Object.entries(groups).filter(([, ids]) => ids.length > 1);
    return duplicates.map(([key, ids]) => ({ key, count: ids.length, ids }));
  }

  _detectMissingEntities(nlpResults) {
    const missing = [];
    nlpResults.forEach(r => {
      if (!r.entities || r.entities.length === 0) {
        missing.push({ insight_id: r.insight_id, reason: 'No entities extracted' });
      }
    });
    return missing.slice(0, 20);
  }

  _calcSemanticDiversity(nlpResults) {
    const allTokens = new Set();
    nlpResults.forEach(r => {
      (r.stemmed_tokens || []).forEach(t => allTokens.add(t));
    });
    const totalDocs = nlpResults.length || 1;
    const ratio = allTokens.size / totalDocs;
    return Math.min(ratio / 10, 1);
  }

  _calcDataCompleteness(documents) {
    if (documents.length === 0) return 0;
    let complete = 0;
    documents.forEach(doc => {
      const fields = ['summary', 'session_id', 'pushed_at', 'category', 'char_count'];
      const hasAll = fields.every(f => doc[f] !== undefined && doc[f] !== null && doc[f] !== '');
      if (hasAll) complete++;
    });
    return complete / documents.length;
  }

  _collectEntities(nlpResults, type) {
    const set = new Set();
    nlpResults.forEach(r => {
      if (r.entities) {
        r.entities.forEach(e => {
          if (e.type === type) set.add(e.value);
        });
      }
    });
    return [...set];
  }

  _generateRecommendations(scores) {
    const recs = [];
    if (scores.topicCoverage < 0.5) recs.push('Perlu menambah variasi kategori topik untuk meningkatkan cakupan.');
    if (scores.commodityCoverage < 0.5) recs.push('Cakupan komoditas masih rendah. Fokus pada komoditas utama seperti beras, jagung, dan cabai.');
    if (scores.locationCoverage < 0.5) recs.push('Cakupan lokasi terbatas. Perlu data dari lebih banyak provinsi.');
    if (scores.intentCoverage < 0.5) recs.push('Distribusi intent belum merata. Dorong percakapan dengan berbagai tujuan.');
    if (scores.entityCoverage < 0.7) recs.push('Beberapa tipe entitas belum terdeteksi. Perkaya pola ekstraksi entitas.');
    if (scores.kgCoverage < 0.3) recs.push('Knowledge graph masih jarang. Perkuat hubungan antar entitas.');
    if (scores.dataCompleteness < 0.8) recs.push('Beberapa dokumen memiliki field yang tidak lengkap.');
    return recs;
  }
}

module.exports = new CoverageAnalyzer();

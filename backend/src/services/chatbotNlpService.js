const chatbotNlpRepository = require('../repositories/chatbotNlpRepository');
const nlpPipeline = require('../nlp/pipeline');

class ChatbotNlpService {
  async processAll() {
    return nlpPipeline.getOrProcess();
  }

  async getActivityData(filters = {}) {
    await this._ensureProcessed();
    const results = await chatbotNlpRepository.getAllResults();

    const sessionsPerDay = {};
    const sessionsPerHour = new Array(24).fill(0);
    const summaryLengths = [];
    let totalChars = 0;

    results.forEach(r => {
      if (r.pushed_at) {
        const day = new Date(r.pushed_at).toISOString().slice(0, 10);
        sessionsPerDay[day] = (sessionsPerDay[day] || 0) + 1;
        const hour = new Date(r.pushed_at).getHours();
        sessionsPerHour[hour]++;
      }
      if (r.char_count) {
        summaryLengths.push(r.char_count);
        totalChars += r.char_count;
      }
    });

    const dayEntries = Object.entries(sessionsPerDay).sort(([a], [b]) => a.localeCompare(b));
    const avgLength = summaryLengths.length > 0
      ? Math.round(totalChars / summaryLengths.length) : 0;

    const heatmap = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        heatmap.push({ day: d, hour: h, value: 0 });
      }
    }
    results.forEach(r => {
      if (r.pushed_at) {
        const d = new Date(r.pushed_at);
        const day = d.getDay();
        const hour = d.getHours();
        const idx = heatmap.findIndex(h => h.day === day && h.hour === hour);
        if (idx >= 0) heatmap[idx].value++;
      }
    });

    return {
      sessionsPerDay: dayEntries.map(([date, count]) => ({ date, count })),
      sessionsPerHour: sessionsPerHour.map((count, hour) => ({ hour, count })),
      heatmap,
      timeline: dayEntries.map(([date, count]) => ({ date, count })),
      summaryLengthDistribution: summaryLengths,
      averageSummaryLength: avgLength,
      totalSessions: results.length,
      totalSummaries: results.length,
      totalCharacters: totalChars,
    };
  }

  async getTopicData(filters = {}) {
    await this._ensureProcessed();
    const topicModel = await chatbotNlpRepository.getTopicModel();
    const keywordRanking = await chatbotNlpRepository.getKeywordRanking();

    return {
      bertopic: topicModel?.lda || null,
      lda: topicModel?.lda || null,
      topicDistribution: topicModel?.lda?.topics?.map(t => ({
        topicId: t.topicId,
        label: t.label,
        count: t.documentCount,
        words: t.words,
      })) || [],
      topicTimeline: [],
      tfidfRanking: topicModel?.tfidf?.overallRanking || [],
      keywordRanking: keywordRanking || [],
      bigrams: topicModel?.bigrams || [],
      trigrams: topicModel?.trigrams || [],
      cooccurrenceMatrix: topicModel?.cooccurrence || [],
      topicSimilarity: topicModel?.topicSimilarity || [],
    };
  }

  async getEntityData(filters = {}) {
    await this._ensureProcessed();
    const [entityStats, typeDistribution, entityTimeline] = await Promise.all([
      chatbotNlpRepository.getEntityStats(),
      chatbotNlpRepository.getEntityTypeDistribution(),
      chatbotNlpRepository.getEntityTimeline(),
    ]);

    const results = await chatbotNlpRepository.getAllResults();
    const allEntities = [];
    results.forEach(r => {
      if (r.entities) {
        r.entities.forEach(e => {
          allEntities.push({ ...e, session_id: r.session_id, pushed_at: r.pushed_at });
        });
      }
    });

    return {
      entityTable: allEntities,
      entityFrequency: entityStats,
      entityTimeline,
      entityTypeDistribution: typeDistribution,
    };
  }

  async getNerData(filters = {}) {
    await this._ensureProcessed();
    const results = await chatbotNlpRepository.getAllResults();

    const commodities = [];
    const locations = [];
    const organizations = [];
    const weather = [];
    const diseases = [];
    const fertilizers = [];
    const measurements = [];
    const dates = [];
    const percentages = [];
    const technologies = [];

    results.forEach(r => {
      if (r.entities) {
        r.entities.forEach(e => {
          const entry = { ...e, session_id: r.session_id, insight_id: r.insight_id, pushed_at: r.pushed_at };
          switch (e.type) {
            case 'Komoditas': commodities.push(entry); break;
            case 'Provinsi': case 'Kota': locations.push(entry); break;
            case 'Organisasi': organizations.push(entry); break;
            case 'Cuaca': weather.push(entry); break;
            case 'Penyakit/Hama': diseases.push(entry); break;
            case 'Pupuk/Pestisida': fertilizers.push(entry); break;
            case 'Ukuran': measurements.push(entry); break;
            case 'Tanggal': dates.push(entry); break;
            case 'Persentase': percentages.push(entry); break;
            case 'Teknologi': technologies.push(entry); break;
          }
        });
      }
    });

    const commodityCounts = {};
    commodities.forEach(c => { commodityCounts[c.value] = (commodityCounts[c.value] || 0) + 1; });
    const locationCounts = {};
    locations.forEach(l => { locationCounts[l.value] = (locationCounts[l.value] || 0) + 1; });

    return {
      commodities: Object.entries(commodityCounts)
        .sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count })),
      locations: Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count })),
      organizations,
      weather,
      diseases,
      fertilizers,
      measurements,
      dates,
      percentages,
      technologies,
      allEntitiesCount: commodities.length + locations.length + organizations.length,
    };
  }

  async getIntentData(filters = {}) {
    await this._ensureProcessed();
    const [intentDistribution, intentTimeline, intentByCommodity, intentByLocation] = await Promise.all([
      chatbotNlpRepository.getIntentDistribution(),
      chatbotNlpRepository.getIntentTimeline(),
      chatbotNlpRepository.getIntentByCommodity(),
      chatbotNlpRepository.getIntentByLocation(),
    ]);

    const results = await chatbotNlpRepository.getAllResults();
    const sentimentDist = await chatbotNlpRepository.getSentimentDistribution();
    const sentimentTimeline = await chatbotNlpRepository.getAverageSentimentOverTime();
    const emotionDist = await chatbotNlpRepository.getEmotionDistribution();

    const keywordRanking = await chatbotNlpRepository.getKeywordRanking();
    const wordClouds = this._generateWordClouds(results);

    return {
      intentDistribution,
      intentTimeline,
      sankeyData: { intentCommodity: intentByCommodity, intentLocation: intentByLocation },
      intentByCommodity,
      intentByLocation,
      sentimentDistribution: sentimentDist,
      sentimentTimeline,
      emotionDistribution: emotionDist,
      wordClouds,
      keywordRanking,
    };
  }

  async searchEntities(query) {
    await this._ensureProcessed();
    const results = await chatbotNlpRepository.getAllResults();
    const lowerQuery = query.toLowerCase();
    const matches = [];

    results.forEach(r => {
      if (r.entities) {
        r.entities.forEach(e => {
          if (e.value.toLowerCase().includes(lowerQuery) || e.type.toLowerCase().includes(lowerQuery)) {
            matches.push({
              entity: e,
              session_id: r.session_id,
              insight_id: r.insight_id,
              pushed_at: r.pushed_at,
            });
          }
        });
      }
    });

    return matches.slice(0, 200);
  }

  async _ensureProcessed() {
    const count = await chatbotNlpRepository.getProcessedCount();
    if (count === 0) {
      await nlpPipeline.getOrProcess();
    }
  }

  _generateWordClouds(results) {
    const posWords = {}, negWords = {}, neuWords = {};
    results.forEach(r => {
      const tokens = r.stemmed_tokens || [];
      if (r.sentiment === 'Positive') {
        tokens.forEach(t => { posWords[t] = (posWords[t] || 0) + 1; });
      } else if (r.sentiment === 'Negative') {
        tokens.forEach(t => { negWords[t] = (negWords[t] || 0) + 1; });
      } else {
        tokens.forEach(t => { neuWords[t] = (neuWords[t] || 0) + 1; });
      }
    });

    const toArray = obj => Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([word, weight]) => ({ word, weight }));

    return {
      positive: toArray(posWords),
      neutral: toArray(neuWords),
      negative: toArray(negWords),
    };
  }
}

module.exports = new ChatbotNlpService();

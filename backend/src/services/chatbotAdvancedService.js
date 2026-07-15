const relationExtractor = require('../nlp/relations');
const knowledgeGraph = require('../nlp/knowledgeGraph');
const recommendationMiner = require('../nlp/recommendations');
const problemMiner = require('../nlp/problems');
const trendAnalyzer = require('../nlp/trends');
const coverageAnalyzer = require('../nlp/coverage');
const insightEngine = require('../nlp/insights');
const semanticSearch = require('../nlp/semanticSearch');
const chatbotNlpRepository = require('../repositories/chatbotNlpRepository');
const { globalCache, workerQueue, globalMemoizer } = require('../nlp/optimization');

class ChatbotAdvancedService {
  async _getNlpResults() {
    const results = await chatbotNlpRepository.getAllResults();
    if (results.length > 0 && !semanticSearch.index) {
      semanticSearch.buildIndex(results);
    }
    return results;
  }

  async _getNlpResultsCached() {
    return globalCache.memoize(
      async () => this._getNlpResults(),
      () => 'nlp_results'
    )();
  }

  async getSemanticNetwork() {
    const results = await this._getNlpResultsCached();

    const allSentences = [];
    results.forEach(r => {
      if (r.original_text) {
        r.original_text.split(/[.!?]+/).filter(s => s.trim().length > 15).forEach(s => allSentences.push(s));
      }
    });

    const allEntities = results.flatMap(r => r.entities || []);
    const relations = relationExtractor.extract(allSentences, allEntities);

    const entityFreq = {};
    allEntities.forEach(e => {
      entityFreq[e.value] = (entityFreq[e.value] || 0) + e.count;
    });

    return {
      relations: relations.slice(0, 200),
      entityFrequency: Object.entries(entityFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(([value, count]) => ({ value, count })),
      totalRelations: relations.length,
      totalSentences: allSentences.length,
    };
  }

  async getKnowledgeGraph() {
    const results = await this._getNlpResultsCached();
    const docs = results.map(r => ({
      summary: r.original_text || '',
      session_id: r.session_id,
      insight_id: r.insight_id,
    }));
    const kg = knowledgeGraph.build(docs);
    return kg;
  }

  async searchKnowledgeGraph(query, nodeType, relationType) {
    const kg = await this.getKnowledgeGraph();
    if (query) return knowledgeGraph.search(kg, query);
    if (nodeType || relationType) return knowledgeGraph.filterByType(kg, nodeType, relationType);
    return kg;
  }

  async getRecommendations() {
    const results = await this._getNlpResultsCached();
    const docs = results.map(r => ({
      summary: r.original_text || '',
      session_id: r.session_id,
      insight_id: r.insight_id,
      pushed_at: r.pushed_at,
      char_count: r.char_count,
    }));
    const mined = recommendationMiner.mine(docs);
    return mined;
  }

  async getProblems() {
    const results = await this._getNlpResultsCached();
    const docs = results.map(r => ({
      summary: r.original_text || '',
      session_id: r.session_id,
      insight_id: r.insight_id,
      pushed_at: r.pushed_at,
      entities: r.entities,
    }));
    const mined = problemMiner.mine(docs);

    const timelineData = {};
    mined.problems.forEach(p => {
      if (p.pushed_at) {
        const date = new Date(p.pushed_at).toISOString().slice(0, 10);
        if (!timelineData[date]) timelineData[date] = { date, total: 0, byType: {} };
        timelineData[date].total++;
        timelineData[date].byType[p.type] = (timelineData[date].byType[p.type] || 0) + 1;
      }
    });

    return {
      ...mined,
      timeline: Object.values(timelineData).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  async getTrends() {
    const results = await this._getNlpResultsCached();
    return trendAnalyzer.analyzeTrends(results);
  }

  async getCoverage() {
    const results = await this._getNlpResultsCached();
    const kg = await this.getKnowledgeGraph();
    const docs = results.map(r => ({
      summary: r.original_text || '',
      session_id: r.session_id,
      insight_id: r.insight_id,
      pushed_at: r.pushed_at,
      category: r.category,
      char_count: r.char_count,
    }));
    return coverageAnalyzer.analyze(docs, results, kg);
  }

  async getInsights(kpiData, activityData, topicData, commodityData, locationData, intentData, trendData, coverageData) {
    const insights = insightEngine.generateIntelligently(
      kpiData, activityData, topicData, commodityData, locationData, intentData, trendData, coverageData
    );
    return insights;
  }

  async semanticSearch(query, options = {}) {
    if (!semanticSearch.index) {
      const results = await this._getNlpResults();
      semanticSearch.buildIndex(results);
    }
    return semanticSearch.search(query, options);
  }

  async registerWorker(name, handler) {
    workerQueue.register(name, handler);
  }

  async processInBackground(name, payload) {
    return workerQueue.enqueue(name, payload);
  }

  clearCache() {
    globalCache.invalidate();
    semanticSearch.index = null;
  }
}

module.exports = new ChatbotAdvancedService();

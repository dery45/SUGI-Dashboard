const preprocessor = require('./preprocessor');
const entityExtractor = require('./entities');
const intentClassifier = require('./intent');
const sentimentAnalyzer = require('./sentiment');
const topicModeler = require('./topics');
const chatbotNlpRepository = require('../repositories/chatbotNlpRepository');

class NlpPipeline {
  async processDocument(doc) {
    if (!doc || !doc.summary) return null;

    const processed = preprocessor.process(doc.summary);
    const entities = entityExtractor.extract(doc.summary);
    const intent = intentClassifier.classifyWithConfidence(doc.summary);
    const sentiment = sentimentAnalyzer.analyze(doc.summary);

    const nlpResult = {
      insight_id: doc.insight_id,
      session_id: doc.session_id,
      category: doc.category,
      char_count: doc.char_count,
      pushed_at: doc.pushed_at,
      timestamp: doc.timestamp,
      original_text: doc.summary,
      tokens: processed.tokens,
      filtered_tokens: processed.filtered,
      stemmed_tokens: processed.stemmed,
      entities,
      intent: intent.intent,
      intent_confidence: intent.confidence,
      intent_scores: intent.scores,
      sentiment: sentiment.sentiment,
      sentiment_score: sentiment.score,
      sentiment_positive: sentiment.positive,
      sentiment_negative: sentiment.negative,
      emotions: sentiment.emotions,
      entity_types: entityExtractor.extractTypes(doc.summary),
      locations: entityExtractor.extractLocations(doc.summary),
      commodities: entityExtractor.extractCommodities(doc.summary),
      processed_at: new Date(),
    };

    return nlpResult;
  }

  async processAllDocuments(documents) {
    const results = [];
    for (const doc of documents) {
      const result = await this.processDocument(doc);
      if (result) results.push(result);
    }

    if (results.length > 0) {
      await chatbotNlpRepository.bulkUpsert(results);
    }

    const summaries = documents.map(d => d.summary || '').filter(s => s.trim());
    const tfidf = topicModeler.computeTFIDF(summaries);
    const lda = topicModeler.computeLDA(summaries);
    const bigrams = topicModeler.computeBigrams(summaries);
    const trigrams = topicModeler.computeTrigrams(summaries);
    const cooccurrence = topicModeler.computeCooccurrence(summaries);
    const similarity = topicModeler.computeSimilarity(summaries);

    await chatbotNlpRepository.saveTopicModel({
      computed_at: new Date(),
      document_count: summaries.length,
      tfidf,
      lda,
      bigrams,
      trigrams,
      cooccurrence,
      similarity,
    });

    return {
      processedCount: results.length,
      totalDocuments: documents.length,
      tfidf,
      lda,
      bigrams,
      trigrams,
      cooccurrence,
      topicSimilarity: similarity,
    };
  }

  async getOrProcess() {
    const existing = await chatbotNlpRepository.getProcessedCount();
    if (existing > 0) {
      return { cached: true, count: existing };
    }

    const SessionSummary = require('../models/sugi_insights/SessionSummary');
    const documents = await SessionSummary.find({}).lean();
    const result = await this.processAllDocuments(documents);
    return { cached: false, ...result };
  }
}

module.exports = new NlpPipeline();

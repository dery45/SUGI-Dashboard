const NlpResult = require('../models/sugi_insights/NlpResult');
const conn = require('../models/sugi_insights');

class ChatbotNlpRepository {
  async bulkUpsert(results) {
    if (!results || results.length === 0) return;
    const ops = results.map(r => ({
      updateOne: {
        filter: { insight_id: r.insight_id },
        update: { $set: r },
        upsert: true,
      },
    }));
    await NlpResult.bulkWrite(ops);
  }

  async getProcessedCount() {
    return NlpResult.countDocuments();
  }

  async getAllResults() {
    return NlpResult.find({}).lean();
  }

  async getResultsBySession(sessionId) {
    return NlpResult.find({ session_id: sessionId }).lean();
  }

  async getTopicModel() {
    const coll = conn.collection('topic_models');
    return coll.findOne({}, { sort: { computed_at: -1 } });
  }

  async saveTopicModel(model) {
    const coll = conn.collection('topic_models');
    await coll.insertOne(model);
    const count = await coll.countDocuments();
    if (count > 5) {
      const old = await coll.find().sort({ computed_at: 1 }).limit(count - 5).toArray();
      if (old.length > 0) {
        await coll.deleteMany({ _id: { $in: old.map(o => o._id) } });
      }
    }
    return model;
  }

  async getEntityStats() {
    return NlpResult.aggregate([
      { $unwind: '$entities' },
      {
        $group: {
          _id: { type: '$entities.type', value: '$entities.value' },
          count: { $sum: '$entities.count' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 100 },
    ]);
  }

  async getEntityTypeDistribution() {
    return NlpResult.aggregate([
      { $unwind: '$entities' },
      {
        $group: {
          _id: '$entities.type',
          count: { $sum: 1 },
          totalOccurrences: { $sum: '$entities.count' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getEntityTimeline() {
    return NlpResult.aggregate([
      { $unwind: '$entities' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$pushed_at' } },
            type: '$entities.type',
          },
          count: { $sum: '$entities.count' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);
  }

  async getIntentDistribution() {
    return NlpResult.aggregate([
      {
        $group: {
          _id: '$intent',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$intent_confidence' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getIntentTimeline() {
    return NlpResult.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$pushed_at' } },
            intent: '$intent',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);
  }

  async getIntentByCommodity() {
    return NlpResult.aggregate([
      { $unwind: '$commodities' },
      {
        $group: {
          _id: { intent: '$intent', commodity: '$commodities.value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getIntentByLocation() {
    return NlpResult.aggregate([
      { $unwind: '$locations' },
      {
        $group: {
          _id: { intent: '$intent', location: '$locations.value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getSentimentDistribution() {
    return NlpResult.aggregate([
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 },
          avgScore: { $avg: '$sentiment_score' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getAverageSentimentOverTime() {
    return NlpResult.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$pushed_at' } },
          avgSentiment: { $avg: '$sentiment_score' },
          positiveCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
          negativeCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } },
          neutralCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'Neutral'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getEmotionDistribution() {
    return NlpResult.aggregate([
      { $project: { emotions: { $objectToArray: '$emotions' } } },
      { $unwind: '$emotions' },
      {
        $group: {
          _id: '$emotions.k',
          count: { $sum: '$emotions.v' },
          documents: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getKeywordRanking() {
    return NlpResult.aggregate([
      { $unwind: '$stemmed_tokens' },
      {
        $group: {
          _id: '$stemmed_tokens',
          frequency: { $sum: 1 },
          documents: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          word: '$_id',
          frequency: 1,
          documentCount: { $size: '$documents' },
        },
      },
      { $sort: { frequency: -1 } },
      { $limit: 100 },
    ]);
  }
}

module.exports = new ChatbotNlpRepository();

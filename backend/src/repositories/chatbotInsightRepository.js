const SessionSummary = require('../models/sugi_insights/SessionSummary');
const NlpResult = require('../models/sugi_insights/NlpResult');

class ChatbotInsightRepository {
  async getKPIs(filters) {
    const match = this._buildMatch(filters);

    const [totalSesi, totalRingkasan, totalKarakter, avgPanjang, hariAktif, jamAktif,
      topikUnik, komoditasUnik, lokasiUnik, entitasUnik] = await Promise.all([
      SessionSummary.distinct('session_id', match).then(ids => ids.length),
      SessionSummary.countDocuments(match),
      SessionSummary.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$char_count' } } },
      ]).then(r => r[0]?.total || 0),
      SessionSummary.aggregate([
        { $match: match },
        { $group: { _id: null, avg: { $avg: '$char_count' } } },
      ]).then(r => Math.round(r[0]?.avg || 0)),
      SessionSummary.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dayOfWeek: '$pushed_at' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]).then(r => r[0]?._id || null),
      SessionSummary.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $hour: '$pushed_at' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]).then(r => r[0]?._id || null),
      NlpResult.distinct('entity_types').then(types => types.filter(Boolean).length),
      NlpResult.aggregate([
        { $unwind: '$commodities' },
        { $group: { _id: '$commodities.value' } },
        { $count: 'count' },
      ]).then(r => r[0]?.count || 0),
      NlpResult.aggregate([
        { $unwind: '$locations' },
        { $group: { _id: '$locations.value' } },
        { $count: 'count' },
      ]).then(r => r[0]?.count || 0),
      NlpResult.aggregate([
        { $unwind: '$entities' },
        { $group: { _id: { value: '$entities.value', type: '$entities.type' } } },
        { $count: 'count' },
      ]).then(r => r[0]?.count || 0),
    ]);

    return { totalSesi, totalRingkasan, totalKarakter, avgPanjang, hariAktif, jamAktif,
      topikUnik, komoditasUnik, lokasiUnik, entitasUnik };
  }

  async getFilterOptions() {
    const [sessions, topics, commodities, locations, intents, entityTypes] = await Promise.all([
      SessionSummary.distinct('session_id').then(ids => ids.filter(Boolean)),
      SessionSummary.distinct('category').then(c => c.filter(Boolean)),
      Promise.resolve([]),
      Promise.resolve([]),
      Promise.resolve([]),
      Promise.resolve([]),
    ]);

    return {
      sessions: sessions.sort(),
      topics,
      commodities,
      locations,
      intents,
      entityTypes,
    };
  }

  _buildMatch(filters) {
    const match = {};
    if (!filters) return match;

    if (filters.startDate || filters.endDate) {
      match.pushed_at = {};
      if (filters.startDate) match.pushed_at.$gte = new Date(filters.startDate);
      if (filters.endDate) match.pushed_at.$lte = new Date(filters.endDate);
    }

    if (filters.session_id) {
      match.session_id = filters.session_id;
    }

    if (filters.keyword) {
      match.summary = { $regex: filters.keyword, $options: 'i' };
    }

    if (filters.category) {
      match.category = filters.category;
    }

    if (filters.minChar !== undefined || filters.maxChar !== undefined) {
      match.char_count = {};
      if (filters.minChar !== undefined) match.char_count.$gte = Number(filters.minChar);
      if (filters.maxChar !== undefined) match.char_count.$lte = Number(filters.maxChar);
    }

    return match;
  }
}

module.exports = new ChatbotInsightRepository();

class TrendAnalyzer {
  analyzeTrends(documents) {
    if (!documents || documents.length === 0) {
      return { topicTrends: [], commodityTrends: [], entityTrends: [], intentTrends: [], recommendationTrends: [], problemTrends: [], overall: null };
    }

    const grouped = {};
    documents.forEach(doc => {
      if (!doc.pushed_at) return;
      const date = new Date(doc.pushed_at).toISOString().slice(0, 10);
      if (!grouped[date]) grouped[date] = { docs: [], count: 0 };
      grouped[date].docs.push(doc);
      grouped[date].count++;
    });

    const sortedDates = Object.keys(grouped).sort();
    const allEntities = [];
    const allIntents = [];

    documents.forEach(doc => {
      if (doc.entities) doc.entities.forEach(e => { allEntities.push({ ...e, date: doc.pushed_at ? new Date(doc.pushed_at).toISOString().slice(0, 10) : '' }); });
      if (doc.intent) allIntents.push({ intent: doc.intent, date: doc.pushed_at ? new Date(doc.pushed_at).toISOString().slice(0, 10) : '' });
    });

    return {
      topicTrends: this._computeFieldTrend(sortedDates, grouped, 'topic'),
      commodityTrends: this._computeEntityTrend(sortedDates, documents, 'Komoditas'),
      entityTrends: this._computeEntityTypeTrend(sortedDates, grouped),
      intentTrends: this._computeFieldTrend(sortedDates, grouped, 'intent'),
      recommendationTrends: this._computeSimpleTrend(sortedDates, grouped, 'recommendation'),
      problemTrends: this._computeSimpleTrend(sortedDates, grouped, 'problem'),
      overall: {
        total: documents.length,
        dateRange: sortedDates.length > 0 ? { start: sortedDates[0], end: sortedDates[sortedDates.length - 1] } : null,
        growth: this._computeGrowth(sortedDates, grouped),
      },
    };
  }

  _computeFieldTrend(sortedDates, grouped, field) {
    return sortedDates.map(date => {
      const items = grouped[date]?.docs || [];
      const values = {};
      items.forEach(doc => {
        const val = doc[field] || 'Unknown';
        values[val] = (values[val] || 0) + 1;
      });
      return { date, values, total: items.length };
    });
  }

  _computeEntityTrend(sortedDates, documents, entityType) {
    const dateMap = {};
    documents.forEach(doc => {
      if (!doc.pushed_at) return;
      const date = new Date(doc.pushed_at).toISOString().slice(0, 10);
      if (!dateMap[date]) dateMap[date] = {};
      if (doc.entities) {
        doc.entities.forEach(e => {
          if (e.type === entityType) {
            dateMap[date][e.value] = (dateMap[date][e.value] || 0) + 1;
          }
        });
      }
    });
    return sortedDates.map(date => ({ date, values: dateMap[date] || {}, total: 0 }));
  }

  _computeEntityTypeTrend(sortedDates, grouped) {
    return sortedDates.map(date => {
      const types = {};
      const docs = grouped[date]?.docs || [];
      docs.forEach(doc => {
        if (doc.entities) {
          doc.entities.forEach(e => {
            types[e.type] = (types[e.type] || 0) + 1;
          });
        }
      });
      return { date, values: types, total: docs.length };
    });
  }

  _computeSimpleTrend(sortedDates, grouped, type) {
    return sortedDates.map(date => {
      const docs = grouped[date]?.docs || [];
      const count = docs.filter(d => d[type]).length;
      return { date, count, values: { [type]: count } };
    });
  }

  _computeGrowth(sortedDates, grouped) {
    if (sortedDates.length < 2) return null;
    const first = grouped[sortedDates[0]]?.count || 0;
    const last = grouped[sortedDates[sortedDates.length - 1]]?.count || 0;
    const midIdx = Math.floor(sortedDates.length / 2);
    const firstHalf = sortedDates.slice(0, midIdx).reduce((s, d) => s + (grouped[d]?.count || 0), 0);
    const secondHalf = sortedDates.slice(midIdx).reduce((s, d) => s + (grouped[d]?.count || 0), 0);
    return {
      absoluteChange: last - first,
      percentChange: first > 0 ? Math.round((last - first) / first * 100) : 0,
      firstHalfTotal: firstHalf,
      secondHalfTotal: secondHalf,
      direction: secondHalf > firstHalf ? 'meningkat' : secondHalf < firstHalf ? 'menurun' : 'stabil',
    };
  }
}

module.exports = new TrendAnalyzer();

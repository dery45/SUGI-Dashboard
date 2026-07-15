class InsightEngine {
  generateIntelligently(kpiData, activityData, topicData, commodityData, locationData, intentData, trendData, coverageData) {
    const insights = [];

    insights.push(this._kpiInsight(kpiData));
    insights.push(this._activityInsight(activityData));
    insights.push(this._topicInsight(topicData));
    insights.push(this._commodityInsight(commodityData));
    insights.push(this._locationInsight(locationData));
    insights.push(this._intentInsight(intentData));
    insights.push(this._trendInsight(trendData));
    insights.push(this._coverageInsight(coverageData));
    insights.push(this._sentimentInsight(intentData));
    insights.push(this._comparisonInsight(trendData));
    insights.push(this._relationshipInsight(commodityData));

    return insights.filter(Boolean).slice(0, 8);
  }

  _kpiInsight(kpi) {
    if (!kpi) return null;
    const total = kpi.totalSesi?.current || 0;
    const avg = kpi.avgPanjang?.current || 0;
    if (total === 0) return { text: 'Belum ada data sesi chatbot yang tersedia untuk dianalisis.', type: 'info' };
    return { text: `Terdapat ${total} sesi percakapan dengan rata-rata panjang ringkasan ${avg} karakter.`, type: 'metric' };
  }

  _activityInsight(activity) {
    if (!activity) return null;
    const { sessionsPerHour, sessionsPerDay, averageSummaryLength } = activity;
    const maxHour = (sessionsPerHour || []).reduce((best, h) => h.count > (best?.count || 0) ? h : best, null);
    const maxDay = (sessionsPerDay || []).reduce((best, d) => d.count > (best?.count || 0) ? d : best, null);
    const parts = [];
    if (maxHour) parts.push(`Jam paling aktif adalah pukul ${maxHour.hour}:00 dengan ${maxHour.count} sesi`);
    if (maxDay) parts.push(`Hari ${maxDay.date} menjadi puncak aktivitas dengan ${maxDay.count} sesi`);
    if (averageSummaryLength) parts.push(`Rata-rata panjang ringkasan mencapai ${averageSummaryLength} karakter`);
    if (parts.length === 0) return null;
    return { text: parts.join('. ') + '.', type: 'activity' };
  }

  _topicInsight(topic) {
    if (!topic) return null;
    const dist = topic.topicDistribution || [];
    if (dist.length === 0) return null;
    const top = dist.reduce((best, t) => t.count > (best?.count || 0) ? t : best, null);
    const total = dist.reduce((s, t) => s + t.count, 0);
    const pct = top && total > 0 ? Math.round(top.count / total * 100) : 0;
    return { text: `Topik "${top?.label || 'utama'}" mendominasi dengan ${pct}% dari seluruh pembahasan.`, type: 'topic' };
  }

  _commodityInsight(commodity) {
    if (!commodity) return null;
    const c = commodity.commodities || [];
    if (c.length === 0) return null;
    const top = c[0];
    return { text: `Komoditas yang paling banyak dibahas adalah ${top.value} dengan ${top.count} sebutan.`, type: 'commodity' };
  }

  _locationInsight(location) {
    if (!location) return null;
    const locs = location.locations || [];
    if (locs.length === 0) return null;
    const top = locs[0];
    return { text: `Lokasi yang paling sering disebut adalah ${top.value} (${top.count} sebutan).`, type: 'location' };
  }

  _intentInsight(intent) {
    if (!intent) return null;
    const dist = intent.intentDistribution || [];
    if (dist.length === 0) return null;
    const top = dist.reduce((best, i) => i.count > (best?.count || 0) ? i : best, null);
    const total = dist.reduce((s, i) => s + i.count, 0);
    const pct = top && total > 0 ? Math.round(top.count / total * 100) : 0;
    return { text: `Intent "${top?._id || 'Informasi'}" mendominasi dengan ${pct}% dari total ${total} percakapan.`, type: 'intent' };
  }

  _trendInsight(trend) {
    if (!trend?.overall?.growth) return null;
    const g = trend.overall.growth;
    const dir = g.direction === 'meningkat' ? 'meningkat' : g.direction === 'menurun' ? 'menurun' : 'stabil';
    if (g.direction === 'stabil') return { text: `Aktivitas percakapan cenderung stabil dalam periode yang dianalisis.`, type: 'trend' };
    const pct = Math.abs(g.percentChange);
    return { text: `Aktivitas percakapan ${dir} ${pct}%${g.direction === 'meningkat' ? ' dibanding periode sebelumnya' : ''}.`, type: 'trend' };
  }

  _coverageInsight(coverage) {
    if (!coverage) return null;
    const overall = Math.round((coverage.overall || 0) * 100);
    return { text: `Skor coverage analitik mencapai ${overall}%, menunjukkan kualitas data yang ${overall > 70 ? 'baik' : overall > 40 ? 'cukup' : 'perlu ditingkatkan'}.`, type: 'metric' };
  }

  _sentimentInsight(intent) {
    const sentDist = intent?.sentimentDistribution || [];
    if (sentDist.length === 0) return null;
    const total = sentDist.reduce((s, i) => s + i.count, 0);
    const pos = sentDist.find(s => s._id === 'Positive');
    const neg = sentDist.find(s => s._id === 'Negative');
    const posPct = pos && total > 0 ? Math.round(pos.count / total * 100) : 0;
    const negPct = neg && total > 0 ? Math.round(neg.count / total * 100) : 0;
    if (posPct > negPct) {
      return { text: `Sentimen positif mendominasi dengan ${posPct}%, menunjukkan respons yang baik terhadap layanan chatbot.`, type: 'sentiment' };
    } else if (negPct > posPct) {
      return { text: `Sentimen negatif mencapai ${negPct}%, perlu perhatian lebih pada kualitas layanan.`, type: 'warning' };
    }
    return null;
  }

  _comparisonInsight(trend) {
    const commodityTrend = trend?.commodityTrends || [];
    if (commodityTrend.length < 2) return null;
    const first = commodityTrend[0]?.values || {};
    const last = commodityTrend[commodityTrend.length - 1]?.values || {};
    const changes = Object.entries(last).map(([k, v]) => {
      const prev = first[k] || 0;
      return { key: k, change: prev > 0 ? Math.round((v - prev) / prev * 100) : 100 };
    }).filter(c => Math.abs(c.change) > 20).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 3);
    if (changes.length === 0) return null;
    return {
      text: `Perubahan signifikan pada komoditas: ${changes.map(c => `${c.key} ${c.change > 0 ? 'naik' : 'turun'} ${Math.abs(c.change)}%`).join(', ')}.`,
      type: 'comparison',
    };
  }

  _relationshipInsight(commodity) {
    // Placeholder - actual relation analysis requires more compute
    return null;
  }
}

module.exports = new InsightEngine();

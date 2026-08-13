const natural = require('natural');
const preprocessor = require('./preprocessor');

class SemanticSearch {
  constructor() {
    this.index = null;
    this.documents = [];
  }

  buildIndex(nlpResults) {
    this.documents = nlpResults.map(r => ({
      id: r.insight_id,
      session_id: r.session_id,
      text: r.original_text || '',
      tokens: r.stemmed_tokens || [],
      entities: r.entities || [],
      intent: r.intent,
      sentiment: r.sentiment,
      category: r.category,
      pushed_at: r.pushed_at,
    }));

    this.index = new natural.TfIdf();
    this.documents.forEach((doc, i) => {
      if (doc.text) this.index.addDocument(doc.text, i);
    });
  }

  search(query, options = {}) {
    if (!this.index || this.documents.length === 0) return [];

    const { limit = 20, type, intent, category, minScore = 0.05 } = options;
    const processed = preprocessor.process(query);
    const results = [];

    const tfidfResults = [];
    this.index.tfidfs(query, (i, measure) => {
      tfidfResults.push({ index: i, score: measure });
    });
    tfidfResults.sort((a, b) => b.score - a.score);

    for (const r of tfidfResults) {
      if (r.score < minScore) break;
      const doc = this.documents[r.index];
      if (!doc) continue;

      if (type && !doc.entities.some(e => e.type === type)) continue;
      if (intent && doc.intent !== intent) continue;
      if (category && doc.category !== category) continue;

      const entityMatches = doc.entities
        .filter(e => query.toLowerCase().includes(e.value.toLowerCase()))
        .map(e => e.value);

      results.push({
        ...doc,
        score: r.score,
        entityMatches,
        snippet: this._snippet(doc.text, query, 150),
      });
    }

    if (results.length < 5 && options.fallback !== false) {
      const queryTokens = new Set(processed.stemmed);
      const tokenResults = this.documents
        .map((doc, i) => {
          const matches = (doc.tokens || []).filter(t => queryTokens.has(t)).length;
          const total = Math.max(doc.tokens?.length || 1, 1);
          return { ...doc, index: i, score: matches / total, snippet: this._snippet(doc.text, query, 150) };
        })
        .filter(r => r.score > 0 && !results.some(ex => ex.id === r.id))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit - results.length);
      results.push(...tokenResults);
    }

    return results.slice(0, limit);
  }

  searchByEntity(entityValue, options = {}) {
    const { limit = 20 } = options;
    const results = [];
    for (const doc of this.documents) {
      const matches = doc.entities.filter(e =>
        e.value.toLowerCase().includes(entityValue.toLowerCase())
      );
      if (matches.length > 0) {
        results.push({
          ...doc,
          matchedEntities: matches,
          matchCount: matches.length,
          snippet: this._snippet(doc.text, entityValue, 150),
        });
      }
      if (results.length >= limit * 2) break;
    }
    return results.sort((a, b) => b.matchCount - a.matchCount).slice(0, limit);
  }

  searchByIntent(intent, options = {}) {
    const { limit = 20 } = options;
    return this.documents
      .filter(d => d.intent === intent)
      .slice(0, limit)
      .map(d => ({ ...d, snippet: this._snippet(d.text, '', 200) }));
  }

  searchByCategory(category, options = {}) {
    const { limit = 20 } = options;
    return this.documents
      .filter(d => d.category === category)
      .slice(0, limit)
      .map(d => ({ ...d, snippet: this._snippet(d.text, '', 200) }));
  }

  _snippet(text, query, maxLen) {
    if (!text) return '';
    const idx = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
    if (idx >= 0) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(text.length, idx + query.length + 60);
      let snippet = text.slice(start, end);
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet += '...';
      return snippet;
    }
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  }
}

module.exports = new SemanticSearch();

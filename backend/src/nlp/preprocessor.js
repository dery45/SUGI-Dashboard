const stemmer = require('./stemmer');
const stopwords = require('./stopwords');

class Preprocessor {
  clean(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .replace(/<[^>]*>/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  tokenize(text) {
    if (!text) return [];
    return text.split(/\s+/).filter(t => t.length > 1);
  }

  removeStopwords(tokens) {
    return tokens.filter(t => !stopwords.has(t));
  }

  stemTokens(tokens) {
    return tokens.map(t => stemmer.stem(t));
  }

  process(text) {
    const cleaned = this.clean(text);
    const tokens = this.tokenize(cleaned);
    const filtered = this.removeStopwords(tokens);
    const stemmed = this.stemTokens(filtered);
    return {
      original: text,
      cleaned,
      tokens,
      filtered,
      stemmed,
      words: stemmed,
    };
  }
}

module.exports = new Preprocessor();

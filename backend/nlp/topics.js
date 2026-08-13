const natural = require('natural');
const TfIdf = natural.TfIdf;
const preprocessor = require('./preprocessor');

class TopicModeler {
  computeTFIDF(documents) {
    const tfidf = new TfIdf();
    documents.forEach((doc, i) => {
      if (doc && doc.trim()) tfidf.addDocument(doc);
    });

    const terms = tfidf.listTerms(0);
    const allTerms = [];
    const termSet = new Set();

    for (let i = 0; i < documents.length; i++) {
      if (!documents[i] || !documents[i].trim()) continue;
      tfidf.addDocument(documents[i]);
    }

    tfidf.documents.forEach((doc, docIndex) => {
      if (!documents[docIndex] || !documents[docIndex].trim()) return;
      const localTerms = tfidf.listTerms(docIndex).slice(0, 20);
      localTerms.forEach(t => termSet.add(t.term));
    });

    const termArray = Array.from(termSet);
    const tfidfMatrix = [];
    const documentVectors = [];

    for (let di = 0; di < documents.length; di++) {
      if (!documents[di] || !documents[di].trim()) {
        documentVectors.push([]);
        continue;
      }
      const docTerms = new Map();
      tfidf.listTerms(di).forEach(t => docTerms.set(t.term, t.tfidf));
      const vector = termArray.map(t => docTerms.get(t) || 0);
      tfidfMatrix.push(vector);
      documentVectors.push(Array.from(docTerms.entries()));
    }

    const overall = termArray.map(term => {
      let totalTfidf = 0;
      let docCount = 0;
      for (let di = 0; di < documents.length; di++) {
        if (!documents[di] || !documents[di].trim()) continue;
        const terms = tfidf.listTerms(di);
        const found = terms.find(t => t.term === term);
        if (found) { totalTfidf += found.tfidf; docCount++; }
      }
      return { term, score: totalTfidf, docCount };
    }).sort((a, b) => b.score - a.score);

    return {
      overallRanking: overall.slice(0, 50),
      documentVectors,
      matrix: tfidfMatrix,
      vocabulary: termArray,
    };
  }

  computeLDA(documents, numTopics = 5, numWordsPerTopic = 10) {
    const processed = documents.map(doc => {
      const p = preprocessor.process(doc || '');
      return p.stemmed;
    }).filter(tokens => tokens.length > 0);

    const vocab = new Map();
    let termId = 0;
    const docWordCounts = [];

    processed.forEach(tokens => {
      const counts = new Map();
      tokens.forEach(t => {
        if (!vocab.has(t)) vocab.set(t, termId++);
        const id = vocab.get(t);
        counts.set(id, (counts.get(id) || 0) + 1);
      });
      docWordCounts.push(counts);
    });

    const V = vocab.size;
    const D = docWordCounts.length;
    const K = Math.min(numTopics, D);

    const alpha = 0.1;
    const beta = 0.01;

    const docTopics = docWordCounts.map(() => new Map());
    const topicWordCounts = Array.from({ length: K }, () => new Map());
    const topicTotals = new Array(K).fill(0);
    const docTopicTotals = new Array(D).fill(0);

    for (let d = 0; d < D; d++) {
      for (const [w, count] of docWordCounts[d]) {
        const t = d % K;
        docTopics[d].set(w, t);
        topicWordCounts[t].set(w, (topicWordCounts[t].get(w) || 0) + count);
        topicTotals[t] += count;
        docTopicTotals[d] += count;
      }
    }

    for (let iter = 0; iter < 100; iter++) {
      for (let d = 0; d < D; d++) {
        for (const [w, count] of docWordCounts[d]) {
          const oldTopic = docTopics[d].get(w);
          topicWordCounts[oldTopic].set(w, topicWordCounts[oldTopic].get(w) - count);
          topicTotals[oldTopic] -= count;

          const probs = [];
          for (let k = 0; k < K; k++) {
            const topicWordProb = ((topicWordCounts[k].get(w) || 0) + beta) / (topicTotals[k] + V * beta);
            const docTopicProb = ((docTopics[d].get(k) || 0) + alpha) / (docTopicTotals[d] + K * alpha);
            probs.push(topicWordProb * docTopicProb);
          }

          const sum = probs.reduce((a, b) => a + b, 0);
          let r = Math.random() * sum;
          let newTopic = K - 1;
          for (let k = 0; k < K; k++) {
            r -= probs[k];
            if (r <= 0) { newTopic = k; break; }
          }

          docTopics[d].set(w, newTopic);
          topicWordCounts[newTopic].set(w, (topicWordCounts[newTopic].get(w) || 0) + count);
          topicTotals[newTopic] += count;
        }
      }
    }

    const topics = [];
    for (let k = 0; k < K; k++) {
      const words = Array.from(topicWordCounts[k].entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, numWordsPerTopic)
        .map(([w, c]) => ({
          word: Array.from(vocab.entries()).find(e => e[1] === w)[0],
          count: c,
          probability: c / topicTotals[k],
        }));

      const total = Array.from(topicWordCounts[k].values()).reduce((a, b) => a + b, 0);
      const docAssignments = [];
      for (let d = 0; d < D; d++) {
        const docDominantTopic = this._getDominantTopic(docTopics[d], K);
        if (docDominantTopic === k) docAssignments.push(d);
      }

      topics.push({
        topicId: k + 1,
        label: `Topik ${k + 1}`,
        words,
        totalWeight: total,
        documentCount: docAssignments.length,
        documentIndices: docAssignments,
      });
    }

    return {
      topics,
      numDocuments: D,
      numTopics: K,
      vocabularySize: V,
      model: { alpha, beta, iterations: 100 },
    };
  }

  _getDominantTopic(docTopicMap, K) {
    const counts = new Array(K).fill(0);
    for (const [, topic] of docTopicMap) counts[topic]++;
    let maxC = 0, maxT = 0;
    counts.forEach((c, t) => { if (c > maxC) { maxC = c; maxT = t; } });
    return maxT;
  }

  computeBigrams(documents) {
    const bigrams = new Map();
    documents.forEach(doc => {
      const p = preprocessor.process(doc || '');
      const tokens = p.stemmed;
      for (let i = 0; i < tokens.length - 1; i++) {
        const bg = `${tokens[i]}_${tokens[i + 1]}`;
        bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
      }
    });
    return Array.from(bigrams.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([bigram, count]) => ({ bigram, count }));
  }

  computeTrigrams(documents) {
    const trigrams = new Map();
    documents.forEach(doc => {
      const p = preprocessor.process(doc || '');
      const tokens = p.stemmed;
      for (let i = 0; i < tokens.length - 2; i++) {
        const tg = `${tokens[i]}_${tokens[i + 1]}_${tokens[i + 2]}`;
        trigrams.set(tg, (trigrams.get(tg) || 0) + 1);
      }
    });
    return Array.from(trigrams.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([trigram, count]) => ({ trigram, count }));
  }

  computeCooccurrence(documents, windowSize = 5) {
    const cooc = new Map();
    const termFreq = new Map();

    documents.forEach(doc => {
      const p = preprocessor.process(doc || '');
      const tokens = p.stemmed;
      const unique = [...new Set(tokens)];
      unique.forEach(t => termFreq.set(t, (termFreq.get(t) || 0) + 1));

      for (let i = 0; i < tokens.length; i++) {
        const start = Math.max(0, i - windowSize);
        const end = Math.min(tokens.length - 1, i + windowSize);
        for (let j = start; j <= end; j++) {
          if (i === j) continue;
          const pair = [tokens[i], tokens[j]].sort().join('|');
          cooc.set(pair, (cooc.get(pair) || 0) + 1);
        }
      }
    });

    return Array.from(cooc.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([pair, count]) => {
        const [w1, w2] = pair.split('|');
        return { word1: w1, word2: w2, count };
      });
  }

  computeSimilarity(documents) {
    const processed = documents.map(doc => {
      const p = preprocessor.process(doc || '');
      return p.stemmed;
    });

    const vocab = [...new Set(processed.flat())];
    const vectors = processed.map(tokens => {
      return vocab.map(v => tokens.filter(t => t === v).length);
    });

    const similarityMatrix = [];
    for (let i = 0; i < vectors.length; i++) {
      similarityMatrix[i] = [];
      for (let j = 0; j < vectors.length; j++) {
        similarityMatrix[i][j] = this._cosineSimilarity(vectors[i], vectors[j]);
      }
    }
    return similarityMatrix;
  }

  _cosineSimilarity(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }
}

module.exports = new TopicModeler();

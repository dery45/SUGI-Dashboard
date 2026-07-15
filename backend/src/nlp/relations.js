const RELATION_PATTERNS = [
  { sourceType: 'Komoditas', targetType: 'Lokasi', pattern: /(\w+)\s+(?:di|dari|ke|pada)\s+(\w+)/gi, label: 'Lokasi' },
  { sourceType: 'Komoditas', targetType: 'Kondisi', pattern: /(\w+)\s+(?:pada suhu|suhu|temperature)\s+(\d+)/gi, label: 'Kondisi' },
  { sourceType: 'Penyakit/Hama', targetType: 'Komoditas', pattern: /(\w+)\s+(?:menyerang|pada|di)\s+(\w+)/gi, label: 'Menyerang' },
  { sourceType: 'Pupuk/Pestisida', targetType: 'Komoditas', pattern: /(\w+)\s+(?:untuk|pada|diaplikasikan ke|digunakan pada)\s+(\w+)/gi, label: 'Digunakan Pada' },
  { sourceType: 'Komoditas', targetType: 'Penyakit/Hama', pattern: /(\w+)\s+(?:terserang|dihinggapi|terkena|terinfeksi)\s+(\w+)/gi, label: 'Terserang' },
  { sourceType: 'Lokasi', targetType: 'Komoditas', pattern: /(?:di|dari|ke)\s+(\w+)\s+(\w+)\s+(?:merupakan|adalah|menjadi)/gi, label: 'Menghasilkan' },
  { sourceType: 'Komoditas', targetType: 'Organisasi', pattern: /(\w+)\s+(?:dikelola|dibina|dibantu)\s+(?:oleh\s+)?(\w+)/gi, label: 'Dikelola Oleh' },
  { sourceType: 'Cuaca', targetType: 'Komoditas', pattern: /(\w+)\s+(?:cocok|baik|sesuai)\s+(?:untuk|bagi)\s+(\w+)/gi, label: 'Cocok Untuk' },
];

const KNOWN_ENTITIES = ['beras','jagung','kedelai','cabai','bawang','tomat','kentang',
  'padi','tebu','kopi','karet','kelapa','sawit','coklat','lada','pala','cengkeh',
  'jahe','kunyit','singkong','ubi','kacang','sorgum','gandum','anggur','apel',
  'mangga','jeruk','pisang','pepaya','semangka','melon','rambutan','durian',
  'sapi','kambing','ayam','itik','lele','nila','mas','gurame','udang',
  'pupuk','urea','npk','pestisida','insektisida','fungisida','herbisida',
  'wereng','ulat','tikus','hama','penyakit','virus','bakteri','jamur',
  'suhu','cuaca','hujan','kemarau','irigasi','greenhouse','mulsa',
  'jakarta','bandung','surabaya','medan','semarang','yogyakarta','solo',
  'malang','denpasar','makassar','palembang','pekanbaru','padang',
  'jawa','sumatera','kalimantan','sulawesi','papua','bali',
];

class RelationExtractor {
  extract(sentences, entities) {
    const relations = [];
    const entitySet = new Set(entities.map(e => e.value.toLowerCase()));

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();

      for (const rp of RELATION_PATTERNS) {
        let match;
        while ((match = rp.pattern.exec(lower)) !== null) {
          const source = this._normalize(match[1]);
          const target = this._normalize(match[2]);
          if (entitySet.has(source) || KNOWN_ENTITIES.includes(source)) {
            relations.push({ source, target, label: rp.label, sourceType: rp.sourceType, targetType: rp.targetType, sentence });
          }
        }
      }

      const words = lower.split(/\s+/);
      for (let i = 0; i < words.length - 2; i++) {
        const w = words.slice(i, i + 3);
        if (entitySet.has(w[0]) && (w[1] === 'dan' || w[1] === ',')) {
          if (entitySet.has(w[2])) {
            relations.push({ source: w[0], target: w[2], label: 'Bersama', sourceType: 'Entity', targetType: 'Entity', sentence });
          }
        }
      }

      const coocEntities = [];
      for (const ent of entitySet) {
        if (lower.includes(ent)) coocEntities.push(ent);
      }
      for (let i = 0; i < coocEntities.length; i++) {
        for (let j = i + 1; j < coocEntities.length; j++) {
          const posI = lower.indexOf(coocEntities[i]);
          const posJ = lower.indexOf(coocEntities[j]);
          if (Math.abs(posI - posJ) < 60) {
            relations.push({ source: coocEntities[i], target: coocEntities[j], label: 'Terkait', sourceType: 'Entity', targetType: 'Entity', sentence });
          }
        }
      }
    }

    const unique = new Map();
    for (const r of relations) {
      const key = `${r.source}|${r.label}|${r.target}`;
      if (!unique.has(key)) {
        unique.set(key, { ...r, count: 0, sentences: [] });
      }
      unique.get(key).count++;
      if (unique.get(key).sentences.length < 3) {
        unique.get(key).sentences.push(r.sentence);
      }
    }

    return Array.from(unique.values());
  }

  extractFromText(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const entities = this._extractEntitiesInline(text);
    return this.extract(sentences, entities);
  }

  _normalize(word) {
    return word.toLowerCase().replace(/[^a-z]/g, '');
  }

  _extractEntitiesInline(text) {
    const found = [];
    const lower = text.toLowerCase();
    for (const ent of KNOWN_ENTITIES) {
      if (lower.includes(ent)) found.push({ value: ent, type: 'unknown', source: 'inline' });
    }
    return found;
  }
}

module.exports = new RelationExtractor();

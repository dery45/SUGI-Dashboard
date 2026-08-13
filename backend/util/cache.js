class Cache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.store = new Map();
    this.ttl = ttlMs;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, customTtl) {
    this.store.set(key, {
      value,
      expiry: Date.now() + (customTtl || this.ttl),
    });
  }

  has(key) {
    return this.get(key) !== null;
  }

  invalidate(pattern) {
    if (!pattern) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) this.store.delete(key);
    }
  }

  memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
    const cache = this;
    return async function (...args) {
      const key = keyFn(...args);
      const cached = cache.get(key);
      if (cached !== null) return cached;
      const result = await fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }
}

const globalCache = new Cache();

module.exports = globalCache;
module.exports.Cache = Cache;
module.exports.globalCache = globalCache;

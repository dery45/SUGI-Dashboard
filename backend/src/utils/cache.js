const store = new Map();

exports.get = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

exports.set = (key, value, ttlMs = 300000) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

exports.del = (key) => {
  store.delete(key);
};

exports.flush = () => store.clear();

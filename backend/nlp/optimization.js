class WorkerQueue {
  constructor(concurrency = 1) {
    this.queue = [];
    this.running = 0;
    this.concurrency = concurrency;
    this.handlers = new Map();
  }

  register(name, handler) {
    this.handlers.set(name, handler);
  }

  enqueue(name, payload) {
    return new Promise((resolve, reject) => {
      this.queue.push({ name, payload, resolve, reject });
      this._processNext();
    });
  }

  async _processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;
    this.running++;
    const job = this.queue.shift();
    try {
      const handler = this.handlers.get(job.name);
      if (!handler) throw new Error(`No handler for job: ${job.name}`);
      const result = await handler(job.payload);
      job.resolve(result);
    } catch (e) {
      job.reject(e);
    } finally {
      this.running--;
      this._processNext();
    }
  }

  get queueLength() {
    return this.queue.length;
  }
  get isBusy() {
    return this.running >= this.concurrency;
  }
}

class Memoizer {
  constructor() {
    this.cache = new Map();
  }

  wrap(fn, keyFn = (...args) => JSON.stringify(args)) {
    const memo = this;
    return async function (...args) {
      const key = keyFn(...args);
      if (memo.cache.has(key)) return memo.cache.get(key);
      const result = await fn.apply(this, args);
      memo.cache.set(key, result);
      return result;
    };
  }

  clear() {
    this.cache.clear();
  }
}

const workerQueue = new WorkerQueue(2);
const globalMemoizer = new Memoizer();

module.exports = { WorkerQueue, Memoizer, workerQueue, globalMemoizer };

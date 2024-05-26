import { Queue } from "./queue.mjs";

/**
 * @tempalte T
 */
export class Throttler {
  /** @type {Queue<T>} */
  #queue;
  #timer = null;
  #firstRun = true;

  /**
   * Initializes the rate limiter with optional configurations.
   * @param {number} [timeout=1000] - Interval in milliseconds between task executions.
   * @param {number} [batchSize=5] - Number of tasks processed per interval.
   */
  constructor({ timeout = 1000, batchSize = 5 } = {}) {
    this.timeout = timeout;
    this.batchSize = batchSize;
    this.#queue = new Queue();
  }

  /**
   * Schedules a function for rate-limited execution.
   * @template T - The function type.
   * @param {T} func - The function to be executed.
   * @param {...any} args - Arguments for the function.
   * @returns {Promise<Awaited<ReturnType<T>>>} Promise that resolves with the function's result.
   */
  schedule(func, ...args) {
    this.#initializeTimer();
    return new Promise((resolve, reject) => {
      this.#queue.push(async () => {
        try {
          resolve(await func(...args));
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  #initializeTimer() {
    // Process tasks immediately in first batch
    if (this.#firstRun) {
      this.#firstRun = false;
      process.nextTick(() => this.#processTasks());
    }

    if (!this.#timer) {
      this.#timer = setInterval(() => this.#processTasks(), this.timeout);
    }
  }

  async #processTasks() {
    const currentBatch = this.#queue.batch(this.batchSize);

    for (const executeTask of currentBatch) {
      await executeTask();
    }

    if (this.#queue.length === 0) {
      clearInterval(this.#timer);
      this.#timer = null;
      this.#firstRun = true; 
    }
  }
}

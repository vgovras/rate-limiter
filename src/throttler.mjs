export class Throttler {
  #taskQueue = [];
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
      this.#taskQueue.push(async () => {
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
    const currentBatch = this.#taskQueue.splice(0, this.batchSize)

    for (const executeTask of currentBatch) {
      await executeTask();
    }

    if (this.#taskQueue.length === 0) {
      clearInterval(this.#timer);
      this.#timer = null;
      this.#firstRun = true; 
    }
  }
}

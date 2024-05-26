/**
 * @template T
 */
export class Queue {
  #storage;
  #ttl;

  /**
   * @param {import('./queue.interfaces').Storage<import('./queue.interfaces').QueueItem<T>> | Array<QueueItem<T>>} storage
   * @param {number} [ttl]
   */
  constructor(storage = [], ttl) {
    this.#ttl = ttl;
    this.#storage = Array.isArray(storage) ? storage.map(v => this.#createItem(v)) : storage;
  }

  /**
   * @param {...T} values
   */
  async push(...values) {
    return this.#storage.push(
      ...values.map((value) => this.#createItem(value))
    );
  }

  /**
   * @param {number} skip 
   * @param {number} limit 
   * @param {T[]} [acc] 
   * @returns {Promise<T[]>} 
   */
  async splice(skip, limit, acc) {
    let elements = await this.#storage.splice(skip, limit);
    
    elements = elements
      .filter(e => !this.#ttl || e.expareIn > Date.now())
      .map(e => e.value);

    if (Array.isArray(acc)) {
      return [...elements, ...acc];
    }

    return this.splice(skip, limit - elements.length, elements);
  }

  /**
   * @template V
   *
   * @param {V} value
   */
  #createItem(value) {
    return {
      value,
      expareIn: this.#ttl && Date.now() + this.#ttl,
    };
  }
}

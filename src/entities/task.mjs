export class Task {
  /**
   * @param {Object} params
   * @param {number} [params.trotler_task_id]
   * @param {string} params.name
   * @param {number} [params.ttl]
   * @param {number} [params.start_in]
   * @param {number} [params.created_in]
   * @param {Function} params.execute
   */
  constructor({ trotler_task_id = null, name = 'default', ttl = null, start_in = 0, created_in = Date.now(), execute }) {
    this.trotler_task_id = trotler_task_id;
    this.name = name;
    this.ttl = ttl;
    this.start_in = start_in;
    this.created_in = created_in;
    this.execute = execute;
  }
}
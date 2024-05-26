import { Task } from "../../entities/task.mjs";

export class MysqlQueueStrategy {
  /** @type {Map<number, Task>} */
  #tasks = new Map();

  /** @type {mysql.Connection} */
  #connection;

  /**
   * @param {mysql.Connection} connection
   */
  constructor(connection) {
    this.#connection = connection;
  }

  /**
   * @param {Omit<Task, 'trotler_task_id'>} task 
   * @returns {Promise<Task>} 
   */
  async createTask(task) {
    const query = `
      INSERT INTO trotler_task (name, ttl, created_in) VALUES (?, ?, ?);
    `;

    const [result] = await this.#connection.query(query, [task.name, task.ttl, task.created_in]);
    const createdTask = new Task({ ...task, trotler_task_id: result.insertId });

    this.#tasks.set(createdTask.trotler_task_id, createdTask);

    return createdTask;
  }

  /**
   * @param {number[]} ids
   * @returns {Promise<void>}
   */
  async executeTasks(ids) {
    const updateQuery = `
      UPDATE trotler_task 
      SET start_in = ?
      WHERE trotler_task_id IN (?)
    `;

    await this.#connection.query(updateQuery, [Date.now(), ids]);

    const tasks = ids.map(id => this.#tasks.get(id));

    await Promise.all(tasks.map(task => task.execute()));
  }

  /**
   * @param {Object} params
   * @param {number} [params.executedAfter]
   * @returns {Promise<Task[]>}
   */
  async listTasks({ executedAfter = 0 } = {}) {
    const readQuery = `
      SELECT * 
      FROM trotler_task
      WHERE start_in >= ?;
    `;

    const [records] = await this.#connection.query(readQuery, [executedAfter]);
    return records
      .map(record => this.#tasks.get(record.trotler_task_id))
      .filter(Boolean);
  }
}

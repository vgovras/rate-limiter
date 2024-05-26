

export class MemoryQueueStrategy {
  /** @type {Map<number, Task>} */
  #tasks = new Map();
  #nextId = 1;

  /**
   * @param {Omit<Task, 'trotler_task_id'>} task 
   * @returns {Promise<Task>} 
   */
  async createTask(task) {
    const createdTask = new Task({ ...task, trotler_task_id: this.#nextId++ });
    this.#tasks.set(createdTask.trotler_task_id, createdTask);
    return createdTask;
  }

  /**
   * @param {number[]} ids
   * @returns {Promise<void>}
   */
  async executeTasks(ids) {
    const now = Date.now();

    for (const id of ids) {
      const task = this.#tasks.get(id);
      if (task) {
        task.start_in = now;
        await task.execute();
      }
    }
  }

  /**
   * @param {Object} params
   * @param {number} [params.executedAfter]
   * @returns {Promise<Task[]>}
   */
  async listTasks({ executedAfter = 0 } = {}) {
    return Array.from(this.#tasks.values())
      .filter(task => task.start_in >= executedAfter);
  }
}

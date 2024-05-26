import { createConnection } from "mysql2/promise";
import { after, before, describe, it } from "node:test";
import assert from "assert";
import { MysqlQueueStrategy, Task } from '../queue/strategies/mysql.strategy.mjs';

describe('mysql.strategy.test', () => {
  /**
   * @type {import("mysql2/promise").Connection}
   */
  let connection;

  /**
   * @type {MysqlQueueStrategy}
   */
  let queue;

  before(async () => {
    connection = await createConnection({
      host: '192.168.3.44',
      database: 'test',
      user: 'root',
      password: 'root',
    });

    // Create the table schema if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trotler_task (
        trotler_task_id SMALLINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(64) DEFAULT 'default',
        ttl BIGINT DEFAULT NULL,
        start_in BIGINT DEFAULT 0,
        created_in BIGINT NOT NULL
      );
    `);

    queue = new MysqlQueueStrategy(connection);
  });

  after(async () => {
    await connection.query('DROP TABLE IF EXISTS trotler_task'); // Clean up the table after tests
    await connection.end();
  });

  it('should create a task', async () => {
    const taskName = 'Test Task';
    const executeMock = () => {
      console.log('Task Executed');
    };

    const createdTask = await queue.createTask(new Task({
      name: taskName,
      execute: executeMock,
    }));

    assert.strictEqual(createdTask.name, taskName, 'Task name should match');
    assert.strictEqual(createdTask.execute, executeMock, 'Task execute function should match');

    const tasks = await queue.listTasks();
    assert.strictEqual(tasks.length, 1, 'There should be one task in the list');
    assert.strictEqual(tasks[0].name, taskName, 'Listed task name should match');

    await queue.executeTasks(tasks.map(t => t.trotler_task_id));
  });

  it('should list tasks', async () => {
    const taskName1 = 'Task 1';
    const taskName2 = 'Task 2';
    const executeMock1 = () => {
      console.log('Task 1 Executed');
    };
    const executeMock2 = () => {
      console.log('Task 2 Executed');
    };

    await queue.createTask(new Task({
      name: taskName1,
      execute: executeMock1,
    }));

    await queue.createTask(new Task({
      name: taskName2,
      execute: executeMock2,
    }));

    let tasks = await queue.listTasks();
    tasks = tasks.filter(t => [taskName1, taskName2].includes(t.name));
    assert.strictEqual(tasks.length, 2, 'There should be two tasks in the list');
    assert.strictEqual(tasks[0].name, taskName1, 'First task name should match');
    assert.strictEqual(tasks[1].name, taskName2, 'Second task name should match');
  });

  it('should execute tasks', async () => {
    const taskName = 'Task to Execute';
    let executionFlag = false;
    const executeMock = () => {
      executionFlag = true;
    };

    const createdTask = await queue.createTask(new Task({
      name: taskName,
      execute: executeMock,
    }));

    await queue.executeTasks([createdTask.trotler_task_id]);
    assert.strictEqual(executionFlag, true, 'Task should be executed');
  });

  it('should return an empty list when no tasks are available', async () => {
    // Clear tasks before test
    await connection.query('DELETE FROM trotler_task');

    const tasks = await queue.listTasks();
    assert.strictEqual(tasks.length, 0, 'There should be no tasks in the list');
  });
});

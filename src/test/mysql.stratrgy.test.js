import { describe, it, before, after, beforeEach } from "node:test";
import { MysqlQueueStrategy } from "./mysql.strategy.js";
import { equal } from "node:assert";
import { createConnection } from "mysql2/promise";

describe("mysql.stratrgy.test", () => {
  /** @type {import("mysql2/promise").Connection} */
  let connection;

  before(async () => {
    connection = await createConnection({
      host: "192.168.3.44",
      database: "test",
      user: "root",
      password: "root",
    });
  });

  after(() => {
    connection.destroy();
  });

  it("should create add item in queue", async () => {
    const queue = new MysqlQueueStrategy(connection);
    const name = `test${Date.now()}`;
    const item = await queue.add({ name });

    equal(item.name, name);
  });

  it("should return added item in queue", async () => {
    const queue = new MysqlQueueStrategy(connection);
    const name = `test${Date.now()}`;
    const item = await queue.add({ name });
    const list = await queue.list();
    console.log(list);

    const inserted = list.find(v => v.name === name);


    equal(inserted.trotler_queue_id, item.trotler_queue_id);
  });
});

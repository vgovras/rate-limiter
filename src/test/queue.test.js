import { describe, it } from "node:test";
import { deepEqual } from "node:assert";
import { setTimeout } from "node:timers/promises";
import { Queue } from "./queue.mjs";

describe("test queue", async () => {
  it("should push item into queue", async () => {
    const queue = new Queue([1, 2, 3, 4, 5, 6]);
    const batch1 = await queue.splice(0, 5);
    const batch2 = await queue.splice(0, 5);

    deepEqual(batch1, [1, 2, 3, 4, 5]);
    deepEqual(batch2, [6]);
  });

  it("should skip expired values", async () => {
    const ttlMs = 10;
    const waitMs = 100;
    const queue = new Queue([1, 2, 3, 4, 5], ttlMs);

    await setTimeout(waitMs);
    queue.push(6);

    const batch = await queue.splice(0, 5);

    deepEqual(batch, [6]);
  });
});

import { beforeEach, describe, it } from "node:test";
import { strictEqual } from "node:assert";

import { Throttler } from './throttler.mjs';

/**
 * @type {Throttler?}
 */
let throttler = null;

beforeEach(() => {
    throttler = new Throttler({ timeoutMs: 1000, chunkSize: 5 });
});

describe('throttler', () => {
    it('should retun fn result', async () => {
        const sum = await throttler.schedule((a, b) => a + b, 2, 2);

        strictEqual(sum, 4);
    });

    it('should process 5 tasks per 1 sec', async () => {
        const now = Date.now();
        const createTask = (id) => () => Promise.resolve({ id, startIn: Date.now() - now });
    
        // Schedule 15 tasks
        const tasks = Array.from({ length: 15 }, (_, index) => throttler.schedule(createTask(index)));
        const results = await Promise.all(tasks);
    
        const timingCounts = results.reduce((acc, curr) => {
            const elapsedSec = Math.floor(curr.startIn / 1000);
            acc[elapsedSec] = (acc[elapsedSec] || 0) + 1;
            return acc;
        }, {});
    
        // Check if 5 tasks were processed in each of the first three seconds
        strictEqual(timingCounts[0], 5);
        strictEqual(timingCounts[1], 5);
        strictEqual(timingCounts[2], 5);
    });
});

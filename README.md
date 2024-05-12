# Throttler Module

```javascript
new Throttler({ timeout = 1000, batchSize = 5 })
```

- `timeout`: Interval in ms between task executions.
- `batchSize`: Number of tasks per interval.

### Method: schedule

```javascript
throttler.schedule(func, ...args)
```

- Schedules a function for rate-limited execution.
- Returns a promise resolving with the function's result.

### Usage Examples

```javascript
import { Throttler } from 'throttler';

const throttler = new Throttler({ timeout: 1000, batchSize: 5 });

// Example 1: Simple function execution
async function testSum() {
  const result = await throttler.schedule((a, b) => a + b, 2, 2);
  console.log(result);  // Output: 4
}
testSum();

// Example 2: Process multiple tasks with timing
async function testMultipleTasks() {
  const now = Date.now();
  const createTask = id => () => Promise.resolve({ id, startIn: Date.now() - now });

  const tasks = Array.from({ length: 15 }, (_, index) => throttler.schedule(createTask(index)));
  const results = await Promise.all(tasks);

  const timingCounts = results.reduce((acc, curr) => {
    const elapsedSec = Math.floor(curr.startIn / 1000);
    acc[elapsedSec] = (acc[elapsedSec] || 0) + 1;
    return acc;
  }, {});

  // Expected: {0: 5, 1: 5, 2: 5} over three seconds
  console.log(timingCounts);
}
```

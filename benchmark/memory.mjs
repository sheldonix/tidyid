import { performance } from 'node:perf_hooks';
import { tidyid } from '../dist/index.js';

if (globalThis.gc === undefined) {
  throw new Error('run this benchmark with --expose-gc');
}

const snapshot = () => {
  globalThis.gc();
  const memory = process.memoryUsage();
  return {
    heapUsed: memory.heapUsed,
    heapTotal: memory.heapTotal,
    rss: memory.rss,
    external: memory.external,
  };
};

const before = snapshot();
let checksum = 0;
const started = performance.now();
for (let index = 0; index < 1_000_000; index += 1) {
  checksum ^= tidyid(8).charCodeAt(0);
}
const millionLength8Milliseconds = Math.round(performance.now() - started);
const hot = snapshot();

for (let round = 0; round < 256; round += 1) {
  for (let length = 3; length <= 256; length += 1) {
    checksum ^= tidyid(length).charCodeAt(0);
  }
}
const mixed = snapshot();

console.log(JSON.stringify({
  runtime: process.version,
  millionLength8Milliseconds,
  checksum,
  before,
  hot,
  mixed,
}, null, 2));

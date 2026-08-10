import { cpus } from 'node:os';
import { performance } from 'node:perf_hooks';
import { nanoid } from 'nanoid';
import { tidyid } from '../dist/index.js';

const LENGTHS = [8, 10, 16, 64];
const WARMUP_CALLS = 100_000;
const SAMPLE_CALLS = 10_000;
const SAMPLE_COUNT = 100;

function percentile(sorted, value) {
  return sorted[Math.ceil(sorted.length * value) - 1];
}

function measure(generate) {
  let checksum = 0;
  for (let call = 0; call < WARMUP_CALLS; call += 1) {
    checksum ^= generate().charCodeAt(0);
  }

  const samples = new Array(SAMPLE_COUNT);
  const started = performance.now();
  for (let sample = 0; sample < SAMPLE_COUNT; sample += 1) {
    const sampleStarted = performance.now();
    for (let call = 0; call < SAMPLE_CALLS; call += 1) {
      checksum ^= generate().charCodeAt(0);
    }
    samples[sample] = performance.now() - sampleStarted;
  }
  const duration = performance.now() - started;
  samples.sort((left, right) => left - right);

  return {
    opsPerSecond: Math.round(
      SAMPLE_CALLS * SAMPLE_COUNT * 1_000 / duration,
    ),
    p50Nanoseconds: Math.round(
      percentile(samples, 0.50) * 1_000_000 / SAMPLE_CALLS,
    ),
    p95Nanoseconds: Math.round(
      percentile(samples, 0.95) * 1_000_000 / SAMPLE_CALLS,
    ),
    p99Nanoseconds: Math.round(
      percentile(samples, 0.99) * 1_000_000 / SAMPLE_CALLS,
    ),
    checksum,
  };
}

console.log(JSON.stringify({
  runtime: process.version,
  platform: `${process.platform}-${process.arch}`,
  cpu: cpus()[0]?.model ?? 'unknown',
  warmupCalls: WARMUP_CALLS,
  measuredCalls: SAMPLE_CALLS * SAMPLE_COUNT,
}, null, 2));

for (const length of LENGTHS) {
  console.log(JSON.stringify({
    length,
    tidyid: measure(() => tidyid(length)),
    nanoid: measure(() => nanoid(length)),
  }, null, 2));
}

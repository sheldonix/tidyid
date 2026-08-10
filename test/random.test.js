import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DIGITS,
  LETTERS,
  LETTERS_WITH_UPPERCASE,
} from '../.build/alphabets.js';
import { fillStructuredId } from '../.build/random.js';

function decode(output) {
  return String.fromCharCode(...output);
}

test('accepted bytes map uniformly to every alphabet character', () => {
  for (const [letters, allowUppercase, expectedCount, rejected] of [
    [LETTERS, false, 11, 14],
    [LETTERS_WITH_UPPERCASE, true, 5, 36],
  ]) {
    const limit = 256 - (256 % letters.length);
    const counts = new Map([...letters].map(character => [character, 0]));
    for (let byte = 0; byte < 256; byte += 1) {
      const output = new Uint8Array(1);
      const written = fillStructuredId(
        output,
        0,
        Uint8Array.of(byte),
        allowUppercase,
      );
      if (byte >= limit) {
        assert.equal(written, 0);
        continue;
      }
      assert.equal(written, 1);
      const character = decode(output);
      counts.set(character, counts.get(character) + 1);
    }
    assert.deepEqual(new Set(counts.values()), new Set([expectedCount]));
    assert.equal(256 - limit, rejected);
  }

  const digitCounts = new Map([...DIGITS].map(character => [character, 0]));
  for (let byte = 0; byte < 256; byte += 1) {
    const output = new Uint8Array(3);
    const written = fillStructuredId(output, 2, Uint8Array.of(byte));
    assert.equal(written, 3);
    const character = String.fromCharCode(output[2]);
    digitCounts.set(character, digitCounts.get(character) + 1);
  }
  assert.deepEqual(new Set(digitCounts.values()), new Set([32]));
});

test('rejection sampling continues with the next random block', () => {
  const output = new Uint8Array(3);
  let written = fillStructuredId(
    output,
    0,
    new Uint8Array(6).fill(255),
  );
  assert.equal(written, 0);

  written = fillStructuredId(output, written, new Uint8Array(6));
  assert.equal(written, output.length);
  assert.equal(decode(output), 'aa2');
});

test('deterministic bytes preserve the LLD structure', () => {
  const output = new Uint8Array(8);
  const written = fillStructuredId(output, 0, new Uint8Array(16));
  assert.equal(written, output.length);
  assert.equal(decode(output), 'aa2aa2aa');
});

test('uppercase sampling uses the combined letter alphabet', () => {
  const output = new Uint8Array(3);
  const written = fillStructuredId(
    output,
    0,
    Uint8Array.of(0, 22, 0),
    true,
  );
  assert.equal(written, output.length);
  assert.equal(decode(output), 'Aa2');
});

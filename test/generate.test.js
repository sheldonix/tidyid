import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_LENGTH,
  DIGITS,
  InvalidIdLengthError,
  LETTERS,
  LETTERS_WITH_UPPERCASE,
  getIdCapacity,
  getIdEntropy,
  isValidId,
  tidyid,
} from '../dist/index.js';

test('generates the required LLD structure at all boundary lengths', () => {
  for (const length of [3, 8, 10, 16, 256]) {
    for (let sample = 0; sample < 25; sample += 1) {
      const id = tidyid(length);
      assert.equal(id.length, length);
      for (let index = 0; index < length; index += 1) {
        const alphabet = (index + 1) % 3 === 0 ? DIGITS : LETTERS;
        assert.ok(alphabet.includes(id[index]));
      }
    }
  }
});

test('defaults to 32 characters', () => {
  assert.equal(DEFAULT_LENGTH, 32);
  assert.equal(tidyid().length, 32);
});

test('includes unambiguous uppercase characters on request', () => {
  assert.equal(
    LETTERS_WITH_UPPERCASE,
    'ABCDEFGHJKMNPQRTUVWXYZabcdefghjkmnpqrtuvwxyz',
  );
  for (const length of [3, 16, 32, 256]) {
    const id = tidyid(length, true);
    assert.equal(id.length, length);
    for (let index = 0; index < length; index += 1) {
      const alphabet = (index + 1) % 3 === 0
        ? DIGITS
        : LETTERS_WITH_UPPERCASE;
      assert.equal(alphabet.includes(id[index]), true);
    }
    assert.equal(isValidId(id, length, true), true);
  }
});

test('excludes every ambiguous character', () => {
  assert.equal(LETTERS, 'abcdefghjkmnpqrtuvwxyz');
  assert.equal(DIGITS, '23456789');
  const ids = Array.from({ length: 1_000 }, () => tidyid(16)).join('');
  assert.doesNotMatch(ids, /[01ilos]/);
  const uppercaseIds = Array.from(
    { length: 1_000 },
    () => tidyid(16, true),
  ).join('');
  assert.doesNotMatch(uppercaseIds, /[01ILOSilos]/);
});

test('reports exact capacities and entropy', () => {
  assert.equal(getIdCapacity(8), 7_256_313_856n);
  assert.equal(getIdCapacity(16), 19_146_942_100_646_395_904n);
  assert.ok(Math.abs(getIdEntropy(8) - 32.756589711823786) < 1e-12);
  assert.ok(Math.abs(getIdEntropy(16) - 64.05374780501026) < 1e-12);
  assert.equal(getIdCapacity(3, true), 15_488n);
  assert.ok(Math.abs(getIdEntropy(3, true) - 13.918863237274595) < 1e-12);
});

test('rejects invalid lengths with the public error type', () => {
  for (const length of [0, NaN, 2, 3.5, 257, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => tidyid(length),
      error => error instanceof InvalidIdLengthError
        && error.message === 'length must be between 3 and 256',
    );
  }
});

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  InvalidIdLengthError,
  InvalidIdFormatError,
  ensureValidId,
  isValidId,
} from '../dist/index.js';

test('validates structure and optional exact length', () => {
  assert.equal(isValidId('mk7qw2xy'), true);
  assert.equal(isValidId('mk7qw2xy', 8), true);
  assert.equal(isValidId('mk7qw2xy', 16), false);
  assert.equal(isValidId('mk7qw2x'), true);
  assert.equal(isValidId('mk7qw2x9'), false);
  assert.equal(isValidId('m27qw2xy'), false);
  assert.equal(isValidId('mk7q52xy'), false);
  assert.equal(isValidId('MK7QW2XY'), false);
  assert.equal(isValidId('MK7QW2XY', 8, true), true);
  assert.equal(isValidId('aZ2', 3, true), true);
  assert.equal(isValidId('a2Z', 3, true), false);
  assert.equal(isValidId('aZQ', 3, true), false);
  assert.equal(isValidId('aI2', 3, true), false);
  assert.equal(isValidId('aZ0', 3, true), false);
  assert.equal(isValidId(null), false);
  assert.equal(isValidId('mk', 2), false);
});

test('ensureValidId narrows valid values and throws explicit errors', () => {
  assert.doesNotThrow(() => ensureValidId('mk7qw2xy', 8));
  assert.doesNotThrow(() => ensureValidId('aZ2', 3, true));
  assert.throws(
    () => ensureValidId('invalid', 8),
    error => error instanceof InvalidIdFormatError
      && error.message === 'value is not a valid TidyID',
  );
  assert.throws(() => ensureValidId('mk', 2), InvalidIdLengthError);
});

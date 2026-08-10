import assert from 'node:assert/strict';
import test from 'node:test';

import * as browser from '../dist/index.browser.js';
import * as node from '../dist/index.js';

const {
  InvalidIdFormatError,
  InvalidIdLengthError,
  ensureValidId,
  isValidId,
  tidyid,
} = browser;

test('browser generator rejects zero length', () => {
  assert.throws(() => tidyid(0), InvalidIdLengthError);
});

test('browser entry exposes the same secure public API', () => {
  assert.deepEqual(Object.keys(browser).sort(), Object.keys(node).sort());
  assert.equal(InvalidIdFormatError.name, 'InvalidIdFormatError');
  const id = tidyid();
  assert.equal(isValidId(id, 32), true);
  assert.doesNotThrow(() => ensureValidId(id, 32));
  const uppercaseId = tidyid(32, true);
  assert.equal(isValidId(uppercaseId, 32, true), true);
  assert.throws(() => ensureValidId('invalid', 8), InvalidIdFormatError);
});

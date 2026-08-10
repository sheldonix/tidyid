import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);

test('package can be loaded with require', () => {
  const { isValidId, tidyid } = require('tidyid');
  const id = tidyid(10);
  assert.equal(isValidId(id, 10), true);
});

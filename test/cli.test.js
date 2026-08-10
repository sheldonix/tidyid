import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

import { isValidId } from '../dist/index.js'

const run = (...arguments_) => spawnSync(
  process.execPath,
  ['bin/tidyid.js', ...arguments_],
  { encoding: 'utf8' },
)

test('CLI generates default and custom-size IDs', () => {
  const defaultResult = run()
  assert.equal(defaultResult.status, 0)
  assert.equal(isValidId(defaultResult.stdout.trim(), 32), true)

  const sizedResult = run('--size', '16')
  assert.equal(sizedResult.status, 0)
  assert.equal(isValidId(sizedResult.stdout.trim(), 16), true)

  const shortResult = run('-s', '3')
  assert.equal(shortResult.status, 0)
  assert.equal(isValidId(shortResult.stdout.trim(), 3), true)

  const uppercaseResult = run('--allow-uppercase', '--size', '64')
  assert.equal(uppercaseResult.status, 0)
  assert.equal(isValidId(uppercaseResult.stdout.trim(), 64, true), true)

  const shortUppercaseResult = run('-u', '-s', '3')
  assert.equal(shortUppercaseResult.status, 0)
  assert.equal(isValidId(shortUppercaseResult.stdout.trim(), 3, true), true)
})

test('CLI reports metadata and rejects invalid arguments', () => {
  assert.equal(run('--version').stdout.trim(), '2.1.1')
  assert.match(run('--help').stdout, /--size/)
  assert.match(run('--help').stdout, /--allow-uppercase/)

  const invalidSize = run('--size', '2')
  assert.equal(invalidSize.status, 1)
  assert.match(invalidSize.stderr, /between 3 and 256/)

  const unknown = run('--unknown')
  assert.equal(unknown.status, 1)
  assert.match(unknown.stderr, /Unknown argument --unknown/)
})

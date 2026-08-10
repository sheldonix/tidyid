import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

const archivePath = process.argv[2];
if (archivePath === undefined) {
  throw new Error('usage: node scripts/check-package.mjs <package.tgz>');
}

const compressed = readFileSync(resolve(archivePath));
assert.ok(compressed.byteLength <= 10_240, 'package exceeds 10 KiB');
const archive = gunzipSync(compressed);
const files = new Map();
const expectedFiles = new Set([
  'package/package.json',
  'package/README.md',
  'package/LICENSE',
  'package/bin/tidyid.js',
  'package/dist/index.js',
  'package/dist/index.browser.js',
  'package/dist/index.d.ts',
]);

const readText = (offset, length) => {
  const field = archive.subarray(offset, offset + length);
  const end = field.indexOf(0);
  return field.subarray(0, end === -1 ? field.length : end).toString('utf8');
};

for (let offset = 0; offset + 512 <= archive.length;) {
  const block = archive.subarray(offset, offset + 512);
  if (block.every(byte => byte === 0)) break;
  const name = readText(offset, 100);
  const prefix = readText(offset + 345, 155);
  const path = prefix === '' ? name : `${prefix}/${name}`;
  const size = Number.parseInt(readText(offset + 124, 12).trim(), 8);
  assert.ok(Number.isSafeInteger(size) && size >= 0, `invalid size: ${path}`);
  assert.ok(
    archive[offset + 156] === 0 || archive[offset + 156] === 48,
    `non-regular entry: ${path}`,
  );
  assert.equal(expectedFiles.has(path), true, `unexpected package entry: ${path}`);
  assert.equal(files.has(path), false, `duplicate package entry: ${path}`);
  files.set(path, archive.subarray(offset + 512, offset + 512 + size));
  offset += 512 + Math.ceil(size / 512) * 512;
}

for (const required of expectedFiles) {
  assert.equal(files.has(required), true, `missing package entry: ${required}`);
}
assert.equal(files.size, expectedFiles.size, 'package file count changed');

const packageJson = JSON.parse(files.get('package/package.json').toString('utf8'));
assert.equal(packageJson.name, 'tidyid');
assert.deepEqual(packageJson.bin, { tidyid: 'bin/tidyid.js' });
assert.equal(packageJson.dependencies, undefined, 'runtime dependencies are forbidden');
assert.equal(
  packageJson.repository.url,
  'git+https://github.com/sheldonix/tidyid.git',
);

console.log(JSON.stringify({
  archive: resolve(archivePath),
  compressedBytes: compressed.byteLength,
  files: files.size,
}));

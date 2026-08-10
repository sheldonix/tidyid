import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const tidyid = await import('tidyid');
const nodeId = tidyid.tidyid();
assert.equal(tidyid.isValidId(nodeId, 32), true);

const declarations = readFileSync(
  fileURLToPath(new URL('../dist/index.d.ts', import.meta.url)),
  'utf8',
);
const typeExports = [...declarations.matchAll(
  /^export (?:declare )?(?:class|const|function) ([A-Za-z_$][\w$]*)/gm,
)].map(match => match[1]).sort();
assert.deepEqual(typeExports, Object.keys(tidyid).sort());

const packageJson = createRequire(import.meta.url)('tidyid/package.json');
assert.equal(packageJson.name, 'tidyid');
assert.equal(packageJson.types, './dist/index.d.ts');
assert.equal(packageJson.exports['.'].default, './dist/index.js');

const browser = spawnSync(
  process.execPath,
  [
    '--conditions=browser',
    '--input-type=module',
    '--eval',
    "import { isValidId, tidyid } from 'tidyid'; if (!isValidId(tidyid(), 32)) process.exit(1)",
  ],
  { encoding: 'utf8' },
);
if (browser.error !== undefined) throw browser.error;
assert.equal(browser.status, 0, browser.stderr);

const types = spawnSync(
  process.execPath,
  [
    fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url)),
    '-p',
    fileURLToPath(new URL('../tsconfig.public.json', import.meta.url)),
  ],
  { encoding: 'utf8' },
);
if (types.error !== undefined) throw types.error;
assert.equal(types.status, 0, types.stdout + types.stderr);

console.log(JSON.stringify({
  node: 'dist/index.js',
  browser: 'dist/index.browser.js',
  packageJson: true,
  types: 'dist/index.d.ts',
}));

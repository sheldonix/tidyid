import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const resolve = path => fileURLToPath(new URL(path, root));
const dist = resolve('dist/');
const intermediate = resolve('.build/');

rmSync(dist, { recursive: true, force: true });
rmSync(intermediate, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const typeScript = spawnSync(
  process.execPath,
  [
    resolve('node_modules/typescript/bin/tsc'),
    '-p',
    resolve('tsconfig.json'),
    '--outDir',
    intermediate,
  ],
  { stdio: 'inherit' },
);

if (typeScript.error !== undefined) throw typeScript.error;
if (typeScript.status !== 0) process.exit(typeScript.status ?? 1);

const shared = {
  bundle: true,
  charset: 'ascii',
  format: 'esm',
  legalComments: 'none',
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  sourcemap: false,
  treeShaking: true,
};

await Promise.all([
  build({
    ...shared,
    entryPoints: [resolve('src/index.ts')],
    outfile: resolve('dist/index.js'),
    platform: 'node',
    target: 'node22',
  }),
  build({
    ...shared,
    entryPoints: [resolve('src/index.browser.ts')],
    outfile: resolve('dist/index.browser.js'),
    platform: 'browser',
    target: 'es2022',
  }),
]);
copyFileSync(resolve('types/index.d.ts'), resolve('dist/index.d.ts'));

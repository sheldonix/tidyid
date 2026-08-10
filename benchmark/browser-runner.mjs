import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
]);

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? '/', 'http://localhost').pathname,
    );
    const file = resolve(root, pathname.replace(/^\/+/, ''));
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(file === root
      ? resolve(root, 'benchmark/browser.html')
      : file);
    response.writeHead(200, {
      'content-type': mimeTypes.get(extname(file)) ?? 'application/octet-stream',
    }).end(body);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolveListen, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolveListen);
});

const address = server.address();
if (address === null || typeof address === 'string') {
  throw new Error('benchmark server did not expose a TCP port');
}

const engines = { chromium, firefox, webkit };
const selected = process.argv.slice(2);
const names = selected.length === 0 ? Object.keys(engines) : selected;
const results = {};

try {
  for (const name of names) {
    const engine = engines[name];
    if (engine === undefined) throw new Error(`unknown browser: ${name}`);
    const browser = await engine.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(
        `http://127.0.0.1:${address.port}/benchmark/browser.html`,
      );
      await page.waitForFunction(
        () => globalThis.benchmarkResults !== undefined,
        undefined,
        { timeout: 120_000 },
      );
      results[name] = await page.evaluate(() => globalThis.benchmarkResults);
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise(resolveClose => server.close(resolveClose));
}

console.log(JSON.stringify(results, null, 2));

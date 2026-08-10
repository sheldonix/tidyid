import { readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const limits = {
  total: 15_000,
  javascript: 14_000,
  declarations: 1_100,
};
const totals = { total: 0, javascript: 0, declarations: 0 };

const visit = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(path);
      continue;
    }
    const bytes = statSync(path).size;
    totals.total += bytes;
    if (extname(path) === '.js') totals.javascript += bytes;
    if (path.endsWith('.d.ts')) totals.declarations += bytes;
  }
};
visit(dist);

console.log(JSON.stringify({ bytes: totals, limits }, null, 2));
for (const key of Object.keys(limits)) {
  if (totals[key] > limits[key]) {
    throw new Error(`${key} output exceeds ${limits[key]} bytes`);
  }
}

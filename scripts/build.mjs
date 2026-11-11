import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { validate } from './model.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(join(root, 'content/portal.json'), 'utf8'));
validate(data);
const dist = resolve(root, 'dist');
// Preserve the visual studies in source control, outside the published site.
const archivedEntries = ['propostas.html', 'proposta-1.html', 'proposta-2.html', 'proposta-3.html'];
const source = join(root, 'src');
const archivedPaths = new Set(archivedEntries.map(name => resolve(source, name)));
await mkdir(dist, { recursive: true });
// Remove only these known files left by previous builds.
for (const name of archivedEntries) await rm(join(dist, name), { force: true });
await cp(source, dist, { recursive: true, filter: path => !archivedPaths.has(resolve(path)) });
await writeFile(join(dist, 'portal-data.js'), `window.TUCA_CONTENT = ${JSON.stringify(data, null, 2)};\n`);
console.log(`Portal gerado em ${dist} (${data.pages.length} páginas). Estudos visuais preservados apenas no código-fonte.`);

// Build for GitHub Pages: copy only what the site needs into dist/ and stamp the service-worker cache version
// with a hash of the content, so phones pick up every change automatically.
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const OUT = 'dist', INCLUDE = ['index.html', 'fig3d.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'icons', 'audio'];
await rm(OUT, { recursive: true, force: true }); await mkdir(OUT);
for (const p of INCLUDE) await cp(p, join(OUT, p), { recursive: true, filter: s => !s.endsWith('.DS_Store') });

const hash = createHash('sha256'); let files = 0, bytes = 0;
async function walk(dir) { for (const e of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
  const p = join(dir, e.name); if (e.isDirectory()) await walk(p); else if (p !== join(OUT, 'sw.js')) { const b = await readFile(p); hash.update(p).update(b); files++; bytes += b.length; } } }
await walk(OUT);
const version = hash.digest('hex').slice(0, 10), swPath = join(OUT, 'sw.js');
await writeFile(swPath, (await readFile(swPath, 'utf8')).replace(/const CACHE = '[^']*'/, `const CACHE = 'tension-coach-${version}'`));
await writeFile(join(OUT, '.nojekyll'), '');          // serve files as-is on GitHub Pages
console.log(`Built ${OUT}/: ${files} files, ${(bytes / 1048576).toFixed(1)} MB, cache version ${version}`);

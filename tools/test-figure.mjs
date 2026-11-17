// Automatic test for the 3D coach figure (fig3d.html). Usage: npm run test:figure
// Plays every move through a full loop in a headless browser and checks each frame
// against the engine's rules (joint ranges, balance, nothing through the mat or the body, no sliding feet, smooth motion).
// Exits with code 1 if any rule is broken, so it can gate a build.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), PORT = 8017, DBG = 9337;
const BROWSER = process.env.BROWSER_BIN || '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const prof = mkdtempSync(join(tmpdir(), 'figure-test-'));
const srv = spawn('node', ['tools/serve.mjs', '.', String(PORT)], { cwd: root, stdio: 'ignore' });
const br = spawn(BROWSER, ['--headless=new', `--remote-debugging-port=${DBG}`, `--user-data-dir=${prof}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const done = code => { try { br.kill('SIGKILL'); } catch {} try { srv.kill(); } catch {} try { rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(code); };
setTimeout(() => { console.error('test timed out'); done(2); }, 600000);

let ws, id = 0; const pend = new Map(), errors = [];
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
for (let i = 0; i < 60 && !ws; i++) { try { const l = await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json(); const pg = l.find(t => t.type === 'page'); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch {} if (!ws) await sleep(250); }
if (!ws) { console.error('could not start the browser'); done(2); }
await new Promise(r => ws.onopen = r);
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result || d); pend.delete(d.id); } else if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); };
await send('Runtime.enable'); await send('Page.enable');
// Every move is checked on both figures (the man's and the woman's bodies have different widths). A move must pass on both.
let out = null, t0 = Date.now();
for (const sex of ['m', 'f']) {
  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/fig3d.html?lab&sex=${sex}` }); await sleep(300);
  let ready = false; for (let i = 0; i < 60 && !ready; i++) { const r = await send('Runtime.evaluate', { expression: '!!(window.__lab && window.__lab.test) && FEM === ' + (sex === 'f'), returnByValue: true }); ready = r.result?.value === true; if (!ready) await sleep(250); }
  if (!ready) { console.error('the page did not load:\n' + errors.join('\n')); done(2); }
  const res = await send('Runtime.evaluate', { expression: 'JSON.stringify(__lab.test())', returnByValue: true });
  if (!res.result?.value) { console.error('the test crashed:\n' + JSON.stringify(res, null, 1).slice(0, 1500) + '\n' + errors.join('\n')); done(2); }
  const o = JSON.parse(res.result.value); o.failures.forEach(f => { f.where += sex === 'f' ? ' (woman)' : ''; });
  if (!out) out = o; else { out.frames += o.frames; out.failures.push(...o.failures); out.passed = out.passed.filter(k => o.passed.includes(k)); out.failed = [...new Set([...out.failed, ...o.failed])]; }
}
// The app shows a move in 3D only if it passed every rule here; the rest keep their 2D picture. The list is written by this test.
{ const { writeFileSync } = await import('node:fs'); writeFileSync(join(root, 'js/fig3d/ok.js'), '/* Written by npm run test:figure: the moves that passed every rule. The app shows only these in 3D. */\nconst FIG3D_OK = ' + JSON.stringify(out.passed) + ';\nconst FIG3D_VER = \'' + Date.now().toString(36) + '\';\n');
  console.log(`${out.passed.length} moves pass and are shown in 3D; ${out.failed.length} keep their 2D picture: ${out.failed.join(', ')}`); }
console.log(`checked ${out.frames} frames over ${out.moves} moves, in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (errors.length) console.log('page errors:\n' + errors.join('\n'));
if (!out.failures.length && !errors.length) { console.log('PASS: no rule broken'); done(0); }
const by = {}; out.failures.forEach(f => (by[f.rule.replace(/^(right|left) /, '')] ||= []).push(f));
console.log(`FAIL: ${out.failures.length} problems`);
Object.entries(by).sort((a, b) => b[1].length - a[1].length).forEach(([rule, list]) => { console.log(`\n${rule}  (${list.length})`); list.sort((a, b) => b.value - a.value).slice(0, 200).forEach(f => console.log(`   ${f.where}   [${f.rule.split(' ')[0]}]  worst ${f.value} at ${f.t}s`)); if (list.length > 12) console.log(`   ... and ${list.length - 12} more`); });
done(1);

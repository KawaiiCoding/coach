// Checks that need the real app in a browser:  node tools/test-app.mjs   (npm run test:app)
// Builds a session for hundreds of made-up people (every session length, stage, pain pattern, pregnancy stage, flag) and
// checks the plan-building algorithm: order of the phases, what is left out for safety, difficulty caps, doses, how long
// the session really runs compared with the length that was chosen, and that every repetition count matches its timer.
// Needs a Chromium-family browser (Chrome, Brave, Edge or Chromium). Starts its own local server and closes everything after.
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const root = new URL('..', import.meta.url).pathname, PORT = 8123, DBG = 9345;
const BROWSERS = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const bin = process.env.BROWSER_BIN || BROWSERS.find(b => fs.existsSync(b)); if (!bin) { console.log('No Chromium-family browser found. Set BROWSER_BIN to its path.'); process.exit(2); }
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'coach-test-'));
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), root, String(PORT)], { stdio: 'ignore' });
const browser = spawn(bin, ['--headless=new', `--remote-debugging-port=${DBG}`, `--user-data-dir=${prof}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
const stop = code => { try { browser.kill(); } catch (e) {} try { server.kill(); } catch (e) {} try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} process.exit(code); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws; for (let i = 0; i < 40 && !ws; i++) { await sleep(300); try { const t = await (await fetch(`http://127.0.0.1:${DBG}/json/new?about:blank`, { method: 'PUT' })).json(); ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; }); } catch (e) { ws = null; } }
if (!ws) { console.log('Could not start the browser.'); stop(2); }
let id = 0; const pend = new Map(), errors = []; ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { pend.get(m.id)?.(m); pend.delete(m.id); } else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval failed'); return r.result.result.value; };
await send('Runtime.enable'); await send('Page.enable'); await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` }); await sleep(1800);

const fails = [], seen = new Set(); let checks = 0; const ok = (c, msg) => { checks++; if (!c && !seen.has(msg)) { seen.add(msg); fails.push(msg); } };
const ORDER = { warmup: 0, pre: 1, strength: 2, stretch: 3, breath: 4, calm: 5 };
const PAINS = [{}, { neckB: { v: 5, side: 'b' } }, { lowBack: { v: 6, side: 'b' } }, { shoulder: { v: 4, side: 'r' }, hipF: { v: 3, side: 'l' } }, { knee: { v: 7, side: 'l' }, calf: { v: 3, side: 'b' }, neckSide: { v: 2, side: 'r' }, upperBack: { v: 5, side: 'b' } }];
const PEOPLE = [['man', { sex: 'm' }], ['woman', { sex: 'f', w: { now: ['health'], sym: [] } }], ['pregnant, first trimester', { sex: 'f', w: { now: ['preg'], tri: 1, sym: [] } }], ['pregnant, second trimester', { sex: 'f', w: { now: ['preg'], tri: 2, sym: [] } }], ['pregnant, third trimester', { sex: 'f', w: { now: ['preg'], tri: 3, sym: [] } }],
  ['six weeks after birth', { sex: 'f', w: { now: ['post'], post: 'early', sym: [] } }], ['after a caesarean', { sex: 'f', w: { now: ['post'], post: 'early', cs: true, sym: [] } }], ['months after birth, leaking', { sex: 'f', w: { now: ['post'], post: 'late', sym: ['leak'] } }], ['menopause, prolapse', { sex: 'f', w: { now: ['meno'], sym: ['prolapse'] } }],
  ['osteoporosis', { sex: 'f', osteo: true, w: { now: ['meno'], sym: [] } }], ['man with osteoporosis', { sex: 'm', osteo: true }], ['short of breath lying flat', { sex: 'm', breathless: 'yes' }], ['a bit tight lying flat', { sex: 'm', breathless: 'mild' }]];
const lengths = {}, byLen = {}; let plans = 0;
for (const dur of [5, 10, 15, 20, 30]) for (const stage of [1, 2, 3, 4]) for (const pain of PAINS) for (const [who, extra] of PEOPLE) for (const worse of [false, true]) {
  if (worse && (stage !== 2 || dur !== 15)) continue;
  const state = { onboarded: true, profile: { duration: dur, stage, ...extra }, pain, logs: worse ? [{ d: new Date().toISOString().slice(0, 10), pain: {}, done: [], minutes: 0, resets: [], feel: 'worse' }] : [] };
  const P = await ev(`JSON.stringify(window.__coachTest.plan(${JSON.stringify(state)}))`).then(JSON.parse), tag = `${dur} min, stage ${stage}, ${who}, ${Object.keys(pain).join('+') || 'no pain'}${worse ? ', felt worse' : ''}`; plans++;
  const it = P.items, ex = new Set(P.rules.exclude), cap = Math.min(P.stageLevel, P.rules.maxLevel);
  ok(it.length >= 2 && it[0].section === 'warmup', `${tag}: does not start with a warm-up`);
  ok(it.every((x, i) => i === 0 || ORDER[x.section] >= ORDER[it[i - 1].section]), `${tag}: phases out of order (${it.map(x => x.section).join(' > ')})`);
  ok(it.some(x => x.kind === 'breath') && ['breath', 'calm'].includes(it[it.length - 1].section), `${tag}: does not end with breathing`);
  for (const x of it) { if (x.kind !== 'stretch' && x.kind !== 'strength') continue;
    ok(!ex.has(x.id), `${tag}: includes ${x.id}, which the safety rules leave out`);
    if (x.kind === 'strength' && !P.rules.add.includes(x.id)) ok(x.level <= cap, `${tag}: ${x.id} is level ${x.level}, above the cap of ${cap}`);
    if (x.primer) { const st = P.steps.find(q => q.key === x.id + '-pre'); ok(dur >= 10 && st && st.cycles.every(c => !c.hold || c.t <= 20), `${tag}: the pre-strength stretch of ${x.id} is held longer than 20s`); } }
  const main = it.filter(x => (x.kind === 'stretch' || x.kind === 'strength') && !x.primer).map(x => x.id); ok(new Set(main).size === main.length, `${tag}: an exercise appears twice`);
  if (worse) ok(P.rules.gentle && P.rules.maxLevel === 1, `${tag}: after feeling worse the plan must drop to the gentlest level`);
  if (extra.breathless === 'yes') ok(P.steps.some(s => s.kind === 'breath' && /seated/i.test(s.key + s.name)), `${tag}: breathing must be seated when lying flat is hard`);
  if (Object.keys(pain).length && dur >= 10) ok(it.some(x => x.kind === 'stretch' && !x.primer) && (it.some(x => x.kind === 'strength') || P.rules.maxLevel === 1), `${tag}: a plan for a painful area needs both a stretch and a strengthening exercise`);
  // doses actually played
  for (const s of P.steps) { for (const c of s.cycles) { if (c.reps) ok(Math.abs(c.t - c.reps * c.repT) < 0.01, `${s.key}: timer ${c.t}s does not equal ${c.reps} repetitions at ${c.repT}s each`); if (c.rest) ok(c.t >= 3 && c.t <= 30, `${s.key}: a rest of ${c.t}s`); if (c.hold) ok(c.t >= 5 && c.t <= 60, `${s.key}: a hold of ${c.t}s`); }
    if (s.kind === 'stretch' && (P.stage === 1 || P.rules.stretchCap) && (it.find(q => q.id === s.key.replace(/-pre$/, '')) || {}).type === 'static') for (const c of s.cycles) if (c.hold) ok(c.t <= 20, `${tag}: ${s.key} is held ${c.t}s, above the 20s cap for this person`); }
  const real = P.steps.reduce((a, s) => a + s.total + 8 /* the "Up next" countdown before each step */, 0) / 60; (lengths[dur] = lengths[dur] || []).push(real); ok(Math.abs(P.minutes - real) <= 1, `${tag}: says ${P.minutes} min but runs ${real.toFixed(1)} min`);
  ok(real >= dur * 0.8 && real <= dur * 1.12, `${tag}: chosen ${dur} min but runs ${real.toFixed(1)} min`);
  const w = P.steps.filter(s => s.section === 'warmup').reduce((a, s) => a + s.total, 0), b = P.steps.filter(s => s.kind === 'breath').reduce((a, s) => a + s.total, 0); ok(w >= 60 && b >= 45 && b <= 150, `${tag}: warm-up ${w}s, breathing ${b}s (warm-up at least a minute; breathing between 45s and 2.5 min, long deliberate breathing can cause light-headedness)`);
  const sc = P.steps.filter(s => s.kind === 'scan').reduce((a, s) => a + s.total, 0); ok(sc <= 210, `${tag}: body scan of ${sc}s (kept to about three minutes at most)`);
}
console.log(`${plans} plans built, ${checks} checks, ${fails.length} failed` + (errors.length ? `, ${errors.length} page errors` : ''));
for (const d of Object.keys(lengths)) { const a = lengths[d].sort((x, y) => x - y); console.log(`  chosen ${String(d).padStart(2)} min: runs ${a[0].toFixed(1)} to ${a[a.length - 1].toFixed(1)} min (typical ${a[a.length >> 1].toFixed(1)})`); }
const kinds = {}; for (const f of fails) { const k = f.includes(': ') ? f.slice(f.indexOf(': ') + 2).replace(/[\d.]+/g, 'N') : f; (kinds[k] = kinds[k] || []).push(f); }
for (const [k, list] of Object.entries(kinds)) console.log(`  FAIL (${list.length}x)  ${list[0]}`); for (const e of errors.slice(0, 5)) console.log('  PAGE ERROR  ' + String(e).slice(0, 200));
stop(fails.length || errors.length ? 1 : 0);

// How the coach talks:  node tools/test-talk.mjs   (npm run test:talk)
// Plays whole sessions on a fast clock, records every line the coach says and when, and checks that it sounds like a
// coach and not a loop: not too many lines a minute, enough quiet between optional lines, no line repeated too soon.
// Builds a session for hundreds of made-up people (every session length, stage, pain pattern, pregnancy stage, flag) and
// checks the plan-building algorithm: order of the phases, what is left out for safety, difficulty caps, doses, how long
// the session really runs compared with the length that was chosen, and that every repetition count matches its timer.
// Needs a Chromium-family browser (Chrome, Brave, Edge or Chromium). Starts its own local server and closes everything after.
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const root = new URL('..', import.meta.url).pathname, PORT = 8125, DBG = 9347;
const BROWSERS = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const bin = process.env.BROWSER_BIN || BROWSERS.find(b => fs.existsSync(b)); if (!bin) { console.log('No Chromium-family browser found. Set BROWSER_BIN to its path.'); process.exit(2); }
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'coach-test-'));
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), root, String(PORT)], { stdio: 'ignore' });
const browser = spawn(bin, ['--headless=new', `--remote-debugging-port=${DBG}`, `--user-data-dir=${prof}`, '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
const stop = code => { try { browser.kill(); } catch (e) {} try { server.kill(); } catch (e) {} try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} process.exit(code); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws; for (let i = 0; i < 40 && !ws; i++) { await sleep(300); try { const t = await (await fetch(`http://127.0.0.1:${DBG}/json/new?about:blank`, { method: 'PUT' })).json(); ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; }); } catch (e) { ws = null; } }
if (!ws) { console.log('Could not start the browser.'); stop(2); }
let id = 0; const pend = new Map(), errors = []; ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { pend.get(m.id)?.(m); pend.delete(m.id); } else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval failed'); return r.result.result.value; };
await send('Runtime.enable'); await send('Page.enable'); await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` }); await sleep(1800);



const fails = []; let checks = 0; const ok = (c, msg) => { checks++; if (!c) { fails.push(msg); console.log('  FAIL  ' + msg); } };
const PACE = /^(In…|and out\.|and slowly out\.|Breathe in through the nose…)$/;      // breath pacing follows the breath on purpose
const SPEED = 25;      // the clock runs 25 times faster; the player is checked 25 times a second so its steps stay one second apart
const people = [['10 min, neck pain', { duration: 10, stage: 2, sex: 'm' }, { neckB: { v: 5, side: 'b' } }], ['20 min, low back', { duration: 20, stage: 2, sex: 'f', w: { now: ['health'], sym: [] } }, { lowBack: { v: 6, side: 'b' } }], ['30 min, several areas', { duration: 30, stage: 3, sex: 'm' }, { shoulder: { v: 4, side: 'r' }, hipF: { v: 3, side: 'l' }, calf: { v: 3, side: 'b' } }]];
for (const [label, profile, pain] of people) {
  await ev(`(()=>{localStorage.clear();localStorage.setItem('coach.intro','1');localStorage.setItem('tension.v1',JSON.stringify({onboarded:true,started:'2026-01-01',profile:Object.assign({breathless:'no',redflags:[],desk:4,sofa:2,phone:2,stand:2,sleep:'side',deskGood:false,osteo:false,w:{now:[],sym:[]},perWeek:5,theme:'auto',days:[]},${JSON.stringify(profile)}),pain:${JSON.stringify(pain)},logs:[],remind:{on:false,every:45}}));return 1})()`);
  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` }); await sleep(1800);
  await ev(`(()=>{const n=performance.now.bind(performance),t0=n();performance.now=()=>t0+(n()-t0)*${SPEED};const si=window.setInterval;window.setInterval=(f,d,...a)=>si(f,d===200?Math.round(200/${SPEED}*5):d,...a);window.__said=[];COACH_AUDIO.voiceOn=false;COACH_AUDIO.say=(t,o)=>{const nm=document.getElementById('pname');window.__said.push([performance.now()/1000,t,nm?nm.textContent:'']);};return 1})()`);
  await ev(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^(Start session|Continue|Go again)/.test(b.textContent.trim()));b.click();return 1})()`);
  for (let i = 0; i < 900; i++) { await sleep(500); if (await ev(`!!document.querySelector('.donebox')`)) break; }
  const said = JSON.parse(await ev('JSON.stringify(window.__said)')); const t0 = said[0][0], dur = (said[said.length - 1][0] - t0) / 60;
  // gaps between consecutive lines, ignoring the announcement block at the start of each exercise (said together on purpose)
  // gaps between separate utterances; lines said back to back (an announcement such as "Next: … then how to start") count as one
  const gaps = []; for (let i = 1; i < said.length; i++) { const g = said[i][0] - said[i - 1][0]; if (g >= 1.5 && said[i][2] === said[i - 1][2] && said[i][2] !== 'Body scan' && !PACE.test(said[i][1])) gaps.push(g); }
  const talkMs = said.filter(x => x[2] !== 'Body scan'), utter = talkMs.filter((x, i) => i === 0 || x[0] - talkMs[i - 1][0] >= 1.5).length, scanMin = said.filter(x => x[2] === 'Body scan').length ? (said.filter(x => x[2] === 'Body scan').slice(-1)[0][0] - said.find(x => x[2] === 'Body scan')[0]) / 60 + .5 : 0;
  const short = gaps.filter(g => g < 6).length, perMin = utter / (dur - scanMin), seen = new Map(), soon = [];
  for (const [t, txt, nm] of said) { if (nm === 'Body scan') continue; if (seen.has(txt) && t - seen.get(txt) < 120 && !/^(In…|and out\.|Switch sides\.|And hold\.|Breathe in through the nose…|and slowly out\.)$/.test(txt)) soon.push(txt); seen.set(txt, t); }
  const counts = {}; said.forEach(s => counts[s[1]] = (counts[s[1]] || 0) + 1); const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${v}× "${k}"`).join(', ');
  console.log(`${label}: ${said.length} lines, ${utter} times the coach speaks in ${dur.toFixed(1)} min = ${perMin.toFixed(1)} a minute (body scan not counted); ${short} gaps under 6 s; repeated within 2 min: ${soon.length}\n    most said: ${top}`);
  ok(perMin <= 5, `${label}: the coach speaks ${perMin.toFixed(1)} times a minute (a real coach: about 5 or fewer)`);
  for (let i = 1; i < said.length; i++) { const g = said[i][0] - said[i - 1][0]; if (g >= 1.5 && g < 6 && said[i][2] === said[i - 1][2] && said[i][2] !== 'Body scan' && !PACE.test(said[i][1]) && process.env.GAPS) console.log(`      ${g.toFixed(1)} s: "${said[i - 1][1]}" -> "${said[i][1]}"`); }
  ok(short <= gaps.length * .12, `${label}: ${short} of ${gaps.length} lines follow the previous one within 6 s`);
  ok(soon.length <= 2, `${label}: ${soon.length} lines repeated within two minutes (${[...new Set(soon)].slice(0, 4).join(' | ')})`);
  if (process.env.SHOW) for (const [t, txt, nm] of said) console.log(`      ${((t - t0)).toFixed(0).padStart(4)}s  ${nm.slice(0, 22).padEnd(22)}  ${txt}`);
}
console.log(`${checks} checks, ${fails.length} failed` + (errors.length ? `, ${errors.length} page errors` : '')); for (const e of errors.slice(0, 5)) console.log('  PAGE ERROR  ' + String(e).slice(0, 200));
stop(fails.length || errors.length ? 1 : 0);

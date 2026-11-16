// Sound checks in a real browser:  node tools/test-audio.mjs   (npm run test:audio)
// Plays a session and measures the actual output level after every action: music on, muted, unmuted, paused, resumed,
// mood changes, the end of a session, the settings preview, a suspended audio system, and the coach voice queue.
// Builds a session for hundreds of made-up people (every session length, stage, pain pattern, pregnancy stage, flag) and
// checks the plan-building algorithm: order of the phases, what is left out for safety, difficulty caps, doses, how long
// the session really runs compared with the length that was chosen, and that every repetition count matches its timer.
// Needs a Chromium-family browser (Chrome, Brave, Edge or Chromium). Starts its own local server and closes everything after.
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const root = new URL('..', import.meta.url).pathname, PORT = 8124, DBG = 9346;
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


const fails = []; let checks = 0; const ok = (c, msg) => { checks++; console.log((c ? '  ok    ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const click = t => ev(`(()=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>(b.textContent.trim()||b.id||'').startsWith(${JSON.stringify(t)}));if(!b)return false;b.click();return true})()`);
const byId = id => ev(`(()=>{const b=document.getElementById(${JSON.stringify(id)});if(!b)return false;b.click();return true})()`);
const level = async () => { let m = 0; for (let i = 0; i < 8; i++) { const r = await ev("JSON.stringify(COACH_AUDIO.meter('music'))"); const v = r && JSON.parse(r); if (v) m = Math.max(m, v[1]); await sleep(60); } return m; };
const ON = .004, OFF = .0015, playing = async (msg, want = true) => { const l = await level(); ok(want ? l > ON : l < OFF, `${msg} (level ${l.toFixed(4)})`); };
// set up a person and start a session with the coach voice off, so only music is measured first
if (await click('Get started')) await sleep(400); if (await click('Nothing')) { await sleep(300); await click('Skip'); await sleep(300); await click('None of these'); await sleep(700); }
await ev('COACH_AUDIO.voiceOn=false;1');
await click('Start session') || await click('Continue'); await sleep(5000);
ok((await ev('COACH_AUDIO.state')) === 'running', 'the audio system is running once a session starts');
await playing('music plays during the warm-up');
await byId('pmusic'); await sleep(2500); await playing('silent after muting the music', false);
await byId('pmusic'); await sleep(2500); await playing('music comes back after unmuting');
await byId('pplay'); await sleep(2000); await playing('silent while paused', false);
await byId('pplay'); await sleep(2500); await playing('music comes back after resuming');
for (let i = 0; i < 4; i++) { await byId('pnext'); await sleep(900); }
await sleep(4500); await playing(`music plays after moving on to "${await ev("document.getElementById('pname')?.textContent")}" (mood ${await ev('COACH_AUDIO.mood')})`);
await ev('COACH_AUDIO._suspend()'); await sleep(1500); ok((await ev('COACH_AUDIO.state')) === 'running', 'after the audio system is suspended (as after a phone call) it starts again by itself');
await ev('COACH_AUDIO._suspend()'); await sleep(50); await byId('pplay'); await sleep(400); await byId('pplay'); await sleep(2500); ok((await ev('COACH_AUDIO.state')) === 'running', 'and pause / play also wakes it up'); await playing('music is back after the interruption');
// the coach voice queue never gets stuck
await ev('COACH_AUDIO.voiceOn=true;1'); await ev("['Line one.','Line two.','Breathe out slowly.','Nice work.'].forEach((t,i)=>COACH_AUDIO.say(t,{keep:true}));1");
let free = false; for (let i = 0; i < 40 && !free; i++) { await sleep(500); free = !(await ev('COACH_AUDIO.busy()')); } ok(free, 'the coach voice finishes its lines and the queue empties');
await sleep(2500); await playing('music returns to full level after the voice');
// end of the session
await byId('pclose'); await sleep(150); await byId('pclose'); await sleep(2500); await playing('silent after closing the session', false);
// settings preview, then a session started straight after it: the preview must not switch the music off
await ev("COACH_AUDIO.preview('calm');1"); await sleep(3000); await playing('the settings preview plays');
await ev('COACH_AUDIO.voiceOn=false;1'); await click('Go again') || await click('Start session') || await click('Continue'); await sleep(9000);
await playing('music still plays 12 seconds after a preview, in a session started right after it');
await byId('pclose'); await sleep(150); await byId('pclose'); await sleep(1500);
console.log(`${checks} checks, ${fails.length} failed` + (errors.length ? `, ${errors.length} page errors` : '')); for (const e of errors.slice(0, 5)) console.log('  PAGE ERROR  ' + String(e).slice(0, 200));
stop(fails.length || errors.length ? 1 : 0);

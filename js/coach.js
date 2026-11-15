/* Coach audio: a calm guiding voice (Web Speech) and generated music (Web Audio), fully offline.
   Music moods: 'energy' (upbeat, for warm-ups and strength), 'flow' (lighter groove, for stretching and easy walking),
   'calm' (soft pads, for breathing and the body scan), 'off'. The music ducks under the voice, changes its layers
   every few bars so it does not get boring, and crossfades when the mood changes. */
const COACH_AUDIO = (() => {
  let ctx = null, master, music, sfx, noise = null, mood = 'off', want = 'off', timer = null, step = 0, nextT = 0, bpm = 112;
  let musicOn = true, voiceOn = true, paused = false, speaking = 0, voice = null, onLine = null, vol = 0.5;
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  try { musicOn = LS('coach.music') !== '0'; voiceOn = LS('coach.voice') !== '0'; } catch (e) {}

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(master);
    music = ctx.createGain(); music.gain.value = 0; music.connect(comp);
    sfx = ctx.createGain(); sfx.gain.value = 0.5; sfx.connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // unlock speech on iOS: speak an empty utterance inside the first tap
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) {}
  }

  /* ---------- voice ---------- */
  const PREF = ['Samantha', 'Serena', 'Karen', 'Moira', 'Tessa', 'Google UK English Female', 'Microsoft Libby', 'Microsoft Sonia', 'Microsoft Aria', 'Microsoft Jenny', 'Google US English', 'Daniel'];
  function voices() { try { return speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); } catch (e) { return []; } }
  function pickVoice() { const vs = voices(), saved = LS('coach.voiceName'); voice = vs.find(v => v.name === saved) || PREF.map(n => vs.find(v => v.name.includes(n))).find(Boolean) || vs.find(v => v.localService) || vs[0] || null; }
  try { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); } catch (e) {}
  const queue = [];
  function duck(on) { if (!ctx) return; const t = ctx.currentTime, target = musicOn && !paused && mood !== 'off' ? (on ? 0.32 : 1) * level() : 0; music.gain.cancelScheduledValues(t); music.gain.setTargetAtTime(target, t, on ? 0.12 : 0.6); }
  const level = () => (mood === 'calm' ? 0.22 : mood === 'flow' ? 0.3 : 0.34) * vol * 2;
  /* say(text, {urgent}) : urgent cancels what is queued (used for "switch sides", "rest", the next exercise) */
  function say(text, o = {}) {
    if (!text) return; onLine && onLine(text);
    if (!voiceOn || paused || !('speechSynthesis' in window)) return;
    if (o.urgent) { queue.length = 0; try { speechSynthesis.cancel(); } catch (e) {} speaking = 0; }
    if (queue.length > 1 && !o.keep) return;           // never pile up chatter
    const u = new SpeechSynthesisUtterance(text.replace(/\s*\([^)]*\)/g, ''));
    if (voice) u.voice = voice; u.lang = voice ? voice.lang : 'en-GB'; u.rate = o.rate || 0.94; u.pitch = 1; u.volume = 1;
    u.onstart = () => { speaking++; duck(true); };
    u.onend = u.onerror = () => { speaking = Math.max(0, speaking - 1); queue.shift(); if (!speaking) duck(false); };
    queue.push(u); try { speechSynthesis.speak(u); } catch (e) {}
  }
  const busy = () => { try { return speechSynthesis.speaking || speechSynthesis.pending; } catch (e) { return false; } };
  function hush() { queue.length = 0; try { speechSynthesis.cancel(); } catch (e) {} speaking = 0; duck(false); }

  /* ---------- music ---------- */
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  // I-V-vi-IV in C for energy (bright, happy); slower IV-I-vi-V colour for flow; open maj7 pads for calm
  const PROG = { energy: [[48, 52, 55, 60], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]],
    flow: [[41, 48, 52, 57], [48, 52, 55, 59], [45, 52, 55, 60], [43, 50, 55, 59]],
    calm: [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 62]] };
  function env(g, t, a, peak, dcy, sus = 0.0001) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + dcy); }
  function osc(type, f, t, dur, peak, a = 0.005, dest = music, filt) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; env(g, t, a, peak, dur);
    if (filt) { const bq = ctx.createBiquadFilter(); bq.type = 'lowpass'; bq.frequency.value = filt; bq.Q.value = 2; o.connect(bq); bq.connect(g); } else o.connect(g);
    g.connect(dest); o.start(t); o.stop(t + a + dur + 0.05); return o; }
  function kick(t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); env(g, t, 0.003, 0.9, 0.28); o.connect(g); g.connect(music); o.start(t); o.stop(t + 0.35); }
  function hat(t, v = 0.12, len = 0.035) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7500; env(g, t, 0.002, v, len); s.connect(f); f.connect(g); g.connect(music); s.start(t, Math.random() * 0.5); s.stop(t + len + 0.05); }
  function clap(t) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.8; env(g, t, 0.003, 0.32, 0.16); s.connect(f); f.connect(g); g.connect(music); s.start(t, Math.random() * 0.5); s.stop(t + 0.25); }
  function pad(chord, t, dur, peak) { chord.forEach((m, i) => { [0, 7].forEach(dt => { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = hz(m + 12); o.detune.value = dt - 3;
    f.type = 'lowpass'; f.frequency.value = 900; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak / chord.length, t + dur * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
    o.connect(f); f.connect(g); g.connect(music); o.start(t); o.stop(t + dur + 0.7); }); }); }
  /* one 16th step; bar = 16 steps; sections of 8 bars rotate the layers */
  function tick(t) {
    const m = mood, s = step % 16, bar = Math.floor(step / 16), sec = Math.floor(bar / 8) % 4, ch = PROG[m === 'off' ? 'calm' : m][bar % 4], q = 60 / bpm / 4;
    if (m === 'energy') {
      const drop = sec === 3 && bar % 8 < 4;                             // short breakdown keeps it interesting
      if (!drop && s % 4 === 0) kick(t);
      if (s % 4 === 2) hat(t, 0.14); else if (sec >= 1 && s % 2 === 1) hat(t, 0.05);
      if (sec >= 2 && (s === 4 || s === 12)) clap(t);
      if (!drop && [2, 6, 10, 14].includes(s)) osc('triangle', hz(ch[0] - 12), t, q * 1.6, 0.42, 0.005, music, 700);
      if (sec !== 0 || bar % 8 >= 4) { const pat = sec === 2 ? [0, 2, 1, 3, 2, 1, 3, 2] : [0, 1, 2, 3, 2, 1, 2, 3]; if (s % 2 === 0) osc('square', hz(ch[pat[(s / 2) % 8]] + 12), t, q * 1.2, 0.05, 0.004, music, 2600); }
      if (s === 0 && (sec === 3 || bar % 4 === 0)) pad(ch, t, q * 16 * (sec === 3 ? 1 : 4) - 0.1, sec === 3 ? 0.12 : 0.06);
    } else if (m === 'flow') {
      if (s === 0 || s === 10) osc('sine', hz(ch[0] - 12), t, q * 5, 0.32, 0.01);
      if (s % 4 === 2) hat(t, 0.045, 0.05);
      if (s % 3 === 0 && s < 15) osc('triangle', hz(ch[(s / 3) % 4] + 12), t, q * 3, 0.07, 0.01, music, 2200);
      if (s === 0 && bar % 2 === 0) pad(ch, t, q * 32 - 0.1, 0.07);
    } else if (m === 'calm') {
      if (s === 0 && bar % 2 === 0) pad(ch, t, q * 32 - 0.2, 0.1);
      if (s === 8 && bar % 2 === 1) osc('sine', hz(ch[3] + 12), t, 2.5, 0.05, 0.02);
    }
    step++;
  }
  function loop() { if (!ctx) return; while (nextT < ctx.currentTime + 0.15) { if (mood !== 'off' && !paused && musicOn) tick(nextT); nextT += 60 / bpm / 4; } }
  function setMood(m) {
    want = m; if (!ctx) return;
    if (m === mood) { duck(speaking > 0); return; }
    const t = ctx.currentTime; music.gain.cancelScheduledValues(t); music.gain.setTargetAtTime(0, t, 0.35);
    setTimeout(() => { if (want !== m) return; mood = m; bpm = m === 'energy' ? 112 : m === 'flow' ? 92 : 60; step = 0; nextT = ctx.currentTime + 0.05; duck(speaking > 0); }, 900);
    if (!timer) timer = setInterval(loop, 25);
  }
  function chime(f = 660, v = 0.18) { if (!ctx) return; const t = ctx.currentTime; osc('sine', f, t, 0.9, v, 0.005, sfx); osc('sine', f * 2, t, 0.5, v * 0.3, 0.005, sfx); try { navigator.vibrate && navigator.vibrate(40); } catch (e) {} }
  function pause(p) { paused = p; if (p) { try { speechSynthesis.cancel(); } catch (e) {} queue.length = 0; speaking = 0; } duck(false); }
  function stop() { hush(); setMood('off'); clearInterval(timer); timer = null; }

  /* screen wake lock, so the phone does not sleep mid-session */
  let lock = null;
  async function wake(on) { try { if (on && 'wakeLock' in navigator) lock = await navigator.wakeLock.request('screen'); else if (!on && lock) { await lock.release(); lock = null; } } catch (e) {} }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && lock) wake(true); });

  return {
    init, say, busy, hush, setMood, chime, pause, stop, wake,
    get musicOn() { return musicOn; }, set musicOn(v) { musicOn = v; try { localStorage.setItem('coach.music', v ? '1' : '0'); } catch (e) {} duck(speaking > 0); },
    get voiceOn() { return voiceOn; }, set voiceOn(v) { voiceOn = v; try { localStorage.setItem('coach.voice', v ? '1' : '0'); } catch (e) {} if (!v) hush(); },
    set onLine(fn) { onLine = fn; }, voices, get voiceName() { return voice ? voice.name : ''; },
    setVoice(name) { try { localStorage.setItem('coach.voiceName', name); } catch (e) {} pickVoice(); }
  };
})();

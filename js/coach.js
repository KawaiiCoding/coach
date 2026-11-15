/* Coach audio, fully offline.
   Voice: Web Speech, ranked for quality (natural, premium and enhanced voices first), male by default, user-pickable.
   Music: an original generative score made in Web Audio, so there is nothing to license. Three moods:
     'energy' bright synth-pop at 112 bpm (warm-ups, strength): octave bass, synth chords, hand-written hooks on a
              singing synth, muted guitar or soft horn, with a groove, a lift, a chorus and a breakdown
     'flow'   laid-back swung groove at 78 bpm: electric-piano ninths, sub bass, brushes, a nylon-guitar melody (stretching)
     'calm'   still instrumental piece at 50 bpm: a crossfading bed, sparse felt piano and a cello line; no drums, no pulse
   Recorded tracks (audio/music/, prepared by tools/music.sh) replace the generated score where one exists: a funk track
   for workouts ('energy'), a peaceful piano piece for relaxation ('calm') and an acoustic track for walking ('walk').
   Stretching ('flow') stays generated. If a track cannot be loaded, the generated score for that mood plays instead.
   Tempos stay moderate on purpose: upbeat, never frantic. The music ducks under the voice and crossfades between moods. */
const COACH_AUDIO = (() => {
  let ctx = null, master, comp, music, bus, padBus, verbIn, delayIn, sfx, voiceOut, vTone, vVerb, noise = null;
  let mood = 'off', want = 'off', timer = null, step = 0, nextT = 0, bpm = 104, song = null;
  const TRACKS = { energy: 'audio/music/energy.mp3', calm: 'audio/music/calm.mp3', walk: 'audio/music/walk.mp3' }, TGAIN = 0.8, turl = {}, tfail = {}, tpos = {};
  let tel = null, tmood = null;
  let musicOn = true, voiceOn = true, paused = false, speaking = 0, voice = null, onLine = null;
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const LSset = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  musicOn = LS('coach.music') !== '0'; voiceOn = LS('coach.voice') !== '0';

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.01; comp.release.value = 0.25; comp.connect(master);
    const warm = ctx.createBiquadFilter(); warm.type = 'highshelf'; warm.frequency.value = 6000; warm.gain.value = -4; warm.connect(comp);
    music = ctx.createGain(); music.gain.value = 0; music.connect(warm);
    bus = ctx.createGain(); bus.gain.value = 1; bus.connect(music);
    padBus = ctx.createGain(); padBus.gain.value = 1; padBus.connect(bus);              // ducked by the kick (sidechain feel)
    // reverb: generated stereo impulse, no files
    const len = Math.floor(ctx.sampleRate * 2.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const verb = ctx.createConvolver(); verb.buffer = ir; const vOut = ctx.createGain(); vOut.gain.value = 0.55; verb.connect(vOut); vOut.connect(music);
    verbIn = ctx.createGain(); verbIn.connect(verb);
    // dotted-eighth echo for the hook
    const dl = ctx.createDelay(1.5), fb = ctx.createGain(), dlf = ctx.createBiquadFilter(), dOut = ctx.createGain();
    dl.delayTime.value = 0.43; fb.gain.value = 0.3; dlf.type = 'lowpass'; dlf.frequency.value = 2800; dOut.gain.value = 0.32;
    delayIn = ctx.createGain(); delayIn.connect(dl); dl.connect(dlf); dlf.connect(fb); fb.connect(dl); dlf.connect(dOut); dOut.connect(music); dOut.connect(verbIn);
    sfx = ctx.createGain(); sfx.gain.value = 0.5; sfx.connect(master);
    voiceOut = ctx.createGain(); voiceOut.gain.value = 1.15;
    // calm steps soften the coach: quieter, darker, with a little room around it (see softVoice)
    vTone = ctx.createBiquadFilter(); vTone.type = 'highshelf'; vTone.frequency.value = 3000; vTone.gain.value = 0; voiceOut.connect(vTone); vTone.connect(master);
    vVerb = ctx.createGain(); vVerb.gain.value = 0; voiceOut.connect(vVerb); vVerb.connect(verbIn);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) {}   // unlock speech on iOS
    /* one audio element plays the recorded tracks through the same music bus (so ducking and fades apply). It is started
       once here, inside the user's tap, on a silent clip: phones then allow it to play later without another tap. */
    try { tel = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='); tel.loop = true; const p = tel.play(); if (p && p.catch) p.catch(() => {});
      const tg = ctx.createGain(); tg.gain.value = TGAIN; ctx.createMediaElementSource(tel).connect(tg); tg.connect(music); } catch (e) { tel = null; }
  }

  /* ---------- voice ---------- */
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|grandma|grandpa|eddy|flo\b|reed|rocko|sandy|shelley|fred/i;
  const MALE = /\b(daniel|aaron|alex|arthur|gordon|lee|nathan|oliver|rishi|tom|evan|guy|ryan|andrew|brian|christopher|eric|roger|steffan|william|liam|thomas|george|james|davis|tony|jason|male|man)\b/i;
  const FEMALE = /samantha|karen|moira|tessa|serena|ava|allison|susan|victoria|zoe|kate|fiona|veena|nicky|joelle|libby|sonia|aria|jenny|emma|michelle|ana\b|female|martha|catherine|natasha|clara|jane|sara|amber|ashley|cora|elizabeth|nancy|monica/i;
  // Edge's neural voices ("Microsoft Andrew Online (Natural)") rank highest, then Apple premium/enhanced, then Google
  const EDGE_MALE = ['andrew', 'brian', 'guy', 'christopher', 'eric', 'ryan', 'thomas', 'william', 'roger', 'steffan', 'liam'];
  const quality = v => (/online.*natural|natural.*online/i.test(v.name) ? 8 : 0) + (/natural|neural/i.test(v.name) ? 6 : 0) + (/en-US|en-GB/i.test(v.lang) && /natural/i.test(v.name) ? 1 : 0) +
    (/microsoft/i.test(v.name) && /natural/i.test(v.name) ? Math.max(0, 3 - EDGE_MALE.findIndex(n => v.name.toLowerCase().includes(n))) * (EDGE_MALE.some(n => v.name.toLowerCase().includes(n)) ? 1 : 0) : 0) + (/premium/i.test(v.name) ? 6 : 0) + (/enhanced/i.test(v.name) ? 4 : 0) + (/online/i.test(v.name) ? 2 : 0) + (/google/i.test(v.name) ? 2 : 0) + (/en[-_](GB|US|AU|IE)/i.test(v.lang) ? 1 : 0);
  const gender = v => MALE.test(v.name) ? 'm' : FEMALE.test(v.name) ? 'f' : '';
  function allVoices() { try { return speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang) && !NOVELTY.test(v.name)); } catch (e) { return []; } }
  /* a short list of the best voices on this device: up to 3 male and 2 female, best first */
  function curated() {
    let vs = allVoices().map(v => ({ v, q: quality(v), g: gender(v) })).sort((a, b) => b.q - a.q);
    if (vs.filter(x => x.q >= 4).length >= 2) vs = vs.filter(x => x.q >= 4);     // natural voices available: hide the robotic ones
    const seen = new Set(), key = v => v.name.replace(/^(Microsoft|Google|Apple)\s+/i, '').split(/[\s(-]/)[0].toLowerCase(), pickG = (g, n) => vs.filter(x => x.g === g && !seen.has(key(x.v))).filter(x => (seen.add(key(x.v)), true)).slice(0, n);
    const out = [...pickG('m', 3), ...pickG('f', 2)];
    if (out.length < 3) vs.filter(x => !out.includes(x)).slice(0, 3 - out.length).forEach(x => out.push(x));
    return out.map(x => ({ name: x.v.name, lang: x.v.lang, gender: x.g, hq: x.q >= 4, natural: /natural|neural|premium/i.test(x.v.name), voice: x.v }));
  }
  function pickVoice() { const saved = LS('coach.voiceName'), vs = allVoices(), c = curated(); voice = vs.find(v => v.name === saved && saved !== CLIPS) || (c.find(x => x.gender === 'm') || c[0] || {}).voice || null; }
  try { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); } catch (e) {}
  /* recorded voice: every coach line pre-recorded with a natural neural voice (Andrew), see tools/record_voice.py.
     A line is matched by a short hash of its normalised text; anything not recorded falls back to the device voice. */
  const clipKey = t => t.replace(/\s*\([^)]*\)/g, '').replace(/…/g, '...').replace(/[“”]/g, '"').trim().replace(/\s+/g, ' ').toLowerCase();
  const clipId = t => { let h = 0x811c9dc5; for (const ch of clipKey(t)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); };
  let clips = null, clipExt = 'mp3';
  const CLIPS = '__clips', clipWaiters = [];
  // load the list of recorded clips fresh (never a stale cache), retry a few times, and tell the UI when it arrives
  function loadIndex(tries = 0) {
    try { fetch('audio/coach/index.json', { cache: 'no-cache' }).then(r => r.ok && /json/.test(r.headers.get('content-type') || 'json') ? r.json() : Promise.reject())
      .then(j => { if (!j || !Array.isArray(j.files)) throw 0; clips = new Set(j.files); clipExt = j.ext || 'mp3';
        if (LS('coach.voiceDefault') !== '2') { LSset('coach.voiceName', CLIPS); LSset('coach.voiceDefault', '2'); }   // recorded Andrew becomes the default once
        clipWaiters.splice(0).forEach(f => f()); })
      .catch(() => { if (tries < 5) setTimeout(() => loadIndex(tries + 1), 1500 * (tries + 1)); });
    } catch (e) {}
  }
  loadIndex();
  useClips = () => !!clips && (LS('coach.voiceName') || CLIPS) === CLIPS;
  const bufs = new Map();
  const load = h => { if (!bufs.has(h)) bufs.set(h, fetch(`audio/coach/${h}.${clipExt}`).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(a => ctx.decodeAudioData(a))); return bufs.get(h); };
  function prefetch(lines) { if (!ctx || !useClips()) return; (lines || []).filter(Boolean).forEach(l => { const h = clipId(l); if (clips.has(h)) load(h).catch(() => bufs.delete(h)); }); }
  const level = () => mood === 'calm' ? 0.95 : mood === 'flow' || mood === 'walk' ? 0.5 : 0.55;
  /* recorded tracks: fetched whole (so the service worker keeps them for offline use) and played from memory as a blob;
     each mood remembers where it stopped, so coming back to a mood continues the track instead of restarting it */
  const generated = m => !TRACKS[m] || !tel || tfail[m];
  function trackUrl(m) { if (!turl[m]) turl[m] = fetch(TRACKS[m]).then(r => { if (!r.ok) throw 0; return r.blob(); }).then(b => URL.createObjectURL(b)); return turl[m]; }
  function stopTrack() { if (!tel || !tmood) return; tpos[tmood] = tel.currentTime || 0; tmood = null; try { tel.pause(); } catch (e) {} }
  function startTrack(m) { if (generated(m) || tmood === m) return;
    trackUrl(m).then(u => { if (mood !== m || tmood === m) return; stopTrack(); tel.src = u; tel.loop = true; tmood = m;
      const go = () => { try { if (tpos[m] && isFinite(tel.duration) && tpos[m] < tel.duration - 5) tel.currentTime = tpos[m]; } catch (e) {} if (!paused) { const p = tel.play(); if (p && p.catch) p.catch(() => { tmood = null; tfail[m] = true; }); } };
      tel.addEventListener('loadedmetadata', go, { once: true }); tel.load(); })
      .catch(() => { delete turl[m]; tfail[m] = true; }); }
  const isCalm = () => want === 'calm' || mood === 'calm';
  /* in the calm mood the music only dips a little under the voice, and slowly, so breathing cues never make it pump */
  function duck(on) { if (!ctx) return; const c = mood === 'calm', t = ctx.currentTime, target = musicOn && !paused && mood !== 'off' ? (on ? (c ? 0.72 : 0.35) : 1) * level() : 0; music.gain.cancelScheduledValues(t); music.gain.setTargetAtTime(target, t, c ? (on ? 0.6 : 1.4) : on ? 0.12 : 0.7); }
  function softVoice() { if (!ctx) return; const c = isCalm(), t = ctx.currentTime; voiceOut.gain.setTargetAtTime(c ? 0.6 : 1, t, 0.2); vTone.gain.setTargetAtTime(c ? -9 : -4, t, 0.2); vVerb.gain.setTargetAtTime(c ? 0.2 : 0.07, t, 0.2); }   // exercise: a touch softer; calm: clearly softer
  function utter(text, v, rate) { const u = new SpeechSynthesisUtterance(text.replace(/\s*\([^)]*\)/g, '')); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
    const male = v && gender(v) === 'm'; const c = isCalm(); u.rate = (rate || (male ? 0.95 : 0.93)) * (c ? 0.94 : 1); u.pitch = (male ? 0.92 : 1) * (c ? 0.96 : 1); u.volume = c ? 0.55 : 1; return u; }
  /* one queue for recorded clips and device speech */
  const queue = []; let cur = null;
  function next() { if (cur) return; if (!queue.length || paused) { duck(false); return; } cur = start(queue.shift()); }
  function start(it) {
    let done = false, src = null; const h = clipId(it.text);
    const fin = () => { if (done) return; done = true; cur = null; next(); };
    const tts = () => { if (done) return; if (!('speechSynthesis' in window)) return fin(); const u = utter(it.text, voice, it.o.rate); u.onend = u.onerror = fin; try { speechSynthesis.speak(u); } catch (e) { fin(); } };
    duck(true); softVoice();
    if (ctx && useClips() && clips.has(h)) load(h).then(b => { if (done) return; src = ctx.createBufferSource(); src.buffer = b; src.connect(voiceOut); src.onended = fin; src.start(); }).catch(() => { bufs.delete(h); tts(); });
    else tts();
    return { stop() { done = true; try { src && src.stop(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} } };
  }
  function say(text, o = {}) {
    if (!text) return; onLine && onLine(text);
    if (!voiceOn || paused) return;
    if (o.urgent) { queue.length = 0; if (cur) { cur.stop(); cur = null; } }
    if (queue.length > 1 && !o.keep) return;             // never pile up chatter
    queue.push({ text, o }); next();
  }
  const SAMPLE = 'Hi, I am your coach. Breathe in, and let your shoulders drop. Nice work.';
  function sample(name) { init(); hush(); if (name === CLIPS) { const prev = LS('coach.voiceName'); LSset('coach.voiceName', CLIPS); say(SAMPLE, { urgent: true }); if (prev && prev !== CLIPS) LSset('coach.voiceName', prev); return; }
    try { const v = allVoices().find(x => x.name === name); speechSynthesis.speak(utter(SAMPLE, v)); } catch (e) {} }
  const busy = () => !!cur || queue.length > 0;
  function hush() { queue.length = 0; if (cur) { cur.stop(); cur = null; } duck(false); }

  /* ---------- instruments ---------- */
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function out(g, o) {            // route a voice: optional pan, dry bus, reverb and echo sends
    let node = g; if (o.pan && ctx.createStereoPanner) { const pn = ctx.createStereoPanner(); pn.pan.value = o.pan; g.connect(pn); node = pn; }
    node.connect(o.dest || bus);
    if (o.verb) { const sg = ctx.createGain(); sg.gain.value = o.verb; node.connect(sg); sg.connect(verbIn); }
    if (o.echo) { const sg = ctx.createGain(); sg.gain.value = o.echo; node.connect(sg); sg.connect(delayIn); }
  }
  function tone(t, o) {
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t); if (o.det) osc.detune.value = o.det;
    if (o.fTo) osc.frequency.exponentialRampToValueAtTime(o.fTo, t + (o.fT || 0.1));
    if (o.scoop) { osc.detune.setValueAtTime(-o.scoop, t); osc.detune.linearRampToValueAtTime(0, t + 0.07); }
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(o.vib, t + 0.25); l.connect(lg); lg.connect(osc.detune); l.start(t); l.stop(t + (o.dur || 0.2) + (o.r || 0.15) + 0.1); }
    let node = osc; if (o.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = o.q || 0.8; f.frequency.setValueAtTime(o.lp, t); if (o.lpTo) f.frequency.exponentialRampToValueAtTime(o.lpTo, t + (o.lpT || 0.25)); osc.connect(f); node = f; }
    const a = o.a || 0.005, d = o.d || 0.1, sus = o.s ?? 0.6, hold = Math.max(a + d, o.dur || 0.2), r = o.r || 0.15, pk = o.v || 0.2;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.linearRampToValueAtTime(Math.max(0.0001, pk * sus), t + a + d); g.gain.setValueAtTime(Math.max(0.0001, pk * sus), t + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + hold + r);
    node.connect(g); out(g, o); osc.start(t); osc.stop(t + hold + r + 0.05);
  }
  function hit(t, o) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = o.type || 'highpass'; f.frequency.value = o.f || 8000; if (o.q) f.Q.value = o.q;
    g.gain.setValueAtTime(o.v || 0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (o.len || 0.05)); s.connect(f); f.connect(g); out(g, o);
    s.start(t, Math.random() * 0.5); s.stop(t + (o.len || 0.05) + 0.05);
  }
  /* ---------- kit ---------- */
  const kick = (t, v = 0.8) => { tone(t, { f: 110, fTo: 42, fT: 0.12, v, a: 0.002, d: 0.1, s: 0.45, dur: 0.14, r: 0.18 });
    padBus.gain.cancelScheduledValues(t); padBus.gain.setValueAtTime(0.45, t); padBus.gain.linearRampToValueAtTime(1, t + 0.28); };
  const softKick = (t, v = 0.45) => tone(t, { f: 90, fTo: 48, fT: 0.09, v, a: 0.004, d: 0.1, s: 0.3, dur: 0.12, r: 0.2 });
  const clap = (t, v = 0.18) => [0, 0.012, 0.025].forEach(o => hit(t + o, { type: 'bandpass', f: 1350, q: 0.8, v: v * (o ? 0.6 : 1), len: o === 0.025 ? 0.19 : 0.03, verb: 0.35 }));
  const snare = (t, v = 0.1) => { hit(t, { type: 'bandpass', f: 2000, q: 0.7, v, len: 0.1, verb: 0.2 }); tone(t, { type: 'triangle', f: 200, fTo: 150, fT: 0.05, v: v * 0.7, a: 0.001, d: 0.05, s: 0, dur: 0.05, r: 0.04 }); };
  const brush = (t, v = 0.045) => hit(t, { type: 'bandpass', f: 1700, q: 0.5, v, len: 0.16, verb: 0.3 });
  const hat = (t, v = 0.05, open, pan = 0.25) => hit(t, { f: open ? 6800 : 9200, v, len: open ? 0.22 : 0.03, pan });
  const crash = (t, v = 0.06) => hit(t, { f: 4800, v, len: 1.5, verb: 0.5 });
  /* ---------- instruments ---------- */
  // plucky synth bass: sub sine under a saw whose filter snaps shut
  const bass = (t, m, dur, v = 0.26) => { tone(t, { f: hz(m), v, a: 0.004, d: 0.08, s: 0.7, dur, r: 0.05 }); tone(t, { type: 'sawtooth', f: hz(m), v: v * 0.34, lp: 1400, lpTo: 260, lpT: 0.12, q: 2, a: 0.003, d: 0.1, s: 0.4, dur, r: 0.05 }); };
  const sub = (t, m, dur, v = 0.24) => tone(t, { f: hz(m), v, a: 0.02, d: 0.2, s: 0.8, dur, r: 0.12 });
  const pad = (t, notes, dur, v = 0.045, lp = 1500, verb = 0.35, lpTo) => notes.forEach((m, i) => [-8, 8].forEach(det => tone(t, { type: 'sawtooth', f: hz(m), det, v: v / notes.length, lp, lpTo, lpT: dur * 0.5, a: Math.min(2.5, dur * 0.28), d: 0.2, s: 0.9, dur: dur * 0.85, r: Math.min(3, dur * 0.45), dest: padBus, verb, pan: (i % 2 ? 0.35 : -0.35) })));
  // short, bright synth chord
  const stab = (t, notes, v = 0.045) => notes.forEach((m, i) => [-6, 6].forEach(det => tone(t, { type: 'sawtooth', f: hz(m), det, v: v * 0.5, lp: 4200, lpTo: 700, lpT: 0.16, q: 1.2, a: 0.004, d: 0.14, s: 0.1, dur: 0.14, r: 0.16, verb: 0.2, pan: i % 2 ? 0.25 : -0.25 })));
  const arp = (t, m, v = 0.02, pan = 0) => tone(t, { type: 'triangle', f: hz(m), v, a: 0.003, d: 0.1, s: 0, dur: 0.1, r: 0.08, echo: 0.25, pan });
  // three leads, none of them a mallet: a singing synth, a muted guitar and a soft horn
  const synth = (t, m, dur, v = 0.05) => tone(t, { type: 'square', f: hz(m), v, lp: 2600, lpTo: 1300, lpT: 0.2, a: 0.012, d: 0.12, s: 0.7, dur, r: 0.14, vib: 9, scoop: 40, echo: 0.28, verb: 0.25, pan: 0.1 });
  const guitar = (t, m, dur, v = 0.09) => { tone(t, { type: 'triangle', f: hz(m), v, a: 0.002, d: 0.32, s: 0.12, dur: Math.max(0.2, dur), r: 0.25, echo: 0.3, verb: 0.2, pan: -0.15 }); tone(t, { type: 'sawtooth', f: hz(m), v: v * 0.25, lp: 2600, lpTo: 500, lpT: 0.1, a: 0.002, d: 0.09, s: 0, dur: 0.09, r: 0.06, pan: -0.15 }); };
  const horn = (t, m, dur, v = 0.06) => [-5, 5].forEach(det => tone(t, { type: 'sawtooth', f: hz(m), det, v: v * 0.5, lp: 900, lpTo: 1900, lpT: 0.12, a: 0.035, d: 0.15, s: 0.75, dur, r: 0.16, echo: 0.18, verb: 0.3 }));
  const LEAD = { synth, guitar, horn };
  // warm electric piano for the stretching groove
  const rhodes = (t, notes, dur, v = 0.04) => notes.forEach((m, i) => { tone(t, { f: hz(m), v, a: 0.01, d: 0.9, s: 0.3, dur, r: 0.7, verb: 0.35, echo: 0.08, pan: i % 2 ? 0.3 : -0.3 }); tone(t, { f: hz(m) * 2, v: v * 0.12, a: 0.008, d: 0.35, s: 0, dur: 0.35, r: 0.2, pan: i % 2 ? 0.3 : -0.3 }); });
  const nylon = (t, m, dur, v = 0.07) => { tone(t, { type: 'triangle', f: hz(m), v, a: 0.004, d: 0.6, s: 0.1, dur: Math.max(0.5, dur), r: 0.5, verb: 0.4, echo: 0.15, pan: 0.15 }); tone(t, { f: hz(m) * 2, v: v * 0.1, a: 0.003, d: 0.2, s: 0, dur: 0.2, r: 0.1, pan: 0.15 }); };
  /* calm bed: pure, barely detuned tones that fade in and out in straight lines, so each chord crossfades into the next
     at a constant level. No beating, no retriggered swell, nothing that pulses. */
  const drone = (t, notes, dur, v = 0.12, lp = 900, xf = 5) => notes.forEach((m, i) => [['sine', 0, 1], ['sine', 5, 0.2], ['triangle', -4, 0.16]].forEach(([type, det, k]) => {
    const osc = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), pk = v * k / notes.length; osc.type = type; osc.frequency.value = hz(m); osc.detune.value = det; f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = 0.3;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + xf); g.gain.setValueAtTime(pk, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + xf);
    osc.connect(f); f.connect(g); out(g, { verb: 0.7, pan: notes.length > 1 ? (i % 2 ? 0.3 : -0.3) : 0 }); osc.start(t); osc.stop(t + dur + xf + 0.1); }));
  const felt = (t, m, v = 0.05, pan = 0) => { tone(t, { f: hz(m), v, a: 0.04, d: 2, s: 0.1, dur: 2, r: 3, verb: 0.8, pan }); tone(t, { f: hz(m) * 2, v: v * 0.13, a: 0.04, d: 0.8, s: 0, dur: 0.8, r: 0.6, verb: 0.5, pan }); };
  // cello-like line: dark, slow bow, a little vibrato
  const cello = (t, m, dur, v = 0.05) => [-4, 4].forEach(det => tone(t, { type: 'sawtooth', f: hz(m), det, v: v * 0.5, lp: 520, lpTo: 760, lpT: dur * 0.5, a: 1.4, d: 0.5, s: 0.9, dur, r: 2.6, vib: 4, verb: 0.75, pan: -0.2 }));
  // noise riser into the chorus
  const swell = (t, up, down, v, f0, f1) => { const sN = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); sN.buffer = noise; sN.loop = true; f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + up);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + up); g.gain.exponentialRampToValueAtTime(0.0001, t + up + down); sN.connect(f); f.connect(g); out(g, { verb: 0.4 }); sN.start(t, Math.random()); sN.stop(t + up + down + 0.1); };

  /* ---------- songs: original material. A song is a key, a four-chord loop and hand-written phrases; all loops are
     diatonic to the key, so every phrase (written on the major pentatonic) sits on every chord. ---------- */
  const ROOTS = [46, 48, 50, 52, 53];                                     // Bb, C, D, E, F
  const PROGS = [
    [[-3, [0, 3, 7]], [-7, [0, 4, 7]], [0, [0, 4, 7]], [-5, [0, 4, 7]]],   // vi IV I V
    [[0, [0, 4, 7]], [4, [0, 3, 7]], [5, [0, 4, 7]], [-5, [0, 4, 7]]],     // I iii IV V
    [[-7, [0, 4, 7]], [-5, [0, 4, 7]], [-3, [0, 3, 7]], [0, [0, 4, 7]]],   // IV V vi I
    [[2, [0, 3, 7]], [-5, [0, 4, 7]], [0, [0, 4, 7]], [-3, [0, 3, 7]]]     // ii V I vi
  ];
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19];
  /* phrases: [step, pentatonic degree, length in 16ths]. Workout hooks span 2 bars (32 steps). */
  const HOOKS = [
    [[0, 4, 2], [2, 4, 1], [3, 3, 1], [4, 4, 2], [8, 5, 3], [11, 4, 1], [12, 3, 4], [16, 2, 2], [18, 3, 2], [20, 4, 2], [22, 3, 2], [24, 2, 3], [27, 1, 1], [28, 2, 4]],
    [[0, 2, 1], [1, 3, 1], [2, 4, 2], [6, 4, 2], [8, 5, 2], [10, 4, 2], [12, 3, 4], [16, 2, 1], [17, 3, 1], [18, 4, 2], [22, 5, 2], [24, 6, 2], [26, 5, 2], [28, 4, 4]],
    [[2, 5, 2], [4, 5, 2], [6, 4, 1], [7, 3, 1], [8, 4, 4], [14, 3, 2], [18, 4, 2], [20, 4, 2], [22, 3, 1], [23, 2, 1], [24, 3, 4], [28, 2, 4]],
    [[0, 6, 3], [3, 5, 1], [4, 4, 4], [8, 5, 3], [11, 4, 1], [12, 3, 4], [16, 4, 3], [19, 3, 1], [20, 2, 4], [24, 3, 2], [26, 4, 2], [28, 5, 4]],
    [[0, 3, 2], [3, 3, 1], [4, 5, 2], [6, 4, 2], [10, 3, 2], [12, 2, 4], [16, 3, 2], [19, 3, 1], [20, 5, 2], [22, 6, 2], [26, 5, 2], [28, 4, 4]]
  ];
  const FLOWS = [
    [[0, 4, 4], [6, 3, 2], [8, 2, 6], [18, 3, 2], [20, 4, 4], [26, 5, 2], [28, 4, 4]],
    [[2, 2, 2], [4, 3, 4], [10, 4, 2], [12, 5, 4], [20, 4, 2], [22, 3, 2], [24, 2, 6]],
    [[0, 5, 6], [8, 4, 2], [10, 3, 4], [16, 2, 4], [22, 3, 2], [24, 4, 6]]
  ];
  /* calm piano phrases span 4 bars (64 steps): [step, degree]. Unevenly spaced on purpose, so there is no beat to feel. */
  const CALM = [
    [[0, 4], [10, 5], [16, 6], [30, 5], [36, 4], [48, 2]],
    [[4, 2], [12, 3], [20, 4], [32, 6], [42, 5], [52, 4]],
    [[0, 5], [8, 4], [20, 2], [32, 3], [40, 4], [56, 3]],
    [[2, 6], [14, 5], [24, 4], [34, 2], [46, 3], [56, 4]]
  ];
  const BASS_G = [[0, 0, 2], [3, 0, 1], [4, 12, 1], [6, 0, 2], [10, 0, 1], [11, 12, 1], [12, 0, 2], [14, 7, 2]];
  const STAB = [0, 3, 6, 10, 12];
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  function newSong() { return { k: { root: pickOne(ROOTS), prog: pickOne(PROGS) }, hook: pickOne(HOOKS), hook2: pickOne(HOOKS), flow: pickOne(FLOWS), lead: pickOne(['synth', 'guitar', 'horn']), calm: pickOne(CALM) }; }
  /* workout form, in bars; after the breakdown it returns to the groove in a new key with new hooks */
  const FORM = [['intro', 4], ['groove', 8], ['lift', 4], ['chorus', 8], ['break', 4]], FLEN = 28;
  function section(bar) { let b = bar >= FLEN ? 4 + (bar - FLEN) % (FLEN - 4) : bar, acc = 0; for (const [n, l] of FORM) { if (b < acc + l) return [n, b - acc, l]; acc += l; } return ['groove', 0, 8]; }

  function tick(t) {
    const s = step % 16, bar = Math.floor(step / 16), q = 60 / bpm / 4;
    if (!song) song = newSong();
    if (mood === 'energy' && s === 0 && bar >= FLEN && section(bar)[0] === 'groove' && section(bar)[1] === 0) song = newSong();
    const K = song.k, [off, voicing] = K.prog[bar % 4], R = K.root + off, chord = voicing.map(v => R + 12 + v), ps = (bar % 2) * 16 + s;
    if (mood === 'energy') {
      const [sec, inSec, len] = section(bar), last = inSec === len - 1, tt = t + (s % 2 ? q * 0.08 : 0), chorus = sec === 'chorus', groove = sec === 'groove', lift = sec === 'lift';
      if (s === 0 && inSec === 0 && sec !== 'intro') crash(t, chorus ? 0.075 : 0.045);
      if ((groove || chorus) && s % 4 === 0) kick(t, chorus ? 0.82 : 0.72);
      if (lift && s % 4 === 0 && !(last && s >= 8)) kick(t, 0.7);                                       // the kick drops out just before the chorus
      if (sec === 'intro' && inSec >= 2 && s % 8 === 0) kick(t, 0.5);
      if ((groove || chorus) && (s === 4 || s === 12)) clap(t, chorus ? 0.2 : 0.15);
      if (lift && (s === 4 || s === 12 || (last && s >= 8))) snare(t, last && s >= 8 ? 0.05 + (s - 8) * 0.012 : 0.09);   // roll into the chorus
      if (sec !== 'break' && s % 4 === 2) hat(tt, 0.05, chorus);
      if ((chorus || lift) && s % 2 === 1) hat(tt, 0.02, false, -0.25);
      if (groove) BASS_G.filter(n => n[0] === s).forEach(n => bass(tt, R - 12 + n[1], q * n[2] * 0.9));
      if ((chorus || lift) && s % 2 === 0) bass(tt, R - 12 + (s % 4 === 2 ? 12 : 0), q * 1.6, 0.24);  // driving octaves
      if (sec === 'intro' && inSec >= 2 && s === 0) bass(t, R - 12, q * 6, 0.2);
      if (s === 0) pad(t, chord, q * 16, sec === 'break' ? 0.07 : 0.042, sec === 'intro' ? 500 + inSec * 300 : sec === 'break' ? 900 : lift ? 1100 + inSec * 400 : 1600, 0.35, sec === 'break' ? 2400 : undefined);
      if ((chorus || (lift && inSec >= 2)) && STAB.includes(s)) stab(tt, chord, chorus ? 0.045 : 0.035);
      if (chorus && s % 2 === 1) arp(tt, chord[(s >> 1) % 3] + 12, 0.018, s % 4 === 1 ? 0.4 : -0.4);
      const hk = chorus && bar % 4 >= 2 ? song.hook2 : song.hook;
      if ((groove && inSec >= 4) || chorus) hk.filter(n => n[0] === ps).forEach(n => LEAD[song.lead](tt, K.root + 24 + PENTA[n[1]], q * n[2] * 0.9));
      if (sec === 'break') song.hook.filter(n => n[0] === ps && n[2] >= 2).forEach(n => guitar(tt, K.root + 24 + PENTA[n[1]], q * n[2], 0.07));
      if (lift && inSec === len - 2 && s === 0) swell(t, q * 30, 0.08, 0.06, 500, 7000);
    } else if (mood === 'flow' || mood === 'walk') {      // 'walk' only gets here when its recorded track is unavailable
      const tt = t + (s % 2 ? q * 0.22 : 0), minor = voicing[1] === 3, dom = ((off % 12) + 12) % 12 === 7, c9 = chord.concat([R + 12 + (minor || dom ? 10 : 11), R + 24 + 2]);
      if (s === 0 || s === 10) softKick(tt, 0.44); if (s === 7) softKick(tt, 0.22);
      if (s === 4 || s === 12) brush(tt);
      if (s % 2 === 0) hat(tt, s % 4 === 2 ? 0.03 : 0.014);
      [[0, 0, 6], [10, 7, 2], [12, 0, 3]].filter(n => n[0] === s).forEach(n => sub(tt, R - 12 + n[1], q * n[2]));
      if (s === 0) rhodes(t, c9, q * 9); if (s === 10) rhodes(tt, c9.slice(1, 4), q * 4, 0.026);
      if (bar % 8 >= 2) song.flow.filter(n => n[0] === ps).forEach(n => nylon(tt, K.root + 24 + PENTA[n[1]], q * n[2]));
      if (s === 0 && bar % 2 === 0) pad(t, chord, q * 32, 0.02, 800, 0.5);
      if (s === 0 && bar % 8 === 7) song.flow = pickOne(FLOWS);
    } else if (mood === 'calm') {
      // one chord every two bars (about ten seconds): a still bed, a few unhurried piano notes, and a cello line that comes and goes
      const two = bar % 2 === 0, cc = K.prog[(bar >> 1) % 4], CR = K.root + cc[0], blk = (bar >> 2) % 4, p4 = (bar % 4) * 16 + s;
      if (s === 0 && two) { drone(t, [CR, CR + 7, CR + 12 + cc[1][1], CR + 19, CR + 24 + 2], q * 32, 0.13, 850); drone(t, [CR - 12], q * 32, 0.05, 400);
        if (blk === 1 || blk === 3) cello(t, CR + 12 + cc[1][(bar >> 1) % 2 ? 2 : 1], q * 26); }
      if (blk !== 3) song.calm.filter(n => n[0] === p4).forEach((n, i) => felt(t, K.root + 24 + PENTA[n[1]], 0.05, (n[1] % 3 - 1) * 0.3));
      if (s === 0 && bar % 4 === 3) song.calm = pickOne(CALM.filter(c => c !== song.calm));
    }
    step++;
  }
  function loop() { if (!ctx) return; while (nextT < ctx.currentTime + 0.2) { if (mood !== 'off' && !paused && musicOn && generated(mood)) tick(nextT); nextT += 60 / bpm / 4; } }
  function setMood(m) {
    want = m; if (!ctx) return;
    if (m === mood) { duck(busy()); return; }
    const t = ctx.currentTime; music.gain.cancelScheduledValues(t); music.gain.setTargetAtTime(0, t, 0.4);
    setTimeout(() => { if (want !== m) return; stopTrack(); mood = m; startTrack(m); bpm = m === 'energy' ? 112 : m === 'flow' || m === 'walk' ? 78 : 50; step = 0; song = newSong(); nextT = ctx.currentTime + 0.05; duck(busy()); }, 1000);
    if (!timer) timer = setInterval(loop, 25);
  }
  function chime(f = 660, v = 0.16) { if (!ctx) return; const t = ctx.currentTime; [0, 0.09].forEach((o, i) => { const s = ctx.createOscillator(), g = ctx.createGain(); s.frequency.value = f * (i ? 1.5 : 1); g.gain.setValueAtTime(0.0001, t + o); g.gain.linearRampToValueAtTime(v, t + o + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + o + 0.8); s.connect(g); g.connect(sfx); s.start(t + o); s.stop(t + o + 0.85); }); try { navigator.vibrate && navigator.vibrate(30); } catch (e) {} }
  function pause(p) { paused = p; if (p) hush(); duck(false); if (tel && tmood) { try { if (p) tel.pause(); else { const q = tel.play(); if (q && q.catch) q.catch(() => {}); } } catch (e) {} } }
  function stop() { hush(); setMood('off'); clearInterval(timer); timer = null; }

  let lock = null;
  async function wake(on) { try { if (on && 'wakeLock' in navigator) lock = await navigator.wakeLock.request('screen'); else if (!on && lock) { await lock.release(); lock = null; } } catch (e) {} }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && lock) wake(true); });

  /* a few seconds of a mood, for the settings preview */
  function preview(m) { init(); setMood(m); clearTimeout(preview.t); preview.t = setTimeout(() => setMood('off'), 9000); }

  /* test tap: peak and RMS of the master output */
  function meter() { if (!ctx) return null; if (!meter.a) { meter.a = ctx.createAnalyser(); meter.a.fftSize = 2048; master.connect(meter.a); } const d = new Float32Array(2048); meter.a.getFloatTimeDomainData(d); let pk = 0, sq = 0; for (const x of d) { pk = Math.max(pk, Math.abs(x)); sq += x * x; } return [pk, Math.sqrt(sq / d.length)]; }

  return {
    meter, init, say, busy, hush, setMood, chime, pause, stop, wake, curated, sample, preview,
    get musicOn() { return musicOn; }, set musicOn(v) { musicOn = v; LSset('coach.music', v ? '1' : '0'); duck(busy()); },
    get voiceOn() { return voiceOn; }, set voiceOn(v) { voiceOn = v; LSset('coach.voice', v ? '1' : '0'); if (!v) hush(); },
    set onLine(fn) { onLine = fn; }, get voiceName() { return useClips() ? CLIPS : voice ? voice.name : ''; }, get hasClips() { return !!clips; }, onClips(f) { clips ? f() : clipWaiters.push(f); }, clipId, prefetch, CLIPS, SAMPLE,
    setVoice(name) { LSset('coach.voiceName', name); pickVoice(); }
  };
})();

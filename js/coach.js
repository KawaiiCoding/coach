/* Coach audio, fully offline.
   Voice: Web Speech, ranked for quality (natural, premium and enhanced voices first), male by default, user-pickable.
   Music: the recorded tracks in audio/music/ (prepared from the originals by tools/music.sh). Nothing is generated.
     'energy'          funk track: warm-ups and strength
     'flow' and 'walk' acoustic track: stretching and easy walking
     'calm'            peaceful piano: breathing, body scan, relaxation
   Tracks are decoded once and looped by Web Audio (the path every browser allows after the first tap). Only the track
   in use is kept in memory. If a track cannot be loaded there is simply no music.
   The music ducks under the voice and fades between moods. */
const COACH_AUDIO = (() => {
  let ctx = null, master, comp, music, verbIn, sfx, voiceOut, vTone, vVerb;
  let mood = 'off', want = 'off';
  const TRACK = { energy: 'energy', flow: 'walk', walk: 'walk', calm: 'calm' }, TGAIN = 0.8;      // mood -> file in audio/music/
  let tbuf = null, tkey = null, tsrc = null, tgain = null, tstart = 0, toff = 0, tload = 0; const tpos = {};
  let musicOn = true, voiceOn = true, paused = false, speaking = 0, voice = null, onLine = null;
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const LSset = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  musicOn = LS('coach.music') !== '0'; voiceOn = LS('coach.voice') !== '0';

  const ensure = () => { if (ctx && ctx.state !== 'running' && ctx.state !== 'closed') { try { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {} } };
  function init() {
    // iPhone: play through the silent switch like a music app, instead of being muted by it
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    if (ctx) { ensure(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.01; comp.release.value = 0.25; comp.connect(master);
    const warm = ctx.createBiquadFilter(); warm.type = 'highshelf'; warm.frequency.value = 6000; warm.gain.value = -4; warm.connect(comp);
    music = ctx.createGain(); music.gain.value = 0; music.connect(warm);
    // reverb: generated stereo impulse, no files
    const len = Math.floor(ctx.sampleRate * 2.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const verb = ctx.createConvolver(); verb.buffer = ir; const vOut = ctx.createGain(); vOut.gain.value = 0.55; verb.connect(vOut); vOut.connect(master);      // only the calm coach voice uses this room
    verbIn = ctx.createGain(); verbIn.connect(verb);
    sfx = ctx.createGain(); sfx.gain.value = 0.5; sfx.connect(master);
    voiceOut = ctx.createGain(); voiceOut.gain.value = 1.15;
    // calm steps soften the coach: quieter, darker, with a little room around it (see softVoice)
    vTone = ctx.createBiquadFilter(); vTone.type = 'highshelf'; vTone.frequency.value = 3000; vTone.gain.value = 0; voiceOut.connect(vTone); vTone.connect(master);
    vVerb = ctx.createGain(); vVerb.gain.value = 0; voiceOut.connect(vVerb); vVerb.connect(verbIn);
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) {}   // unlock speech on iOS
    ctx.onstatechange = () => { if (ctx.state !== 'running' && mood !== 'off' && document.visibilityState === 'visible') setTimeout(ensure, 300); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') ensure(); });
    ['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, ensure, { passive: true }));
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
  /* ---------- music: one looping buffer at a time ---------- */
  function trackStop() { if (!tsrc) return; const sN = tsrc, g = tgain, t = ctx.currentTime; if (tkey && tbuf) tpos[tkey] = (toff + t - tstart) % tbuf.duration; tsrc = null; g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, 0.08); try { sN.stop(t + 0.5); } catch (e) {} }
  function trackPlay() { if (!ctx || !tbuf || tsrc || paused || TRACK[mood] !== tkey) return; const t = ctx.currentTime; toff = (tpos[tkey] || 0) % tbuf.duration; tstart = t;
    tsrc = ctx.createBufferSource(); tsrc.buffer = tbuf; tsrc.loop = true; tgain = ctx.createGain(); tgain.gain.setValueAtTime(0, t); tgain.gain.linearRampToValueAtTime(TGAIN, t + 0.6); tsrc.connect(tgain); tgain.connect(music); tsrc.start(t, toff); }
  /* switch to the track for mood m: keeps playing if it is the same file (stretching and walking share one), otherwise
     drops the old buffer, fetches and decodes the new one, and continues from where that track last stopped */
  function trackFor(m) { const k = TRACK[m] || null; if (k === tkey) { trackPlay(); return; }
    trackStop(); tkey = k; tbuf = null; if (!k) return; const my = ++tload;
    fetch(`audio/music/${k}.mp3`).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(a => new Promise((ok, no) => { const pr = ctx.decodeAudioData(a, ok, no); if (pr && pr.catch) pr.catch(() => {}); }))
      .then(b => { if (my !== tload) return; tbuf = b; trackPlay(); }).catch(() => { if (my === tload) tkey = null; }); }
  const isCalm = () => want === 'calm' || mood === 'calm';
  /* in the calm mood the music only dips a little under the voice, and slowly, so breathing cues never make it pump */
  function duck(on) { if (!ctx) return; const c = mood === 'calm', t = ctx.currentTime, target = musicOn && !paused && mood !== 'off' ? (on ? (c ? 0.72 : 0.35) : 1) * level() : 0; music.gain.cancelScheduledValues(t); music.gain.setTargetAtTime(target, t, !musicOn || paused ? 0.12 : c ? (on ? 0.6 : 1.4) : on ? 0.12 : 0.7); }      // muting or pausing is quick; ducking under the voice is gentle
  function softVoice() { if (!ctx) return; const c = isCalm(), t = ctx.currentTime; voiceOut.gain.setTargetAtTime(c ? 0.6 : 1, t, 0.2); vTone.gain.setTargetAtTime(c ? -9 : -4, t, 0.2); vVerb.gain.setTargetAtTime(c ? 0.2 : 0.07, t, 0.2); }   // exercise: a touch softer; calm: clearly softer
  /* device voices read abbreviations letter by letter ("20 s"), so units are spelled out before speaking */
  const speakable = t => t.replace(/\s*\([^)]*\)/g, '').replace(/(\d)\s?s\b(?!')/g, '$1 seconds').replace(/(\d)\s?min\b/g, '$1 minutes').replace(/(\d)\s?cm\b/g, '$1 centimetres').replace(/(\d)\s?°/g, '$1 degrees').replace(/(\d)\/10\b/g, '$1 out of 10');
  function utter(text, v, rate) { const u = new SpeechSynthesisUtterance(speakable(text)); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
    const male = v && gender(v) === 'm'; const c = isCalm(); u.rate = (rate || (male ? 0.95 : 0.93)) * (c ? 0.94 : 1); u.pitch = (male ? 0.92 : 1) * (c ? 0.96 : 1); u.volume = c ? 0.55 : 1; return u; }
  /* one queue for recorded clips and device speech */
  const queue = []; let cur = null;
  function next() { if (cur) return; if (!queue.length || paused) { duck(false); return; } cur = start(queue.shift()); }
  function start(it) {
    let done = false, src = null; const h = clipId(it.text);
    let dog = null; const fin = () => { if (done) return; done = true; clearTimeout(dog); cur = null; next(); };
    const guard = ms => { clearTimeout(dog); dog = setTimeout(fin, ms); };      // safety net: some browsers never report the end of speech
    const tts = () => { if (done) return; if (!('speechSynthesis' in window)) return fin(); const u = utter(it.text, voice, it.o.rate); u.onend = u.onerror = fin; guard(4000 + it.text.length * 110); try { speechSynthesis.speak(u); } catch (e) { fin(); } };
    ensure(); duck(true); softVoice(); guard(15000);
    if (ctx && useClips() && clips.has(h)) load(h).then(b => { if (done) return; src = ctx.createBufferSource(); src.buffer = b; src.connect(voiceOut); src.onended = fin; guard(b.duration * 1000 + 1500); src.start(); }).catch(() => { bufs.delete(h); tts(); });
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

  function setMood(m) { clearTimeout(preview.t); setMoodI(m); }
  function setMoodI(m) {
    want = m; if (!ctx) return; ensure();
    if (m === mood) { duck(busy()); trackPlay(); return; }
    const t = ctx.currentTime, same = TRACK[m] && TRACK[m] === TRACK[mood];
    if (same) { mood = m; duck(busy()); return; }                    // same track for both moods: just keep playing
    music.gain.cancelScheduledValues(t); music.gain.setTargetAtTime(0, t, 0.4);
    setTimeout(() => { if (want !== m) return; mood = m; trackFor(m); duck(busy()); }, 1000);
  }
  function chime(f = 660, v = 0.16) { if (!ctx) return; ensure(); const t = ctx.currentTime; [0, 0.09].forEach((o, i) => { const s = ctx.createOscillator(), g = ctx.createGain(); s.frequency.value = f * (i ? 1.5 : 1); g.gain.setValueAtTime(0.0001, t + o); g.gain.linearRampToValueAtTime(v, t + o + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + o + 0.8); s.connect(g); g.connect(sfx); s.start(t + o); s.stop(t + o + 0.85); }); try { navigator.vibrate && navigator.vibrate(30); } catch (e) {} }
  function pause(p) { if (!p) ensure(); paused = p; if (p) { hush(); if (ctx) trackStop(); } else trackPlay(); duck(false); }
  function stop() { hush(); setMood('off'); }

  let lock = null;
  async function wake(on) { try { if (on && 'wakeLock' in navigator) lock = await navigator.wakeLock.request('screen'); else if (!on && lock) { await lock.release(); lock = null; } } catch (e) {} }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && lock) wake(true); });

  /* a few seconds of a mood, for the settings preview */
  function preview(m) { init(); clearTimeout(preview.t); setMoodI(m); preview.t = setTimeout(() => setMoodI('off'), 9000); }

  /* test tap: peak and RMS of the master output, or of the music alone with meter('music') (no voice, no chimes) */
  function meter(which) { if (!ctx) return null; const key = which === 'music' ? 'm' : 'a'; if (!meter[key]) { meter[key] = ctx.createAnalyser(); meter[key].fftSize = 2048; (which === 'music' ? music : master).connect(meter[key]); } const d = new Float32Array(2048); meter[key].getFloatTimeDomainData(d); let pk = 0, sq = 0; for (const x of d) { pk = Math.max(pk, Math.abs(x)); sq += x * x; } return [pk, Math.sqrt(sq / d.length)]; }

  return {
    get state() { return ctx ? ctx.state : 'none'; }, get mood() { return mood; }, _suspend() { return ctx && ctx.suspend(); },      // for tools/test-audio.mjs
    meter, init, say, busy, hush, setMood, chime, pause, stop, wake, curated, sample, preview,
    get musicOn() { return musicOn; }, set musicOn(v) { musicOn = v; LSset('coach.music', v ? '1' : '0'); duck(busy()); },
    get voiceOn() { return voiceOn; }, set voiceOn(v) { voiceOn = v; LSset('coach.voice', v ? '1' : '0'); if (!v) hush(); },
    set onLine(fn) { onLine = fn; }, get voiceName() { return useClips() ? CLIPS : voice ? voice.name : ''; }, get hasClips() { return !!clips; }, onClips(f) { clips ? f() : clipWaiters.push(f); }, clipId, prefetch, CLIPS, SAMPLE,
    setVoice(name) { LSset('coach.voiceName', name); pickVoice(); }
  };
})();

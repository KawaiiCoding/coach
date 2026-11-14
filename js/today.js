/* Mobile-first daily app: onboarding, symptom map, today's session with timers, daily log, progress, breathing and meditation.
   All data stays in localStorage on the device. */
(() => {
  const $ = id => document.getElementById(id), KEY = 'tension.v1';
  const today = () => new Date().toISOString().slice(0, 10);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  let S = load() || { onboarded: false, started: today(), profile: { breathless: 'no', redflags: [], desk: 4, sofa: 2, phone: 2, stand: 2, sleep: 'side', duration: 15, deskGood: false, stage: 0 }, pain: {}, logs: [] };
  if (!S.started) S.started = today(); if (S.profile.stage == null) S.profile.stage = 0;
  for (const k in S.pain) if (typeof S.pain[k] === 'number') S.pain[k] = { v: S.pain[k], t: ['pain'] };   // migrate old entries
  const pv = rid => (S.pain[rid] && S.pain[rid].v) || 0, pt = rid => (S.pain[rid] && S.pain[rid].t) || [];
  const log = () => { let l = S.logs.find(x => x.d === today()); if (!l) { l = { d: today(), pain: Object.fromEntries(Object.keys(S.pain).map(k => [k, pv(k)])), done: [], minutes: 0 }; S.logs.push(l); } return l; };
  const css = c => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
  const painCol = v => v >= 7 ? 'rgba(255,90,77,.75)' : v >= 4 ? 'rgba(255,176,46,.75)' : 'rgba(53,208,160,.7)';

  /* ---------- navigation ---------- */
  const screens = ['today', 'log', 'progress', 'learn', 'onboard', 'map', 'day'];
  function show(id) { screens.forEach(s => { const el = $('s-' + s); if (el) el.classList.toggle('on', s === id); }); document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('on', b.dataset.go === id)); window.scrollTo(0, 0); ({ today: renderToday, log: renderLog, progress: renderProgress, learn: renderLearn, map: renderMap, day: renderDay })[id]?.(); }
  document.querySelectorAll('.nav button').forEach(b => b.onclick = () => show(b.dataset.go));

  /* ---------- body chart with tappable regions ---------- */
  function chartSvg(sel, onTap) {
    const view = (v, k) => `<g transform="translate(${k * 210},0)"><image href="${BODYIMG[v]}" x="0" y="0" width="200" height="430"/>${REGIONS.filter(r => r.v === v).map(r => { const [x, y, rx, ry] = r.zone, p = pv(r.id), c = p ? `--zc:${painCol(p)}` : '';
      return [[x, ''], [200 - x, '']].map(([cx]) => `<g class="zone ${p ? 'sel' : ''}" style="${c}" data-r="${r.id}"><circle cx="${cx}" cy="${y}" r="${Math.max(rx, ry) + 4}"/>${p ? `<text x="${cx}" y="${y + 3}">${p}</text>` : ''}</g>`).join(''); }).join('')}<text x="100" y="441" fill="#93a8bb" font-size="11" text-anchor="middle">${v === 'f' ? 'FRONT' : 'BACK'}</text></g>`;
    return `<svg class="chart" viewBox="0 0 410 446" role="img" aria-label="Tap where it hurts">${view('f', 0)}${view('b', 1)}</svg>`;
  }
  function bindChart(el, cb) { el.querySelectorAll('.zone').forEach(z => z.addEventListener('click', () => cb(z.dataset.r))); }

  /* ---------- onboarding ---------- */
  let step = 0;
  function renderOnboard() {
    const P = S.profile, dots = `<div class="wizard-dots">${[0, 1, 2, 3].map(i => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>`;
    const el = $('s-onboard');
    if (step === 0) el.innerHTML = `${dots}<h1>Let's set this up</h1><p class="mute">Three short questions. Your answers stay on this device.</p>
<div class="card"><h2 style="margin-top:0">Two safety checks first</h2>
<p><b>${BREATH.screen.q}</b></p><div class="choice one">${[['no', 'No'], ['mild', 'A little tightness, but it does not limit me'], ['yes', 'Yes, I need to sit up to breathe comfortably']].map(([v, t]) => `<button class="${P.breathless === v ? 'on' : ''}" data-br="${v}">${t}</button>`).join('')}</div>
<p style="margin-top:14px"><b>Do any of these apply right now?</b> <span class="small">(tap all that do)</span></p><div class="choice one">${[['cauda', 'Numbness around the groin, or new bladder or bowel problems'], ['limb', 'Weakness or numbness spreading into an arm or leg'], ['injury', 'Pain that started with a fall or accident'], ['night', 'Pain that wakes me at night, or fever or weight loss with it'], ['chest', 'Chest pain, or breathlessness with exertion']].map(([v, t]) => `<button class="${P.redflags.includes(v) ? 'on' : ''}" data-rf="${v}">${t}</button>`).join('')}</div></div>
<button class="primary" id="next">Continue</button>`;
    if (step === 1) el.innerHTML = `${dots}<h1>Where does it hurt?</h1><p class="mute">Tap a spot, then set how strong it is (0 to 10). You can tap several.</p><div id="chartbox"></div><div id="painlist"></div><div class="row"><button class="ghost" id="back">Back</button><button class="primary grow" id="next">${Object.keys(S.pain).length ? 'Continue' : 'Nothing hurts, continue'}</button></div>`;
    if (step === 2) el.innerHTML = `${dots}<h1>Your typical day</h1><p class="mute">Hours matter more than angles: the app adds up what each position does to each muscle.</p>
<div class="card">${[['desk', 'Desk or computer', 0, 12], ['sofa', 'Sofa or armchair', 0, 8], ['phone', 'Phone, head down', 0, 8], ['stand', 'Standing or walking', 0, 12]].map(([k, t, a, b]) => `<label>${t}: <b id="v_${k}">${P[k]} h</b></label><input type="range" min="${a}" max="${b}" step="0.5" value="${P[k]}" data-h="${k}">`).join('')}
<p style="margin-top:10px"><b>Desk setup</b></p><div class="choice"><button class="${P.deskGood ? 'on' : ''}" data-desk="1">Screen at eye level, back supported</button><button class="${!P.deskGood ? 'on' : ''}" data-desk="0">Laptop, or I slouch</button></div>
<p style="margin-top:10px"><b>How do you mostly sleep?</b></p><div class="choice">${[['side', 'On my side'], ['back', 'On my back'], ['curled', 'Curled up on my side'], ['backHigh', 'On my back, high pillow']].map(([v, t]) => `<button class="${P.sleep === v ? 'on' : ''}" data-sleep="${v}">${t}</button>`).join('')}</div>
<p style="margin-top:10px"><b>How long can you give each day?</b></p><div class="choice">${[10, 15, 20, 30].map(v => `<button class="${P.duration === v ? 'on' : ''}" data-dur="${v}">${v} min</button>`).join('')}</div></div>
<div class="row"><button class="ghost" id="back">Back</button><button class="primary grow" id="next">Build my plan</button></div>`;
    if (step === 3) { S.onboarded = true; save(); show('today'); return; }
    el.querySelectorAll('[data-br]').forEach(b => b.onclick = () => { P.breathless = b.dataset.br; renderOnboard(); });
    el.querySelectorAll('[data-rf]').forEach(b => b.onclick = () => { const v = b.dataset.rf, i = P.redflags.indexOf(v); i >= 0 ? P.redflags.splice(i, 1) : P.redflags.push(v); renderOnboard(); });
    el.querySelectorAll('[data-h]').forEach(r => r.oninput = () => { P[r.dataset.h] = +r.value; $('v_' + r.dataset.h).textContent = r.value + ' h'; });
    el.querySelectorAll('[data-desk]').forEach(b => b.onclick = () => { P.deskGood = b.dataset.desk === '1'; renderOnboard(); });
    el.querySelectorAll('[data-sleep]').forEach(b => b.onclick = () => { P.sleep = b.dataset.sleep; renderOnboard(); });
    el.querySelectorAll('[data-dur]').forEach(b => b.onclick = () => { P.duration = +b.dataset.dur; renderOnboard(); });
    if ($('chartbox')) { $('chartbox').innerHTML = chartSvg(); bindChart($('chartbox'), r => painPrompt(r, () => renderOnboard())); painList($('painlist'), () => renderOnboard()); }
    const n = $('next'); if (n) n.onclick = () => { save(); step++; renderOnboard(); };
    const bk = $('back'); if (bk) bk.onclick = () => { step--; renderOnboard(); };
  }
  function painPrompt(rid, after) {
    const r = REGION[rid], cur = pv(rid), types = new Set(pt(rid).length ? pt(rid) : ['pain']);
    const opts = SYMPTOMS.filter(t => (!t.joints || t.joints.includes(rid)) && (!t.regions || t.regions.includes(rid)));
    const box = document.createElement('div'); box.className = 'player on';
    const draw = () => { box.innerHTML = `<h2 style="margin-top:0">${r.n}</h2><p class="mute">What do you notice here? <span class="small">(tap all that apply)</span></p>
<div class="choice">${opts.map(t => `<button class="${types.has(t.id) ? 'on' : ''}" data-t="${t.id}">${t.n}</button>`).join('')}</div>
<p class="mute" style="margin-top:12px">How much does it bother you? 0 is nothing, 10 is the worst imaginable.</p>
<div class="intensity">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button class="${v === pv(rid) ? 'on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>
${[...types].filter(t => SYMPTOM_ADVICE[t]).map(t => `<div class="card warn" style="margin:12px 0 0"><b>${SYMPTOMS.find(x => x.id === t).n}</b><p class="small" style="margin:6px 0 0">${(SYMPTOM_ADVICE[t][rid] || SYMPTOM_ADVICE[t].default)}</p></div>`).join('')}
<p class="small" style="margin-top:12px"><b>Muscles here:</b> ${PLAN.names(r.m)}</p><p class="small">${r.why}</p><p class="small" style="color:var(--bad)"><b>See a doctor if:</b> ${r.red}</p>
<div class="row" style="margin-top:12px"><button class="ghost" id="pclr">Remove</button><button class="primary grow" id="pok">Done</button></div>`;
      box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const t = b.dataset.t; types.has(t) ? types.delete(t) : types.add(t); if (!types.size) types.add('pain'); draw(); });
      box.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { S.pain[rid] = { v: +b.dataset.v, t: [...types] }; box.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('on', x === b)); });
      box.querySelector('#pok').onclick = () => { S.pain[rid] = { v: pv(rid) || cur || 3, t: [...types] }; save(); box.remove(); after(); };
      box.querySelector('#pclr').onclick = () => { delete S.pain[rid]; save(); box.remove(); after(); }; };
    draw(); document.body.appendChild(box);
  }
  function painList(el, after) { const ids = Object.keys(S.pain); el.innerHTML = ids.length ? ids.map(id => `<span class="pill">${REGION[id].n}: ${pv(id)}/10 · ${pt(id).map(t => SYMPTOMS.find(x => x.id === t).n.toLowerCase()).join(', ')}</span>`).join('') : '<p class="small">No areas selected yet.</p>'; }

  /* ---------- analysis: add up the day's postures ---------- */
  const PRESET = n => POSTURES.find(p => p.n === n);
  function analyseDay() {
    const P = S.profile, blocks = [];
    if (P.desk) blocks.push([PRESET(P.deskGood ? 'Desk, good setup' : 'Desk slouch'), P.desk]);
    if (P.sofa) blocks.push([PRESET('Sofa slouch (sacral sitting)'), P.sofa]);
    if (P.phone) blocks.push([PRESET('Sofa, phone, head down'), P.phone]);
    if (P.stand) blocks.push([PRESET('Upright standing'), P.stand]);
    blocks.push([PRESET({ side: 'Side sleeping, straight', back: 'Back sleeping, flat', curled: 'Side sleeping, curled (fetal)', backHigh: 'Back sleeping, high pillow' }[P.sleep]), 7.5]);
    const agg = {}; MUSCLES.forEach(m => agg[m.id] = { T: 0, shortening: 0, pain: 0, passive: 0, r: 1, h: 0 });
    for (const [pr, h] of blocks) { if (!pr) continue; const p = { ...KIN.P0, ...pr.v, scene: pr.scene || 'floor', seat: pr.seat, bed: pr.bed, support: pr.support, press: pr.press, time: Math.min(240, h * 60) };
      const A = KIN.analyse(KIN.build(p), MUSCLES, p); MUSCLES.forEach(m => { const a = A[m.id], g = agg[m.id]; g.T = Math.max(g.T, a.T); g.pain = Math.max(g.pain, a.pain); g.shortening += a.shortening * h; g.passive += a.passive * h; g.r += (a.r - 1) * h; g.h += h; }); }
    MUSCLES.forEach(m => { const g = agg[m.id]; if (g.h) { g.shortening /= g.h; g.passive /= g.h; g.r = 1 + (g.r - 1) / g.h; } });
    // symptoms weigh in: a painful region raises its muscles' pain score
    for (const rid of Object.keys(S.pain)) for (const mid of REGION[rid].m) { agg[mid].pain = Math.max(agg[mid].pain, pv(rid) / 10); if (pt(rid).includes('tingle')) agg[mid].noStretch = true; }
    return agg;
  }

  /* ---------- stage ---------- */
  function daysSince(d) { return Math.floor((new Date(today()) - new Date(d)) / 864e5); }
  function stage() {
    if (S.profile.stage) return STAGES[S.profile.stage - 1];
    const d = daysSince(S.started), recent = n => S.logs.filter(l => daysSince(l.d) < n), consistent = n => recent(n).filter(l => l.done.length >= 2).length >= Math.round(n * 4 / 7);
    const lowPain = n => { const v = recent(n).map(l => { const p = Object.values(l.pain || {}); return p.length ? Math.max(...p) : 0; }); return !v.length || v.filter(x => x <= 3).length >= v.length * 0.7; };
    if (d >= 84 && consistent(28) && lowPain(28)) return STAGES[3];
    if (d >= 42 && consistent(28) && lowPain(14)) return STAGES[2];
    if (d >= 14 && consistent(14) && lowPain(14)) return STAGES[1];
    return STAGES[0];
  }

  /* ---------- session builder ---------- */
  function buildSession() {
    const P = S.profile, A = analyseDay(), items = [], regions = Object.keys(S.pain), painM = new Set(regions.flatMap(r => REGION[r].m));
    const dur = P.duration * 60, ST = stage(); let used = 0;
    const secs = x => x.sets == null ? ((x.hold ? ST.stretchHold : 4) * x.reps * x.sides + 15) : ((x.hold || 3) * x.reps + 40) * x.sets * (x.sides > 1 ? 2 : 1);
    // 1. warm-up: shorter in short sessions
    const wu = P.duration <= 10 ? WARMUP.slice(0, 2) : WARMUP;
    items.push({ kind: 'warmup', section: 'warmup', ex: { id: 'warmup', n: 'Easy warm-up', steps: wu }, secs: wu.reduce((a, w) => a + w.secs, 0) }); used += items[0].secs;
    // 2. breathing, always; choice depends on the screening answer
    const br = P.breathless === 'yes' ? BREATH.ex.find(e => e.id === 'seated') : P.breathless === 'mild' ? BREATH.ex.find(e => e.id === 'side') : ST.id >= 2 && S.logs.length % 3 === 0 ? BREATH.ex.find(e => e.id === 'load') : BREATH.ex[S.logs.length % 2 === 0 ? 0 : 1];
    items.push({ kind: 'breath', section: 'breath', ex: br, secs: ST.id === 1 ? 240 : 180 }); used += items[1].secs;
    // 2. stretches for shortened or painful tight-prone muscles, painful regions first
    const score = m => (painM.has(m.id) ? 0.5 : 0) + A[m.id].shortening * 0.6 + A[m.id].pain * 0.4;
    const tight = MUSCLES.filter(m => m.tend !== 'weak' && (A[m.id].shortening > 0.12 || A[m.id].pain > 0.4 || painM.has(m.id))).sort((a, b) => score(b) - score(a));
    const covered = new Set(), stretches = [];
    for (const m of tight) { if (covered.has(m.id) || A[m.id].noStretch) continue; const c = STRETCHES.filter(s => s.m.includes(m.id) && !stretches.some(q => q.ex === s) && !s.m.some(i => A[i].noStretch)).sort((x, y) => (x.type === 'static' ? 0 : 1) - (y.type === 'static' ? 0 : 1) || x.m.indexOf(m.id) - y.m.indexOf(m.id));
      if (!c.length) continue; const s = c[0], t = secs(s); if (used + t > dur * 0.7) continue; stretches.push({ kind: 'stretch', section: 'stretch', ex: s, secs: t, why: m }); used += t; s.m.forEach(i => covered.add(i)); if (stretches.length >= (ST.id === 1 ? 3 : 5)) break; }
    // 3. primer: the first key stretch, short, right before strengthening its opposite
    if (stretches.length) { const pri = stretches[0]; items.push({ kind: 'stretch', section: 'pre', ex: pri.ex, secs: 20 * pri.ex.sides + 10, why: pri.why, primer: true }); used += 20 * pri.ex.sides + 10; }
    // 3. strengthening for weak-prone muscles of the painful regions and antagonists of the tight ones
    const weak = new Map(); regions.forEach(r => REGION[r].m.forEach(id => { if (MUSCLE[id].tend === 'weak') weak.set(id, 1 + (S.pain[r] / 10)); }));
    tight.slice(0, 5).forEach(m => m.relax.forEach(i => { if (MUSCLE[i].tend !== 'tight') weak.set(i, Math.max(weak.get(i) || 0, 0.5)); }));
    const wl = [...weak.entries()].sort((a, b) => b[1] - a[1]).map(e => MUSCLE[e[0]]), sc = new Set();
    for (const m of wl) { if (sc.has(m.id)) continue; const c = STRENGTH.filter(s => s.m.includes(m.id) && s.level <= ST.level && !items.some(i => i.ex === s)).sort((x, y) => x.level - y.level); if (!c.length) continue; const s = c[0], t = secs(s); if (used + t > dur) continue; items.push({ kind: 'strength', section: 'strength', ex: s, secs: t, why: m }); used += t; s.m.forEach(i => sc.add(i)); if (items.filter(i => i.kind === 'strength').length >= ST.strength) break; }
    // 5. the main stretches, on warm tissue
    items.push(...stretches);
    // 6. a short body scan when there is time
    if (used + 240 <= dur || P.duration >= 20) { items.push({ kind: 'meditate', section: 'calm', ex: { id: 'scan', n: 'Body scan', steps: BREATH.meditation.bodyScan }, secs: ST.id === 1 ? 300 : 240 }); used += 300; }
    return { items, minutes: Math.round(used / 60), A, tight: tight.slice(0, 5), weak: wl.slice(0, 4), stage: ST };
  }

  /* ---------- today ---------- */
  let session = null;
  function renderToday() {
    const el = $('s-today'), P = S.profile, L = log(); session = buildSession();
    const key = i => i.ex.id + (i.primer ? '-pre' : ''), done = session.items.filter(i => L.done.includes(key(i))).length, pct = Math.round(done / session.items.length * 100);
    const flags = P.redflags.length || P.breathless === 'yes';
    const flagCard = flags ? `<div class="card bad"><b>Please see a doctor before using this plan</b><p class="small" style="margin-top:6px">${P.breathless === 'yes' ? BREATH.screen.red + ' ' : ''}${P.redflags.length ? 'You ticked: ' + P.redflags.map(f => ({ cauda: 'groin numbness or bladder/bowel change', limb: 'spreading weakness or numbness', injury: 'pain after an accident', night: 'night pain, fever or weight loss', chest: 'chest pain or breathlessness on exertion' })[f]).join(', ') + '. These are not posture problems; they need assessment first. Gentle breathing and walking are fine meanwhile.' : ''}</p><button class="sm" id="editflags">Change answers</button></div>` : P.breathless === 'mild' ? `<div class="card warn"><b>Breathing note</b><p class="small" style="margin-top:6px">${BREATH.screen.yellow}</p></div>` : '';
    const painIds = Object.keys(S.pain);
    el.innerHTML = `<h1>Today</h1><p class="mute">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} · streak ${streak()} day${streak() === 1 ? '' : 's'}</p>${flagCard}
<div class="card"><div class="row"><svg class="ring" viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="42"/><circle class="fg" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="${264 - 264 * pct / 100}"/><text x="50" y="56" text-anchor="middle" fill="#eef3f7" font-size="20" font-weight="700">${pct}%</text></svg>
<div class="grow"><b>${session.minutes} minutes · ${session.items.length} exercises</b><p class="small">${painIds.length ? 'Built for: ' + painIds.map(i => REGION[i].n.toLowerCase()).join(', ') : 'Built from your day; tap "where it hurts" to personalise it.'}</p><div class="row"><button class="sm" data-go="map">Where it hurts</button><button class="sm" data-go="day">My day</button></div></div></div></div>
${done < session.items.length ? `<button class="primary" id="startall">${done ? 'Continue' : 'Start'} session</button>` : `<div class="card ok"><b>Session complete.</b> <span class="small">Log how you feel in the Log tab.</span></div>`}
<div class="card" style="padding:10px 16px"><span class="small">Stage ${session.stage.id} of 4: <b>${session.stage.n}</b> (${session.stage.weeks})</span> <button class="sm right" data-go="progress">All stages</button></div>
${(() => { let last = null; return session.items.map((it, i) => { const sec = it.section, head = sec !== last ? `<details class="small" style="padding:8px 14px"><summary>${{ warmup: '1 · Warm up', breath: '2 · Breathe', pre: '3 · Primer stretch', strength: '4 · Strengthen', stretch: '5 · Lengthen', calm: '6 · Calm down' }[sec]} <span class="mute">why?</span></summary><p style="margin:6px 0 0">${SECTION_WHY[sec]}</p></details>` : ''; last = sec;
  return head + `<div class="ex ${L.done.includes(key(it)) ? 'done' : ''}" data-i="${i}">${illus(it)}<div><span class="badge ${it.kind}">${{ warmup: 'Warm-up', breath: 'Breathing', stretch: it.primer ? 'Primer' : 'Stretch', strength: 'Strengthen', meditate: 'Calm' }[it.kind]}</span><span class="small">${Math.max(1, Math.round(it.secs / 60))} min</span><b>${it.ex.n}</b><span class="small">${it.why ? 'for the ' + it.why.n.toLowerCase() : it.ex.dose || ''}</span></div></div>`; }).join(''); })()}
<h3>Through the day</h3><div class="card"><p>Every 45 minutes: stand up, two minutes of walking, then 30 seconds of chin tucks or a doorway stretch. One minute of 4-6 breathing whenever the neck tightens.</p><p class="small">${P.sleep === 'backHigh' ? 'Tonight: try a lower pillow or a wedge under head and chest, and a roll under the knees. ' : P.sleep === 'side' || P.sleep === 'curled' ? 'Tonight: pillow between the knees, neck level with the spine, lower arm forward rather than under the pillow. ' : 'Tonight: a small roll under the knees unloads the lower back. '}Avoid heavy meals or alcohol within three hours of bed.</p></div>
<p class="small">Pain up to 3/10 during an exercise that settles within a day is acceptable. More than that: skip it today and tell the Log.</p>`;
    el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    el.querySelectorAll('.ex').forEach(x => x.onclick = () => play(+x.dataset.i));
    const sa = $('startall'); if (sa) sa.onclick = () => play(session.items.findIndex(i => !L.done.includes(key(i))));
    const ef = $('editflags'); if (ef) ef.onclick = () => { step = 0; show('onboard'); renderOnboard(); };
  }
  const illus = it => it.kind === 'warmup' ? ILLUS.svg('march') : it.kind === 'breath' ? `<svg class="ill" viewBox="0 0 160 100"><circle cx="80" cy="50" r="30" fill="none" stroke="#5fb6ff" stroke-width="3"/><circle cx="80" cy="50" r="16" fill="#5fb6ff" opacity=".4"/></svg>` : it.kind === 'meditate' ? `<svg class="ill" viewBox="0 0 160 100"><circle cx="80" cy="50" r="30" fill="none" stroke="#c9a4ff" stroke-width="3"/><path d="M60 50q20-30 40 0q-20 30-40 0" fill="#c9a4ff" opacity=".5"/></svg>` : ILLUS.svg(it.ex.ill);
  function streak() { const days = new Set(S.logs.filter(l => l.done && l.done.length >= 2).map(l => l.d)); let n = 0; const d = new Date(); for (;;) { const k = d.toISOString().slice(0, 10); if (days.has(k)) { n++; d.setDate(d.getDate() - 1); } else if (k === today()) { d.setDate(d.getDate() - 1); } else break; } return n; }

  /* ---------- exercise player with timers ---------- */
  let tm = null;
  function play(i) {
    if (i < 0 || !session) return; const it = session.items[i], x = it.ex, P = $('player'); clearInterval(tm);
    const nextBtn = `<details class="small" style="margin-top:10px"><summary>Why this step</summary><p style="margin:6px 0 0">${SECTION_WHY[it.section] || ''}</p></details><div class="row" style="margin-top:14px"><button class="ghost" id="pclose">Close</button><button class="primary grow" id="pdone">Done${i < session.items.length - 1 ? ', next' : ''}</button></div>`;
    const doneKey = x.id + (it.primer ? '-pre' : '');
    if (it.kind === 'warmup') {
      let k = 0, t = x.steps[0].secs;
      P.innerHTML = `<h2 style="margin-top:0">Easy warm-up</h2><p class="mute">About ${Math.round(it.secs / 60)} minutes, easy pace. Breathe through the nose.</p>${ILLUS.svg('march')}<div class="timer" id="tt">${fmt(t)}</div><div class="phase" id="ph">${x.steps[0].n}</div><div class="card" id="mstep">${x.steps[0].how}</div><div class="row" style="justify-content:center"><button id="pstart" class="primary" style="width:auto">Start</button><button class="sm" id="mnext">Next</button></div>${nextBtn}`;
      const adv = () => { k++; if (k >= x.steps.length) { clearInterval(tm); $('ph').textContent = 'Warm. Move on to the breathing.'; $('tt').textContent = ''; beep(); return; } t = x.steps[k].secs; $('ph').textContent = x.steps[k].n; $('mstep').textContent = x.steps[k].how; $('tt').textContent = fmt(t); beep(); };
      $('mnext').onclick = adv; $('pstart').onclick = () => { $('pstart').disabled = true; tm = setInterval(() => { t--; $('tt').textContent = fmt(t); if (t <= 0) adv(); }, 1000); };
    } else if (it.kind === 'breath') {
      const [inh, h1, exh, h2] = x.pattern, total = it.secs; let t = 0;
      P.innerHTML = `<h2 style="margin-top:0">${x.n}</h2><p class="mute">${x.pos}</p><svg class="breathc" viewBox="0 0 200 200"><circle cx="100" cy="100" r="85" fill="none" stroke="#2b4257" stroke-width="2"/><circle id="bc" cx="100" cy="100" r="50" fill="#5fb6ff" opacity=".35"/><text id="bt" x="100" y="106" text-anchor="middle" fill="#eef3f7" font-size="18">Ready</text></svg><div class="timer" id="tt">${fmt(total)}</div><div class="phase" id="ph">In ${inh} · ${h1 ? 'hold ' + h1 + ' · ' : ''}out ${exh}${h2 ? ' · hold ' + h2 : ''}</div>
<div class="row" style="justify-content:center;margin-top:10px"><button id="pstart" class="primary" style="width:auto">Start</button></div><ol class="steps">${x.steps.map(s => `<li>${s}</li>`).join('')}</ol><p class="small">${x.cue}</p>${P.breathless !== undefined ? '' : ''}${nextBtn}`;
      $('pstart').onclick = () => { $('pstart').disabled = true; const cyc = inh + h1 + exh + h2; tm = setInterval(() => { t++; const k = t % cyc; const ph = k < inh ? ['Breathe in', 50 + 35 * (k + 1) / inh] : k < inh + h1 ? ['Hold', 85] : k < inh + h1 + exh ? ['Breathe out', 85 - 35 * (k - inh - h1 + 1) / exh] : ['Rest', 50];
        $('bc').setAttribute('r', ph[1]); $('bt').textContent = ph[0]; $('tt').textContent = fmt(total - t); if (t >= total) { clearInterval(tm); $('bt').textContent = 'Done'; beep(); } }, 1000); };
    } else if (it.kind === 'meditate') {
      let s = 0; const per = Math.round(it.secs / x.steps.length);
      P.innerHTML = `<h2 style="margin-top:0">${x.n}</h2><p class="mute">About ${Math.round(it.secs / 60)} minutes. Each step moves on by itself; tap next to go faster.</p><div class="timer" id="tt">${fmt(per)}</div><div class="card" id="mstep" style="font-size:19px">${x.steps[0]}</div><div class="row" style="justify-content:center"><button id="pstart" class="primary" style="width:auto">Start</button><button class="sm" id="mnext">Next step</button></div><p class="small">${BREATH.meditation.tips[Math.floor(Math.random() * BREATH.meditation.tips.length)]}</p>${nextBtn}`;
      let t = per; const adv = () => { s++; t = per; if (s >= x.steps.length) { clearInterval(tm); $('mstep').textContent = 'Finished. Take one more slow breath before you get up.'; beep(); return; } $('mstep').textContent = x.steps[s]; beep(); };
      $('mnext').onclick = adv; $('pstart').onclick = () => { $('pstart').disabled = true; tm = setInterval(() => { t--; $('tt').textContent = fmt(t); if (t <= 0) adv(); }, 1000); };
    } else {
      const isStretch = x.sets == null, hold = it.primer ? 20 : (x.hold ? (isStretch ? session.stage.stretchHold : x.hold) : 0), reps = it.primer ? 1 : isStretch ? x.reps : x.sets, sides = x.sides || 1, cycles = [];
      if (isStretch && hold) for (let r = 0; r < reps; r++) for (let s = 0; s < sides; s++) cycles.push({ n: `Rep ${r + 1}${sides > 1 ? (s ? ' · left' : ' · right') : ''}`, t: hold });
      else for (let r = 0; r < reps; r++) { for (let s = 0; s < sides; s++) cycles.push({ n: `Set ${r + 1}${sides > 1 ? (s ? ' · left' : ' · right') : ''}: ${isStretch ? x.reps + ' slow reps' : x.reps + ' reps' + (x.hold ? ', ' + x.hold + ' s holds' : '')}`, t: 0 }); if (r < reps - 1) cycles.push({ n: 'Rest', t: 40 }); }
      let c = 0, t = cycles[0].t;
      P.innerHTML = `<h2 style="margin-top:0">${x.n}</h2><p class="mute">${PLAN.names(x.m)}${it.why ? ' · for the ' + it.why.n.toLowerCase() : ''}</p>${ILLUS.svg(x.ill)}<div class="timer" id="tt">${cycles[0].t ? fmt(cycles[0].t) : ''}</div><div class="phase" id="ph">${cycles[0].n}</div><div class="bar" style="margin:8px 0"><i id="pb" style="width:0"></i></div>
<div class="row" style="justify-content:center"><button id="pstart" class="primary" style="width:auto">${cycles[0].t ? 'Start timer' : 'Start'}</button><button class="sm" id="pnext">Next ${isStretch ? 'rep' : 'set'}</button></div>
<p style="margin-top:14px"><b>${it.primer ? 'Primer: hold 20 s' + (sides > 1 ? ' each side' : '') + ', then straight to the strengthening' : isStretch && hold ? `hold ${hold} s × ${reps}${sides > 1 ? ' each side' : ''} (stage ${session.stage.id} dose)` : PLAN.dose(x)}</b></p><p>${x.how}</p><p class="small"><i>${x.cue}</i></p>${PLAN.links(x, isStretch ? 'stretch' : 'exercise')}${nextBtn}`;
      const adv = () => { c++; $('pb').style.width = Math.round(c / cycles.length * 100) + '%'; if (c >= cycles.length) { clearInterval(tm); $('ph').textContent = 'All done'; $('tt').textContent = ''; beep(); return; } t = cycles[c].t; $('ph').textContent = cycles[c].n; $('tt').textContent = t ? fmt(t) : ''; beep(); if (!t) { clearInterval(tm); $('pstart').disabled = false; } };
      const tick = () => { t--; $('tt').textContent = fmt(t); if (t <= 0) { adv(); if (c >= cycles.length || !cycles[c].t) clearInterval(tm); } };
      $('pnext').onclick = adv; $('pstart').onclick = () => { $('pstart').disabled = true; if (!cycles[c].t) { adv(); return; } clearInterval(tm); tm = setInterval(tick, 1000); };
    }
    P.classList.add('on'); window.scrollTo(0, 0);
    $('pclose').onclick = () => { clearInterval(tm); P.classList.remove('on'); renderToday(); };
    $('pdone').onclick = () => { clearInterval(tm); const L = log(); if (!L.done.includes(doneKey)) { L.done.push(doneKey); L.minutes += Math.round(it.secs / 60); } save(); if (i < session.items.length - 1) play(i + 1); else { P.classList.remove('on'); renderToday(); } };
  }
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  let actx = null; function beep() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 660; g.gain.value = 0.08; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.18); if (navigator.vibrate) navigator.vibrate(60); } catch (e) {} }

  /* ---------- map and day screens (editing after onboarding) ---------- */
  function renderMap() { const el = $('s-map'); el.innerHTML = `<h1>Where it hurts</h1><p class="mute">Tap a spot to set or change it. This updates today's plan.</p><div id="chartbox2"></div><div id="painlist2"></div><button class="primary" id="mapok">Back to today</button>`; $('chartbox2').innerHTML = chartSvg(); bindChart($('chartbox2'), r => painPrompt(r, renderMap)); painList($('painlist2')); $('mapok').onclick = () => show('today'); }
  function renderDay() { step = 2; const el = $('s-day'); el.innerHTML = ''; show('onboard'); renderOnboard(); }

  /* ---------- log ---------- */
  function renderLog() {
    const el = $('s-log'), L = log(), ids = Object.keys(S.pain);
    el.innerHTML = `<h1>Daily log</h1><p class="mute">Thirty seconds, once a day. Trends matter more than any single day.</p>
<div class="card"><h3 style="margin-top:0">Pain now</h3>${ids.length ? ids.map(id => `<label>${REGION[id].n} <span class="small">(${pt(id).map(t => SYMPTOMS.find(x => x.id === t).n.toLowerCase()).join(', ')})</span>: <b id="lv_${id}">${L.pain[id] ?? pv(id)}</b>/10</label><input type="range" min="0" max="10" value="${L.pain[id] ?? pv(id)}" data-lp="${id}">`).join('') : '<p class="small">No areas selected. Add some under "Where it hurts".</p>'}
<h3>Sleep last night</h3><div class="choice">${[[1, 'Poor'], [2, 'Broken'], [3, 'OK'], [4, 'Good']].map(([v, t]) => `<button class="${L.sleep === v ? 'on' : ''}" data-sl="${v}">${t}</button>`).join('')}</div>
<h3>Breathing lying flat</h3><div class="choice">${[['fine', 'Fine'], ['tight', 'A bit tight'], ['short', 'Short of breath']].map(([v, t]) => `<button class="${L.breath === v ? 'on' : ''}" data-bl="${v}">${t}</button>`).join('')}</div>
<h3>Note</h3><textarea id="lnote" rows="2" placeholder="What made it better or worse?">${L.note || ''}</textarea></div>
<button class="primary" id="lsave">Save today</button><p class="small" style="margin-top:10px">Done today: ${L.done.length} exercise${L.done.length === 1 ? '' : 's'}, ${L.minutes} min.</p>`;
    el.querySelectorAll('[data-lp]').forEach(r => r.oninput = () => { L.pain[r.dataset.lp] = +r.value; $('lv_' + r.dataset.lp).textContent = r.value; });
    el.querySelectorAll('[data-sl]').forEach(b => b.onclick = () => { L.sleep = +b.dataset.sl; renderLog(); });
    el.querySelectorAll('[data-bl]').forEach(b => b.onclick = () => { L.breath = b.dataset.bl; renderLog(); if (b.dataset.bl === 'short') alert(BREATH.screen.red); });
    $('lsave').onclick = () => { L.note = $('lnote').value; ids.forEach(id => { S.pain[id] = { v: L.pain[id] ?? pv(id), t: pt(id) }; }); save(); show('progress'); };
  }

  /* ---------- progress ---------- */
  function renderProgress() {
    const el = $('s-progress'), logs = S.logs.slice().sort((a, b) => a.d < b.d ? -1 : 1).slice(-30), ids = Object.keys(S.pain);
    const avg = l => { const v = Object.values(l.pain || {}); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const pts = logs.map(avg), W = 320, H = 140, x = i => 20 + i * (W - 40) / Math.max(1, logs.length - 1), y = v => 10 + (10 - v) * (H - 30) / 10;
    const line = pts.map((v, i) => v == null ? null : `${x(i)},${y(v)}`).filter(Boolean).join(' ');
    const bars = logs.map((l, i) => `<rect x="${x(i) - 4}" y="${H - 14 - Math.min(10, l.minutes || 0) * 0.8}" width="8" height="${Math.min(10, l.minutes || 0) * 0.8}" fill="#35d0a0" opacity=".6"/>`).join('');
    const first = pts.find(v => v != null), last = [...pts].reverse().find(v => v != null);
    const ST = stage();
    const stagesHtml = `<h3>Programme</h3>${STAGES.map(st => `<div class="card ${st.id === ST.id ? 'ok' : ''}" style="padding:12px 16px"><b>Stage ${st.id}: ${st.n}</b> <span class="small">${st.weeks}${st.id === ST.id ? ' · you are here' : ''}</span><p class="small" style="margin:4px 0">${st.goal}</p><details class="small"><summary>What it includes</summary><ul>${st.does.map(d => `<li>${d}</li>`).join('')}</ul><p><b>Move on:</b> ${st.progress}</p></details></div>`).join('')}
<div class="row small"><span>Set stage manually:</span>${STAGES.map(st => `<button class="sm ${S.profile.stage === st.id ? 'on' : ''}" data-st="${st.id}">${st.id}</button>`).join('')}<button class="sm ${!S.profile.stage ? 'on' : ''}" data-st="0">auto</button></div><p class="small">Day ${daysSince(S.started) + 1} of the programme. Automatic staging needs 4 or more sessions a week and pain at 3/10 or less on most logged days.</p>`;
    el.innerHTML = `<h1>Progress</h1><div class="kpi"><div><b>${streak()}</b><span class="small">day streak</span></div><div><b>${S.logs.reduce((a, l) => a + (l.minutes || 0), 0)}</b><span class="small">minutes total</span></div><div><b>${last != null ? last.toFixed(1) : '–'}</b><span class="small">pain now /10</span></div></div>
<div class="card"><h3 style="margin-top:0">Average pain, last ${logs.length} day${logs.length === 1 ? '' : 's'}</h3><svg class="svgchart" viewBox="0 0 ${W} ${H}">${[0, 5, 10].map(v => `<line x1="20" x2="${W - 20}" y1="${y(v)}" y2="${y(v)}" stroke="#2b4257"/><text x="2" y="${y(v) + 4}" fill="#93a8bb" font-size="10">${v}</text>`).join('')}${bars}${line ? `<polyline points="${line}" fill="none" stroke="#ff5a4d" stroke-width="2.5"/>` : ''}${pts.map((v, i) => v == null ? '' : `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#ff5a4d"/>`).join('')}</svg><p class="small">Red line: average pain. Green bars: minutes exercised. ${first != null && last != null && logs.length > 3 ? (last < first - 0.5 ? 'Trend is down; keep going.' : last > first + 0.5 ? 'Trend is up. Reduce intensity this week and, if it continues, get it looked at.' : 'Flat so far; most changes show after two to four weeks.') : 'Log a few more days to see a trend.'}</p></div>
${ids.map(id => { const h = logs.map(l => l.pain && l.pain[id]).filter(v => v != null); return `<div class="card"><b>${REGION[id].n}</b> <span class="small">${h.length ? h.join(' → ') : 'no log yet'}</span></div>`; }).join('')}
${stagesHtml}
<details><summary>What is this plan based on?</summary><p class="small" style="margin-top:8px">The app adds up what each hour of your day does to 60 muscle groups (a geometric model), weights it by where you said it hurts, then picks stretches for muscles held short and strengthening for muscles held long or switched off. Exercise doses follow the ACSM guidelines; the region advice follows current physiotherapy guidance (for example NICE on low back pain). It is an estimate, not an examination, and it has not been reviewed by a clinician.</p><button class="sm" id="wipe">Erase all my data</button></details>`;
    el.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { S.profile.stage = +b.dataset.st; save(); renderProgress(); });
    $('wipe').onclick = () => { if (confirm('Delete everything stored on this device?')) { localStorage.removeItem(KEY); location.reload(); } };
  }

  /* ---------- learn ---------- */
  function renderLearn() {
    const el = $('s-learn'), ids = Object.keys(S.pain);
    el.innerHTML = `<h1>Learn</h1>
<div class="card ${S.profile.breathless === 'yes' ? 'bad' : 'warn'}"><b>Short of breath lying flat?</b><p class="small" style="margin-top:6px">${BREATH.screen.red}</p></div>
<details open><summary>Train the diaphragm</summary>${BREATH.why.map(t => `<p class="small">${t}</p>`).join('')}${BREATH.ex.map(e => `<div class="card" style="background:var(--card2)"><b>${e.n}</b> <span class="badge">level ${e.level}</span><p class="small">${e.pos} · ${e.dose}</p><ol class="steps small">${e.steps.map(s => `<li>${s}</li>`).join('')}</ol><p class="small"><i>${e.cue}</i></p><button class="sm" data-br="${e.id}">Start with timer</button></div>`).join('')}
<h3>Sleeping and breathing</h3><ul class="small">${BREATH.sleep.map(t => `<li>${t}</li>`).join('')}</ul><p class="small">Progression: week 1 and 2, lying or crocodile breathing five minutes twice a day; week 3 and 4, add side-lying and seated 4-6 at the desk; from week 5, loaded breathing twice a week if cleared. Aim for a resting rate of 10 to 14 breaths a minute with the belly leading.</p></details>
<details><summary>Meditate for tension</summary><p class="small">${BREATH.meditation.intro}</p><ol class="steps small">${BREATH.meditation.bodyScan.map(s => `<li>${s}</li>`).join('')}</ol><ul class="small">${BREATH.meditation.tips.map(t => `<li>${t}</li>`).join('')}</ul><button class="sm" id="scan">Start a 10-minute body scan</button></details>
${ids.length ? ids.map(id => { const r = REGION[id]; return `<details><summary>${r.n}</summary>${pt(id).filter(t => SYMPTOM_ADVICE[t]).map(t => `<p class="small" style="color:var(--warn)"><b>${SYMPTOMS.find(x => x.id === t).n}:</b> ${SYMPTOM_ADVICE[t][id] || SYMPTOM_ADVICE[t].default}</p>`).join('')}<p class="small"><b>Why it hurts:</b> ${r.why}</p><p class="small"><b>What works:</b> ${r.ev}</p><p class="small" style="color:var(--bad)"><b>See a doctor if:</b> ${r.red}</p><p class="small">Muscles involved: ${PLAN.names(r.m)}</p></details>`; }).join('') : '<p class="small">Select painful areas under "Where it hurts" to see what the evidence says about each.</p>'}
<details><summary>Pain rules and red flags</summary><ul class="small"><li>Up to 3/10 pain during an exercise that settles within 24 hours is fine. 4 or more, or pain that is worse the next day: skip that exercise for a week and reduce the others.</li><li>Never stretch into sharp pain, tingling or numbness.</li><li>Urgent care: numbness around the groin, new bladder or bowel problems, leg weakness, chest pain, breathlessness at rest, a hot swollen calf, pain after a fall with deformity.</li><li>Book a doctor: pain that wakes you, fever or weight loss with pain, pain not improving after two weeks of sensible self-care.</li></ul></details>
<details><summary>Sources</summary><ul class="small">${BREATH.SOURCES.map(s => `<li>${s}</li>`).join('')}<li>ACSM Guidelines for Exercise Testing and Prescription, 10th ed. (stretch and strength doses).</li><li>NICE NG59, Low back pain and sciatica: assessment and management.</li><li>Gray's Anatomy, 41st ed.; Moore's Clinically Oriented Anatomy (muscle attachments and nerves).</li></ul></details>
<p class="small"><a href="explorer.html">Open the 3D muscle explorer</a> (desktop recommended).</p>`;
    el.querySelectorAll('[data-br]').forEach(b => b.onclick = () => { session = session || buildSession(); session.items.unshift({ kind: 'breath', ex: BREATH.ex.find(e => e.id === b.dataset.br), secs: 300 }); play(0); });
    $('scan').onclick = () => { session = session || buildSession(); session.items.unshift({ kind: 'meditate', ex: { id: 'scan10', n: 'Body scan', steps: BREATH.meditation.bodyScan }, secs: 600 }); play(0); };
  }

  /* ---------- start ---------- */
  if (!S.onboarded) { show('onboard'); renderOnboard(); } else show('today');
})();

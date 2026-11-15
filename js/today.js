/* Mobile-first daily app: onboarding, symptom map, today's session with timers, daily log, progress, breathing and meditation.
   All data stays in localStorage on the device. */
(() => {
  const $ = id => document.getElementById(id), KEY = 'tension.v1';
  const today = () => new Date().toISOString().slice(0, 10);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  let S = load() || { onboarded: false, started: today(), profile: { breathless: 'no', redflags: [], desk: 4, sofa: 2, phone: 2, stand: 2, sleep: 'side', duration: 15, deskGood: false, stage: 0, sex: '', osteo: false, w: { now: [], sym: [] } }, pain: {}, logs: [] };
  if (!S.started) S.started = today(); if (S.profile.stage == null) S.profile.stage = 0;
  for (const k in S.pain) if (typeof S.pain[k] === 'number') S.pain[k] = { v: S.pain[k], t: ['pain'] };   // migrate old entries
  const pv = rid => (S.pain[rid] && S.pain[rid].v) || 0, pt = rid => (S.pain[rid] && S.pain[rid].t) || [];
  const log = () => { let l = S.logs.find(x => x.d === today()); if (!l) { l = { d: today(), pain: Object.fromEntries(Object.keys(S.pain).map(k => [k, pv(k)])), done: [], minutes: 0 }; S.logs.push(l); } return l; };
  const css = c => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
  const painCol = v => v >= 7 ? 'rgba(255,90,77,.75)' : v >= 4 ? 'rgba(255,176,46,.75)' : 'rgba(53,208,160,.7)';

  /* ---------- navigation ---------- */
  const screens = ['today', 'log', 'progress', 'learn', 'onboard', 'map', 'day'];
  function enter(id) { const el = $('s-' + id); if (!el) return; el.classList.add('enter'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('enter'), 900); }
  function show(id) { screens.forEach(s => { const el = $('s-' + s); if (el) el.classList.toggle('on', s === id); }); enter(id); document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('on', b.dataset.go === id)); window.scrollTo(0, 0); ({ today: renderToday, log: renderLog, progress: renderProgress, learn: renderLearn, map: renderMap, day: renderDay })[id]?.(); }
  document.querySelectorAll('.nav button').forEach(b => b.onclick = () => show(b.dataset.go));

  /* ---------- body chart with tappable regions ---------- */
  const body = v => (S.profile.sex === 'f' ? BODYIMG_F : BODYIMG)[v], fx = x => S.profile.sex === 'f' ? 100 + (x - 100) * 0.86 : x;
  function chartSvg() {
    const view = (v, k) => `<g transform="translate(${k * 210},0)"><image href="${body(v)}" x="0" y="0" width="200" height="430"/>${REGIONS.filter(r => r.v === v && (!r.sex || r.sex === S.profile.sex)).map(r => { const [x0, y] = r.zone, x = fx(x0), p = pv(r.id), c = p ? `--zc:${painCol(p)}` : '';
      return (Math.abs(x - 100) < 4 ? [100] : [x, 200 - x]).map(cx => `<g class="zone ${p ? 'sel' : ''}" style="${c}" data-r="${r.id}"><title>${r.n}</title><circle class="hit" cx="${cx}" cy="${y}" r="9"/><circle class="dot" cx="${cx}" cy="${y}" r="${p ? 8 : 5}"/>${p ? `<text x="${cx}" y="${y + 3}">${p}</text>` : ''}</g>`).join(''); }).join('')}<text x="100" y="441" fill="#93a8bb" font-size="11" text-anchor="middle">${v === 'f' ? 'FRONT' : 'BACK'}</text></g>`;
    return `<svg class="chart" viewBox="0 0 410 446" role="img" aria-label="Tap where you feel it">${view('f', 0)}${view('b', 1)}</svg>`;
  }
  function bindChart(el, cb) { el.querySelectorAll('.zone').forEach(z => z.addEventListener('click', () => cb(z.dataset.r))); }

  /* ---------- onboarding ---------- */
  let step = 0;
  const isF = () => S.profile.sex === 'f';
  function renderOnboard() {
    const P = S.profile, el = $('s-onboard'); P.w = P.w || { now: [], sym: [] };
    const steps = ['safety', ...(isF() ? ['women'] : []), 'pain', 'day'], cur = steps[step];
    const dots = `<div class="wizard-dots">${steps.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>`;
    const nav = (label) => `<div class="row">${step ? '<button class="ghost" id="back">Back</button>' : ''}<button class="primary grow" id="next">${label}</button></div>`;
    if (!cur) { S.onboarded = true; save(); show('today'); return; }
    if (cur === 'safety') el.innerHTML = `${dots}<h1>Let's set this up</h1><p class="mute">A few short questions. Your answers stay on this device.</p>
<div class="card"><h2 style="margin-top:0">About you</h2><p class="small">Used to show the right body chart and figure, and to ask the right health questions.</p><div class="choice">${[['f', 'Woman'], ['m', 'Man'], ['x', 'Prefer not to say']].map(([v, t]) => `<button class="${P.sex === v ? 'on' : ''}" data-sex="${v}">${t}</button>`).join('')}</div>
<div class="choice one" style="margin-top:6px"><button class="${P.osteo ? 'on' : ''}" data-osteo="1">I have osteoporosis, or broke a bone in a minor fall</button></div></div>
<div class="card"><h2 style="margin-top:0">Two safety checks</h2>
<p><b>${BREATH.screen.q}</b></p><div class="choice one">${[['no', 'No'], ['mild', 'A little tightness, but it does not limit me'], ['yes', 'Yes, I need to sit up to breathe comfortably']].map(([v, t]) => `<button class="${P.breathless === v ? 'on' : ''}" data-br="${v}">${t}</button>`).join('')}</div>
<p style="margin-top:14px"><b>Do any of these apply right now?</b> <span class="small">(tap all that do)</span></p><div class="choice one">${[['cauda', 'Numbness around the groin, or new bladder or bowel problems'], ['limb', 'Weakness or numbness spreading into an arm or leg'], ['injury', 'Pain that started with a fall or accident'], ['night', 'Pain that wakes me at night, or fever or weight loss with it'], ['chest', 'Chest pain, or breathlessness with exertion']].map(([v, t]) => `<button class="${P.redflags.includes(v) ? 'on' : ''}" data-rf="${v}">${t}</button>`).join('')}</div></div>${nav('Continue')}`;
    if (cur === 'women') { const w = P.w, has = k => w.now.includes(k);
      el.innerHTML = `${dots}<h1>Your health right now</h1><p class="mute">Tap everything that applies. The plan adapts to each one; skip what does not fit.</p>
<div class="card"><div class="choice one">${WOMEN.now.map(([v, t]) => `<button class="${has(v) ? 'on' : ''}" data-wn="${v}">${t}</button>`).join('')}</div>
${has('preg') ? `<p style="margin-top:12px"><b>How far along?</b></p><div class="choice">${[[1, 'Up to 13 weeks'], [2, '14 to 27 weeks'], [3, '28 weeks or more']].map(([v, t]) => `<button class="${(w.tri || 1) === v ? 'on' : ''}" data-tri="${v}">${t}</button>`).join('')}</div>` : ''}
${has('post') ? `<p style="margin-top:12px"><b>How long ago was the birth?</b></p><div class="choice">${[['early', 'Less than 6 weeks'], ['mid', '6 to 12 weeks'], ['late', '3 to 12 months']].map(([v, t]) => `<button class="${(w.post || 'late') === v ? 'on' : ''}" data-post="${v}">${t}</button>`).join('')}</div><div class="choice one"><button class="${w.cs ? 'on' : ''}" data-cs="1">It was a caesarean birth</button></div>` : ''}</div>
<div class="card"><p><b>Any of these?</b> <span class="small">They are common and treatable.</span></p><div class="choice one">${WOMEN.sym.map(([v, t]) => `<button class="${w.sym.includes(v) ? 'on' : ''}" data-ws="${v}">${t}</button>`).join('')}</div></div>${nav('Continue')}`; }
    if (cur === 'pain') el.innerHTML = `${dots}<h1>Where do you feel it?</h1><p class="mute">Tap a dot, then say what you notice and how strong it is. Tap as many as you need${S.profile.sex === 'f' && (S.profile.w.now || []).includes('health') ? ', or none if you are here for general health' : ''}.</p><div id="chartbox"></div><div id="painlist"></div>${nav(Object.keys(S.pain).length ? 'Continue' : 'Nothing hurts, continue')}`;
    if (cur === 'day') el.innerHTML = `${dots}<h1>Your typical day</h1><p class="mute">Hours matter more than angles: the app adds up what each position does to each muscle.</p>
<div class="card">${[['desk', 'Desk or computer', 0, 12], ['sofa', 'Sofa or armchair', 0, 8], ['phone', 'Phone, head down', 0, 8], ['stand', 'Standing or walking', 0, 12]].map(([k, t, a, b]) => `<label>${t}: <b id="v_${k}">${P[k]} h</b></label><input type="range" min="${a}" max="${b}" step="0.5" value="${P[k]}" data-h="${k}">`).join('')}
<p style="margin-top:10px"><b>Desk setup</b></p><div class="choice"><button class="${P.deskGood ? 'on' : ''}" data-desk="1">Screen at eye level, back supported</button><button class="${!P.deskGood ? 'on' : ''}" data-desk="0">Laptop, or I slouch</button></div>
<p style="margin-top:10px"><b>How do you mostly sleep?</b></p><div class="choice">${[['side', 'On my side'], ['back', 'On my back'], ['curled', 'Curled up on my side'], ['backHigh', 'On my back, high pillow']].map(([v, t]) => `<button class="${P.sleep === v ? 'on' : ''}" data-sleep="${v}">${t}</button>`).join('')}</div>
<p style="margin-top:10px"><b>How long can you give each day?</b></p><div class="choice">${[10, 15, 20, 30].map(v => `<button class="${P.duration === v ? 'on' : ''}" data-dur="${v}">${v} min</button>`).join('')}</div></div>${nav('Build my plan')}`;
    const on = (sel, fn) => el.querySelectorAll(sel).forEach(b => b.onclick = () => { fn(b.dataset); save(); renderOnboard(); });
    const tog = (arr, v) => { const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); };
    on('[data-sex]', d => { P.sex = d.sex; ILLUS.setFemale(isF()); }); on('[data-osteo]', () => { P.osteo = !P.osteo; });
    on('[data-br]', d => { P.breathless = d.br; }); on('[data-rf]', d => tog(P.redflags, d.rf));
    on('[data-wn]', d => tog(P.w.now, d.wn)); on('[data-tri]', d => { P.w.tri = +d.tri; }); on('[data-post]', d => { P.w.post = d.post; }); on('[data-cs]', () => { P.w.cs = !P.w.cs; }); on('[data-ws]', d => tog(P.w.sym, d.ws));
    on('[data-desk]', d => { P.deskGood = d.desk === '1'; }); on('[data-sleep]', d => { P.sleep = d.sleep; }); on('[data-dur]', d => { P.duration = +d.dur; });
    el.querySelectorAll('[data-h]').forEach(r => r.oninput = () => { P[r.dataset.h] = +r.value; $('v_' + r.dataset.h).textContent = r.value + ' h'; });
    if ($('chartbox')) { $('chartbox').innerHTML = chartSvg(); bindChart($('chartbox'), r => painPrompt(r, () => renderOnboard())); painList($('painlist'), () => renderOnboard()); }
    const n = $('next'); if (n) n.onclick = () => { if (cur === 'safety' && !P.sex) { P.sex = 'x'; } save(); step++; window.scrollTo(0, 0); enter('onboard'); renderOnboard(); };
    const bk = $('back'); if (bk) bk.onclick = () => { step--; enter('onboard'); renderOnboard(); };
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
      box.querySelector('#pok').onclick = () => { S.pain[rid] = { v: pv(rid) || cur || 3, t: [...types] }; save(); closePlayer(box, () => { box.remove(); after(); }); };
      box.querySelector('#pclr').onclick = () => { delete S.pain[rid]; save(); closePlayer(box, () => { box.remove(); after(); }); }; };
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
    const RU = adaptRules(P, log()), ST0 = stage(), ST = RU.gentle ? { ...STAGES[0], id: ST0.id, n: ST0.n, weeks: ST0.weeks } : ST0, dur = P.duration * 60, okS = x => !RU.exclude.has(x.id); let used = 0;
    const secs = x => x.sets == null ? ((x.hold ? (x.type === 'static' && ST.id === 1 ? Math.min(20, x.hold) : x.hold) : 4) * x.reps * x.sides + 15) : ((x.hold || 3) * x.reps + 40) * x.sets * (x.sides > 1 ? 2 : 1);
    // 1. warm-up: shorter in short sessions
    const wu = P.duration <= 10 ? WARMUP.slice(0, 2) : WARMUP;
    items.push({ kind: 'warmup', section: 'warmup', ex: { id: 'warmup', n: 'Easy warm-up', steps: wu }, secs: wu.reduce((a, w) => a + w.secs, 0) }); used += items[0].secs;
    // 2. breathing, always; choice depends on the screening answer
    let br = P.breathless === 'yes' ? BREATH.ex.find(e => e.id === 'seated') : RU.breath ? BREATH.ex.find(e => e.id === RU.breath) : P.breathless === 'mild' ? BREATH.ex.find(e => e.id === 'side') : ST.id >= 2 && S.logs.length % 3 === 0 ? BREATH.ex.find(e => e.id === 'load') : BREATH.ex[S.logs.length % 2 === 0 ? 0 : 1];
    if (RU.breathAvoid.includes(br.id)) br = BREATH.ex.find(e => e.id === (RU.exclude.has('breathing') ? 'side' : 'belly'));
    items.push({ kind: 'breath', section: 'breath', ex: br, secs: ST.id === 1 ? 240 : 180 }); used += items[1].secs;
    // 2. stretches for shortened or painful tight-prone muscles, painful regions first
    const score = m => (painM.has(m.id) ? 0.5 : 0) + A[m.id].shortening * 0.6 + A[m.id].pain * 0.4;
    const tight = MUSCLES.filter(m => m.tend !== 'weak' && (A[m.id].shortening > 0.12 || A[m.id].pain > 0.4 || painM.has(m.id))).sort((a, b) => score(b) - score(a));
    const covered = new Set(), stretches = [];
    for (const m of tight) { if (covered.has(m.id) || A[m.id].noStretch) continue; const c = STRETCHES.filter(s => okS(s) && s.m.includes(m.id) && !stretches.some(q => q.ex === s) && !s.m.some(i => A[i].noStretch)).sort((x, y) => (x.type === 'static' ? 0 : 1) - (y.type === 'static' ? 0 : 1) || x.m.indexOf(m.id) - y.m.indexOf(m.id));
      if (!c.length) continue; const s = c[0], t = secs(s); if (used + t > dur * 0.7) continue; stretches.push({ kind: 'stretch', section: 'stretch', ex: s, secs: t, why: m }); used += t; s.m.forEach(i => covered.add(i)); if (stretches.length >= (ST.id === 1 ? 3 : 5)) break; }
    // 3. primer: the first key stretch, short, right before strengthening its opposite
    if (stretches.length) { const pri = stretches[0]; items.push({ kind: 'stretch', section: 'pre', ex: pri.ex, secs: 20 * pri.ex.sides + 10, why: pri.why, primer: true }); used += 20 * pri.ex.sides + 10; }
    // 3. strengthening for weak-prone muscles of the painful regions and antagonists of the tight ones
    const weak = new Map(); regions.forEach(r => REGION[r].m.forEach(id => { if (MUSCLE[id].tend === 'weak') weak.set(id, 1 + (S.pain[r] / 10)); }));
    tight.slice(0, 5).forEach(m => m.relax.forEach(i => { if (MUSCLE[i].tend !== 'tight') weak.set(i, Math.max(weak.get(i) || 0, 0.5)); }));
    const wl = [...weak.entries()].sort((a, b) => b[1] - a[1]).map(e => MUSCLE[e[0]]), sc = new Set();
    for (const id of RU.add) { const s = STRENGTH_BY[id]; if (!s) continue; const t = secs(s); items.push({ kind: 'strength', section: 'strength', ex: s, secs: t, why: MUSCLE[s.m[0]] }); used += t; s.m.forEach(i => sc.add(i)); }
    for (const m of wl) { if (sc.has(m.id)) continue; const c = STRENGTH.filter(s => okS(s) && !s.id.startsWith('pf-') && s.m.includes(m.id) && s.level <= Math.min(ST.level, RU.maxLevel) && !items.some(i => i.ex === s)).sort((x, y) => x.level - y.level); if (!c.length) continue; const s = c[0], t = secs(s); if (used + t > dur) continue; items.push({ kind: 'strength', section: 'strength', ex: s, secs: t, why: m }); used += t; s.m.forEach(i => sc.add(i)); if (items.filter(i => i.kind === 'strength').length >= ST.strength + RU.add.length) break; }
    // 5. the main stretches, on warm tissue
    items.push(...stretches);
    // 6. a short body scan when there is time
    if (used + 240 <= dur || P.duration >= 20) { items.push({ kind: 'meditate', section: 'calm', ex: { id: 'scan', n: 'Body scan', steps: BREATH.meditation.bodyScan }, secs: ST.id === 1 ? 300 : 240 }); used += 300; }
    return { items, minutes: Math.round(used / 60), A, tight: tight.slice(0, 5), weak: wl.slice(0, 4), stage: ST, rules: RU };
  }

  /* ---------- today ---------- */
  let session = null;
  function renderToday() {
    const el = $('s-today'), P = S.profile, L = log(); session = buildSession();
    const key = i => i.ex.id + (i.primer ? '-pre' : ''), done = session.items.filter(i => L.done.includes(key(i))).length, pct = Math.round(done / session.items.length * 100);
    const flags = P.redflags.length || P.breathless === 'yes';
    const flagCard = flags ? `<div class="card bad"><b>Please see a doctor before using this plan</b><p class="small" style="margin-top:6px">${P.breathless === 'yes' ? BREATH.screen.red + ' ' : ''}${P.redflags.length ? 'You ticked: ' + P.redflags.map(f => ({ cauda: 'groin numbness or bladder/bowel change', limb: 'spreading weakness or numbness', injury: 'pain after an accident', night: 'night pain, fever or weight loss', chest: 'chest pain or breathlessness on exertion' })[f]).join(', ') + '. These are not posture problems; they need assessment first. Gentle breathing and walking are fine meanwhile.' : ''}</p><button class="sm" id="editflags">Change answers</button></div>` : P.breathless === 'mild' && !P.hideBreathNote ? `<div class="card warn" style="position:relative"><button class="xbtn" id="xnote" aria-label="Hide this note">×</button><b>Breathing note</b><p class="small" style="margin-top:6px">${BREATH.screen.yellow}</p></div>` : '';
    const painIds = Object.keys(S.pain), RU = session.rules, canPeriod = P.sex === 'f' && !((P.w || {}).now || []).includes('preg');
    const adaptCard = (RU.notes.length || canPeriod) ? `<details class="adapt"${P.seenAdapt ? '' : ' open'}><summary>Adapted for you${RU.notes.length ? ' (' + RU.notes.length + ')' : ''}</summary>${RU.notes.map(n => `<p class="small">${n}</p>`).join('')}${RU.stop ? `<p class="small" style="color:var(--bad)"><b>Stop and call your midwife or doctor if you have:</b> ${RU.stop.join('; ').toLowerCase()}.</p>` : ''}${canPeriod ? `<button class="sm ${L.period ? 'on' : ''}" id="period">${L.period ? 'Period pain today: on' : 'Period pain today?'}</button>` : ''}</details>` : '';
    el.innerHTML = `<h1>Today</h1><p class="mute">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} · streak ${streak()} day${streak() === 1 ? '' : 's'}</p>${flagCard}${adaptCard}
<div class="card"><div class="row"><svg class="ring" viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="42"/><circle class="fg" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="${264 - 264 * pct / 100}"/><text x="50" y="56" text-anchor="middle" fill="#eef3f7" font-size="20" font-weight="700">${pct}%</text></svg>
<div class="grow"><b>${session.minutes} minutes · ${session.items.length} exercises</b><p class="small">${painIds.length ? 'Built for: ' + painIds.map(i => REGION[i].n.toLowerCase()).join(', ') : 'Built from your day; tap "where it hurts" to personalise it.'}</p><div class="row"><button class="sm" data-go="map">Where it hurts</button><button class="sm" data-go="day">My day</button></div></div></div></div>
${done < session.items.length ? `<button class="primary" id="startall">${done ? 'Continue' : 'Start'} session</button>` : `<div class="card ok"><b>Session complete.</b> <span class="small">Log how you feel in the Log tab.</span></div>`}
<div class="card" style="padding:10px 16px"><span class="small">Stage ${session.stage.id} of 4: <b>${session.stage.n}</b> (${session.stage.weeks})</span> <button class="sm right" data-go="progress">All stages</button></div>
${(() => { let last = null; return session.items.map((it, i) => { const sec = it.section, head = sec !== last ? `<details class="small" style="padding:8px 14px"><summary>${{ warmup: '1 · Warm up', breath: '2 · Breathe', pre: '3 · Quick pre-stretch (primer)', strength: '4 · Strengthen', stretch: '5 · Lengthen', calm: '6 · Calm down' }[sec]} <span class="mute">why?</span></summary><p style="margin:6px 0 0">${SECTION_WHY[sec]}</p></details>` : ''; last = sec;
  return head + `<div class="ex ${L.done.includes(key(it)) ? 'done' : ''}" data-i="${i}" style="--i:${i}">${illus(it)}<div><span class="badge ${it.kind}">${{ warmup: 'Warm-up', breath: 'Breathing', stretch: it.primer ? 'Pre-stretch' : 'Stretch', strength: 'Strengthen', meditate: 'Calm' }[it.kind]}</span><span class="small">${Math.max(1, Math.round(it.secs / 60))} min</span><b>${it.ex.n}</b><span class="small">${it.why ? 'feel it in ' + (WHERE[it.why.id] || it.why.n.toLowerCase()) : it.ex.dose || ''}</span></div></div>`; }).join(''); })()}
<h3>Through the day</h3><div class="card"><p>Every 45 minutes: stand up, two minutes of walking, then 30 seconds of chin tucks or a doorway stretch. One minute of 4-6 breathing whenever the neck tightens.</p><p class="small">${P.sleep === 'backHigh' ? 'Tonight: try a lower pillow or a wedge under head and chest, and a roll under the knees. ' : P.sleep === 'side' || P.sleep === 'curled' ? 'Tonight: pillow between the knees, neck level with the spine, lower arm forward rather than under the pillow. ' : 'Tonight: a small roll under the knees unloads the lower back. '}Avoid heavy meals or alcohol within three hours of bed.</p></div>
<p class="small">Pain up to 3/10 during an exercise that settles within a day is acceptable. More than that: skip it today and tell the Log.</p>`;
    el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    el.querySelectorAll('.ex').forEach(x => x.onclick = () => play(+x.dataset.i));
    const sa = $('startall'); if (sa) sa.onclick = () => play(session.items.findIndex(i => !L.done.includes(key(i))));
    const pb = $('period'); if (pb) pb.onclick = () => { L.period = !L.period; save(); renderToday(); }; if (!P.seenAdapt && RU.notes.length) { P.seenAdapt = true; save(); }
    const xn = $('xnote'); if (xn) xn.onclick = () => { P.hideBreathNote = true; save(); const c = xn.parentElement; c.classList.add('fo'); setTimeout(() => c.remove(), 300); };
    const ef = $('editflags'); if (ef) ef.onclick = () => { step = 0; show('onboard'); renderOnboard(); };
  }
  const illus = it => it.kind === 'warmup' ? ILLUS.svg('march') : it.kind === 'breath' ? `<svg class="ill" viewBox="0 0 160 100"><circle cx="80" cy="50" r="30" fill="none" stroke="#5fb6ff" stroke-width="3"/><circle cx="80" cy="50" r="16" fill="#5fb6ff" opacity=".4"/></svg>` : it.kind === 'meditate' ? `<svg class="ill" viewBox="0 0 160 100"><circle cx="80" cy="50" r="30" fill="none" stroke="#c9a4ff" stroke-width="3"/><path d="M60 50q20-30 40 0q-20 30-40 0" fill="#c9a4ff" opacity=".5"/></svg>` : ILLUS.svg(it.ex.ill);
  function streak() { const days = new Set(S.logs.filter(l => l.done && l.done.length >= 2).map(l => l.d)); let n = 0; const d = new Date(); for (;;) { const k = d.toISOString().slice(0, 10); if (days.has(k)) { n++; d.setDate(d.getDate() - 1); } else if (k === today()) { d.setDate(d.getDate() - 1); } else break; } return n; }

  /* ---------- exercise player with timers ---------- */
  let tm = null, aw = null;
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fadeText(el, text) { if (!el) return; if (reduced) { el.textContent = text; return; } el.classList.add('fo'); setTimeout(() => { el.textContent = text; el.classList.remove('fo'); }, 450); }
  function closePlayer(el, cb) { clearInterval(tm); clearInterval(aw); if (reduced) { el.classList.remove('on'); cb && cb(); return; } el.classList.add('closing'); setTimeout(() => { el.classList.remove('on', 'closing'); cb && cb(); }, 230); }
  function chime() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(), n = actx.currentTime; o.type = 'sine'; o.frequency.value = 432; g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(0.06, n + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, n + 1.6); o.connect(g); g.connect(actx.destination); o.start(); o.stop(n + 1.7); } catch (e) {} }
  /* small body chart with the working muscles glowing, to show where to put attention */
  function awFig(ids) { const ms = ids.map(i => MUSCLE[i]).filter(Boolean); if (!ms.length) return ''; const v = ms[0].ch[0];
    return `<svg class="awfig" viewBox="0 0 200 430" aria-hidden="true"><image href="${body(v)}" x="0" y="0" width="200" height="430"/>${ms.filter(m => m.ch[0] === v).map(m => { const [, x0, y, rx, ry, r] = m.ch, x = fx(x0); return [x, 200 - x].map(cx => `<ellipse class="awp" cx="${cx}" cy="${y}" rx="${rx + 2}" ry="${ry + 2}" transform="rotate(${cx === x ? r : -r} ${cx} ${y})"/>`).join(''); }).join('')}</svg>`; }
  function awareness(x, it, isStretch) { const id = (it.why && it.why.id) || x.m[0], loc = WHERE[id] || 'the working muscle', c = COACH[x.id] || { focus: [] };
    return isStretch ? [`Bring your attention to ${loc}.`, `Breathe in slowly. As you breathe out, let ${loc} soften.`, 'Notice where the pull begins, and where it ends.', ...c.focus.map(f => 'Feel: ' + f.charAt(0).toLowerCase() + f.slice(1) + '.'), 'It should be a mild pull, 3 or 4 out of 10. Ease off if it is more.', 'Check the rest of you: jaw loose, shoulders down, hands soft.', 'With each out-breath the muscle lets go a little more. No forcing.', 'Stay curious. Is the feeling changing as you hold?']
      : [`Feel ${loc} doing the work.`, 'Move slowly: two counts up, three counts down.', ...c.focus.map(f => 'Feel: ' + f.charAt(0).toLowerCase() + f.slice(1) + '.'), 'Keep breathing. Breathe out on the effort.', `Keep your attention in ${loc}; let the rest of the body stay quiet.`, 'Stop while the movement is still clean.']; }
  let raf = null, paused = false, animT = 0;
  const ease = u => u * u * (3 - 2 * u);
  /* animate a figure through one move, in step with the rep tempo; the same pause flag stops it */
  function animate(el, key, mv, tempo) {
    cancelAnimationFrame(raf); animT = 0; if (!el) return; if (!mv) return; el.innerHTML = ILLUS.svg(mv.ill || key, ILLUS.animPose(key, mv, 0)); if (reduced) return;
    const [up, hd, dn, rs] = tempo, total = up + hd + dn + rs; let last = performance.now(), drawn = 0;
    const step = now => { if (!el.isConnected) return; if (!paused && !mv.rest) animT += (now - last) / 1000; last = now;
      if (now - drawn > 33) { drawn = now; const t = animT % total, u = t < up ? ease(t / up) : t < up + hd ? 1 : t < up + hd + dn ? 1 - ease((t - up - hd) / dn) : 0;
        el.innerHTML = ILLUS.svg(mv.ill || key, ILLUS.animPose(key, mv, u, Math.floor(animT / total), t / total)); }
      raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  /* one Start / Pause / Resume button for every timer */
  function ticker(fn, label = 'Start') { const b = $('pstart'); let running = false, started = false; paused = false; b.disabled = false; b.textContent = label;
    const set = r => { running = r; paused = started && !r; b.textContent = r ? 'Pause' : started ? 'Resume' : label; b.classList.toggle('ghostp', r); clearInterval(tm); if (r) tm = setInterval(fn, 1000); };
    b.onclick = () => { started = true; set(!running); };
    return { end(txt) { clearInterval(tm); running = false; b.textContent = txt || 'Finished'; b.disabled = true; b.classList.remove('ghostp'); } }; }
  const feelHtml = f => `<div class="feel"><div class="fy"><b>You should feel</b><span>${f.good}</span></div><div class="fn"><b>You should not feel</b><span>${f.bad}</span></div></div>`;
  function play(i) {
    if (i < 0 || !session) return; const it = session.items[i], x = it.ex, P = $('player'); clearInterval(tm); clearInterval(aw); cancelAnimationFrame(raf); paused = false;
    const nextBtn = `<details class="small" style="margin-top:10px"><summary>Why this step</summary><p style="margin:6px 0 0">${SECTION_WHY[it.section] || ''}</p></details><div class="row" style="margin-top:14px"><button class="ghost" id="pclose">Close</button><button class="primary grow" id="pdone">Done${i < session.items.length - 1 ? ', next' : ''}</button></div>`;
    const doneKey = x.id + (it.primer ? '-pre' : '');
    if (it.kind === 'warmup') {
      let k = 0, t = x.steps[0].secs;
      const anim = () => { const st = x.steps[k], mv = ILLUS.MOVES[st.id]; animate($('anim'), 'stand', mv, mv ? mv.tempo : [1, 0, 1, 0]); };
      P.innerHTML = `<h2 style="margin-top:0">Easy warm-up</h2><p class="mute">About ${Math.round(it.secs / 60)} minutes, easy pace. Breathe through the nose.</p><div id="anim">${ILLUS.svg('stand')}</div><div class="timer" id="tt">${fmt(t)}</div><div class="phase" id="ph">${x.steps[0].n}</div><div class="card" id="mstep">${x.steps[0].how}</div><div class="row" style="justify-content:center"><button id="pstart" class="primary" style="width:auto">Start</button><button class="sm" id="mnext">Next</button></div>${feelHtml({ good: 'Light warmth, slightly faster breathing, joints moving more freely.', bad: 'Pain, dizziness or breathlessness. Slow down; this should feel easy.' })}${nextBtn}`;
      const ctl = ticker(() => { t--; $('tt').textContent = fmt(Math.max(0, t)); if (t <= 0) adv(); });
      const adv = () => { k++; if (k >= x.steps.length) { ctl.end('Warm'); cancelAnimationFrame(raf); fadeText($('ph'), 'Warm. Move on to the breathing.'); $('tt').textContent = ''; beep(); return; } t = x.steps[k].secs; fadeText($('ph'), x.steps[k].n); fadeText($('mstep'), x.steps[k].how); $('tt').textContent = fmt(t); anim(); beep(); };
      $('mnext').onclick = adv; anim();
    } else if (it.kind === 'breath') {
      const [inh, h1, exh, h2] = x.pattern, total = it.secs, cyc = inh + h1 + exh + h2; let t = 0;
      P.innerHTML = `<h2 style="margin-top:0">${x.n}</h2><p class="mute">${x.pos}</p><div class="duo"><svg class="breathc" viewBox="0 0 200 200"><circle cx="100" cy="100" r="85" fill="none" stroke="#2b4257" stroke-width="2"/><circle id="bc" cx="100" cy="100" r="50" fill="#5fb6ff" opacity=".35"/><text id="bt" x="100" y="106" text-anchor="middle" fill="#eef3f7" font-size="18">Ready</text></svg>
<svg class="awfig" viewBox="0 0 200 430" aria-hidden="true"><image href="${body('f')}" x="0" y="0" width="200" height="430"/><ellipse id="bz" class="bz" cx="100" cy="162" rx="22" ry="24"/></svg></div>
<div class="timer" id="tt">${fmt(total)}</div><div class="phase" id="ph">In ${inh} · ${h1 ? 'hold ' + h1 + ' · ' : ''}out ${exh}${h2 ? ' · hold ' + h2 : ''}</div>
<div class="row" style="justify-content:center;margin-top:10px"><button id="pstart" class="primary" style="width:auto">Start</button></div><div class="aware" id="aw">Put one hand on your belly. The glow shows where the breath should go.</div>
${feelHtml({ good: 'Your belly and lower ribs widening as you breathe in and falling as you breathe out. Shoulders and neck stay quiet.', bad: 'Dizziness or tingling fingers: that is over-breathing. Make the breaths smaller and pause. Chest or neck doing the lifting: breathe less air, lower down.' })}
<ol class="steps">${x.steps.map(s => `<li>${s}</li>`).join('')}</ol><p class="small">${x.cue}</p>${nextBtn}`;
      const tips = ['Feel the belly rise under your hand.', 'Let the lower ribs widen sideways.', 'The out-breath is slow and unforced.', 'Shoulders heavy, jaw loose.', 'Small and quiet breaths work best.'];
      const ctl = ticker(() => { const k = t % cyc; t++; const ph = k < inh ? ['Breathe in', (k + 1) / inh] : k < inh + h1 ? ['Hold', 1] : k < inh + h1 + exh ? ['Breathe out', 1 - (k - inh - h1 + 1) / exh] : ['Rest', 0];
        $('bc').setAttribute('r', 50 + 35 * ph[1]); $('bz').setAttribute('rx', 22 + 12 * ph[1]); $('bz').setAttribute('ry', 24 + 8 * ph[1]); $('bt').textContent = ph[0]; $('tt').textContent = fmt(Math.max(0, total - t));
        if (t % (cyc * 2) === 0) fadeText($('aw'), tips[(t / (cyc * 2)) % tips.length | 0]);
        if (t >= total) { ctl.end('Done'); $('bt').textContent = 'Done'; beep(); } });
    } else if (it.kind === 'meditate') {
      const lines = SCAN.flatMap((r, ri) => r.lines.map(l => ({ l, ri }))), per = Math.max(6, Math.round(it.secs / lines.length)); let k = -1, t = 0;
      P.innerHTML = `<div class="scan"><h2 style="margin-top:0">${x.n}</h2><p class="mute" id="mreg">About ${Math.round(it.secs / 60)} minutes. ${(session.rules && session.rules.scanNote) || 'Lie down or sit supported'}, then press start.</p>
<svg class="scanfig" viewBox="0 0 200 430" aria-hidden="true"><defs><radialGradient id="sgg"><stop offset="0" stop-color="#c9a4ff" stop-opacity=".85"/><stop offset="1" stop-color="#c9a4ff" stop-opacity="0"/></radialGradient></defs><image href="${body('f')}" x="0" y="0" width="200" height="430" opacity=".9"/><ellipse id="sg" cx="100" cy="215" rx="75" ry="205" fill="url(#sgg)"/></svg>
<div class="scantxt" id="mline">When you are ready, close your eyes after each line and feel it.</div>
<div class="wizard-dots" id="mdots">${SCAN.map(() => '<i></i>').join('')}</div>
<div class="row" style="justify-content:center"><button id="pstart" class="primary" style="width:auto">Start</button><button class="sm" id="mnext">Next</button><span class="small" id="tt"></span></div></div>${nextBtn}`;
      const showLine = () => { k++; if (k >= lines.length) { ctl.end('Done'); fadeText($('mline'), 'Finished. Open your eyes when you are ready.'); chime(); return; }
        const { l, ri } = lines[k], r = SCAN[ri], first = k === 0 || lines[k - 1].ri !== ri; fadeText($('mline'), l);
        if (first) { fadeText($('mreg'), r.n); const g = $('sg'); g.setAttribute('cx', r.z[0]); g.setAttribute('cy', r.z[1]); g.setAttribute('rx', r.z[2]); g.setAttribute('ry', r.z[3]); document.querySelectorAll('#mdots i').forEach((d, j) => d.classList.toggle('on', j <= ri)); chime(); }
        t = per; $('tt').textContent = fmt((lines.length - k) * per); };
      const ctl = ticker(() => { if (k < 0) { showLine(); return; } t--; $('tt').textContent = fmt(Math.max(0, (lines.length - k - 1) * per + t)); if (t <= 0) showLine(); });
      $('mnext').onclick = showLine;
    } else {
      const isStretch = x.sets == null, sides = x.sides || 1, mv0 = ILLUS.MOVES[x.id], mv = mv0 && !it.primer ? { ...mv0 } : null;
      const hold = it.primer ? 20 : isStretch ? (x.type === 'static' && (session.stage.id === 1 || (session.rules && session.rules.stretchCap)) ? Math.min(20, x.hold) : x.hold || 0) : (x.reps === 1 ? x.hold || 0 : 0);
      const tempo = (mv && mv.tempo) || (isStretch ? [2, 0, 2, 0] : [2, Math.max(1, x.hold || 1), 3, 1]), repT = Math.round(tempo.reduce((a, b) => a + b, 0)) || 1;
      const sets = it.primer ? 1 : isStretch ? (hold ? x.reps : 1) : x.sets, reps = hold ? 0 : x.reps, cycles = [], side = s => sides > 1 ? (s ? ' · left' : ' · right') : '';
      for (let r = 0; r < sets; r++) { for (let s = 0; s < sides; s++) cycles.push(hold ? { n: `${isStretch ? 'Hold' : 'Set'} ${r + 1}${side(s)}`, t: hold } : { n: `${sets > 1 ? 'Set ' + (r + 1) : 'Reps'}${side(s)}`, t: reps * repT, reps }); if (!isStretch && r < sets - 1) cycles.push({ n: 'Rest', t: 40, rest: true }); }
      let c = 0, t = cycles[0].t, e = 0; const f = FEEL(x, it.why && it.why.id);
      const label = () => { const cy = cycles[c]; return cy.reps ? `${cy.n} · rep ${Math.min(cy.reps, Math.floor(e / repT) + 1)} of ${cy.reps}` : cy.n; };
      P.innerHTML = `<h2 style="margin-top:0">${x.n}</h2><p class="mute">Feel it in ${f.where}</p><div class="duo"><div id="anim">${ILLUS.svg(x.ill)}</div>${awFig(it.why ? [it.why.id, ...x.m.filter(q => q !== it.why.id)] : x.m)}</div><div class="timer" id="tt">${fmt(t)}</div><div class="phase" id="ph">${label()}</div><div class="bar" style="margin:8px 0"><i id="pb" style="width:0"></i></div><div class="aware" id="aw">${awareness(x, it, isStretch)[0]}</div>
<div class="row" style="justify-content:center"><button id="pstart" class="primary" style="width:auto">Start</button><button class="sm" id="pnext">Skip</button></div>${feelHtml(f)}
${it.primer ? `<div class="card warn" style="margin:10px 0"><b>What is a primer?</b><p class="small" style="margin:6px 0 0">${SECTION_WHY.pre}</p></div>` : ''}<p style="margin-top:14px"><b>${it.primer ? 'Primer: hold 20 s' + (sides > 1 ? ' each side' : '') + ', then straight to the strengthening' : isStretch && hold ? `hold ${hold} s × ${x.reps}${sides > 1 ? ' each side' : ''} (stage ${session.stage.id} dose)` : PLAN.dose(x)}</b>${mv ? ` <span class="small">· tempo ${tempo[0]} s out, ${tempo[1] ? tempo[1] + ' s hold, ' : ''}${tempo[2]} s back</span>` : ''}</p><p>${x.how}</p>${coach(x)}<p class="small">Muscles: ${PLAN.names(x.m)}</p>${PLAN.links(x, isStretch ? 'stretch' : 'exercise')}${nextBtn}`;
      const adv = () => { c++; $('pb').style.width = Math.round(c / cycles.length * 100) + '%'; if (c >= cycles.length) { ctl.end('All done'); if (mv) mv.rest = true; fadeText($('ph'), 'All done'); $('tt').textContent = ''; beep(); return; } t = cycles[c].t; e = 0; animT = 0; if (mv) mv.rest = !!cycles[c].rest; $('ph').textContent = label(); $('tt').textContent = fmt(t); beep(); };
      const ctl = ticker(() => { t--; e++; $('tt').textContent = fmt(Math.max(0, t)); $('ph').textContent = label(); if (t <= 0) adv(); });
      $('pnext').onclick = adv; animate($('anim'), x.ill, mv, tempo);
      const prompts = awareness(x, it, isStretch); let ai = 0; aw = setInterval(() => { if (paused) return; ai = (ai + 1) % prompts.length; fadeText($('aw'), prompts[ai]); }, 7000);
    }
    if (P.classList.contains('on')) { P.classList.remove('swap'); void P.offsetWidth; P.classList.add('swap'); } P.classList.add('on'); P.scrollTop = 0;
    $('pclose').onclick = () => { cancelAnimationFrame(raf); closePlayer(P, renderToday); };
    $('pdone').onclick = () => { clearInterval(tm); cancelAnimationFrame(raf); const L = log(); if (!L.done.includes(doneKey)) { L.done.push(doneKey); L.minutes += Math.round(it.secs / 60); } save(); if (i < session.items.length - 1) play(i + 1); else closePlayer(P, renderToday); };
  }
  const coach = x => { const c = COACH[x.id]; return c ? `<div class="coach"><div><b>Focus on</b><ul>${c.focus.map(t => `<li>${t}</li>`).join('')}</ul></div><div><b>Avoid</b><ul>${c.avoid.map(t => `<li>${t}</li>`).join('')}</ul></div></div>` : `<p class="small"><i>${x.cue || ''}</i></p>`; };
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  let actx = null; function beep() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 660; g.gain.value = 0.08; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.18); if (navigator.vibrate) navigator.vibrate(60); } catch (e) {} }

  /* ---------- map and day screens (editing after onboarding) ---------- */
  function renderMap() { const el = $('s-map'); el.innerHTML = `<h1>Where it hurts</h1><p class="mute">Tap a spot to set or change it. This updates today's plan.</p><div id="chartbox2"></div><div id="painlist2"></div><button class="primary" id="mapok">Back to today</button>`; $('chartbox2').innerHTML = chartSvg(); bindChart($('chartbox2'), r => painPrompt(r, renderMap)); painList($('painlist2')); $('mapok').onclick = () => show('today'); }
  function renderDay() { step = isF() ? 3 : 2; const el = $('s-day'); el.innerHTML = ''; show('onboard'); renderOnboard(); }

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
<details><summary>Sources</summary><ul class="small">${BREATH.SOURCES.map(s => `<li>${s}</li>`).join('')}<li>ACSM Guidelines for Exercise Testing and Prescription, 10th ed. (stretch and strength doses).</li><li>NICE NG59, Low back pain and sciatica: assessment and management.</li><li>Gray's Anatomy, 41st ed.; Moore's Clinically Oriented Anatomy (muscle attachments and nerves).</li>${WOMEN.sources.map(t => `<li>${t}</li>`).join('')}</ul></details>
`;
    el.querySelectorAll('[data-br]').forEach(b => b.onclick = () => { session = session || buildSession(); session.items.unshift({ kind: 'breath', ex: BREATH.ex.find(e => e.id === b.dataset.br), secs: 300 }); play(0); });
    $('scan').onclick = () => { session = session || buildSession(); session.items.unshift({ kind: 'meditate', ex: { id: 'scan10', n: 'Body scan', steps: BREATH.meditation.bodyScan }, secs: 600 }); play(0); };
  }

  /* ---------- start ---------- */
  ILLUS.setFemale(S.profile.sex === 'f');
  if (!S.onboarded) { show('onboard'); renderOnboard(); } else show('today');
})();

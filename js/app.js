/* Tension Coach: Today, Resets, Program, Learn, and a full-screen coached player.
   Engine: adds up what the day's positions do to each muscle, weights it by where it hurts, stretches what is held short,
   strengthens what is held long or switched off. Session order: warm up, strengthen, lengthen, breathe (cool-down).
   All data stays in localStorage on the device. */
(() => {
  const $ = id => document.getElementById(id), KEY = 'tension.v1';
  const dkey = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const today = () => dkey(0);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const DEF = { onboarded: false, started: today(), profile: { breathless: 'no', redflags: [], desk: 4, sofa: 2, phone: 2, stand: 2, sleep: 'side', duration: 10, deskGood: false, stage: 0, sex: '', osteo: false, w: { now: [], sym: [] }, perWeek: 5, theme: 'auto' }, pain: {}, logs: [], remind: { on: false, every: 45 } };
  let S = load() || JSON.parse(JSON.stringify(DEF));
  S.profile = { ...DEF.profile, ...S.profile }; S.remind = S.remind || DEF.remind; S.logs = S.logs || []; S.pain = S.pain || {};
  for (const k in S.pain) if (typeof S.pain[k] === 'number') S.pain[k] = { v: S.pain[k], t: ['pain'] };
  for (const k in S.pain) if (!REGION[k]) delete S.pain[k];
  const pv = rid => (S.pain[rid] && S.pain[rid].v) || 0, pt = rid => (S.pain[rid] && S.pain[rid].t) || [];
  const log = (d = today()) => { let l = S.logs.find(x => x.d === d); if (!l) { l = { d, pain: {}, done: [], minutes: 0, resets: [] }; S.logs.push(l); } l.resets = l.resets || []; return l; };
  const active = l => l && ((l.done && l.done.length >= 2) || (l.resets && l.resets.length));
  const isF = () => S.profile.sex === 'f';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const fmt = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1), low = s => s.charAt(0).toLowerCase() + s.slice(1);
  const sentences = t => (t || '').match(/[^.!?]+[.!?]*/g)?.map(x => x.trim()).filter(Boolean) || [];
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ---------- theme ---------- */
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  const isDark = () => S.profile.theme === 'dark' || (S.profile.theme !== 'light' && mq && mq.matches);
  function applyTheme() { document.documentElement.dataset.theme = isDark() ? 'dark' : 'light'; const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = isDark() ? '#16130F' : '#FAF6F1'; }
  mq && mq.addEventListener && mq.addEventListener('change', () => { applyTheme(); rerender(); });

  /* ---------- icons (line icons, no emoji) ---------- */
  const P = d => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = {
    sun: P('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    bolt: P('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>'),
    chart: P('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    book: P('<path d="M2 5c3-1.5 6.5-1.5 10 1 3.5-2.5 7-2.5 10-1v14c-3-1.5-6.5-1.5-10 1-3.5-2.5-7-2.5-10-1z"/><path d="M12 6v14"/>'),
    play: P('<path d="M7 4.5v15l12.5-7.5z" class="fill"/>'), pause: P('<rect x="6" y="4.5" width="4" height="15" rx="1" class="fill"/><rect x="14" y="4.5" width="4" height="15" rx="1" class="fill"/>'),
    next: P('<path d="M5 5v14l10-7z" class="fill"/><path d="M19 5v14"/>'), prev: P('<path d="M19 5v14L9 12z" class="fill"/><path d="M5 5v14"/>'),
    x: P('<path d="M6 6l12 12M18 6 6 18"/>'), back: P('<path d="M15 5l-7 7 7 7"/>'), chev: P('<path d="M9 5l7 7-7 7"/>'),
    voice: P('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
    voiceOff: P('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
    music: P('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
    musicOff: P('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/><path d="M3 3l18 18"/>'),
    check: P('<path d="M5 12.5l4.5 4.5L19 7.5"/>'), cal: P('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    flag: P('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'), body: P('<circle cx="12" cy="4.5" r="2.5"/><path d="M6 9h12M12 9v6M12 15l-3.5 6M12 15l3.5 6"/>'),
    clock: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'), shield: P('<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
    alert: P('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>'), heart: P('<path d="M12 20s-7.5-4.6-9-9.5C2 6.5 6.5 4 9.5 6.3L12 8.5l2.5-2.2C17.5 4 22 6.5 21 10.5 19.5 15.4 12 20 12 20z"/>'),
    layers: P('<path d="M12 3 2 8l10 5 10-5z"/><path d="M2 13l10 5 10-5"/>'), wind: P('<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7"/>'),
    steps: P('<path d="M4 20h4v-4h4v-4h4V8h4"/>'), moon: P('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>'),
    bell: P('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'), sliders: P('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
    user: P('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'), trash: P('<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>'),
    contrast: P('<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" class="fill"/>'), desk: P('<path d="M3 10h18M5 10v10M19 10v10M8 10V5h8v5"/>'),
    sofa: P('<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM5 18v2M19 18v2"/>'),
    walk: P('<circle cx="13" cy="4" r="2"/><path d="M10 21l2-6-3-3 1-5 4 3 3 1M9 12l-3 2"/>'), mix: P('<path d="M4 7h4l8 10h4M4 17h4l2.5-3M14 10l2-3h4M17 4l3 3-3 3M17 14l3 3-3 3"/>')
  };

  /* ---------- body map ---------- */
  const body = v => (isF() ? BODYIMG_F : BODYIMG)[v], fx = x => isF() ? 100 + (x - 100) * 0.86 : x;
  const WARM = '<filter id="warmBody" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="-0.089 -0.300 -0.030 0 1.01  -0.091 -0.308 -0.031 0 0.925  -0.100 -0.336 -0.034 0 0.85  0 0 0 1 0"/></filter>';
  const bodyImg = (v, extra = '') => `<image href="${body(v)}" x="0" y="0" width="200" height="430" ${isDark() ? '' : 'filter="url(#warmBody)"'} ${extra}/>`;
  function chartSvg(v) {
    const zones = REGIONS.filter(r => r.zone && r.v === v && (!r.sex || r.sex === S.profile.sex)).map(r => { const [x0, y] = r.zone, x = fx(x0), p = pv(r.id);
      return (Math.abs(x - 100) < 4 ? [100] : [x, 200 - x]).map(cx => `<g class="zone ${p ? 'sel' : ''}" data-r="${r.id}" tabindex="0" role="button" aria-label="${esc(r.n)}"><circle class="hit" cx="${cx}" cy="${y}" r="13"/><circle class="ring" cx="${cx}" cy="${y}" r="${p ? 11 : 8}"/><circle class="dot" cx="${cx}" cy="${y}" r="${p ? 8.5 : 5}"/>${p ? `<text x="${cx}" y="${y + 3.2}">${p}</text>` : ''}</g>`).join(''); }).join('');
    return `<svg class="chart" viewBox="0 -4 200 438" role="img" aria-label="Body map, ${v === 'f' ? 'front' : 'back'}"><defs>${WARM}</defs>${bodyImg(v)}${zones}</svg>`;
  }
  function bodyMap(el, after, o = {}) {
    let view = el.dataset.view || 'f';
    const draw = () => { el.dataset.view = view;
      el.innerHTML = `<div class="maptools">${o.head || ''}<div class="seg sm"><button class="${view === 'f' ? 'on' : ''}" data-v="f">Front</button><button class="${view === 'b' ? 'on' : ''}" data-v="b">Back</button></div></div><div class="mapwrap">${chartSvg(view)}</div>
<div class="chips">${Object.keys(S.pain).map(id => `<button class="chip on" data-r="${id}">${esc(REGION[id].n)} <b>${pv(id)}</b></button>`).join('') || '<span class="hint">Tap a dot. Tap as many as you like.</span>'}</div>`;
      el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { view = b.dataset.v; draw(); }); o.bind && o.bind(el);
      el.querySelectorAll('[data-r]').forEach(z => { const go = () => painSheet(z.dataset.r, () => { draw(); after && after(); }); z.onclick = go; z.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') go(); }; }); };
    draw();
  }
  function painSheet(rid, after) {
    const r = REGION[rid], types = new Set(pt(rid).length ? pt(rid) : ['pain']); let v = pv(rid) || 4;
    const opts = SYMPTOMS.filter(t => (!t.joints || t.joints.includes(rid)) && (!t.regions || t.regions.includes(rid)));
    sheet(r.n, close => {
      const draw = el => { el.innerHTML = `<p class="label">How strong?</p><div class="scale">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button class="${n === v ? 'on' : ''}" data-v="${n}">${n}</button>`).join('')}</div>
<p class="label">Feels like</p><div class="chips">${opts.map(t => `<button class="chip ${types.has(t.id) ? 'on' : ''}" data-t="${t.id}">${t.n}</button>`).join('')}</div>
${[...types].filter(t => t === 'tingle' || t === 'weak').map(t => `<div class="note warn">${I.alert}<span>${SYMPTOM_ADVICE[t].default}</span></div>`).join('')}
<div class="row"><button class="btn ghost" id="pclr">${S.pain[rid] ? 'Remove' : 'Cancel'}</button><button class="btn" id="pok">Done</button></div>`;
        el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { v = +b.dataset.v; draw(el); });
        el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const t = b.dataset.t; types.has(t) ? types.delete(t) : types.add(t); if (!types.size) types.add('pain'); draw(el); });
        el.querySelector('#pok').onclick = () => { S.pain[rid] = { v, t: [...types] }; log().pain[rid] = v; save(); close(); after(); };
        el.querySelector('#pclr').onclick = () => { delete S.pain[rid]; save(); close(); after(); }; };
      return draw;
    });
  }

  /* ---------- sheets and toasts ---------- */
  function sheet(title, build) {
    const wrap = document.createElement('div'); wrap.className = 'sheetwrap';
    wrap.innerHTML = `<div class="backdrop"></div><div class="sheet" role="dialog" aria-label="${esc(title)}"><div class="grab"></div><div class="shead"><h2>${esc(title)}</h2><button class="iconbtn" aria-label="Close">${I.x}</button></div><div class="sbody"></div></div>`;
    document.body.appendChild(wrap); requestAnimationFrame(() => wrap.classList.add('on'));
    const close = () => { wrap.classList.remove('on'); setTimeout(() => wrap.remove(), 260); };
    wrap.querySelector('.backdrop').onclick = close; wrap.querySelector('.shead button').onclick = close;
    const draw = build(close); draw && draw(wrap.querySelector('.sbody')); return close;
  }
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('on')); setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 300); }, 2600); }

  /* ---------- analysis: add up the day's positions ---------- */
  const PRESET = n => POSTURES.find(p => p.n === n);
  function analyseDay() {
    const Pf = S.profile, blocks = [];
    if (Pf.desk) blocks.push([PRESET(Pf.deskGood ? 'Desk, good setup' : 'Desk slouch'), Pf.desk]);
    if (Pf.sofa) blocks.push([PRESET('Sofa slouch (sacral sitting)'), Pf.sofa]);
    if (Pf.phone) blocks.push([PRESET('Sofa, phone, head down'), Pf.phone]);
    if (Pf.stand) blocks.push([PRESET('Upright standing'), Pf.stand]);
    blocks.push([PRESET({ side: 'Side sleeping, straight', back: 'Back sleeping, flat', curled: 'Side sleeping, curled (fetal)', backHigh: 'Back sleeping, high pillow' }[Pf.sleep]), 7.5]);
    const agg = {}; MUSCLES.forEach(m => agg[m.id] = { T: 0, shortening: 0, pain: 0, passive: 0, r: 1, h: 0 });
    for (const [pr, h] of blocks) { if (!pr) continue; const p = { ...KIN.P0, ...pr.v, scene: pr.scene || 'floor', seat: pr.seat, bed: pr.bed, support: pr.support, press: pr.press, time: Math.min(240, h * 60) };
      const A = KIN.analyse(KIN.build(p), MUSCLES, p); MUSCLES.forEach(m => { const a = A[m.id], g = agg[m.id]; g.T = Math.max(g.T, a.T); g.pain = Math.max(g.pain, a.pain); g.shortening += a.shortening * h; g.passive += a.passive * h; g.r += (a.r - 1) * h; g.h += h; }); }
    MUSCLES.forEach(m => { const g = agg[m.id]; if (g.h) { g.shortening /= g.h; g.passive /= g.h; g.r = 1 + (g.r - 1) / g.h; } });
    for (const rid of Object.keys(S.pain)) for (const mid of REGION[rid].m) { if (!agg[mid]) continue; agg[mid].pain = Math.max(agg[mid].pain, pv(rid) / 10); if (pt(rid).includes('tingle')) agg[mid].noStretch = true; }
    return agg;
  }
  const daysSince = d => Math.round((new Date(today()) - new Date(d)) / 864e5);
  function stage() {
    if (S.profile.stage) return STAGES[S.profile.stage - 1];
    const d = daysSince(S.started), recent = n => S.logs.filter(l => daysSince(l.d) < n), consistent = n => recent(n).filter(active).length >= Math.round(n * 4 / 7);
    const lowPain = n => { const v = recent(n).map(l => { const p = Object.values(l.pain || {}); return p.length ? Math.max(...p) : 0; }); return !v.length || v.filter(x => x <= 3).length >= v.length * 0.7; };
    if (d >= 84 && consistent(28) && lowPain(28)) return STAGES[3];
    if (d >= 42 && consistent(28) && lowPain(14)) return STAGES[2];
    if (d >= 14 && consistent(14) && lowPain(14)) return STAGES[1];
    return STAGES[0];
  }
  function rules() {
    const RU = adaptRules(S.profile, log()), y = S.logs.find(l => l.d === dkey(-1));
    if ((y && y.feel === 'worse') || log().feel === 'worse') { RU.gentle = true; RU.maxLevel = Math.min(RU.maxLevel, 1); }
    return RU;
  }

  /* ---------- session builder: warm up, strengthen, lengthen, breathe ---------- */
  function buildSession() {
    const Pf = S.profile, A = analyseDay(), items = [], regions = Object.keys(S.pain), painM = new Set(regions.flatMap(r => REGION[r].m));
    const RU = rules(), ST0 = stage(), ST = RU.gentle ? { ...STAGES[0], id: ST0.id, n: ST0.n, weeks: ST0.weeks } : ST0, dur = Pf.duration * 60, okS = x => !RU.exclude.has(x.id); let used = 0;
    const capHold = x => x.type === 'static' && (ST.id === 1 || RU.stretchCap) ? Math.min(20, x.hold) : x.hold;
    const secs = x => x.sets == null ? ((x.hold ? capHold(x) : 4) * x.reps * x.sides + 12) : ((x.hold || 2) * x.reps + 30) * x.sets * (x.sides > 1 ? 2 : 1);
    // 1. warm-up: easy pulse raiser and joint mobility, never static holds
    const wu = (Pf.duration <= 5 ? WARMUP.slice(0, 2) : Pf.duration <= 10 ? WARMUP.slice(0, 3) : WARMUP);
    wu.forEach(w => { const t = Pf.duration <= 5 ? Math.round(w.secs * 0.7) : w.secs; items.push({ kind: 'move', section: 'warmup', ex: w, secs: t }); used += t; });
    const breathT = Pf.duration <= 5 ? 75 : Pf.duration <= 10 ? 120 : 180; used += breathT;
    // stretch targets: shortened or painful tight-prone muscles, painful regions first
    const score = m => (painM.has(m.id) ? 0.5 : 0) + A[m.id].shortening * 0.6 + A[m.id].pain * 0.4;
    const tight = MUSCLES.filter(m => m.tend !== 'weak' && (A[m.id].shortening > 0.12 || A[m.id].pain > 0.4 || painM.has(m.id))).sort((a, b) => score(b) - score(a));
    const covered = new Set(), stretches = [];
    for (const m of tight) { if (covered.has(m.id) || A[m.id].noStretch) continue; const c = STRETCHES.filter(s => okS(s) && s.m.includes(m.id) && !stretches.some(q => q.ex === s) && !s.m.some(i => A[i] && A[i].noStretch)).sort((x, y) => (x.type === 'static' ? 0 : 1) - (y.type === 'static' ? 0 : 1) || x.m.indexOf(m.id) - y.m.indexOf(m.id));
      if (!c.length) continue; const s = c[0], t = secs(s); if (used + t > dur * 0.75) continue; stretches.push({ kind: 'stretch', section: 'stretch', ex: s, secs: t, why: m }); used += t; s.m.forEach(i => covered.add(i)); if (stretches.length >= (ST.id === 1 ? 3 : 5)) break; }
    // 2. primer: a short 20 s stretch of the tightest muscle, right before strengthening its opposite
    if (stretches.length && Pf.duration >= 10) { const pri = stretches[0], t = 20 * pri.ex.sides + 8; items.push({ kind: 'stretch', section: 'pre', ex: pri.ex, secs: t, why: pri.why, primer: true }); used += t; }
    // 3. strengthen: weak-prone muscles of painful regions and the antagonists of the tight ones
    const weak = new Map(); regions.forEach(r => REGION[r].m.forEach(id => { if (MUSCLE[id] && MUSCLE[id].tend === 'weak') weak.set(id, 1 + pv(r) / 10); }));
    tight.slice(0, 5).forEach(m => m.relax.forEach(i => { if (MUSCLE[i] && MUSCLE[i].tend !== 'tight') weak.set(i, Math.max(weak.get(i) || 0, 0.5)); }));
    const wl = [...weak.entries()].sort((a, b) => b[1] - a[1]).map(e => MUSCLE[e[0]]), sc = new Set(), str = [];
    for (const id of RU.add) { const s = STRENGTH_BY[id]; if (!s) continue; const t = secs(s); if (used + t > dur * 1.1) continue; str.push({ kind: 'strength', section: 'strength', ex: s, secs: t, why: MUSCLE[s.m[0]] }); used += t; s.m.forEach(i => sc.add(i)); }
    for (const m of wl) { if (sc.has(m.id)) continue; const c = STRENGTH.filter(s => okS(s) && !s.id.startsWith('pf-') && s.m.includes(m.id) && s.level <= Math.min(ST.level, RU.maxLevel) && !str.some(i => i.ex === s)).sort((x, y) => x.level - y.level); if (!c.length) continue; const s = c[0], t = secs(s); if (used + t > dur) continue; str.push({ kind: 'strength', section: 'strength', ex: s, secs: t, why: m }); used += t; s.m.forEach(i => sc.add(i)); if (str.length >= ST.strength + RU.add.length) break; }
    items.push(...str);
    // 4. lengthen: the main stretches, on warm tissue
    items.push(...stretches);
    // 5. cool down with slow breathing (always last, or before the body scan)
    let br = Pf.breathless === 'yes' ? 'seated' : RU.breath || (Pf.breathless === 'mild' ? 'side' : (S.logs.length % 2 ? 'seated' : 'belly'));
    if (RU.breathAvoid.includes(br) || (br === 'belly' && RU.exclude.has('breathing'))) br = 'side';
    items.push({ kind: 'breath', section: 'breath', ex: BREATH.ex.find(e => e.id === br), secs: breathT });
    if (Pf.duration >= 20) { items.push({ kind: 'scan', section: 'calm', ex: { id: 'scan', n: 'Body scan' }, secs: 240 }); used += 240; }
    return { items, minutes: Math.max(1, Math.round(used / 60)), A, tight: tight.slice(0, 5), weak: wl.slice(0, 5), stretches, strength: str, stage: ST, rules: RU };
  }
  const itemKey = it => it.ex.id + (it.primer ? '-pre' : '');
  const PHASES = [['warmup', 'Warm up', ['warmup']], ['strength', 'Strengthen', ['pre', 'strength']], ['stretch', 'Lengthen', ['stretch']], ['breath', 'Breathe and settle', ['breath', 'calm']]];
  const SECTION_NAME = { warmup: 'Warm up', pre: 'Loosen', strength: 'Strengthen', stretch: 'Lengthen', breath: 'Cool down', calm: 'Cool down', cool: 'Cool down', warm: 'Warm up', energy: 'Energise' };

  /* ---------- player steps ---------- */
  const WARM_BY = Object.fromEntries(WARMUP.map(w => [w.id, w])), STRETCH_BY = Object.fromEntries(STRETCHES.map(s => [s.id, s]));
  const BREATH_BY = Object.fromEntries(BREATH.ex.map(e => [e.id, e]));
  const PRAISE = ['Nice work.', 'Lovely.', 'Great job.', 'That was good.', 'Well done.', 'Beautiful.', 'You are doing great.'];
  const MID = ['Nice and steady.', 'Good. Keep breathing.', 'That is it.', 'Looking good.', 'Stay with it.', 'Lovely control.', 'Good work.'];
  const illOf = x => x.ill || (x.id === 'wu-cat' ? 'allfours' : 'stand');
  const floorIll = k => { const t = ILLUS.T[k]; if (!t) return false; const p = { hx: 70, hy: 53, tr: -90, ...t }; return Math.abs(Math.sin(p.tr * Math.PI / 180)) < 0.5 || p.hy >= 66; };
  /* spec: { r: id, t, reps, sets, section, primer, why, music, key } */
  function mkStep(spec, RU) {
    const r = spec.r, why = spec.why, st = { key: spec.key || r, section: spec.section, music: spec.music, cues: [] };
    if (r === 'walk') return { ...st, kind: 'move', name: 'Easy walk', ill: 'stand', mv: { ...ILLUS.MOVES['wu-march'], a: { th2: 40, sh2: 100, ua: 105, fa: 95 }, b: { th2: 140, sh2: 95, ua: 75, fa: 70 }, tempo: [0.8, 0, 0.8, 0], alt: true },
      intro: ['Easy walk.', 'Walk slowly, on the spot or around the room. Let your breathing settle.'], cues: ['Let the shoulders drop.', 'Breathe in through the nose, out a little longer.', 'Your heart rate is coming down. That is the point.'], cycles: [{ label: '', t: spec.t || 60 }], music: st.music || 'flow' };
    if (r.startsWith('breath:') || spec.kind === 'breath') { const x = BREATH_BY[r.replace('breath:', '')] || BREATH_BY.seated;
      return { ...st, kind: 'breath', name: x.n.replace(/,.*$/, ''), x, ill: x.id === 'seated' ? 'seated-twist' : 'breathing', intro: [x.n.replace(/,.*$/, '') + '.', sentences(x.pos)[0]], cues: [...sentences(x.steps.join(' ')).slice(1, 4), 'Small, quiet breaths work best.', 'Let the shoulders be heavy.'], cycles: [{ label: 'Breathe', t: spec.t || 120 }], music: 'calm' }; }
    if (r === 'scan') return { ...st, kind: 'scan', name: 'Body scan', ill: 'breathing', intro: ['Body scan.', RU.scanNote || 'Lie down or sit back, and let your eyes close.'], cycles: [{ label: 'Scan', t: spec.t || 240 }], music: 'calm' };
    if (WARM_BY[r]) { const w = WARM_BY[r], mv = ILLUS.MOVES[r];
      return { ...st, kind: 'move', name: w.n, ill: illOf(w), mv, intro: [w.n + '.', sentences(w.how)[0]], cues: [...sentences(w.how).slice(1), 'Easy pace. You should be able to talk.', 'Breathe through the nose.'], cycles: [{ label: '', t: spec.t || w.secs }], music: st.music || 'energy' }; }
    const x = STRETCH_BY[r] || STRENGTH_BY[r]; if (!x) return null;
    const isStretch = x.sets == null, sides = x.sides || 1, mv0 = ILLUS.MOVES[x.id], c = COACH[x.id] || { focus: [], avoid: [] };
    const where = WHERE[(why && why.id) || x.m[0]] || '';
    const side = s => sides > 1 ? (s ? 'Left side' : 'Right side') : '';
    const cycles = []; let tempo = null, mv = null;
    if (isStretch && x.hold && !spec.reps0) {
      const hold = spec.primer ? 20 : spec.t || (x.type === 'static' && RU.stretchCap ? Math.min(RU.stretchCap, x.hold) : spec.cap ? Math.min(spec.cap, x.hold) : x.hold), reps = spec.primer ? 1 : spec.reps || x.reps;
      for (let k = 0; k < reps; k++) for (let s = 0; s < sides; s++) { if (cycles.length) cycles.push({ label: sides > 1 && s ? 'Switch sides' : 'Release', t: 4, rest: true, sw: sides > 1 && s }); cycles.push({ label: side(s) || (reps > 1 ? `Hold ${k + 1} of ${reps}` : 'Hold'), t: hold, hold: true, side: side(s) }); }
    } else {
      mv = mv0 ? { ...mv0 } : null; const reps = spec.reps || x.reps, sets = isStretch ? 1 : spec.sets || x.sets;
      tempo = (mv && mv.tempo) || (isStretch ? [2, 0, 2, 0] : [1.5, x.hold || 0.5, 2.5, 0.5]); const repT = tempo.reduce((a, b) => a + b, 0);
      if (!isStretch && x.reps === 1 && x.hold) { for (let k = 0; k < sets; k++) for (let s = 0; s < sides; s++) { if (cycles.length) cycles.push({ label: s ? 'Switch sides' : 'Rest', t: s ? 5 : 25, rest: true, sw: !!s }); cycles.push({ label: side(s) || `Set ${k + 1} of ${sets}`, t: spec.t || x.hold, hold: true, side: side(s) }); } }
      else for (let k = 0; k < sets; k++) for (let s = 0; s < sides; s++) { if (cycles.length) cycles.push({ label: s ? 'Switch sides' : 'Rest', t: s ? 5 : 25, rest: true, sw: !!s }); cycles.push({ label: (sets > 1 ? `Set ${k + 1} of ${sets}` : '') + (sides > 1 ? (sets > 1 ? ' · ' : '') + side(s) : ''), t: Math.round(reps * repT), reps, repT, side: side(s) }); }
    }
    const how = sentences(x.how);
    const focus = c.focus.map(f => 'Focus on ' + low(f) + '.'), avoid = c.avoid.slice(0, 2).map(a => 'Avoid ' + low(a).replace(/^avoid /, '') + '.');
    st.cues = [...how.slice(1), focus[0], where && isStretch ? `Let ${where} soften as you breathe out.` : where ? `Feel ${where} doing the work.` : '', avoid[0], focus[1], isStretch ? 'A mild pull only. Never sharp.' : 'Breathe out on the effort.', avoid[1], focus[2]].filter(Boolean);
    return { ...st, kind: isStretch ? 'stretch' : 'strength', name: spec.primer ? x.n + ' (quick)' : x.n, x, ill: x.ill, mv, tempo, cycles,
      intro: [x.n + '.', spec.primer ? 'A quick twenty seconds to loosen up before the strength work.' : how[0]], music: st.music || (isStretch ? 'flow' : 'energy'), where };
  }
  function sessionSteps(sess) {
    const RU = sess.rules, cap = sess.stage.id === 1 ? 20 : 0;
    return sess.items.map(it => { const sp = { r: it.kind === 'breath' ? 'breath:' + it.ex.id : it.ex.id, section: it.section, why: it.why, primer: it.primer, key: itemKey(it), cap };
      if (it.kind === 'breath' || it.kind === 'scan') sp.t = it.secs; return mkStep(sp, RU); }).filter(Boolean);
  }
  function resetSteps(rs) {
    const RU = rules(), music = rs.cat === 'calm' ? 'calm' : rs.cat === 'cool' ? 'flow' : 'energy';
    return rs.steps.filter(s => !RU.exclude.has(s.r)).map(s => mkStep({ ...s, section: rs.cat, music: (s.r.startsWith('breath') || s.r === 'scan') ? 'calm' : STRETCH_BY[s.r] && STRETCH_BY[s.r].type === 'static' ? (rs.cat === 'calm' ? 'calm' : 'flow') : music }, RU)).filter(Boolean);
  }
  const stepSecs = st => st.cycles.reduce((a, c) => a + c.t, 0) + 6;

  /* ---------- navigation ---------- */
  const TABS = [['today', 'Today', I.sun], ['resets', 'Resets', I.bolt], ['program', 'Program', I.chart], ['learn', 'Learn', I.book]];
  let tab = 'today';
  function nav() { $('nav').innerHTML = TABS.map(([id, n, ic]) => `<button data-go="${id}" class="${tab === id ? 'on' : ''}" aria-label="${n}">${ic}<span>${n}</span></button>`).join(''); $('nav').querySelectorAll('button').forEach(b => b.onclick = () => show(b.dataset.go)); }
  function show(id) { tab = id; document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 's-' + id)); nav(); window.scrollTo(0, 0); rerender(); }
  function rerender() { ({ today: renderToday, resets: renderResets, program: renderProgram, learn: renderLearn })[tab]?.(); }

  /* ---------- onboarding: three light screens ---------- */
  let ob = 0;
  const DAYS = [['desk', 'At a desk', I.desk, { desk: 7, sofa: 2, phone: 2, stand: 1 }], ['sofa', 'On the sofa', I.sofa, { desk: 0, sofa: 5, phone: 3, stand: 2 }], ['feet', 'On my feet', I.walk, { desk: 1, sofa: 2, phone: 1, stand: 8 }], ['mixed', 'A mix', I.mix, { desk: 4, sofa: 2, phone: 2, stand: 4 }]];
  const FLAGS = [['breath', 'Short of breath lying flat, better sitting up'], ['chest', 'Chest pain, or breathless with light effort'], ['cauda', 'Numbness around the groin, or new bladder or bowel problems'], ['limb', 'Weakness or numbness spreading into an arm or leg'], ['injury', 'Pain that started with a fall or accident'], ['night', 'Pain that wakes me at night, or fever or weight loss with it']];
  const flagged = () => S.profile.redflags.length || S.profile.breathless === 'yes';
  function renderOnboard() {
    const el = $('s-onboard'), Pf = S.profile; el.classList.add('on'); $('nav').hidden = true;
    const dots = `<div class="obtop"><div class="dots">${[0, 1, 2].map(i => `<i class="${i === ob ? 'on' : ''}"></i>`).join('')}</div><div class="seg icons" role="group" aria-label="Appearance">${[['light', I.sun, 'Light'], ['auto', I.contrast, 'Automatic'], ['dark', I.moon, 'Dark']].map(([v, ic, n]) => `<button class="${Pf.theme === v ? 'on' : ''}" data-theme="${v}" aria-label="${n}" title="${n}">${ic}</button>`).join('')}</div></div>`;
    const bindTheme = () => el.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { Pf.theme = b.dataset.theme; save(); applyTheme(); renderOnboard(); });
    if (ob === 0) {
      el.innerHTML = `${dots}<h1>Where does it bother you?</h1><p class="lede">Tap a spot, or skip if you just want to keep moving.</p>
<div id="obmap"></div><div class="sticky"><button class="btn" id="obnext">${Object.keys(S.pain).length ? 'Continue' : 'Nothing, keep me moving'}</button></div>`;
      bodyMap($('obmap'), () => renderOnboard(), { head: `<div class="seg sm"><button class="${Pf.sex === 'f' ? 'on' : ''}" data-sex="f">Woman</button><button class="${Pf.sex === 'm' ? 'on' : ''}" data-sex="m">Man</button></div>`,
        bind: m => m.querySelectorAll('[data-sex]').forEach(b => b.onclick = () => { Pf.sex = b.dataset.sex; ILLUS.setFemale(isF()); save(); renderOnboard(); }) });
      $('obnext').onclick = () => { if (!Pf.sex) Pf.sex = 'x'; ob = 1; save(); renderOnboard(); };
    } else if (ob === 1) {
      el.innerHTML = `${dots}<h1>Your day is mostly…</h1><p class="lede">One tap. You can fine-tune it later.</p><div class="bigpick">${DAYS.map(([id, n, ic]) => `<button data-day="${id}" class="${Pf.dayType === id ? 'on' : ''}">${ic}<span>${n}</span></button>`).join('')}</div>`;
      el.querySelectorAll('[data-day]').forEach(b => b.onclick = () => { const d = DAYS.find(x => x[0] === b.dataset.day); Object.assign(Pf, d[3]); Pf.dayType = d[0]; ob = 2; save(); renderOnboard(); });
    } else {
      const sel = k => k === 'breath' ? Pf.breathless === 'yes' : Pf.redflags.includes(k);
      el.innerHTML = `${dots}<h1>Quick safety check</h1><p class="lede">Does any of this apply right now?</p><div class="list">${FLAGS.map(([k, n]) => `<button class="opt ${sel(k) ? 'on' : ''}" data-f="${k}"><span class="box">${I.check}</span>${n}</button>`).join('')}</div>
<div class="sticky"><button class="btn" id="obdone">${flagged() ? 'Continue' : 'None of these, let’s go'}</button></div>`;
      el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { const k = b.dataset.f; if (k === 'breath') Pf.breathless = Pf.breathless === 'yes' ? 'no' : 'yes'; else { const i = Pf.redflags.indexOf(k); i >= 0 ? Pf.redflags.splice(i, 1) : Pf.redflags.push(k); } save(); renderOnboard(); });
      $('obdone').onclick = () => { S.onboarded = true; S.lastCheck = today(); save(); el.classList.remove('on'); $('nav').hidden = false; show('today'); };
    }
    bindTheme();
  }

  /* ---------- today ---------- */
  let session = null;
  const streak = () => { let n = 0; for (let o = 0; ; o--) { const l = S.logs.find(x => x.d === dkey(o)); if (active(l)) n++; else if (o === 0) continue; else break; } return n; };
  function suggestResets() {
    const h = new Date().getHours(), ids = h < 10 ? ['morning', 'pre-walk', 'desk'] : h < 17 ? ['sitting', 'desk', 'post-walk'] : h < 21 ? ['sofa', 'post-run', 'shoulders'] : ['bed', 'calm2', 'shoulders'];
    return ids.map(id => RESETS.find(r => r.id === id));
  }
  function renderToday() {
    const el = $('s-today'), Pf = S.profile, L = log(); session = buildSession();
    const steps = sessionSteps(session), doneN = session.items.filter(i => L.done.includes(itemKey(i))).length, all = doneN >= session.items.length;
    const areas = Object.keys(S.pain), RU = session.rules;
    const focus = areas.length ? areas.slice(0, 2).map(i => low(REGION[i].n)).join(' and ') : { desk: 'undoing the desk', sofa: 'undoing the sofa', feet: 'tired legs and back', mixed: 'whole-body balance' }[Pf.dayType] || 'moving well';
    const hero = ILLUS.svg('stand', ILLUS.animPose('stand', ILLUS.MOVES['wu-march'], 0.62), { uid: 'h', glow: false, fit: 0.78 });
    // one small pain check, at most every 3 days, one area at a time
    const lastChk = S.lastCheck ? daysSince(S.lastCheck) : 99, chkId = areas.length && lastChk >= 3 ? areas[(S.logs.length) % areas.length] : null;
    const phaseRows = PHASES.map(([pid, n, secs], k) => { const its = session.items.map((it, i) => ({ it, i, st: steps[i] })).filter(o => secs.includes(o.it.section)); if (!its.length) return '';
      const m = Math.max(1, Math.round(its.reduce((a, o) => a + o.it.secs, 0) / 60)), done = its.every(o => L.done.includes(itemKey(o.it)));
      return `<details class="act ${done ? 'done' : ''}"><summary><div class="thumb">${ILLUS.svg((its.find(o => !o.it.primer) || its[0]).st?.ill || 'stand', null, { uid: 't' + k, glow: false, fit: 1.375 })}</div><div class="grow"><b>${n}</b><span>${m} min · ${its.length} ${its.length === 1 ? 'exercise' : 'exercises'}</span></div><span class="num">${done ? I.check : k + 1}</span></summary>
<div class="exlist">${its.map(o => `<button class="exrow ${L.done.includes(itemKey(o.it)) ? 'done' : ''}" data-play="${o.i}"><div class="thumb sm">${ILLUS.svg(o.st ? o.st.ill : 'stand', null, { uid: 'e' + o.i, fit: 1.39 })}</div><span class="grow">${esc(o.st ? o.st.name : o.it.ex.n)}</span>${I.play}</button>`).join('')}</div></details>`; }).join('');
    el.innerHTML = `<header class="top"><div><h1>Today</h1><p class="kicker">${I.sun}<span>${streak() > 1 ? streak() + ' days in a row' : 'Time for you'}</span></p></div><button class="iconbtn tint" data-go="program" aria-label="Program">${I.cal}</button></header>
${!S.hideDisc ? `<div class="disc">${I.shield}<span>Guidance, not a diagnosis. Stop if anything hurts sharply.</span><button class="iconbtn" id="xdisc" aria-label="Dismiss">${I.x}</button></div>` : ''}
${flagged() ? `<div class="note bad">${I.alert}<span><b>Check with a doctor first.</b> Something you ticked needs a look before training. Gentle walking and the calm resets are fine meanwhile. <a href="#" id="editflags">Change answers</a></span></div>` : ''}
${RU.gentle ? `<div class="note">${I.heart}<span>Gentler today, since yesterday felt worse.</span></div>` : ''}
<section class="hero"><div class="herotxt"><h2>${all ? 'Done for today' : 'Your session'}</h2><p>${session.minutes} min for ${esc(focus)}.</p>
<div class="seg xs">${[5, 10, 15, 20].map(m => `<button class="${Pf.duration === m ? 'on' : ''}" data-dur="${m}">${m}</button>`).join('')}<span>min</span></div></div><div class="heroart">${hero}</div></section>
<button class="btn big" id="start">${I.play}<span>${all ? 'Go again' : doneN ? 'Continue' : 'Start session'}</span></button>
${chkId ? `<section class="card chk"><p><b>How is your ${esc(low(REGION[chkId].n))} today?</b></p><div class="scale sm">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button data-chk="${n}" class="${n === pv(chkId) ? 'was' : ''}">${n}</button>`).join('')}</div></section>` : ''}
<h3 class="sect">Today’s activities</h3>${phaseRows}
<div class="secthead"><h3 class="sect">Quick resets</h3><button class="link" data-go="resets">See all</button></div>
<div class="hscroll">${suggestResets().map(r => resetCard(r, 'q')).join('')}</div>
<div class="secthead"><h3 class="sect">Where it bothers you</h3><button class="link" id="editmap">Edit</button></div>
<div class="chips">${areas.map(id => `<button class="chip on" data-area="${id}">${esc(REGION[id].n)} <b>${pv(id)}</b></button>`).join('') || '<button class="chip" id="addmap">Add an area</button>'}</div>`;
    el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    el.querySelectorAll('[data-dur]').forEach(b => b.onclick = () => { Pf.duration = +b.dataset.dur; save(); renderToday(); });
    $('start').onclick = () => { const first = all ? 0 : session.items.findIndex(i => !L.done.includes(itemKey(i))); play(steps, { kind: 'session', from: Math.max(0, first) }); };
    el.querySelectorAll('[data-play]').forEach(b => b.onclick = () => play(steps, { kind: 'session', from: +b.dataset.play }));
    el.querySelectorAll('[data-reset]').forEach(b => b.onclick = () => startReset(b.dataset.reset));
    const md = () => mapSheet(renderToday); ($('editmap') || {}).onclick = md; ($('addmap') || {}).onclick = md; el.querySelectorAll('[data-area]').forEach(b => b.onclick = () => painSheet(b.dataset.area, renderToday));
    const xd = $('xdisc'); if (xd) xd.onclick = () => { S.hideDisc = true; save(); xd.parentElement.classList.add('gone'); setTimeout(renderToday, 250); };
    const ef = $('editflags'); if (ef) ef.onclick = e => { e.preventDefault(); safetySheet(); };
    el.querySelectorAll('[data-chk]').forEach(b => b.onclick = () => { const v = +b.dataset.chk; S.pain[chkId].v = v; log().pain[chkId] = v; S.lastCheck = today(); save(); toast(v < pv(chkId) ? 'Noted. Going the right way.' : 'Noted. Thanks.'); renderToday(); });
  }
  const resetCard = (r, uid) => `<button class="rcard" data-reset="${r.id}"><div class="rart">${ILLUS.svg(r.ill, null, { uid: uid + r.id, glow: false, fit: 1.6 })}</div><span class="tag ${r.cat}">${SECTION_NAME[r.cat]}</span><b>${esc(r.n)}</b><span class="mins">${Math.max(1, Math.round(resetSteps(r).reduce((a, s) => a + stepSecs(s), 0) / 60))} min</span></button>`;
  function mapSheet(after) { sheet('Where it bothers you', close => el => { el.innerHTML = '<div id="smap"></div><button class="btn" id="mapdone">Done</button>'; bodyMap(el.querySelector('#smap'), () => {}); el.querySelector('#mapdone').onclick = () => { close(); after(); }; }); }
  function startReset(id) { const r = RESETS.find(x => x.id === id); if (!r) return; play(resetSteps(r), { kind: 'reset', id, n: r.n }); }

  /* ---------- resets ---------- */
  let rcat = 'all';
  function renderResets() {
    const el = $('s-resets'), list = RESETS.filter(r => rcat === 'all' || r.cat === rcat);
    el.innerHTML = `<header class="top"><div><h1>Resets</h1><p class="kicker">${I.bolt}<span>Two to six minutes. Press play.</span></p></div></header>
<div class="seg scroll">${RESET_CATS.map(([id, n]) => `<button class="${rcat === id ? 'on' : ''}" data-cat="${id}">${n}</button>`).join('')}</div>
<div class="grid">${list.map(r => resetCard(r, 'r')).join('')}</div>`;
    el.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { rcat = b.dataset.cat; renderResets(); });
    el.querySelectorAll('[data-reset]').forEach(b => b.onclick = () => startReset(b.dataset.reset));
  }

  /* ---------- program ---------- */
  function renderProgram() {
    const el = $('s-program'), sess = session || buildSession(), ST = stage(), Pf = S.profile;
    const now = new Date(), mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const week = [...Array(7)].map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); const k = dkey(Math.round((d - new Date(today())) / 864e5)); return { k, d, l: S.logs.find(x => x.d === k) }; });
    const doneW = week.filter(w => active(w.l)).length, st = streak();
    const msg = doneW >= Pf.perWeek ? ['Week complete', 'You hit your plan. That is how habits stick.'] : st >= 2 ? ['Keep it up', `${st} days in a row. Every bit of movement counts.`] : doneW ? ['Nice start', 'You are building a great habit.'] : ['Fresh week', 'Five minutes today gets it going.'];
    const exRow = (it, k) => `<button class="exrow" data-ex="${it.ex.id}"><div class="thumb sm">${ILLUS.svg(it.ex.ill, null, { uid: 'g' + k + it.ex.id, fit: 1.39 })}</div><span class="grow"><b>${esc(it.ex.n)}</b><small>${esc(it.why ? cap(WHERE[it.why.id] || it.why.n) : '')}</small></span>${I.chev}</button>`;
    const hist = S.logs.filter(active).sort((a, b) => a.d < b.d ? 1 : -1).slice(0, 5);
    el.innerHTML = `<header class="top"><div><h1>Program</h1><p class="kicker">${I.chart}<span><b class="acc">${doneW}</b> of ${Pf.perWeek} sessions this week</span></p></div></header>
<section class="card"><p class="label">This week</p><div class="week">${week.map(w => `<div class="${w.k === today() ? 'today' : ''}"><span>${'MTWTFSS'[(w.d.getDay() + 6) % 7]}</span><span class="dn">${w.d.getDate()}</span><i class="${active(w.l) ? 'on' : ''}">${active(w.l) ? I.check : ''}</i></div>`).join('')}</div></section>
<section class="cheer"><span class="badge">${I.flag}</span><div><b>${msg[0]}</b><p>${msg[1]}</p></div></section>
<section class="card"><div class="secthead"><p class="label">Stage ${ST.id} of 4</p><span class="small">${ST.weeks}</span></div><h2 class="stn">${ST.n}</h2><div class="stagebar">${STAGES.map(s => `<i class="${s.id <= ST.id ? 'on' : ''}"></i>`).join('')}</div><p class="small">${ST.goal}</p></section>
<h3 class="sect">What your plan works on</h3>
<section class="card flush"><p class="label pad">${I.layers} Lengthen what is held short</p>${sess.stretches.map(exRow).join('') || '<p class="small pad">Nothing clearly short. Nice.</p>'}</section>
<section class="card flush"><p class="label pad">${I.bolt} Strengthen what is switched off</p>${sess.strength.map(exRow).join('') || '<p class="small pad">Add an area or your day to see targets.</p>'}</section>
${hist.length ? `<h3 class="sect">Recent</h3><section class="card flush">${hist.map(l => `<div class="hrow"><span class="grow"><b>${new Date(l.d + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</b><small>${[l.done.length >= 2 ? 'Session' : '', ...(l.resets || []).map(id => (RESETS.find(r => r.id === id) || {}).n)].filter(Boolean).join(', ')}${l.minutes ? ' · ' + l.minutes + ' min' : ''}</small></span>${l.feel ? `<span class="feel ${l.feel}">${cap(l.feel)}</span>` : ''}<i class="ok">${I.check}</i></div>`).join('')}</section>` : ''}
<h3 class="sect">Tune your plan</h3><section class="card flush settings">
${[['map', I.body, 'Where it bothers you', Object.keys(S.pain).length + ' areas'], ['day', I.desk, 'Your day', (DAYS.find(d => d[0] === Pf.dayType) || [0, 'Custom'])[1]], ['about', I.user, 'About you', Pf.sex === 'f' ? 'Woman' : Pf.sex === 'm' ? 'Man' : 'Not set'], ['safety', I.shield, 'Safety answers', flagged() ? 'Needs a look' : 'All clear'], ['week', I.cal, 'Sessions per week', Pf.perWeek], ['remind', I.bell, 'Move reminders', S.remind.on ? 'Every ' + S.remind.every + ' min' : 'Off'], ['voice', I.voice, 'Coach voice', COACH_AUDIO.voiceName ? COACH_AUDIO.voiceName.split(' ')[0] : 'Default'], ['theme', I.contrast, 'Appearance', cap(Pf.theme)], ['stage', I.steps, 'Stage', Pf.stage ? 'Stage ' + Pf.stage : 'Automatic']].map(([id, ic, n, v]) => `<button class="setrow" data-set="${id}">${ic}<span class="grow">${n}</span><small>${esc(String(v))}</small>${I.chev}</button>`).join('')}
<button class="setrow danger" id="wipe">${I.trash}<span class="grow">Erase all my data</span></button></section>`;
    el.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => exSheet(b.dataset.ex));
    el.querySelectorAll('[data-set]').forEach(b => b.onclick = () => SETTINGS[b.dataset.set]());
    const w = $('wipe'); w.onclick = () => { if (w.dataset.arm) { localStorage.removeItem(KEY); location.reload(); } else { w.dataset.arm = 1; w.querySelector('span').textContent = 'Tap again to erase everything'; setTimeout(() => { if (w.isConnected) { delete w.dataset.arm; w.querySelector('span').textContent = 'Erase all my data'; } }, 3000); } };
  }
  function exSheet(id) {
    const x = STRETCH_BY[id] || STRENGTH_BY[id]; if (!x) return; const c = COACH[x.id] || { focus: [], avoid: [] };
    sheet(x.n, close => el => { el.innerHTML = `<div class="exart">${ILLUS.svg(x.ill, null, { uid: 'x', fit: 1.6 })}</div><p class="dose">${PLAN.dose(x)}</p><p>${esc(x.how)}</p>
<div class="fa"><div><p class="label ok">Focus on</p><ul>${c.focus.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div><div><p class="label bad">Avoid</p><ul>${c.avoid.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div></div>
<button class="btn" id="exgo">${I.play}<span>Play this one</span></button>`;
      el.querySelector('#exgo').onclick = () => { close(); const st = mkStep({ r: id, section: x.sets == null ? 'stretch' : 'strength' }, rules()); play([st], { kind: 'single' }); }; });
  }
  const chipRow = (vals, cur, attr) => `<div class="seg wrap">${vals.map(([v, n]) => `<button class="${cur === v ? 'on' : ''}" data-${attr}="${v}">${n}</button>`).join('')}</div>`;
  function safetySheet() { sheet('Safety answers', close => { const draw = el => { const Pf = S.profile, sel = k => k === 'breath' ? Pf.breathless === 'yes' : Pf.redflags.includes(k);
    el.innerHTML = `<p class="small">Tick anything that applies right now.</p><div class="list">${FLAGS.map(([k, n]) => `<button class="opt ${sel(k) ? 'on' : ''}" data-f="${k}"><span class="box">${I.check}</span>${n}</button>`).join('')}</div>
<p class="label">Breathing lying flat</p>${chipRow([['no', 'Fine'], ['mild', 'A bit tight'], ['yes', 'Short of breath']], Pf.breathless, 'br')}<button class="btn" id="sdone">Done</button>`;
    el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { const k = b.dataset.f; if (k === 'breath') Pf.breathless = Pf.breathless === 'yes' ? 'no' : 'yes'; else { const i = Pf.redflags.indexOf(k); i >= 0 ? Pf.redflags.splice(i, 1) : Pf.redflags.push(k); } save(); draw(el); });
    el.querySelectorAll('[data-br]').forEach(b => b.onclick = () => { Pf.breathless = b.dataset.br; save(); draw(el); });
    el.querySelector('#sdone').onclick = () => { close(); rerender(); }; }; return draw; }); }
  const SETTINGS = {
    map: () => mapSheet(rerender),
    safety: safetySheet,
    day: () => sheet('Your day', close => { const draw = el => { const Pf = S.profile;
      el.innerHTML = `<div class="bigpick sm">${DAYS.map(([id, n, ic]) => `<button data-day="${id}" class="${Pf.dayType === id ? 'on' : ''}">${ic}<span>${n}</span></button>`).join('')}</div>
<details class="more"><summary>Fine-tune hours</summary>${[['desk', 'Desk or computer', 12], ['sofa', 'Sofa or armchair', 8], ['phone', 'Phone, head down', 8], ['stand', 'Standing or walking', 12]].map(([k, t, mx]) => `<label class="rng">${t} <b id="v_${k}">${Pf[k]} h</b><input type="range" min="0" max="${mx}" step="0.5" value="${Pf[k]}" data-h="${k}"></label>`).join('')}
<p class="label">Desk setup</p>${chipRow([['1', 'Screen at eye level'], ['0', 'Laptop, or I slouch']], Pf.deskGood ? '1' : '0', 'desk')}
<p class="label">Sleep</p>${chipRow([['side', 'Side'], ['back', 'Back'], ['curled', 'Curled up'], ['backHigh', 'Back, high pillow']], Pf.sleep, 'sleep')}</details><button class="btn" id="ddone">Done</button>`;
      el.querySelectorAll('[data-day]').forEach(b => b.onclick = () => { const d = DAYS.find(x => x[0] === b.dataset.day); Object.assign(Pf, d[3]); Pf.dayType = d[0]; save(); draw(el); });
      el.querySelectorAll('[data-h]').forEach(r => r.oninput = () => { Pf[r.dataset.h] = +r.value; Pf.dayType = 'custom'; el.querySelector('#v_' + r.dataset.h).textContent = r.value + ' h'; save(); });
      el.querySelectorAll('[data-desk]').forEach(b => b.onclick = () => { Pf.deskGood = b.dataset.desk === '1'; save(); draw(el); el.querySelector('details').open = true; });
      el.querySelectorAll('[data-sleep]').forEach(b => b.onclick = () => { Pf.sleep = b.dataset.sleep; save(); draw(el); el.querySelector('details').open = true; });
      el.querySelector('#ddone').onclick = () => { close(); rerender(); }; }; return draw; }),
    about: () => sheet('About you', close => { const draw = el => { const Pf = S.profile, w = Pf.w = Pf.w || { now: [], sym: [] }, has = k => w.now.includes(k), tog = (a, v) => { const i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); };
      el.innerHTML = `<p class="label">Body</p>${chipRow([['f', 'Woman'], ['m', 'Man'], ['x', 'Prefer not to say']], Pf.sex, 'sex')}
<div class="list"><button class="opt ${Pf.osteo ? 'on' : ''}" data-osteo="1"><span class="box">${I.check}</span>I have osteoporosis, or broke a bone in a minor fall</button></div>
${isF() ? `<p class="label">Right now</p><div class="list">${WOMEN.now.map(([v, t]) => `<button class="opt ${has(v) ? 'on' : ''}" data-wn="${v}"><span class="box">${I.check}</span>${t}</button>`).join('')}</div>
${has('preg') ? `<p class="label">How far along?</p>${chipRow([[1, 'Up to 13 weeks'], [2, '14 to 27'], [3, '28 or more']], w.tri || 1, 'tri')}` : ''}
${has('post') ? `<p class="label">Since the birth</p>${chipRow([['early', 'Under 6 weeks'], ['mid', '6 to 12 weeks'], ['late', '3 to 12 months']], w.post || 'late', 'post')}<div class="list"><button class="opt ${w.cs ? 'on' : ''}" data-cs="1"><span class="box">${I.check}</span>It was a caesarean</button></div>` : ''}
<p class="label">Any of these?</p><div class="list">${WOMEN.sym.map(([v, t]) => `<button class="opt ${w.sym.includes(v) ? 'on' : ''}" data-ws="${v}"><span class="box">${I.check}</span>${t}</button>`).join('')}</div>
${has('period') || true ? `<div class="list"><button class="opt ${log().period ? 'on' : ''}" data-period="1"><span class="box">${I.check}</span>Period pain today (gentler session)</button></div>` : ''}` : ''}
<button class="btn" id="adone">Done</button>`;
      const on = (sel, fn) => el.querySelectorAll(sel).forEach(b => b.onclick = () => { fn(b.dataset); save(); draw(el); });
      on('[data-sex]', d => { Pf.sex = d.sex; ILLUS.setFemale(isF()); }); on('[data-osteo]', () => { Pf.osteo = !Pf.osteo; }); on('[data-wn]', d => tog(w.now, d.wn)); on('[data-tri]', d => { w.tri = +d.tri; });
      on('[data-post]', d => { w.post = d.post; }); on('[data-cs]', () => { w.cs = !w.cs; }); on('[data-ws]', d => tog(w.sym, d.ws)); on('[data-period]', () => { log().period = !log().period; });
      el.querySelector('#adone').onclick = () => { close(); rerender(); }; }; return draw; }),
    week: () => sheet('Sessions per week', close => el => { el.innerHTML = chipRow([[3, '3'], [4, '4'], [5, '5'], [6, '6'], [7, '7']], S.profile.perWeek, 'pw'); el.querySelectorAll('[data-pw]').forEach(b => b.onclick = () => { S.profile.perWeek = +b.dataset.pw; save(); close(); rerender(); }); }),
    remind: () => sheet('Move reminders', close => { const draw = el => { el.innerHTML = `<p class="small">A gentle nudge to get up and do a reset, between 8:00 and 21:00. Works while the app is open or recently used; phones may pause it in the background.</p>
${chipRow([['0', 'Off'], ['30', '30 min'], ['45', '45 min'], ['60', '60 min'], ['90', '90 min']], S.remind.on ? String(S.remind.every) : '0', 'rm')}<button class="btn" id="rdone">Done</button>`;
      el.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { const v = +b.dataset.rm; S.remind.on = v > 0; if (v) S.remind.every = v; S.remind.last = Date.now(); save();
        if (v && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (e) {} } draw(el); });
      el.querySelector('#rdone').onclick = () => { close(); rerender(); }; }; return draw; }),
    voice: () => sheet('Coach voice', close => { const draw = el => { const vs = COACH_AUDIO.voices();
      el.innerHTML = `<div class="list">${vs.length ? vs.slice(0, 24).map(v => `<button class="opt ${v.name === COACH_AUDIO.voiceName ? 'on' : ''}" data-vn="${esc(v.name)}"><span class="box">${I.check}</span>${esc(v.name)} <small>${v.lang}</small></button>`).join('') : '<p class="small">No voices found on this device.</p>'}</div><button class="btn" id="vdone">Done</button>`;
      el.querySelectorAll('[data-vn]').forEach(b => b.onclick = () => { COACH_AUDIO.init(); COACH_AUDIO.setVoice(b.dataset.vn); COACH_AUDIO.hush(); COACH_AUDIO.say('Hi. I will guide you through each move.'); draw(el); });
      el.querySelector('#vdone').onclick = () => { COACH_AUDIO.hush(); close(); rerender(); }; }; return draw; }),
    theme: () => sheet('Appearance', close => el => { el.innerHTML = chipRow([['auto', 'Automatic'], ['light', 'Light'], ['dark', 'Dark']], S.profile.theme, 'th'); el.querySelectorAll('[data-th]').forEach(b => b.onclick = () => { S.profile.theme = b.dataset.th; save(); applyTheme(); close(); rerender(); }); }),
    stage: () => sheet('Stage', close => el => { el.innerHTML = `<p class="small">The app moves you on when you train 4 or more days a week and pain stays low. You can set it yourself.</p>${chipRow([[0, 'Automatic'], ...STAGES.map(s => [s.id, s.id + ' · ' + s.n])], S.profile.stage, 'st')}`; el.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { S.profile.stage = +b.dataset.st; save(); close(); rerender(); }); })
  };

  /* ---------- learn ---------- */
  function learnTopics() {
    const RU = rules(), areas = Object.keys(S.pain);
    return [
      ['how', I.layers, 'How your plan works', 'Short muscles get stretched, long ones get strong.', `<p>Every position you hold for hours leaves some muscles short and others stretched long and switched off. Desk and sofa time, for example, shortens the chest and hip fronts and switches off the upper back and glutes.</p><p>The app adds up your day, weights it by where it bothers you, then picks stretches for what is held short and strength work for what is held long. It is a model, not an examination.</p>`],
      ['order', I.steps, 'Why this order', 'Warm up, strengthen, lengthen, breathe.', `<ol class="steps"><li><b>Warm up.</b> Easy movement raises muscle temperature. Moving cold tissue is less comfortable and less effective.</li><li><b>Strengthen.</b> Done while fresh. Long static holds just before strength work reduce force, so they come later.</li><li><b>Lengthen.</b> Stretches on warm tissue gain the most.</li><li><b>Breathe.</b> Slow breathing with a long out-breath is the cool-down. It brings the heart rate and muscle tone down.</li></ol><p class="small">Resets follow the same rule: warm-ups only use moving drills, cool-downs start with easy walking and end with breathing.</p>`],
      ['breath', I.wind, 'Breathing', 'The diaphragm and your neck.', BREATH.why.slice(0, 3).map(t => `<p>${t}</p>`).join('')],
      ['areas', I.body, 'Your areas', areas.length ? areas.length + ' areas explained' : 'Add an area first', areas.length ? areas.map(id => { const r = REGION[id]; return `<h3>${esc(r.n)}</h3><p>${r.why}</p><p><b>What works:</b> ${r.ev}</p><p class="bad"><b>See a doctor if:</b> ${r.red}</p>${pt(id).filter(t => SYMPTOM_ADVICE[t]).map(t => `<p class="small">${SYMPTOM_ADVICE[t][id] || SYMPTOM_ADVICE[t].default}</p>`).join('')}`; }).join('') : '<p>Tap “Add an area” on Today to see what helps each spot.</p>'],
      ['pain', I.shield, 'Pain rules', 'What is okay to feel.', `<ul><li>Up to 3 out of 10 during an exercise, settling within a day, is fine.</li><li>4 or more, or worse the next day: skip that exercise for a week.</li><li>Never stretch into sharp pain, tingling or numbness.</li><li>Tap “Worse” after a session and tomorrow will be gentler.</li></ul>`],
      ['doctor', I.alert, 'When to see a doctor', 'Signs that need a check.', `<ul><li><b>Urgent:</b> numbness around the groin, new bladder or bowel problems, leg weakness, chest pain, breathlessness at rest, a hot swollen calf.</li><li><b>Book a visit:</b> pain that wakes you, fever or weight loss with pain, or no improvement after two weeks of sensible self-care.</li></ul><p>${BREATH.screen.red}</p>`],
      ...(isF() ? [['women', I.heart, 'Women’s health', RU.notes.length ? 'Adapted for you' : 'Pregnancy, periods, pelvic floor', (RU.notes.length ? RU.notes.map(n => `<p>${n}</p>`).join('') : '<p>Set what applies under Program, About you. The plan then removes or softens exercises and adds pelvic floor work where it helps.</p>') + (RU.stop ? `<p class="bad"><b>Stop and call your midwife or doctor if:</b> ${RU.stop.join('; ').toLowerCase()}.</p>` : '')]] : []),
      ['sleep', I.moon, 'Sleep and habits', 'Small changes that add up.', `<ul><li>Change position every 30 to 45 minutes. The best posture is the next one.</li><li>Screen top at eye level; elbows supported.</li><li>Side sleeping: pillow between the knees, neck level with the spine.</li>${BREATH.sleep.slice(0, 2).map(t => `<li>${t}</li>`).join('')}</ul>`],
      ['about', I.book, 'Disclaimer and sources', 'What this app is and is not.', `<p>Tension Coach gives general exercise guidance. It does not diagnose and has not been reviewed by a clinician. If something feels wrong, stop and get it checked.</p><ul class="small">${BREATH.SOURCES.map(s => `<li>${s}</li>`).join('')}<li>ACSM Guidelines for Exercise Testing and Prescription, 10th ed.</li><li>NICE NG59, Low back pain and sciatica.</li>${WOMEN.sources.map(t => `<li>${t}</li>`).join('')}</ul>`]
    ];
  }
  function renderLearn() {
    const el = $('s-learn'), T = learnTopics();
    el.innerHTML = `<header class="top"><div><h1>Learn</h1><p class="kicker">${I.book}<span>Short reads. The coach covers the rest.</span></p></div></header>
<div class="learn">${T.map(([id, ic, n, sub]) => `<button class="lcard" data-t="${id}"><span class="badge">${ic}</span><span class="grow"><b>${n}</b><small>${esc(sub)}</small></span>${I.chev}</button>`).join('')}</div>`;
    el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const t = T.find(x => x[0] === b.dataset.t); sheet(t[2], () => e => { e.innerHTML = `<div class="prose">${t[4]}</div>`; }); });
  }

  /* ---------- the full-screen player ---------- */
  let PL = null, raf = null;
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = u => u * u * (3 - 2 * u);
  function animate() {
    cancelAnimationFrame(raf); const el = $('pfig'); if (!el || !PL) return; const st = PL.steps[PL.i], mv = st.mv;
    if (st.kind === 'breath' || st.kind === 'scan') return;
    el.innerHTML = ILLUS.svg(st.ill, mv ? ILLUS.animPose(st.ill, mv, 0) : null, { uid: 'p', slice: true });
    if (!mv || reduced) return;
    const tempo = st.tempo || mv.tempo || [1, 0, 1, 0], total = tempo.reduce((a, b) => a + b, 0); let t = 0, last = performance.now(), drawn = 0;
    const frame = now => { if (!el.isConnected || !PL) return; const cy = st.cycles[PL.c] || {}; if (!PL.paused && PL.phase === 'work' && !cy.rest) t += (now - last) / 1000; last = now;
      if (now - drawn > 33) { drawn = now; const [up, hd, dn] = tempo, k = t % total, u = k < up ? ease(k / up) : k < up + hd ? 1 : k < up + hd + dn ? 1 - ease((k - up - hd) / dn) : 0;
        el.innerHTML = ILLUS.svg(st.ill, ILLUS.animPose(st.ill, mv, u, Math.floor(t / total), k / total), { uid: 'p', slice: true }); }
      raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
  }
  function play(steps, meta) {
    if (!steps.length) return; COACH_AUDIO.init(); COACH_AUDIO.wake(true);
    try { const d = document.documentElement; if (d.requestFullscreen && !document.fullscreenElement && matchMedia('(display-mode: browser)').matches) d.requestFullscreen({ navigationUI: 'hide' }).catch(() => {}); } catch (e) {}
    PL = { steps, meta, i: meta.from || 0, phase: 'ready', c: 0, t: 0, el: 0, paused: false, work: 0, last: performance.now(), cueAt: 0, cueI: 0, saidHalf: false, said5: false, greeted: false, doneKeys: [] };
    const P = $('player'); P.classList.add('on'); document.body.classList.add('playing');
    COACH_AUDIO.onLine = t => { const s = $('psub'); if (!s) return; s.classList.add('fo'); setTimeout(() => { s.textContent = t; s.classList.remove('fo'); }, 180); };
    beginStep(PL.i, true);
    clearInterval(PL.iv); PL.iv = setInterval(tick, 200);
  }
  function playerShell() {
    const st = PL.steps[PL.i], calm = st.music === 'calm';
    const P = $('player'); P.classList.toggle('calm', calm);
    P.innerHTML = `<div class="ptop"><button class="iconbtn" id="pclose" aria-label="End">${I.x}</button><div class="pprog">${PL.steps.map((_, k) => `<i class="${k < PL.i ? 'on' : ''}"><b id="pp${k}" style="width:${k < PL.i ? 100 : 0}%"></b></i>`).join('')}</div><span class="pcount">${PL.i + 1}/${PL.steps.length}</span></div>
<div class="pstage">${st.kind === 'breath' ? `<div class="breathe"><div class="bring" id="bring"></div><div class="bcore" id="bcore"><span id="bword">Ready</span></div></div>` : st.kind === 'scan' ? `<svg class="scanfig" viewBox="0 0 200 430" aria-hidden="true"><defs>${WARM}<radialGradient id="sgg"><stop offset="0" stop-color="#F7A26B" stop-opacity=".9"/><stop offset="1" stop-color="#F7A26B" stop-opacity="0"/></radialGradient></defs>${bodyImg('f', 'opacity=".85"')}<ellipse id="sg" cx="100" cy="215" rx="75" ry="205" fill="url(#sgg)"/></svg>` : `<div class="pfig" id="pfig"></div>`}
<div class="upnext" id="upnext">Up next</div></div>
<div class="pinfo"><span class="pphase">${SECTION_NAME[st.section] || ''}</span><h2 id="pname">${esc(st.name)}</h2><div class="pside" id="pside"></div><div class="ptime" id="ptime">0:00</div><div class="preps" id="preps">&nbsp;</div><p class="psub" id="psub"></p></div>
<div class="pctl"><button class="iconbtn ${COACH_AUDIO.voiceOn ? '' : 'off'}" id="pvoice" aria-label="Coach voice">${COACH_AUDIO.voiceOn ? I.voice : I.voiceOff}</button><button class="iconbtn" id="pprev" aria-label="Previous">${I.prev}</button>
<button class="pplay" id="pplay" aria-label="Pause">${PL.paused ? I.play : I.pause}</button><button class="iconbtn" id="pnext" aria-label="Next">${I.next}</button><button class="iconbtn ${COACH_AUDIO.musicOn ? '' : 'off'}" id="pmusic" aria-label="Music">${COACH_AUDIO.musicOn ? I.music : I.musicOff}</button></div>`;
    $('pplay').onclick = () => setPause(!PL.paused);
    $('pnext').onclick = () => finishStep(true); $('pprev').onclick = () => beginStep(Math.max(0, PL.c > 0 || PL.el > 3 ? PL.i : PL.i - 1));
    $('pvoice').onclick = () => { COACH_AUDIO.voiceOn = !COACH_AUDIO.voiceOn; const b = $('pvoice'); b.innerHTML = COACH_AUDIO.voiceOn ? I.voice : I.voiceOff; b.classList.toggle('off', !COACH_AUDIO.voiceOn); };
    $('pmusic').onclick = () => { COACH_AUDIO.musicOn = !COACH_AUDIO.musicOn; const b = $('pmusic'); b.innerHTML = COACH_AUDIO.musicOn ? I.music : I.musicOff; b.classList.toggle('off', !COACH_AUDIO.musicOn); };
    const cl = $('pclose'); cl.onclick = () => { if (cl.dataset.arm) return endPlayer(); cl.dataset.arm = 1; cl.classList.add('arm'); toast('Tap again to end'); setTimeout(() => { if (cl.isConnected) { delete cl.dataset.arm; cl.classList.remove('arm'); } }, 2500); };
  }
  function setPause(p) { PL.paused = p; COACH_AUDIO.pause(p); const b = $('pplay'); if (b) { b.innerHTML = p ? I.play : I.pause; b.setAttribute('aria-label', p ? 'Play' : 'Pause'); } $('player').classList.toggle('paused', p); if (!p) PL.last = performance.now(); }
  function beginStep(i, first) {
    if (!PL) return; const prev = PL.steps[i - 1], st = PL.steps[i]; PL.i = i; PL.phase = 'ready'; PL.c = 0; PL.el = 0; PL.cueI = 0; PL.saidHalf = PL.said5 = false;
    playerShell(); animate(); COACH_AUDIO.setMood(st.music);
    const lines = [];
    if (first && !PL.greeted) { PL.greeted = true; const h = new Date().getHours(); lines.push(h < 12 ? 'Good morning.' : h < 18 ? 'Hi there.' : 'Good evening.');
      if (PL.meta.kind === 'session' && S.tipDay !== today()) { S.tipDay = today(); save(); lines.push(TIPS[Math.floor(Date.now() / 864e5) % TIPS.length]); lines.push('Mild effort is fine. Sharp pain, tingling or dizziness means stop.'); } }
    else if (!first) lines.push(pick(PRAISE));
    lines.push((first ? 'First: ' : 'Next: ') + st.intro[0], st.intro[1]);
    lines.filter(Boolean).forEach((l, k) => COACH_AUDIO.say(l, { urgent: k === 0, keep: true }));
    const words = lines.join(' ').split(/\s+/).length, posChange = prev && floorIll(prev.ill) !== floorIll(st.ill);
    PL.t = Math.min(first ? 8 : 12, Math.max(first ? 7 : 5, Math.round(words / 2.6) + 1 + (posChange ? 3 : 0)));
    $('player').classList.add('ready'); $('upnext').textContent = first ? 'Get ready' : 'Up next';
    $('ptime').textContent = fmt(PL.t); $('pside').textContent = ''; $('preps').innerHTML = '&nbsp;';
  }
  function startWork() {
    PL.phase = 'work'; PL.c = 0; $('player').classList.remove('ready'); COACH_AUDIO.chime(880, 0.12); startCycle(true);
  }
  function startCycle(firstC) {
    const st = PL.steps[PL.i], cy = st.cycles[PL.c]; PL.t = cy.t; PL.el = 0; PL.saidHalf = PL.said5 = false; PL.cueAt = firstC ? 9 : 6;
    $('pside').textContent = cy.rest ? cy.label : cy.side || (cy.label && !/^Set 1 of 1$/.test(cy.label) ? cy.label : '');
    $('player').classList.toggle('resting', !!cy.rest);
    if (st.kind === 'breath' || st.kind === 'scan') { $('pside').textContent = ''; return; }
    if (cy.rest) { COACH_AUDIO.say(cy.sw ? 'Switch sides.' : pick(['Rest. Shake it out.', 'Good. Take a breather.', 'Nice. Short rest.']), { urgent: true }); return; }
    if (!firstC) COACH_AUDIO.say(cy.side && st.cycles[PL.c - 1] && st.cycles[PL.c - 1].sw ? 'And hold.' : cy.reps ? (cy.label ? cy.label.replace(/ ·.*/, '') + '. Here we go.' : 'Here we go.') : 'And again. Ease in.', { urgent: true });
    else COACH_AUDIO.say(cy.reps ? 'Begin. Slow and controlled.' : st.kind === 'stretch' ? 'Ease in gently.' : 'Go.', {});
  }
  function finishStep(skipped) {
    if (!PL) return; const st = PL.steps[PL.i];
    if (!skipped || PL.work > 0.5 * stepSecs(st)) { if (st.key && !PL.doneKeys.includes(st.key)) PL.doneKeys.push(st.key); markDone(st); }
    PL.work = 0; COACH_AUDIO.chime(660, 0.16);
    if (PL.i < PL.steps.length - 1) beginStep(PL.i + 1); else showDone();
  }
  function markDone(st) {
    const L = log(); L.minutes = (L.minutes || 0) + Math.max(0, Math.round(stepSecs(st) / 60));
    if (PL.meta.kind === 'session' && st.key && !L.done.includes(st.key)) L.done.push(st.key); save();
  }
  function tick() {
    if (!PL) return; const now = performance.now(), dt = Math.min(1, (now - PL.last) / 1000); PL.last = now; if (PL.paused) return;
    const st = PL.steps[PL.i]; PL.t -= dt;
    if (PL.phase === 'ready') { $('ptime').textContent = fmt(PL.t); if (PL.t <= 0) startWork(); return; }
    const cy = st.cycles[PL.c]; PL.el += dt; PL.work += dt;
    $('ptime').textContent = fmt(PL.t);
    const bar = $('pp' + PL.i); if (bar) { const tot = st.cycles.reduce((a, c) => a + c.t, 0), so = st.cycles.slice(0, PL.c).reduce((a, c) => a + c.t, 0); bar.style.width = Math.min(100, (so + PL.el) / tot * 100) + '%'; }
    if (st.kind === 'breath') breathTick(st, cy); else if (st.kind === 'scan') scanTick(st, cy);
    else if (!cy.rest) {
      if (cy.reps) { const r = Math.min(cy.reps, Math.floor(PL.el / cy.repT) + 1); $('preps').textContent = `Rep ${r} of ${cy.reps}`;
        if (!PL.saidHalf && cy.reps >= 6 && r === Math.ceil(cy.reps / 2) + 1) { PL.saidHalf = true; COACH_AUDIO.say(pick(['Halfway. Nice.', 'Halfway there.', 'Half done. Keep it smooth.'])); }
        if (!PL.said5 && cy.reps >= 6 && r === cy.reps - 1) { PL.said5 = true; COACH_AUDIO.say('Last two.', { urgent: !COACH_AUDIO.busy() }); } }
      else if (cy.t >= 20 && !PL.said5 && PL.t <= 5.5) { PL.said5 = true; if (!COACH_AUDIO.busy()) COACH_AUDIO.say(pick(['Five more seconds.', 'Nearly there.', 'Almost done. Breathe.'])); }
      if (PL.el >= PL.cueAt && PL.t > 6 && !COACH_AUDIO.busy()) { const cues = st.cues, ln = PL.cueI < cues.length ? cues[PL.cueI++] : pick(MID); COACH_AUDIO.say(ln); PL.cueAt = PL.el + 8 + Math.random() * 5; }
    }
    if (PL.t <= 0) { PL.c++; if (PL.c >= st.cycles.length) finishStep(false); else startCycle(false); }
  }
  function breathTick(st, cy) {
    const [inh, h1, exh, h2] = st.x.pattern, cyc = inh + h1 + exh + h2, k = PL.el % cyc, n = Math.floor(PL.el / cyc);
    const ph = k < inh ? 'in' : k < inh + h1 ? 'hold' : k < inh + h1 + exh ? 'out' : 'rest', u = k < inh ? k / inh : k < inh + h1 ? 1 : k < inh + h1 + exh ? 1 - (k - inh - h1) / exh : 0;
    const core = $('bcore'); if (core) { core.style.transform = `scale(${0.62 + 0.38 * ease(Math.max(0, Math.min(1, u)))})`; $('bword').textContent = { in: 'Breathe in', hold: 'Hold', out: 'Breathe out', rest: 'Rest' }[ph]; }
    if (ph !== PL.bph) { PL.bph = ph; if (n < 3 && ph === 'in') COACH_AUDIO.say(n === 0 ? 'Breathe in through the nose…' : 'In…', { urgent: true, rate: 0.85 }); if (n < 3 && ph === 'out') COACH_AUDIO.say(n === 0 ? 'and slowly out.' : 'and out.', { urgent: true, rate: 0.85 });
      if (n >= 4 && ph === 'out' && n % 4 === 0 && PL.t > 10 && PL.lastTip !== n) { PL.lastTip = n; const c = st.cues; COACH_AUDIO.say(PL.cueI < c.length ? c[PL.cueI++] : pick(['Let the out-breath be long and easy.', 'Shoulders heavy. Jaw soft.', 'Nothing to do but breathe.'])); } }
    $('preps').textContent = `Breath ${n + 1}`;
    if (PL.t <= 8 && !PL.said5) { PL.said5 = true; COACH_AUDIO.say('Last breath. Let it all go.', { keep: true }); }
  }
  function scanTick(st, cy) {
    if (!PL.lines) { const full = cy.t >= 200; PL.lines = SCAN.flatMap((r, ri) => (full ? r.lines : r.lines.slice(0, 1)).map(l => ({ l, ri }))); PL.lk = -1; }
    const per = cy.t / PL.lines.length, k = Math.min(PL.lines.length - 1, Math.floor(PL.el / per));
    if (k !== PL.lk) { PL.lk = k; const { l, ri } = PL.lines[k], r = SCAN[ri]; COACH_AUDIO.say(l, { keep: true, rate: 0.86 }); const g = $('sg'); if (g) { g.setAttribute('cx', r.z[0]); g.setAttribute('cy', r.z[1]); g.setAttribute('rx', r.z[2]); g.setAttribute('ry', r.z[3]); } $('preps').textContent = r.n; }
    if (PL.t <= 0.3) PL.lines = null;
  }
  function showDone() {
    clearInterval(PL.iv); cancelAnimationFrame(raf); const P = $('player'), L = log(), mins = Math.max(1, Math.round(PL.steps.reduce((a, s) => a + stepSecs(s), 0) / 60));
    if (PL.meta.kind === 'reset' && !L.resets.includes(PL.meta.id)) L.resets.push(PL.meta.id); save();
    COACH_AUDIO.setMood('calm'); P.classList.remove('ready', 'resting'); P.classList.add('calm', 'finished');
    const st = streak();
    COACH_AUDIO.say(pick(['That is it. Well done for showing up today.', 'All done. That was great work.', 'Finished. Your body will thank you.']), { urgent: true, keep: true });
    if (st > 1) COACH_AUDIO.say(`That is ${st} days in a row.`, { keep: true }); COACH_AUDIO.say('How do you feel?', { keep: true });
    P.innerHTML = `<div class="donebox"><div class="donecheck">${I.check}</div><h2>${PL.meta.kind === 'reset' ? esc(PL.meta.n) : 'Session'} done</h2><p>${mins} min${st > 1 ? ` · ${st} days in a row` : ''}</p>
<p class="label">How do you feel?</p><div class="feelpick">${[['better', 'Better'], ['same', 'Same'], ['worse', 'Worse']].map(([v, n]) => `<button data-feel="${v}" class="${L.feel === v ? 'on' : ''}">${n}</button>`).join('')}</div><button class="btn ghost" id="pfin">Close</button></div>`;
    P.querySelectorAll('[data-feel]').forEach(b => b.onclick = () => { L.feel = b.dataset.feel; save(); COACH_AUDIO.say(L.feel === 'worse' ? 'Thanks for telling me. Tomorrow will be gentler.' : L.feel === 'better' ? 'Love to hear it.' : 'Good. Consistency does the work.', { urgent: true }); setTimeout(endPlayer, 1600); });
    $('pfin').onclick = endPlayer;
  }
  function endPlayer() {
    if (!PL) return; clearInterval(PL.iv); cancelAnimationFrame(raf); PL = null; COACH_AUDIO.stop(); COACH_AUDIO.wake(false);
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    const P = $('player'); P.classList.add('closing'); setTimeout(() => { P.className = 'player'; P.innerHTML = ''; document.body.classList.remove('playing'); }, 250); S.remind.last = Date.now(); save(); rerender();
  }
  document.addEventListener('keydown', e => { if (!PL) return; if (e.key === ' ') { e.preventDefault(); setPause(!PL.paused); } if (e.key === 'ArrowRight') finishStep(true); if (e.key === 'Escape') endPlayer(); });

  /* ---------- move reminders ---------- */
  setInterval(() => { const R = S.remind; if (!R.on || PL) return; const h = new Date().getHours(); if (h < 8 || h >= 21) return;
    if (Date.now() - (R.last || 0) < R.every * 60000) return; R.last = Date.now(); save();
    const r = suggestResets()[0], body = `Time for a quick ${r.n.toLowerCase()} reset.`;
    if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) navigator.serviceWorker.ready.then(reg => reg.showNotification('Time to move', { body, tag: 'move', icon: 'icons/icon-192.png', data: { reset: r.id } })).catch(() => toast(body));
    else if (document.visibilityState === 'visible') toast(body); }, 60000);
  const qr = new URLSearchParams(location.search).get('reset');

  /* ---------- start ---------- */
  applyTheme(); ILLUS.setFemale(isF());
  if (!S.onboarded) renderOnboard(); else { show('today'); if (qr) setTimeout(() => startReset(qr), 300); }
})();

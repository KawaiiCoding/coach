/* UI wiring: state, sliders, presets, 3D interaction, chart, info panel, plan and library. */
(() => {
  const $ = id => document.getElementById(id);
  const state = { p: { ...KIN.P0, scene: 'floor' }, mode: 'load', sel: null, peel: 0, skin: true, posture: POSTURES[0], model: null };
  let F, A, items = [];
  const canvas = $('gl'), R = GL.create(canvas);
  if (!R) { canvas.replaceWith(Object.assign(document.createElement('p'), { textContent: 'WebGL is not available in this browser; the 3D view cannot be shown. The chart and planner still work.' })); }

  /* ---------- analysis and rendering ---------- */
  function recompute() {
    F = KIN.build(state.p); A = KIN.analyse(F, MUSCLES, state.p);
    if (R) { items = SCENE.build(R, { F, A, mode: state.mode, sel: state.sel, peel: state.peel, skin: state.skin, p: state.p, model: state.model }); if (!camLocked) frameCamera(); }
    const pain = CHART.draw($('chart'), { A, mode: state.mode, sel: state.sel });
    $('ptxt').textContent = pain.length ? 'Likely sore or tight: ' + [...new Set(pain)].join(', ') + '.' : '';
    legend(); info(); plan(); if (window.SHELL) SHELL.render();
  }
  let camLocked = false;
  function frameCamera() { if (!R) return; const c = R.cam; const lying = F.scene === 'side' || F.scene === 'supine'; c.target = [F.H[0] * 0.5, lying ? (state.p.bed || 0) + 30 : 165, F.H[2] * 0.5]; c.dist = lying ? 640 : 660; }

  function legend() {
    const sp = (bg, t) => `<span><i style="background:${bg}"></i>${t}</span>`, g = (a, b, c) => `linear-gradient(90deg,${a},${b},${c})`;
    document.querySelectorAll('#modes [data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === state.mode));
    document.querySelectorAll('[data-peel]').forEach(b => b.classList.toggle('on', +b.dataset.peel === state.peel));
    $('ly').textContent = ['All layers shown', 'Superficial layer peeled away', 'Deep layer only'][state.peel];
    const el = $('leg');
    if (state.sel) { el.innerHTML = sp('var(--tense)', 'pinned: tense') + sp('var(--chain)', 'pulled along with it') + sp('var(--relax)', 'should relax') + sp('#3b5062', 'unrelated'); return; }
    el.innerHTML = { load: sp(g('#4caf7a', '#ffd23f', '#ff4d3d'), 'load: low to high') + sp('#d9cfbd', 'tendon'),
      short: sp('hsl(215,90%,48%)', 'shortened') + sp('hsl(45,35%,52%)', 'normal length') + sp('hsl(0,90%,52%)', 'lengthened'),
      pain: sp(g('#4caf7a', '#ffd23f', '#ff4d3d'), 'pain risk: load over time, shortening, pressure') + sp('#ff2d55', 'red dot: likely sore') }[state.mode];
    $('cleg').textContent = (state.sel ? 'Red: pinned. Amber: pulled along. Teal: should relax.' : { load: 'Load: green low to red high.', short: 'Length: blue shortened, tan normal, red lengthened.', pain: 'Pain risk: green low to red high; red dots above 55%.' }[state.mode]) + ' Dashed outline: deep muscle. Click a muscle to pin it.';
  }

  /* ---------- info panel ---------- */
  const pc = v => Math.round(Math.max(0, Math.min(1, v)) * 100) + '%';
  const chip = (id, cls) => `<button class="chip ${cls}" data-pick="${id}">${MUSCLE[id].n}</button>`;
  const grp = (ids, cls) => ['f', 'b'].map(sd => { const g = ids.filter(i => MUSCLE[i].side === sd); return g.length ? `<div class="grp"><span class="sd">${sd === 'f' ? 'front' : 'back'}</span>${g.map(i => chip(i, cls)).join('')}</div>` : ''; }).join('');
  function info() {
    const el = $('info');
    if (state.sel) {
      const m = MUSCLE[state.sel], a = A[m.id], len = a.r < 0.96 ? `shortened ${Math.round((1 - a.r) * 100)}%` : a.r > 1.04 ? `lengthened ${Math.round((a.r - 1) * 100)}%` : 'near rest length';
      const st = STRETCHES.filter(s => s.m.includes(m.id)).slice(0, 3), sg = STRENGTH.filter(s => s.m.includes(m.id)).slice(0, 3);
      const advice = m.tend === 'weak' ? `<p class="note">This muscle usually needs strengthening rather than stretching: in most postural patterns it is long and inhibited.</p>` : a.r > 1.06 ? `<p class="note">It is already lengthened in this posture: stretching further will not help. Strengthen it and stretch the shortened opposites.</p>` : '';
      el.innerHTML = `<h2>Pinned muscle</h2><p><b>${m.n}</b> <span class="small">${m.reg} · ${['', 'superficial', 'intermediate', 'deep'][m.layer]} · ${m.tend === 'tight' ? 'tends to tighten' : m.tend === 'weak' ? 'tends to weaken' : ''}</span></p>
<p class="note">${m.note}</p>
<div class="stat"><div>Load<b>${pc(a.load)}</b></div><div>Stretch<b>${pc(a.passive)}</b></div><div>Pain risk<b>${pc(a.pain)}</b></div><div>Length<b style="font-size:13px">${len}</b></div></div>
<div class="anat"><b>Origin:</b> ${m.o}<br><b>Insertion:</b> ${m.i}<br><b>Action:</b> ${m.act}<br><b>Nerve:</b> ${m.nv}</div>
<p style="margin:8px 0 2px">Tenses with it (synergists and chain):</p>${grp(m.chain, 'c')}
<p style="margin:8px 0 2px">Opposites that should let go:</p>${grp(m.relax, 'r')}
${advice}
<h3>${m.tend === 'weak' || a.r > 1.06 ? 'Stretches for the opposites' : 'Stretches'}</h3>${(m.tend === 'weak' || a.r > 1.06 ? STRETCHES.filter(s => s.m.some(i => m.relax.includes(i))).slice(0, 2) : st).map(x => exHtml(x)).join('') || '<p class="note">No stretch listed.</p>'}
<h3>Strengthening</h3>${sg.map(x => exHtml(x, 's')).join('') || '<p class="note">No exercise listed.</p>'}
<div class="btns"><button id="zoom">Zoom to it in 3D</button><button id="clr">Back to posture map</button></div>`;
      $('clr').onclick = () => select(null); $('zoom').onclick = () => focus(m.id);
    } else {
      const key = m => state.mode === 'pain' ? A[m.id].pain : state.mode === 'short' ? Math.max(A[m.id].shortening, A[m.id].passive * 0.8) : A[m.id].T;
      const top = MUSCLES.slice().sort((a, b) => key(b) - key(a)).slice(0, 8);
      const cc = m => state.mode === 'short' ? css(SCENE.divc(A[m.id].r)) : css(SCENE.heat(key(m)));
      el.innerHTML = `<h2>${{ load: 'Most loaded', short: 'Most changed in length', pain: 'Highest pain risk' }[state.mode]} in this posture</h2>` +
        top.map(m => `<div style="margin:4px 0"><button class="chip" style="border-left-color:${cc(m)}" data-pick="${m.id}">${m.n}</button><span class="bar" style="width:${Math.round(key(m) * 90) + 4}px;background:${cc(m)}"></span> <span class="small">${state.mode === 'short' ? (A[m.id].r < 1 ? 'short ' : 'long ') + Math.round(Math.abs(A[m.id].r - 1) * 100) + '%' : pc(key(m))}</span></div>`).join('') +
        `<p class="note" style="margin-top:8px">${state.posture.why || ''}</p><p class="note">Pick a muscle here, on the chart or in 3D for its anatomy, links, stretches and strengthening.</p>`;
    }
  }
  const css = c => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
  const exHtml = (x, cls = '') => `<div class="ex ${cls}">${ILLUS.svg(x.ill)}<div><b>${x.n}</b> <span class="mu">${PLAN.names(x.m)}</span><div class="dose">${PLAN.dose(x)}</div><div>${x.how}</div><div class="cue">${x.cue}</div>${PLAN.links(x, x.sets == null ? 'stretch' : 'exercise')}</div></div>`;

  function plan() { const Rp = PLAN.build(A, state.p, state.posture); $('plan').innerHTML = PLAN.html(Rp, state.p, state.posture); }

  /* ---------- library ---------- */
  const REGS = ['All', ...new Set(MUSCLES.map(m => m.reg))]; let libReg = 'All', libKind = 'stretch';
  function library() {
    $('libf').innerHTML = `<button data-kind="stretch" class="${libKind === 'stretch' ? 'on' : ''}">Stretches (${STRETCHES.length})</button><button data-kind="strength" class="${libKind === 'strength' ? 'on' : ''}">Strength (${STRENGTH.length})</button> <select id="libreg">${REGS.map(r => `<option${r === libReg ? ' selected' : ''}>${r}</option>`).join('')}</select>`;
    const L = (libKind === 'stretch' ? STRETCHES : STRENGTH).filter(x => libReg === 'All' || x.m.some(i => MUSCLE[i].reg === libReg));
    $('lib').innerHTML = L.map(x => exHtml(x, libKind === 'strength' ? 's' : '')).join('');
    $('libreg').onchange = e => { libReg = e.target.value; library(); };
  }
  $('libf').addEventListener('click', e => { const k = e.target.dataset.kind; if (k) { libKind = k; library(); } });

  /* ---------- selection ---------- */
  function select(id) { state.sel = (id && id !== state.sel) ? id : null; if (state.sel) { const l = MUSCLE[state.sel].layer; if (l > 1 && state.peel < l - 1) state.peel = l - 1; } recompute(); if (state.sel && R) turnTo(MUSCLE[state.sel].side === 'f' ? 0 : Math.PI); }
  let yawTarget = null;
  function turnTo(y) { const cur = R.cam.yaw; let d = ((y - cur + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; if (Math.abs(d) > 0.6) yawTarget = cur + d; }
  function focus(id) { if (!R) return; const it = items.filter(i => i.m.id === id); if (!it.length) return; it.sort((a, b) => d2(a.mid, R.eye()) - d2(b.mid, R.eye())); R.cam.target = it[0].mid.slice(); R.cam.dist = 140; camLocked = true; }
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  document.body.addEventListener('click', e => { const id = e.target.dataset && e.target.dataset.pick; if (id) select(id); });
  $('chart').addEventListener('click', e => { const g = e.target.closest('[data-id]'); select(g ? g.dataset.id : null); });

  /* ---------- 3D interaction ---------- */
  if (R) {
    let down = null, drag = false, hover = null;
    const pos = e => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; drag = false; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (down) { const dx = e.clientX - down[0], dy = e.clientY - down[1]; if (drag || Math.hypot(dx, dy) > 4) { drag = true; yawTarget = null; camLocked = true;
        if (e.shiftKey || (e.buttons & 2)) { const k = R.cam.dist * 0.0015, c = R.cam, cy = Math.cos(c.yaw), sy = Math.sin(c.yaw); c.target = [c.target[0] - dx * k * cy, c.target[1] + dy * k, c.target[2] + dx * k * sy]; }
        else { R.cam.yaw -= dx * 0.01; R.cam.pitch = Math.max(-0.6, Math.min(1.2, R.cam.pitch + dy * 0.006)); }
        down = [e.clientX, e.clientY]; } }
      else { const [x, y] = pos(e); const m = R.pick(x, y); hover = m ? m.data : null; canvas.style.cursor = hover ? 'pointer' : 'grab';
        $('tip').textContent = hover ? `${MUSCLE[hover.id].n} (${hover.g > 0 ? 'left' : 'right'}) · load ${pc(A[hover.id].load)} · pain risk ${pc(A[hover.id].pain)}` : ''; }
    });
    canvas.addEventListener('pointerup', e => { if (!drag && e.button === 0) { const [x, y] = pos(e); const m = R.pick(x, y); select(m ? m.data.id : null); } down = null; drag = false; });
    canvas.addEventListener('pointerleave', () => { $('tip').textContent = ''; });
    canvas.addEventListener('dblclick', e => { const [x, y] = pos(e); const m = R.pick(x, y); if (m) { if (state.sel !== m.data.id) select(m.data.id); focus(m.data.id); } });
    canvas.addEventListener('wheel', e => { e.preventDefault(); camLocked = true; R.cam.dist = Math.max(60, Math.min(1400, R.cam.dist * (1 + e.deltaY * 0.0012))); if (state.peelAuto) {} }, { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    document.querySelectorAll('[data-yaw]').forEach(b => b.onclick = () => { camLocked = false; frameCamera(); R.cam.pitch = 0.15; yawTarget = R.cam.yaw + (((+b.dataset.yaw * Math.PI / 180) - R.cam.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; });
    (function frame() { if (!canvas.clientWidth) { requestAnimationFrame(frame); return; } if (yawTarget !== null) { const d = yawTarget - R.cam.yaw; R.cam.yaw += d * 0.15; if (Math.abs(d) < 0.003) { R.cam.yaw = yawTarget; yawTarget = null; } } R.render(); requestAnimationFrame(frame); })();
  }
  document.querySelectorAll('[data-peel]').forEach(b => b.onclick = () => { state.peel = +b.dataset.peel; recompute(); });
  $('skinbtn').onclick = e => { state.skin = !state.skin; e.target.textContent = 'Skin: ' + (state.skin ? 'on' : 'off'); recompute(); };
  document.querySelectorAll('#modes [data-mode]').forEach(b => b.onclick = () => { state.mode = b.dataset.mode; recompute(); });

  /* ---------- sliders and presets ---------- */
  const unit = c => c.u || '°';
  $('sliders').innerHTML = KIN.CTRL.map(c => `<div class="row"><label for="s_${c.k}">${c.l}</label><input type="range" id="s_${c.k}" min="${c.min}" max="${c.max}" value="${c.v}"><output id="o_${c.k}">${c.v}${unit(c)}</output></div>`).join('');
  KIN.CTRL.forEach(c => $('s_' + c.k).addEventListener('input', e => { state.p[c.k] = +e.target.value; $('o_' + c.k).textContent = e.target.value + unit(c); state.posture = { ...state.posture, why: '' }; recompute(); }));
  function syncSliders() { KIN.CTRL.forEach(c => { $('s_' + c.k).value = state.p[c.k]; $('o_' + c.k).textContent = state.p[c.k] + unit(c); }); }
  const groups = [...new Set(POSTURES.map(p => p.g))];
  $('preset').innerHTML = groups.map(g => `<optgroup label="${g}">${POSTURES.map((p, i) => p.g === g ? `<option value="${i}">${p.n}</option>` : '').join('')}</optgroup>`).join('');
  function applyPreset(P) { state.posture = P; state.p = { ...KIN.P0, ...P.v, scene: P.scene || 'floor', seat: P.seat, bed: P.bed, support: P.support, press: P.press }; $('why').textContent = P.why || ''; syncSliders(); camLocked = false; recompute(); }
  $('preset').onchange = e => applyPreset(POSTURES[+e.target.value]);
  $('reset').onclick = () => { $('preset').value = 0; applyPreset(POSTURES[0]); };

  /* ---------- real anatomy model (.glb) ---------- */
  $('glbfile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return; $('glbmsg').textContent = `Reading ${f.name} (${(f.size / 1e6).toFixed(1)} MB)… large models take a few seconds.`;
    f.arrayBuffer().then(buf => new Promise(r => setTimeout(() => r(buf), 30))).then(buf => {
      const meshes = GLB.parse(buf);
      // scale to the app's units (height 330) and stand it on the floor, centred
      let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
      for (const m of meshes) for (let k = 0; k < m.pos.length; k += 3) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], m.pos[k + i]); hi[i] = Math.max(hi[i], m.pos[k + i]); }
      const h = hi[1] - lo[1] || 1, k = 330 / h, cx = (lo[0] + hi[0]) / 2, cz = (lo[2] + hi[2]) / 2;
      let matched = 0;
      for (const m of meshes) { for (let i = 0; i < m.pos.length; i += 3) { m.pos[i] = (m.pos[i] - cx) * k; m.pos[i + 1] = (m.pos[i + 1] - lo[1]) * k; m.pos[i + 2] = (m.pos[i + 2] - cz) * k; } m.match = GLB.match(m.name); if (m.match) matched++; }
      // Auto-skinning: estimate the model's resting arm angle, then bind every vertex to its two nearest bones.
      const shY = KIN.N0.sh[1]; let sx = 0, sy = 0, sn = 0;
      for (const m of meshes) for (let i = 0; i < m.pos.length; i += 3) { const x = Math.abs(m.pos[i]), y = m.pos[i + 1]; if (x > 48 && y > 0.4 * 330 && y < 0.78 * 330) { sx += x; sy += y; sn++; } }
      const abd = sn ? Math.max(0, Math.min(60, Math.atan2(sx / sn - 38, Math.max(1, shY - sy / sn)) * 180 / Math.PI)) : 0;
      SKIN.bind(meshes, abd);
      state.model = { meshes, name: f.name, abd }; camLocked = false; recompute();
      const ids = new Set(meshes.filter(m => m.match).map(m => m.match.id));
      $('glbmsg').textContent = `${f.name}: ${meshes.length} meshes, ${matched} matched to ${ids.size} of ${MUSCLES.length} muscle groups. Posed automatically (vertices follow the nearest bones), so joints bend crudely. Resting arm angle detected: ${Math.round(abd)}°.`;
      $('glbclear').hidden = false;
    }).catch(err => { $('glbmsg').textContent = 'Could not read that file: ' + err.message; });
  });
  $('glbclear').onclick = () => { state.model = null; $('glbclear').hidden = true; $('glbmsg').textContent = ''; $('glbfile').value = ''; camLocked = false; recompute(); };

  window.TENSION = { R, state, get F() { return F; }, get A() { return A; }, recompute }; // shared with the shell and tests
  library(); applyPreset(POSTURES[0]);
})();

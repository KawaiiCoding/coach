/* Builds the 3D scene (skeleton, muscles, skin, furniture) from the kinematic frame and the tension analysis. */
const SCENE = (() => {
  const hsl = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0), f(8), f(4)]; };
  const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  const C = v => Math.max(0, Math.min(1, v));
  const heat = t => hsl(150 - 150 * C(t), 35 + 50 * C(t), 48 + 4 * C(t));
  const divc = r => { const sh = C((1 - r) * 3), st = C((r - 1) * 4); return sh > 0 ? hsl(215, 35 + 55 * sh, 58 - 10 * sh) : hsl(45 - 45 * st, 35 + 55 * st, 52); };
  const COL = { tense: hex('#ff4d3d'), chain: hex('#ffb02e'), relax: hex('#35d0c4'), dim: hex('#3b5062'), bone: hex('#e2dccd'), skin: hex('#e8b89a'), tendon: hex('#d9cfbd'), muscle: hex('#b2463c'), wood: hex('#4a6a88'), fabric: hex('#3a566f'), pillow: hex('#8fa7c0') };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const add = KIN.add, at = KIN.at;

  function role(sel, id) { if (!sel) return null; if (id === sel) return 'tense'; const m = MUSCLE[sel]; return m.chain.includes(id) ? 'chain' : m.relax.includes(id) ? 'relax' : 'dim'; }
  function colourFor(m, a, mode, sel) {
    const r = role(sel, m.id);
    if (r) return { col: COL[r], v: r === 'tense' ? 1 : r === 'chain' ? Math.max(a.T, 0.6) : r === 'relax' ? 0 : a.T * 0.4, role: r };
    if (mode === 'short') return { col: divc(a.r), v: Math.max(a.shortening, a.passive), role: null };
    if (mode === 'pain') return { col: heat(a.pain), v: a.pain, role: null };
    return { col: heat(a.T), v: a.T, role: null };
  }

  /* muscle strand: quadratic curve from a to b bulging away from the bone axis, spindle radius, pale tendon ends */
  function strand(F, m, g, sa, sb, bulgeV, baseR, col, ry) {
    const a = at(F.B, sa, g), b = at(F.B, sb, g), a0 = at(F.B, sa, g, false), b0 = at(F.B, sb, g, false);
    const mid = a.map((v, i) => (v + b[i]) / 2), ax = a0.map((v, i) => (v + b0[i]) / 2);
    let o = mid.map((v, i) => v - ax[i]); const l = Math.hypot(...o) || 1; o = o.map(v => v / l);
    const bu = (2 + 5 * bulgeV) * 1.3, c = mid.map((v, i) => v + o[i] * bu), pts = [], radii = [], cols = [], N = 14;
    for (let k = 0; k <= N; k++) { const u = k / N, w = [(1 - u) ** 2, 2 * u * (1 - u), u * u]; pts.push([0, 1, 2].map(i => w[0] * a[i] + w[1] * c[i] + w[2] * b[i]));
      const te = u < 0.1 || u > 0.9; radii.push(baseR * (te ? 0.22 : 0.3 + 0.7 * Math.sin(Math.PI * u) ** 0.8)); cols.push(te ? COL.tendon : col); }
    return { geom: GL.tube(pts, radii, cols, 9, ry), mid: pts[7] };
  }

  function furniture(R, p) {
    const floorY = 0; // only the floor grid is drawn; furniture is implied by the posture
    const s = null, H = p.hipY;
    // floor grid
    for (let i = -4; i <= 4; i++) { R.mesh(GL.box(i * 50, floorY - 0.5, 0, 1, 1, 400, hex('#1f3345')), { nopick: true }); R.mesh(GL.box(0, floorY - 0.5, i * 50, 400, 1, 1, hex('#1f3345')), { nopick: true }); }
    if (s === 'sofa') {
      const y = H - 9, z = -14, d = 108;
      R.mesh(GL.box(0, y - 8, z + d / 2, 120, 16, d, COL.wood), { nopick: true });                        // seat cushion
      R.mesh(GL.box(0, (y - 16) / 2, z + d / 2, 120, y - 16, d, COL.fabric), { nopick: true });             // base
      R.mesh(GL.box(0, y + 48, z - 12, 120, 110, 14, COL.wood, -0.3), { nopick: true });                     // backrest, reclined 17°
      [-1, 1].forEach(g => R.mesh(GL.box(g * 67, y + 16, z + d / 2, 14, 48, d, COL.fabric), { nopick: true })); // armrests
    } else if (s === 'chair') {
      const y = H - 9;
      R.mesh(GL.box(0, y - 3, 10, 70, 6, 44, COL.wood), { nopick: true }); R.mesh(GL.box(0, y + 36, -14, 70, 70, 5, COL.wood, -0.12), { nopick: true });
      R.mesh(GL.cyl([0, 0, 10], [0, y - 6, 10], 3, COL.fabric), { nopick: true });
      R.mesh(GL.box(0, y + 60, 86, 140, 4, 60, COL.wood), { nopick: true });                                 // desk top
      [-1, 1].forEach(g => R.mesh(GL.cyl([g * 60, 0, 86], [g * 60, y + 58, 86], 2.5, COL.fabric), { nopick: true }));
    } else if (s === 'supine' || s === 'side') {
      const b = p.bed || 0;
      if (b) { R.mesh(GL.box(0, b - 8, 10, 320, 16, 120, COL.wood), { nopick: true }); R.mesh(GL.box(0, b / 2 - 8, 10, 320, b - 16, 120, COL.fabric), { nopick: true });
        [-1, 1].forEach(g => R.mesh(GL.box(g * 166, b + 16, 10, 14, 48, 120, COL.fabric), { nopick: true })); }
      else { R.mesh(GL.box(0, 4, 0, 330, 9, 130, hex('#55708a')), { nopick: true }); }
      // pillow under the head
      const hd = add(p.head.s, p.head.d, 12); R.mesh(GL.box(hd[0], b + 6, hd[2], 54, 8, 50, COL.pillow), { nopick: true });
    }
  }

  function skin(R, F) {
    const B = F.B, e = b => add(b.s, b.d, b.l), o = { alpha: 0.42, nopick: true, emis: [0.06, 0.04, 0.03] }, parts = [];
    const cap = (a, b, r1, r2) => { parts.push(GL.tube([a, b], [r1, r2], [COL.skin, COL.skin], 14)); };
    [1, -1].forEach(g => { const b = B[g]; cap(b.uarm.s, e(b.uarm), 10, 8); cap(b.farm.s, e(b.farm), 8, 6); cap(b.hand.s, e(b.hand), 5, 4); cap(b.thigh.s, e(b.thigh), 16, 11); cap(b.shank.s, e(b.shank), 11, 7); cap(b.foot.s, e(b.foot), 6, 5);
      parts.push(GL.sphere(b.uarm.s, 11, COL.skin), GL.sphere(e(b.uarm), 8, COL.skin), GL.sphere(b.thigh.s, 16, COL.skin), GL.sphere(e(b.thigh), 11, COL.skin), GL.sphere(e(b.shank), 7, COL.skin)); });
    const t = B[1].trunk, n = B[1].neck, h = B[1].head;
    parts.push(GL.tube([t.s, add(t.s, t.d, t.l * 0.5), e(t)], [32, 33, 40], [COL.skin, COL.skin, COL.skin], 18, 0.7));
    parts.push(GL.tube([n.s, e(n)], [10, 9], [COL.skin, COL.skin], 12));
    parts.push(GL.sphere(add(h.s, h.d, 13), 12, COL.skin, 14, [1.05, 1.25, 1.1]));
    R.mesh(GL.merge(parts), o);
  }

  function skeleton(R, F) {
    const B = F.B, e = b => add(b.s, b.d, b.l), parts = [], bone = (a, b, r) => parts.push(GL.cyl(a, b, r, COL.bone, 8)), ball = (p, r) => parts.push(GL.sphere(p, r, COL.bone, 8));
    [1, -1].forEach(g => { const b = B[g]; bone(b.uarm.s, e(b.uarm), 2.4); bone(b.farm.s, e(b.farm), 2); bone(b.hand.s, e(b.hand), 1.6); bone(b.thigh.s, e(b.thigh), 2.8); bone(b.shank.s, e(b.shank), 2.4); bone(b.foot.s, e(b.foot), 1.8);
      ball(b.uarm.s, 3.4); ball(e(b.uarm), 2.8); ball(b.thigh.s, 3.6); ball(e(b.thigh), 3.4); ball(e(b.shank), 2.6); });
    bone(B[1].uarm.s, B[-1].uarm.s, 2);                                   // shoulder line (clavicles)
    const t = B[1].trunk, pel = B[1].pel, n = B[1].neck, h = B[1].head;
    bone(at(F.B, ['trunk', 0, 0, -7], 1), at(F.B, ['trunk', 1, 0, -7], 1), 2.4);  // spine
    bone(at(F.B, ['neck', 0, 0, -4], 1), at(F.B, ['neck', 1, 0, -4], 1), 1.8);
    for (let k = 0; k < 7; k++) { // ribs as tubes around an ellipse
      const c = add(t.s, t.d, (0.5 + k * 0.075) * t.l), rx = 22 + 6 * Math.sin(Math.PI * (k + 0.5) / 7), rz = 13, pts = [];
      for (let j = 0; j <= 18; j++) { const a = j / 18 * Math.PI * 2; pts.push([0, 1, 2].map(i => c[i] + t.x[i] * Math.cos(a) * rx + t.f[i] * Math.sin(a) * rz - t.f[i] * 1.5)); }
      parts.push(GL.tube(pts, pts.map(() => 0.8), pts.map(() => COL.bone), 5));
    }
    { const c = add(pel.s, pel.d, 10), pts = []; for (let j = 0; j <= 18; j++) { const a = j / 18 * Math.PI * 2; pts.push([0, 1, 2].map(i => c[i] + pel.x[i] * Math.cos(a) * 26 + pel.f[i] * Math.sin(a) * 11)); } parts.push(GL.tube(pts, pts.map(() => 1.6), pts.map(() => COL.bone), 6)); }
    parts.push(GL.sphere(add(h.s, h.d, 13), 11, COL.bone, 12, [1, 1.15, 1.05]));
    R.mesh(GL.merge(parts), { nopick: true });
  }

  /* Build everything. state: {F, A (analysis), mode, sel, peel, skin, p (slider values + scene)} */
  /* Model mode: a loaded .glb replaces the procedural figure. Meshes matched by name take the muscle colouring;
     bones stay bone-coloured, skin becomes translucent, everything else grey. The model is static (not posed). */
  function buildModel(R, st) {
    const { A, mode, sel, peel, model, F, p } = st, items = []; let id = 1;
    furniture(R, { scene: F.scene, hipY: F.H[1], bed: p.bed, head: F.B[1].head });
    for (const mm of model.meshes) {
      const posed = SKIN.pose(mm, st.F);
      const geom = { pos: posed.pos, nrm: posed.nrm, idx: mm.idx, col: [] };
      if (mm.match && MUSCLE[mm.match.id]) {
        const m = MUSCLE[mm.match.id], cf = colourFor(m, A[m.id], mode, sel), faded = (peel > 0 && m.layer <= peel) && !(cf.role && cf.role !== 'dim'), dim = cf.role === 'dim';
        const tint = cf.role || mode === 'short' ? cf.col : mix(COL.muscle, cf.col, C(cf.v * 1.15));
        for (let k = 0; k < mm.pos.length / 3; k++) geom.col.push(tint[0], tint[1], tint[2]);
        const emis = cf.role === 'tense' ? cf.col.map(v => v * 0.55) : cf.role ? (dim ? [0, 0, 0] : cf.col.map(v => v * 0.25)) : cf.col.map(v => v * C(cf.v) * 0.35);
        const mesh = R.mesh(geom, { id: id++, alpha: faded ? 0.07 : dim ? 0.3 : 1, emis, pulse: cf.role === 'tense', nopick: faded, data: { id: m.id, g: mm.match.g }, cull: false });
        items.push({ m, g: mm.match.g, mid: mesh.center, mesh, role: cf.role });
      } else {
        const bone = GLB.isBone(mm.name), skin = GLB.isSkin(mm.name), tendon = GLB.isTendon(mm.name), c = bone ? COL.bone : skin ? COL.skin : tendon ? COL.tendon : hex('#8a6a62');
        for (let k = 0; k < mm.pos.length / 3; k++) geom.col.push(c[0], c[1], c[2]);
        R.mesh(geom, { nopick: true, alpha: skin ? (st.skin ? 0.3 : 0) : 1, cull: false });
      }
    }
    return items;
  }
  function build(R, st) {
    R.clear();
    if (st.model) return buildModel(R, st);
    const { F, A, mode, sel, peel, p } = st, tf = 1 - Math.exp(-(p.time || 0) / 40);
    furniture(R, { scene: F.scene, hipY: F.H[1], bed: p.bed, head: F.B[1].head });
    skeleton(R, F);
    if (st.skin) skin(R, F);
    const items = []; let id = 1;
    MUSCLES.forEach(m => {
      const a = A[m.id], cf = colourFor(m, a, mode, sel), fn = m.fan || [0, 0, 1], n = fn[2] || 1, visible = m.layer <= 1 + (3 - peel) ? true : false;
      const faded = (peel > 0 && m.layer <= peel) && !(cf.role && cf.role !== 'dim');   // peel removes the superficial layers
      [1, -1].forEach(g => {
        const parts = []; let mid = null;
        for (let j = 0; j < n; j++) { const u = n > 1 ? j / (n - 1) - 0.5 : 0, sa = [m.a[0], m.a[1] + u * fn[0], m.a[2], m.a[3]], sb = [m.b[0], m.b[1] + u * fn[1], m.b[2], m.b[3]];
          const base = COL.muscle, tint = cf.role || mode === 'short' ? cf.col : mix(base, cf.col, C(cf.v * 1.15));
          const s = strand(F, m, g, sa, sb, cf.v, (n > 1 ? 3.4 : 3.2) + 2.2 * cf.v, tint, n > 1 ? 0.5 : 0.8); parts.push(s.geom); if (j === (n >> 1)) mid = s.mid; }
        const dim = cf.role === 'dim', alpha = faded ? 0.07 : dim ? 0.3 : 1;
        const emis = cf.role === 'tense' ? cf.col.map(v => v * 0.55) : cf.role ? (dim ? [0, 0, 0] : cf.col.map(v => v * 0.25)) : cf.col.map(v => v * C(cf.v) * 0.35);
        const mesh = R.mesh(GL.merge(parts), { id: id++, alpha, emis, pulse: cf.role === 'tense', nopick: faded, data: { id: m.id, g } });
        items.push({ m, g, mid, mesh, role: cf.role });
        if (mode === 'pain' && !sel && a.pain > 0.55 && !faded) R.mesh(GL.sphere(mid, 4 + 7 * a.pain, COL.tense), { alpha: 0.5, nopick: true, emis: [0.5, 0.1, 0.15], pulse: true });
      });
    });
    if (sel) {
      const S = items.filter(i => i.m.id === sel);
      for (const s of S) for (const o of items) if (o.g === s.g && o.role && o.role !== 'dim' && o.m.id !== sel) {
        const col = o.role === 'relax' ? COL.relax : COL.chain;
        R.mesh(GL.cyl(s.mid, o.mid, 0.7, col, 6), { alpha: 0.75, nopick: true, emis: col.map(v => v * 0.4) });
      }
    }
    return items;
  }
  return { build, heat, divc, COL, hex };
})();

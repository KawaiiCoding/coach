/* Automatic skinning for a loaded model: bind each vertex to its two nearest bones of the app's skeleton in the
   model's rest pose, store bone-local coordinates, then re-place vertices for any posture (linear blend skinning). */
const SKIN = (() => {
  const ORDER = [];
  for (const g of [1, -1]) for (const k of ['uarm', 'farm', 'hand', 'thigh', 'shank', 'foot']) ORDER.push([k, g]);
  for (const k of ['trunk', 'neck', 'head', 'pel']) ORDER.push([k, 1]);
  const bones = F => ORDER.map(([k, g]) => ({ k, g, b: F.B[g][k] }));
  const RAD = { trunk: 34, neck: 10, head: 14, pel: 28, uarm: 11, farm: 8, hand: 6, thigh: 16, shank: 10, foot: 6 };
  const TERMINAL = { hand: 1, foot: 1, head: 1 };
  function bind(meshes, abd) {
    const rest = KIN.build({ ...KIN.P0, abd, scene: 'floor' }), BL = bones(rest);
    for (const m of meshes) {
      const n = m.pos.length / 3, bi = new Uint8Array(n * 2), w = new Float32Array(n), loc = new Float32Array(n * 6), nl = new Float32Array(n * 6);
      for (let k = 0; k < n; k++) {
        const p = [m.pos[k * 3], m.pos[k * 3 + 1], m.pos[k * 3 + 2]], np = [m.nrm[k * 3], m.nrm[k * 3 + 1], m.nrm[k * 3 + 2]];
        let b1 = -1, d1 = 1e9, b2 = -1, d2 = 1e9, t1 = 0;
        for (let i = 0; i < BL.length; i++) {
          const { k: key, g, b } = BL[i];
          if (g !== 1 && key !== 'trunk' && key !== 'pel' && key !== 'neck' && key !== 'head' && p[0] * g < -2) continue; // limbs only take their own side
          if (g === 1 && (key === 'uarm' || key === 'farm' || key === 'hand' || key === 'thigh' || key === 'shank' || key === 'foot') && p[0] < -2) continue;
          const v = [p[0] - b.s[0], p[1] - b.s[1], p[2] - b.s[2]], t = Math.max(0, Math.min(b.l, v[0] * b.d[0] + v[1] * b.d[1] + v[2] * b.d[2]));
          const q = [b.s[0] + b.d[0] * t, b.s[1] + b.d[1] * t, b.s[2] + b.d[2] * t], d = Math.max(0, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) - RAD[key] * 0.5);
          if (d < d1) { b2 = b1; d2 = d1; b1 = i; d1 = d; t1 = t / b.l; } else if (d < d2) { b2 = i; d2 = d; }
        }
        // Blend only near a joint (the two bones about equally close); vertices beyond the tip of a terminal bone (fingers, toes, skull) follow it rigidly.
        let w1 = 1; const terminal = TERMINAL[BL[b1].k] && t1 > 0.35;
        if (!terminal && b2 >= 0 && d2 < d1 + 5) { const a = 1 / (d1 + 1), c = 1 / (d2 + 1); w1 = a / (a + c); } else b2 = b1;
        bi[k * 2] = b1; bi[k * 2 + 1] = b2; w[k] = w1;
        for (const [j, i] of [[0, b1], [3, b2]]) { const b = BL[i].b, v = [p[0] - b.s[0], p[1] - b.s[1], p[2] - b.s[2]];
          loc[k * 6 + j] = v[0] * b.d[0] + v[1] * b.d[1] + v[2] * b.d[2]; loc[k * 6 + j + 1] = v[0] * b.f[0] + v[1] * b.f[1] + v[2] * b.f[2]; loc[k * 6 + j + 2] = v[0] * b.x[0] + v[1] * b.x[1] + v[2] * b.x[2];
          nl[k * 6 + j] = np[0] * b.d[0] + np[1] * b.d[1] + np[2] * b.d[2]; nl[k * 6 + j + 1] = np[0] * b.f[0] + np[1] * b.f[1] + np[2] * b.f[2]; nl[k * 6 + j + 2] = np[0] * b.x[0] + np[1] * b.x[1] + np[2] * b.x[2]; }
      }
      m.skin = { bi, w, loc, nl };
    }
  }
  function pose(m, F) {
    if (!m.skin) return { pos: m.pos, nrm: m.nrm };
    const BL = bones(F), n = m.pos.length / 3, pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), { bi, w, loc, nl } = m.skin;
    for (let k = 0; k < n; k++) {
      let px = 0, py = 0, pz = 0, nx = 0, ny = 0, nz = 0;
      for (const [j, wt] of [[0, w[k]], [3, 1 - w[k]]]) { if (wt <= 0) continue; const b = BL[bi[k * 2 + j / 3]].b, a = loc[k * 6 + j], c = loc[k * 6 + j + 1], e = loc[k * 6 + j + 2], na = nl[k * 6 + j], nc = nl[k * 6 + j + 1], ne = nl[k * 6 + j + 2];
        px += wt * (b.s[0] + b.d[0] * a + b.f[0] * c + b.x[0] * e); py += wt * (b.s[1] + b.d[1] * a + b.f[1] * c + b.x[1] * e); pz += wt * (b.s[2] + b.d[2] * a + b.f[2] * c + b.x[2] * e);
        nx += wt * (b.d[0] * na + b.f[0] * nc + b.x[0] * ne); ny += wt * (b.d[1] * na + b.f[1] * nc + b.x[1] * ne); nz += wt * (b.d[2] * na + b.f[2] * nc + b.x[2] * ne); }
      pos[k * 3] = px; pos[k * 3 + 1] = py; pos[k * 3 + 2] = pz; const l = Math.hypot(nx, ny, nz) || 1; nrm[k * 3] = nx / l; nrm[k * 3 + 1] = ny / l; nrm[k * 3 + 2] = nz / l;
    }
    return { pos, nrm };
  }
  return { bind, pose };
})();

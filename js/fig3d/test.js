/* Automatic test (npm run test:figure) and the hooks the test and screenshots use. */
/* ------------------------------------------------------------------------------------------------------------------
   AUTOMATIC TEST (run with: npm run test:figure). It plays every move through a full cycle, 50 times a second, and checks each
   frame against the rules below. Nothing is judged by eye. A new move is covered the moment it is added to EX. Switching
   between moves needs no test: it happens behind a fade, straight into the new move's start position.
   ------------------------------------------------------------------------------------------------------------------ */
let curTest = null;
function runTest() {
  paused = true; const dt = 1 / 50, worst = new Map(), v = V3(), v2 = V3(), v3 = V3(), q = new THREE.Quaternion();
  const fail = (where, rule, value, t) => { const k = where + ' | ' + rule, o = worst.get(k); if (!o || value > o.value) worst.set(k, { where, rule, value: +value.toFixed(2), t: +t.toFixed(2) }); };
  const joint = (A1, B1, C1) => { B1.getWorldPosition(v2); v3.copy(C1.getWorldPosition(v)).sub(v2).normalize(); v.copy(v2).sub(A1.getWorldPosition(v)).normalize(); return Math.acos(clamp(v.dot(v3), -1, 1)) / R; };
  const SPEED = { hand: 260, foot: 200, head: 160, hips: 160 }, JERK = { hand: 3, foot: 1.6, head: 1.2, hips: 1.2 };
  let track = null, prevP = null, propsOf = null;
  const checkFrame = (where, p, t) => { scene.updateMatrixWorld(true);
    if (clamped.size) { fail(where, 'pose asks for more than a joint allows (' + [...clamped].join(' ') + ')', 1, t); clamped.clear(); }
    if (balance.err > .05) fail(where, 'centre of mass not over the support', balance.err, t);
    const low = trunkLow() - p.seat * p.rest; if (low < -.25) fail(where, 'trunk below the mat', -low, t);
    const hb = v.set(HC[0], HC[1], 0).applyMatrix4(head.matrixWorld).y - 12.4; if (hb < -.4) fail(where, 'head below the mat', -hb, t);
    chest.getWorldQuaternion(q).invert();
    arms.forEach(a => { const side = a.s > 0 ? 'right' : 'left', hold = a.s > 0 ? p.holdR : p.holdL;
      a.tips.forEach((g, i) => { const y = g.getWorldPosition(v).y - (i < 5 ? 1.25 : i === 5 ? 2.6 : 4.4); if (y < -.2) fail(where, side + ' hand or elbow below the mat', -y, t); });
      const e = joint(a.sh, a.el, a.wr); if (e > 152) fail(where, side + ' elbow bent past its range', e, t);
      a.el.getWorldPosition(v2); v.copy(v2).sub(a.sh.getWorldPosition(v3)).normalize().applyQuaternion(q);
      if (v.x < -SH_BACK - .04) fail(where, side + ' shoulder too far behind the body', Math.asin(clamp(-v.x, 0, 1)) / R, t);
      const wq = a.wr.quaternion, n = Math.hypot(wq.y, wq.w) || 1, sw = 2 * Math.acos(clamp(Math.abs((wq.w * wq.w + wq.y * wq.y) / n), 0, 1)) / R; if (sw > 96) fail(where, side + ' wrist bent past its range', sw, t);
      buildBody(a); const pw = Math.max(bodyPen(a.wr.getWorldPosition(v), 3.2), bodyPen(a.tips[1].getWorldPosition(v), 1.7)); if (pw > .9) fail(where, side + ' hand inside the body (trunk, head, legs or other arm)', pw, t);
      const pe = bodyPen(a.el.getWorldPosition(v), 4.2); if (pe > 1.3) fail(where, side + ' elbow inside the body', pe, t);
      if (a.miss > 3.6) fail(where, side + ' hand cannot reach its target safely', a.miss, t); });
    { const hh = arms[0].wr.getWorldPosition(v).distanceTo(arms[1].wr.getWorldPosition(v2)); if (hh < 5.6) fail(where, 'hands inside each other', 5.6 - hh, t); }
    const pr = propsOf ? propsOf : {};                             // props: the body must actually be in contact with what the move uses
    if (pr.door && Math.min(p.plantR, p.plantL, p.ikR, p.ikL) > .985 && p.plantWall > .5) arms.forEach(a => { palm(a, v); const face = pr.door.x - 2.5, gap = Math.abs(face - 1.7 - v.x); if (gap > 2.2) fail(where, 'palm not on the door frame', gap, t); if (Math.abs(v.z) < 37 || Math.abs(v.z) > 47) fail(where, 'palm beside the door frame, not on it', Math.abs(Math.abs(v.z) - 42), t); });
    if (pr.chair && p.rest > .95) { const gap = Math.abs(trunkLow() - CHAIR.seat - .12); if (gap > .4) fail(where, 'not sitting on the chair seat', gap, t); if (Math.abs(root.position.x - CHAIR.x) > 16) fail(where, 'hips not over the chair seat', Math.abs(root.position.x - CHAIR.x), t); }
    if (pr.ball && !pr.ball.at) { const sole = legs[0].an.getWorldPosition(v).y - 8, gap = Math.abs(sole - 6.6); if (gap > .5) fail(where, 'foot not resting on the ball', gap, t); if (Math.abs(p.ballX - (v.x + 5.5)) > 5) fail(where, 'ball not under the foot', Math.abs(p.ballX - (v.x + 5.5)), t); }
    if (pr.dumbbells && Math.min(p.curlR, p.curlL) < .6) fail(where, 'hand not gripping the dumbbell', 1, t);
    if (pr.band) { const c = pr.band, an = c.anchor, st = c.s || (an ? [[an, 'handR'], [an, 'handL']] : [['handR', 'handL']]), rest = c.rest || (an ? 60 : 30);
      st.forEach(q => { const len = spot(q[0], v).distanceTo(spot(q[1], v2)); if (len > rest * 2.6) fail(where, 'band stretched past what a band takes', len / rest, t);
        q.forEach(e => { if (e === 'handR' && p.curlR < .6 || e === 'handL' && p.curlL < .6) fail(where, 'hand not gripping the band', 1, t); }); }); }
    legs.forEach(l => { const r = l.s > 0, side = r ? 'right' : 'left', kf = joint(l.hip, l.kn, l.an); l.kn.getWorldPosition(v2); v3.copy(v2).sub(l.hip.getWorldPosition(v)).normalize(); v.set(0, -1, 0).transformDirection(root.matrixWorld);
      const hf = Math.acos(clamp(v.dot(v3), -1, 1)) / R; if (kf > 152) fail(where, side + ' knee bent past its range', kf, t);
      if (hf > 90 + 40 * clamp(kf / 90, 0, 1) + 2) fail(where, side + ' hip flexed past what the hamstrings allow', hf, t);
      const ay2 = l.an.getWorldPosition(v).y - 3.4; if (ay2 < -.4) fail(where, side + ' ankle below the mat', -ay2, t);
      const free = r ? p.freeR : p.freeL, kn = r ? p.kneelR : p.kneelL, wgt = r ? p.wR : p.wL;
      if (wgt > .5 && free < .5 && kn < .5 && (r ? p.kdR : p.kdL) < .05) { const m = l.an.getWorldPosition(v).distanceTo(l.tg); if (m > .8) fail(where, side + ' supporting foot cannot reach the mat', m, t); } });
    const now2 = { hand: arms.map(a => a.wr.getWorldPosition(V3())), foot: legs.map(l => l.an.getWorldPosition(V3())), head: [head.getWorldPosition(V3())], hips: [root.position.clone()] };
    if (track) for (const k in now2) now2[k].forEach((pt, i) => { const d1 = pt.clone().sub(track[1][k][i]), sp = d1.length() / dt; if (sp > SPEED[k]) fail(where, k + ' moves too fast (units per second)', sp, t);
      if (track[0]) { const j = d1.sub(track[1][k][i].clone().sub(track[0][k][i])).length(); if (j > JERK[k]) fail(where, k + ' motion is jerky', j, t); } });
    if (track && prevP) legs.forEach((l, i) => { const r = l.s > 0, ok = pp3 => (r ? pp3.wR : pp3.wL) > .6 && (r ? pp3.liftR : pp3.liftL) < .3 && (r ? pp3.freeR : pp3.freeL) < .5 && (r ? pp3.kneelR : pp3.kneelL) < .05;
      if (ok(p) && ok(prevP) && Math.abs((r ? p.heelR : p.heelL) - (r ? prevP.heelR : prevP.heelL)) < .3 && Math.abs((r ? p.fxR : p.fxL) - (r ? prevP.fxR : prevP.fxL)) < .01) { const d = Math.hypot(now2.foot[i].x - track[1].foot[i].x, now2.foot[i].z - track[1].foot[i].z); if (d > .2) fail(where, (r ? 'right' : 'left') + ' foot slides while carrying weight', d, t); } });
    solidCheck(where, p, t);
    track = [track ? track[1] : null, now2]; prevP = p; };
  /* Solid-body check. Every part is a capsule (or the head a sphere), slightly slimmer than its drawn surface, so parts may
     touch but not pass into each other. Every pair that is not joined at a joint is tested, and every part against the mat,
     the chair and the door posts. */
  const segPt = (a, b, t, o) => o.lerpVectors(a, b, t), cpa = V3(), cpb = V3(), tmpq = V3();
  function capDist(A0, A1, B0, B1) { let best = 1e9; for (let i = 0; i <= 8; i++) { segPt(A0, A1, i / 8, cpa); tmpq.subVectors(B1, B0); const t = clamp(cpb.subVectors(cpa, B0).dot(tmpq) / (tmpq.lengthSq() || 1e-6), 0, 1); best = Math.min(best, cpa.distanceTo(segPt(B0, B1, t, cpb))); } return best; }
  function parts() { const P = [], w = (o, x, y, z) => V3(x, y, z).applyMatrix4(o.matrixWorld);
    P.push({ n: 'trunk', a: w(root, 0, 3, 0), b: w(chest, 0, 23, 0), r: 8.8, g: 'T' }, { n: 'head', a: w(head, HC[0], HC[1], 0), b: w(head, HC[0], HC[1] + .01, 0), r: 9.6, g: 'H' });
    arms.forEach(a => { const s = a.s > 0 ? 'right' : 'left'; P.push({ n: s + ' upper arm', a: a.sh.getWorldPosition(V3()), b: a.el.getWorldPosition(V3()), r: 4.4, g: s + 'A', j: 0 },
      { n: s + ' forearm', a: a.el.getWorldPosition(V3()), b: a.wr.getWorldPosition(V3()), r: 3.2, g: s + 'A', j: 1 }, { n: s + ' hand', a: a.wr.getWorldPosition(V3()), b: a.tips[1].getWorldPosition(V3()), r: 2, g: s + 'A', j: 2 }); });
    legs.forEach(l => { const s = l.s > 0 ? 'right' : 'left'; P.push({ n: s + ' thigh', a: l.hip.getWorldPosition(V3()), b: l.kn.getWorldPosition(V3()), r: 6.4, g: s + 'L', j: 0 },
      { n: s + ' shin', a: l.kn.getWorldPosition(V3()), b: l.an.getWorldPosition(V3()), r: 4.1, g: s + 'L', j: 1 }, { n: s + ' foot', a: w(l.an, -6, -4.3, 0), b: w(l.an, BALL[0], -4.6, 0), r: 3.3, g: s + 'L', j: 2 }); });
    return P; }
  const joined = (A1, B1) => (A1.g === B1.g && Math.abs(A1.j - B1.j) <= 1) || (A1.g === 'T' && B1.j === 0) || (B1.g === 'T' && A1.j === 0) || (A1.g === 'T' && B1.g === 'H') || (A1.g === 'H' && B1.g === 'T') || (A1.g === 'H' && B1.j === 0 && B1.g.endsWith('A')) || (B1.g === 'H' && A1.j === 0 && A1.g.endsWith('A'));
  function solidCheck(where, p, t) { const P = parts();
    for (let i = 0; i < P.length; i++) for (let k = i + 1; k < P.length; k++) { const A1 = P[i], B1 = P[k]; if (joined(A1, B1)) continue;
      const pen = A1.r + B1.r - capDist(A1.a, A1.b, B1.a, B1.b), armA = A1.g.endsWith('A'), armB = B1.g.endsWith('A'), hand = (armA && A1.j === 2) || (armB && B1.j === 2);
      const tol = A1.g.endsWith('L') && B1.g.endsWith('L') ? 2.2 : (A1.g === 'H' || B1.g === 'H') && (armA || armB) ? 2 : EX[curTest].clasp && armA && armB ? (hand ? 4.6 : 3) : EX[curTest].clasp && hand ? 2.4 : 1;      // clasp: a move in which one hand holds the other arm or hand; they press together but still may not pass through      // thighs and calves may press together a little
      if (pen > tol) fail(where, A1.n + ' passes into ' + B1.n, pen, t); }
    P.forEach(c => { const lo = Math.min(c.n.endsWith('upper arm') ? c.a.y + (c.b.y - c.a.y) * .35 : c.a.y, c.b.y) - c.r;      // the shoulder joint itself lies inside the trunk's outline
       if (c.g !== 'T' && c.g !== 'H' && lo < -1) fail(where, c.n + ' sinks into the mat', -lo, t); });
    legs.forEach(l => { l.an.updateMatrixWorld(); const m = l.an.matrixWorld.elements; let lo = 1e9; l.shoes.forEach(g => { const a = g.attributes.position.array; for (let i = 0; i < a.length; i += 3) lo = Math.min(lo, m[1] * a[i] + m[5] * a[i + 1] + m[9] * a[i + 2] + m[13]); }); if (lo < -.4) fail(where, (l.s > 0 ? 'right' : 'left') + ' shoe sinks into the mat', -lo, t); });
    const boxes = []; if (propsOf && propsOf.chair) boxes.push(['chair seat', CHAIR.x - 21, CHAIR.x + 21, CHAIR.seat - 4, CHAIR.seat, -21, 21], ['chair back', CHAIR.x - 21, CHAIR.x - 17.4, CHAIR.seat, CHAIR.seat + 46, -19, 19]);
    if (propsOf && propsOf.blocks) propsOf.blocks.forEach(b => boxes.push(['block', b[0], b[1], b[2], b[3], b[4], b[5]]));
    if (propsOf && propsOf.door) { const x = propsOf.door.x; boxes.push(['door post', x - 2.5, x + 2.5, 0, 205, 37, 47], ['door post', x - 2.5, x + 2.5, 0, 205, -47, -37]); }
    boxes.forEach(([bn, x0, x1, y0, y1, z0, z1]) => P.forEach(c => { if (c.g === 'T' && (bn === 'chair seat' || bn === 'block')) return; let pen = -1e9; for (let i = 0; i <= 8; i++) { segPt(c.a, c.b, i / 8, cpa); const dx = Math.max(x0 - cpa.x, 0, cpa.x - x1), dy = Math.max(y0 - cpa.y, 0, cpa.y - y1), dz = Math.max(z0 - cpa.z, 0, cpa.z - z1); pen = Math.max(pen, c.r - Math.hypot(dx, dy, dz)); }
      if (pen > (c.n.endsWith('hand') ? 2.3 : 1)) fail(where, c.n + ' passes into the ' + bn, pen, t); }));      // a flat palm on a surface: the hand's capsule is thicker than the hand
    arms.forEach(a => { const r = a.s > 0, pl = r ? p.plantR : p.plantL, hy = r ? p.hRy : p.hLy; if (pl < .98 || p.plantWall > .5 || hy < 6) return;      // a hand placed on the body or a prop must actually touch it
      palm(a, cpa); let gap = 1e9; P.forEach(c => { if (c.g === (r ? 'rightA' : 'leftA')) return; tmpq.subVectors(c.b, c.a); const tt = clamp(cpb.subVectors(cpa, c.a).dot(tmpq) / (tmpq.lengthSq() || 1e-6), 0, 1); gap = Math.min(gap, cpa.distanceTo(segPt(c.a, c.b, tt, cpb)) - c.r - 1.6); });
      if (propsOf && propsOf.chair) gap = Math.min(gap, Math.abs(cpa.y - 1.6 - CHAIR.seat));
      boxes.forEach(b => { gap = Math.min(gap, Math.hypot(Math.max(b[1] - cpa.x, 0, cpa.x - b[2]), Math.max(b[3] - cpa.y, 0, cpa.y - b[4]), Math.max(b[5] - cpa.z, 0, cpa.z - b[6])) - 1.6); });
      if (gap > 2) fail(where, (r ? 'right' : 'left') + ' hand floats instead of resting on what it holds', gap, t); }); }
  const fresh = () => { track = null; prevP = null; clamped.clear(); };
  let frames = 0; const passed = [], failed = [];
  Object.keys(EX).forEach(k => { fresh(); curTest = k; const f0 = worst.size; propsOf = { ...(EX[k].props || {}) }; if (stance(k) === 'chair') propsOf.chair = {}; const P = EX[k].period || 5.2, n = Math.ceil(P / dt); for (let i = 0; i <= n + 2; i++) { const t = i * dt, p = full(EX[k].pose(t)); apply(p, t); checkFrame('move: ' + EX[k].label, p, t); frames++; } (worst.size === f0 ? passed : failed).push(k); });
  cur = Object.keys(EX)[0]; moveT0 = now; paused = null;
  return { frames, moves: Object.keys(EX).length, failures: [...worst.values()], passed, failed };
}
window.__lab = {
  test: runTest,
  zoom(z, x, y, zz) { cam.over = z == null ? null : [z, x, y, zz]; return true; },
  pose(k, t, yaw = null, pitch = null) { paused = true; fade = null; drive = null; cv.style.opacity = 1; showMove(k); now = t; moveT0 = -HOLD;
    const yw = yaw ?? EX[k].yaw ?? 0, pi = pitch ?? EX[k].pitch ?? 7; Object.assign(cam, { yaw: yw, tYaw: yw, pitch: pi, tPitch: pi, lastUser: 1e9 }); if (yaw != null || pitch != null) { const vw = cam.over || fitView(k, yw, pi); camera.zoom = vw[0]; tgt.set(vw[1], vw[2], vw[3]); } draw(t, 0); return true; },
};

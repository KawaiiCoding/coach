/* Kinematics and tension model.
   Coordinates: x = subject's left (+) / right (-), y = up, z = front.
   Angles in degrees. Postures bend in the sagittal plane, plus shoulder and hip abduction.
   Units are model units (roughly 2 units = 1 cm on a 175 cm male). */
const KIN = (() => {
  const R = d => d * Math.PI / 180, S = Math.sin, Cs = Math.cos;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const L = { trunk: 105, neck: 20, head: 26, pel: 25, uarm: 55, farm: 50, hand: 40, thigh: 90, shank: 88, foot: 30 };

  const CTRL = [
    { k: 'trunk', l: 'Trunk lean', min: -25, max: 95, v: 0 },
    { k: 'neck', l: 'Neck forward', min: -30, max: 60, v: 0 },
    { k: 'head', l: 'Head nod', min: -30, max: 40, v: 0 },
    { k: 'arm', l: 'Shoulder flexion', min: -60, max:170, v: 0 },
    { k: 'abd', l: 'Shoulder abduction', min: 0, max: 120, v: 0 },
    { k: 'elbow', l: 'Elbow bend', min: 0, max: 140, v: 0 },
    { k: 'wrist', l: 'Wrist extension', min: -60, max: 60, v: 0 },
    { k: 'hip', l: 'Hip flexion', min: -25, max: 125, v: 0 },
    { k: 'hipAbd', l: 'Hip abduction', min: 0, max: 60, v: 0 },
    { k: 'knee', l: 'Knee bend', min: 0, max: 135, v: 0 },
    { k: 'ankle', l: 'Ankle (plantarflex +)', min: -25, max: 35, v: 0 },
    { k: 'hand', l: 'Load in hands', min: 0, max: 15, v: 0, u: ' kg' },
    { k: 'time', l: 'Time held', min: 0, max: 240, v: 0, u: ' min' }
  ];
  const P0 = Object.fromEntries(CTRL.map(c => [c.k, c.v]));

  const add = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l, p[2] + d[2] * l];
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

  /* A bone: start s, unit direction d, length l, front vector f (perpendicular, pointing to the subject's front), lateral x. */
  function bone(s, d, l, f) { d = norm(d); f = norm(f); let x = norm(cross(d, f)); if (x[0] < 0) x = x.map(v => -v); /* body frame: lateral points to the subject's left */ return { s, d, l, f, x }; }

  function build(p) {
    const A = {
      trunk: R(p.trunk), neck: R(p.trunk + p.neck), head: R(p.trunk + p.neck + p.head),
      uarm: R(p.arm), abd: R(p.abd), elbow: R(p.elbow), wrist: R(p.wrist),
      thigh: R(p.hip), hipAbd: R(p.hipAbd), shank: R(p.hip - p.knee), ankle: R(p.ankle)
    };
    A.pel = A.trunk - A.thigh * 0.08; // the pelvis follows the trunk and tilts a little backward as the hips flex
    A.uarmAbs = A.uarm + A.trunk; A.thighAbs = A.thigh - A.pel; A.shankAbs = A.shank - A.pel; // angles from the vertical, for gravity loads
    const up = a => [0, Cs(a), S(a)], dn = a => [0, -Cs(a), S(a)];
    const fr = a => [0, -S(a), Cs(a)];           // front vector of an "up" segment at angle a
    const frDn = a => [0, S(a), Cs(a)];          // front vector of a "down" segment

    // Legs first, so the ankle can be pinned to the ground.
    const H = [0, 0, 0];
    const B = { 1: {}, '-1': {} };
    [1, -1].forEach(g => {
      const hipJ = [g * 17, 0, 0];
      // Hip flexion is measured from the pelvis (trunk) line, as a clinician would.
      const ab = A.hipAbd, h = A.thigh - A.pel, sh = A.shank - A.pel;
      const thD = [g * S(ab), -Cs(ab) * Cs(h), Cs(ab) * S(h)];
      const shD = [g * S(ab) * 0.6, -Cs(ab * 0.6) * Cs(sh), Cs(ab * 0.6) * S(sh)];
      const K = add(hipJ, norm(thD), L.thigh), An = add(K, norm(shD), L.shank);
      const ak = A.ankle, dsh = norm(shD), fsh = frDn(sh);
      // The foot sits at right angles to the shin, then rotates by the ankle angle (plantarflexion +).
      const ftD = [fsh[0] * Cs(ak) + dsh[0] * S(ak), fsh[1] * Cs(ak) + dsh[1] * S(ak), fsh[2] * Cs(ak) + dsh[2] * S(ak)];
      const ftUp = [-dsh[0] * Cs(ak) + fsh[0] * S(ak), -dsh[1] * Cs(ak) + fsh[1] * S(ak), -dsh[2] * Cs(ak) + fsh[2] * S(ak)];
      B[g].thigh = bone(hipJ, thD, L.thigh, frDn(h));
      B[g].shank = bone(K, shD, L.shank, frDn(sh));
      B[g].foot = bone(An, ftD, L.foot, ftUp);
    });
    B[1].pel = bone(H, up(A.pel), L.pel, fr(A.pel)); B['-1'].pel = B[1].pel;
    const sh = add(H, up(A.trunk), L.trunk), nk = add(sh, up(A.neck), L.neck);
    B[1].trunk = bone(H, up(A.trunk), L.trunk, fr(A.trunk)); B['-1'].trunk = B[1].trunk;
    B[1].neck = bone(sh, up(A.neck), L.neck, fr(A.neck)); B['-1'].neck = B[1].neck;
    B[1].head = bone(nk, up(A.head), L.head, fr(A.head)); B['-1'].head = B[1].head;
    [1, -1].forEach(g => {
      const shJ = [g * 38, sh[1], sh[2]];
      const f = A.uarm + A.trunk, b = A.abd; // shoulder flexion is measured from the trunk line
      // Shoulder flexion in the sagittal plane, then abduction away from the trunk.
      const uaD = norm([g * S(b), -Cs(b) * Cs(f), Cs(b) * S(f)]);
      const uaF = norm([0, S(f), Cs(f)]);
      const E = add(shJ, uaD, L.uarm);
      const faD = norm([uaD[0] * Cs(A.elbow) + uaF[0] * S(A.elbow), uaD[1] * Cs(A.elbow) + uaF[1] * S(A.elbow), uaD[2] * Cs(A.elbow) + uaF[2] * S(A.elbow)]);
      const faF = norm(cross(cross(faD, uaF), faD)); // the component of the upper-arm front vector perpendicular to the forearm (continuous as the elbow bends)
      const W = add(E, faD, L.farm);
      const w = A.wrist;
      const hdD = norm([faD[0] * Cs(w) - faF[0] * S(w), faD[1] * Cs(w) - faF[1] * S(w), faD[2] * Cs(w) - faF[2] * S(w)]);
      B[g].uarm = bone(shJ, uaD, L.uarm, uaF);
      B[g].farm = bone(E, faD, L.farm, faF.some(isNaN) ? uaF : faF);
      B[g].hand = bone(W, hdD, L.hand, B[g].farm.f);
    });
    const F = { A, B, H, sh, nk, p };
    place(F, p);
    return F;
  }

  /* Scenes: 'floor' pins the feet to the ground; 'sofa' pins the hips at seat height;
     'supine' and 'side' lay the body down (rotation applied to every bone). */
  function rot(F, m) {
    const ap = v => [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]];
    const seen = new Set();
    for (const g of [1, -1]) for (const k in F.B[g]) { const b = F.B[g][k]; if (seen.has(b)) continue; seen.add(b); b.s = ap(b.s); b.d = ap(b.d); b.f = ap(b.f); b.x = ap(b.x); }
    F.H = ap(F.H); F.sh = ap(F.sh); F.nk = ap(F.nk);
  }
  function shift(F, o) {
    const seen = new Set();
    for (const g of [1, -1]) for (const k in F.B[g]) { const b = F.B[g][k]; if (seen.has(b)) continue; seen.add(b); b.s = add(b.s, o, 1); }
    F.H = add(F.H, o, 1); F.sh = add(F.sh, o, 1); F.nk = add(F.nk, o, 1);
  }
  function place(F, p) {
    const scene = p.scene || 'floor';
    F.scene = scene;
    const lowest = () => { let lo = 1e9; const seen = new Set(); for (const g of [1, -1]) for (const k in F.B[g]) { const b = F.B[g][k]; if (seen.has(b)) continue; seen.add(b); lo = Math.min(lo, b.s[1], add(b.s, b.d, b.l)[1]); } return lo; };
    if (scene === 'side') {
      // Lying on the right side: rotate +90° about z, so the head points to -x and the right side faces down.
      rot(F, [[0, -1, 0], [1, 0, 0], [0, 0, 1]]);
      shift(F, [0, (p.bed || 0) + 8 - lowest(), 0]);
    } else if (scene === 'supine') {
      // Lying on the back: rotate -90° about x, so the front faces up and the head points to -z.
      rot(F, [[1, 0, 0], [0, 0, 1], [0, -1, 0]]);
      shift(F, [0, (p.bed || 0) + 8 - lowest(), 0]);
    } else {
      // Pin: floor -> lowest foot point on ground (y=0); sofa -> hip at seat height.
      if (scene === 'sofa') { shift(F, [0, (p.seat || 44), 0]); }
      else {
        let lo = 1e9;
        for (const g of [1, -1]) { const b = F.B[g].foot; lo = Math.min(lo, b.s[1], add(b.s, b.d, b.l)[1]); }
        shift(F, [0, -lo, 0]);
      }
    }
  }

  /* Attachment: [bone, t along the bone (0..1), lateral offset (+ = outward on that side), front offset (+ = front, - = back)] */
  function at(B, sp, g, off = true) {
    const b = B[g][sp[0]], t = sp[1] * b.l;
    const q = [b.s[0] + b.d[0] * t, b.s[1] + b.d[1] * t, b.s[2] + b.d[2] * t];
    if (!off) return q;
    const lat = b.x, lx = sp[2] * g * 1.9, fz = sp[3] * 1.2; // lateral offset is outward on the side g
    return [q[0] + lat[0] * lx + b.f[0] * fz, q[1] + lat[1] * lx + b.f[1] * fz, q[2] + lat[2] * lx + b.f[2] * fz];
  }

  const N0 = build({ ...P0 });

  /* Tension per muscle: passive stretch (length vs rest) and active load (posture, gravity, hand load),
     then pain risk from sustained load, held shortening and surface pressure. */
  function analyse(F, M, p) {
    const A = F.A;
    const torque = p.hand * (S(A.uarm) * 55 + 50 * S(A.uarm + A.elbow)) / 100; // crude moment arm factor
    const tf = 1 - Math.exp(-(p.time || 0) / 40);
    const lying = F.scene === 'side' || F.scene === 'supine';
    const press = new Set(p.press || []);
    const out = {};
    M.forEach(m => {
      if (!m.rest) m.rest = dist(at(N0.B, m.a, 1), at(N0.B, m.b, 1));
      const len = dist(at(F.B, m.a, 1), at(F.B, m.b, 1));
      const k = m.reg === 'Shoulder' || m.reg === 'Chest' || m.reg === 'Arm' ? 0.35 : m.reg === 'Hip' ? 0.6 : 1; // point attachments near a ball joint exaggerate length change
      const r = 1 + (len / m.rest - 1) * k;
      const passive = clamp((r - 1) * 4);        // about 25% elongation = full passive tension
      let load = lying ? 0.06 : clamp(m.load ? m.load(A, p, torque) : 0.1);
      if (p.support && p.support.includes(m.id)) load *= 0.4;    // backrest or cushion takes the load
      const T = clamp(Math.max(passive * 0.9, load) + 0.3 * Math.min(passive, load));
      const shortening = clamp((1 - r) * 3);     // about 33% shortening = fully shortened
      const pressure = press.has(m.id) ? 0.15 + 0.45 * tf : 0;
      const pain = clamp(T * (0.3 + 0.7 * tf) + shortening * 0.5 * tf + pressure);
      out[m.id] = { r, passive, load, T, shortening, pressure, pain, len };
    });
    return out;
  }

  return { L, CTRL, P0, build, at, analyse, add, dist, norm, cross, clamp, R, N0 };
})();

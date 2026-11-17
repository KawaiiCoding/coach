/* Body: shapes and rig (trunk on a joint-by-joint spine, neck, head, hair, arms with one-piece forearm and hand, legs, trainers), floor and mat. */
/* ---------- shapes: smooth turned profiles (radius along the bone), rounded at both ends ---------- */
function prof(st, t) {                                           // Catmull-Rom through the stations: one flowing curve, no flat spot at each station
  const n = st.length; if (t <= st[0][0]) return st[0][1]; if (t >= st[n - 1][0]) return st[n - 1][1];
  let i = 1; while (st[i][0] < t) i++;
  const p0 = st[Math.max(i - 2, 0)], p1 = st[i - 1], p2 = st[i], p3 = st[Math.min(i + 1, n - 1)], h = p2[0] - p1[0], k = (t - p1[0]) / h;
  const m1 = (p2[1] - p0[1]) / ((p2[0] - p0[0]) || 1) * h, m2 = (p3[1] - p1[1]) / ((p3[0] - p1[0]) || 1) * h, k2 = k * k, k3 = k2 * k;
  return (2 * k3 - 3 * k2 + 1) * p1[1] + (k3 - 2 * k2 + k) * m1 + (-2 * k3 + 3 * k2) * p2[1] + (k3 - k2) * m2;
}
function lathe(L, st, { sx = 1, sz = 1, capA = 1, capB = 1, down = true, seg = 40 } = {}) {
  const P = [], r0 = st[0][1], r1 = st[st.length - 1][1];
  for (let i = 0; i <= 10; i++) { const a = (-90 + i * 9) * R; P.push(new THREE.Vector2(Math.max(1e-3, r0 * Math.cos(a)), r0 * capA * Math.sin(a))); }
  for (let i = 1; i < 30; i++) { const t = i / 30; P.push(new THREE.Vector2(prof(st, t), t * L)); }
  for (let i = 0; i <= 10; i++) { const a = i * 9 * R; P.push(new THREE.Vector2(Math.max(1e-3, r1 * Math.cos(a)), L + r1 * capB * Math.sin(a))); }
  const g = new THREE.LatheGeometry(P, seg);
  g.scale(sx, 1, sz);
  if (down) g.rotateZ(Math.PI);
  return g;
}
const ell = (r, sx, sy, sz, seg = 36) => { const g = new THREE.SphereGeometry(r, seg, Math.round(seg * .7)); g.scale(sx, sy, sz); return g; };
const ring = (r, tube, sx = 1, sz = 1) => { const g = new THREE.TorusGeometry(r, tube, 10, 48); g.rotateX(Math.PI / 2); g.scale(sx, 1, sz); return g; };
const grp = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

/* ---------- rig: units are roughly centimetres; the figure faces +x, up is +y, its right side is +z ---------- */
const L = { thigh: 44, shin: 42, ua: 29, fa: 26, ankle: 8 };
const root = grp(scene);                                         // pelvis, origin between the hip joints
/* Trunk: ONE continuous body from the crotch to the base of the neck, sculpted in cross-sections (half-width, depth to the front,
   depth to the back) so the glutes, the waist, the chest and the slope of the shoulders are part of the same surface. The leggings
   and the shirt are two skins of that body. Every frame both are re-shaped along a smooth spine curve, so the pelvis, lower back
   and ribcage always flow into each other: no stacked blocks, no ball-shaped pelvis, no stiff shirt hem. */
const SP = { joint: 22.5, rigid: 43.4, N: 68, lo: -14, hi: 54, hem: 3, cols: 60 };
const TW = [[-9.4, 0], [-8.8, 6], [-7.2, 10.8], [-4.5, 15.5], [0, 16.2], [5, 15.3], [10, 13.9], [14, 13.5], [20, 13.9], [28, 15.1], [34, 16], [39, 16.4], [42.5, 15.9], [45.2, 13.2], [47.4, 9.6], [49, 7.2], [50.2, 6.2]];
const TF = [[-9.4, 0], [-8.8, 3.8], [-7.2, 6.6], [-4.5, 9], [0, 9.6], [5, 10], [10, 10.2], [14, 10], [20, 10], [28, 10.7], [34, 11.6], [39, 11.9], [43.5, 10.4], [46.5, 7.6], [48.8, 5.6], [50.2, 5.2]];
const TB = [[-9.4, 0], [-8.8, 4.6], [-7.2, 8], [-4.5, 10.2], [0, 10.8], [5, 10.2], [10, 9], [14, 8.7], [20, 9.3], [28, 10.3], [34, 11], [39, 11.2], [43.5, 10.6], [46.5, 8.6], [48.8, 6], [50.2, 5.6]];
/* The woman's figure: the same skeleton and joints, with narrower shoulders and ribcage, a narrower waist, slightly wider
   hips and a fuller chest. Asked for with ?sex=f in the address. */
const FEM = new URLSearchParams(location.search).get('sex') === 'f';
if (FEM) { const sc = (T, f) => T.forEach(r => { r[1] *= f(r[0]); }), mixr = (a, b, u0, u1, u) => a + (b - a) * ramp(u0, u1, u);      // every change blends in over several centimetres: no step anywhere in the outline
  sc(TW, u => u < 20 ? mixr(1.045, .89, 3, 15, u) : u < 34 ? mixr(.89, .93, 20, 30, u) : mixr(.93, .9, 34, 41, u) + (1 - mixr(.93, .9, 34, 41, u)) * ramp(44, 50, u));
  sc(TF, u => 1 - .06 * ramp(6, 14, u) * (1 - ramp(18, 25, u)) + .13 * ramp(21, 27, u) * (1 - ramp(33, 39, u))); sc(TB, u => 1 - .05 * ramp(6, 14, u) * (1 - ramp(18, 26, u))); }
function trunkSkin(rows) {                                       // rows: [u, scale, grow]
  const N = SP.cols, pos = [], idx = [];
  rows.forEach(([u, k, grow]) => { const W = Math.max(0, prof(TW, u)), F = Math.max(0, prof(TF, u)), B = Math.max(0, prof(TB, u)), gl = Math.exp(-(((u + 3) / 5.2) ** 2));
    for (let i = 0; i < N; i++) { const a = i / N * TAU0, c = Math.cos(a), sn = Math.sin(a), cx = Math.sign(c) * Math.abs(c) ** .9, sz = Math.sign(sn) * Math.abs(sn) ** .9;
      const z = (W + grow) * sz * k; let x = (c >= 0 ? F + grow : B + grow) * cx * k;
      if (c < 0) x += c * gl * (1.3 * Math.exp(-(((Math.abs(z) - 6) / 4.8) ** 2)) - .7 * Math.exp(-((z / 2.1) ** 2)));      // two glutes with a soft cleft, part of the same surface
      pos.push(x, u, z); } });
  for (let j = 0; j < rows.length - 1; j++) for (let i = 0; i < N; i++) { const p0 = j * N + i, p1 = j * N + (i + 1) % N, p2 = p0 + N, p3 = p1 + N; idx.push(p0, p2, p1, p1, p2, p3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = (rows.length >> 1) * N, n = g.attributes.normal;
  if (n.getX(m) * pos[m * 3] + n.getZ(m) * pos[m * 3 + 2] < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } g.setIndex(idx); g.computeVertexNormals(); }
  g.userData = { rest: g.attributes.position.array.slice(), rows: rows.map(r => r[0]) };
  return g;
}
const TAU0 = Math.PI * 2, span = (a, b, st) => { const o = []; for (let u = a; u <= b + 1e-6; u += st) o.push(u); return o; };
const hipsG = trunkSkin([...span(-9.4, 5.6, .6).map(u => [u, 1, 0]), [5.9, .86, 0], [6.1, .5, 0]]);
const hemGrow = u => .22 + .53 * ramp(SP.hem, SP.hem + 6, u);      // the shirt hugs the hips at the hem and loosens above
const shirtG = trunkSkin([[SP.hem + .7, .9, .2], [SP.hem + .15, .985, .22], ...span(SP.hem, 50.2, .8).map(u => [u, 1, hemGrow(u)]), [50.8, .7, .75], [51.1, .05, .75]]);
part(hipsG, PAL.hip, G.torso, root).children.forEach(m => m.frustumCulled = false);
part(shirtG, PAL.top, G.torso, root, .4, true).children.forEach(m => m.frustumCulled = false);
const chest = grp(root, 0, SP.joint);                             // ribcage frame: shoulders, neck and head ride on the top of the curve
part(ring(6.3, .8, .95), PAL.trim, G.torso, chest, 0).position.set(.9, 26.2, 0);                                      // collar
const spQ = Array.from({ length: SP.N + 1 }, () => new THREE.Quaternion()), spC = Array.from({ length: SP.N + 1 }, () => V3());
const qL = new THREE.Quaternion(), qC = new THREE.Quaternion(), qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), QI = new THREE.Quaternion(), eul = new THREE.Euler(), sv = V3(), sc0 = V3();
/* The spine is mapped joint by joint. Five lumbar joints (L5-S1 up to L1-L2) and twelve thoracic joints (T12-L1 up to T1-T2)
   sit at their own heights. Each takes its own share of flexion/extension, side bend and rotation, in proportion to the range
   that joint has in a healthy spine (after White and Panjabi): the lumbar spine does most of the bending and almost no twisting,
   the mid and upper thoracic spine does most of the twisting, the lower thoracic joints bend forward the most. A pose gives one
   total per region and per direction; no single joint can be asked for more than its share. */
const SPINE = [...[17, 16, 15, 14, 12].map((f, i) => ({ u: 3.5 + i * 3.5, reg: 'lum', f, s: [3, 6, 8, 6, 6][i], t: [1, 2, 2, 2, 2][i] })),
  ...[12, 12, 9, 6, 6, 6, 5, 4, 4, 4, 4, 4].map((f, i) => ({ u: 21 + i * 1.82, reg: 'che', f, s: [8, 9, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6][i], t: [2, 2, 2, 4, 6, 7, 7, 8, 8, 8, 8, 9][i], q: 0 }))];
['lum', 'che'].forEach(reg => ['f', 's', 't'].forEach(k => { const g = SPINE.filter(j => j.reg === reg), sum = g.reduce((a, j) => a + j[k], 0); g.forEach(j => j[k] /= sum); }));
SPINE.forEach(j => j.q = new THREE.Quaternion());
const spineShare = (reg, top) => SPINE.filter(j => j.reg === reg).reduce((a, j) => a + j.f * (1 - j.u / top), 0);      // how much a region's flexion tips the hip-to-shoulder line
function bendTorso(br, p) {
  SPINE.forEach(j => j.q.setFromEuler(eul.set(p[j.reg + 'S'] * j.s * R, p[j.reg + 'T'] * j.t * R, -p[j.reg] * j.f * R)));
  const du = (SP.hi - SP.lo) / SP.N, N = SP.cols;
  for (let k = 0; k <= SP.N; k++) { const u = SP.lo + k * du, q = spQ[k].copy(QI);
    for (const j of SPINE) { const f = ramp(j.u - 1.7, j.u + 1.7, u); if (f <= 0) break; q.multiply(f >= 1 ? j.q : qA.copy(QI).slerp(j.q, f)); } }
  spC[0].set(0, SP.lo, 0);
  for (let k = 1; k <= SP.N; k++) spC[k].copy(spC[k - 1]).add(sv.set(0, du, 0).applyQuaternion(qA.copy(spQ[k - 1]).slerp(spQ[k], .5)));
  [hipsG, shirtG].forEach(g => { const P = g.attributes.position, r = g.userData.rest;
    g.userData.rows.forEach((u, j) => { const f = clamp((u - SP.lo) / du, 0, SP.N - 1e-4), k = Math.floor(f), t = f - k;
      qA.copy(spQ[k]).slerp(spQ[k + 1], t); sc0.copy(spC[k]).lerp(spC[k + 1], t);
      const sc = br * ramp(26, 36, u) * (1 - ramp(43, 49, u));                             // breathing widens the ribcage only
      for (let i = j * N; i < j * N + N; i++) { sv.set(r[i * 3] * (1 + sc * .6), 0, r[i * 3 + 2] * (1 + sc)).applyQuaternion(qA); P.setXYZ(i, sc0.x + sv.x, sc0.y + sv.y, sc0.z + sv.z); } });
    P.needsUpdate = true; g.computeVertexNormals(); });
  const f = (SP.rigid - SP.lo) / du, k = Math.floor(f);
  chest.quaternion.copy(spQ[k]).slerp(spQ[k + 1], f - k);
  chest.position.copy(spC[k]).lerp(spC[k + 1], f - k).add(sv.set(0, SP.joint - SP.rigid, 0).applyQuaternion(chest.quaternion));
}
/* Neck: one smooth tube from the collar to the skull, bent evenly along its length every frame (no rings, no hinge).
   The head sits on the end of that curve. */
const NK = { base: V3(.8, 25.5, 0), dir: V3(1.4, 8.4, 0).normalize(), len: Math.hypot(1.4, 8.4), cols: 28, rows: span(-1.8, 10.4, .68) };
const NKR = [[-1.8, 6.4], [1, 5.9], [4.4, 5.2], [8.5, 5.25], [10.4, 5.1]];
const neckG = (() => { const N = NK.cols, pos = [], idx = [];
  NK.rows.forEach(sd => { const r = prof(NKR, sd); for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; pos.push(r * .95 * Math.cos(a), sd, r * Math.sin(a)); } });
  for (let j = 0; j < NK.rows.length - 1; j++) for (let i = 0; i < N; i++) { const p0 = j * N + i, p1 = j * N + (i + 1) % N, p2 = p0 + N, p3 = p1 + N; idx.push(p0, p1, p2, p1, p3, p2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getX(0) < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } g.setIndex(idx); g.computeVertexNormals(); }
  g.userData.rest = g.attributes.position.array.slice(); return g; })();
part(neckG, PAL.skin, G.head, chest, .36, true).children.forEach(m => m.frustumCulled = false);
const head = grp(chest, 0, 0, 0);
const qN = new THREE.Quaternion(), nc = V3();
function bendNeck(p) {
  qN.setFromEuler(eul.set(p.necS * R, p.headT * R / 2, -p.nec * R));
  const P = neckG.attributes.position, r = neckG.userData.rest, N = NK.cols; let prev = NK.rows[0];
  nc.copy(NK.base).addScaledVector(NK.dir, prev);
  NK.rows.forEach((sd, j) => { const v = clamp(sd / NK.len, 0, 1);
    qA.copy(QI).slerp(qN, clamp((sd + prev) / 2 / NK.len, 0, 1)); nc.add(sv.copy(NK.dir).multiplyScalar(sd - prev).applyQuaternion(qA)); prev = sd;
    qA.copy(QI).slerp(qN, v);
    for (let i = j * N; i < j * N + N; i++) { sv.set(r[i * 3], 0, r[i * 3 + 2]).applyQuaternion(qA); P.setXYZ(i, nc.x + sv.x, nc.y + sv.y, nc.z + sv.z); }
    if (Math.abs(sd - NK.len) < .35 || (sd < NK.len && NK.len - sd < .68)) head.position.copy(nc).add(sv.copy(NK.dir).multiplyScalar(NK.len - sd).applyQuaternion(qN)); });
  P.needsUpdate = true; neckG.computeVertexNormals();
  head.quaternion.copy(qN).multiply(qB.setFromEuler(eul.set(-p.necS * .4 * R, p.headT * R / 2, -p.hea * R)));
}
// head: skull, jaw, nose, ears, eyes, brows, mouth; features are placed on the skull surface
const HS = [1, 1.1, .85], HC = [1.2, 11.6, 0], HR = 11.4;
part(ell(HR, ...HS, 48), PAL.face, G.head, head, .36).position.set(...HC);
part(ell(6.8, .98, .8, 1), PAL.face, G.head, head, .36).position.set(5.1, 5.2, 0);
const onSkull = (y, z, inset = .25) => { const yy = (y - HC[1]) / (HR * HS[1]), zz = z / (HR * HS[2]); return HC[0] + HR * HS[0] * Math.sqrt(Math.max(0, 1 - yy * yy - zz * zz)) - inset; };
part(ell(1.3, 1.25, 1.05, .9), PAL.skin, G.head, head, .3).position.set(onSkull(9.6, 0) + .6, 9.6, 0);
[1, -1].forEach(s => {
  part(ell(2.6, .62, 1, .34), PAL.skin, G.head, head, .3).position.set(-.4, 10.9, s * (HR * HS[2] - .25));                 // ear: one plain rounded shape
  const ez = s * 4.1, ey = 12.9;
  part(ell(1.05, .6, 1.12, 1), PAL.eye, G.head, head, 0).position.set(onSkull(ey, ez, .3), ey, ez);
  const bz = s * 4.2, by = 16.2, brow = new THREE.CapsuleGeometry(.44, 3.3, 4, 8); brow.rotateX(Math.PI / 2); brow.rotateY(s * .3); brow.rotateX(-s * .1);
  part(brow, PAL.hair, G.head, head, 0).position.set(onSkull(by, bz, .15), by, bz);
  part(ell(1.7, .4, .7, 1), PAL.cheek, G.head, head, 0).position.set(onSkull(8.6, s * 6, .28), 8.6, s * 6);
});
const mouth = new THREE.TorusGeometry(2.5, .34, 8, 24, Math.PI * .56); mouth.rotateZ(-Math.PI * .78); mouth.rotateY(Math.PI / 2);
{ const P = mouth.attributes.position; for (let i = 0; i < P.count; i++) P.setX(i, P.getX(i) - P.getZ(i) * P.getZ(i) * .085); }      // wrap it round the face
part(mouth, PAL.mouth, G.head, head, 0).position.set(11.98, 8.3, 0);
// hair: one sculpted piece. Its edge follows a real hairline (forehead, temple, sideburn, over the ear, down to the nape)
// and it is thicker on top with a soft lift at the front, so the skull is always fully covered.
function hairGeo() {
  // the woman's hair: a softer, lower hairline that covers the temples and is drawn back over the ears to the nape, with more body
  const N = 96, Mv = 22, KEY = FEM ? [[0, 37], [24, 33], [46, 21], [62, 5], [74, -12], [84, -13], [93, -3], [102, 2], [116, -8], [134, -30], [156, -47], [180, -52]]
    : [[0, 41], [28, 39], [50, 27], [66, 10], [78, -8], [87, -4], [94, 9], [103, 14], [116, 9], [130, -10], [152, -33], [180, -40]];
  const line = a => { a = Math.abs(a); for (let i = 1; i < KEY.length; i++) if (a <= KEY[i][0]) { const [a0, e0] = KEY[i - 1], [a1, e1] = KEY[i], k = (a - a0) / (a1 - a0); return e0 + (e1 - e0) * (k * k * (3 - 2 * k)); } return -40; };
  const pos = [], idx = [];
  for (let j = 0; j <= Mv + 1; j++) for (let i = 0; i < N; i++) {
    const az = i / N * 360 - 180, v = Math.min(1, j / Mv), rim = j > Mv, hl = line(az);
    const el = (90 + (hl - (rim ? 3.5 : 0) - 90) * Math.pow(v, .9)) * R, a = az * R;
    const lift = 1.9 * Math.exp(-((az / 46) ** 2)) * Math.sin(Math.PI * clamp((v - .25) / .75, 0, 1)) ** .8;
    const r = HR + (rim ? .16 : .55 + 1.25 * (1 - v * v) + lift + (FEM ? .45 + .5 * Math.exp(-(((Math.abs(az) - 150) / 40) ** 2)) : 0));
    pos.push(r * HS[0] * Math.cos(el) * Math.cos(a), r * HS[1] * Math.sin(el), r * HS[2] * Math.cos(el) * Math.sin(a));
  }
  for (let j = 0; j <= Mv; j++) for (let i = 0; i < N; i++) { const p0 = j * N + i, p1 = j * N + (i + 1) % N, p2 = (j + 1) * N + i, p3 = (j + 1) * N + (i + 1) % N; idx.push(p0, p1, p2, p1, p3, p2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const k = (Mv >> 1) * N * 3, n = g.attributes.normal;                      // make sure the surface faces outwards
  if (n.getX(k / 3) * pos[k] + n.getY(k / 3) * pos[k + 1] + n.getZ(k / 3) * pos[k + 2] < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } g.setIndex(idx); g.computeVertexNormals(); }
  return g;
}
part(hairGeo(), PAL.hair, G.hair, head, .34, true).position.set(...HC);
if (FEM) { const bun = ell(4.3, .95, 1, 1.12, 32); const hb = part(bun, PAL.hair, G.hair, head, .34); hb.position.set(HC[0] - 10.1, HC[1] - 5.6, 0); hb.rotation.z = -.35;      // gathered in a low bun at the nape: it sits in the hollow of the neck, so it never presses into the mat when she lies down
  part(ell(1.5, 1, .8, 2.6, 20), PAL.hair, G.hair, head, .3).position.set(HC[0] - 8.3, HC[1] - 3.4, 0); }

/* Forearm, wrist and palm are one skin. Turning the palm (pronation) is spread along the forearm, as the two forearm bones do it;
   the wrist bend is a rounded curve, so there is no ball joint and no step between arm and hand. */
const FA = { rows: [-3.1, ...span(-2.4, L.fa + 8.4, .68), L.fa + 8.9], cols: 22, bend: 2.6 };
const FAX = [[-3.1, .3], [-2.4, 2.6], [0, 4.2], [7, 4.7], [17, 3.7], [L.fa - 2, 3.05], [L.fa + 1.2, 3.1], [L.fa + 4.6, 3.75], [L.fa + 7.4, 3.6], [L.fa + 8.4, 2.6], [L.fa + 8.9, .4]];      // half-width
const FAZ = [[-3.1, .3], [-2.4, 2.4], [0, 3.9], [7, 4.2], [17, 3.3], [L.fa - 2, 2.6], [L.fa + 1.2, 2.15], [L.fa + 4.6, 1.65], [L.fa + 7.4, 1.5], [L.fa + 8.4, 1.1], [L.fa + 8.9, .3]];      // half-thickness
function armSkin() { const N = FA.cols, pos = [], idx = [];
  FA.rows.forEach(sd => { const ax1 = Math.max(.05, prof(FAX, sd)), az1 = Math.max(.05, prof(FAZ, sd)), ex = .95 - .22 * ramp(L.fa - 1, L.fa + 4, sd);
    for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; pos.push(ax1 * pw(Math.cos(a), ex), -sd, az1 * pw(Math.sin(a), ex)); } });
  for (let j = 0; j < FA.rows.length - 1; j++) for (let i = 0; i < N; i++) { const p0 = j * N + i, p1 = j * N + (i + 1) % N, p2 = p0 + N, p3 = p1 + N; idx.push(p0, p2, p1, p1, p2, p3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = (FA.rows.length >> 1) * N; if (g.attributes.normal.getX(m) < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } g.setIndex(idx); g.computeVertexNormals(); }
  g.userData.rest = g.attributes.position.array.slice(); return g; }
const qTw = new THREE.Quaternion(), qSw = new THREE.Quaternion(), fa0 = V3(), fa1 = V3(), fa2 = V3();
function skinArm(a) { const q = a.wr.quaternion, g = a.skin, P = g.attributes.position, r = g.userData.rest, N = FA.cols, B = FA.bend;
  const n = Math.hypot(q.y, q.w); if (n > 1e-5) qTw.set(0, q.y / n, 0, q.w / n); else qTw.copy(QI);      // split the wrist rotation: turn about the forearm's axis, then bend
  qSw.copy(qTw).invert().multiply(q);
  fa0.set(0, -(L.fa - B), 0); fa1.set(0, -L.fa, 0); fa2.set(0, -B, 0).applyQuaternion(q).add(fa1);
  FA.rows.forEach((sd, j) => { qA.copy(QI).slerp(qTw, ramp(2, L.fa - 1, sd)).multiply(qB.copy(QI).slerp(qSw, ramp(L.fa - B, L.fa + B, sd)));
    if (sd <= L.fa - B) sc0.set(0, -sd, 0); else if (sd >= L.fa + B) sc0.set(0, -(sd - L.fa), 0).applyQuaternion(q).add(fa1);
    else { const t = (sd - (L.fa - B)) / (2 * B), k0 = (1 - t) * (1 - t), k1 = 2 * t * (1 - t), k2 = t * t; sc0.set(0, 0, 0).addScaledVector(fa0, k0).addScaledVector(fa1, k1).addScaledVector(fa2, k2); }
    for (let i = j * N; i < j * N + N; i++) { sv.set(r[i * 3], 0, r[i * 3 + 2]).applyQuaternion(qA); P.setXYZ(i, sc0.x + sv.x, sc0.y + sv.y, sc0.z + sv.z); } });
  P.needsUpdate = true; g.computeVertexNormals(); }
const SHO = { y: 19.4, z: FEM ? 14.5 : 15.9 };                              // shoulder joint: below the top of the shoulder line, as on a person
function makeArm(s) {
  const gid = s > 0 ? G.armR : G.armL, sh = grp(chest, 0, SHO.y, s * SHO.z); sh.rotation.order = 'XZY';        // abduction, flexion, then rotation about the arm's own axis
  part(lathe(L.ua, [[0, 5.8], [.18, 6.2], [.55, 5.1], [1, 4.3]], { sz: .92, capA: .6 }), PAL.skin, gid, sh);
  part(lathe(13, [[0, 6.9], [.3, 7], [1, 5.9]], { sz: .95, capA: .62, capB: .2 }), PAL.top, gid, sh);
  part(ring(5.95, .5, 1, .95), PAL.trim, gid, sh, 0).position.y = -13;
  const el = grp(sh, 0, -L.ua);
  const skin = armSkin(); part(skin, PAL.skin, gid, el, .36).children.forEach(m => m.frustumCulled = false);
  const wr = grp(el, 0, -L.fa); wr.rotation.order = 'YXZ';                                                  // forearm turn, wrist bend, wrist side-tilt
  // four fingers, three joints each; a two-joint thumb on the forward edge of the palm
  const tips = [], fingers = [[2.62, 7], [.9, 7.8], [-.82, 7.3], [-2.45, 5.9]].map(([x, len], i) => {
    let g = grp(wr, x, -8, 0); g.rotation.z = (1.5 - i) * 2 * R;
    const segs = [.46, .3, .24].map((f, k) => { const seg = g, r = (1.04 - .08 * k) * (i === 3 ? .88 : 1);
      part(lathe(len * f, [[0, r], [1, r * .9]], { sz: .92, capA: .9, capB: k === 2 ? 1 : .9, seg: 14 }), PAL.skin, gid, seg, .28);
      g = grp(seg, 0, -len * f); return seg; });
    tips.push(g); return segs;
  });
  const t0 = grp(wr, 2.9, -1.4, -s * .7); part(lathe(4.4, [[0, 1.75], [1, 1.45]], { seg: 14 }), PAL.skin, gid, t0, .28);
  const t1 = grp(t0, 0, -4.4); part(lathe(3.5, [[0, 1.4], [1, 1.12]], { seg: 14 }), PAL.skin, gid, t1, .28);
  tips.push(grp(t1, 0, -3.5), wr, el);
  return { sh, el, wr, fingers, t0, t1, s, tips, skin, qs: new THREE.Quaternion(), qe: new THREE.Quaternion(), qw: new THREE.Quaternion(), tg: V3(), miss: 0 };
}
/* Trainer, sculpted in cross-sections from heel to toe (ankle space: the mat is at y = -8, toes point +x).
   Upper: heel counter, collar just under the ankle, tongue, low rounded toe box. Sole: a separate slab, a touch wider, curling up
   at the toe. When the heel lifts, both bend in a smooth crease across the ball of the foot and the toe section stays on the mat. */
const SHOE = { x0: -8.6, len: 28, cols: 30, rows: 40 }, pw = (v, e) => Math.sign(v) * Math.abs(v) ** e;
const SW = [[0, 0], [.03, 2.5], [.14, 3.8], [.34, 4.2], [.58, 4.8], [.76, 4.8], [.9, 3.8], [.97, 2.2], [1, 0]];           // half-width along the foot
const SHT = [[0, 3.4], [.07, 6.2], [.2, 6.9], [.33, 7.3], [.46, 5.6], [.6, 4.1], [.78, 3.2], [.92, 2.5], [1, .5]];        // height of the upper above the sole
const soleLow = t => 1.5 * Math.max(0, (t - .74) / .26) ** 2 + .5 * Math.max(0, (.1 - t) / .1) ** 2, soleThick = t => 2.5 - .8 * t;
function loft(rows, cols, fn) {
  const pos = [], idx = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i < cols; i++) pos.push(...fn(j / rows, i / cols * Math.PI * 2));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const p0 = j * cols + i, p1 = j * cols + (i + 1) % cols, p2 = p0 + cols, p3 = p1 + cols; idx.push(p0, p1, p2, p1, p3, p2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = (rows >> 1) * cols + (cols >> 2), n = g.attributes.normal;                      // a vertex on top of the middle ring must face up
  if (n.getY(m) < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } g.setIndex(idx); g.computeVertexNormals(); }
  g.userData.rest = g.attributes.position.array.slice(); return g;
}
function shoeGeo(sole) {
  return loft(SHOE.rows, SHOE.cols, (t, a) => { const W = Math.max(0, prof(SW, t)), x = SHOE.x0 + SHOE.len * t, lo = soleLow(t), th = soleThick(t), c = Math.cos(a), sn = Math.sin(a);
    if (sole) return [x + (t < .5 ? -.25 : .35) * Math.min(1, W / 2.4), lo + th / 2 + th / 2 * pw(sn, .45) - 8, (W * 1.05 + .32 * Math.min(1, W / 2.4)) * pw(c, .5)];      // the sole ends with the shoe: no rim sticking out past the heel or the toe
    const yb = lo + th - .5, top = lo + th + Math.max(.3, prof(SHT, t));
    return [x, (sn >= 0 ? yb + (top - yb) * sn ** .8 : yb) - 8, W * pw(c, sn >= 0 ? .72 : 1)]; });
}
const BALL = [11.6, -7.4];                                       // toe joint, in ankle space
function bendShoe(g, ang) {
  const P = g.attributes.position, r = g.userData.rest;
  for (let i = 0; i < P.count; i++) { const x = r[i * 3], y = r[i * 3 + 1], t = clamp((x - 7.4) / 7.6, 0, 1), a = t * t * (3 - 2 * t) * ang, dx = x - BALL[0], dy = y - BALL[1];
    P.setXY(i, BALL[0] + dx * Math.cos(a) - dy * Math.sin(a), BALL[1] + dx * Math.sin(a) + dy * Math.cos(a)); }
  P.needsUpdate = true; g.computeVertexNormals();
}
function barefootGeo(s) {                                       // heel to ball of the foot; inner (big-toe) side fuller, a raised arch on the inside
  const FW = [[0, 0], [.04, 2.4], [.2, 3], [.5, 3.3], [.8, 4.4], [.94, 4.5], [1, 3.2]], FH = [[0, 2.6], [.1, 4.6], [.3, 6.6], [.5, 5.4], [.75, 3.2], [.92, 2.5], [1, 2.1]];
  return loft(30, 26, (t, a) => { const x = -7.4 + 19.2 * t, W = Math.max(0, prof(FW, t)), Hh = prof(FH, t), c = Math.cos(a), sn = Math.sin(a), inner = c * -s > 0 ? 1.08 : .94;
    const arch = sn < 0 ? 1.3 * Math.exp(-(((t - .5) / .18) ** 2)) * clamp(-c * s, 0, 1) : 0;
    return [x, -8 + (sn >= 0 ? Hh * sn ** .75 : 0) + arch + .9 * (1 - Math.abs(c)) * (sn < 0 ? 0 : 0), W * inner * pw(c, sn >= 0 ? .7 : .45)]; });
}
function makeLeg(s) {
  const gid = s > 0 ? G.legR : G.legL, hip = grp(root, 0, 0, s * 8.6);
  part(lathe(L.thigh, [[0, 8.2], [.2, 9.2], [.62, 7.7], [1, 6]], { sx: 1.05, sz: .94, capA: .3 }), PAL.hip, gid, hip);
  part(ell(7.2, 1, 1.5, .92), PAL.hip, gid, hip).position.set(-2, -9.5, 0);
  const kn = grp(hip, 0, -L.thigh);
  part(lathe(L.shin - 2.5, [[0, 6], [.3, 6.9], [.75, 4.7], [1, 4.2]], { capB: .15 }), PAL.leg, gid, kn);
  part(ring(4.2, .5), PAL.cuff, gid, kn, 0).position.y = -L.shin + 2.5;
  const an = grp(kn, 0, -L.shin);
  const sock = part(lathe(6.5, [[0, 3.95], [1, 3.6]], { capA: .2, capB: .8 }), PAL.shoe, gid, kn, 0); sock.position.y = -L.shin + 3.6;           // sock: part of the lower leg, so the ankle stays clean when the foot points
  const shoes = [shoeGeo(false), shoeGeo(true)], shod = [sock];
  shod.push(part(shoes[0], PAL.shoe, gid, an, .34), part(shoes[1], PAL.sole, gid, an, .3));
  shod.push(part(ell(1.5, .4, 1.5, 1.25), PAL.top, gid, an, 0)); shod[3].position.set(-8.05, -1.2, 0);                                            // heel tab
  // Bare foot: heel, arch and ball sculpted in one piece (bending at the ball like the shoe), five toes on their own joint at the
  // ball of the foot so they stay on the floor when the heel lifts, and a skin-coloured ankle in place of the sock.
  const bareG = barefootGeo(s); shoes.push(bareG);
  const bare = grp(an); bare.visible = false; part(bareG, PAL.skin, gid, bare, .3);
  const toes = grp(bare, BALL[0] - .6, -8, 0);
  [[3.1, 4.4, 1.55], [1.15, 3.9, 1.18], [-.55, 3.5, 1.08], [-2.05, 3.1, .98], [-3.35, 2.6, .88]].forEach(([z, len, r], i) => {
    const t = grp(toes, -.2 * i, r, -s * z); t.rotation.y = s * (i - 1) * 2.5 * R;
    const g = new THREE.CapsuleGeometry(r, len - 2 * r, 4, 10); g.rotateZ(-Math.PI / 2); g.translate(len / 2, 0, 0); g.scale(1, .82, 1);
    part(g, PAL.skin, gid, t, .26); });
  const ankleSkin = part(lathe(6.5, [[0, 3.75], [1, 3.4]], { capA: .2, capB: .8 }), PAL.skin, gid, kn, .3); ankleSkin.position.y = -L.shin + 3.6; ankleSkin.visible = false;
  [.36, .43, .5].forEach(t => { const lace = new THREE.CapsuleGeometry(.34, Math.max(.5, prof(SW, t)) * 1.05, 4, 8); lace.rotateX(Math.PI / 2);
    const lg = part(lace, PAL.sole, gid, an, 0); lg.position.set(SHOE.x0 + SHOE.len * t, soleThick(t) + prof(SHT, t) - 8 - .05, 0); shod.push(lg); });           // laces across the instep
  return { hip, kn, an, s, shoes, shod: [...shod], bare: [bare, ankleSkin], toes, heel: 0, tg: V3() };
}
const arms = [makeArm(1), makeArm(-1)], legs = [makeLeg(1), makeLeg(-1)];
/* Kneeling feet. Two real positions, both solved from the shoe's own shape:
   - toes tucked: heel up over the ball of the foot (TUCK degrees), the shoe creasing at the toes;
   - foot released: the foot points back and down, about 45 degrees of ankle point (inside the ankle's range), toe cap resting on
     the mat. The ankle height is computed so the lowest point of the shoe touches the mat exactly. */
const KNEE_Y = 6.4, TUCK = 65, KPITCH = 220 * R;
const KN = (() => { const sn = Math.sin(KPITCH), cs = Math.cos(KPITCH); let low = 0;
  legs[0].shoes.forEach(g => { const r = g.userData.rest; for (let i = 0; i < r.length; i += 3) low = Math.min(low, r[i] * sn + r[i + 1] * cs); });
  const ankleY = -low + .05, th = TUCK * R, tuckY = 1 + 11.6 * Math.sin(th) + 7 * Math.cos(th), fw = 11.6 - 11.6 * Math.cos(th) + 7 * Math.sin(th);
  return { ankleY, back: Math.sqrt(L.shin ** 2 - (ankleY - KNEE_Y) ** 2), toe: V3(cs, sn, 0), up: V3(-sn, cs, 0), fx: knX => knX - Math.sqrt(L.shin ** 2 - (tuckY - KNEE_Y) ** 2) - fw }; })();

/* ---------- floor: mat, ground disc and a soft contact shadow ---------- */
const flat = c => { const m = new THREE.Mesh(undefined, new THREE.MeshBasicMaterial({ color: c })); m.renderOrder = -2; scene.add(m); return m; };
const disc = flat(0xEFDCCB); disc.geometry = new THREE.CircleGeometry(95, 72); disc.rotation.x = -Math.PI / 2; disc.position.y = -2.6;
/* The mat is its own solid object, separate from the figure: a rounded slab with real thickness, in a colour that is not skin.
   Its top surface is MAT_TOP; every floor rule (feet, knees, hands, elbows) is measured against that one surface. */
const MAT_TOP = 0, MAT = { len: 210, wid: 62, thick: 2.4, x: -36 };
const matG = new THREE.Group(); matG.position.set(MAT.x, MAT_TOP, 0); scene.add(matG);
{ const sh = new THREE.Shape(), w = MAT.len / 2, h = MAT.wid / 2, r = 5;
  sh.moveTo(-w + r, -h); sh.lineTo(w - r, -h); sh.quadraticCurveTo(w, -h, w, -h + r); sh.lineTo(w, h - r); sh.quadraticCurveTo(w, h, w - r, h); sh.lineTo(-w + r, h); sh.quadraticCurveTo(-w, h, -w, h - r); sh.lineTo(-w, -h + r); sh.quadraticCurveTo(-w, -h, -w + r, -h);
  const slab = new THREE.ExtrudeGeometry(sh, { depth: MAT.thick, bevelEnabled: false, curveSegments: 10 }); slab.rotateX(Math.PI / 2);      // top face at y = 0, body below it
  const m = new THREE.Mesh(slab, [new THREE.MeshBasicMaterial({ color: 0xA9BE9B }), new THREE.MeshBasicMaterial({ color: 0x8CA47F })]); m.renderOrder = -2; matG.add(m);
  const lip = new THREE.Mesh(new THREE.ShapeGeometry(sh, 10), new THREE.MeshBasicMaterial({ color: 0xB7CAAA })); lip.rotation.x = -Math.PI / 2; lip.scale.set(.965, .92, 1); lip.position.y = .015; lip.renderOrder = -2; matG.add(lip); }

// Checks that need no browser:  node tools/test.mjs   (npm test)
//   1. pictures and animation: every exercise renders, joints stay inside human ranges, nothing jumps between frames,
//      planted hands and feet stay planted, every figure rests on the floor, no shoe goes through it
//   2. exercise content: doses inside published ranges, every exercise complete, safety lists consistent
// The medical checks encode general published guidance (ACSM stretching and resistance-training guidelines, and the
// sources the app itself cites). Passing them means the app is consistent with that guidance, not that a clinician
// has reviewed it.
import fs from 'node:fs';
const read = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const src = ['js/kinematics.js', 'js/data/muscles.js', 'js/data/postures.js', 'js/data/stretches.js', 'js/data/strength.js', 'js/data/breathing.js', 'js/data/regions.js', 'js/data/stages.js', 'js/data/coaching.js', 'js/data/mindful.js', 'js/illus.js', 'js/data/women.js'].map(read).join('\n;\n');
const G = new Function(src + '; return { MUSCLE, STRETCHES, STRENGTH, WARMUP, COACH, ILLUS, STAGES, BREATH, W_SUPINE, W_PRONE, W_ABLOAD, W_DEEP, W_PRESSURE, OSTEO_AVOID, adaptRules, STRENGTH_BY };')();
G.STRETCH_BY = Object.fromEntries(G.STRETCHES.map(s => [s.id, s]));
const { MUSCLE, STRETCHES, STRENGTH, WARMUP, COACH, ILLUS: I, STAGES } = G;
const fails = [], notes = []; let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) fails.push(msg); };
const norm = a => ((a % 360) + 540) % 360 - 180;
const ALL = [...STRETCHES, ...STRENGTH], illOf = x => x.ill, FLOOR = 93.7;

/* ---------- 1. pictures and animation ---------- */
const shoeLow = (K, A, T) => { const dx = T[0] - A[0], dy = T[1] - A[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l; let nx = -uy, ny = ux; if (nx * (K[0] - A[0]) + ny * (K[1] - A[1]) > 0) { nx = -nx; ny = -ny; }
  const q = (t, n) => A[1] + uy * t + ny * n; return Math.max(q(-1.9, -2), q(-3.3, .4), q(-3, 2.7), q(l + 2.4, 2.7), q(l + 3.3, 1.5), q(l + 1.4, -.5), q(2.6, -2.4), q(1, -2.5)) + 1; };
// joint ranges in degrees, generous on purpose: the aim is to catch impossible poses, not to police style
// poses where a limb is turned out of the picture plane, so its side-on angle is not the joint angle
const OUT_OF_PLANE = { figure4: ['knee2', 'hip2'], 'knee-opp': ['knee2', 'hip2'] };
const RANGE = { knee: [-8, 160], hip: [-40, 160], neck: [-65, 75], elbow: [-12, 165], ankle: [-50, 95] };
const joints = g => { const p = g.p, o = { knee: norm(p.sh - p.th), hip: norm(180 - (p.th - p.tr)), neck: norm(p.nk - p.tr), elbow: norm(p.ua - p.fa) };
  o.ankle = norm(Math.atan2(g.T[1] - g.A[1], g.T[0] - g.A[0]) * 180 / Math.PI - (Math.atan2(g.A[1] - g.K[1], g.A[0] - g.K[0]) * 180 / Math.PI - 90));
  if (g.K2) { o.knee2 = norm(p.sh2 - p.th2); o.hip2 = norm(180 - (p.th2 - p.tr)); } return o; };
const sideView = (ill, id) => !I.isFront(ill, id);
const poseChecks = (label, o) => { const g = I.geo({ ...o }); if (g.p.top) return g;
  for (const [k, v] of Object.entries(joints(g))) { const r = RANGE[k.replace('2', '')]; if ((OUT_OF_PLANE[label.split(' ')[0]] || []).includes(k)) continue; ok(v >= r[0] && v <= r[1], `${label}: ${k} at ${v.toFixed(0)}° is outside ${r[0]}..${r[1]}°`); }
  if (!g.p.prop) ok(Math.abs(g.low - FLOOR) < .35, `${label}: figure is ${(FLOOR - g.low).toFixed(1)} off the floor`);
  for (const [K, A, T, n] of [[g.K, g.A, g.T, 'foot'], [g.K2, g.A2, g.T2, 'second foot']]) if (A) ok(shoeLow(K, A, T) <= FLOOR + (g.p.prop ? 2.2 : .7), `${label}: ${n} is ${(shoeLow(K, A, T) - FLOOR).toFixed(1)} below the floor`);
  return g; };
const badSvg = s => /NaN|undefined|Infinity/.test(s) || (s.match(/<[a-z][^>]*>/g) || []).some(tag => { const n = (tag.match(/\s([a-zA-Z:-]+)=/g) || []).map(x => x.trim()); return new Set(n).size !== n.length; });
for (const fm of [false, true]) { I.setFemale(fm);
  for (const x of [...ALL, ...WARMUP.map(w => ({ id: w.id, ill: (I.MOVES[w.id] || {}).ill || 'stand' }))]) for (const u of [0, .5, 1]) for (const mirror of [false, true]) ok(!badSvg(I.svg(x.ill, null, { ex: x.id, u, mirror, slice: true })), `${x.id}: picture does not render cleanly (u=${u})`);
} I.setFemale(false);
for (const x of ALL) { ok(!!I.T[x.ill] || I.isFront(x.ill, x.id), `${x.id}: no picture named "${x.ill}"`); if (I.T[x.ill] && sideView(x.ill, x.id)) poseChecks(x.id, I.T[x.ill]); }
const ILL = Object.fromEntries(ALL.map(x => [x.id, x.ill]));
for (const [id, mv] of Object.entries(I.MOVES)) { const ill = mv.ill || ILL[id] || (I.T[id] ? id : 'stand'); if (mv.rig || !sideView(ill, id)) { for (let k = 0; k <= 20; k++) ok(!badSvg(I.svg(ill, null, { ex: id, u: k / 20 })), `${id}: front-view frame ${k} does not render`); continue; }
  const N = 60, pts = g => [g.H, g.S, g.E, g.W, g.K, g.A, g.T, g.K2, g.A2, g.T2].filter(Boolean); let prev = null, maxStep = 0, first = null;
  const tempo = mv.tempo || [1.5, .5, 2.5, .5], fastest = Math.min(tempo[0], tempo[2] || tempo[0]);
  for (let k = 0; k <= N; k++) { const u = k / N, g = poseChecks(`${id} @${u.toFixed(2)}`, I.animPose(ill, mv, u, 0, u)), P = pts(g);
    if (prev) maxStep = Math.max(maxStep, ...P.map((q, i) => Math.hypot(q[0] - prev[i][0], q[1] - prev[i][1]))); prev = P; if (!first) first = P; }
  ok(maxStep < 4.2, `${id}: a joint jumps ${maxStep.toFixed(1)} units between two frames (should glide)`);
  if (mv.spin || mv.circle) { const d = Math.max(...prev.map((q, i) => Math.hypot(q[0] - first[i][0], q[1] - first[i][1]))); ok(d < 1.5, `${id}: the loop does not close (end is ${d.toFixed(1)} from start)`); }
  if (mv.alt) { const a = pts(I.geo(I.animPose(ill, mv, 0, 0, 0))), b = pts(I.geo(I.animPose(ill, mv, 0, 1, 0))), body = [0, 1].map(i => Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1])); ok(Math.max(...body) < .6, `${id}: body jumps when the sides swap`); }
  if (mv.pin) { const base = I.geo(I.animPose(ill, mv, 0, 0, 0)); for (const u of [.25, .5, .75, 1]) { const g = I.geo(I.animPose(ill, mv, u, 0, u));
      const dY = g.H[1] - I.geo(I.animPose(ill, mv, u, 0, u), true).H[1], b0 = base.H[1] - I.geo(I.animPose(ill, mv, 0, 0, 0), true).H[1];      // compare in the un-grounded frame
      if (mv.pin.includes('foot')) ok(Math.hypot(g.A[0] - base.A[0], (g.A[1] - dY) - (base.A[1] - b0)) < .8, `${id} @${u}: the planted foot moved`);
      if (mv.pin.includes('knee2') && g.K2) ok(Math.hypot(g.K2[0] - base.K2[0], (g.K2[1] - dY) - (base.K2[1] - b0)) < .8, `${id} @${u}: the kneeling knee moved`);
      if (mv.pin.includes('foot2') && g.A2) ok(Math.hypot(g.A2[0] - base.A2[0], (g.A2[1] - dY) - (base.A2[1] - b0)) < .8, `${id} @${u}: the planted back foot moved`);
      if (mv.pin.includes('hand')) ok(Math.hypot(g.W[0] - base.W[0], (g.W[1] - dY) - (base.W[1] - b0)) < .8, `${id} @${u}: the planted hand moved`); } }
  ok(fastest >= (id === 'walk' || /march/.test(id) || id === 'monster' || id === 'leg-swing' ? .4 : 1), `${id}: moves in ${fastest}s, too fast to be controlled`);
}

/* ---------- 2. exercise content ---------- */
const has = id => !!(G.STRETCH_BY[id] || G.STRENGTH_BY[id]);
for (const x of ALL) {
  ok(x.how && x.how.length >= 25, `${x.id}: instruction text missing or too short`); ok(x.cue && x.cue.length >= 10, `${x.id}: coaching cue missing`);
  ok(Array.isArray(x.m) && x.m.length > 0 && x.m.every(i => MUSCLE[i]), `${x.id}: lists a muscle that does not exist (${(x.m || []).filter(i => !MUSCLE[i])})`);
  if (x.feel) ok(x.feel.every(i => MUSCLE[i]), `${x.id}: "feel it" lists a muscle that does not exist`);
  const c = COACH[x.id]; ok(c && c.focus.length >= 2 && c.avoid.length >= 2, `${x.id}: needs at least two "focus on" and two "avoid" points`);
  ok([1, 2].includes(x.sides), `${x.id}: sides must be 1 or 2`);
}
for (const s of STRETCHES) { // ACSM: static stretches held 10 to 30 s (up to 60 s), 2 to 4 repetitions, about 60 s in total per muscle
  if (s.type === 'static') { ok(s.hold >= 15 && s.hold <= 60, `${s.id}: static hold of ${s.hold}s is outside 15..60s`); ok(s.reps >= 1 && s.reps <= 4, `${s.id}: ${s.reps} repetitions of a static stretch (expected 1..4)`);
    const tot = s.hold * s.reps; ok(tot >= 30 && tot <= 120, `${s.id}: ${tot}s of stretch per side in total (expected 30..120s)`); }
  else ok((s.hold || 0) <= (s.type === 'release' ? 120 : 30) && s.reps >= 1 && s.reps <= 20, `${s.id}: mobility dose looks wrong (hold ${s.hold}, reps ${s.reps})`);
  if (s.m.some(i => i === 'scm' || i === 'scalenes') && s.type === 'static') ok(s.hold <= 20, `${s.id}: front-of-neck stretches are capped at 20s (hold is ${s.hold}s)`);
}
for (const s of STRENGTH) { // ACSM: 1 to 4 sets; 8 to 15 repetitions for control and endurance work; isometric holds kept short
  ok(s.sets >= 1 && s.sets <= 4, `${s.id}: ${s.sets} sets (expected 1..4)`); ok([1, 2, 3].includes(s.level), `${s.id}: level must be 1, 2 or 3`);
  if (s.reps === 1) ok(s.hold >= 5 && s.hold <= 60, `${s.id}: a single hold of ${s.hold}s (expected 5..60s)`);
  else { ok(s.reps >= 5 && s.reps <= 15, `${s.id}: ${s.reps} repetitions (expected 5..15)`); ok((s.hold || 0) <= 10, `${s.id}: each repetition held ${s.hold}s (expected 10s or less)`); }
  const work = s.reps === 1 ? s.hold * s.sets : s.reps * ((s.hold || 0) + 3) * s.sets; ok(work * (s.sides || 1) <= 420, `${s.id}: about ${Math.round(work * s.sides / 60)} minutes of work, too long for one exercise`);
}
for (const [name, list] of Object.entries({ W_SUPINE: G.W_SUPINE, W_PRONE: G.W_PRONE, W_ABLOAD: G.W_ABLOAD, W_DEEP: G.W_DEEP, W_PRESSURE: G.W_PRESSURE, OSTEO_AVOID: G.OSTEO_AVOID })) for (const id of list) ok(has(id), `${name} names "${id}", which is not an exercise`);
// pregnancy from 16 weeks: anything drawn lying flat on the back or the front must be left out of the plan
const preg2 = G.adaptRules({ sex: 'f', w: { now: ['preg'], tri: 2, sym: [] } }, {}).exclude;
for (const x of ALL) { const t = I.T[x.ill]; if (!t || !sideView(x.ill, x.id) || t.prop === 'bed' || t.prop === 'bench') continue; const p = { hx: 70, hy: 53, tr: -90, th: 90, ...t }, flat = Math.abs(Math.sin(p.tr * Math.PI / 180)) < .3 && p.hy >= 76;
  if (flat) ok(preg2.has(x.id), `${x.id}: drawn lying flat on the ${Math.cos(p.tr * Math.PI / 180) < 0 ? 'back' : 'front'}, but still offered from 16 weeks of pregnancy`); }
for (const id of ['prone-T', 'prone-W', 'supine-twist', 'curl-up', 'plank']) ok(preg2.has(id), `${id}: must be left out from 16 weeks of pregnancy`);
const osteo = G.adaptRules({ sex: 'm', osteo: true }, {}).exclude; for (const id of G.OSTEO_AVOID) ok(osteo.has(id), `${id}: on the osteoporosis list but not excluded by the rules`);
// osteoporosis: loaded or sustained forward rounding of the spine, and end-range twists, must be left out (Royal Osteoporosis Society)
for (const x of ALL) if (/round the (upper |lower )?back|chin to the chest|let the head hang|lower the trunk over|knees? (toward|to) the chest|chest toward the thigh/i.test(x.how)) ok(G.OSTEO_AVOID.includes(x.id), `${x.id}: the instruction bends the spine forward, but it is not on the osteoporosis list`);
// stages: each stage allows at least as much as the one before, and stage 1 stays gentle
ok(STAGES[0].level === 1 && STAGES[0].stretchHold <= 20, 'stage 1 must be level 1 with stretches of 20s or less'); for (let i = 1; i < 3; i++) ok(STAGES[i].level >= STAGES[i - 1].level, `stage ${i + 1} is easier than stage ${i}`);
for (const [id, mv] of Object.entries(I.MOVES)) if (mv.tempo) ok(mv.tempo.reduce((a, b) => a + b, 0) >= .9, `${id}: one repetition takes under a second`);

console.log(`${checks} checks, ${fails.length} failed`); if (fails.length) { const seen = new Set(); for (const f of fails) { const k = f.replace(/@[\d.]+/, '@'); if (seen.has(k)) continue; seen.add(k); console.log('  FAIL  ' + f); } process.exit(1); }

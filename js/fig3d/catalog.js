/* Catalogue: every exercise of the app as a 3D move, keyed by the app's own exercise id.
   A move is P(u, phase, cycle): u runs from 0 (start position) to 1 (end position) and is driven by the app's rep clock, so the
   figure and the count always agree. A move returns only the channels that differ from the base pose of its position; joint
   limits, balance, contact with the mat and props, and the no-crossing rules are applied by the engine and checked by the test.
   Two-sided moves are written for the right side; the app mirrors the picture for the left. */
const mx = (a, b, u) => a + (b - a) * u, sm = smoother, sin = Math.sin, cos = Math.cos, PI = Math.PI;
const first = (u, k = 1.25) => clamp(u * k, 0, 1), then = (u, a = .35) => sm((u - a) / (1 - a));      // hands go first, the stretch follows
const C = (id, label, def) => { def.label = label; if (!def.period && !def.cont && (def.hold || /first\(|then\(/.test(String(def.P)))) def.period = 11; EX[id] = def; };      // stretches that are set up and then held use the slow timing
const GRIP = { curlR: .8, curlL: .8, wri: 0 };
const WALL = x => [x, x + 4, 0, 200, -46, 46, 'wall'];
const POST = (x, z = 0, h = 205) => [x, x + 5, 0, h, z - 26, z + 26, 'wall'];                      // a piece of wall in front, with an anchor plate fixed to it: something made to be pulled on
const SIDEWALL = (z, x = 8, h = 205, w = 26) => z < 0 ? [x - w, x + w, 0, h, z - 5, z, 'wall'] : [x - w, x + w, 0, h, z, z + 5, 'wall'];      // the same, beside the body
const RAIL = (z, y = 100, x0 = -34, x1 = 34) => [[x0, x1, y - 3, y, z - 1.6, z + 1.6, 'wood'], [x0, x0 + 4, 0, y - 3, z - 2, z + 2, 'wood'], [x1 - 4, x1, 0, y - 3, z - 2, z + 2, 'wood']];      // a rail to hold for balance

/* ---------- standing ---------- */
const squatP = d => u => { const s = u * d; return { footZ: 13.5, toe: 16, hipX: -25 * s, hipY: 93 - 52 * s, pel: 2 + 34 * s, lum: 8 * s, che: -2 - 3 * s, nec: -14 * s, hea: -8 * s,
  flexR: 3 + 79 * u, flexL: 3 + 78 * u, abdR: 5 - 2 * u, abdL: 5 - 2 * u, elbR: 9 + 5 * u, elbL: 9 + 5 * u, wri: 3 - 3 * u, proR: 14 + 50 * u, proL: 14 + 50 * u, curlR: .3 - .14 * u, curlL: .3 - .14 * u }; };
C('rest', 'Rest', { yaw: 20, P: u => ({ breath: u, shrR: -.12 * u, shrL: -.12 * u }) });
/* Shake it out, between sets: stand tall, shoulders let go, arms hanging a little away from the body; the hands and forearms shake loosely
   (wrists flop, elbows give a little), slightly out of step with each other, while the breath slows. Gentle on purpose: a loose shake, not a flap. */
C('shake', 'Shake it out', { yaw: 25, shake: true, P(u, ph, cyc, t = 0) { const w = TAU * 3.1 * t, a = sin(w), b = sin(w * 1.07 + 1.3), env = .75 + .25 * sin(TAU * t / 3.7);
  return { breath: u, abdR: 13, abdL: 13, flexR: 6 + 2.5 * a * env, flexL: 6 + 2.5 * b * env, elbR: 20 + 6 * a * env, elbL: 20 + 6 * b * env, wfR: 16 * sin(w - .9) * env, wfL: 16 * sin(w * 1.07 + .4) * env, proR: 30 + 9 * sin(w * .5), proL: 30 + 9 * sin(w * .5 + 1),
    curlR: .22, curlL: .22, wri: 0, shrR: -.1 + .05 * a * env, shrL: -.1 + .05 * b * env, hipY: 93.5 - .35 * (.5 + .5 * sin(w * .5)) }; } });
/* Marching on the spot. Stand tall, eyes forward. One knee lifts until the thigh is level with the hip, the shin hanging just behind
   the knee and the foot relaxed, toes a little down; the body's weight moves over the standing foot (the balance solver does that,
   exactly). The arms swing like a walker's, elbows at about a right angle: the arm opposite the lifting knee comes forward, the
   other goes back, forearms carried just outside the thighs so nothing brushes. The foot comes back down flat and quietly. */
const marchLeg = (a, R_) => R_ ? { liftR: 43.6 * a, fxR: 37 * a, freeR: ramp(.08, .5, a), ankR: 14 * a, wR: 1 - ramp(0, .5, a) } : { liftL: 43.6 * a, fxL: 37 * a, freeL: ramp(.08, .5, a), ankL: 14 * a, wL: 1 - ramp(0, .5, a) };
/* The arms never stop and start: they swing in one continuous wave across the steps (w runs from -1 to 1 and back over two steps),
   forward to about chest height with the elbow folding a little more, back past the hip with it opening; the chest turns a few
   degrees with them and the shoulders ride along, the way a person marches when they are relaxed. */
const marchArms = w => { const f = Math.max(0, w), b = Math.max(0, -w);
  return { flexL: 4 + 40 * f - 30 * b, flexR: 4 + 40 * b - 30 * f, elbL: 78 + 20 * f - 14 * b, elbR: 78 + 20 * b - 14 * f, abdR: 13, abdL: 13, rotR: -10, rotL: -10, proR: 4, proL: 4, curlR: .5, curlL: .5, wri: 0,
    cheT: -5 * w, headT: 2.5 * w, shFL: .35 * w, shFR: -.35 * w }; };
C('wu-march', 'March on the spot', { yaw: 28, P(u, ph, cyc) { const r = cyc % 2 === 0, a = r ? u : 0, b = r ? 0 : u;
  const w = sin(PI * (cyc + ph));      // one wave for the whole body: arms, chest and the small sway over the standing foot all ride on it, so nothing starts or stops
  return { bal: 0, footZ: 6.5, toe: 5, che: -3, nec: -1, ...marchLeg(a, true), ...marchLeg(b, false), ...marchArms(w) }; } });      // cyc even: the right knee lifts and the wave is positive (left arm forward); cyc odd: the other way round
C('march', 'Standing hip flexion march', { yaw: 28, P: u => ({ bal: 0, footZ: 6.5, toe: 5, che: -3, nec: -1, ...marchLeg(u, true), ...marchArms(u) }) });
/* The picture on the home screen: the coach in mid-stride, tall and easy, looking where they are going. */
C('hero', 'Coach', { yaw: 26, pitch: 5, tu: 1, bare: true, P: () => ({ fxR: 27, fxL: -27, heelL: 44, tuR: 13, wR: 1, wL: 1, hipY: 90.5, pel: 3, che: -5, nec: -3, hea: -3, headT: 16,
  flexL: 34, flexR: -26, elbL: 52, elbR: 26, abdR: 9, abdL: 9, rotL: -8, proR: 10, proL: 6, curlR: .35, curlL: .35, cheT: -8, shFL: .5, shFR: -.5, breath: .5 }) });
C('walk', 'Easy walk', { yaw: 20, nomat: true, cont: true, period: 1.3, P(u, ph) { const s = sin(TAU * ph), c = cos(TAU * ph);
  return { fxR: 15 * s, fxL: -15 * s, liftR: 5 * Math.max(0, c), liftL: 5 * Math.max(0, -c), wR: 1 - .45 * Math.max(0, c) ** 2, wL: 1 - .45 * Math.max(0, -c) ** 2, flexL: 3 + 16 * s, flexR: 3 - 16 * s, elbR: 24, elbL: 24, curlR: .45, curlL: .45 }; } });
C('wu-swing', 'Arm swings and shoulder rolls', { yaw: 25, P: u => ({ flexR: -28 + 200 * u, flexL: -28 + 199 * u, elbR: 8, elbL: 8, abdR: 6, abdL: 6, proR: 14 - 14 * u, proL: 14 - 14 * u, curlR: .25, curlL: .25, che: -2 - 3 * u }) });
C('shoulder-roll', 'Shoulder rolls', { yaw: 25, focus: 'head', cont: true, period: 2.5, P(u, ph) { const a = TAU * ph; return { shrR: .5 - .5 * cos(a), shrL: .5 - .5 * cos(a), shFR: sin(a), shFL: sin(a), che: -2 - 3 * sin(a) * (a > PI ? 1 : 0) }; } });      // a backward roll: forward, up, back, down
C('wu-hip', 'Hip circles', { yaw: 62, pitch: 12, cont: true, period: 3.2, P(u, ph, cyc) { const a = TAU * (cyc >= 5 ? -ph : ph), c = cos(a), s = sin(a);
  return { bal: 0, footZ: 16, toe: 12, hipX: 9 * c, hipZ: 9 * s, hipY: 92, pel: 2 - 9 * c, lum: 5 * c, pelS: -8 * s, lumS: 3 * s, necS: 3 * s,      // the pelvis draws a circle (forward, right, back, left); the trunk leans the other way, so the head stays over the feet
    ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRy: 103, hRz: 21.5, hLx: 1, hLy: 103, hLz: -21.5, proR: 60, proL: 60, curlR: .35, curlL: .35 }; } });
C('chin-tuck', 'Chin tuck', { yaw: 0, focus: 'head', P: u => ({ nec: mx(16, -5, u), hea: mx(-13, 9, u), che: mx(3, -2, u) }) });
C('uptrap', 'Upper trapezius stretch', { yaw: 90, focus: 'head', P(u) { const hand = first(u), s = then(u);
  return { necS: -36 * s, nec: 6 * s, hea: 4 * s, cheS: 2 * s, ikL: 1, hLx: 2, hLy: 85, hLz: -22, proL: 0,
    hLhead: hand, hLhx: HC[0] - .5, hLhy: HC[1] + 12.6, hLhz: -4.5, eoL: sm(hand), holdL: sm(hand), curlL: .3 - .1 * hand, abdR: 5 + 3 * s, flexR: 3 - 8 * s, curlR: .3, wri: 3 - 6 * s }; } });
C('scalene', 'Scalene stretch', { yaw: 90, focus: 'head', P: u => ({ necS: -30 * u, hea: -8 * u, nec: -6 * u, headT: 10 * u, flexR: 3 - 16 * u, abdR: 5 + 4 * u, rotR: 20 * u }) });
C('levator', 'Levator scapulae stretch', { yaw: 62, focus: 'head', P(u) { const hand = first(u), s = then(u);
  return { headT: -42 * s, nec: 30 * s, hea: 12 * s, necS: -8 * s, ikL: 1, hLx: 2, hLy: 85, hLz: -22, proL: 0,
    hLhead: hand, hLhx: HC[0] - 6.5, hLhy: HC[1] + 10.8, hLhz: -2, eoL: sm(hand), holdL: sm(hand), curlL: .2, flexR: 3 - 10 * s }; } });
C('scm', 'Sternocleidomastoid stretch', { yaw: 90, focus: 'head', P(u) { const h = first(u), s = then(u);
  return { necS: -20 * s, headT: 34 * s, nec: -12 * s, hea: -5 * s, ikR: h, hRx: 12.5, hRy: 127, hRz: 8, edR: 1, curlR: .15, proR: 30 }; } });      // the other hand anchors the collarbone; head tilts away, turns toward the stretched side, chin lifts a little
C('neck-ext', 'Neck extensor stretch', { clasp: true, yaw: 28, focus: 'head', P(u) { const hand = first(u), s = then(u), o = sm(hand);
  return { nec: 38 * s, hea: 14 * s, che: -2 + 4 * s, ikR: 1, ikL: 1, hRx: 2, hRy: 85, hRz: 22, hLx: 2, hLy: 85, hLz: -22, proR: 0, proL: 0,
    hRhead: hand, hLhead: hand, hRhx: HC[0] - 6.5, hRhy: HC[1] + 9, hRhz: 8.2, hLhx: HC[0] - 6.5, hLhy: HC[1] + 9, hLhz: -8.2, eoR: o, eoL: o, holdR: o, holdL: o, curlR: .15, curlL: .15 }; } });
C('jaw', 'Jaw release', { yaw: 90, focus: 'head', hold: true, P(u) { const h = first(u, 1.1);      // elbows down, hands up beside the face, fingertips resting on the jaw muscles just in front of the ears
  return { ikR: h, ikL: h, edR: 1, edL: 1, hRx: 17, hRy: mx(85, 147, h), hRz: mx(22, 12.5, h), hLx: 17, hLy: mx(85, 147, h), hLz: mx(-22, -12.5, h), proR: 0, proL: 0, wfR: -34 * h, wfL: -34 * h, curlR: .12, curlL: .12, wri: 0, hea: 2 * u }; } });
C('iso-neck', 'Isometric neck in four directions', { yaw: 25, focus: 'head', P(u) { const hand = first(u, 1.6), o = sm(hand);
  return { ikR: 1, hRx: 2, hRy: 85, hRz: 22, proR: 0, hRhead: hand, hRhx: HC[0] + 11.2, hRhy: HC[1] + 4.5, hRhz: 1.5, edR: o, holdR: o, curlR: .1, nec: -2 * u }; } });
const doorP = top => u => { const st = sm(u * 2.2), up = sin(PI * clamp(u * 2.2, 0, 1)), h = sm(clamp((u - .03) * 1.08, 0, 1)), s = then(u, .6);
  return { fxR: 15 * st, liftR: 5 * up, wR: 1 - sm(Math.min(1, up * 1.3)), hipX: 6 * st + 10 * s, heelL: 16 * s, che: -2 - 7 * s, lum: -3 * s, nec: 2 * s,
    hW: 1, ikR: h, ikL: h, plantWall: 1, plantR: sm(h * 1.6), plantL: sm(h * 1.6), edR: h, edL: h, curlR: .3 - .26 * h, curlL: .3 - .26 * h,
    hRx: .6 - 7 * (1 - h) ** 2, hRy: 85 + (top - 85) * h, hRz: 41 - 22 * (1 - h), hLx: .6 - 7 * (1 - h) ** 2, hLy: 85 + (top - 85) * h, hLz: -41 + 22 * (1 - h) }; };
C('doorway-low', 'Doorway chest stretch, elbows low', { props: { door: { x: 8 } }, yaw: 58, pitch: 12, hold: true, P: doorP(132) });
C('doorway-high', 'Doorway chest stretch, elbows high', { props: { door: { x: 8 } }, yaw: 58, pitch: 12, hold: true, P: doorP(146) });
const oneArmDoor = (y, turn) => u => { const h = sm(first(u)), s = then(u, .5);
  return { hipX: 5 * s, hipZ: 3, pelT: turn * s, cheT: turn * .4 * s, headT: turn * .5 * s, hW: 1, ikR: h, plantWall: 1, plantR: sm(h * 1.6), edR: h * .6, curlR: .3 - .26 * h,
    hRx: .6 - 7 * (1 - h) ** 2, hRy: 85 + (y - 85) * h, hRz: 41 - 10 * (1 - h), che: -2 - 4 * s }; };
C('wall-chest', 'Single-arm wall chest stretch', { props: { door: { x: 8 } }, yaw: 58, pitch: 12, hold: true, P: oneArmDoor(136, 26) });
C('biceps', 'Wall biceps stretch', { props: { door: { x: 8 } }, yaw: 58, pitch: 12, hold: true, P: oneArmDoor(124, 26) });
C('door-er', 'Doorway external rotation stretch', { props: { door: { x: 30 } }, yaw: 58, pitch: 12, hold: true, P(u) { const h = sm(first(u)), s = then(u, .5);      // elbow at the side bent to a right angle, forearm on the frame; the body turns away
  return { hipZ: 12, fzR: 21.6, fzL: -2.4, pelT: 14 * s, cheT: 6 * s, hW: 1, ikR: h, plantWall: 1, plantR: sm(h * 1.6), edR: h, curlR: .3 - .26 * h, hRx: 22.6 - 6 * (1 - h) ** 2, hRy: 85 + 22 * h, hRz: 41 - 8 * (1 - h) }; } });
C('hands-behind', 'Hands clasped behind the back', { yaw: 28, hold: true, P(u) { const h = first(u), s = then(u);      // arms long behind the back, hands together, lifting away from the body as the chest opens
  return { flexR: 3 - 34 * h - 10 * s, flexL: 3 - 34 * h - 10 * s, abdR: 4, abdL: 4, rotR: 24 * h, rotL: 24 * h, elbR: 9 - 4 * h, elbL: 9 - 4 * h, proR: 14 + 50 * h, proL: 14 + 50 * h, curlR: .5, curlL: .5, che: -2 - 6 * s, shFR: -s, shFL: -s, nec: -3 * s }; } });
C('cross-body', 'Cross-body shoulder stretch', { clasp: true, yaw: 75, pitch: 10, hold: true, P(u) { const h = sm(clamp(u / .5, 0, 1)), hl = sm(clamp((u - .42) / .5, 0, 1)), s = then(u, .6), out = 10 * sin(PI * h);      // the arm goes across first; only then does the other hand come up under it, so the two never meet on the way      // one arm long across the front of the chest at shoulder height; the other forearm comes up in front of it, just above the elbow, and draws it in
  return { ikR: h, hRx: 33 - 3 * s + out, hRy: 133, hRz: -22 - 2 * s, proR: 0, wfR: 0, curlR: .25, efR: h, ikL: hl, hLx: 23, hLy: 120.5 + s, hLz: -2, edL: 1, curlL: .3, proL: -40 }; } });      // the other hand cradles the arm from underneath, just above the elbow
C('hug', 'Self-hug upper-back stretch', { clasp: true, yaw: 75, pitch: 10, hold: true, P(u) { const h = first(u), s = then(u), out = 8 * sin(PI * h);      // arms crossed in front of the chest, each hand reaching for the opposite shoulder; the upper back rounds and the shoulder blades spread
  return { ikR: h, hRx: 27 + out, hRy: 139, hRz: -10, curlR: .3, edR: .8, ikL: h, hLx: 34 + out, hLy: 119, hLz: 5, edL: 1, curlL: .3, che: -2 + 12 * s, lum: 4 * s, nec: 10 * s, shFR: s, shFL: s }; } });
C('triceps', 'Overhead triceps stretch', { yaw: 62, pitch: 8, hold: true, P(u) { const h = first(u), s = then(u);      // the elbow points at the ceiling and the hand slides down between the shoulder blades. OPEN: the reference shows the other hand on the elbow, easing it back; that helping hand is not drawn yet (its path over the head still crosses the head)
  return { flexR: 3 + 165 * h, elbR: 9 + 126 * h + 8 * s, abdR: 5 + 9 * h, proR: 14 - 14 * h, curlR: .2, lumS: 2 * s, nec: 5 * s }; } });
C('wall-lat', 'Wall lat stretch', { props: { blocks: [WALL(62)] }, yaw: 25, P(u) { const h = first(u), s = then(u);
  return { bal: 0, hipX: -27 * s, hipY: 93.5 - 3 * s, pel: 2 + 58 * s, lum: -2 * s, che: -2 - 8 * s, nec: -8 * s, hW: 1, ikR: h, ikL: h, plantWall: 1, plantR: sm(h * 1.6), plantL: sm(h * 1.6), curlR: .05, curlL: .05,
    hRx: 57.1, hRy: 85 + 14 * h - 4 * s, hRz: 15, hLx: 57.1, hLy: 85 + 14 * h - 4 * s, hLz: -15 }; } });      // hands on the wall at hip height, trunk level
C('pendulum', 'Pendulum swings', { props: { blocks: [[36, 82, 66, 70, -30, 30, 'wood'], [40, 44, 0, 66, 24, 28, 'wood'], [40, 44, 0, 66, -28, -24, 'wood'], [76, 80, 0, 66, -28, -24, 'wood']] }, yaw: 30, pitch: 10, cont: true, period: 2.2, P(u, ph) { const a = TAU * ph;
  return { bal: 0, hipX: -22, hipY: 91, pel: 46, lum: 4, che: 2, nec: -10, fxL: 14, fxR: -12, hW: 1, ikL: 1, plantL: 1, hLx: 42, hLy: 72.9, hLz: -14, flexR: 12 * sin(a), abdR: 6 + 5 * cos(a), elbR: 4, curlR: .3 }; } });
C('arm-circles', 'Arm circles', { yaw: 62, pitch: 10, cont: true, period: 2.4, P(u, ph, cyc) { const a = TAU * ph, k = Math.min(1, .35 + .13 * cyc);
  return { abdR: 88 + 13 * k * sin(a), abdL: 88 + 13 * k * sin(a), flexR: 3 + 14 * k * cos(a), flexL: 3 + 14 * k * cos(a), elbR: 4, elbL: 4, proR: 60, proL: 60, curlR: .1, curlL: .1 }; } });
const wristP = (wf, pro) => u => { const h = first(u), s = then(u);
  return { flexR: 3 + 80 * h, elbR: 6, proR: mx(14, pro, h), wfR: wf * s, curlR: .1, abdR: 2, ikL: h, hLx: 51, hLy: 127 + (wf < 0 ? 8 : 5), hLz: 15, edL: .7, curlL: .55, nec: 6, hea: 4 }; };
C('wrist-flex', 'Wrist flexor stretch', { clasp: true, yaw: 50, pitch: 14, focus: 'hands', hold: true, P: wristP(-70, -80) });
C('wrist-ext', 'Wrist extensor stretch', { clasp: true, yaw: 50, pitch: 14, focus: 'hands', hold: true, P: wristP(70, 80) });
C('side-bend', 'Standing side bend', { yaw: 90, P(u) { const s = u, hz = 6.5 * s, y = 85 - 13 * s, f = (92.3 - y) / 85, cz = (-8.6 + hz) + (-1 - hz) * f, zw = cz - (9.6 - 6 * f) - 2.9;
  return { hipY: 93.5 - 2 * s, hipZ: hz, pelS: -4 * s, lumS: -19 * s, cheS: -20 * s, necS: -14 * s, abdR: 5 + 164 * s, rotR: -90 * s, elbR: 9 + 7 * s, flexR: 3 + 5 * s, wri: 3 - 3 * s, proR: 14 - 89 * s, curlR: .3 - .26 * s,
    ikL: 1, hLx: 2, hLy: y, hLz: zw - hz, proL: 0, curlL: .1, breath: .4 * s }; } });
C('itb', 'Standing cross-over hip stretch', { yaw: 90, P(u) { const st = first(u), s = then(u);
  return { fxR: -25 * st, fzR: 9.6 - 16 * st, fxL: 5 * st, liftR: 4 * sin(PI * st), wR: 1 - .7 * sin(PI * st), toR: 4, hipZ: 5 * s, pelS: -5 * s, lumS: -16 * s, cheS: -16 * s, necS: -8 * s,
    abdR: 5 + 164 * u, rotR: -90 * u, elbR: 9 + 7 * u, flexR: 3 + 5 * u, proR: 14 - 89 * u, curlR: .3 - .26 * u, flexL: 3 - 6 * s, abdL: 5 + 4 * s }; } });
C('side-lunge', 'Side lunge adductor stretch', { yaw: 90, pitch: 10, P(u) { const s = u;
  return { footZ: 36, toe: 14, wR: 1, wL: 1 - .75 * s, hipY: 93.5 - 30 * s, hipX: -8 * s, pel: 2 + 22 * s, lum: 4 * s, nec: -8 * s,
    flexR: 3 + 30 * s, flexL: 3 + 30 * s, elbR: 9 + 80 * s, elbL: 9 + 80 * s, abdR: 5 + 6 * s, abdL: 5 + 6 * s, curlR: .15, curlL: .15 }; } });
C('sit-stand', 'Sit-to-stand / squat', { yaw: 0, props: { chair: {} }, P(u) { const p = squatP(1)(u), s = u;      // from standing in front of a chair: hips back and down until they just touch the seat, trunk leaning forward, arms reaching forward; then stand up again
  return { ...p, hipX: -27 * s, hipY: 93 - 35.2 * s, pel: 2 + 30 * s }; } });
C('deep-squat', 'Deep squat hold', { yaw: 25, P(u) { const p = squatP(1.28)(u); return { ...p, pel: 2 + 12 * u, lum: 30 * u, che: 14 * u, nec: -22 * u, flexR: 3 + 72 * u, flexL: 3 + 72 * u, abdR: 5 + 21 * u, abdL: 5 + 21 * u, elbR: 9 + 8 * u, elbL: 9 + 8 * u }; } });
/* Standing hamstring stretch, heel on a step. The front leg is STRAIGHT, its heel resting on a low step with the toes pointing up; the
   standing knee is soft. The hips go back and the trunk hinges forward from the hips with a flat back, chest toward the front thigh. */
C('heel-step', 'Standing hamstring stretch, heel on a step', { props: { blocks: [[20, 52, 0, 14, -22, 22, 'wood']] }, yaw: 20, hold: true, P(u) { const st = first(u, 1.3), s = then(u, .55), hy = 93.5 - 3.5 * st;
  return { bal: 0, fxR: 30 * st, flR: 14 * ramp(.55, .9, st), liftR: 24 * sin(PI * st) ** .7 * (1 - ramp(.9, 1, st)), tuR: 24 * ramp(.6, 1, st), wR: 1 - .85 * st, fxL: -6 * st, hipX: -22.5 * st, hipY: hy, pel: 2 + 44 * s, lum: 0, che: -2, nec: -10 * s,
    ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRy: hy + 9.5, hRz: 21.5, hLx: 1, hLy: hy + 9.5, hLz: -21.5, proR: 60, proL: 60, curlR: .35, curlL: .35 }; } });
C('leg-swing', 'Leg swings', { props: { blocks: RAIL(-40) }, yaw: 30, P(u) { const a = mx(-26, 36, u);
  return { bal: 0, hipZ: 0, hipX: -3, wR: 0, freeR: 1, fxR: -3 + 82 * sin(a * R), liftR: 86 - 82 * cos(a * R) + 3, ankR: 0, hW: 1, ikL: 1, plantL: 1, hLx: 2, hLy: 103, hLz: -40, edL: .4, curlL: .45, flexR: 3 - a * .5, hipY: 93 }; } });
/* Wall calf stretch. A long stance facing the wall: the back leg carries the stretch, its heel pressed down and the toes pointing
   straight ahead, the knee straight (for the big calf muscle) or bent (for the deeper one). The hips travel forward and the body
   leans from the back heel to the head in one line, as far as the ankle allows with the heel still down; the front knee bends to
   let that happen. The hands rest on the wall at about eye height with the elbows soft, so the wrists are not forced back. */
const wallCalf = bent => u => { const st = first(u, 1.6), s = then(u, .5), a = sm(clamp((u - .45) / .55, 0, 1));      // the hands settle on the wall as the body arrives, not before
  return { bal: 0, fxL: 14.3 * st, fxR: -38.7 * st, liftR: 4 * sin(PI * st), toe: 2, hipX: -13.7 * st + (bent ? 10 : 6) * s, hipY: 93.5 - (bent ? 6 : 3.4) * st - (bent ? 8.5 : 1.8) * s, pel: 2 + (bent ? 9 : 15) * s, che: -2, nec: -4 * s, wL: 1, wR: 1,
    hW: 1, ikR: a, ikL: a, plantWall: 1, plantR: a, plantL: a, edR: .5, edL: .5, curlR: .05, curlL: .05, hRx: 57.1, hRy: mx(110, bent ? 141 : 148, a), hRz: 15, hLx: 57.1, hLy: mx(110, bent ? 141 : 148, a), hLz: -15 }; };
C('calf-straight', 'Wall calf stretch, knee straight', { props: { blocks: [WALL(62)] }, yaw: 25, hold: true, P: wallCalf(false) });
C('calf-bent', 'Wall calf stretch, knee bent', { props: { blocks: [WALL(62)] }, yaw: 25, hold: true, P: wallCalf(true) });
C('heel-drop', 'Stair heel drop', { props: { blocks: [[8.5, 46, 0, 16, -24, 24, 'wood'], ...RAIL(-38, 116, -10, 44)] }, yaw: 30, P(u) { return { bal: 0, flR: 16, flL: 16, hipY: 109.5 - 2.6 * u, heelR: -12 * u, heelL: -12 * u, hipX: 3, hW: 1, ikL: 1, plantL: 1, hLx: 8, hLy: 119, hLz: -38, edL: .4, curlL: .45 }; } });
C('toe-wall', 'Toe extension plantar fascia stretch', { props: { blocks: [WALL(34)] }, yaw: 25, focus: 'feet', barefoot: true, P(u) { const s = u;
  return { bal: 0, fxR: 17, tuR: 28 * s, fxL: -16, hipX: -2 + 5 * s, wR: .6, hW: 1, ikR: 1, ikL: 1, plantWall: 1, plantR: 1, plantL: 1, hRx: 29.1, hRy: 128, hRz: 15, hLx: 29.1, hLy: 128, hLz: -15, curlR: .05, curlL: .05 }; } });
C('balance', 'Single-leg balance', { yaw: 25, P: u => ({ liftL: 24 * u, fxL: -10 * u, wL: 1 - ramp(0, .2, u), abdR: 5 + 14 * u, abdL: 5 + 14 * u }) });
C('monster', 'Monster walk with band', { props: { band: { s: [['kneeR', 'kneeL']], rest: 24 } }, yaw: 80, pitch: 10, P(u) { const up = sin(PI * u);
  return { hipY: 85, hipX: -9, pel: 16, footZ: 13, fzR: 13 + 13 * u, liftR: 3 * up, wR: 1 - .7 * up, toe: 8, nec: -6, ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRy: 96, hRz: 21.5, hLx: 1, hLy: 96, hLz: -21.5, proR: 60, proL: 60 }; } });
C('suitcase', 'Suitcase carry', { props: { weight: {} }, yaw: 62, P: u => ({ curlR: .8, proR: 0, abdR: 7, lumS: 1.5 * u, shrR: -.15, breath: u * .5 }) });
C('rdl', 'Hip hinge (Romanian deadlift, light)', { props: { dumbbells: {} }, yaw: 15, P: u => ({ hipX: -19 * u, hipY: 93.5 - 7 * u, pel: 2 + 62 * u, lum: 2 * u, che: -2 - 2 * u, nec: -22 * u, hea: -8 * u, load: 1, ...GRIP, proR: 70, proL: 70, flexR: 3 + 6 * u, flexL: 3 + 6 * u, elbR: 5, elbL: 5 }) });
C('split-squat', 'Split squat', { yaw: 20, P: u => ({ fxR: 30, fxL: -36, heelL: 36 + 17 * u, hipY: 90 - 34 * u, hipX: -3, bal: 0, pel: 4, flexR: 14, flexL: 14, elbR: 96, elbL: 96, abdR: 10, abdL: 10, curlR: .5, curlL: .5 }) });
C('step-up', 'Step-up', { props: { blocks: [[12, 54, 0, 20, -24, 24, 'wood']] }, yaw: 25, P(u) { return { bal: 0, fxR: 24, flR: 20, hipX: mx(4, 22, u), hipY: mx(92, 113.5, u), fxL: mx(-8, 2, u), liftL: 26 * sm(u * 1.6), wL: 1 - ramp(0, .25, u), pel: mx(14, 2, u), flexL: 3 + 20 * (1 - u), flexR: 3 - 10 * (1 - u), elbR: 30, elbL: 30, curlR: .5, curlL: .5 }; } });
C('tke', 'Terminal knee extension', { props: { blocks: [POST(79.5, 9.6)], band: { s: [[[78, 46, 9.6], 'kneeR']], rest: 40 } }, yaw: 25, P: u => ({ bal: 0, fxR: 0, fxL: -22, heelL: 20, hipX: -6, hipY: mx(89.5, 92.8, u), heelR: mx(14, 0, u), ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRy: 100, hRz: 21.5, hLx: 1, hLy: 100, hLz: -21.5, proR: 60, proL: 60 }) });
C('calf-raise', 'Standing calf raise', { yaw: 0, P(u) { const a = 42 * u * R, lift = 11.5 * sin(a) + 7 * cos(a) - 7, fwd = 11.5 - 11.5 * cos(a) + 7 * sin(a);
  return { heelR: 42 * u, heelL: 42 * u, hipY: 93.5 + lift, hipX: fwd, pel: 2 - u, che: -2 - 2 * u, abdR: 5 + 5 * u, abdL: 5 + 5 * u, flexR: 3 - 4 * u, flexL: 3 - 4 * u }; } });
C('toe-raise', 'Toe raises and heel walks', { yaw: 20, P: u => ({ tuR: 26 * u, tuL: 26 * u, hipX: -5 * u, pel: 2 + 3 * u, abdR: 5 + 6 * u, abdL: 5 + 6 * u }) });
/* bands and weights (standing) */
C('band-row', 'Band row', { props: { blocks: [POST(94.5)], band: { anchor: [93, 112, 0] } }, yaw: 28, P: u => ({ ...GRIP, pel: 3, flexR: mx(72, -32, u), flexL: mx(72, -32, u), elbR: mx(10, 118, u), elbL: mx(10, 118, u), abdR: 6, abdL: 6, proR: 20, proL: 20, shFR: mx(.6, -1, u), shFL: mx(.6, -1, u), che: -2 - 3 * u }) });
C('face-pull', 'Face pull', { props: { blocks: [POST(94.5)], band: { anchor: [93, 150, 0] } }, yaw: 35, pitch: 10, P: u => ({ ...GRIP, ikR: 1, ikL: 1, eoR: 1, eoL: 1, hRx: mx(52, 15, u), hRy: mx(144, 152, u), hRz: mx(9, 27, u), hLx: mx(52, 15, u), hLy: mx(144, 152, u), hLz: mx(-9, -27, u), proR: 70, proL: 70, shFR: mx(.5, -1, u), shFL: mx(.5, -1, u) }) });
C('pulldown', 'Band or cable pull-down', { props: { door: { x: 34 }, band: { anchor: [34, 204, 0], rest: 70 } }, yaw: -24, P: u => ({ ...GRIP, flexR: mx(160, 28, u), flexL: mx(160, 28, u), elbR: mx(14, 118, u), elbL: mx(14, 118, u), abdR: 10, abdL: 10, proR: 60, proL: 60, shrR: mx(.4, -.2, u), shrL: mx(.4, -.2, u) }) });
C('pushdown', 'Band triceps push-down', { props: { door: { x: 34 }, band: { anchor: [34, 204, 0] } }, yaw: -24, P: u => ({ pel: 6, che: 0, elbR: 112 - 100 * u, elbL: 112 - 100 * u, proR: 82, proL: 82, ...GRIP, abdR: 5, abdL: 5, flexR: 4, flexL: 4, wfR: 6 * u, wfL: 6 * u }) });
C('pallof', 'Pallof press', { clasp: true, props: { blocks: [SIDEWALL(-97.6, 6)], band: { anchor: [6, 118, -96], rest: 62 } }, yaw: 55, pitch: 10, P: u => ({ ...GRIP, footZ: 13, hipY: 91, ikR: 1, ikL: 1, hRx: mx(24, 50, u), hRy: 121, hRz: 3.6, hLx: mx(24, 50, u), hLy: 121, hLz: -3.6, proR: 10, proL: 10, edR: .4, edL: .4 }) });
C('band-er', 'Band external rotation', { props: { blocks: [SIDEWALL(-81.6, 10)], band: { s: [[[10, 104, -80], 'handR']], rest: 62 } }, yaw: 62, pitch: 12, P: u => ({ curlR: .8, wri: 0, elbR: 90, proR: 0, flexR: 3, abdR: 4, rotR: mx(-52, 34, u) }) });
C('band-ir', 'Band internal rotation', { props: { blocks: [SIDEWALL(87.6, 10)], band: { s: [[[10, 104, 86], 'handR']], rest: 40 } }, yaw: 62, pitch: 12, P: u => ({ curlR: .8, wri: 0, elbR: 90, proR: 0, flexR: 3, abdR: 4, rotR: mx(34, -52, u) }) });
C('pull-apart', 'Band pull-apart', { props: { band: { rest: 60 } }, yaw: 62, pitch: 10, P(u) { const th = mx(-3, 71, u) * R, r = 52.6, x = r * cos(th), z = 15.9 + r * sin(th);      // arms long with soft elbows, sweeping from in front out to a T at shoulder height; each hand stays at arm's length from its own shoulder
  return { ...GRIP, ikR: 1, ikL: 1, eoR: 1, eoL: 1, hRx: x, hRy: 134, hRz: z, hLx: x, hLy: 134, hLz: -z, proR: 80, proL: 80, shFR: -u, shFL: -u, che: -2 - 3 * u }; } });
C('lateral-raise', 'Lateral raise (light)', { props: { dumbbells: {} }, yaw: 70, pitch: 8, P: u => ({ ...GRIP, load: .6, abdR: 6 + 80 * u, abdL: 6 + 80 * u, flexR: 6, flexL: 6, elbR: 12, elbL: 12, proR: 50, proL: 50 }) });
C('press', 'Overhead press (light)', { props: { dumbbells: {} }, yaw: 40, P: u => ({ ...GRIP, load: .6, ikR: 1, ikL: 1, eoR: 1, eoL: 1, hRx: mx(15, 9, u), hRy: mx(147, 180, u), hRz: mx(27, 20, u), hLx: mx(15, 9, u), hLy: mx(147, 180, u), hLz: mx(-27, -20, u), proR: 80, proL: 80 }) });
C('shrug', 'Shrug (controlled)', { props: { dumbbells: {} }, yaw: 80, P: u => ({ ...GRIP, load: .6, shrR: u, shrL: u, proR: 0, proL: 0, abdR: 7, abdL: 7 }) });
C('hammer-curl', 'Hammer curl', { props: { dumbbells: {} }, yaw: 28, P: u => ({ load: 1, elbR: 8 + 128 * u, elbL: 8 + 128 * u, proR: 0, proL: 0, ...GRIP, abdR: 7, abdL: 7, flexR: 2 - 4 * u, flexL: 2 - 4 * u }) });
C('reverse-fly', 'Bent-over reverse fly', { props: { dumbbells: {} }, yaw: 50, pitch: 12, P: u => ({ ...GRIP, hipX: -17, hipY: 87, pel: 58, lum: 2, che: -4, nec: -24, hea: -6, ikR: 1, ikL: 1, eoR: 1, eoL: 1, hRx: 26, hRy: mx(62, 104, u), hRz: mx(11, 58, u), hLx: 26, hLy: mx(62, 104, u), hLz: mx(-11, -58, u), proR: mx(0, 60, u), proL: mx(0, 60, u) }) });
C('wall-slide', 'Wall slides', { props: { blocks: [WALL(40)] }, yaw: 35, pitch: 8, P: u => ({ bal: 0, hipX: -2, hW: 1, ikR: 1, ikL: 1, plantWall: 1, plantR: 1, plantL: 1, edR: 1, edL: 1, curlR: .05, curlL: .05, hRx: 35.1, hRy: mx(140, 178, u), hRz: 17, hLx: 35.1, hLy: mx(140, 178, u), hLz: -17 }) });
const handP = f => (u) => ({ flexR: 12, flexL: 12, elbR: 84, elbL: 84, abdR: 6, abdL: 6, nec: 8, hea: 6, wri: 0, ...f(u) });
C('wrist-curl', 'Wrist curl', { props: { dumbbells: {} }, yaw: 40, pitch: 16, focus: 'hands', P: handP(u => ({ proR: -80, proL: -80, curlR: .8, curlL: .8, wfR: mx(-32, 48, u), wfL: mx(-32, 48, u) })) });
C('reverse-wrist', 'Reverse wrist curl', { props: { dumbbells: {} }, yaw: 40, pitch: 16, focus: 'hands', P: handP(u => ({ proR: 84, proL: 84, curlR: .8, curlL: .8, wfR: mx(34, -48, u), wfL: mx(34, -48, u) })) });
C('grip', 'Towel squeeze', { props: { towel: {} }, yaw: 40, pitch: 16, focus: 'hands', P: handP(u => ({ proR: 10, proL: 10, curlR: mx(.45, 1, u), curlL: mx(.45, 1, u) })) });
C('finger-ext', 'Finger extension against a band', { props: { fband: {} }, yaw: 40, pitch: 16, focus: 'hands', P: handP(u => ({ proR: 60, proL: 60, curlR: mx(.7, 0, u), curlL: mx(.7, 0, u) })) });

/* ---------- on a chair ---------- */
const CH = { ...CHAIRP };
const chairC = (id, label, def) => C(id, label, { stance: 'chair', yaw: 50, pitch: 12, ...def });
chairC('seated-twist', 'Seated spinal twist', { yaw: 62, P(u) { const a = first(u, 1.6), s = then(u, .2), arc = sin(PI * a) ** 2;
  return { ...CH, cheT: 34 * s, lumT: 5 * s, headT: 44 * s, che: -2 * s, onThighR: 1 - a, plantR: 1 - sm(a * 4), hRx: 39, hRy: THIGH_REST - 4, hRz: -12, proR: 30, curlR: .1 + .25 * a,
    plantL: 1 - .1 * sin(PI * a), onThighL: 1 - a, hLx: 2, hLy: 50.8 + 9 * arc, hLz: -20.5 }; } });
chairC('seated-side', 'Seated quadratus lumborum stretch', { yaw: 90, P(u) { const h = first(u), s = then(u);
  return { ...CH, lumS: -17 * s, cheS: -19 * s, necS: -10 * s, pelS: -3 * s, onThighL: 1 - h, plantL: .9, hLx: 2, hLy: 50.8, hLz: -20.5, onThighR: 1 - h, plantR: 1 - h, ikR: 1 - h, abdR: 5 + 165 * h, rotR: -90 * h, proR: 14 - 80 * h, elbR: 12, curlR: .1 }; } });
/* Figure-4 on a chair: the ankle of one leg rests on the other thigh just above the knee, the crossed knee dropping out to the side so the shin
   lies roughly level. The foot is lifted clear of the thigh first, carried across, then set down: it never passes through the other leg. */
const fig4 = u => { const h = first(u, 1.25), over = sm(clamp((h - .35) / .65, 0, 1)), on = sm(clamp(h * 3, 0, 1));      // the foot swings forward and up in front of the other knee, then comes back to rest on the thigh
  return { freeR: on, wR: 1 - on, fxR: mx(CHX + 46, CHX + 37, h) + 18 * sm(clamp(h / .4, 0, 1)) * (1 - sm(clamp((h - .72) / .28, 0, 1))), liftR: 53 * sm(h) + 4 * sin(PI * h) ** 2, fzR: mx(9.6, -9.6, over), koR: .95 * over, kuR: -.4 * over, ankR: -30 * over, plantR: 1 - h }; };
chairC('seated-fig4', 'Seated figure-4 stretch', { clasp: true, yaw: 62, P(u) { const s = then(u, .5); return { ...CH, ...fig4(u), pel: 16 * s, lum: 3 + 4 * s, nec: -8 * s, onThighR: 0, onThighL: 0, plantR: .9, plantL: .9, hRx: 2, hRy: 50.8, hRz: 20.5, hLx: 2, hLy: 50.8, hLz: -20.5 }; } });      // hands hold the sides of the seat throughout
chairC('peroneal', 'Peroneal (outer calf) stretch', { clasp: true, yaw: 62, P(u) { const h = first(u, 1.8), s = then(u, .5); return { ...CH, ...fig4(u), pel: 8 * s, nec: 10 * s, onThighR: 0, onThighL: 0, plantR: .9, plantL: .9, hRx: 2, hRy: 50.8, hRz: 20.5, hLx: 2, hLy: 50.8, hLz: -20.5, ankR: 10 * h + 22 * s }; } });
chairC('ball-squeeze', 'Ball squeeze', { props: { ball: { at: 'knees', r: 6.6 } }, yaw: 75, P: u => ({ ...CH, footZ: mx(11.5, 9.9, u) }) });
chairC('seated-calf', 'Seated calf raise', { yaw: 30, P: u => ({ ...CH, heelR: 34 * u, heelL: 34 * u }) });
chairC('short-foot', 'Short foot and towel scrunch', { barefoot: true, focus: 'feet', props: { blocks: [[-6, 34, 0, .6, -16, 16, 'soft']] }, yaw: 35, P: u => ({ ...CH, heelR: 5 * u, fxR: 3 - 1.5 * u }) });
chairC('brace', 'Abdominal bracing', { P: u => ({ ...CH, breath: -.6 * u, lum: 3 - 2 * u }) });
chairC('pf-kegel', 'Pelvic floor squeezes (slow holds)', { P: u => ({ ...CH, breath: -.4 * u }) });
chairC('pf-quick', 'Pelvic floor quick squeezes', { P: u => ({ ...CH, breath: -.4 * u }) });
chairC('breath:seated', 'Seated 4-6 breathing', { P: u => ({ ...CH, breath: u }) });
chairC('breath:box', 'Box breathing', { P: u => ({ ...CH, breath: u }) });
chairC('breath:sigh', 'Physiological sigh', { P: u => ({ ...CH, breath: u, che: -3 * u }) });

/* ---------- lying on the back ---------- */
const NK0 = -4, SX = SITX;                                   // NK0: neck angle with the head resting on the mat
const supC = (id, label, def) => C(id, label, { stance: 'supine', yaw: 12, pitch: 14, ...def });
const BELLY = { hRx: -12, hRy: 25.2, hRz: 3.5, hLx: -32, hLy: 28.6, hLz: -3.5, plantR: 0, plantL: 0, hugR: 1, hugL: 1, curlR: .06, curlL: .06, eoR: .5, eoL: .5, edR: .85, edL: .85 };      // one hand lying flat on the belly, the other flat on the chest, well apart, elbows resting out to the sides
const longLeg = (s, k = 1) => s > 0 ? { freeR: k, wR: 1 - k, fxR: mx(0, SX + 96, k), liftR: mx(0, 1.6, k), ankR: -14 * k } : { freeL: k, wL: 1 - k, fxL: mx(0, SX + 96, k), liftL: mx(0, 1.6, k), ankL: -14 * k };
supC('scan', 'Body scan', { floor: { on: ['hips', 'shoulders', 'head'] }, yaw: 18, pitch: 18, P: u => ({ ...SUPINE, ...longLeg(1), ...longLeg(-1), footZ: 13, hRx: 8, hRz: 27, hLx: 8, hLz: -27, plantR: 0, plantL: 0, proR: -70, proL: -70, curlR: .3, curlL: .3, breath: u }) });      // lying long and loose: legs out, arms a little away from the body, palms up
['breathing', 'Diaphragmatic breathing', 'breath:belly', 'Diaphragmatic breathing, lying', 'pf-relax', 'Pelvic floor release breathing'].forEach((v, i, a) => { if (i % 2 === 0) supC(v, a[i + 1], { P: u => ({ ...SUPINE, ...BELLY, breath: u }) }); });
supC('breath:load', 'Diaphragm strength: loaded breathing', { props: { blocks: [[SX - 19, SX - 3, 21.5, 24.5, -9, 9, 'soft']] }, P: u => ({ ...SUPINE, breath: u }) });
supC('subocc-ball', 'Suboccipital release on tennis balls', { props: { ball: { at: [SX - 60.5, 3.3, 3.6], two: true } }, focus: 'head', yaw: 20, P: u => ({ ...SUPINE, headUp: 1, nec: NK0 + 9, hea: 6 * u }) });
supC('supine-chin', 'Supine chin tuck holds', { focus: 'head', yaw: 8, P: u => ({ ...SUPINE, hea: 12 * u }) });
supC('chin-lift', 'Chin tuck and lift', { focus: 'head', yaw: 8, P: u => ({ ...SUPINE, headUp: 1, nec: NK0 + 13 * u, hea: 11 + 3 * u }) });
supC('knees-chest', 'Knees to chest', { clasp: true, hold: true, floor: { on: ['shoulders', 'head'] }, clasp: true, P(u) { const h = first(u, 1.6), s = then(u, .3);
  return { ...SUPINE, pel: -90 - 12 * h, lum: 12 * h, freeR: h, freeL: h, wR: 1 - h, wL: 1 - h, fxR: mx(0, SX + 21 - 4 * s, h), fxL: mx(0, SX + 21 - 4 * s, h), liftR: (37 + 2 * s) * h, liftL: (37 + 2 * s) * h, ankR: 10, ankL: 10,
    plantR: 1 - h, plantL: 1 - h, hRx: mx(14, -15, h), hRy: mx(3, 59.5, h), hRz: mx(23, 15.5, h), hLx: mx(14, -15, h), hLy: mx(3, 59.5, h), hLz: mx(-23, -15.5, h), eoR: .7 * h, eoL: .7 * h, hugR: h, hugL: h, curlR: .1, curlL: .1 }; } });      // the hands wrap the shins just below the knees, palms on the shins, and draw them in
supC('knee-opp', 'Knee to opposite shoulder', { floor: { on: ['hips', 'shoulders', 'head'] }, clasp: true, yaw: 25, pitch: 20, hold: true, P(u) { const h = first(u, 1.3), s = then(u, .45);      // one knee drawn up toward the chest and gently across toward the opposite shoulder, a hand resting on the knee; the other leg long on the mat
  return { ...SUPINE, ...longLeg(-1, h), liftL: mx(0, 1.6, h) + 5 * sin(PI * h), freeR: h, wR: 1 - h, fxR: mx(0, SX + 19, h), liftR: 38 * h, kxR: -h, fzR: mx(9.6, 9.6 - 9 * s, h), ankR: 10,
    plantR: 1 - h, hRx: mx(14, -14, h), hRy: mx(3.8, 52, h), hRz: mx(23, 26 - 5 * s, h), eoR: .8 * h, hugR: h, curlR: .12 }; } });
supC('figure4', 'Figure-4 stretch', { floor: { on: ['hips', 'shoulders', 'head'] }, clasp: true, yaw: 30, pitch: 22, hold: true, P(u) { const h = first(u, 1.4), s = then(u, .45);      // one leg up with the knee over the hip and the shin level; the other ankle rests across that thigh, knee out; the legs come toward the chest
  return { ...SUPINE, pel: -90 - 6 * s, lum: 6 * s, freeL: h, wL: 1 - h, fxL: mx(0, SX + 40 - 7 * s, h), liftL: (45 + 3 * s) * h, ankL: 6, freeR: h, wR: 1 - h, fxR: mx(0, SX + 12 - 6 * s, h), liftR: (37 + 5 * s) * h, fzR: mx(9.6, -9, h), koR: .95 * h, kuR: -.3 * h, ankR: 12,
    hRx: 14, hRy: 3, hRz: 25, hLx: 14, hLy: 3, hLz: -25 }; } });
supC('supine-twist', 'Supine twist', { floor: { on: ['hips'] }, yaw: 20, pitch: 28, hold: true, P(u) { const s = u;      // knees dropped to one side, both shoulders staying heavy on the mat, arms out, head turned the other way
  return { ...SUPINE, freeR: s, freeL: s, wR: 1 - s, wL: 1 - s, roll: -34 * s, cheT: -28 * s, lumT: -6 * s, headT: -30 * s, fxR: mx(0, SX + 26, s), fxL: mx(0, SX + 32, s), liftR: 17 * s + 8 * sin(PI * s), liftL: 3.2 * s + 6 * sin(PI * s), fzR: mx(9.6, -24, s), fzL: mx(9.6, 33, s),
    koL: .6 * s, koR: -.6 * s, hRx: mx(14, -32, s), hRy: 3, hRz: mx(23, 41, s), hLx: mx(14, -32, s), hLy: 3, hLz: mx(-23, -45, s) }; } });
supC('supine-ham', 'Supine hamstring stretch with strap', { floor: { on: ['hips', 'shoulders', 'head'] }, clasp: true, props: { band: { s: [['handR', 'footR'], ['handL', 'footR']], rest: 46 } }, hold: true, yaw: 15, P(u) { const a = mx(42, 84, u) * R;
  return { ...SUPINE, ...longLeg(-1), freeR: 1, wR: 0, fxR: SX + 84 * cos(a), liftR: 84 * sin(a) + 2, ankR: 4, kuR: 0, ikR: 1, ikL: 1, plantR: 0, plantL: 0, ...GRIP, hRx: -17, hRy: 44, hRz: 21, hLx: -17, hLy: 44, hLz: -5, eoR: .7, eoL: .3 }; } });      // the strap runs from the foot down either side of the leg to the hands, clear of the shin
supC('curl-up', 'McGill curl-up', { floor: { on: ['hips'] }, P: u => ({ ...SUPINE, ...longLeg(-1), headUp: 1, nec: NK0 + 8 * u, che: 12 * u, lum: 3 * u, hRx: 1, hRz: 21, hLx: 1, hLz: -21 }) });
supC('deadbug', 'Dead bug', { floor: { on: ['hips', 'shoulders', 'head'] }, yaw: 0, pitch: 12, P(u) { const top = 47.5, legX = SX + 42;
  return { ...SUPINE, ikR: 0, ikL: 0, plantR: 0, plantL: 0, freeR: 1, freeL: 1, wR: 0, wL: 0, elbR: 3, elbL: 3, proR: 0, proL: 0, curlR: .12, curlL: .12, wri: 0, flexR: 180 + 76 * u, flexL: 180, abdR: 3, abdL: 3, fxL: legX + 37 * u, liftL: top - 38 * u, fxR: legX, liftR: top, ankL: 8 * u }; } });
/* Glute bridge. The shoulders, the head and the feet stay on the mat; the hips rise until the thighs and the trunk make one straight
   line from the knees to the shoulders. (The pelvis turns so that the hip end of the trunk goes UP: the trunk slopes down from hips to shoulders.) */
const bridgeP = one => u => ({ ...SUPINE, fxR: SX + 47, fxL: SX + 47, pel: mx(-90, -116, u), lum: -3 * u, hRx: 5, hLx: 5,
  ...(one ? { freeL: first(u, 2.5), wL: 1 - first(u, 2.5), fxL: SX + mx(47, 12, first(u, 2.5)), liftL: mx(0, 44, first(u, 2.5)), kxL: -first(u, 2.5), ankL: 6 } : {}) });      // single-leg: the other knee is drawn toward the chest first, then the hips lift
supC('bridge', 'Glute bridge', { floor: { on: ['shoulders', 'head', 'feet'], off: ['hips'] }, P: bridgeP(false) });
supC('sl-bridge', 'Single-leg bridge', { floor: { on: ['shoulders', 'head'], off: ['hips'] }, P: bridgeP(true) });
supC('thoracic-roll', 'Thoracic extension over a foam roll', { clasp: true, props: { roller: { x: SX - 33 } }, P(u) { return { ...SUPINE, rest: 0, hipY: 12.2, pel: -73, lum: -4 - 3 * u, che: -4 - 8 * u, headUp: 1, nec: 2 - 6 * u, ikR: 1, ikL: 1, plantR: 0, plantL: 0, hRx: 0, hLx: 0, hRy: 30, hLy: 30,
  hRhead: 1, hLhead: 1, hRhx: HC[0] - 8, hRhy: HC[1] + 6, hRhz: 5, hLhx: HC[0] - 8, hLhy: HC[1] + 6, hLhz: -5, eoR: 1, eoL: 1, holdR: 1, holdL: 1, curlR: .15, curlL: .15 }; } });
supC('thomas', 'Thomas-position hip flexor stretch', { clasp: true, props: { blocks: [[SX - 125, SX + 6, 0, 48, -40, 40, 'soft']] }, yaw: 18, pitch: 10, hold: true, P(u) { const s = u;      // lying at the edge of a bed: one knee held to the chest, the other leg hanging off the edge so the front of that hip opens
  return { ...SUPINE, seat: 48, hipY: 60, headUp: 1, nec: NK0, freeL: 1, wL: 0, fxL: SX + 16, liftL: 48 + 40, ankL: 8, freeR: 1, wR: 0, fxR: SX + 40 + 2 * s, liftR: mx(34, 22, s), kuR: mx(1, .2, s) - 1, ankR: 0,
    plantR: 0, plantL: 0, hRx: -16, hRy: 103.5, hRz: -1, hLx: -16, hLy: 103, hLz: -14.5, hugR: 1, hugL: 1, curlR: .12, curlL: .12, eoR: .5, eoL: .6 }; } });      // both hands on the shin just below the knee, palms on it
supC('hip-thrust', 'Hip thrust', { floor: { off: ['hips'] }, props: { blocks: [[SX - 62, SX - 26, 0, 40, -40, 40, 'wood']] }, yaw: 15, P: u => ({ ...SUPINE, rest: 0, headUp: 1, hipY: mx(29, 50.5, u), hipX: SX + mx(-3, 0, u), pel: mx(-56, -90, u), nec: mx(24, 6, u), fxR: SX + 42, fxL: SX + 42, ikR: 0, ikL: 0, plantR: 0, plantL: 0, flexR: 150, flexL: 150, elbR: 70, elbL: 70, abdR: 12, abdL: 12 }) });

/* ---------- sitting on the mat ---------- */
const sitC = (id, label, def) => C(id, label, { stance: 'sit', yaw: 40, pitch: 16, ...def });
const TALL = { ...SIT, pel: -4, lum: 6, che: 0, nec: 0, plantR: 0, plantL: 0, ikR: 0, ikL: 0 };
sitC('butterfly', 'Butterfly stretch', { yaw: 62, P(u) { const s = u;
  return { ...SIT, kpU: .1, kpO: .9, freeR: 1, freeL: 1, wR: 0, wL: 0, fxR: SX + 31, fxL: SX + 31, liftR: -.1, liftL: -.1, footZ: 7.6, toe: 0, ankR: 6, ankL: 6, soles: 1, pel: -8 + 16 * s, lum: 8 + 4 * s, che: 2 + 4 * s, nec: 2 - 6 * s, hea: -2 * s,
    plantR: 1, plantL: 1, palmIn: 1, eoR: .7, eoL: .7, hRx: 31, hRy: 12.7, hRz: 11, hLx: 31, hLy: 12.7, hLz: -11, curlR: .12, curlL: .12 }; } });
sitC('seated-ham', 'Seated hamstring stretch', { clasp: true, yaw: 25, P(u) { const s = u;
  return { ...TALL, kpU: 0, ...longLeg(1), freeL: 1, wL: 0, fxL: SX + 30, liftL: -1.5, fzL: 5, koL: .96, ankL: 20, pel: -2 + 26 * s, lum: 8 + 8 * s, che: 4 * s, nec: -4 * s, ikR: 1, ikL: 1, hRx: 40 + 26 * s, hRy: 19 - 2 * s, hRz: 15, hLx: 40 + 26 * s, hLy: 19 - 2 * s, hLz: 3.5, curlR: .2, curlL: .2 }; } });
const bandFoot = dir => u => ({ ...TALL, footZ: 13.5, kpU: 1, ...longLeg(1), ...longLeg(-1), ankR: -4, ankL: -4, koR: dir * .34 * u, pel: -12, lum: 10, ikR: 1, ikL: 1, plantR: 1, plantL: 1, hRx: -16, hRy: 3, hRz: 22, hLx: -16, hLy: 3, hLz: -22 });      // legs long, toes to the ceiling, the band looped round the forefoot; the foot turns outward or inward against it
sitC('band-eversion', 'Band eversion', { props: { band: { s: [['footR', 'footL']], rest: 17 } }, yaw: 24, pitch: 46, focus: 'feet', P: bandFoot(1) });
sitC('band-inversion', 'Band inversion', { props: { blocks: [SIDEWALL(53.6, SX + 86, 22, 24)], band: { s: [['footR', [SX + 88, 9, 52]]], rest: 30 } }, yaw: 24, pitch: 46, focus: 'feet', P: bandFoot(-1) });
sitC('9090', '90/90 hip stretch', { yaw: 62, pitch: 22, hold: true, P(u) { const s = u;      // both knees at right angles: the front shin across in front, the back shin out to the side; sit tall, then hinge over the front leg
  return { ...TALL, kpU: 0, freeR: 1, freeL: 1, wR: 0, wL: 0, fxR: SX + 60, liftR: -1.5, fzR: 2, koR: 1, ankR: 0, fxL: SX - 24, liftL: -1.5, fzL: 62, koL: 1, kxL: .5, ankL: 0,
    pel: 2 + 14 * s, lum: 6 + 6 * s, nec: -6 * s, ikR: 1, ikL: 1, plantR: 1, plantL: 1, hRx: -20, hRy: 3, hRz: 24, hLx: -16, hLy: 3, hLz: -24, curlR: .05, curlL: .05 }; } });
sitC('pigeon', 'Pigeon pose', { yaw: 50, pitch: 20, hold: true, P(u) { const s = u;      // front shin across the mat with the knee out, back leg long behind, hips level; the chest lowers over the front leg
  return { ...TALL, rest: 0, hipY: 17, kpU: 0, freeR: 1, freeL: 1, wR: 0, wL: 0, fxR: SX + 54, liftR: .6, fzR: -5, koR: 1, ankR: 0, fxL: SX - 96, liftL: -2, kuL: -1, ankL: 62, pel: 14 + 18 * s, lum: -8 + 12 * s, che: -4 + 6 * s, nec: -8 * s,
    ikR: 1, ikL: 1, plantR: 0, plantL: 1, hRx: 20 + 4 * s, hRy: 22, hRz: 22, curlR: .2, hLx: 16 + 22 * s, hLy: 3, hLz: -27, curlL: .05 }; } });
/* ---------- all fours and kneeling ---------- */
const flC = (id, label, def) => C(id, label, { stance: 'floor', yaw: 15, pitch: 12, ...def });
const catP = u => { const lum = mx(-23, 36, u), che = mx(-17, 32, u); return { ...QUAD, pel: quadPel(80, lum, che), lum, che, nec: mx(-26, 24, u), hea: mx(-10, 10, u), breath: 1 - u }; };
flC('cat-cow', 'Cat-cow', { floor: { on: ['knees', 'hands'], off: ['hips'] }, yaw: 0, P: catP }); flC('wu-cat', 'Cat-cow', { yaw: 0, P: catP });
flC('thread', 'Thread the needle', { yaw: 32, pitch: 20, P(u) { const s = u, a = u, lum = 6 * s, che = 12 * s;
  return { ...QUAD, pel: quadPel(80 + 31 * s, lum, che), lum, che, lumT: -6 * s, cheT: -35 * s, nec: 4 + 4 * s, headT: -20 * s, plantL: 1 - ramp(0, .2, a), hLx: 43 - 33 * a, hLy: 3 + 1.3 * a + 5 * sin(PI * a), hLz: -16.5 + 49 * a, proL: 88 - 86 * ramp(0, .5, a), wfL: -85 + 82 * ramp(0, .45, a), curlL: .12 * a }; } });
flC('birddog', 'Bird-dog', { yaw: 12, P(u) { const s = u;
  return { ...QUAD, plantR: 1 - ramp(0, .25, s), hRx: 43 + 53 * s, hRy: 3 + 54 * s, hRz: 16.5, eoR: 0, proR: 88 - 60 * s, wfR: -85 * (1 - ramp(0, .4, s)), curlR: .1 * s,
    kdL: 0, kneelL: 0, freeL: 1, wL: 0, heelL: 0, fxL: mx(KNX - 40, KNX - 78, s), liftL: mx(-1.5, 37, s), kuL: -1, ankL: mx(62, 20, s), nec: 4 - 4 * s }; } });      // the leg slides back and lifts; it is never switched between two ways of kneeling, so it cannot jump
const childP = side => u => { const s = u; return { ...QUAD, knZ: 13, footZ: 12, hipX: KNX - 36 * s, pel: 80 - 14 * s, lum: 40 * s, che: 9 * s, nec: 4 - 13 * s, hRx: 43 + (side ? 38 : 49) * s, hLx: 43 + (side ? 38 : 49) * s, hRz: 16.5 + side * 12 * s, hLz: -16.5 + side * 12 * s, lumS: side * 5 * s, cheS: side * 6 * s, elbR: 4, elbL: 4 }; };
flC('prayer', 'Prayer stretch (extended child pose)', { floor: { on: ['knees', 'hands'] }, hold: true, P: childP(0) });
flC('child-side', 'Child pose with side reach', { yaw: 35, pitch: 24, hold: true, P: childP(1) });
flC('frog', 'Frog stretch', { yaw: 62, pitch: 24, P: u => ({ ...QUAD, knZ: 9 + 22 * u, footZ: 9 + 26 * u, hipX: KNX - 9 * u, pel: 82, hRx: 43 - 10 * u, hLx: 43 - 10 * u }) });
flC('kneel-shin', 'Kneeling shin stretch', { yaw: 20, barefoot: true, floor: { on: ['knees'] }, P: u => ({ ...QUAD, heelR: 0, heelL: 0, hipX: KNX - 36, pel: 2 - 13 * u, lum: 2, che: -2 + 2 * u, nec: 3 * u, ikR: 1, ikL: 1, plantR: 1, plantL: 1, onThighR: 1, onThighL: 1, proR: 14, proL: 14, wfR: 0, wfL: 0, flexR: 3, flexL: 3, curlR: .1, curlL: .1 }) });      // sitting back on the heels with the tops of the feet flat on the mat, then leaning back a little: the stretch runs down the front of the shins and ankles
flC('nordic', 'Nordic hamstring curl (assisted)', { yaw: 10, P(u) { const a = 36 * u; return { ...QUAD, hipX: KNX + 44 * sin(a * R), pel: a + 2, lum: 0, che: -2, nec: -a * .5, ikR: 0, ikL: 0, plantR: 0, plantL: 0, flexR: 40 + a, flexL: 40 + a, elbR: 112, elbL: 112, proR: 80, proL: 80, wfR: -40, wfL: -40, curlR: .1, curlL: .1, abdR: 8, abdL: 8 }; } });
const HK = { bal: 0, knX: -24, kdL: 1, kneelL: 1, fxL: KN.fx(-24), heelL: 0, fxR: 30, wR: 1, wL: 0, toe: 4, ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRz: 21.5, hLx: 1, hLz: -21.5, proR: 60, proL: 60, curlR: .35, curlL: .35 };
const hkHands = y => ({ hRy: y, hLy: y });
flC('half-kneel', 'Half-kneeling hip flexor stretch', { yaw: 20, P: u => ({ ...HK, hipX: -24 + 6 + 16 * u, pel: -2 - 5 * u, lum: -2 * u, ...hkHands(60 - 5 * u) }) });
flC('half-kneel-reach', 'Half-kneeling psoas stretch with reach', { yaw: 35, P: u => ({ ...HK, hipX: -24 + 6 + 16 * u, pel: -2 - 5 * u, ...hkHands(60 - 5 * u), ikL: 1 - first(u), abdL: 5 + 168 * first(u), rotL: -90 * first(u), proL: mx(60, -60, first(u)), lumS: 9 * then(u), cheS: 10 * then(u), necS: 5 * then(u), curlL: .1 }) });
flC('couch', 'Couch stretch', { props: { blocks: [[-58, -54, 0, 70, -30, 30, 'wall']] }, yaw: 20, P: u => ({ ...HK, ikR: 0, ikL: 0, flexR: 3, flexL: 3, abdR: 9, abdL: 9, elbR: 14, elbL: 14, curlR: .3, curlL: .3, kneelL: 0, fxL: -24 - 27, liftL: 34, hipX: -24 + 22 - 8 * u, pel: 12 - 14 * u, fxR: 34, ...hkHands(mx(56, 62, u)) }) });
flC('knee-wall', 'Knee-to-wall ankle mobility', { props: { blocks: [WALL(51)] }, yaw: 20, P: u => ({ ...HK, fxR: 22, hipX: -24 + 6 + 15 * u, pel: 4, ...hkHands(60 - 3 * u) }) });
flC('wgs', "World's greatest stretch", { yaw: 30, pitch: 14, hold: true, P(u) { const s = u;      // a long, low lunge with the back leg straight and its knee off the mat; one hand on the mat inside the front foot; the chest turns open and the other arm reaches up. The pelvis tilts only as far as the hip allows; the rest of the fold comes from the spine
  return { bal: 0, fxR: 40, fzR: 18, fxL: -100, heelL: 50, liftL: 1.4, hipX: -10, hipZ: -4, hipY: 36.5, pel: 21, lum: 36, che: 20, nec: -12 - 6 * s, cheT: -30 * s, lumT: -4 * s, headT: -26 * s, hW: 1, ikL: 1, plantL: 1, hLx: 30, hLy: 3, hLz: -13, curlL: 0,
    ikR: 1, eoR: 1, hRx: 26, hRy: 40 + 62 * s, hRz: 45 - 11 * s, curlR: .1, proR: 30 }; } });
/* planks and push-ups: a straight line from the shoulders to the ankles, toes tucked */
const PL = (hx, hy, pel) => ({ bal: 0, hipX: hx, hipY: hy, pel, lum: 0, che: 0, nec: -10, fxR: -97, fxL: -97, heelR: 55, heelL: 55, liftR: 1.4, liftL: 1.4, toe: 0, footZ: 9.6, kpU: -1, wR: .5, wL: .5, hW: 1, ikR: 1, ikL: 1, plantR: 1, plantL: 1, curlR: 0, curlL: 0 });
flC('pushup', 'Push-up (incline if needed)', { floor: { off: ['hips', 'knees'] }, yaw: 10, P: u => ({ ...PL(mx(.7, 5.4, u), mx(45.1, 24.5, u), mx(69.2, 83.6, u)), hRx: 41, hRy: 3, hRz: 25, hLx: 41, hLy: 3, hLz: -25, eoR: .45, eoL: .45 }) });
flC('scap-pushup', 'Scapular push-up (push-up plus)', { floor: { off: ['hips', 'knees'] }, yaw: 10, P: u => ({ ...PL(.7, mx(42.6, 46.4, u), 69.2), che: mx(-1, 5, u), shFR: mx(-.6, .8, u), shFL: mx(-.6, .8, u), hRx: 41, hRy: 3, hRz: 17, hLx: 41, hLy: 3, hLz: -17 }) });
flC('plank', 'Front plank', { floor: { off: ['hips', 'knees'] }, yaw: 10, P: u => ({ ...PL(5.4, 26.9, 81.7), hRx: 73, hRy: 3, hRz: 14, hLx: 73, hLy: 3, hLz: -14, edR: 1, edL: 1, breath: u }) });
flC('downdog', 'Downward dog', { floor: { on: ['hands'], off: ['hips', 'knees'] }, yaw: 8, P: u => ({ bal: 0, hipX: 10, hipY: 83, pel: 122, lum: 14, che: 6, breath: u, nec: 8, fxR: -30, fxL: -30, footZ: 9, hW: 1, ikR: 1, ikL: 1, plantR: 1, plantL: 1, hRx: 62, hRy: 3, hRz: 16, hLx: 62, hLy: 3, hLz: -16, curlR: 0, curlL: 0 }) });

/* ---------- lying face down ---------- */
const PX = -18, PRONE = { bal: 0, rest: 1, headUp: 1, hipX: PX, hipY: 12, pel: 90, lum: 0, che: 0, nec: -12, kpU: -1, freeR: 1, freeL: 1, wR: 0, wL: 0, fxR: PX - 96, fxL: PX - 96, liftR: -2.2, liftL: -2.2, ankR: 62, ankL: 62, toe: 0, footZ: 9, ikR: 1, ikL: 1, curlR: .1, curlL: .1 };
const prC = (id, label, def) => C(id, label, { stance: 'floor', yaw: 15, pitch: 16, ...def });
const armsP = (x, y, z, eo = .6) => ({ hRx: x, hRy: y, hRz: z, hLx: x, hLy: y, hLz: -z, eoR: eo, eoL: eo });
prC('prone-T', 'Prone T raise', { floor: { on: ['hips'] }, yaw: 50, pitch: 22, P: u => ({ ...PRONE, ...armsP(42, mx(5, 25, u), 66), proR: 30, proL: 30, shFR: -u, shFL: -u }) });
prC('prone-Y', 'Prone Y raise', { floor: { on: ['hips'] }, yaw: 35, pitch: 22, P: u => ({ ...PRONE, ...armsP(86, mx(5, 23, u), 44), proR: 0, proL: 0 }) });
prC('prone-W', 'Prone W external rotation', { floor: { on: ['hips'] }, yaw: 50, pitch: 22, P: u => ({ ...PRONE, ...armsP(58, mx(5, 22, u), 44, 1), proR: 60, proL: 60, shFR: -u, shFL: -u }) });
prC('prone-neck', 'Prone neck extension holds', { focus: 'head', yaw: 20, floor: { on: ['hips'] }, P: u => ({ ...PRONE, ...armsP(62, 4, 7, 1), plantR: 1, plantL: 1, nec: mx(-13, -27, u), hea: 5 * u }) });      // forehead resting on the hands; the chin tucks and the head lifts a few centimetres, eyes still on the floor
prC('superman', 'Back extension holds', { floor: { on: ['hips'] }, P: u => ({ ...PRONE, ...armsP(94, 6 + 16 * u, 18, .4), lum: -13 * u, che: -9 * u, nec: -12 - 8 * u, liftR: -2.2 + 10 * u, liftL: -2.2 + 10 * u }) });
prC('sphinx', 'Sphinx and cobra', { floor: { on: ['hips'] }, P: u => ({ ...PRONE, liftR: -2.2 + 1.6 * u, liftL: -2.2 + 1.6 * u, lum: -22 * u, che: -17 * u, nec: -12 - 6 * u, hW: 0, plantR: 1, plantL: 1, ...armsP(mx(66, 61, u), 3, 16, 0), edR: 1, edL: 1, curlR: 0, curlL: 0 }) });
prC('ham-curl', 'Hamstring curl (band or ball)', { clasp: true, props: { blocks: [[PX - 134.6, PX - 129.6, 0, 62, -27, 27, 'wall']], band: { s: [['ankleR', [PX - 128, 5, 9]], ['ankleL', [PX - 128, 5, -9]]], rest: 46 } }, P(u) { const a = 100 * u * R, fx = PX - 46 - 46 * cos(a), lf = 42 * sin(a) - 1.2;
  return { ...PRONE, ...armsP(62, 4, 7, 1), plantR: 1, plantL: 1, fxR: fx, fxL: fx, liftR: lf, liftL: lf, ankR: 62 - 50 * u, ankL: 62 - 50 * u, nec: -13 }; } });
prC('breath:croc', 'Crocodile breathing', { clasp: true, P: u => ({ ...PRONE, ...armsP(62, 4, 7, 1), plantR: 1, plantL: 1, nec: -13, breath: u }) });

/* ---------- lying on the side (on the left side, facing the viewer; the top side is the one that works) ---------- */
const SDX = -26, SIDE = { bal: 0, rest: 1, headUp: 1, hipX: SDX, hipY: 18, pel: 90, roll: -90, nec: 0, necS: 0, kpU: 0, koR: 1, koL: -1, freeR: 1, freeL: 1, wR: 0, wL: 0, toe: 0,
  hW: 1, ikL: 1, hLx: SDX + 96, hLy: 3, hLz: 4, proL: 0, curlL: .1, ikR: 1, hRx: SDX + 30, hRy: 3.2, hRz: 34, plantR: 1, curlR: .05 };
const sideLegs = (flex, knee, topUp = 0, spread = 0) => { const f = flex * R, k = knee * R, kx = -44 * cos(f), kz = 44 * sin(f), ax = kx - 42 * cos(f - k), az = kz + 42 * sin(f - k);      // hip flexed toward the viewer, knee bent back
  return { fxL: SDX + ax, fzL: -az, liftL: -1.6, fxR: SDX + ax, fzR: az + spread, liftR: 13.5 + topUp, ankR: 0, ankL: 0 }; };
const sdC = (id, label, def) => C(id, label, { stance: 'floor', yaw: 8, pitch: 20, pillow: true, ...def });
sdC('clam', 'Clamshell', { P: u => ({ ...SIDE, ...sideLegs(45, 90), kuR: .9 * u, liftR: 13.5 + 3 * u }) });
sdC('side-leg', 'Side-lying hip abduction', { P(u) { const a = 34 * u * R; return { ...SIDE, ...sideLegs(18, 36), fxR: SDX - 85 * cos(a), fzR: 0, liftR: 19 + 85 * sin(a) - 8, ankR: 0 }; } });
sdC('breath:side', 'Side-lying with rib expansion', { P: u => ({ ...SIDE, ...sideLegs(40, 70), breath: u, plantR: 0, hRx: SDX + 22, hRy: 36, hRz: 6, eoR: 1 }) });
sdC('open-book', 'Open book rotation', { yaw: 15, pitch: 30, hold: true, P(u) { const a = mx(-27, 112, u) * R;      // the top arm stays long and draws an arc from the mat in front, over the top, toward the mat behind
  return { ...SIDE, ...sideLegs(80, 90), cheT: -34 * u, lumT: -7 * u, headT: -50 * u, plantR: 0, ikR: 0, abdR: 90, flexR: mx(-8, -112, u), elbR: 6, proR: 0, curlR: .1 }; } });
/* Sleeper stretch. Lying on the side with that shoulder underneath, the upper arm straight out in front on the mat and the elbow at a right
   angle. The elbow stays exactly where it is; the forearm turns from pointing at the ceiling down toward the mat (the shoulder rotating
   inward), with the top hand resting on the forearm to add a light press. A small pillow keeps the neck level. */
sdC('sleeper', 'Sleeper stretch', { clasp: true, yaw: 20, pitch: 26, hold: true, props: { blocks: [[SDX + 58, SDX + 80, 0, 4.6, -13, 15, 'soft']] }, P(u) { const a = mx(10, 58, then(u, .15)) * R, ex = SDX + 42, ey = 5.2, ez = 28.5;
  return { ...SIDE, ...sideLegs(40, 70), epL: 1, eLx: ex, eLy: ey, eLz: ez, hLx: ex - 26 * sin(a), hLy: ey + 26 * cos(a), hLz: ez, plantL: 0, proL: 0, curlL: .3,
    plantR: 0, hRx: ex - 13 * sin(a), hRy: ey + 13 * cos(a) + 1, hRz: ez + 9.2, hugR: 1, eoR: 1, curlR: .08 }; } });
const sidePlank = { bal: 0, hipX: -10, hipY: 25.7, pel: 90, pelT: -10, roll: -90, headUp: 1, nec: 0, kpU: 0, koR: 1, koL: -1, freeR: 1, freeL: 1, wR: 0, wL: 0, hW: 1, ikL: 1, plantL: 1, edL: 1, hLx: 31, hLy: 3, hLz: 24, curlL: 0, ikR: 1, eoR: 1, hRx: -8, hRy: 46, hRz: 4, curlR: .3 };
sdC('side-plank', 'Side plank', { P: u => ({ ...sidePlank, fxL: -10 - 85, fzL: 0, liftL: -1.5, fxR: -10 - 85, fzR: 0, liftR: 8.6, breath: u }) });
sdC('copenhagen', 'Copenhagen adduction plank', { props: { blocks: [[-118, -72, 0, 36, -24, 24, 'wood']] }, P: u => ({ ...sidePlank, hipY: 38, pelT: 6, fxR: -10 - 84, fzR: 0, liftR: 36.5, fxL: -10 - 46, fzL: 0, liftL: mx(4, 22, u), kuL: -.4, hRy: 58 }) });

/* standing quadriceps stretch: on one leg with a hand on a rail, the other heel drawn toward the buttock, knee pointing down, hips level */
C('quad-stand', 'Standing quadriceps stretch', { clasp: true, props: { blocks: RAIL(-40) }, yaw: 30, hold: true, P(u) { const h = first(u, 1.2), s = then(u, .5);
  return { bal: 0, wR: 0, freeR: 1, fxR: -25 * h - 2 * s, liftR: 5.6 + 67 * h + 3 * s, kuR: -h, ankR: 30 * h, hW: 1, ikL: 1, plantL: 1, hLx: 2, hLy: 103, hLz: -40, edL: .4, curlL: .45,
    ikR: h, hRx: -22 - s, hRy: 87 + 2 * s, hRz: 16.8, hugR: h, curlR: .3, proR: 40, pel: 2 - 2 * s, hipY: 93 }; } });

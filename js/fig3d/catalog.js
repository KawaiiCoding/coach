/* Catalogue: every exercise of the app as a 3D move, keyed by the app's own exercise id.
   A move is P(u, phase, cycle): u runs from 0 (start position) to 1 (end position) and is driven by the app's rep clock, so the
   figure and the count always agree. A move returns only the channels that differ from the base pose of its position; joint
   limits, balance, contact with the mat and props, and the no-crossing rules are applied by the engine and checked by the test.
   Two-sided moves are written for the right side; the app mirrors the picture for the left. */
const mx = (a, b, u) => a + (b - a) * u, sm = smoother, sin = Math.sin, cos = Math.cos, PI = Math.PI;
const first = (u, k = 2.2) => sm(u * k), then = (u, a = .35) => sm((u - a) / (1 - a));      // hands go first, the stretch follows
const C = (id, label, def) => { def.label = label; if (!def.period && !def.cont && (def.hold || /first\(|then\(/.test(String(def.P)))) def.period = 11; EX[id] = def; };      // stretches that are set up and then held use the slow timing
const GRIP = { curlR: .8, curlL: .8, wri: 0 };
const WALL = x => [x, x + 4, 0, 200, -46, 46, 'wall'];

/* ---------- standing ---------- */
const squatP = d => u => { const s = u * d; return { footZ: 13.5, toe: 16, hipX: -25 * s, hipY: 93 - 52 * s, pel: 2 + 34 * s, lum: 8 * s, che: -2 - 3 * s, nec: -14 * s, hea: -8 * s,
  flexR: 3 + 79 * u, flexL: 3 + 78 * u, abdR: 5 - 2 * u, abdL: 5 - 2 * u, elbR: 9 + 5 * u, elbL: 9 + 5 * u, wri: 3 - 3 * u, proR: 14 + 50 * u, proL: 14 + 50 * u, curlR: .3 - .14 * u, curlL: .3 - .14 * u }; };
C('rest', 'Rest', { yaw: 20, P: u => ({ breath: u }) });
C('wu-march', 'March on the spot', { yaw: 25, P(u, ph, cyc) { const r = cyc % 2 === 0, a = r ? u : 0, b = r ? 0 : u;
  return { liftR: 40 * a, fxR: 15 * a, wR: 1 - ramp(0, .2, a), liftL: 40 * b, fxL: 15 * b, wL: 1 - ramp(0, .2, b), flexL: 3 + 34 * a - 16 * b, flexR: 3 + 34 * b - 16 * a, elbR: 30 + 30 * b, elbL: 30 + 30 * a, curlR: .5, curlL: .5 }; } });
C('march', 'Standing hip flexion march', { yaw: 20, P: u => ({ liftR: 44 * u, fxR: 16 * u, wR: 1 - ramp(0, .2, u), flexL: 3 + 30 * u, flexR: 3 - 14 * u, elbL: 20 + 40 * u, elbR: 20, curlR: .5, curlL: .5 }) });
C('walk', 'Easy walk', { yaw: 20, cont: true, period: 1.3, P(u, ph) { const s = sin(TAU * ph), c = cos(TAU * ph);
  return { fxR: 15 * s, fxL: -15 * s, liftR: 5 * Math.max(0, c), liftL: 5 * Math.max(0, -c), wR: 1 - .9 * Math.max(0, c), wL: 1 - .9 * Math.max(0, -c), flexL: 3 + 22 * s, flexR: 3 - 22 * s, elbR: 24, elbL: 24, curlR: .45, curlL: .45 }; } });
C('wu-swing', 'Arm swings and shoulder rolls', { yaw: 25, P: u => ({ flexR: -28 + 200 * u, flexL: -28 + 199 * u, elbR: 8, elbL: 8, abdR: 6, abdL: 6, proR: 14 - 14 * u, proL: 14 - 14 * u, curlR: .25, curlL: .25, che: -2 - 3 * u }) });
C('shoulder-roll', 'Shoulder rolls', { yaw: 25, focus: 'head', cont: true, period: 2.5, P(u, ph) { const a = TAU * ph; return { shrR: .5 - .5 * cos(a), shrL: .5 - .5 * cos(a), shFR: -sin(a) * .8, shFL: -sin(a) * .8 }; } });
C('wu-hip', 'Hip circles', { yaw: 62, pitch: 12, cont: true, period: 3.2, P(u, ph, cyc) { const a = TAU * (cyc >= 5 ? -ph : ph), c = cos(a), s = sin(a);
  return { bal: 0, footZ: 15, toe: 12, hipX: 6 * c, hipZ: 6.5 * s, hipY: 92.5, pel: 2 - 7 * c, lum: 5 * c, pelS: 5 * s, lumS: -5 * s,
    ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRy: 103, hRz: 18.5, hLx: 1, hLy: 103, hLz: -18.5, proR: 60, proL: 60, curlR: .35, curlL: .35 }; } });
C('chin-tuck', 'Chin tuck', { yaw: 0, focus: 'head', P: u => ({ nec: mx(16, -5, u), hea: mx(-13, 9, u), che: mx(3, -2, u) }) });
C('uptrap', 'Upper trapezius stretch', { yaw: 90, focus: 'head', P(u) { const hand = first(u), s = then(u);
  return { necS: -36 * s, nec: 6 * s, hea: 4 * s, cheS: 2 * s, ikL: 1, hLx: 2, hLy: 85, hLz: -22, proL: 0,
    hLhead: hand, hLhx: HC[0] - .5, hLhy: HC[1] + 12.6, hLhz: -4.5, eoL: sm(hand), holdL: sm(hand), curlL: .3 - .1 * hand, abdR: 5 + 3 * s, flexR: 3 - 8 * s, curlR: .3, wri: 3 - 6 * s }; } });
C('scalene', 'Scalene stretch', { yaw: 90, focus: 'head', P: u => ({ necS: -30 * u, hea: -8 * u, nec: -6 * u, headT: 10 * u, flexR: 3 - 16 * u, abdR: 5 + 4 * u, rotR: 20 * u }) });
C('levator', 'Levator scapulae stretch', { yaw: 62, focus: 'head', P(u) { const hand = first(u), s = then(u);
  return { headT: -42 * s, nec: 30 * s, hea: 12 * s, necS: -8 * s, ikL: 1, hLx: 2, hLy: 85, hLz: -22, proL: 0,
    hLhead: hand, hLhx: HC[0] - 6.5, hLhy: HC[1] + 10.8, hLhz: -2, eoL: sm(hand), holdL: sm(hand), curlL: .2, flexR: 3 - 10 * s }; } });
C('scm', 'Sternocleidomastoid stretch', { yaw: 90, focus: 'head', P(u) { const h = first(u), s = then(u);
  return { necS: -20 * s, headT: 34 * s, nec: -14 * s, hea: -6 * s, ikR: h, plantR: h, hRx: 9.5, hRy: 127, hRz: 4, eoR: .2, curlR: .1 }; } });
C('neck-ext', 'Neck extensor stretch', { clasp: true, yaw: 28, focus: 'head', P(u) { const hand = first(u), s = then(u), o = sm(hand);
  return { nec: 38 * s, hea: 14 * s, che: -2 + 4 * s, ikR: 1, ikL: 1, hRx: 2, hRy: 85, hRz: 22, hLx: 2, hLy: 85, hLz: -22, proR: 0, proL: 0,
    hRhead: hand, hLhead: hand, hRhx: HC[0] - 8, hRhy: HC[1] + 8.5, hRhz: 4.6, hLhx: HC[0] - 8, hLhy: HC[1] + 8.5, hLhz: -4.6, eoR: o, eoL: o, holdR: o, holdL: o, curlR: .15, curlL: .15 }; } });
C('jaw', 'Jaw release', { yaw: 90, focus: 'head', P(u) { const hand = first(u, 1.6), o = sm(hand);
  return { ikR: 1, ikL: 1, hRx: 2, hRy: 85, hRz: 22, hLx: 2, hLy: 85, hLz: -22, proR: 0, proL: 0, hea: 2 * u,
    hRhead: hand, hLhead: hand, hRhx: HC[0] + 4.5, hRhy: HC[1] - 9, hRhz: 9.6, hLhx: HC[0] + 4.5, hLhy: HC[1] - 9, hLhz: -9.6, eoR: .3 * o, eoL: .3 * o, edR: o, edL: o, holdR: o, holdL: o, curlR: .2, curlL: .2 }; } });
C('iso-neck', 'Isometric neck in four directions', { yaw: 25, focus: 'head', P(u) { const hand = first(u, 1.6), o = sm(hand);
  return { ikR: 1, hRx: 2, hRy: 85, hRz: 22, proR: 0, hRhead: hand, hRhx: HC[0] + 11.2, hRhy: HC[1] + 4.5, hRhz: 1.5, edR: o, holdR: o, curlR: .1, nec: -2 * u }; } });
const doorP = top => u => { const st = sm(u * 3), up = sin(PI * clamp(u * 3, 0, 1)), h = sm((u - .1) * 2.4), s = then(u, .5);
  return { fxR: 15 * st, liftR: 5 * up, wR: 1 - sm(Math.min(1, up * 1.3)), hipX: 6 * st + 10 * s, heelL: 16 * s, che: -2 - 7 * s, lum: -3 * s, nec: 2 * s,
    hW: 1, ikR: h, ikL: h, plantWall: 1, plantR: sm(h * 1.6), plantL: sm(h * 1.6), edR: h, edL: h, curlR: .3 - .26 * h, curlL: .3 - .26 * h,
    hRx: .6 - 7 * (1 - h) ** 2, hRy: 85 + (top - 85) * h, hRz: 41 - 22 * (1 - h), hLx: .6 - 7 * (1 - h) ** 2, hLy: 85 + (top - 85) * h, hLz: -41 + 22 * (1 - h) }; };
C('doorway-low', 'Doorway chest stretch, elbows low', { props: { door: { x: 8 } }, yaw: 58, pitch: 12, hold: true, P: doorP(132) });
C('doorway-high', 'Doorway chest stretch, elbows high', { props: { door: { x: 8 } }, yaw: 58, pitch: 12, hold: true, P: doorP(162) });
const oneArmDoor = (y, turn) => u => { const h = first(u), s = then(u);
  return { hipX: 5 * s, hipZ: 10, pelT: turn * s, cheT: turn * .4 * s, headT: turn * .5 * s, hW: 1, ikR: h, plantWall: 1, plantR: sm(h * 1.6), edR: h * .6, curlR: .3 - .26 * h,
    hRx: .6 - 7 * (1 - h) ** 2, hRy: 85 + (y - 85) * h, hRz: 41 - 10 * (1 - h), che: -2 - 4 * s }; };
C('wall-chest', 'Single-arm wall chest stretch', { props: { door: { x: 8 } }, yaw: 58, pitch: 12, hold: true, P: oneArmDoor(136, 26) });
C('biceps', 'Wall biceps stretch', { props: { door: { x: 8 } }, yaw: 58, pitch: 12, hold: true, P: oneArmDoor(118, 34) });
C('door-er', 'Doorway external rotation stretch', { props: { door: { x: 8 } }, yaw: 58, pitch: 12, P(u) { const h = first(u), s = then(u);
  return { hipX: -14 + 4 * s, hipZ: 22, pelT: 18 * s, cheT: 6 * s, hW: 1, ikR: h, plantWall: 1, plantR: sm(h * 1.6), edR: h, curlR: .3 - .26 * h, hRx: .6 - 7 * (1 - h) ** 2, hRy: 85 + 26 * h, hRz: 41 - 6 * (1 - h) }; } });
C('hands-behind', 'Hands clasped behind the back', { clasp: true, yaw: 28, P(u) { const h = first(u), s = then(u);
  return { ikR: h, ikL: h, hRx: -15 - 7 * s, hRy: 84 + 9 * s, hRz: 3.4, hLx: -15 - 7 * s, hLy: 84 + 9 * s, hLz: -3.4, curlR: .6, curlL: .6, che: -2 - 6 * s, shFR: -s, shFL: -s, nec: -3 * s }; } });
C('cross-body', 'Cross-body shoulder stretch', { clasp: true, yaw: 75, pitch: 10, P(u) { const h = first(u), s = then(u);
  return { ikR: h, hRx: 14, hRy: 128, hRz: -19 - 5 * s, proR: 60, curlR: .2, eoR: .2, ikL: h, hLx: 21, hLy: 124, hLz: 6 + 3 * s, eoL: .2, edL: .6, curlL: .5 }; } });
C('hug', 'Self-hug upper-back stretch', { clasp: true, yaw: 75, pitch: 10, P(u) { const h = first(u), s = then(u);
  return { ikR: h, hRx: 13, hRy: 133, hRz: -16, curlR: .3, edR: .3, ikL: h, hLx: 17, hLy: 121, hLz: 16, edL: .5, curlL: .3, che: -2 + 12 * s, lum: 4 * s, nec: 10 * s, shFR: s, shFL: s }; } });
C('triceps', 'Overhead triceps stretch', { clasp: true, yaw: 62, pitch: 8, P(u) { const h = first(u), s = then(u);
  return { flexR: 3 + 169 * h, elbR: 9 + 136 * h, abdR: 5 + 3 * h, proR: 14 - 14 * h, curlR: .2, ikL: h, hLx: 3, hLy: 85 + 82 * h, hLz: -22 + 34 * h, eoL: h, curlL: .45, lumS: 2 * s, nec: 4 * s }; } });
C('wall-lat', 'Wall lat stretch', { props: { blocks: [WALL(62)] }, yaw: 25, P(u) { const h = first(u), s = then(u);
  return { bal: 0, hipX: -34 * s, hipY: 93.5 - 3 * s, pel: 2 + 58 * s, lum: -2 * s, che: -2 - 8 * s, nec: -8 * s, hW: 1, ikR: h, ikL: h, plantWall: 1, plantR: sm(h * 1.6), plantL: sm(h * 1.6), curlR: .05, curlL: .05,
    hRx: 57.1, hRy: 85 + 60 * h - 14 * s, hRz: 15, hLx: 57.1, hLy: 85 + 60 * h - 14 * s, hLz: -15 }; } });
C('pendulum', 'Pendulum swings', { props: { blocks: [[36, 82, 66, 70, -30, 30, 'wood'], [40, 44, 0, 66, 24, 28, 'wood'], [40, 44, 0, 66, -28, -24, 'wood'], [76, 80, 0, 66, -28, -24, 'wood']] }, yaw: 30, pitch: 10, cont: true, period: 2.2, P(u, ph) { const a = TAU * ph;
  return { bal: 0, hipX: -22, hipY: 91, pel: 46, lum: 4, che: 2, nec: -10, fxL: 14, fxR: -12, hW: 1, ikL: 1, plantL: 1, hLx: 42, hLy: 72.9, hLz: -14, flexR: 12 * sin(a), abdR: 6 + 5 * cos(a), elbR: 4, curlR: .3 }; } });
C('arm-circles', 'Arm circles', { yaw: 62, pitch: 10, cont: true, period: 2.4, P(u, ph, cyc) { const a = TAU * ph, k = Math.min(1, .35 + .13 * cyc);
  return { abdR: 88 + 13 * k * sin(a), abdL: 88 + 13 * k * sin(a), flexR: 3 + 14 * k * cos(a), flexL: 3 + 14 * k * cos(a), elbR: 4, elbL: 4, proR: 60, proL: 60, curlR: .1, curlL: .1 }; } });
const wristP = (wf, pro) => u => { const h = first(u), s = then(u);
  return { flexR: 3 + 80 * h, elbR: 6, proR: mx(14, pro, h), wfR: wf * s, curlR: .1, abdR: 2, ikL: h, hLx: 51, hLy: 127 + (wf < 0 ? 8 : -9) * 1, hLz: 14, edL: .7, curlL: .55, nec: 6, hea: 4 }; };
C('wrist-flex', 'Wrist flexor stretch', { clasp: true, yaw: 50, pitch: 14, focus: 'hands', hold: true, P: wristP(-70, -80) });
C('wrist-ext', 'Wrist extensor stretch', { clasp: true, yaw: 50, pitch: 14, focus: 'hands', hold: true, P: wristP(70, 80) });
C('side-bend', 'Standing side bend', { yaw: 90, P(u) { const s = u, hz = 6.5 * s, y = 85 - 13 * s, f = (92.3 - y) / 85, cz = (-8.6 + hz) + (-1 - hz) * f, zw = cz - (9.6 - 6 * f) - 2.9;
  return { hipY: 93.5 - 2 * s, hipZ: hz, pelS: -4 * s, lumS: -19 * s, cheS: -20 * s, necS: -14 * s, abdR: 5 + 164 * s, rotR: -90 * s, elbR: 9 + 7 * s, flexR: 3 + 5 * s, wri: 3 - 3 * s, proR: 14 - 89 * s, curlR: .3 - .26 * s,
    ikL: 1, hLx: 2, hLy: y, hLz: zw - hz, proL: 0, curlL: .1, breath: .4 * s }; } });
C('itb', 'Standing cross-over hip stretch', { yaw: 90, P(u) { const st = first(u), s = then(u);
  return { fxR: -9 * st, fzR: 9.6 - 17 * st, fxL: 6 * st, liftR: 4 * sin(PI * st), wR: 1 - .7 * sin(PI * st), toR: 4, hipZ: 5 * s, pelS: -5 * s, lumS: -16 * s, cheS: -16 * s, necS: -8 * s,
    abdR: 5 + 160 * s, rotR: -90 * s, proR: 14 - 80 * s, curlR: .1, ikL: 1, eoL: .8, hLx: 1, hLy: 103, hLz: -18.5, proL: 60 }; } });
C('side-lunge', 'Side lunge adductor stretch', { yaw: 90, pitch: 10, P(u) { const s = u;
  return { footZ: 9.6 + 26 * first(u, 3), toe: 14, wR: 1, wL: 1 - .75 * s, hipY: 93.5 - 30 * s, hipX: -8 * s, pel: 2 + 22 * s, lum: 4 * s, nec: -8 * s,
    ikR: s, ikL: s, onThighR: 1, onThighL: 1, plantR: s, plantL: s, curlR: .15, curlL: .15 }; } });
C('sit-stand', 'Sit-to-stand / squat', { yaw: 0, P: squatP(1) });
C('deep-squat', 'Deep squat hold', { yaw: 25, P(u) { const p = squatP(1.28)(u); return { ...p, pel: 2 + 12 * u, lum: 30 * u, che: 14 * u, nec: -22 * u, flexR: 3 + 60 * u, flexL: 3 + 60 * u, abdR: 5 + 14 * u, abdL: 5 + 14 * u }; } });
C('heel-step', 'Standing hamstring stretch, heel on a step', { props: { blocks: [[18, 52, 0, 14, -22, 22, 'wood']] }, yaw: 20, P(u) { const st = first(u, 3), s = then(u);
  return { fxR: 30 * st, flR: 14 * ramp(.55, .9, st), liftR: 26 * sin(PI * st) ** .7 * (1 - ramp(.9, 1, st)), tuR: 22 * s, wR: 1 - .85 * st, hipX: -10 * s, pel: 2 + 42 * s, lum: 3 * s, nec: -8 * s, hipY: 93.5 - 2 * s,
    ikR: s, ikL: s, onThighR: 1, onThighL: 1, plantR: s, plantL: s, curlR: .15, curlL: .15 }; } });
C('leg-swing', 'Leg swings', { props: { door: { x: 2 } }, yaw: 30, P(u) { const a = mx(-26, 36, u);
  return { bal: 0, hipZ: 0, hipX: -3, wR: 0, freeR: 1, fxR: -3 + 82 * sin(a * R), liftR: 86 - 82 * cos(a * R) - 2, ankR: 0, hW: 1, ikL: 1, plantWall: 1, plantL: 1, hLx: -5.4, hLy: 108, hLz: -41, edL: .5, curlL: .05, flexR: 3 - a * .5, hipY: 93 }; } });
const wallCalf = bent => u => { const st = first(u, 3), s = then(u);
  return { bal: 0, fxL: 26 * st, fxR: -34 * st, liftR: 4 * sin(PI * st), hipX: -4 * st + 6 * s, hipY: 93.5 - 5 * st - (bent ? 9 : 2) * s, pel: 2 + 8 * s, wL: 1, wR: 1,
    hW: 1, ikR: first(u), ikL: first(u), plantWall: 1, plantR: first(u), plantL: first(u), curlR: .05, curlL: .05, hRx: 57.1, hRy: 132, hRz: 15, hLx: 57.1, hLy: 132, hLz: -15 }; };
C('calf-straight', 'Wall calf stretch, knee straight', { props: { blocks: [WALL(62)] }, yaw: 25, hold: true, P: wallCalf(false) });
C('calf-bent', 'Wall calf stretch, knee bent', { props: { blocks: [WALL(62)] }, yaw: 25, hold: true, P: wallCalf(true) });
C('heel-drop', 'Stair heel drop', { props: { blocks: [[4, 46, 0, 16, -24, 24, 'wood']], door: { x: 30 } }, yaw: 30, P(u) { return { bal: 0, flR: 16, flL: 16, hipY: 109.5 - 2.6 * u, heelR: -12 * u, heelL: -12 * u, hipX: 3, hW: 1, ikL: 1, plantWall: 1, plantL: 1, hLx: 22.6, hLy: 124, hLz: -41, edL: .5, curlL: .05 }; } });
C('toe-wall', 'Toe extension plantar fascia stretch', { props: { blocks: [WALL(34)] }, yaw: 25, focus: 'feet', barefoot: true, P(u) { const s = u;
  return { bal: 0, fxR: 17, tuR: 28 * s, fxL: -16, hipX: -2 + 5 * s, wR: .6, hW: 1, ikR: 1, ikL: 1, plantWall: 1, plantR: 1, plantL: 1, hRx: 29.1, hRy: 128, hRz: 15, hLx: 29.1, hLy: 128, hLz: -15, curlR: .05, curlL: .05 }; } });
C('balance', 'Single-leg balance', { yaw: 25, P: u => ({ liftL: 24 * u, fxL: -10 * u, wL: 1 - ramp(0, .2, u), abdR: 5 + 14 * u, abdL: 5 + 14 * u }) });
C('monster', 'Monster walk with band', { props: { band: { s: [['kneeR', 'kneeL']], rest: 24 } }, yaw: 80, pitch: 10, P(u) { const up = sin(PI * u);
  return { hipY: 85, hipX: -9, pel: 16, footZ: 13, fzR: 13 + 13 * u, liftR: 3 * up, wR: 1 - .7 * up, toe: 8, nec: -6, ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRy: 96, hRz: 19, hLx: 1, hLy: 96, hLz: -19, proR: 60, proL: 60 }; } });
C('suitcase', 'Suitcase carry', { props: { weight: {} }, yaw: 62, P: u => ({ curlR: .8, proR: 0, abdR: 7, lumS: 1.5 * u, shrR: -.15, breath: u * .5 }) });
C('rdl', 'Hip hinge (Romanian deadlift, light)', { props: { dumbbells: {} }, yaw: 15, P: u => ({ hipX: -19 * u, hipY: 93.5 - 7 * u, pel: 2 + 62 * u, lum: 2 * u, che: -2 - 2 * u, nec: -22 * u, hea: -8 * u, load: 1, ...GRIP, proR: 70, proL: 70, flexR: 3 + 6 * u, flexL: 3 + 6 * u, elbR: 5, elbL: 5 }) });
C('split-squat', 'Split squat', { yaw: 20, P: u => ({ fxR: 30, fxL: -36, heelL: 38 + 22 * u, hipY: 90 - 34 * u, hipX: -3, bal: 0, pel: 4, ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRy: mx(100, 66, u) + 0, hRz: 19, hLx: 1, hLy: mx(100, 66, u), hLz: -19, proR: 60, proL: 60 }) });
C('step-up', 'Step-up', { props: { blocks: [[12, 54, 0, 20, -24, 24, 'wood']] }, yaw: 25, P(u) { return { bal: 0, fxR: 24, flR: 20, hipX: mx(4, 22, u), hipY: mx(92, 113.5, u), fxL: mx(-8, 2, u), liftL: 26 * sm(u * 1.6), wL: 1 - ramp(0, .25, u), pel: mx(14, 2, u), flexL: 3 + 20 * (1 - u), flexR: 3 - 10 * (1 - u), elbR: 30, elbL: 30, curlR: .5, curlL: .5 }; } });
C('tke', 'Terminal knee extension', { props: { band: { s: [[[78, 46, 9.6], 'kneeR']], rest: 40 } }, yaw: 25, P: u => ({ bal: 0, fxR: 0, fxL: -22, heelL: 20, hipX: -6, hipY: mx(89.5, 92.8, u), heelR: mx(14, 0, u), ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRy: 100, hRz: 19, hLx: 1, hLy: 100, hLz: -19, proR: 60, proL: 60 }) });
C('calf-raise', 'Standing calf raise', { yaw: 0, P(u) { const a = 42 * u * R, lift = 11.5 * sin(a) + 7 * cos(a) - 7, fwd = 11.5 - 11.5 * cos(a) + 7 * sin(a);
  return { heelR: 42 * u, heelL: 42 * u, hipY: 93.5 + lift, hipX: fwd, pel: 2 - u, che: -2 - 2 * u, abdR: 5 + 5 * u, abdL: 5 + 5 * u, flexR: 3 - 4 * u, flexL: 3 - 4 * u }; } });
C('toe-raise', 'Toe raises and heel walks', { yaw: 20, P: u => ({ tuR: 26 * u, tuL: 26 * u, hipX: -5 * u, pel: 2 + 3 * u, abdR: 5 + 6 * u, abdL: 5 + 6 * u }) });
/* bands and weights (standing) */
C('band-row', 'Band row', { props: { door: { x: 96 }, band: { anchor: [93, 112, 0] } }, yaw: 28, P: u => ({ ...GRIP, pel: 3, flexR: mx(72, -32, u), flexL: mx(72, -32, u), elbR: mx(10, 118, u), elbL: mx(10, 118, u), abdR: 6, abdL: 6, proR: 20, proL: 20, shFR: mx(.6, -1, u), shFL: mx(.6, -1, u), che: -2 - 3 * u }) });
C('face-pull', 'Face pull', { props: { door: { x: 96 }, band: { anchor: [93, 150, 0] } }, yaw: 35, pitch: 10, P: u => ({ ...GRIP, ikR: 1, ikL: 1, eoR: 1, eoL: 1, hRx: mx(52, 15, u), hRy: mx(144, 152, u), hRz: mx(9, 27, u), hLx: mx(52, 15, u), hLy: mx(144, 152, u), hLz: mx(-9, -27, u), proR: 70, proL: 70, shFR: mx(.5, -1, u), shFL: mx(.5, -1, u) }) });
C('pulldown', 'Band or cable pull-down', { props: { door: { x: 34 }, band: { anchor: [34, 203, 0], rest: 70 } }, yaw: -24, P: u => ({ ...GRIP, flexR: mx(160, 28, u), flexL: mx(160, 28, u), elbR: mx(14, 118, u), elbL: mx(14, 118, u), abdR: 10, abdL: 10, proR: 60, proL: 60, shrR: mx(.4, -.2, u), shrL: mx(.4, -.2, u) }) });
C('pushdown', 'Band triceps push-down', { props: { door: { x: 34 }, band: { anchor: [34, 203, 0] } }, yaw: -24, P: u => ({ pel: 6, che: 0, elbR: 112 - 100 * u, elbL: 112 - 100 * u, proR: 82, proL: 82, ...GRIP, abdR: 5, abdL: 5, flexR: 4, flexL: 4, wfR: 6 * u, wfL: 6 * u }) });
C('pallof', 'Pallof press', { clasp: true, props: { band: { anchor: [6, 118, -96], rest: 62 } }, yaw: 55, pitch: 10, P: u => ({ ...GRIP, footZ: 13, hipY: 91, ikR: 1, ikL: 1, hRx: mx(17, 50, u), hRy: 121, hRz: 3.4, hLx: mx(17, 50, u), hLy: 121, hLz: -3.4, proR: 10, proL: 10, edR: .4, edL: .4 }) });
C('band-er', 'Band external rotation', { props: { band: { s: [[[10, 104, -80], 'handR']], rest: 62 } }, yaw: 62, pitch: 12, P: u => ({ curlR: .8, wri: 0, elbR: 90, proR: 0, flexR: 3, abdR: 4, rotR: mx(-52, 34, u) }) });
C('band-ir', 'Band internal rotation', { props: { band: { s: [[[10, 104, 86], 'handR']], rest: 40 } }, yaw: 62, pitch: 12, P: u => ({ curlR: .8, wri: 0, elbR: 90, proR: 0, flexR: 3, abdR: 4, rotR: mx(34, -52, u) }) });
C('pull-apart', 'Band pull-apart', { props: { band: { rest: 26 } }, yaw: 62, pitch: 10, P: u => ({ ...GRIP, ikR: 1, ikL: 1, eoR: 1, eoL: 1, hRx: mx(50, 22, u), hRy: 133, hRz: mx(13, 56, u), hLx: mx(50, 22, u), hLy: 133, hLz: mx(-13, -56, u), proR: 80, proL: 80, shFR: -u, shFL: -u }) });
C('lateral-raise', 'Lateral raise (light)', { props: { dumbbells: {} }, yaw: 70, pitch: 8, P: u => ({ ...GRIP, load: .6, abdR: 6 + 80 * u, abdL: 6 + 80 * u, flexR: 6, flexL: 6, elbR: 12, elbL: 12, proR: 50, proL: 50 }) });
C('press', 'Overhead press (light)', { props: { dumbbells: {} }, yaw: 40, P: u => ({ ...GRIP, load: .6, ikR: 1, ikL: 1, eoR: 1, eoL: 1, hRx: 9, hRy: mx(141, 186, u), hRz: mx(27, 20, u), hLx: 9, hLy: mx(141, 186, u), hLz: mx(-27, -20, u), proR: 80, proL: 80 }) });
C('shrug', 'Shrug (controlled)', { props: { dumbbells: {} }, yaw: 80, P: u => ({ ...GRIP, load: .6, shrR: u, shrL: u, proR: 0, proL: 0, abdR: 7, abdL: 7 }) });
C('hammer-curl', 'Hammer curl', { props: { dumbbells: {} }, yaw: 28, P: u => ({ load: 1, elbR: 8 + 128 * u, elbL: 8 + 128 * u, proR: 0, proL: 0, ...GRIP, abdR: 7, abdL: 7, flexR: 2 - 4 * u, flexL: 2 - 4 * u }) });
C('reverse-fly', 'Bent-over reverse fly', { props: { dumbbells: {} }, yaw: 50, pitch: 12, P: u => ({ ...GRIP, hipX: -17, hipY: 87, pel: 58, lum: 2, che: -4, nec: -24, hea: -6, ikR: 1, ikL: 1, eoR: 1, eoL: 1, hRx: 26, hRy: mx(62, 104, u), hRz: mx(11, 58, u), hLx: 26, hLy: mx(62, 104, u), hLz: mx(-11, -58, u), proR: mx(0, 60, u), proL: mx(0, 60, u) }) });
C('wall-slide', 'Wall slides', { props: { blocks: [WALL(40)] }, yaw: 35, pitch: 8, P: u => ({ bal: 0, hipX: -2, hW: 1, ikR: 1, ikL: 1, plantWall: 1, plantR: 1, plantL: 1, edR: 1, edL: 1, curlR: .05, curlL: .05, hRx: 35.1, hRy: mx(140, 178, u), hRz: 17, hLx: 35.1, hLy: mx(140, 178, u), hLz: -17 }) });
const handP = f => (u) => ({ flexR: 12, flexL: 12, elbR: 84, elbL: 84, abdR: 6, abdL: 6, nec: 8, hea: 6, wri: 0, ...f(u) });
C('wrist-curl', 'Wrist curl', { props: { dumbbells: {} }, yaw: 40, pitch: 16, focus: 'hands', P: handP(u => ({ proR: -80, proL: -80, curlR: .8, curlL: .8, wfR: mx(-32, 48, u), wfL: mx(-32, 48, u) })) });
C('reverse-wrist', 'Reverse wrist curl', { props: { dumbbells: {} }, yaw: 40, pitch: 16, focus: 'hands', P: handP(u => ({ proR: 84, proL: 84, curlR: .8, curlL: .8, wfR: mx(34, -48, u), wfL: mx(34, -48, u) })) });
C('grip', 'Towel squeeze', { yaw: 40, pitch: 16, focus: 'hands', P: handP(u => ({ proR: 10, proL: 10, curlR: mx(.45, 1, u), curlL: mx(.45, 1, u) })) });
C('finger-ext', 'Finger extension against a band', { yaw: 40, pitch: 16, focus: 'hands', P: handP(u => ({ proR: 60, proL: 60, curlR: mx(.7, 0, u), curlL: mx(.7, 0, u) })) });

/* ---------- on a chair ---------- */
const CH = { ...CHAIRP };
const chairC = (id, label, def) => C(id, label, { stance: 'chair', yaw: 50, pitch: 12, ...def });
chairC('seated-twist', 'Seated spinal twist', { yaw: 62, P(u) { const a = first(u, 1.6), s = then(u, .2), arc = sin(PI * a) ** 2;
  return { ...CH, cheT: 34 * s, lumT: 5 * s, headT: 44 * s, che: -2 * s, onThighR: 1 - a, plantR: 1 - sm(a * 4), hRx: 39, hRy: THIGH_REST - 4, hRz: -12, proR: 30, curlR: .1 + .25 * a,
    plantL: 1 - .1 * sin(PI * a), onThighL: 1 - a, hLx: 2, hLy: 50.8 + 9 * arc, hLz: -20.5 }; } });
chairC('seated-side', 'Seated quadratus lumborum stretch', { yaw: 90, P(u) { const h = first(u), s = then(u);
  return { ...CH, lumS: -17 * s, cheS: -19 * s, necS: -10 * s, pelS: -3 * s, onThighR: 1 - h, plantR: 1 - h, ikR: 1 - h, abdR: 5 + 165 * h, rotR: -90 * h, proR: 14 - 80 * h, elbR: 12, curlR: .1 }; } });
const fig4 = u => { const h = first(u, 1.8); return { freeR: h, wR: 1 - h, fxR: mx(CHX + 46, CHX + 37, h), liftR: mx(0, 48.5, h) + 10 * sin(PI * h), fzR: mx(9.6, -7, h), koR: .95 * h, kuR: -.5 * h, ankR: 10 * h }; };
chairC('seated-fig4', 'Seated figure-4 stretch', { clasp: true, yaw: 62, P(u) { const s = then(u, .5); return { ...CH, ...fig4(u), pel: 22 * s, lum: 3 + 4 * s, nec: -8 * s, onThighR: 1, onThighL: 1 }; } });
chairC('peroneal', 'Peroneal (outer calf) stretch', { clasp: true, yaw: 62, P(u) { const h = first(u, 1.8), s = then(u, .5); return { ...CH, ...fig4(u), pel: 10 * s, nec: 10 * s, onThighR: 1, onThighL: 1 - s, plantL: 1 - s, hLx: 47, hLy: 62, hLz: 3, curlL: .1 + .5 * s, ankR: 10 * h + 22 * s }; } });
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
const BELLY = { hRx: -9, hRy: 24, hRz: 5, hLx: -27, hLy: 26, hLz: -5, curlR: .1, curlL: .1, eoR: .6, eoL: .6 };      // one hand on the belly, one on the chest
const longLeg = (s, k = 1) => s > 0 ? { freeR: k, wR: 1 - k, fxR: mx(0, SX + 96, k), liftR: mx(0, 1.6, k), ankR: -14 * k } : { freeL: k, wL: 1 - k, fxL: mx(0, SX + 96, k), liftL: mx(0, 1.6, k), ankL: -14 * k };
['breathing', 'Diaphragmatic breathing', 'breath:belly', 'Diaphragmatic breathing, lying', 'pf-relax', 'Pelvic floor release breathing', 'scan', 'Body scan'].forEach((v, i, a) => { if (i % 2 === 0) supC(v, a[i + 1], { P: u => ({ ...SUPINE, ...BELLY, breath: u }) }); });
supC('breath:load', 'Diaphragm strength: loaded breathing', { props: { blocks: [[SX - 19, SX - 3, 21.5, 24.5, -9, 9, 'soft']] }, P: u => ({ ...SUPINE, breath: u }) });
supC('subocc-ball', 'Suboccipital release on tennis balls', { props: { ball: { at: [SX - 60.5, 3.3, 3.6], two: true } }, focus: 'head', yaw: 20, P: u => ({ ...SUPINE, headUp: 1, nec: NK0 + 9, hea: 6 * u }) });
supC('supine-chin', 'Supine chin tuck holds', { focus: 'head', yaw: 8, P: u => ({ ...SUPINE, hea: 12 * u }) });
supC('chin-lift', 'Chin tuck and lift', { focus: 'head', yaw: 8, P: u => ({ ...SUPINE, headUp: 1, nec: NK0 + 13 * u, hea: 11 + 3 * u }) });
supC('knees-chest', 'Knees to chest', { clasp: true, P(u) { const h = first(u, 1.6), s = then(u, .3);
  return { ...SUPINE, pel: -90 - 12 * h, lum: 12 * h, freeR: h, freeL: h, wR: 1 - h, wL: 1 - h, fxR: mx(0, SX + 21 - 4 * s, h), fxL: mx(0, SX + 21 - 4 * s, h), liftR: (37 + 2 * s) * h, liftL: (37 + 2 * s) * h, ankR: 10, ankL: 10,
    plantR: 1 - h, plantL: 1 - h, hRx: mx(14, 22 - 5 * s, h), hRy: mx(3, 45, h), hRz: mx(23, 13, h), hLx: mx(14, 22 - 5 * s, h), hLy: mx(3, 45, h), hLz: mx(-23, -13, h), eoR: .6 * h, eoL: .6 * h, curlR: .4, curlL: .4 }; } });
supC('knee-opp', 'Knee to opposite shoulder', { clasp: true, yaw: 25, pitch: 20, P(u) { const h = first(u, 1.6), s = then(u, .3);
  return { ...SUPINE, ...longLeg(-1, h), freeR: h, wR: 1 - h, fxR: mx(0, SX + 14, h), liftR: 40 * h, fzR: mx(9.6, 9.6 - 12 * s, h), ankR: 10, plantR: 1 - h, plantL: 1 - h,
    hRx: mx(14, 26, h), hRy: mx(3, 47, h), hRz: mx(23, 12 - 10 * s, h), hLx: mx(14, 24, h), hLy: mx(3, 49, h), hLz: mx(-23, -4 - 6 * s, h), eoR: .6 * h, eoL: .3 * h, curlR: .4, curlL: .4 }; } });
supC('figure4', 'Figure-4 stretch', { clasp: true, yaw: 30, pitch: 22, P(u) { const h = first(u, 1.6), s = then(u, .4);
  return { ...SUPINE, freeL: h, wL: 1 - h, fxL: mx(0, SX + 36 - 8 * s, h), liftL: (40 + 2 * s) * h, ankL: 6, freeR: h, wR: 1 - h, fxR: mx(0, SX + 26 - 8 * s, h), liftR: (44 + 2 * s) * h, fzR: mx(9.6, -6, h), koR: .9 * h, kuR: -.6 * h, ankR: 10,
    plantR: 1 - h, plantL: 1 - h, hRx: mx(14, 24 - 6 * s, h), hRy: mx(3, 38, h), hRz: mx(23, -2, h), hLx: mx(14, 24 - 6 * s, h), hLy: mx(3, 38, h), hLz: mx(-23, -19, h), curlR: .45, curlL: .45, eoL: .5 * h }; } });
supC('supine-twist', 'Supine twist', { yaw: 20, pitch: 28, P(u) { const s = u;
  return { ...SUPINE, freeR: s, freeL: s, wR: 1 - s, wL: 1 - s, roll: -38 * s, cheT: 30 * s, lumT: 8 * s, headT: 30 * s, fxR: mx(0, SX + 27, s), fxL: mx(0, SX + 30, s), liftR: 13 * s + 8 * sin(PI * s), liftL: 2 * s + 6 * sin(PI * s), fzR: mx(9.6, -30, s), fzL: mx(9.6, 33, s),
    koL: .6 * s, koR: -.6 * s, hRx: mx(14, -38, s), hRy: 3, hRz: mx(23, 50, s), hLx: mx(14, -38, s), hLy: 3, hLz: mx(-23, -50, s) }; } });
supC('supine-ham', 'Supine hamstring stretch with strap', { clasp: true, props: { band: { s: [['handR', 'footR'], ['handL', 'footR']], rest: 50 } }, yaw: 15, P(u) { const a = mx(42, 84, u) * R;
  return { ...SUPINE, ...longLeg(-1), freeR: 1, wR: 0, fxR: SX + 84 * cos(a), liftR: 84 * sin(a) + 2, ankR: 4, kuR: 0, ikR: 1, ikL: 1, plantR: 0, plantL: 0, ...GRIP, hRx: 6 + 10 * cos(a), hRy: 42, hRz: 8, hLx: 6 + 10 * cos(a), hLy: 42, hLz: -8, eoR: .5, eoL: .5 }; } });
supC('curl-up', 'McGill curl-up', { P: u => ({ ...SUPINE, ...longLeg(-1), headUp: 1, nec: NK0 + 8 * u, che: 12 * u, lum: 3 * u, hRx: 1, hRz: 21, hLx: 1, hLz: -21 }) });
supC('deadbug', 'Dead bug', { yaw: 0, pitch: 12, P(u) { const top = 47.5, legX = SX + 42;
  return { ...SUPINE, ikR: 0, ikL: 0, plantR: 0, plantL: 0, freeR: 1, freeL: 1, wR: 0, wL: 0, elbR: 3, elbL: 3, proR: 0, proL: 0, curlR: .12, curlL: .12, wri: 0, flexR: 180 + 76 * u, flexL: 180, abdR: 3, abdL: 3, fxL: legX + 37 * u, liftL: top - 38 * u, fxR: legX, liftR: top, ankL: 8 * u }; } });
const bridgeP = one => u => ({ ...SUPINE, fxR: SX + 49, fxL: SX + 49, pel: mx(-90, -64, u), lum: -4 * u, hRx: 16, hLx: 16, ...(one ? { freeL: 1, wL: 0, fxL: SX + 49 + 30 * u, liftL: 4 + 40 * u, ankL: 0 } : {}) });
supC('bridge', 'Glute bridge', { P: bridgeP(false) });
supC('sl-bridge', 'Single-leg bridge', { P: bridgeP(true) });
supC('thoracic-roll', 'Thoracic extension over a foam roll', { clasp: true, props: { roller: { x: SX - 33 } }, P(u) { return { ...SUPINE, rest: 0, hipY: 10.5, pel: -73, lum: -4 - 3 * u, che: -4 - 8 * u, headUp: 1, nec: 2 - 6 * u, ikR: 1, ikL: 1, plantR: 0, plantL: 0, hRx: 0, hLx: 0, hRy: 30, hLy: 30,
  hRhead: 1, hLhead: 1, hRhx: HC[0] - 8, hRhy: HC[1] + 6, hRhz: 5, hLhx: HC[0] - 8, hLhy: HC[1] + 6, hLhz: -5, eoR: 1, eoL: 1, holdR: 1, holdL: 1, curlR: .15, curlL: .15 }; } });
supC('thomas', 'Thomas-position hip flexor stretch', { clasp: true, props: { blocks: [[SX - 125, SX + 6, 0, 48, -40, 40, 'soft']] }, yaw: 18, pitch: 10, P(u) { const s = u;
  return { ...SUPINE, seat: 48, hipY: 60, freeL: 1, wL: 0, fxL: SX + 16, liftL: 48 + 40, ankL: 8, freeR: 1, wR: 0, fxR: SX + 40 + 2 * s, liftR: mx(34, 22, s), kuR: mx(1, .2, s) - 1, ankR: 0,
    plantR: 0, plantL: 0, hRx: 22, hRy: 97, hRz: 5, hLx: 22, hLy: 95, hLz: -13, curlR: .45, curlL: .45, eoR: .4, eoL: .4 }; } });
supC('hip-thrust', 'Hip thrust', { props: { blocks: [[SX - 62, SX - 26, 0, 40, -40, 40, 'wood']] }, yaw: 15, P: u => ({ ...SUPINE, rest: 0, headUp: 1, hipY: mx(29, 50.5, u), hipX: SX + mx(-3, 0, u), pel: mx(-56, -90, u), nec: mx(24, 6, u), fxR: SX + 42, fxL: SX + 42, ikR: 0, ikL: 0, plantR: 0, plantL: 0, flexR: 150, flexL: 150, elbR: 70, elbL: 70, abdR: 12, abdL: 12 }) });

/* ---------- sitting on the mat ---------- */
const sitC = (id, label, def) => C(id, label, { stance: 'sit', yaw: 40, pitch: 16, ...def });
const TALL = { ...SIT, pel: -4, lum: 6, che: 0, nec: 0, plantR: 0, plantL: 0, ikR: 0, ikL: 0 };
sitC('butterfly', 'Butterfly stretch', { yaw: 62, P(u) { const s = u;
  return { ...SIT, kpU: .1, kpO: .9, freeR: 1, freeL: 1, wR: 0, wL: 0, fxR: SX + 31, fxL: SX + 31, liftR: -.1, liftL: -.1, footZ: 7.6, toe: 0, ankR: 6, ankL: 6, soles: 1, pel: -8 + 16 * s, lum: 8 + 4 * s, che: 2 + 4 * s, nec: 2 - 6 * s, hea: -2 * s,
    plantR: 1, plantL: 1, palmIn: 1, eoR: .7, eoL: .7, hRx: 31, hRy: 12.7, hRz: 11, hLx: 31, hLy: 12.7, hLz: -11, curlR: .12, curlL: .12 }; } });
sitC('seated-ham', 'Seated hamstring stretch', { clasp: true, yaw: 25, P(u) { const s = u;
  return { ...TALL, kpU: 0, ...longLeg(1), freeL: 1, wL: 0, fxL: SX + 30, liftL: -1.5, fzL: 5, koL: .96, ankL: 20, pel: -2 + 26 * s, lum: 8 + 8 * s, che: 4 * s, nec: -4 * s, ikR: 1, ikL: 1, hRx: 40 + 26 * s, hRy: 17 - 4 * s, hRz: 14, hLx: 40 + 26 * s, hLy: 17 - 4 * s, hLz: 5, curlR: .2, curlL: .2 }; } });
const bandFoot = dir => u => ({ ...TALL, kpU: 0, ...longLeg(1), ...longLeg(-1), pel: -12, lum: 10, ikR: 1, ikL: 1, plantR: 1, plantL: 1, hRx: -16, hRy: 3, hRz: 22, hLx: -16, hLy: 3, hLz: -22, toR: dir * 22 * u });
sitC('band-eversion', 'Band eversion', { props: { band: { s: [['footR', [SX + 96, 6, -34]]], rest: 30 } }, yaw: 50, pitch: 22, focus: 'feet', P: bandFoot(1) });
sitC('band-inversion', 'Band inversion', { props: { band: { s: [['footR', [SX + 96, 6, 48]]], rest: 30 } }, yaw: 50, pitch: 22, focus: 'feet', P: bandFoot(-1) });
sitC('9090', '90/90 hip stretch', { yaw: 62, pitch: 22, P(u) { const s = u;
  return { ...TALL, kpU: 0, freeR: 1, freeL: 1, wR: 0, wL: 0, fxR: SX + 60, liftR: -2, fzR: 2, koR: 1, ankR: 0, fxL: SX - 24, liftL: -2, fzL: 62, koL: 1, kxL: .5, ankL: 0,
    pel: 4 + 20 * s, lum: 6 + 6 * s, nec: -6 * s, pelT: 0, ikR: 1, ikL: 1, plantR: 1, plantL: 1, hRx: 34 + 18 * s, hRy: 3, hRz: 40, hLx: 40 + 18 * s, hLy: 3, hLz: -24, curlR: .05, curlL: .05 }; } });
sitC('pigeon', 'Pigeon pose', { yaw: 50, pitch: 20, P(u) { const s = u;
  return { ...TALL, kpU: 0, freeR: 1, freeL: 1, wR: 0, wL: 0, fxR: SX + 56, liftR: -2, fzR: -4, koR: 1, ankR: 0, fxL: SX - 84, liftL: -3, kuL: -1, ankL: -60, pel: 18 + 22 * s, lum: -10 + 14 * s, che: -4 + 6 * s, nec: -8 * s,
    ikR: 1, ikL: 1, plantR: 1, plantL: 1, hRx: 46 + 20 * s, hRy: 3, hRz: 30, hLx: 46 + 20 * s, hLy: 3, hLz: -24, curlR: .05, curlL: .05 }; } });

/* ---------- all fours and kneeling ---------- */
const flC = (id, label, def) => C(id, label, { stance: 'floor', yaw: 15, pitch: 12, ...def });
const catP = u => { const lum = mx(-23, 36, u), che = mx(-17, 32, u); return { ...QUAD, pel: quadPel(80, lum, che), lum, che, nec: mx(-26, 24, u), hea: mx(-10, 10, u), breath: 1 - u }; };
flC('cat-cow', 'Cat-cow', { yaw: 0, P: catP }); flC('wu-cat', 'Cat-cow', { yaw: 0, P: catP });
flC('thread', 'Thread the needle', { yaw: 32, pitch: 20, P(u) { const s = u, a = u, lum = 6 * s, che = 12 * s;
  return { ...QUAD, pel: quadPel(80 + 31 * s, lum, che), lum, che, lumT: -6 * s, cheT: -35 * s, nec: 4 + 4 * s, headT: -20 * s, plantL: 1 - ramp(0, .2, a), hLx: 43 - 33 * a, hLy: 3 + 1.3 * a + 5 * sin(PI * a), hLz: -16.5 + 49 * a, proL: 88 - 86 * ramp(0, .5, a), wfL: -85 + 82 * ramp(0, .45, a), curlL: .12 * a }; } });
flC('birddog', 'Bird-dog', { yaw: 12, P(u) { const s = u;
  return { ...QUAD, plantR: 1 - ramp(0, .25, s), hRx: 43 + 44 * s, hRy: 3 + 55 * s, hRz: 16.5, proR: 88 - 60 * s, wfR: -85 * (1 - ramp(0, .4, s)), curlR: .1 * s,
    kdL: 1 - s, kneelL: 1 - s, freeL: s, fxL: mx(KFX, KNX - 86, s), liftL: mx(0, 43, s), kuL: -s, ankL: 20 * s, heelL: TUCK * (1 - s), nec: 4 - 4 * s }; } });
const childP = side => u => { const s = u; return { ...QUAD, knZ: 13, footZ: 12, hipX: KNX - 36 * s, pel: 80 - 14 * s, lum: 44 * s, che: 26 * s, nec: 4 + 14 * s, hRx: 43 + 49 * s, hLx: 43 + 49 * s, hRz: 16.5 + side * 26 * s, hLz: -16.5 + side * 26 * s, lumS: -side * 10 * s, cheS: -side * 10 * s, elbR: 4, elbL: 4 }; };
flC('prayer', 'Prayer stretch (extended child pose)', { hold: true, P: childP(0) });
flC('child-side', 'Child pose with side reach', { yaw: 35, pitch: 24, hold: true, P: childP(1) });
flC('frog', 'Frog stretch', { yaw: 62, pitch: 24, P: u => ({ ...QUAD, knZ: 9 + 22 * u, footZ: 9 + 26 * u, hipX: KNX - 9 * u, pel: 82, hRx: 43 - 10 * u, hLx: 43 - 10 * u }) });
flC('kneel-shin', 'Kneeling shin stretch', { yaw: 20, P: u => ({ ...QUAD, heelR: TUCK * (1 - u), heelL: TUCK * (1 - u), hipX: KNX - 36, pel: 2 - 8 * u, lum: 2, che: -2, nec: 0, ikR: 1, ikL: 1, plantR: 1, plantL: 1, onThighR: 1, onThighL: 1, proR: 14, proL: 14, wfR: 0, wfL: 0, flexR: 3, flexL: 3, curlR: .1, curlL: .1 }) });
flC('nordic', 'Nordic hamstring curl (assisted)', { yaw: 10, P(u) { const a = 36 * u; return { ...QUAD, hipX: KNX + 44 * sin(a * R), pel: a + 2, lum: 0, che: -2, nec: -a * .5, ikR: 0, ikL: 0, plantR: 0, plantL: 0, flexR: 40 + a, flexL: 40 + a, elbR: 112, elbL: 112, proR: 80, proL: 80, wfR: -40, wfL: -40, curlR: .1, curlL: .1, abdR: 8, abdL: 8 }; } });
const HK = { bal: 0, knX: -24, kdL: 1, kneelL: 1, fxL: KN.fx(-24), heelL: 0, fxR: 30, wR: 1, wL: 0, toe: 4, ikR: 1, ikL: 1, eoR: .8, eoL: .8, hRx: 1, hRz: 19, hLx: 1, hLz: -19, proR: 60, proL: 60, curlR: .35, curlL: .35 };
const hkHands = y => ({ hRy: y, hLy: y });
flC('half-kneel', 'Half-kneeling hip flexor stretch', { yaw: 20, P: u => ({ ...HK, hipX: -24 + 6 + 16 * u, pel: -2 - 5 * u, lum: -2 * u, ...hkHands(60 - 5 * u) }) });
flC('half-kneel-reach', 'Half-kneeling psoas stretch with reach', { yaw: 35, P: u => ({ ...HK, hipX: -24 + 6 + 16 * u, pel: -2 - 5 * u, ...hkHands(60 - 5 * u), ikL: 1 - first(u), abdL: 5 + 168 * first(u), rotL: -90 * first(u), proL: mx(60, -60, first(u)), lumS: 9 * then(u), cheS: 10 * then(u), necS: 5 * then(u), curlL: .1 }) });
flC('couch', 'Couch stretch', { props: { blocks: [[-52, -48, 0, 70, -30, 30, 'wall']] }, yaw: 20, P: u => ({ ...HK, kneelL: 0, fxL: -24 - 13, liftL: 30, hipX: -24 + 20 - 10 * u, pel: 12 - 14 * u, fxR: 34, ...hkHands(mx(56, 62, u)) }) });
flC('knee-wall', 'Knee-to-wall ankle mobility', { props: { blocks: [WALL(46)] }, yaw: 20, P: u => ({ ...HK, fxR: 22, hipX: -24 + 6 + 15 * u, pel: 4, ...hkHands(60 - 3 * u) }) });
flC('wgs', "World's greatest stretch", { yaw: 30, pitch: 14, P(u) { const s = u;
  return { bal: 0, fxR: 34, fxL: -66, heelL: 58, hipX: -8, hipY: 50, pel: 28, lum: 18, che: 10, nec: -10 - 10 * s, cheT: 30 * s, lumT: 6 * s, headT: 40 * s, hW: 1, ikL: 1, plantL: 1, hLx: 30, hLy: 3, hLz: -14, curlL: 0,
    ikR: 1, plantR: 1 - ramp(0, .2, s), hRx: 38 - 14 * s, hRy: 3 + 108 * s, hRz: 30 + 14 * s, eoR: s, curlR: .05 }; } });
/* planks and push-ups: a straight line from the shoulders to the ankles, toes tucked */
const PL = (hx, hy, pel) => ({ bal: 0, hipX: hx, hipY: hy, pel, lum: 0, che: 0, nec: -10, fxR: -92.7, fxL: -92.7, heelR: 65, heelL: 65, toe: 0, footZ: 8, hW: 1, ikR: 1, ikL: 1, plantR: 1, plantL: 1, curlR: 0, curlL: 0 });
flC('pushup', 'Push-up (incline if needed)', { yaw: 10, P: u => ({ ...PL(mx(.7, 6.1, u), mx(45.1, 19.6, u), mx(69.2, 86.6, u)), hRx: 41, hRy: 3, hRz: 19, hLx: 41, hLy: 3, hLz: -19, eoR: .35, eoL: .35 }) });
flC('scap-pushup', 'Scapular push-up (push-up plus)', { yaw: 10, P: u => ({ ...PL(.7, 45.1 + 1.6 * u, 69.2), che: mx(-5, 9, u), shFR: mx(-1, 1, u), shFL: mx(-1, 1, u), hRx: 41, hRy: 3, hRz: 17, hLx: 41, hLy: 3, hLz: -17 }) });
flC('plank', 'Front plank', { yaw: 10, P: u => ({ ...PL(5.4, 26.9, 81.7), hRx: 73, hRy: 3, hRz: 14, hLx: 73, hLy: 3, hLz: -14, edR: 1, edL: 1, breath: u }) });
flC('downdog', 'Downward dog', { yaw: 8, P: u => ({ bal: 0, hipX: mx(-4, 4, u), hipY: mx(70, 83, u), pel: mx(100, 122, u), lum: 14 * u, che: 6 * u, nec: 8, fxR: -34, fxL: -34, footZ: 9, hW: 1, ikR: 1, ikL: 1, plantR: 1, plantL: 1, hRx: 70, hRy: 3, hRz: 16, hLx: 70, hLy: 3, hLz: -16, curlR: 0, curlL: 0 }) });

/* ---------- lying face down ---------- */
const PX = -18, PRONE = { bal: 0, rest: 1, headUp: 1, hipX: PX, hipY: 12, pel: 90, lum: 0, che: 0, nec: -12, kpU: -1, freeR: 1, freeL: 1, wR: 0, wL: 0, fxR: PX - 96, fxL: PX - 96, liftR: -2.2, liftL: -2.2, ankR: 62, ankL: 62, toe: 0, footZ: 9, ikR: 1, ikL: 1, curlR: .1, curlL: .1 };
const prC = (id, label, def) => C(id, label, { stance: 'floor', yaw: 15, pitch: 16, ...def });
const armsP = (x, y, z, eo = .6) => ({ hRx: x, hRy: y, hRz: z, hLx: x, hLy: y, hLz: -z, eoR: eo, eoL: eo });
prC('prone-T', 'Prone T raise', { yaw: 50, pitch: 22, P: u => ({ ...PRONE, ...armsP(42, mx(5, 25, u), 66), proR: 30, proL: 30, shFR: -u, shFL: -u }) });
prC('prone-Y', 'Prone Y raise', { yaw: 35, pitch: 22, P: u => ({ ...PRONE, ...armsP(86, mx(5, 23, u), 44), proR: 0, proL: 0 }) });
prC('prone-W', 'Prone W external rotation', { yaw: 50, pitch: 22, P: u => ({ ...PRONE, ...armsP(58, mx(5, 22, u), 44, 1), proR: 60, proL: 60, shFR: -u, shFL: -u }) });
prC('prone-neck', 'Prone neck extension holds', { focus: 'head', yaw: 20, P: u => ({ ...PRONE, ...armsP(-8, 4, 23, .2), proR: -60, proL: -60, nec: mx(-6, -28, u), hea: -4 * u }) });
prC('superman', 'Back extension holds', { P: u => ({ ...PRONE, ...armsP(94, 6 + 16 * u, 18, .4), lum: -13 * u, che: -9 * u, nec: -12 - 8 * u, liftR: -2.2 + 10 * u, liftL: -2.2 + 10 * u }) });
prC('sphinx', 'Sphinx and cobra', { P: u => ({ ...PRONE, lum: -22 * u, che: -17 * u, nec: -12 - 6 * u, hW: 0, plantR: 1, plantL: 1, ...armsP(mx(66, 61, u), 3, 16, 0), edR: 1, edL: 1, curlR: 0, curlL: 0 }) });
prC('ham-curl', 'Hamstring curl (band or ball)', { clasp: true, props: { band: { s: [['ankleR', [PX - 128, 5, 9]], ['ankleL', [PX - 128, 5, -9]]], rest: 34 } }, P(u) { const a = 100 * u * R, fx = PX - 46 - 46 * cos(a), lf = 42 * sin(a) - 1.2;
  return { ...PRONE, ...armsP(62, 4, 7, 1), plantR: 1, plantL: 1, fxR: fx, fxL: fx, liftR: lf, liftL: lf, ankR: 62 - 50 * u, ankL: 62 - 50 * u, nec: -6 }; } });
prC('breath:croc', 'Crocodile breathing', { clasp: true, P: u => ({ ...PRONE, ...armsP(62, 4, 7, 1), plantR: 1, plantL: 1, nec: -6, breath: u }) });

/* ---------- lying on the side (on the left side, facing the viewer; the top side is the one that works) ---------- */
const SDX = -26, SIDE = { bal: 0, rest: 1, headUp: 1, hipX: SDX, hipY: 18, pel: 90, roll: -90, nec: 0, necS: 0, kpU: 0, koR: 1, koL: -1, freeR: 1, freeL: 1, wR: 0, wL: 0, toe: 0,
  hW: 1, ikL: 1, hLx: SDX + 96, hLy: 3, hLz: 4, proL: 0, curlL: .1, ikR: 1, hRx: SDX + 30, hRy: 3.2, hRz: 34, plantR: 1, curlR: .05 };
const sideLegs = (flex, knee, topUp = 0, spread = 0) => { const f = flex * R, k = knee * R, kx = -44 * cos(f), kz = 44 * sin(f), ax = kx - 42 * cos(f - k), az = kz + 42 * sin(f - k);      // hip flexed toward the viewer, knee bent back
  return { fxL: SDX + ax, fzL: -az, liftL: -1.6, fxR: SDX + ax, fzR: az + spread, liftR: 13.5 + topUp, ankR: 0, ankL: 0 }; };
const sdC = (id, label, def) => C(id, label, { stance: 'floor', yaw: 8, pitch: 20, ...def });
sdC('clam', 'Clamshell', { P: u => ({ ...SIDE, ...sideLegs(45, 90), kuR: .9 * u, liftR: 13.5 + 3 * u }) });
sdC('side-leg', 'Side-lying hip abduction', { P(u) { const a = 34 * u * R; return { ...SIDE, ...sideLegs(18, 36), fxR: SDX - 85 * cos(a), fzR: 0, liftR: 19 + 85 * sin(a) - 8, ankR: 0 }; } });
sdC('breath:side', 'Side-lying with rib expansion', { P: u => ({ ...SIDE, ...sideLegs(40, 70), breath: u, plantR: 0, hW: 0, hRx: 22, hRy: 36, hRz: 6, eoR: 1 }) });
sdC('open-book', 'Open book rotation', { yaw: 15, pitch: 30, P(u) { const a = u * 150 * R;
  return { ...SIDE, ...sideLegs(80, 90), cheT: -34 * u, lumT: -7 * u, headT: -50 * u, plantR: 0, hRx: SDX + 42, hRy: 8 + 52 * sin(a), hRz: 52 * cos(a) + 4, proR: 0, eoR: .5, hLz: 40, hLx: SDX + 44, plantL: 0 }; } });
sdC('sleeper', 'Sleeper stretch', { clasp: true, yaw: 20, pitch: 26, P(u) { const a = mx(15, 62, then(u, .2)) * R;
  return { ...SIDE, ...sideLegs(40, 70), hLx: SDX + 42 - 26 * sin(a), hLy: 5 + 26 * cos(a), hLz: 33, edL: 0, proL: 0, curlL: .3, plantR: 0, hRx: SDX + 42 - 24 * sin(a), hRy: 9 + 24 * cos(a), hRz: 36.5, curlR: .5, eoR: .6 }; } });
const sidePlank = { bal: 0, hipX: -10, hipY: 25.7, pel: 90, pelT: -10, roll: -90, headUp: 1, nec: 0, kpU: 0, koR: 1, koL: -1, freeR: 1, freeL: 1, wR: 0, wL: 0, hW: 1, ikL: 1, plantL: 1, edL: 1, hLx: 31, hLy: 3, hLz: 24, curlL: 0, ikR: 1, eoR: 1, hRx: -8, hRy: 46, hRz: 4, curlR: .3 };
sdC('side-plank', 'Side plank', { P: u => ({ ...sidePlank, fxL: -10 - 85, fzL: 0, liftL: -2.4, fxR: -10 - 85, fzR: 0, liftR: 8, breath: u }) });
sdC('copenhagen', 'Copenhagen adduction plank', { props: { blocks: [[-118, -72, 0, 36, -24, 24, 'wood']] }, P: u => ({ ...sidePlank, hipY: 38, pelT: 6, fxR: -10 - 84, fzR: 0, liftR: 36.5, fxL: -10 - 46, fzL: 0, liftL: mx(4, 22, u), kuL: -.4, hRy: 58 }) });

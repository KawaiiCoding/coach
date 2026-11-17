/* Moves: the base pose and every exercise. ADD NEW MOVES HERE (see the note above the trap stretch). */
/* ---------- poses: every exercise is a function of time returning joint angles (degrees, forward = +) ---------- */
const BASE = { hipX: 0, hipY: 93.5, hipZ: 0, pel: 2, lum: 0, che: -2, nec: 0, hea: 0, lumS: 0, cheS: 0, necS: 0, flexR: 3, flexL: 3, abdR: 5, abdL: 5, elbR: 9, elbL: 9, wri: 3, breath: 0, curlR: .3, curlL: .3, wfR: 0, wfL: 0, proR: 14, proL: 14, rotR: 0, rotL: 0, pelT: 0, lumT: 0, cheT: 0, headT: 0, heelR: 0, heelL: 0, fxR: 0, fxL: 0, liftR: 0, liftL: 0, kneelR: 0, kneelL: 0, footZ: 9.6, toe: 7, pelS: 0, ikL: 0, hLx: 0, hLy: 60, hLz: -19, ikR: 0, hRx: 0, hRy: 60, hRz: 19, knX: -11, plantR: 0, plantL: 0, bal: 1, kdR: 0, kdL: 0, wR: 1, wL: 1,
  fzR: -99, fzL: -99, toR: -99, toL: -99, kpU: 0, kpO: 0, freeR: 0, freeL: 0, ankR: 0, ankL: 0, rest: 0, headUp: 0, hRhead: 0, hLhead: 0, hRhx: 0, hRhy: 0, hRhz: 0, hLhx: 0, hLhy: 0, hLhz: 0, eoR: 0, eoL: 0, holdR: 0, holdL: 0,
  efR: 0, efL: 0, epR: 0, epL: 0, eRx: 0, eRy: 0, eRz: 0, eLx: 0, eLy: 0, eLz: 0, hugR: 0, hugL: 0, roll: 0, shrR: 0, shrL: 0, shFR: 0, shFL: 0, kuR: 0, kuL: 0, koR: 0, koL: 0, kxR: 0, kxL: 0, flR: 0, flL: 0, tuR: 0, tuL: 0, knZ: 9, ballY: 3.3,
  seat: 0, soles: 0, palmIn: 0, onThighR: 0, onThighL: 0, hW: 0, plantWall: 0, edR: 0, edL: 0, load: 0, ballX: 0, ballZ: 0 };      // seat: height of what the body rests on; hW: hand targets fixed in the room; edR/edL: elbow low; load: weight held      // wR, wL: share of weight on each foot
// rise, hold, lower, rest: one rep every 5.2 s, eased with a quintic so speed is zero at both ends
const rep = (t, P = 5.2) => { const u = (((t % P) + P) % P) / P; return u < .36 ? smoother(u / .36) : u < .52 ? 1 : u < .9 ? 1 - smoother((u - .52) / .38) : 0; };
const EX = {
  squat: { label: 'Squat', yaw: 0, pose(t) { const s = rep(t), a = rep(t - .14);
    return { footZ: 13.5, toe: 16, hipX: -25 * s, hipY: 93 - 52 * s, pel: 2 + 34 * s, lum: 8 * s, che: -2 - 3 * s, nec: -14 * s, hea: -8 * s,
      // arms float forward as a counterweight: just under shoulder height, elbows soft, palms turned down and in, fingers long but relaxed
      flexR: 3 + 79 * a, flexL: 3 + 78 * rep(t - .2), abdR: 5 - 2 * a, abdL: 5 - 2 * a, elbR: 9 + 5 * a, elbL: 9 + 5 * a, wri: 3 - 3 * a, proR: 14 + 50 * a, proL: 14 + 50 * a, curlR: .3 - .14 * a, curlL: .3 - .14 * a }; } },
  reach: { label: 'Reach up', yaw: 0, pose(t) { const s = rep(t), b = rep(t - .1);
    return { che: -2 - 3 * s, nec: -3 * s, hea: -6 * s, flexR: 3 + 175 * s, flexL: 3 + 174 * b, abdR: 5 + 3 * s, abdL: 5 + 3 * b, elbR: 9 - 5 * s, elbL: 9 - 5 * b, curlR: .3 - .26 * s, curlL: .3 - .26 * b, proR: 14 - 14 * s, proL: 14 - 14 * b, wfR: -6 * s, wfL: -6 * b, breath: s }; } },
  side: { label: 'Side bend', yaw: 90, pose(t) { const s = rep(t), a = rep(t + .12);
    // a long C-curve through the whole spine, hips drifting the other way, top arm reaching over, lower hand sliding down the thigh
    // lower hand: flat on the OUTSIDE of the thigh, sliding down it (its target follows the leg's surface, so it can never pass into the body)
    const hz = 6.5 * s, y = 85 - 13 * s, f = (92.3 - y) / 85, cz = (-8.6 + hz) + (-1 - hz) * f, zw = cz - (9.6 - 6 * f) - 2.9;
    return { hipY: 93.5 - 2 * s, hipZ: hz, pelS: -4 * s, lumS: -19 * s, cheS: -20 * s, necS: -14 * s,
      // top arm: lifts out to the side and over; the upper arm turns outward on the way up, so the palm ends facing in toward the head, fingers long
      abdR: 5 + 164 * a, rotR: -90 * a, elbR: 9 + 7 * a, flexR: 3 + 5 * a, wri: 3 - 3 * a, proR: 14 - 89 * a, curlR: .3 - .26 * a,
      ikL: 1, hLx: 2, hLy: y, hLz: zw - hz, proL: 0, curlL: .1, breath: .4 * s }; } },
};
const TAU = Math.PI * 2;
Object.assign(EX, {
  // open and close the hands while the wrists roll: fingers, thumbs, wrists and forearms all move
  hands: { label: 'Hands', yaw: 38, pose(t) { const c = .5 - .5 * Math.cos(TAU * t / 2.6), w = Math.sin(TAU * t / 5.2), tw = Math.sin(TAU * t / 5.2 + 1.2);
    return { flexR: 66, flexL: 66, abdR: 12, abdL: 12, elbR: 22, elbL: 22, proR: 55 + 30 * tw, proL: 55 + 30 * tw, wfR: 34 * w, wfL: 34 * w, curlR: c, curlL: c, wri: 0, hea: 6, nec: 4 }; } },
  // easy trunk rotation: the spine turns in stages (hips a little, waist more, ribs most) and the head follows
  twist: { label: 'Twist', yaw: 90, pose(t) { const w = Math.sin(TAU * t / 5.2), e2 = Math.sign(w) * smoother(Math.abs(w));
    return { pelT: 9 * e2, lumT: 7 * e2, cheT: 35 * e2, headT: 40 * e2, flexR: 20 - 6 * e2, flexL: 20 + 6 * e2, abdR: 16, abdL: 16, elbR: 96, elbL: 96, rotR: -18, rotL: -18, proR: 20, proL: 20, curlR: .55, curlL: .55, wri: 0 }; } },
  // heel raise: the ankle lifts over the ball of the foot, the shoe bends at the toes, the body rises with it
  calf: { label: 'Calf raise', yaw: 0, pose(t) { const s = rep(t), a = 42 * s * R, lift = 11.5 * Math.sin(a) + 7 * Math.cos(a) - 7, fwd = 11.5 - 11.5 * Math.cos(a) + 7 * Math.sin(a);
    return { heelR: 42 * s, heelL: 42 * s, hipY: 93.5 + lift, hipX: fwd, pel: 2 - s, che: -2 - 2 * s, abdR: 5 + 5 * s, abdL: 5 + 5 * s, flexR: 3 - 4 * s, flexL: 3 - 4 * s, curlR: .3, curlL: .3 }; } },
});
// all fours: knees under hips, hands under shoulders, palms flat with fingers forward, long neutral spine, eyes to the mat
const KNX = -11, KFX = KN.fx(KNX);                              // where the knees land: a step back that a leg can actually reach from standing
const QUAD = { bal: 0, kneelR: 1, kneelL: 1, fxR: KFX, fxL: KFX, heelR: TUCK, heelL: TUCK, toe: 0, footZ: 9, kdR: 1, kdL: 1, knX: KNX, hipX: KNX, hipY: KNEE_Y + L.thigh, pel: 80, lum: 0, che: 0, nec: 4, hea: 0, ikL: 1, hLx: 43, hLy: 3, hLz: -16.5, ikR: 1, hRx: 43, hRy: 3, hRz: 16.5, plantR: 1, plantL: 1,
  proR: 88, proL: 88, wfR: -85, wfL: -85, curlR: 0, curlL: 0, wri: 0, flexR: 80, flexL: 80, abdR: 0, abdL: 0, elbR: 4, elbL: 4 };
const cLum = spineShare('lum', 42), cChe = spineShare('che', 42), quadPel = (line, lum, che) => line - cLum * lum - cChe * che;      // pelvis tilt that keeps the hip-to-shoulder line at a given pitch while the spine curves
Object.assign(EX, {
  // thread the needle: the far arm slides under the chest toward the viewer, palm up; the upper back rotates and that shoulder
  // lowers toward the mat; the head follows; the other hand stays planted and the hips stay over the knees
  thread: { label: 'Thread the needle', stance: 'floor', yaw: 32, pitch: 20, view: [1.35, 11, 34, 0], pose(t) { const s = rep(t), a = rep(t + .1), lum = 6 * s, che = 12 * s;
    return { ...QUAD, pel: quadPel(80 + 31 * s, lum, che), lum, che, lumT: -6 * s, cheT: -35 * s, nec: 4 + 4 * s, headT: -20 * s, plantL: 1 - ramp(0, .2, a),
      hLx: 43 - 33 * a, hLy: 3 + 1.3 * a + 5 * Math.sin(Math.PI * a), hLz: -16.5 + 49 * a, proL: 88 - 86 * ramp(0, .5, a), wfL: -85 + 82 * ramp(0, .45, a), curlL: .12 * a }; } },
  // cat-cow: the whole spine rounds up (tail tucks, chin drops), then lengthens and sinks (tail lifts, chest opens, eyes forward);
  // the pelvis tilts the opposite way to the curve, so the shoulders stay over the hands and the arms stay long
  catcow: { label: 'Cat-cow', stance: 'floor', yaw: 0, view: [1.35, 9, 40, 0], pose(t) { const w = Math.sin(TAU * t / 5.2), c = smoother(Math.max(w, 0)), k = smoother(Math.max(-w, 0)), lum = 36 * c - 23 * k, che = 32 * c - 17 * k;
    return { ...QUAD, pel: quadPel(80, lum, che), lum, che, nec: 4 + 20 * c - 30 * k, hea: 10 * c - 10 * k, breath: k }; } },
});
/* ------------------------------------------------------------------------------------------------------------------
   ADDING A MOVE. A move is one entry in EX: a label, the position it is done in (stance), the camera angle that shows it,
   and a function of time that returns only the channels that differ from that position's base pose. Limits, balance, contact
   with the mat and the way of getting there from any other move are all handled by the engine. The two moves below are
   complete examples.
   ------------------------------------------------------------------------------------------------------------------ */
// Sitting on the mat (knees bent, feet flat, hands behind the hips) and lying on the back (the same legs, arms by the sides).
const SITX = -46;
const SIT = { headUp: 1, hipX: SITX, hipY: 14, rest: 1, bal: 0, kpU: 1, pel: -30, lum: 26, che: 10, nec: 4, ikR: 1, ikL: 1, plantR: 1, plantL: 1, hRx: -21, hRy: 3, hRz: 21, hLx: -21, hLy: 3, hLz: -21, curlR: 0, curlL: 0, toe: 4 };
const SUPINE = { hipX: SITX, hipY: 12, rest: 1, bal: 0, kpU: 1, pel: -90, lum: 0, che: 0, nec: 0, ikR: 1, ikL: 1, plantR: 1, plantL: 1, hRx: 14, hRy: 3, hRz: 23, hLx: 14, hLy: 3, hLz: -23, curlR: .1, curlL: .1, toe: 4 };
Object.assign(EX, {
  // Upper trapezius stretch (standing): the ear drops toward one shoulder, that side's hand rests over the crown to add a
  // little weight, the other shoulder stays long and low. Six channels plus the hand-on-head target.
  trap: { label: 'Upper trap stretch', yaw: 90, view: [1.75, 0, 128, 0], period: 11, pose(t) { const u = ((t % 11) + 11) % 11;
    const hand = clamp((u - .3) / 2.6, 0, 1) - clamp((u - 8) / 2.6, 0, 1), s = smoother((u - 2.5) / 2) - smoother((u - 6.6) / 1.8);      // slow on purpose: hand up, head eases over, hold, back
    return { necS: -36 * s, nec: 6 * s, hea: 4 * s, cheS: 2 * s,
      ikL: 1, hLx: 2, hLy: 85, hLz: -22, proL: 0,                                                                   // left hand starts beside the thigh ...
      hLhead: hand, hLhx: HC[0] - .5, hLhy: HC[1] + 12.6, hLhz: -4.5, eoL: smoother(hand), holdL: smoother(hand), curlL: .3 - .1 * hand,      // ... and travels up to rest over the crown, above the right ear
      abdR: 5 + 3 * s, flexR: 3 - 8 * s, curlR: .3, wri: 3 - 6 * s }; } },                                           // right arm long, reaching for the floor
  // Dead bug (lying on the back): hips and knees at right angles, arms straight up; the opposite arm and leg lower slowly and
  // return, then the other pair. The lower back stays on the mat throughout, which is the whole point of the exercise.
  deadbug: { label: 'Dead bug', stance: 'supine', yaw: 0, pitch: 12, view: [1.3, SITX - 6, 30, 0], pose(t) { const w = Math.sin(TAU * t / 5.2), a = smoother(Math.max(w, 0)), b = smoother(Math.max(-w, 0));
    const top = 47.5, legX = SITX + 42;                                // table-top: knee over the hip, shin level
    return { ...SUPINE, ikR: 0, ikL: 0, plantR: 0, plantL: 0, freeR: 1, freeL: 1, wR: 0, wL: 0, elbR: 3, elbL: 3, proR: 0, proL: 0, curlR: .12, curlL: .12, wri: 0,
      flexR: 180 + 76 * a, flexL: 180 + 76 * b, abdR: 3, abdL: 3,                                                   // arms up, then one reaches back overhead
      fxL: legX + 37 * a, liftL: top - 38 * a, fxR: legX + 37 * b, liftR: top - 38 * b, ankR: 8 * b, ankL: 8 * a }; } },      // the opposite leg lengthens and hovers
});
Object.assign(EX, {
  // Butterfly stretch (sitting on the mat): soles together, knees fallen open, hands resting on the feet; sit tall, then hinge
  // a little forward from the hips with a long spine. The knees open by pointing the knee out to the side (kpO); the feet are
  // free and find their own angle from the shins, which brings the soles together.
  butterfly: { label: 'Butterfly stretch', stance: 'sit', yaw: 62, pitch: 16, view: [1.45, SITX + 8, 36, 0], period: 11, pose(t) { const u = ((t % 11) + 11) % 11, s = smoother((u - 1) / 2.4) - smoother((u - 7) / 2.4);
    return { ...SIT, kpU: .1, kpO: .9, freeR: 1, freeL: 1, wR: 0, wL: 0, fxR: SITX + 31, fxL: SITX + 31, liftR: -.1, liftL: -.1, footZ: 7.6, toe: 0, ankR: 6, ankL: 6, soles: 1,
      pel: -8 + 16 * s, lum: 8 + 4 * s, che: 2 + 4 * s, nec: 2 - 6 * s, hea: -2 * s,
      plantR: 1, plantL: 1, palmIn: 1, eoR: .7, eoL: .7, hRx: 31, hRy: 12.7, hRz: 11, hLx: 31, hLy: 12.7, hLz: -11, curlR: .12, curlL: .12 }; } },      // each hand rests on top of its own foot, elbows out over the thighs
});
// Sitting on a chair: hips back and down with the trunk leaning forward over the feet, then upright with the hands on the thighs.
const THIGH_REST = 62.4, CHX = -36,      // THIGH_REST: wrist height that puts the palm on top of the thigh when seated (measured)
  CHAIRP = { headUp: 1, hipX: CHX, hipY: 59, rest: 1, seat: CHAIR.seat, bal: 0, kpU: .5, pel: 0, lum: 3, che: 0, toe: 5,
  ikR: 1, ikL: 1, plantR: 1, plantL: 1, onThighR: 1, onThighL: 1, curlR: .1, curlL: .1 };      // hands rest on top of the thighs, wherever the thighs are
const hold11 = (t, a = 1, b = 2.4, c = 7, d = 2.4) => { const u = ((t % 11) + 11) % 11; return smoother((u - a) / b) - smoother((u - c) / d); };      // slow in, hold, slow out (11 s)
Object.assign(EX, {
  // Doorway chest stretch, elbows low: one foot steps through, both forearms go up the door frame with the elbows below the
  // shoulders, then the body eases forward so the chest opens. The hands are fixed to the frame (hW), palms on it (plantWall).
  doorway: { label: 'Doorway chest stretch', props: { door: { x: 8 } }, yaw: 58, pitch: 12, view: [1.25, 6, 100, 0], period: 11, pose(t) { const u = ((t % 11) + 11) % 11;
    const st0 = clamp((u - .3) / 1.3, 0, 1) - clamp((u - 9.4) / 1.3, 0, 1), st = smoother(st0), up = Math.sin(Math.PI * st0), h = smoother((u - 1.2) / 2) - smoother((u - 7.8) / 1.8), s = smoother((u - 3) / 2) - smoother((u - 6.4) / 1.6);
    return { fxR: 15 * st, liftR: 5 * up, wR: 1 - smoother(Math.min(1, up * 1.3)), hipX: 6 * st + 10 * s, heelL: 16 * s, che: -2 - 7 * s, lum: -3 * s, nec: 2 * s,
      hW: 1, ikR: h, ikL: h, plantWall: 1, plantR: smoother(h * 1.6), plantL: smoother(h * 1.6), edR: h, edL: h, curlR: .3 - .26 * h, curlL: .3 - .26 * h,      // arms rise from hanging; targets are on the frame, not on the body
      hRx: .6 - 7 * (1 - h) ** 2, hRy: 85 + 47 * h, hRz: 41 - 22 * (1 - h), hLx: .6 - 7 * (1 - h) ** 2, hLy: 85 + 47 * h, hLz: -41 + 22 * (1 - h) }; } },
  // Seated spinal twist (on a chair): sit tall, turn the ribcage, one hand to the outside of the opposite knee, the other to
  // the seat behind; the head follows last. The lower back only takes its small share of the turn.
  seattwist: { label: 'Seated spinal twist', stance: 'chair', yaw: 62, pitch: 12, view: [1.3, -24, 84, 0], period: 11, pose(t) { const s = hold11(t), a = hold11(t, .4, 2.2, 7.4, 2.4), arc = Math.sin(Math.PI * a) ** 2;
    return { ...CHAIRP, cheT: 34 * s, lumT: 5 * s, headT: 44 * s, che: -2 * s,
      onThighR: 1 - a, plantR: 1 - smoother(a * 4), hRx: 39, hRy: THIGH_REST - 4, hRz: -12, proR: 30, curlR: .1 + .25 * a,                 // right hand to the outside of the left knee
      plantL: 1 - .1 * Math.sin(Math.PI * a), onThighL: 1 - a, hLx: 2, hLy: 50.8 + 9 * arc, hLz: -20.5 }; } },                     // left hand travels round the hip to the seat behind
  // Biceps curl with dumbbells: upper arms still, palms forward, elbows bend and straighten. The weights count in the balance.
  curl: { label: 'Biceps curl', props: { dumbbells: {} }, yaw: 28, pose(t) { const s = rep(t);
    return { load: 1, elbR: 8 + 128 * s, elbL: 8 + 128 * s, proR: -80, proL: -80, curlR: .78, curlL: .78, wri: 0, abdR: 7, abdL: 7, flexR: 2 - 4 * s, flexL: 2 - 4 * s }; } },
  // Triceps press-down with a band anchored at the top of the door: elbows stay by the ribs, the forearms press down and return.
  triceps: { label: 'Triceps band', props: { door: { x: 34 }, band: { anchor: [34, 204, 0] } }, yaw: -24, view: [1.1, 16, 104, 0], pose(t) { const s = rep(t);
    return { pel: 6, che: 0, elbR: 112 - 100 * s, elbL: 112 - 100 * s, proR: 82, proL: 82, curlR: .8, curlL: .8, wri: 0, abdR: 5, abdL: 5, flexR: 4, flexL: 4, wfR: 6 * s, wfL: 6 * s }; } },
  // Foot roll on a tennis ball (sitting on a chair): the sole rolls slowly over the ball; the ball rolls half as far as the foot.
  footroll: { label: 'Foot roll (ball)', stance: 'chair', barefoot: true, props: { ball: {} }, yaw: 35, pitch: 12, view: [1.6, -10, 46, 6], pose(t) { const w = Math.sin(TAU * t / 5.2);
    return { ...CHAIRP, fxR: 2 + 5 * w, liftR: 6.75, wR: 0, ballX: 7.5 + 2.5 * w, ballZ: 9.6 }; } },
});

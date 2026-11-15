/* Schematic exercise illustrations: a side-view stick figure built from segment angles.
   Angles in degrees, 0 = pointing right, 90 = pointing down. The figure faces right.
   Templates are keyed by name and referenced from the exercise libraries. */
const ILLUS = (() => {
  const LY = { hx: 100, hy: 88, tr: 180, nk: 180, ua: 0, fa: 0, th: 0, sh: 0 };          // lying on the back, head to the left
  const AF = { hx: 50, hy: 69, tr: -8, nk: -20, ua: 90, fa: 90, th: 90, sh: 180 };       // all fours
  const PR = { hx: 40, hy: 88, tr: -8, nk: -15, ua: 0, fa: 0, th: 180, sh: 180 };         // prone, head to the right
  const CHAIR = [[38, 75, 86, 75], [42, 75, 42, 92], [82, 75, 82, 92], [38, 75, 38, 38]];
  const T = {
    stand: {},
    walk: { hy: 55.5, tr: -87, nk: -88, th: 62, sh: 72, th2: 118, sh2: 130, ua: 112, fa: 92, ua2: 62, fa2: 12, mat: false },
    doorway: { tr: -80, ua: 0, fa: -90, w: 91, hl: 'tr ua' },
    'corner-high': { tr: -80, ua: -40, fa: -120, w: 91, hl: 'tr' },
    'wall-chest': { ua: 180, fa: 180, w: 41, hl: 'ua' },
    'hands-behind': { ua: 125, fa: 125, hl: 'ua' },
    'wall-biceps': { ua: 180, fa: 180, w: 41, hl: 'ua fa' },
    'overhead-triceps': { ua: -75, fa: 135, hl: 'ua' },
    'cross-body': { ua: 10, fa: 170, hl: 'ua' },
    sleeper: { ...LY, hy: 80, ua: 0, fa: -90, th: -20, sh: 40, hl: 'fa' },
    'door-er': { tr: -80, ua: -30, fa: -100, w: 90, hl: 'ua' },
    child: { hx: 40, hy: 78, tr: 5, nk: 10, ua: 15, fa: 15, th: 30, sh: 180, hl: 'tr' },
    uptrap: { nk: -55, ua: -30, fa: -130, hl: 'nk' },
    levator: { nk: -30, ua: -60, fa: 150, hl: 'nk' },
    chintuck: { nk: -105, hl: 'nk' },
    'supine-chin': { ...LY, nk: 178, th: -60, sh: 60, hl: 'nk' },
    scm: { nk: -115, hl: 'nk' },
    'neck-ext': { nk: -48, hand: [-6.2, .4, -20], armBack: true, hl: 'nk' },          // hands clasped behind the head, chin toward the chest
    'iso-neck': { nk: -90, hand: [8.2, 1.2, 20], hl: 'nk' },             // palm on the forehead, head pressing into it
    sphinx: { ...PR, tr: -25, nk: -30, ua: 90, hl: 'tr' },
    'side-bend': { tr: -72, ua: -60, fa: -60, hl: 'tr' },
    allfours: { ...AF, hl: 'tr' },
    'knees-chest': { ...LY, th: -100, sh: 60, ua: -35, fa: -35, hl: 'tr' },
    'supine-twist': { ...LY, hy: 84, th: -60, sh: 60, ua: 10, fa: 10, hl: 'tr' },
    seated: { hx: 60, hy: 72, tr: -84, nk: -86, th: 0, sh: 90, ua: 60, fa: 10, prop: 'chair' },
    'seated-twist': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, ua: 160, fa: 40, prop: 'chair', hl: 'tr' },
    'seated-side': { hx: 60, hy: 72, tr: -60, nk: -60, th: 0, sh: 90, ua: -60, fa: -60, prop: 'chair', hl: 'tr' },
    'half-kneel': { hy: 66, th: 0, sh: 90, th2: 100, sh2: 180, hl: 'th2' },
    thomas: { hx: 85, hy: 52, tr: 180, nk: 180, ua: 0, fa: 0, th: -105, sh: 30, th2: 85, sh2: 90, prop: 'bed', hl: 'th2' },
    couch: { hy: 66, th: 0, sh: 90, th2: 100, sh2: 175, w: 66, hl: 'th2 sh2' },
    'quad-stand': { th2: 100, sh2: -98, grab: ['A2', 120, 1, -1], hl: 'th2' },      // the hand holds the ankle behind
    figure4: { ...LY, th: -70, sh: 60, th2: -35, sh2: -140, hl: 'th2' },
    pigeon: { hx: 60, hy: 76, tr: -60, nk: -60, ua: 60, fa: 60, th: 150, sh: 30, th2: 170, sh2: 170, hl: 'th' },
    'seated-fig4': { hx: 60, hy: 72, tr: -55, nk: -55, th: 0, sh: 90, th2: -15, sh2: 130, prop: 'chair', hl: 'th2' },
    'knee-opp': { ...LY, th: -110, sh: 40, th2: 0, sh2: 0, ua: -35, fa: -35, hl: 'th' },
    'itb-cross': { th: 75, sh: 100, th2: 105, sh2: 80, tr: -100, hl: 'th' },
    butterfly: { hx: 60, hy: 88, tr: -60, nk: -60, th: 10, sh: 175, hl: 'th' },
    frog: { ...AF, hy: 72, th: 60, sh: 180, hl: 'th' },
    'side-lunge': { hx: 60, hy: 70, tr: -75, nk: -75, th: 40, sh: 110, th2: 5, sh2: 5, hl: 'th2' },
    '9090': { hx: 70, hy: 86, tr: -85, nk: -85, ua: 60, fa: 60, th: -8, sh: 25, th2: 188, sh2: 150, hl: 'th' },
    'supine-ham': { ...LY, hx: 80, th: -80, sh: -80, th2: 0, sh2: 0, hl: 'th' },
    'heel-step': { th2: 30, sh2: 0, tr: -75, prop: 'step', hl: 'th2' },
    'seated-ham': { hx: 60, hy: 88, tr: -60, nk: -50, ua: -20, fa: -20, th: 0, sh: 0, hl: 'th' },
    'wall-calf': { hx: 62, hy: 58, tr: -65, ua: 10, fa: 10, th: 60, sh: 95, th2: 115, sh2: 115, ft2: 0, w: 100, hl: 'sh2' },
    'wall-calf-bent': { hx: 62, hy: 58, tr: -65, ua: 10, fa: 10, th: 60, sh: 95, th2: 100, sh2: 120, ft2: 0, w: 100, hl: 'sh2' },
    'heel-drop': { hy: 40, ft: 30, prop: 'stair', hl: 'sh' },
    'knee-wall': { hx: 70, hy: 66, th: 10, sh: 70, th2: 100, sh2: 180, w: 104, hl: 'sh' },
    'kneel-shin': { hx: 48, hy: 76, th: 40, sh: 180, hl: 'sh' },
    'toe-wall': { ft: -40, w: 85, hl: 'sh' },
    'peroneal': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, th2: -15, sh2: 130, prop: 'chair', hl: 'sh2' },
    'foam-roll': { ...LY, tr: 170, th: -65, sh: 55, hl: 'tr' },
    /* Open book is done lying on the side, which a side-on camera cannot show, so this one pose is drawn from above
       (top: true): the profile is the person on their side, knees bent and stacked in front, both arms out in front. */
    'open-book': { top: true, hx: 98, hy: 60, tr: 180, nk: 180, th: -90, sh: 0, th2: -84, sh2: 3, ua: -90, fa: -90, ua2: -90, fa2: -90, hl: 'tr' },
    'thread': { ...AF, ua: 180, fa: 180, hl: 'tr' },
    hug: { ua: 20, fa: 170, hl: 'tr' },
    'wall-lat': { hx: 40, tr: -5, nk: -5, ua: 0, fa: 0, w: 96, hl: 'tr' },
    'downdog': { hx: 86, hy: 56, tr: 42, nk: 42, ua: 42, fa: 42, th: 113, sh: 113, ft: 0, hl: 'sh' },      // folded forward from the hips (belly toward the thighs), hands in front, heels back
    'wgs': { hx: 55, hy: 68.5, tr: -40, nk: -40, ua: 60, fa: 60, th: 10, sh: 90, th2: 152, sh2: 152, hl: 'th2' },      // long lunge: front shin upright, back leg straight on its toes
    'leg-swing': { th2: 20, sh2: 20, ua: -170, fa: -170, hl: 'th2' },
    'arm-circle': { ua: -60, fa: -60, hl: 'ua' },
    'wrist-flex': { ua: 0, fa: 0, hl: 'fa' },
    'wrist-ext': { ua: 0, fa: 0, hl: 'fa' },
    'jaw': { nk: -88, hand: [5, -4.6, 30], hl: 'nk' },                 // fingertips on the jaw muscle, in front of the ear
    'deep-squat': { hx: 50, hy: 70, tr: -70, nk: -75, ua: 0, fa: 0, th: 20, sh: 125, hl: 'th' },
    'wall-angel': { ua: -120, fa: -120, w: 57, hl: 'ua' },
    pendulum: { hx: 50, tr: -30, nk: -30, prop: 'table', hl: 'ua' },
    'band-row': { ua: 150, fa: 10, hl: 'ua' },
    'face-pull': { ua: 0, fa: 160, hl: 'ua' },
    'prone-T': { ...PR, ua: -90, fa: -90, hl: 'ua' },
    'prone-Y': { ...PR, ua: -30, fa: -30, hl: 'ua' },
    'prone-W': { ...PR, ua: -90, fa: -10, hl: 'fa' },
    'wall-slide': { hx: 62, tr: -75, ua: -10, fa: -80, w: 88, hl: 'ua' },
    'scap-pushup': { hx: 73.2, hy: 72.8, tr: -19.2, nk: -21, ua: 90, fa: 90, th: 160.8, sh: 160.8, toes: true, hl: 'ua' },
    deadbug: { ...LY, ua: -90, fa: -90, th: -90, sh: 0, th2: -10, sh2: -10, hl: 'tr' },
    plank: { hy: 80, tr: -8, nk: -16, ua: 90, fa: 0, th: 172, sh: 172, toes: true, hl: 'tr' },      // one straight line from shoulders to ankles, on the toes
    'side-plank': { hy: 80, tr: -8, nk: -16, ua: -90, fa: -90, th: 172, sh: 172, toes: true, hl: 'tr' },
    copenhagen: { hy: 82, tr: -12, nk: -20, ua: -90, fa: -90, th: 172.5, sh: 172.5, toes: true, th2: 175, sh2: 175, prop: 'bench', hl: 'th2' },
    birddog: { ...AF, ua: 0, fa: 0, th2: -175, sh2: -175, hl: 'tr' },
    bridge: { hx: 92, hy: 72, tr: 145, nk: 175, ua: 0, fa: 0, th: -5, sh: 95, hl: 'th' },
    'sl-bridge': { hx: 92, hy: 72, tr: 145, nk: 175, ua: 0, fa: 0, th: -5, sh: 95, th2: -50, sh2: -50, hl: 'th' },
    clam: { hx: 90, hy: 86, tr: 180, nk: 180, ua: 0, fa: 0, th: -35, sh: 70, th2: -65, sh2: 55, hl: 'th2' },
    'side-raise-leg': { hx: 90, hy: 86, tr: 180, nk: 180, ua: 0, fa: 0, th: -10, sh: 20, th2: -40, sh2: -40, hl: 'th2' },
    rdl: { hx: 45, tr: -5, nk: -10, th: 85, sh: 95, hl: 'th' },
    'split-squat': { hx: 58, hy: 66, tr: -88, nk: -88, th: 22, sh: 97, th2: 118, sh2: 165, hl: 'th' },
    squat: { hx: 50, hy: 60, tr: -70, nk: -75, ua: 0, fa: 0, th: 20, sh: 110, hl: 'th' },
    'step-up': { hx: 56, th2: 30, sh2: 90, prop: 'stair', hl: 'th2' },
    'ham-curl': { ...PR, sh: 250, hl: 'th' },
    nordic: { hx: 72, hy: 71.4, tr: -50, nk: -50, ua: 40, fa: 0, th: 130, sh: 180, hl: 'th' },
    tke: { th: 95, sh: 95, w: 20, hl: 'sh' },
    'band-er': { ua: 90, fa: 0, hl: 'fa' },
    'band-ir': { ua: 90, fa: 25, hl: 'fa' },
    'reverse-fly': { hx: 50, tr: -25, nk: -30, ua: -90, fa: -90, hl: 'ua' },
    'pull-apart': { ua: 0, fa: 0, hl: 'ua' },
    'toe-raise': { ft: -35, hl: 'sh' },
    'calf-raise': { hy: 47, ft: 45, hl: 'sh' },
    'seated-calf': { hx: 60, hy: 72, tr: -80, nk: -80, th: -10, sh: 88, ft: 24, prop: 'chair', hl: 'sh' },       // heel lifted, toes stay on the floor
    'hammer-curl': { ua: 90, fa: -30, hl: 'fa' },
    pushdown: { ua: 90, fa: 80, hl: 'ua' },
    march: { th2: 0, sh2: 90, hl: 'th2' },
    superman: { hx: 60, hy: 86, tr: -15, nk: -20, ua: -5, fa: -5, th: -172, sh: -172, hl: 'tr' },
    pushup: { hx: 73.2, hy: 72.8, tr: -19.2, nk: -21, ua: 90, fa: 90, th: 160.8, sh: 160.8, toes: true, hl: 'ua' },
    pulldown: { ua: -75, fa: -75, hl: 'ua' },
    press: { ua: -90, fa: -90, hl: 'ua' },
    'lateral-raise': { ua: 0, fa: 0, hl: 'ua' },
    shrug: { hl: 'nk' },
    suitcase: { wt: true, hl: 'tr' },
    'ball-squeeze': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, prop: 'chair', ball: [78, 88], hl: 'th' },
    balance: { th2: 60, sh2: 90, hl: 'sh' },
    monster: { th: 70, sh: 105, th2: 110, sh2: 75, hl: 'th' },
    'towel': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, prop: 'chair', hl: 'sh' },
    'band-foot': { hx: 60, hy: 88, tr: -60, nk: -50, ua: -20, fa: -20, th: 0, sh: 0, hl: 'sh' },
    'curl-up': { ...LY, hy: 84, th: -60, sh: 60, th2: 0, sh2: 0, ua: 20, fa: 20, hl: 'tr' },
    pallof: { ua: 0, fa: 0, hl: 'tr' },
    'hip-thrust': { hx: 92, hy: 72, tr: 180, nk: 188, ua: 0, fa: 0, th: 0, sh: 90, prop: 'benchL', wt: true, hl: 'th' },
    breathing: { ...LY, th: -60, sh: 60, ua: 10, fa: 10, hl: 'tr' },
    'tennis-ball': { ...LY, th: -60, sh: 60, ball: [64, 80], hl: 'nk' }
  };
  let female = false; const setFemale = v => { female = !!v; };
  /* FLOOR is where the sole of a standing shoe rests. Every pose is grounded on it: geo() finds the lowest thing that
     carries weight (a shoe, knee, hip, shoulder, head, elbow or hand) and moves the whole figure up or down until that
     touches the floor. So nothing floats and nothing sinks, whatever numbers a pose was written with. Poses on a prop
     (chair, bed, step, bench) keep their written height, because the prop is drawn at a fixed place. */
  const FLOOR = 93.7;
  function geo(o, raw) {
    const p = { hx: 70, hy: 53, tr: -90, nk: -90, ua: 90, fa: 90, th: 90, sh: 90, ...o }, R = Math.PI / 180;
    if (p.mat === undefined || p.top) p.mat = !p.top && onFloor(p);          // decided from the pose as written, before grounding moves it
    const d = (a, l) => [Math.cos(a * R) * l, Math.sin(a * R) * l], ad = (q, v) => [q[0] + v[0], q[1] + v[1]];
    const cl = v => Math.max(0, Math.min(1, v)), turn = (from, to, w) => from + ((((to - from) % 360) + 540) % 360 - 180) * w;
    // lowest point of a shoe outline (same shape the renderer draws) for an ankle A, toe direction a, knee K
    const shoeLow = (K, A, a) => { const ux = Math.cos(a * R), uy = Math.sin(a * R); let ny = ux; if (-uy * (K[0] - A[0]) + ux * (K[1] - A[1]) > 0) ny = -ny;
      const q = (t, n) => A[1] + uy * t + ny * n; return Math.max(q(-1.9, -2), q(-3.3, .4), q(-3, 2.7), q(9.4, 2.7), q(10.3, 1.5), q(8.4, -.5), q(2.6, -2.4), q(1, -2.5)) + 1; };
    /* Foot angle. Unless a pose sets it, a foot sits square to its shin. Three things override that:
       1. a foot standing on the floor or mat lies flat on it (ankle at floor height, shin fairly upright). The exception is
          a trailing leg, thigh and shin both angled back, which is on its toes: walking, the back leg of a lunge.
       2. when the shin itself lies on the floor (kneeling, all fours, lying face down), the foot continues the line of the
          shin, the top of the foot resting on the floor. Poses marked toes: true (planks, push-ups) stay on the toes.
       3. if the shoe would still go through the floor, it is turned just far enough to rest on it.
       1 and 2 are blended over the last few units of height, so a foot that lands or lifts during a movement never snaps. */
    const footA = (set, th, sh, K, A, solve) => { if (set !== undefined) return set; if (p.top) return sh - 90; const def = sh - 90, sn = Math.abs(Math.sin(sh * R)), trail = cl((-Math.cos(th * R) - .1) / .15) * cl((-Math.cos(sh * R) - .1) / .15);
      const w1 = cl((A[1] - 83.5) / 3) * cl((sn - .42) / .15) * (1 - trail), w2 = p.toes ? 0 : cl((A[1] - 83) / 2) * cl((.4 - sn) / .1) * (Math.sin(def * R) > 0 ? 1 : 0);
      let a = w2 ? turn(def, sh, w2) : w1 ? turn(def, Math.cos(def * R) >= 0 ? 0 : 180, w1) : def;
      if (solve && shoeLow(K, A, a) > FLOOR + .3) { let best = a, bl = shoeLow(K, A, a); for (let k = 2; k <= 40 && bl > FLOOR + .3; k += 2) for (const sg of [1, -1]) { const l = shoeLow(K, A, a + sg * k); if (l < bl) { bl = l; best = a + sg * k; } } a = best; }
      return a; };
    const build = solve => {
      /* a shin (or a straight leg) lying along the floor rests on it: the knee end is thicker than the ankle end, so the
         ankle sits a little lower than the knee instead of hovering level with it */
      const lie = (sh, k) => p.top ? sh : sh + (Math.cos(sh * R) < 0 ? -5.4 : 5.4) * cl((.2 - Math.abs(Math.sin(sh * R))) / .07) * cl((k[1] + 4.5 - (FLOOR - 4)) / 2);
      const H = [p.hx, p.hy], S = ad(H, d(p.tr, 28)), K = ad(H, d(p.th, 19)), s1 = lie(p.sh, K), A = ad(K, d(s1, 18)), N = ad(S, d(p.nk, 10));
      const two = p.th2 !== undefined, K2 = two ? ad(H, d(p.th2, 19)) : null, s2 = two ? lie(p.sh2, K2) : 0, A2 = two ? ad(K2, d(s2, 18)) : null;
      const fa1 = footA(p.ft, p.th, s1, K, A, solve), fa2 = two ? footA(p.ft2, p.th2, s2, K2, A2, solve) : 0, T = ad(A, d(fa1, 7)), T2 = two ? ad(A2, d(fa2, 7)) : null;
      /* hand: [forward, up, elbow hint] puts the wrist on a spot of the head, in the head's own frame (centre of the skull,
         forward = the way the face looks). grab: [joint, elbow hint, dx, dy] puts it on a knee or ankle. The arm is solved
         from there, so the hand stays where it holds however the body moves. */
      if (p.hand) { const up = d(p.nk, 1), c = ad(S, d(p.nk, 11.4)), Q = [c[0] - up[1] * p.hand[0] + up[0] * p.hand[1], c[1] + up[0] * p.hand[0] + up[1] * p.hand[1]]; [p.ua, p.fa] = ik(S, Q, 14, 12, p.hand[2]); }
      if (p.grab) { const q = { K, A, K2, A2 }[p.grab[0]]; if (q) [p.ua, p.fa] = ik(S, [q[0] + (p.grab[2] || 0), q[1] + (p.grab[3] || 0)], 14, 12, p.grab[1]); }
      const al = p.al === undefined ? 1 : p.al, E = ad(S, d(p.ua, 14 * al)), W = ad(E, d(p.fa, 12 * al));      // al < 1: arm pointing toward the viewer
      const E2 = p.ua2 !== undefined ? ad(S, d(p.ua2, 14)) : null, W2 = E2 ? ad(E2, d(p.fa2 !== undefined ? p.fa2 : p.ua2, 12)) : null;
      const hand = (e, w) => w ? w[1] + 2.2 * (w[1] - e[1]) / 12 + 2.5 : -99, c = ad(S, d(p.nk, 11.4));
      const low = Math.max(shoeLow(K, A, fa1), two ? shoeLow(K2, A2, fa2) : -99, K[1] + 4.5, two ? K2[1] + 4.5 : -99, H[1] + 7.7, S[1] + 6.4, c[1] + 6.8, E[1] + 3.2, E2 ? E2[1] + 3.2 : -99, hand(E, W), hand(E2, W2));
      return { p, H, S, E, W, K, A, N, K2, A2, T, T2, E2, W2, low, seg: { tr: [H, S], nk: [S, N], ua: [S, E], fa: [E, W], th: [H, K], sh: [K, A], th2: [H, K2], sh2: [K2, A2] } }; };
    if (raw || p.top) return build(false);
    if (p.prop) return build(true);
    let g = build(false);
    for (let k = 0; k < 3; k++) { const dy = FLOOR - g.low; if (Math.abs(dy) < .05 || Math.abs(dy) > 12) break; p.hy += dy; g = build(k > 0); }
    return Math.abs(FLOOR - g.low) < .05 ? build(true) : g;
  }
  const onFloor = p => (Math.abs(Math.sin(p.tr * Math.PI / 180)) < 0.5 && p.hy > 60) || (p.hy >= 66 && !p.prop);
  /* Front-view close-up for neck stretches: a head tilt or turn cannot be seen from the side.
     u = 0 neutral (start), 1 = full stretch. mirror flips it for the other side. */
  /* Front-view hair in head units (skull = ellipse 6.6 x 7.6 on 0,0). The cap reaches just past the skull all the way
     round, so no bare scalp shows above it, and the hairline is a soft side-swept fringe. */
  const CAP = 'M-6.95 .4C-7.7 -11.6 7.7 -11.6 6.95 .4C6.7 -1.4 6 -2.7 4.6 -3.5C2.2 -4.7 -.8 -4.3 -2.9 -5.7C-3.6 -4 -5.3 -2.9 -6.1 -1.7C-6.5 -1 -6.8 -.3 -6.95 .4Z';
  const TAIL = 'M4.6 -6.6C9.6 -6.4 11.4 -1.2 9.6 4.2C9 6.6 8.2 8.4 7.4 9.6C7.6 5.6 7.2 1.6 5.6 -1.6Z';
  /* The hands are the ones the instructions name: the pulling hand is on the side the head moves to, the other anchors. */
  const FRONT = {
    uptrap: u => ({ tilt: -24 * u, lift: 0, turn: 0, L: 'head', R: 'sit' }),             // ear to shoulder, near hand over the head, far hand sat on
    scm: u => ({ tilt: -20 * u, lift: u, turn: .45 * u, L: 'collar', R: 'down' }),        // collarbone anchored, tilt away, chin up and toward it
    levator: u => ({ tilt: -14 * u, lift: -u, turn: -.7 * u, L: 'back', R: 'behind' })    // nose to armpit, hand on the back of the head, far hand behind
  };
  function front(key, u, opt = {}) {
    u = Math.max(0, Math.min(1, u));
    const E = t => t * t * (3 - 2 * t), cl = t => Math.max(0, Math.min(1, t)), ka = E(cl(u / .6)), kh = E(cl((u - .25) / .75));   // the hand settles first, then the head follows
    const st = FRONT[key](kh), full = FRONT[key](1), f = v => v.toFixed(1), V = (n, d) => `var(--${n},${d})`, F = c => `style="fill:${c}"`, FM = female;
    const TOP = V('fig-top', '#E8793F'), TOPd = V('fig-top2', '#CF6630'), SK = '#F1C4A2', SKd = '#E0AB8A', HAIR = '#2E2420', piv = [80, 62], HC = [80, 39], HS = 1.667;
    const rot = (p, a = st.tilt) => { const r = a * Math.PI / 180, dx = p[0] - piv[0], dy = p[1] - piv[1]; return [piv[0] + dx * Math.cos(r) - dy * Math.sin(r), piv[1] + dx * Math.sin(r) + dy * Math.cos(r)]; };
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], q = p => f(p[0]) + ' ' + f(p[1]);
    // arm of fixed length (upper 30, forearm 28): the elbow comes from two-bone IK, so nothing stretches while the hand travels
    const U = 30, FO = 28, ik = (S, H, sx) => { let dx = H[0] - S[0], dy = H[1] - S[1], d = Math.hypot(dx, dy) || 1; const m = Math.min(d, U + FO - .2); dx /= d; dy /= d;
      const a = (U * U - FO * FO + m * m) / (2 * m), h = Math.sqrt(Math.max(0, U * U - a * a)), c = [S[0] + dx * a, S[1] + dy * a], e1 = [c[0] - dy * h, c[1] + dx * h], e2 = [c[0] + dy * h, c[1] - dx * h];
      return [(e1[0] - e2[0]) * sx - (e1[1] - e2[1]) * .2 > 0 ? e1 : e2, [S[0] + dx * m, S[1] + dy * m]]; };      // elbow out to the side
    const sleeve = (sh, el, ha, lay) => { const d = `M${q(sh)}L${q(el)}L${q(ha)}`, l = Math.hypot(ha[0] - el[0], ha[1] - el[1]) || 1, ux = (ha[0] - el[0]) / l, uy = (ha[1] - el[1]) / l, c0 = [ha[0] + ux * .6, ha[1] + uy * .6], c1 = [ha[0] + ux * 3.2, ha[1] + uy * 3.2], hp = lay || [ha[0] + ux * 7.4, ha[1] + uy * 7.4], hr = Math.atan2(hp[1] - ha[1], hp[0] - ha[0]) * 180 / Math.PI;
      return `<ellipse cx="${f(hp[0])}" cy="${f(hp[1])}" rx="5" ry="3.7" transform="rotate(${f(hr)} ${q(hp)})" fill="${SK}" stroke="${SKd}" stroke-width=".5"/>` +
        `<path d="${d}" style="stroke:${TOPd}" stroke-width="10.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${d}" style="stroke:${TOP}" stroke-width="8.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M${q(c0)}L${q(c1)}" style="stroke:${TOPd}" stroke-width="8.8" fill="none"/>`; };
    const arm = (pose, sx) => { const sh = [80 + sx * 26, 73], rE = [sh[0] + sx * 2.5, 103], rH = [sh[0] + sx * 3, 131];
      if (pose === 'head' || pose === 'back') {        // hand on the far side of the crown, or on the back of the head: it rides with the head
        // the arm swings up through the side (joint angles are blended, lengths never change), then the wrist rests on the crown
        const [gE, gH] = ik(sh, rot(pose === 'head' ? [HC[0] - sx * 1.5, 26.2] : [HC[0] + sx * 2.5, 27]), sx), an = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
        const way = (a0, a1) => { while ((a1 - a0) * -sx < 0) a1 += -sx * 2 * Math.PI; while ((a1 - a0) * -sx > 2 * Math.PI) a1 -= -sx * 2 * Math.PI; return a0 + (a1 - a0) * ka; };
        const aU = way(an(sh, rE), an(sh, gE)), aF = way(an(rE, rH), an(gE, gH)), el = [sh[0] + U * Math.cos(aU), sh[1] + U * Math.sin(aU)], ha = [el[0] + FO * Math.cos(aF), el[1] + FO * Math.sin(aF)];
        // the palm drapes over the far side of the head once it lands, instead of pointing along the forearm
        const flat = rot(pose === 'head' ? [HC[0] - sx * 8.2, 30.4] : [HC[0] - sx * 4.2, 27.2]), str = [ha[0] + Math.cos(aF) * 7.4, ha[1] + Math.sin(aF) * 7.4], kd = E(cl((ka - .6) / .4));
        return sleeve(sh, el, ha, lerp(str, [flat[0] + (ha[0] - gH[0]), flat[1] + (ha[1] - gH[1])], kd)); }
      // these stay put from the start: collarbone anchored, hand sat on, or reaching behind (the forearm disappears behind the body)
      const fixed = { collar: [[sh[0] - sx * 9, 84], [80 - sx * 9.5, 68]], sit: [[sh[0] + sx * 3.5, 102], [sh[0] + sx * 1, 130]], behind: [[sh[0] + sx * 6.5, 97], [sh[0] - sx * 5, 118]] }[pose] || [rE, rH];
      return sleeve(sh, fixed[0], fixed[1]); };
    let o = `<svg class="ill" viewBox="${opt.fit ? '24 8 112 84' : '0 -8 160 108'}"${opt.fit || opt.slice ? ' preserveAspectRatio="xMidYMid slice"' : ''} role="img" aria-label="${key}">`;
    if (opt.scene !== false) o += `<rect x="-200" y="-200" width="560" height="400" ${F(V('ill-bg', '#FBEDE1'))}/><circle cx="80" cy="42" r="50" ${F(V('ill-glow', '#FFF7F0'))}/><g ${F(V('ill-cloud', '#F4E6D9'))}><circle cx="30" cy="12" r="6"/><circle cx="38" cy="9" r="7.5"/><circle cx="46" cy="13" r="5.5"/><rect x="24" y="12" width="28" height="6" rx="3"/></g><ellipse cx="80" cy="108" rx="120" ry="17" ${F(V('ill-hill', '#CFDCBD'))}/><circle cx="22" cy="94" r="11" ${F(V('ill-bush', '#B4C7A3'))}/><circle cx="138" cy="94" r="11" ${F(V('ill-bush', '#B4C7A3'))}/>`;
    o += `<g ${opt.mirror ? 'transform="translate(160 0) scale(-1 1)"' : ''}>`;
    const behind = [['L', -1], ['R', 1]].filter(([k]) => st[k] === 'behind'), inFront = [['L', -1], ['R', 1]].filter(([k]) => st[k] !== 'behind');
    behind.forEach(([k, sx]) => { o += arm(st[k], sx); });
    // neck: follows the head at the top, stays wide at the base, so it bends instead of sliding
    o += `<path d="M${q(rot([74.4, 47]))}C${q(rot([74.4, 55], st.tilt * .5))} 74.5 59.5 68 64.5V72H92V64.5C85.5 59.5 ${q(rot([85.6, 55], st.tilt * .5))} ${q(rot([85.6, 47]))}Z" fill="${SKd}"/>`;
    o += `<path d="M69.5 63.4C63 65.2 55 66 51.5 69.5C49 72 48.5 76 48.5 80L50.5 122H109.5L111.5 80C111.5 76 111 72 108.5 69.5C105 66 97 65.2 90.5 63.4Q80 70.5 69.5 63.4Z" ${F(TOP)}/><path d="M69.5 63.4Q80 70.5 90.5 63.4" style="stroke:${TOPd}" stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
    // head, in head units (skull 6.6 x 7.6 on 0,0). Turning slides the face across and hides the near ear; lifting or dropping the chin slides it up or down
    const dx = st.turn * 4, dy = -st.lift * 1.3, sp = 1 - Math.abs(st.turn) * .25, ex = 2.5 * sp, n = v => +v.toFixed(2);
    o += `<g transform="rotate(${f(st.tilt)} ${piv[0]} ${piv[1]}) translate(${HC[0]} ${HC[1]}) scale(${HS})">`;
    if (FM) o += `<path d="${TAIL}" transform="rotate(${f(-st.tilt * .75)} -5 -5.5) scale(-1 1)" fill="${HAIR}"/>`;      // ponytail falls on the side away from the stretch, so the neck stays readable
    o += `<ellipse cx="${n(-6.4 - dx * .45)}" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="${n(6.4 - dx * .45)}" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><path d="M-6.6 -1C-6.6 -9.6 6.6 -9.6 6.6 -1C6.6 3.8 3.8 7.6 0 7.6C-3.8 7.6 -6.6 3.8 -6.6 -1Z" fill="${SK}"/>`;
    if (st.lift > .05) o += `<path d="M${n(dx * .4 - 3.4)} ${n(7 - st.lift * .7)}Q${n(dx * .4)} ${n(7.6 - st.lift * 2.2)} ${n(dx * .4 + 3.4)} ${n(7 - st.lift * .7)}Q${n(dx * .4)} 8.3 ${n(dx * .4 - 3.4)} ${n(7 - st.lift * .7)}Z" fill="${SKd}" opacity=".8"/>`;   // underside of the jaw shows as the chin lifts
    o += `<path d="${CAP}" transform="translate(${n(-dx * .12)} ${n(Math.max(0, -st.lift) * .8)})" fill="${HAIR}"/>`;
    o += `<path d="M${n(dx - ex - 1)} ${n(-1.9 + dy)}q1 -.6 2 -.1M${n(dx + ex - 1)} ${n(-2 + dy)}q1 -.5 2 .1" stroke="${HAIR}" stroke-width=".5" fill="none" stroke-linecap="round"/><circle cx="${n(dx - ex)}" cy="${n(.1 + dy)}" r=".7" fill="#2A1E19"/><circle cx="${n(dx + ex)}" cy="${n(.1 + dy)}" r=".7" fill="#2A1E19"/>`;
    o += `<path d="M${n(dx * 1.12)} ${n(1.1 + dy)}q${n(st.turn * 1.5)} 1.1 ${n(st.turn * .5)} 1.7" stroke="${SKd}" stroke-width=".55" fill="none" stroke-linecap="round"/>`;
    [-1, 1].forEach(sd => { const bx = dx + sd * 3.9 * sp; if (Math.abs(bx) < 5) o += `<circle cx="${n(bx)}" cy="${n(2.8 + dy)}" r="1" fill="#F2A48C" opacity=".35"/>`; });
    o += `<path d="M${n(dx - 1.6)} ${n(4.2 + dy)}q1.6 1.1 3.2 0" stroke="#B5745C" stroke-width=".55" fill="none" stroke-linecap="round"/></g>`;
    inFront.forEach(([k, sx]) => { o += arm(st[k], sx); });
    // direction cue: a short arc showing which way the head goes, fading out as it gets there
    const ao = 1 - cl(kh * 2.2);
    if (ao > .02 && opt.arrow !== false) { const R = 49, a0 = (-90 - 13) * Math.PI / 180, a1 = (-90 + full.tilt - 9) * Math.PI / 180, P0 = [piv[0] + R * Math.cos(a0), piv[1] + R * Math.sin(a0)], P1 = [piv[0] + R * Math.cos(a1), piv[1] + R * Math.sin(a1)];
      const tg = Math.atan2(-Math.cos(a1), Math.sin(a1)), hd = k => [P1[0] + 4.2 * Math.cos(tg + k * 2.55), P1[1] + 4.2 * Math.sin(tg + k * 2.55)];
      o += `<path d="M${q(P0)}A${R} ${R} 0 0 0 ${q(P1)}M${q(hd(1))}L${q(P1)}L${q(hd(-1))}" style="stroke:${TOPd}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${ao.toFixed(2)}"/>`; }
    return o + '</g></svg>';
  }

  /* Shared garden scene for the front and close-up views. */
  const sceneFront = (V, F) => `<rect x="-200" y="-200" width="560" height="400" ${F(V('ill-bg', '#FBEDE1'))}/><circle cx="80" cy="42" r="50" ${F(V('ill-glow', '#FFF7F0'))}/><g ${F(V('ill-cloud', '#F4E6D9'))}><circle cx="24" cy="10" r="6"/><circle cx="32" cy="7" r="7.5"/><circle cx="40" cy="11" r="5.5"/><rect x="18" y="10" width="28" height="6" rx="3"/></g><ellipse cx="34" cy="97" rx="66" ry="13" ${F(V('ill-hill', '#CFDCBD'))}/><circle cx="18" cy="84" r="9" ${F(V('ill-bush', '#B4C7A3'))}/><circle cx="142" cy="84" r="10" ${F(V('ill-bush2', '#9DB58C'))}/><ellipse cx="80" cy="99" rx="110" ry="8" ${F(V('ill-ground', '#EFDCCB'))}/><rect x="-200" y="99" width="560" height="200" ${F(V('ill-ground', '#EFDCCB'))}/>`;

  /* Seated spinal twist, from the front (a twist cannot be read from the side). u = 0 sitting square, 1 = turned.
     The hips, knees and feet stay facing forward; the chest turns (shoulders narrow, the centre seam slides across),
     the head follows, one hand goes to the outside of the opposite knee and the other to the chair back. */
  function frontTwist(u, opt = {}) {
    u = Math.max(0, Math.min(1, u));
    const f = n => n.toFixed(1), V = (n, d) => `var(--${n},${d})`, F = c => `style="fill:${c}"`, FM = female, E = t => t * t * (3 - 2 * t), cl = t => Math.max(0, Math.min(1, t)), k = E(u), ka = E(cl(u / .55));
    const TOP = V('fig-top', '#E8793F'), TOPd = V('fig-top2', '#CF6630'), LEG = V('fig-leg', '#2F3439'), LEGd = V('fig-leg2', '#22262A'), SK = '#F1C4A2', SKd = '#E0AB8A', HAIR = '#2E2420', PR = V('ill-prop', '#D8C7B6'), PR2 = V('ill-prop2', '#C4B09C');
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], q = p => f(p[0]) + ' ' + f(p[1]), n = v => +v.toFixed(2);
    const hy = 68, sy = 44, c = 1 - .46 * k, cx = 80 - 2 * k, shL = [cx - 9.6 * c, sy + 2], shR = [cx + 9.6 * c, sy + 2], kneeL = [72, hy + 6.5], kneeR = [88, hy + 6.5];
    const arm = (sh, el, ha) => { const d = `M${q(sh)}L${q(el)}L${q(ha)}`; return `<path d="${d}" style="stroke:${TOPd}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${d}" style="stroke:${TOP}" stroke-width="4.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="${f(ha[0])}" cy="${f(ha[1])}" r="2.7" fill="${SK}" stroke="${SKd}" stroke-width=".4"/>`; };
    let o = `<svg class="ill" viewBox="${opt.fit ? '40 16 80 80' : '30 8 100 92'}"${opt.fit || opt.slice ? ' preserveAspectRatio="xMidYMid slice"' : ''} role="img" aria-label="seated twist">`;
    if (opt.scene !== false) o += sceneFront(V, F);
    o += `<g ${opt.mirror ? 'transform="translate(160 0) scale(-1 1)"' : ''}>`;
    // chair: back, seat, legs
    o += `<rect x="62.5" y="36" width="35" height="36" rx="4" ${F(PR)}/><rect x="59" y="${hy + 2}" width="42" height="6" rx="3" ${F(PR)}/><rect x="61.5" y="${hy + 8}" width="4" height="${f(93.4 - hy - 8)}" rx="1" ${F(PR2)}/><rect x="94.5" y="${hy + 8}" width="4" height="${f(93.4 - hy - 8)}" rx="1" ${F(PR2)}/><ellipse cx="80" cy="94" rx="24" ry="1.6" fill="#000" opacity=".08"/>`;
    // the hand that holds the chair back goes behind the body
    o += arm(shL, lerp([shL[0] - 2.5, 57], [shL[0] - 7.5, 54], ka), lerp([kneeL[0] - 1, hy + 2.5], [63.2, 47], ka));
    // legs face forward the whole time: thighs come toward the viewer, shins drop to feet flat on the floor
    [[-1, kneeL], [1, kneeR]].forEach(([sd, kn]) => { o += `<path d="M${f(80 + sd * 4.6)} ${hy + 1}L${q(kn)}L${f(kn[0] + sd * .6)} 90.2" style="stroke:${LEG}" stroke-width="7.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><ellipse cx="${f(kn[0] + sd * 1)}" cy="92.2" rx="4.7" ry="2.5" fill="#fff" stroke="#CFC7BE" stroke-width=".8"/>`; });
    // torso: hips square, shoulders turned
    o += `<path d="M71 ${hy + 2.5}C72.6 ${hy - 8} ${f(shL[0] - .2)} ${sy + 12} ${f(shL[0] - .4)} ${sy + 4}Q${f(shL[0] - .2)} ${sy - .6} ${f(cx - 4)} ${sy - .8}L${f(cx + 4)} ${sy - .8}Q${f(shR[0] + .2)} ${sy - .6} ${f(shR[0] + .4)} ${sy + 4}C${f(shR[0] + .2)} ${sy + 12} 87.4 ${hy - 8} 89 ${hy + 2.5}Z" ${F(TOP)}/>`;
    o += `<path d="M${f(cx - 6.4 * k)} ${sy + 2}Q${f(80 - 5.2 * k)} ${(sy + hy) / 2} 80 ${hy + 1.5}" style="stroke:${TOPd}" stroke-width="1" stroke-linecap="round" fill="none" opacity=".6"/><path d="M71.6 ${hy + 2}H88.4" style="stroke:${TOPd}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
    o += `<path d="M${f(cx)} ${sy}V${sy - 6}" stroke="${SKd}" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="${f(cx - 1.4 * k)}" cy="${sy + .4}" rx="${f(5.6 * (1 - .15 * k))}" ry="2" ${F(TOPd)}/>`;
    // head turns further than the chest: the face slides across and the near ear disappears
    const dx = -3.2 * k, sp = 1 - .3 * k, ex = 2.5 * sp;
    o += `<g transform="translate(${f(cx - .6 * k)} ${sy - 10.6})">${FM ? `<path d="${TAIL}" fill="${HAIR}"/>` : ''}<ellipse cx="${n(-6.4 - dx * .5)}" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="${n(6.4 - dx * .5)}" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="0" cy="0" rx="6.6" ry="7.6" fill="${SK}"/><path d="${CAP}" transform="translate(${n(-dx * .14)} 0)" fill="${HAIR}"/>` +
      `<path d="M${n(dx - ex - 1)} -1.9q1 -.6 2 -.1M${n(dx + ex - 1)} -2q1 -.5 2 .1" stroke="${HAIR}" stroke-width=".5" fill="none" stroke-linecap="round"/><circle cx="${n(dx - ex)}" cy=".1" r=".72" fill="#2A1E19"/><circle cx="${n(dx + ex)}" cy=".1" r=".72" fill="#2A1E19"/>` +
      `<path d="M${n(dx * 1.12)} 1.1q${n(-1.3 * k)} 1.1 ${n(-.4 * k)} 1.6" stroke="${SKd}" stroke-width=".55" fill="none" stroke-linecap="round"/>${[-1, 1].map(sd => Math.abs(dx + sd * 3.9 * sp) < 5 ? `<circle cx="${n(dx + sd * 3.9 * sp)}" cy="2.7" r="1" fill="#F2A48C" opacity=".35"/>` : '').join('')}<path d="M${n(dx - 1.6)} 4.1q1.6 1.1 3.2 0" stroke="#B5745C" stroke-width=".55" fill="none" stroke-linecap="round"/></g>`;
    // the other hand crosses to the outside of the opposite knee
    o += arm(shR, lerp([shR[0] + 2.5, 57], [cx + 3.5, 59.5], ka), lerp([kneeR[0] + 1, hy + 2.5], [kneeL[0] - 4.2, hy + 4.5], ka));
    const ao = 1 - cl(k * 2.2);
    if (ao > .02 && opt.arrow !== false) o += `<path d="M90 21.5Q80 17 69.5 21.5M73.6 17.6L69.5 21.5L75 22.6" style="stroke:${TOPd}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${ao.toFixed(2)}"/>`;
    return o + '</g></svg>';
  }

  /* Wrist stretches, as a close-up of the forearm and both hands (from across the room the hand is too small to read).
     Both bend the hand down at the wrist; what differs is which way the palm faces, so that is made unmistakable:
     kind 'ext'  = extensor stretch, PALM DOWN: knuckles, tendons and fingernails on top, thumb underneath, fingers curled.
     kind 'flex' = flexor stretch, PALM UP: the lighter palm with its creases on top, thumb on top, fingers straight.
     A caption says it in words too. u = 0 flat, 1 = stretch. The helping hand comes in, lands on the fingers and then
     travels with them. */
  function wristView(kind, u, opt = {}) {
    u = Math.max(0, Math.min(1, u));
    const f = n => n.toFixed(1), V = (n, d) => `var(--${n},${d})`, F = c => `style="fill:${c}"`, E = t => t * t * (3 - 2 * t), cl = t => Math.max(0, Math.min(1, t)), R = Math.PI / 180;
    const kin = E(cl(u / .3)), k = E(cl((u - .22) / .78));          // the helping hand arrives first, then the wrist bends
    const TOP = V('fig-top', '#E8793F'), TOPd = V('fig-top2', '#CF6630'), SK = '#F1C4A2', SKd = '#E0AB8A', SKl = '#D69878', PALM = '#FADCC6', NAIL = '#FCEADD';
    const up = kind === 'flex', a = 70 * k, W = [86, 50], d = (ang, l) => [Math.cos(ang * R) * l, Math.sin(ang * R) * l], ad = (p, v) => [p[0] + v[0], p[1] + v[1]], q = p => f(p[0]) + ' ' + f(p[1]);
    const af = a + (up ? 5 : 34) * k, knu = ad(W, d(a, 13)), tip = ad(knu, d(af, 12)), mid = [(knu[0] + tip[0]) / 2, (knu[1] + tip[1]) / 2], topP = d(a - 90, 1), topF = d(af - 90, 1);      // top = the side that faces up when the hand is flat
    const bar = (p0, p1, w, col, cap = 'round') => `<path d="M${q(p0)}L${q(p1)}" style="stroke:${col}" stroke-width="${w}" stroke-linecap="${cap}" fill="none"/>`, off = (p, v, t) => [p[0] + v[0] * t, p[1] + v[1] * t];
    let o = `<svg class="ill" viewBox="${opt.fit ? '24 8 112 84' : '0 -8 160 108'}"${opt.fit || opt.slice ? ' preserveAspectRatio="xMidYMid slice"' : ''} role="img" aria-label="wrist stretch, palm ${up ? 'up' : 'down'}">`;
    if (opt.scene !== false) o += sceneFront(V, F);
    o += `<text x="80" y="17" text-anchor="middle" font-size="6.2" font-weight="700" letter-spacing=".5" font-family="system-ui,-apple-system,sans-serif" ${F(TOPd)}>${up ? 'PALM UP' : 'PALM DOWN'}</text>`;
    o += `<g ${opt.mirror ? 'transform="translate(160 0) scale(-1 1)"' : ''}>`;
    // stretching arm: sleeve in from the left, straight and level; cuff; wrist; palm; fingers
    o += bar([-20, 50], [70, 50], 17.4, TOPd) + bar([-20, 50], [70, 50], 16, TOP) + bar([67, 50], [71.5, 50], 16, TOPd, 'butt');
    const thumb = side => { const th = ad(ad(W, d(a, 5.5)), d(a + side * 90, 6.6)); return `<ellipse cx="${f(th[0])}" cy="${f(th[1])}" rx="5" ry="2.7" transform="rotate(${f(a + side * 26)} ${q(th)})" fill="${SK}" stroke="${SKd}" stroke-width=".5"/>`; };
    if (!up) o += thumb(1);                                          // palm down: the thumb hangs underneath
    o += bar([72, 50], W, 11, SK) + bar(W, knu, 12.4, SKd) + bar(W, knu, 11.4, SK) + bar(knu, tip, 10.6, SKd) + bar(knu, tip, 9.6, SK);
    if (up) {      // the palm itself: lighter skin, two creases, finger pads, thumb lying on top
      o += bar(off(ad(W, d(a, 1.5)), topP, 2.3), off(ad(W, d(a, 11)), topP, 2.3), 5.6, PALM) + bar(off(ad(knu, d(af, 2)), topF, 1.9), off(ad(knu, d(af, 10.2)), topF, 1.9), 4.6, PALM);
      [4, 8.6].forEach(t => { const c = off(ad(W, d(a, t)), topP, 2.4); o += `<path d="M${q(off(c, topP, 2.2))}Q${q(ad(c, d(a, 1.6)))} ${q(off(c, topP, -2.2))}" stroke="${SKl}" stroke-width=".55" fill="none" stroke-linecap="round"/>`; });
      [3.4, 6.8].forEach(t => { const c = off(ad(knu, d(af, t)), topF, 1.9); o += `<path d="M${q(off(c, topF, 2))}L${q(off(c, topF, -2))}" stroke="${SKl}" stroke-width=".45" stroke-linecap="round" opacity=".8"/>`; });
      o += thumb(-1);
    } else {       // the back of the hand: knuckles, tendons, a fingernail
      [3.6, 1.2].forEach(t => { o += `<path d="M${q(off(ad(W, d(a, 2.5)), topP, t))}L${q(off(ad(W, d(a, 10)), topP, t + 1))}" stroke="${SKl}" stroke-width=".5" stroke-linecap="round" opacity=".75"/>`; });
      [4.6, 2.3].forEach(t => { const c = off(knu, topP, t); o += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="1.25" fill="${SKd}" stroke="${SKl}" stroke-width=".45"/>`; });
      o += bar(off(ad(knu, d(af, 8.6)), topF, 2.6), off(ad(knu, d(af, 11.6)), topF, 2.6), 2.8, SKl) + bar(off(ad(knu, d(af, 8.8)), topF, 2.6), off(ad(knu, d(af, 11.4)), topF, 2.6), 2, NAIL);
    }
    o += `<path d="M${q(ad(W, d(a + 90, 4.6)))}L${q(ad(W, d(a - 90, 4.6)))}" stroke="${SKl}" stroke-width=".6" stroke-linecap="round" opacity=".6"/>`;
    // helping hand: sleeve from the upper right, palm across the fingers; it waits just clear of them at the start
    const hc = off(off(mid, topF, 7.4), topF, 13 * (1 - kin)), src = [150, -2], hl = Math.hypot(src[0] - hc[0], src[1] - hc[1]), hu = [(src[0] - hc[0]) / hl, (src[1] - hc[1]) / hl], hw = ad(hc, [hu[0] * 9, hu[1] * 9]);
    o += bar(hw, src, 17.4, TOPd) + bar(hw, src, 16, TOP) + bar(hw, ad(hw, [hu[0] * 4.5, hu[1] * 4.5]), 16, TOPd, 'butt') + bar(hc, hw, 11, SKd);
    o += `<ellipse cx="${f(hc[0])}" cy="${f(hc[1])}" rx="9.4" ry="5.4" transform="rotate(${f(af)} ${q(hc)})" fill="${SKd}" stroke="${SKl}" stroke-width=".6"/>`;
    [-5.4, -1.8, 1.8, 5.4].forEach(t => { const b0 = off(ad(hc, d(af, t)), topF, -3), e = off(ad(hc, d(af, t)), topF, -3 - 6.5 * kin); o += bar(b0, e, 3.5, SKl) + bar(b0, e, 2.7, SKd); });     // its fingers wrap over as it lands
    const ao = 1 - cl(k * 2.4);
    if (ao > .02 && opt.arrow !== false) { const c0 = ad(W, d(16, 36)), c1 = ad(W, d(60, 36)), h1 = ad(c1, d(60 + 90 + 180 - 32, 4.4)), h2 = ad(c1, d(60 + 90 + 180 + 32, 4.4));
      o += `<path d="M${q(c0)}A36 36 0 0 1 ${q(c1)}M${q(h1)}L${q(c1)}L${q(h2)}" style="stroke:${TOPd}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${ao.toFixed(2)}"/>`; }
    return o + '</g></svg>';
  }

  /* ---------- front-facing figure that can be posed ----------
     For everything that moves sideways or lies on its side, which the side-on figure cannot show truthfully.
     Angles are screen angles for the upright figure: 90 = down, 0 = toward screen-right, 180 = screen-left, -90 = up.
     aL / aR = [upper arm, forearm, upper length, forearm length], lL / lR = [thigh, shin, thigh length, shin length].
     A length below 1 is a limb coming toward the viewer; a negative length points the other way (so an arm can travel
     from across the chest to straight out without swinging down). rot turns the whole figure: -90 lies it on its side,
     head to the left, the figure's screen-right side on top.
     ts = trunk length (below 1: hinged forward toward the viewer), nod = head dropped, shr = shoulders shrugged up,
     lift = arms raised off the floor toward the viewer (shown by their shadow), back = seen from behind (lying face down,
     seen from above), under = an arm that passes beneath the body, holdR = the right hand holds the left wrist. */
  const REST = { hx: 80, hy: 57, lean: 0, rot: 0, turn: 0, ts: 1, nod: 0, lift: 0, shr: 0, aL: [97, 93, 1, 1], aR: [83, 87, 1, 1], lL: [92, 90, 1, 1], lR: [88, 90, 1, 1] };
  const SIDE = { ...REST, rot: -90, view: 'side', aL: [-96, -70, .9, .8], aR: [74, 106, 1, .9] };          // lying on the side, facing you: bottom arm under the head, top hand on the hip
  const RIG = {
    'lateral-raise': { a: { ...REST, wt: 'LR' }, b: { ...REST, wt: 'LR', aL: [171, 174, 1, 1], aR: [9, 6, 1, 1] } },
    'pull-apart': { a: { ...REST, band: 1, aL: [180, 180, -.32, -.3], aR: [0, 0, -.32, -.3] }, b: { ...REST, band: 1, aL: [180, 180, 1, 1], aR: [0, 0, 1, 1] } },
    'band-er': { a: { ...REST, band: [44, 0], aR: [86, 0, 1, -.5] }, b: { ...REST, band: [44, 0], aR: [86, 0, 1, .95] } },      // elbow pinned, forearm swings out
    'band-ir': { a: { ...REST, band: [118, 0], aR: [86, 0, 1, .95] }, b: { ...REST, band: [118, 0], aR: [86, 0, 1, -.62] } },   // elbow pinned, forearm swings in across the body
    monster: { a: { ...REST, hy: 60, band: 'knees', lL: [100, 84, .95, .95], lR: [80, 96, .95, .95], aL: [112, 50, 1, .8], aR: [68, 130, 1, .8] }, b: { ...REST, hy: 60, hx: 83, band: 'knees', lL: [103, 86, .95, .95], lR: [64, 92, .95, 1], aL: [112, 50, 1, .8], aR: [68, 130, 1, .8] } },
    suitcase: { a: { ...REST, wt: 'R' }, b: { ...REST, wt: 'R' } },
    itb: { a: REST, b: { ...REST, hx: 84, lean: -15, lL: [84, 90, 1, 1], lR: [107, 100, 1, 1], aR: [-96, -128, 1, 1], aL: [104, 96, 1, 1] } },
    'cross-body': { a: REST, b: { ...REST, aR: [172, 179, 1, 1], aL: [78, -52, 1, .72] } },
    'supine-twist': { a: { ...REST, rot: -90, view: 'top', aL: [180, 180, 1, 1], aR: [0, 0, 1, 1], lL: [92, 90, .3, .78], lR: [88, 90, .3, .78] }, b: { ...REST, rot: -90, view: 'top', turn: .8, aL: [180, 180, 1, 1], aR: [0, 0, 1, 1], lL: [176, 94, .95, .95], lR: [168, 98, .88, .95] } },
    'side-leg': { a: { ...SIDE, lL: [96, 70, .9, .8] }, b: { ...SIDE, lL: [96, 70, .9, .8], lR: [58, 58, 1, 1] } },             // lower knee bent, top leg lifts straight
    clam: { a: { ...SIDE, lL: [93, 90, .55, .62], lR: [87, 90, .55, .62] }, b: { ...SIDE, lL: [93, 90, .55, .62], lR: [56, 124, .6, .64] } },   // feet together, top knee opens
    'side-plank': { a: { ...SIDE, rot: -84, aL: [174, -96, .45, .55] }, b: { ...SIDE, rot: -76, aL: [166, -104, 1, .55] } },          // forearm down, hips lift into one straight line
    copenhagen: { a: { ...SIDE, rot: -84, bench: 1, aL: [174, -96, .5, .55], lR: [88, 88, 1, 1], lL: [108, 102, 1, 1] }, b: { ...SIDE, rot: -84, bench: 1, aL: [174, -96, .5, .55], lR: [88, 88, 1, 1], lL: [93, 90, 1, 1] } },
    shrug: { a: { ...REST, wt: 'LR' }, b: { ...REST, wt: 'LR', shr: 1 } },
    'reverse-fly': { a: { ...REST, hy: 60, ts: .5, nod: .8, wt: 'LR', lL: [96, 86, .95, .95], lR: [84, 94, .95, .95], aL: [94, 92, 1, 1], aR: [86, 88, 1, 1] }, b: { ...REST, hy: 60, ts: .5, nod: .8, wt: 'LR', lL: [96, 86, .95, .95], lR: [84, 94, .95, .95], aL: [168, 172, 1, 1], aR: [12, 8, 1, 1] } },
    'prone-T': { a: { ...REST, rot: -90, view: 'top', back: 1, aL: [180, 180, 1, 1], aR: [0, 0, 1, 1] }, b: { ...REST, rot: -90, view: 'top', back: 1, lift: 1, aL: [180, 180, 1, 1], aR: [0, 0, 1, 1] } },
    'prone-W': { a: { ...REST, rot: -90, view: 'top', back: 1, aL: [158, -92, 1, .95], aR: [22, -88, 1, .95] }, b: { ...REST, rot: -90, view: 'top', back: 1, lift: 1, aL: [158, -92, 1, .95], aR: [22, -88, 1, .95] } },
    sleeper: { a: { ...SIDE, holdR: 1, bare: 'L', aL: [0, 0, .12, 1.25], aR: [74, 106, .75, .75] }, b: { ...SIDE, holdR: 1, bare: 'L', aL: [0, 66, .12, 1.25], aR: [74, 106, .75, .75] } },      // bottom elbow points at you; the top hand presses the forearm down toward the floor
    thread: { a: { ...REST, rot: -90, view: 'top', back: 1, under: 'R', aL: [-90, -90, .2, .2], aR: [180, 180, .15, .15], lL: [90, 90, .2, .95], lR: [90, 90, .2, .95] }, b: { ...REST, rot: -90, view: 'top', back: 1, under: 'R', lean: -9, aL: [-90, -90, .2, .2], aR: [180, 180, 1, 1], lL: [90, 90, .2, .95], lR: [90, 90, .2, .95] } },
    hug: { a: REST, b: { ...REST, nod: .5, aL: [58, -36, .95, 1], aR: [122, 216, .95, 1] } },
    pigeon: { a: { ...REST, rot: -90, view: 'top', back: 1, lL: [91, 90, 1, 1], lR: [-35, 180, .8, 1.1], aL: [-100, -95, .45, .45], aR: [-80, -85, .45, .45] }, b: { ...REST, rot: -90, view: 'top', back: 1, lL: [91, 90, 1, 1], lR: [-35, 180, .8, 1.1], aL: [-100, -95, 1, 1], aR: [-80, -85, 1, 1] } },
    '9090': { a: { ...REST, hy: 80, view: 'sit', lL: [158, 2, .5, 1], lR: [10, 62, 1, .4], aL: [100, 95, 1, 1], aR: [80, 85, 1, 1] }, b: { ...REST, hy: 80, view: 'sit', ts: .72, nod: .6, lL: [158, 2, .5, 1], lR: [10, 62, 1, .4], aL: [100, 95, 1, 1], aR: [80, 85, 1, 1] } },
    frog: { a: { ...REST, rot: -90, view: 'top', back: 1, hy: 55, lL: [158, 96, .9, .9], lR: [22, 84, .9, .9], aL: [-97, -93, .55, .55], aR: [-83, -87, .55, .55] }, b: { ...REST, rot: -90, view: 'top', back: 1, hy: 62, lL: [185, 90, .9, .9], lR: [-5, 90, .9, .9], aL: [-97, -93, .84, .84], aR: [-83, -87, .84, .84] } },
    'seated-fig4': { a: { ...REST, hy: 68, view: 'chair', lL: [94, 90, .4, .92], lR: [20, 175, .6, 1.05], aL: [84, 70, 1, .9], aR: [96, 110, 1, .9] }, b: { ...REST, hy: 68, view: 'chair', ts: .7, nod: .5, lL: [94, 90, .4, .92], lR: [20, 175, .6, 1.05], aL: [84, 70, 1, .9], aR: [96, 110, 1, .9] } },
    peroneal: { a: { ...REST, hy: 68, view: 'chair', lL: [94, 90, .4, .92], lR: [20, 175, .6, 1.05], aL: [102, 60, 1, 1.1], aR: [78, 135, 1, 1.3] }, b: { ...REST, hy: 68, view: 'chair', nod: .3, lL: [94, 90, .4, .92], lR: [20, 175, .6, 1.05], aL: [102, 60, 1, 1.1], aR: [78, 135, 1, 1.3] } },
    butterfly: { a: { ...REST, hy: 80, view: 'sit', lL: [196, 28, .9, .84], lR: [-16, 152, .9, .84], aL: [82, 66, 1, 1], aR: [98, 114, 1, 1] }, b: { ...REST, hy: 80, view: 'sit', lL: [174, 6, .95, .86], lR: [6, 174, .95, .86], aL: [82, 66, 1, 1], aR: [98, 114, 1, 1] } }
  };
  const RIG_ILL = { 'itb-cross': 'itb', 'side-raise-leg': 'side-leg' };
  const rigOf = (key, ex) => RIG[ex] || RIG[key] || RIG[RIG_ILL[key]] || null;
  function frontRig(spec, u, opt = {}) {
    u = Math.max(0, Math.min(1, u));
    const A = spec.a, B = spec.b, mixv = (x, y) => typeof x === 'number' && typeof y === 'number' ? x + (y - x) * u : Array.isArray(x) && Array.isArray(y) ? x.map((v, i) => typeof v === 'number' ? v + (y[i] - v) * u : v) : x, P = {}; for (const k in A) P[k] = mixv(A[k], B[k]);
    const f = n => n.toFixed(1), V = (n, d) => `var(--${n},${d})`, F = c => `style="fill:${c}"`, FM = female, R = Math.PI / 180, cl = t => Math.max(0, Math.min(1, t));
    const TOP = V('fig-top', '#E8793F'), TOPd = V('fig-top2', '#CF6630'), LEG = V('fig-leg', '#2F3439'), SK = '#F1C4A2', SKd = '#E0AB8A', HAIR = '#2E2420', PR2 = V('ill-prop2', '#C4B09C');
    const d = (a, l) => [Math.cos(a * R) * l, Math.sin(a * R) * l], ad = (p, v) => [p[0] + v[0], p[1] + v[1]], q = p => f(p[0]) + ' ' + f(p[1]), n = v => +v.toFixed(2);
    const hc = [P.hx, P.hy], up = d(-90 + P.lean, 1), pr = [-up[1], up[0]], at = (t, w) => [hc[0] + up[0] * t * P.ts + pr[0] * w, hc[1] + up[1] * t * P.ts + pr[1] * w], sc = at(23, 0), head = [at(23, 0)[0] + up[0] * 10.5 * (.55 + .45 * P.ts), at(23, 0)[1] + up[1] * 10.5 * (.55 + .45 * P.ts)];
    const lying = P.rot !== 0, view = P.view || 'stand';
    const arm = (sd, a) => { const sh = ad(at(21, sd * 9.5), [up[0] * 3 * P.shr, up[1] * 3 * P.shr]), el = ad(sh, d(a[0], 12.5 * a[2])), ha = ad(el, d(a[1], 11.5 * a[3])); return { sh, el, ha }; }, L = arm(-1, P.aL); let Rr = arm(1, P.aR);
    if (P.holdR) { const l1 = 12.5 * P.aR[2], l2 = 11.5 * P.aR[3], S0 = Rr.sh, tg = L.ha, vx = tg[0] - S0[0], vy = tg[1] - S0[1], dist = Math.max(Math.abs(l1 - l2) + .1, Math.min(l1 + l2 - .1, Math.hypot(vx, vy) || 1)), ux = vx / (Math.hypot(vx, vy) || 1), uy = vy / (Math.hypot(vx, vy) || 1);
      const aa = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), hh = Math.sqrt(Math.max(0, l1 * l1 - aa * aa)), c0 = [S0[0] + ux * aa, S0[1] + uy * aa], e1 = [c0[0] - uy * hh, c0[1] + ux * hh], e2 = [c0[0] + uy * hh, c0[1] - ux * hh], out = e => (e[0] - sc[0]) * pr[0] + (e[1] - sc[1]) * pr[1] - ((e[0] - sc[0]) * up[0] + (e[1] - sc[1]) * up[1]) * .4;
      Rr = { sh: S0, el: out(e1) > out(e2) ? e1 : e2, ha: [S0[0] + ux * dist, S0[1] + uy * dist] }; }
    const leg = (sd, a) => { const hp = at(-1, sd * 4.6), kn = ad(hp, d(a[0], 17 * a[2])), ft = ad(kn, d(a[1], 17 * a[3])); return { hp, kn, ft, sd }; }, lL = leg(-1, P.lL), lR = leg(1, P.lR);
    const drawArm = o => { const pth = `M${q(o.sh)}L${q(o.el)}L${q(o.ha)}`, bare = o.bare ? `<path d="M${q(o.el)}L${q(o.ha)}" stroke="${SKd}" stroke-width="5.2" stroke-linecap="round" fill="none"/><path d="M${q(o.el)}L${q(o.ha)}" stroke="${SK}" stroke-width="4.2" stroke-linecap="round" fill="none"/>` : ''; return `<path d="${pth}" style="stroke:${TOPd}" stroke-width="5.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${pth}" style="stroke:${TOP}" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>${bare}<circle cx="${f(o.ha[0])}" cy="${f(o.ha[1])}" r="2.6" fill="${SK}" stroke="${SKd}" stroke-width=".4"/>`; };
    if (P.bare === 'L') L.bare = true;      // sleeve pushed up, so a forearm lying across the body stands out from it
    const drawLeg = o => { const fa = lying || view === 'sit' ? Math.atan2(o.ft[1] - o.kn[1], o.ft[0] - o.kn[0]) / R + 90 : 0, fo = lying || view === 'sit' ? [0, 0] : [o.sd * 1.5, 1.4];
      return `<path d="M${q(o.hp)}L${q(o.kn)}L${q(o.ft)}" style="stroke:${LEG}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><ellipse cx="${f(o.ft[0] + fo[0])}" cy="${f(o.ft[1] + fo[1])}" rx="4.6" ry="2.4" transform="rotate(${f(fa)} ${f(o.ft[0] + fo[0])} ${f(o.ft[1] + fo[1])})" fill="#fff" stroke="#CFC7BE" stroke-width=".8"/>`; };
    const box = view === 'top' || view === 'side' ? (opt.fit ? '26 26 108 72' : '24 -14 112 138') : view === 'sit' || view === 'chair' ? (opt.fit ? '40 30 80 68' : '30 12 100 88') : (opt.fit ? '34 0 92 98' : '18 -6 124 106');
    let o = `<svg class="ill" viewBox="${box}"${opt.fit || opt.slice ? ' preserveAspectRatio="xMidYMid slice"' : ''} role="img" aria-label="exercise">`;
    if (opt.scene !== false) o += view === 'top' ? `<rect x="-200" y="-200" width="560" height="400" ${F(V('ill-bg', '#FBEDE1'))}/><rect x="28" y="22" width="104" height="80" rx="8" ${F(V('ill-mat', '#F4B48D'))} opacity=".4"/><text x="80" y="17.5" text-anchor="middle" font-size="5.2" font-weight="600" letter-spacing=".3" font-family="system-ui,-apple-system,sans-serif" ${F(V('fig-top2', '#CF6630'))} opacity=".85">SEEN FROM ABOVE</text>`
      : sceneFront(V, F) + (view === 'side' || view === 'sit' ? `<rect x="22" y="89.5" width="116" height="4" rx="2" ${F(V('ill-mat', '#F4B48D'))}/>` : '');
    o += `<g ${opt.mirror ? 'transform="translate(160 0) scale(-1 1)"' : ''}>`;
    // the lowest point of the posed figure is put on the floor (standing and sitting) or the mat (lying on the side)
    const rp = p => { const r = P.rot * R, x = p[0] - 80, y = p[1] - 60; return [80 + x * Math.cos(r) - y * Math.sin(r), 60 + x * Math.sin(r) + y * Math.cos(r)]; };
    const lows = [lL.ft, lR.ft, lL.kn, lR.kn].filter((p, i) => !(P.bench && (i === 1 || i === 3))).map(p => rp(p)[1] + (lying ? 4 : 2.6)).concat(lying ? [L.el, L.ha, Rr.el, Rr.ha].map(p => rp(p)[1] + 3) : []).concat([rp(at(0, -9))[1] + (lying ? 1 : 0), rp(at(0, 9))[1], rp(at(22, -10))[1] + (lying ? 1 : 0), rp([hc[0], hc[1] + (view === 'sit' ? 8.4 : 0)])[1]]);
    const dyv = view === 'top' ? 2 : (view === 'side' ? 92.6 : 93.7) - Math.max(...lows);
    if (view !== 'top' && opt.scene !== false) o += `<ellipse cx="${f(lying ? 80 : (lL.ft[0] + lR.ft[0]) / 2)}" cy="94.2" rx="${lying ? 40 : f(Math.max(14, Math.abs(lR.ft[0] - lL.ft[0]) / 2 + 9))}" ry="1.6" fill="#000" opacity=".08"/>`;
    if (view === 'chair') o += `<rect x="62.5" y="${f(hc[1] - 32 + dyv)}" width="35" height="36" rx="4" ${F(V('ill-prop', '#D8C7B6'))}/><rect x="59" y="${f(hc[1] + 2 + dyv)}" width="42" height="6" rx="3" ${F(V('ill-prop', '#D8C7B6'))}/><rect x="61.5" y="${f(hc[1] + 8 + dyv)}" width="4" height="${f(93.4 - hc[1] - 8 - dyv)}" rx="1" ${F(PR2)}/><rect x="94.5" y="${f(hc[1] + 8 + dyv)}" width="4" height="${f(93.4 - hc[1] - 8 - dyv)}" rx="1" ${F(PR2)}/>`;
    if (P.bench) { const tf = rp(lR.ft), ty = tf[1] + dyv + 3.4; o += `<rect x="${f(tf[0] - 13)}" y="${f(ty)}" width="26" height="${f(Math.max(2, 93.4 - ty))}" rx="2.5" ${F(V('ill-prop', '#D8C7B6'))}/>`; }
    o += `<g transform="translate(0 ${f(dyv)}) rotate(${f(P.rot)} 80 60)">`;
    // arms lifted off the floor (seen from above): their shadow separates from them as they rise
    if (P.lift > .02) [L, Rr].forEach(a => { o += `<path d="M${q(a.sh)}L${q(a.el)}L${q(a.ha)}" transform="translate(${f(-2.6 * P.lift)} ${f(1.6 * P.lift)})" stroke="#000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${(.13 * P.lift).toFixed(3)}"/>`; });
    if (P.under) o += drawArm(P.under === 'R' ? Rr : L);
    const BAND = V('ill-stem', '#7F9A70');      // resistance bands are green, so they never read as part of the figure or as a stray line
    if (Array.isArray(P.band)) o += `<rect x="${f(P.band[0] - 2)}" y="14" width="4" height="79.4" rx="1.5" ${F(PR2)}/>`;      // the post or door the band is tied to
    o += drawLeg(lL) + drawLeg(lR);
    if (P.band === 'knees') { const m = [(lL.kn[0] + lR.kn[0]) / 2, (lL.kn[1] + lR.kn[1]) / 2], dxk = lR.kn[0] - lL.kn[0], dyk = lR.kn[1] - lL.kn[1];      // a loop band round both legs, just above the knees
      o += `<ellipse cx="${f(m[0])}" cy="${f(m[1] - 2.5)}" rx="${f(Math.hypot(dxk, dyk) / 2 + 4.6)}" ry="2.7" transform="rotate(${f(Math.atan2(dyk, dxk) / R)} ${f(m[0])} ${f(m[1] - 2.5)})" fill="none" style="stroke:${BAND}" stroke-width="2"/>`; }
    o += `<path d="M${q(at(-1.5, -9))} C${q(at(8, -7.4))} ${q(at(14, -9.6))} ${q(at(20, -9.8))} Q${q(at(25, -9.6))} ${q(at(24.5, -4))} L${q(at(24.5, 4))} Q${q(at(25, 9.6))} ${q(at(20, 9.8))} C${q(at(14, 9.6))} ${q(at(8, 7.4))} ${q(at(-1.5, 9))} Z" ${F(TOP)}/><path d="M${q(at(-1.6, -8.2))}L${q(at(-1.6, 8.2))}" style="stroke:${TOPd}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
    o += `<path d="M${q(at(23, 0))}L${q(at(29, 0))}" stroke="${SKd}" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="${f(sc[0])}" cy="${f(sc[1] + .6)}" rx="5.6" ry="2" transform="rotate(${f(P.lean)} ${q(sc)})" ${F(TOPd)}/>`;
    if (P.shr > .02) [L, Rr].forEach(a => { o += `<circle cx="${f(a.sh[0])}" cy="${f(a.sh[1] + .6)}" r="4.1" ${F(TOP)}/>`; });      // shoulders riding up
    if (P.back) o += `<path d="M${q(at(19.5, -4.6 + 2 * P.lift))}L${q(at(12.5, -4 + 2 * P.lift))}M${q(at(19.5, 4.6 - 2 * P.lift))}L${q(at(12.5, 4 - 2 * P.lift))}" style="stroke:${TOPd}" stroke-width="1.1" stroke-linecap="round" fill="none" opacity=".7"/>`;      // shoulder blades, drawing together as the arms lift
    const dx = P.turn * 4.2, sp = 1 - Math.abs(P.turn) * .3, ex = 2.5 * sp, ndy = 1.7 * P.nod;
    if (P.back) o += `<g transform="translate(${q(head)}) rotate(${f(P.lean)})">${FM ? `<path d="${TAIL}" fill="${HAIR}"/>` : ''}<ellipse cx="-6.4" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="6.4" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="0" cy="0" rx="6.6" ry="7.6" fill="${SK}"/><path d="M-6.95 1C-7.7 -11.6 7.7 -11.6 6.95 1C6.6 5.4 3.6 7 0 7C-3.6 7 -6.6 5.4 -6.95 1Z" fill="${HAIR}"/></g>`;
    else o += `<g transform="translate(${q(head)}) rotate(${f(P.lean)})">${FM ? `<path d="${TAIL}" fill="${HAIR}"/>` : ''}<ellipse cx="${n(-6.4 - dx * .5)}" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="${n(6.4 - dx * .5)}" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="0" cy="0" rx="6.6" ry="7.6" fill="${SK}"/><path d="${CAP}" transform="translate(${n(-dx * .14)} ${n(ndy * .55)})" fill="${HAIR}"/><g transform="translate(0 ${n(ndy)})">` +
      `<path d="M${n(dx - ex - 1)} -1.9q1 -.6 2 -.1M${n(dx + ex - 1)} -2q1 -.5 2 .1" stroke="${HAIR}" stroke-width=".5" fill="none" stroke-linecap="round"/><circle cx="${n(dx - ex)}" cy=".1" r=".72" fill="#2A1E19"/><circle cx="${n(dx + ex)}" cy=".1" r=".72" fill="#2A1E19"/>` +
      `<path d="M${n(dx * 1.12)} 1.1q${n(P.turn * 1.4)} 1.1 ${n(P.turn * .4)} 1.6" stroke="${SKd}" stroke-width=".55" fill="none" stroke-linecap="round"/>${[-1, 1].map(sd => Math.abs(dx + sd * 3.9 * sp) < 5 ? `<circle cx="${n(dx + sd * 3.9 * sp)}" cy="2.7" r="1" fill="#F2A48C" opacity=".35"/>` : '').join('')}<path d="M${n(dx - 1.6)} 4.1q1.6 1.1 3.2 0" stroke="#B5745C" stroke-width=".55" fill="none" stroke-linecap="round"/></g></g>`;
    if (P.band === 1) o += `<path d="M${q(L.ha)}L${q(Rr.ha)}" style="stroke:${BAND}" stroke-width="2" stroke-linecap="round"/>`;
    if (Array.isArray(P.band)) o += `<path d="M${f(P.band[0])} ${f(Rr.ha[1])}L${q(Rr.ha)}" style="stroke:${BAND}" stroke-width="2" stroke-linecap="round"/><circle cx="${f(P.band[0])}" cy="${f(Rr.ha[1])}" r="2.2" fill="none" style="stroke:${BAND}" stroke-width="1.4"/>`;
    o += (P.under === 'L' ? '' : drawArm(L)) + (P.under === 'R' ? '' : drawArm(Rr));
    const wt = h => `<rect x="${f(h[0] - 4.2)}" y="${f(h[1] - 1.6)}" width="8.4" height="3.2" rx="1.2" ${F(PR2)}/><rect x="${f(h[0] - 5)}" y="${f(h[1] - 2.6)}" width="2.2" height="5.2" rx=".8" ${F(V('ill-prop', '#D8C7B6'))}/><rect x="${f(h[0] + 2.8)}" y="${f(h[1] - 2.6)}" width="2.2" height="5.2" rx=".8" ${F(V('ill-prop', '#D8C7B6'))}/>`;
    if (P.wt) { if (P.wt.includes('L')) o += wt(L.ha); if (P.wt.includes('R')) o += wt(Rr.ha); }
    return o + '</g></g></svg>';
  }

  /* Full-body front view for moves that read best from the front: hip circles (phase 0-1), the side bend and the side lunge (u 0-1). */
  function frontBody(kind, v, opt = {}) {
    const f = n => n.toFixed(1), V = (n, d) => `var(--${n},${d})`, F = c => `style="fill:${c}"`, FM = female, E = t => t * t * (3 - 2 * t);
    const TOP = V('fig-top', '#E8793F'), TOPd = V('fig-top2', '#CF6630'), LEG = V('fig-leg', '#2F3439'), SK = '#F1C4A2', SKd = '#E0AB8A', HAIR = '#2E2420';
    const a = kind === 'hip' ? 2 * Math.PI * v : 0, shift = kind === 'hip' ? 6 * Math.sin(a) : 0, bend = kind === 'bend' ? -22 * E(Math.max(0, Math.min(1, v))) : 0;
    const lk = kind === 'lunge' ? E(Math.max(0, Math.min(1, v))) : 0;      // side lunge: wide stance, sit toward one side, the other leg stays straight
    const hc = kind === 'lunge' ? [80 - 9 * lk, 60 + 5.5 * lk] : [80 + shift, 57 + (kind === 'hip' ? 1.2 * Math.cos(a) : 0)];
    const ang = (kind === 'hip' ? -90 - shift * 1.3 : -90 + bend) * Math.PI / 180, up = [Math.cos(ang), Math.sin(ang)], pr = [-up[1], up[0]];
    const at = (c, t, w) => [c[0] + up[0] * t + pr[0] * w, c[1] + up[1] * t + pr[1] * w], sc = at(hc, 23, 0), head = at(hc, 33.5, 0);
    const P = q => q.map(p => f(p[0]) + ' ' + f(p[1])).join(' L');
    const leg = (hx, fx) => { const hp = [hc[0] + hx, hc[1] + 1], ft = [fx, 91], sd = hx < 0 ? -1 : 1, dd = Math.hypot(ft[0] - hp[0], ft[1] - hp[1]) || 1, bow = kind === 'lunge' ? Math.sqrt(Math.max(0, 16.7 * 16.7 - dd * dd / 4)) : 1.2;      // lunge: fixed leg length, the knee bends out over the foot
      const px = (ft[1] - hp[1]) / dd, py = -(ft[0] - hp[0]) / dd, sg = px * sd < 0 ? -1 : 1, kn = kind === 'lunge' ? [(hp[0] + ft[0]) / 2 + px * sg * bow, (hp[1] + ft[1]) / 2 + py * sg * bow] : [(hp[0] + ft[0]) / 2 + sd * 1.2, (hp[1] + ft[1]) / 2];
      return `<path d="M${P([hp, kn, ft])}" style="stroke:${LEG}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><ellipse cx="${f(ft[0] + (hx < 0 ? -1.5 : 1.5))}" cy="92.4" rx="4.6" ry="2.4" fill="#fff" stroke="#CFC7BE" stroke-width=".8"/>`; };
    const arm = (side) => { const sh = at(sc, -2, side * 9.5); let el, ha;
      if (kind === 'bend' && side > 0) { el = at(sc, 9, side * 13); ha = at(sc, 18, side * 2); }          // top arm reaches over the head
      else { el = at(hc, 12, side * 17.5); ha = at(hc, 2.5, side * 10.5); }                                   // hand resting on the hip, elbow out
      const d = `M${P([sh, el, ha])}`;
      return `<path d="${d}" style="stroke:${TOPd}" stroke-width="5.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${d}" style="stroke:${TOP}" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="${f(ha[0])}" cy="${f(ha[1])}" r="2.5" fill="${SK}"/>`; };
    let o = `<svg class="ill" viewBox="${opt.fit ? '34 0 92 98' : '0 -8 160 108'}"${opt.fit || opt.slice ? ' preserveAspectRatio="xMidYMid slice"' : ''} role="img" aria-label="${kind}">`;
    if (opt.scene !== false) o += `<rect x="-200" y="-200" width="560" height="400" ${F(V('ill-bg', '#FBEDE1'))}/><circle cx="96" cy="40" r="50" ${F(V('ill-glow', '#FFF7F0'))}/><g ${F(V('ill-cloud', '#F4E6D9'))}><circle cx="24" cy="10" r="6"/><circle cx="32" cy="7" r="7.5"/><circle cx="40" cy="11" r="5.5"/><rect x="18" y="10" width="28" height="6" rx="3"/></g><ellipse cx="34" cy="97" rx="66" ry="13" ${F(V('ill-hill', '#CFDCBD'))}/><circle cx="18" cy="84" r="9" ${F(V('ill-bush', '#B4C7A3'))}/><circle cx="142" cy="84" r="10" ${F(V('ill-bush2', '#9DB58C'))}/><ellipse cx="80" cy="99" rx="110" ry="8" ${F(V('ill-ground', '#EFDCCB'))}/><rect x="-200" y="99" width="560" height="200" ${F(V('ill-ground', '#EFDCCB'))}/>`;
    o += `<g ${opt.mirror ? 'transform="translate(160 0) scale(-1 1)"' : ''}>`;
    o += kind === 'lunge' ? `<ellipse cx="80" cy="94" rx="25" ry="1.6" fill="#000" opacity=".09"/>` + leg(-4.5, 62) + leg(4.5, 98) : `<ellipse cx="80" cy="94" rx="14" ry="1.6" fill="#000" opacity=".09"/>` + leg(-4.5, 74.5) + leg(4.5, 85.5);
    const q = p => f(p[0]) + ' ' + f(p[1]);
    o += `<path d="M${q(at(hc, -1.5, -9))} C${q(at(hc, 8, -7.4))} ${q(at(hc, 14, -9.6))} ${q(at(hc, 20, -9.8))} Q${q(at(hc, 25, -9.6))} ${q(at(hc, 24.5, -4))} L${q(at(hc, 24.5, 4))} Q${q(at(hc, 25, 9.6))} ${q(at(hc, 20, 9.8))} C${q(at(hc, 14, 9.6))} ${q(at(hc, 8, 7.4))} ${q(at(hc, -1.5, 9))} Z" ${F(TOP)}/><path d="M${P([at(hc, -1.6, -8.2), at(hc, -1.6, 8.2)])}" style="stroke:${TOPd}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
    o += `<path d="M${P([at(sc, 0, 0), at(sc, 6, 0)])}" stroke="${SKd}" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="${f(sc[0])}" cy="${f(sc[1] + .6)}" rx="5.6" ry="2" transform="rotate(${f(ang * 180 / Math.PI + 90)} ${f(sc[0])} ${f(sc[1])})" ${F(TOPd)}/>`;
    const hr = ang * 180 / Math.PI + 90;
    o += `<g transform="translate(${f(head[0])} ${f(head[1])}) rotate(${f(hr)})">${FM ? `<path d="${TAIL}" fill="${HAIR}"/>` : ''}<ellipse cx="-6.4" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="6.4" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="0" cy="0" rx="6.6" ry="7.6" fill="${SK}"/><path d="${CAP}" fill="${HAIR}"/>` +
      `<path d="M-3.5 -1.9Q-2.5 -2.5 -1.5 -2M1.5 -2Q2.5 -2.5 3.5 -1.9" stroke="${HAIR}" stroke-width=".5" fill="none" stroke-linecap="round"/><circle cx="-2.5" cy=".1" r=".72" fill="#2A1E19"/><circle cx="2.5" cy=".1" r=".72" fill="#2A1E19"/>` +
      `<path d="M0 1.2V2.5" stroke="${SKd}" stroke-width=".55" stroke-linecap="round"/><circle cx="-3.9" cy="2.7" r="1" fill="#F2A48C" opacity=".35"/><circle cx="3.9" cy="2.7" r="1" fill="#F2A48C" opacity=".35"/><path d="M-1.6 4.1Q0 5.2 1.6 4.1" stroke="#B5745C" stroke-width=".55" fill="none" stroke-linecap="round"/></g>`;
    o += arm(-1) + arm(1);
    return o + '</g></svg>';
  }

  /* Figure renderer: a friendly person in a loose orange hoodie, charcoal leggings and white trainers, drawn from the
     joint angles, always on the same garden scene (sun glow, cloud, hill, leafy bushes, path). Scene colours are CSS
     variables, so they follow light, dark and the player's dusk mode. */
  function svg(key, pose, opt = {}) {
  if (opt.front !== false && rigOf(key, opt.ex)) return frontRig(rigOf(key, opt.ex), opt.u ?? 1, opt);
  if (FRONT[key] && opt.front !== false) return front(key, opt.u ?? 1, opt);
  if (opt.front !== false && (opt.ex === 'wu-hip' || key === 'hipcircle')) return frontBody('hip', pose && pose._phase !== undefined ? pose._phase : .25, opt);
  if (opt.front !== false && (key === 'side-bend' || opt.ex === 'side-bend')) return frontBody('bend', opt.u ?? 1, opt);
  if (opt.front !== false && key === 'side-lunge') return frontBody('lunge', opt.u ?? 1, opt);
  if (opt.front !== false && key === 'seated-twist') return frontTwist(opt.u ?? 1, opt);
  if (opt.front !== false && (key === 'wrist-ext' || key === 'wrist-flex')) return wristView(key === 'wrist-ext' ? 'ext' : 'flex', opt.u ?? 1, opt);
  const o = pose || T[key] || T.stand, g = geo(o), p = g.p, f = v => v.toFixed(1), R = Math.PI / 180, FM = female;
  const V = (n, d) => `var(--${n},${d})`, F = c => `style="fill:${c}"`, ST = (c, w) => `style="stroke:${c}" stroke-width="${w}" stroke-linecap="round" fill="none"`;
  const TOP = V('fig-top', '#E8793F'), TOPd = V('fig-top2', '#CF6630'), LEG = V('fig-leg', '#2F3439'), LEGd = V('fig-leg2', '#22262A');
  const SK = '#F1C4A2', SKd = '#E0AB8A', HAIR = '#2E2420', SOLE = '#BFC5CC';
  const PR = V('ill-prop', '#D8C7B6'), PR2 = V('ill-prop2', '#C4B09C');
  const id = key.replace(/[^a-z0-9]/gi, '') + (opt.uid || '');
  const pts = P => P.map(q => f(q[0]) + ',' + f(q[1])).join(' ');
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  // tapered limb with rounded ends
  const limb = (a, b, wa, wb, c) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    const P = [[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2], [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]];
    return `<circle cx="${f(a[0])}" cy="${f(a[1])}" r="${wa / 2}" ${F(c)}/><circle cx="${f(b[0])}" cy="${f(b[1])}" r="${wb / 2}" ${F(c)}/><polygon points="${pts(P)}" ${F(c)}/>`; };
  // leg: leggings to just above the ankle, a little bare ankle, then the trainer
  const leg = (H, K, A, T, c, far) => limb(mix(K, A, .8), A, 4.6, 4.2, far ? SKd : SK) + limb(H, K, 12.6, 9, c) + limb(K, mix(K, A, .84), 9, 5.6, c) + shoe(K, A, T, far);
  // trainer: rounded white upper, grey sole on the side away from the knee, two laces
  const shoe = (K, A, T, far) => { const dx = T[0] - A[0], dy = T[1] - A[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l; let nx = -uy, ny = ux;
    if (nx * (K[0] - A[0]) + ny * (K[1] - A[1]) > 0) { nx = -nx; ny = -ny; }
    const q = (t, n) => [A[0] + ux * t + nx * n, A[1] + uy * t + ny * n], L = l;
    const P = [q(-1.9, -2), q(-3.3, .4), q(-3, 2.7), q(L + 2.4, 2.7), q(L + 3.3, 1.5), q(L + 1.4, -.5), q(2.6, -2.4), q(1, -2.5)], up = far ? '#EFEAE4' : '#FFFFFF';
    const lace = t => { const a = q(t, -2.1 + t * .18), b = q(t + 1.2, -.6 + t * .1); return `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}" stroke="#C9C2BA" stroke-width=".5" stroke-linecap="round"/>`; };
    return `<polygon points="${pts(P)}" fill="#CFC7BE" stroke="#CFC7BE" stroke-width="2.1" stroke-linejoin="round"/><polygon points="${pts(P)}" fill="${up}" stroke="${up}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M${f(P[2][0])} ${f(P[2][1])}L${f(P[3][0])} ${f(P[3][1])}" stroke="${SOLE}" stroke-width="1.5" stroke-linecap="round"/>${lace(2.6)}${lace(4.2)}`; };
  // arm: hoodie sleeve with a ribbed cuff, then the hand
  const arm = (S, E, W, c, c2, far) => { const dx = W[0] - E[0], dy = W[1] - E[1], l = Math.hypot(dx, dy) || 1, hx = W[0] + dx / l * 2.2, hy = W[1] + dy / l * 2.2;
    return `<ellipse cx="${f(hx)}" cy="${f(hy)}" rx="3" ry="2.5" transform="rotate(${f(Math.atan2(dy, dx) / R)} ${f(hx)} ${f(hy)})" fill="${far ? SKd : SK}"/>` + limb(S, E, 7.8, 6.4, c) + limb(E, W, 6.4, 5.2, c) + limb(mix(E, W, .86), W, 5.3, 5.2, c2); };
  // hoodie: loose body, a little wider at the hem, ribbed band at the hip, hood folded behind the neck
  const NECK = ['chintuck', 'supine-chin', 'uptrap', 'levator', 'scm', 'neck-ext', 'iso-neck', 'tennis-ball', 'jaw', 'prone-neck', 'chin-lift', 'subocc-ball', 'scalene'];
  const hood = !NECK.includes(key) && !NECK.includes(opt.ex || '');   // no hood on neck work: it would bunch up behind the head
  const torso = (H, S) => { const dx = S[0] - H[0], dy = S[1] - H[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, ux = dx / l, uy = dy / l;
    // curl bows the spine between the hips and the shoulders (cat-cow): negative rounds the back up, positive lets it sag
    const bow = t => (p.curl || 0) * Math.sin(Math.PI * Math.max(0, Math.min(1, t))), pt = (t, w) => [H[0] + ux * l * t + nx * (w + bow(t)), H[1] + uy * l * t + ny * (w + bow(t))], q = v => f(v[0]) + ' ' + f(v[1]);
    const fr = FM ? [8.2, 7.2, 8.8, 7.6] : [8.2, 8, 9, 8.2], bk = FM ? [8.4, 7.4, 8.2, 8.6] : [8.4, 8, 8.8, 9.4];
    const d = `M${q(pt(-.02, fr[0]))} C${q(pt(.3, fr[1]))} ${q(pt(.55, fr[2]))} ${q(pt(.88, fr[3]))} Q${q(pt(1.1, 5.6))} ${q(pt(1.1, 0))} Q${q(pt(1.1, -6.6))} ${q(pt(.88, -bk[3]))} C${q(pt(.55, -bk[2]))} ${q(pt(.3, -bk[1]))} ${q(pt(-.02, -bk[0]))} Z`;
    const hem = `M${q(pt(.05, fr[0] - .3))} L${q(pt(.05, -bk[0] + .3))}`, hc = pt(1.07, -3.4), ang = Math.atan2(dy, dx) / R;
    return `<path d="${d}" ${F(TOP)}/><path d="${d}" fill="url(#sh${id})" opacity=".16"/>` +
      (hood ? `<ellipse cx="${f(hc[0])}" cy="${f(hc[1])}" rx="3.4" ry="5.6" transform="rotate(${f(ang)} ${f(hc[0])} ${f(hc[1])})" ${F(TOPd)}/>` : ''); };
  const floor = p.mat, nk = p.nk * R, c = [g.S[0] + Math.cos(nk) * 11.4, g.S[1] + Math.sin(nk) * 11.4];
  const body = [g.H, g.S, g.E, g.W, g.K, g.A, g.T, g.K2, g.A2, g.T2, g.E2, g.W2, [c[0] - 9, c[1]], [c[0] + 9, c[1]]].filter(Boolean), xs = body.map(q => q[0]);
  // framing: opt.fit = width/height ratio crops the view around the figure (thumbnails, hero); opt.slice fills the box
  let vb = '0 -8 160 108';
  if (opt.vb) vb = opt.vb;
  else if (opt.fit) { let x0 = Math.min(...xs) - 8, x1 = Math.max(...xs) + 8, y0 = Math.min(...body.map(q => q[1])) - 15, y1 = 98;
    if (p.prop === 'chair') { x0 = Math.min(x0, 32); x1 = Math.max(x1, 92); } if (p.w) { x0 = Math.min(x0, p.w - 6); x1 = Math.max(x1, p.w + 6); }
    let w = x1 - x0, h = Math.max(46, y1 - y0); y0 = y1 - h; if (w / h < opt.fit) { const nw = h * opt.fit; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / opt.fit; y0 -= nh - h; h = nh; }
    vb = [x0, y0, w, h].map(f).join(' '); }
  let out = `<svg class="ill" viewBox="${vb}"${opt.fit || opt.slice ? ' preserveAspectRatio="xMidYMid slice"' : ''} role="img" aria-label="${key}"><defs><linearGradient id="sh${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient></defs>`;
  if (opt.scene !== false && p.top) {      // seen from above: just the mat
    out += `<rect x="-200" y="-200" width="560" height="400" ${F(V('ill-bg', '#FBEDE1'))}/><rect x="38" y="20" width="98" height="78" rx="8" ${F(V('ill-mat', '#F4B48D'))} opacity=".4"/><text x="44" y="29.5" font-size="5.2" font-weight="600" letter-spacing=".3" font-family="system-ui,-apple-system,sans-serif" ${F(V('fig-top2', '#CF6630'))} opacity=".85">SEEN FROM ABOVE</text>`;
  } else if (opt.scene !== false) {
    const B1 = V('ill-bush', '#B4C7A3'), B2 = V('ill-bush2', '#9DB58C'), STEM = V('ill-stem', '#7F9A70'), GLOW = V('ill-glow', '#FFF7F0'), GR = V('ill-ground', '#EFDCCB');
    out += `<rect x="-200" y="-200" width="560" height="400" ${F(V('ill-bg', '#FBEDE1'))}/>`;
    {
      // leafy bush: overlapping lobes with a stem and two veins
      const bush = (x, y, k, col) => `<g transform="translate(${x} ${y}) scale(${k})">${[[0, -15, 8], [-7, -9, 8], [7, -9, 8], [-12, -2, 7], [12, -2, 7], [0, -4, 10]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${F(col)}/>`).join('')}<path d="M0 3V-17M0 -6L-6 -12M0 -9L6 -15" ${ST(STEM, .9)} opacity=".75"/></g>`;
      out += `<circle cx="96" cy="44" r="50" ${F(GLOW)}/>`;
      out += `<g ${F(V('ill-cloud', '#F4E6D9'))}><circle cx="24" cy="10" r="6"/><circle cx="32" cy="7" r="7.5"/><circle cx="40" cy="11" r="5.5"/><rect x="18" y="10" width="28" height="6" rx="3"/></g>`;
      out += `<ellipse cx="34" cy="97" rx="66" ry="13" ${F(V('ill-hill', '#CFDCBD'))}/>`;
      out += bush(18, 90, 1.25, B1) + bush(140, 90, 1.4, B2) + bush(121, 93, .7, B1);
      out += `<ellipse cx="80" cy="99" rx="110" ry="8" ${F(GR)}/><rect x="-200" y="99" width="560" height="200" ${F(GR)}/>`;
    }
  }
  if (p.w) out += `<rect x="${p.w - 2}" y="-8" width="4" height="101" rx="1" ${F(PR2)}/>`;
  if (floor) out += `<rect x="12" y="89.5" width="136" height="4" rx="2" ${F(V('ill-mat', '#F4B48D'))}/>`;
  const props = { chair: `<rect x="36" y="74" width="52" height="6" rx="3" ${F(PR)}/><rect x="36" y="36" width="6" height="40" rx="3" ${F(PR)}/><rect x="40" y="80" width="4" height="13" rx="1" ${F(PR2)}/><rect x="80" y="80" width="4" height="13" rx="1" ${F(PR2)}/>`,
    step: `<rect x="70" y="68" width="42" height="25" rx="3" ${F(PR)}/>`, box: `<rect x="86" y="58" width="46" height="35" rx="3" ${F(PR)}/>`, stair: `<rect x="60" y="83" width="44" height="10" rx="2" ${F(PR)}/>`,
    bed: `<rect x="14" y="54" width="78" height="39" rx="4" ${F(PR)}/><rect x="14" y="54" width="78" height="6" rx="3" ${F(V('ill-mat', '#F4B48D'))}/>`,
    bench: `<rect x="100" y="58" width="52" height="35" rx="3" ${F(PR)}/>`, benchL: `<rect x="10" y="78" width="56" height="15" rx="3" ${F(PR)}/>`, table: `<rect x="82" y="42" width="36" height="5" rx="2" ${F(PR)}/><rect x="110" y="47" width="5" height="46" rx="1" ${F(PR2)}/>` };
  if (p.prop && props[p.prop]) out += props[p.prop];
  (p.ln || []).forEach(l => out += `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" style="stroke:${PR2}" stroke-width="5" stroke-linecap="round"/>`);
  if (p.ball) out += `<circle cx="${p.ball[0]}" cy="${p.ball[1]}" r="6" ${F(PR2)}/>`;
  // soft contact shadow under the body
  if (opt.scene !== false && !p.prop && !p.top) { const lo = body.filter(q => q[1] > 80).map(q => q[0]), a = lo.length ? Math.min(...lo) : g.H[0] - 8, b = lo.length ? Math.max(...lo) : g.H[0] + 8; out += `<ellipse cx="${f((a + b) / 2)}" cy="${floor ? 94.4 : 94.6}" rx="${f(Math.max(9, (b - a) / 2 + 3))}" ry="1.5" fill="#000" opacity=".09"/>`; }
  // back to front: far arm, far leg, neck, torso with hood, near leg, head, near arm
  const E2 = g.E2 || g.E, W2 = g.W2 || g.W;
  out += arm(g.S, E2, W2, TOPd, TOPd, true);
  if (g.K2) out += leg(g.H, g.K2, g.A2, g.T2, LEGd, true);
  out += limb(g.S, c, 5, 4.6, SKd);
  out += limb(g.H, mix(g.H, g.K, .3), 15.4, 12.2, LEG);
  out += torso(g.H, g.S);
  out += leg(g.H, g.K, g.A, g.T, LEG);
  // head in its own frame: up = from neck to crown, forward = the way the face looks
  if (p.armBack) out += arm(g.S, g.E, g.W, TOP, TOPd);      // hands clasped behind the head: the forearm passes behind it, the face stays clear
  out += `<g transform="translate(${f(c[0])} ${f(c[1])}) rotate(${f(p.nk + 90)}) scale(1.1)">`;
  if (FM) out += `<path d="M-2.6 -6C-5.8 -8.6 -10.8 -7.4 -11.4 -2.8C-11.8 .6 -11 3.6 -9.5 6.2C-9.4 3.4 -8.4 .8 -5 -1.2Z" fill="${HAIR}"/>`;
  out += `<ellipse cx="0" cy="0" rx="5.6" ry="6.2" fill="${SK}"/><path d="M5.3 -.9Q6.8 .7 5.3 1.7Z" fill="${SK}"/>`;
  out += FM ? `<path d="M4.4 -3.8C3.4 -7.6 -4.2 -8 -5.7 -2.8C-6.3 -.2 -5.8 2.4 -4.5 4.1C-3.4 4 -2.7 3.5 -2.6 2.6C-2.5 .8 -1.8 -.9 -.4 -2C1 -3 2.8 -3.2 4.4 -3.8Z" fill="${HAIR}"/>`
    : `<path d="M4.3 -4.2C3.4 -7.6 -4.4 -7.9 -5.7 -2.6C-6 -.8 -5.7 1.2 -5 2.4L-3.3 2.3C-3.3 .7 -2.9 -.9 -1.9 -2C-.6 -3.1 2.1 -3.4 4.3 -4.2Z" fill="${HAIR}"/>`;
  const ex = FM ? -1.6 : -2.4;   // ear sits on the hairline, skin coloured with one soft inner curve
  out += `<ellipse cx="${ex}" cy="1.1" rx="1.15" ry="1.55" fill="${SK}"/><path d="M${ex + .35} .4Q${ex - .45} 1.1 ${ex + .25} 1.9" stroke="#D69878" stroke-width=".35" fill="none" stroke-linecap="round"/><path d="M2.7 -2.3Q3.4 -2.7 4.1 -2.35" stroke="${HAIR}" stroke-width=".45" fill="none" stroke-linecap="round"/><circle cx="3.4" cy="-.6" r=".6" fill="#2A1E19"/><circle cx="4.2" cy="1.5" r=".85" fill="#F2A48C" opacity=".35"/><path d="M2.9 3Q3.8 3.6 4.7 2.9" stroke="#B5745C" stroke-width=".55" fill="none" stroke-linecap="round"/></g>`;
  if (!p.armBack) out += arm(g.S, g.E, g.W, TOP, TOPd);
  if (p.wt) out += `<rect x="${f(g.W[0] - 5)}" y="${f(g.W[1])}" width="10" height="8" rx="2" ${F(PR2)}/>`;
  return out + '</svg>';
}
  /* ---------- movement ----------
     MOVES[exercise id] = { ill, a, b, pin, pinFrom, tempo, alt, spin }. Pose A is the start and pose B the end of one
     repetition (template + overrides). 'pin' keeps a foot or hand planted with two-bone inverse kinematics, so
     squats, bridges and push-ups keep their contact points exactly. tempo = [move, hold, return, rest] in seconds.
     Only exercises whose movement can be shown truthfully from the side are listed; the rest stay as stills. */
  const SQ = { hx: 58, tr: -88, nk: -88, th: 60, sh: 100, th2: 125, sh2: 140, ua: 90, fa: 90 };
  const MOVES = {
    'prone-T': { rig: true, a: {}, b: {}, tempo: [1.5, 2, 2, 0.5] }, 'prone-W': { rig: true, a: {}, b: {}, tempo: [1.5, 2, 2, 0.5] }, 'reverse-fly': { rig: true, a: {}, b: {}, tempo: [1.5, 0.5, 2.5, 0.5] }, shrug: { rig: true, a: {}, b: {}, tempo: [1.5, 2, 2.5, 0.5] }, copenhagen: { rig: true, a: {}, b: {}, tempo: [1.5, 5, 2, 1] },
    'lateral-raise': { rig: true, a: {}, b: {}, tempo: [1.5, 0.5, 2.5, 0.5] }, 'pull-apart': { rig: true, a: {}, b: {}, tempo: [1.5, 1, 2, 0.5] }, 'band-er': { rig: true, a: {}, b: {}, tempo: [1.5, 0.5, 2.5, 0.5] }, 'band-ir': { rig: true, a: {}, b: {}, tempo: [1.5, 0.5, 2.5, 0.5] }, monster: { rig: true, a: {}, b: {}, tempo: [0.9, 0.2, 0.9, 0.2] },
    'wu-march': { ill: 'stand', a: { th2: 90, sh2: 90 }, b: { th2: -5, sh2: 90 }, tempo: [0.45, 0.05, 0.45, 0], alt: true, armSwing: true },
    walk: { ill: 'walk', a: {}, b: { th: 118, sh: 130, th2: 62, sh2: 72, ua: 62, fa: 12, ua2: 112, fa2: 92 }, tempo: [0.6, 0, 0.6, 0] },
    'chin-tuck': { ill: 'chintuck', a: { nk: -88 }, b: { nk: -106 }, tempo: [1.5, 2, 1.5, .5] },
    'neck-ext': { ill: 'neck-ext', a: { nk: -84 }, b: {}, tempo: [2, 2, 2, .5] },
    'wu-swing': { ill: 'stand', a: { ua: 140, fa: 150 }, b: { ua: -150, fa: -150 }, tempo: [1, 0, 1, 0] },
    'wu-hip': { ill: 'stand', a: {}, b: {}, circle: true, tempo: [3.2, 0, 0, 0] },
    'wu-cat': { ill: 'allfours', a: { nk: -46, curl: 4.5 }, b: { nk: 26, curl: -7 }, tempo: [2.4, 0.4, 2.4, 0.4] },      // cow: back sags, head up; cat: back rounds up, head drops
    'cat-cow': { a: { nk: -46, curl: 4.5 }, b: { nk: 26, curl: -7 }, tempo: [2.4, 0.4, 2.4, 0.4] },
    pendulum: { a: { ua: 72, fa: 72 }, b: { ua: 108, fa: 108 }, tempo: [1, 0, 1, 0] },
    'arm-circles': { spin: true, tempo: [3, 0, 0, 0] },
    'leg-swing': { a: { th2: 128, sh2: 140 }, b: { th2: 22, sh2: 30 }, tempo: [0.9, 0, 0.9, 0] },
    'knee-wall': { a: { hx: 66 }, b: { hx: 76 }, pin: ['foot', 'foot2'], tempo: [2, 1, 2, 0] },
    'open-book': { book: true, a: {}, b: {}, tempo: [3, 1, 3, 0] },
    'supine-chin': { a: { nk: 180 }, b: { nk: 187 } }, 'chin-lift': { a: { nk: 180 }, b: { nk: 200 } },      // lying head-left: angles above 180 lift the head off the mat 'prone-neck': { a: { nk: 8 }, b: { nk: -22 } },
    'band-row': { a: { ua: 15, fa: 5 }, b: { ua: 150, fa: 10 } }, 'face-pull': { a: { ua: 5, fa: 0 }, b: { ua: -20, fa: -115 } },
    'prone-Y': { a: { ua: 6, fa: 6 }, b: { ua: -28, fa: -28 } }, 'wall-slide': { a: { ua: -10, fa: -80 }, b: { ua: -62, fa: -84 } },
    pulldown: { a: { ua: -80, fa: -85 }, b: { ua: 55, fa: -65 } }, press: { a: { ua: 35, fa: -80 }, b: { ua: -85, fa: -88 } },
    pushup: { a: {}, b: { hx: 76.6, hy: 83.6, tr: -10, nk: -12, ua: 150 }, pin: ['foot', 'hand'] },
    'hammer-curl': { a: { fa: 85 }, b: { fa: -55 } }, pushdown: { a: { fa: -25 }, b: { fa: 88 } },
    deadbug: { a: { ua: -90, fa: -90, th2: -90, sh2: 0 }, b: { ua: -172, fa: -172, th2: -8, sh2: -8 } },
    'curl-up': { a: { tr: 180, nk: 180 }, b: { tr: 192, nk: 205 } },
    birddog: { a: { ua: 90, fa: 90, th2: 90, sh2: 180 }, b: { ua: -6, fa: -6, th2: 178, sh2: 178 } },
    pallof: { a: { ua: 55, fa: -45 }, b: { ua: 0, fa: 0 } },
    superman: { a: { tr: -3, nk: -4, ua: 4, fa: 4, th: 180, sh: 180 }, b: { th: 188, sh: 188 } },
    rdl: { a: { hx: 52, tr: -88, nk: -88, th: 90, sh: 90 }, b: { hx: 45, tr: -12, nk: -18, th: 84, sh: 96 }, pin: ['foot'] },
    bridge: { a: { hx: 97, hy: 86, tr: 176, nk: 180 }, b: {}, pin: ['foot'], pinFrom: 'b' },
    'sl-bridge': { a: { hx: 97, hy: 86, tr: 176, nk: 180, th2: -80, sh2: -30 }, b: {}, pin: ['foot'], pinFrom: 'b' },
    'hip-thrust': { a: { hx: 88.2, hy: 86, tr: 210, nk: 200 }, b: {}, pin: ['foot'], pinFrom: 'b' },
    clam: { rig: true, a: {}, b: {}, tempo: [1.5, 1, 2, 0.5] }, 'side-leg': { rig: true, a: {}, b: {}, tempo: [1.5, 0.5, 2.5, 0.5] },
    march: { a: { th2: 90, sh2: 90 }, b: { th2: -10, sh2: 90 } },
    'split-squat': { a: { ...SQ, hy: 56 }, b: { ...SQ, hy: 70 }, pin: ['foot', 'foot2'] },
    'sit-stand': { ill: 'squat', a: { hx: 62, hy: 53, tr: -88, nk: -88, ua: 90, fa: 90, th: 90, sh: 90 }, b: { hx: 46, hy: 70, tr: -58, nk: -62, ua: 10, fa: 5, th: 20, sh: 110 }, pin: ['foot'] },
    'step-up': { a: { hx: 56, hy: 53, th: 90, sh: 90, th2: 30, sh2: 90 }, b: { hx: 72, hy: 44, th: 92, sh: 92, th2: 88, sh2: 90 }, pin: ['foot2'] },
    'ham-curl': { a: { sh: 180 }, b: { sh: 255 } },
    nordic: { a: { hx: 60, hy: 67, tr: -90, nk: -90, th: 90, sh: 180, ua: 70, fa: 10 }, b: {}, tempo: [4, 0, 2, 1] },
    'calf-raise': { ill: 'stand', a: { hy: 53, ft: 0 }, b: { hy: 47.4, ft: 40 } },
    'seated-calf': { a: { ft: 0 }, b: { th: -10, sh: 88, ft: 24 } }, 'toe-raise': { a: { ft: 0 }, b: { ft: -32 } }
  };
  const DEF = { hx: 70, hy: 53, tr: -90, nk: -90, ua: 90, fa: 90, th: 90, sh: 90 }, RD = Math.PI / 180;
  function ik(P, Q, l1, l2, hint) {   // two-bone IK: angles (degrees) of both segments so that the chain from P ends at Q
    const dx = Q[0] - P[0], dy = Q[1] - P[1], d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, Math.hypot(dx, dy))), base = Math.atan2(dy, dx);
    const al = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)), diff = a => Math.abs(((a - hint * RD + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
    const a1 = diff(base + al) < diff(base - al) ? base + al : base - al, J = [P[0] + Math.cos(a1) * l1, P[1] + Math.sin(a1) * l1];
    return [a1 / RD, Math.atan2(Q[1] - J[1], Q[0] - J[0]) / RD];
  }
  function animPose(key, mv, u, cycle = 0, phase = 0) {
    const base = T[mv.ill || key] || T.stand, A = { ...DEF, ...base, ...(mv.a || {}) }, B = { ...DEF, ...base, ...(mv.b || {}) };
    for (const X of [A, B]) { const Y = X === A ? B : A; if (X.ft === undefined && Y.ft !== undefined) X.ft = X.sh - 90; }
    const P = { ...A }; for (const k in B) if (typeof B[k] === 'number' && typeof A[k] === 'number') P[k] = A[k] + (B[k] - A[k]) * u;
    if (mv.spin) { P.ua = P.fa = -90 + 360 * phase; }
    /* open book, seen from above: the top arm lifts off the bottom one, points at the ceiling (toward the viewer, so it
       shortens to nothing) and opens down behind the back, while the head turns after it. Knees and bottom arm stay put. */
    if (mv.book) { const c = Math.cos(u * 165 * RD); P.al = Math.max(.12, Math.abs(c)); P.ua = P.fa = c >= 0 ? -90 : 90; P.nk = 180 - 16 * u; }
    /* hip circles: the pelvis traces an ellipse (forward, side, back, side), the trunk counter-tilts so the head stays
       over the feet, both feet stay planted, hands rest on the hips. One continuous loop per cycle. */
    if (mv.circle) { P._phase = phase; const a = 2 * Math.PI * phase, c = Math.cos(a), sn = Math.sin(a);
      P.hx = 70 + 5 * c; P.hy = 54 + 1.3 * sn; P.tr = -90 - 9 * c; P.nk = -90 - 4 * c;
      [P.th, P.sh] = ik([P.hx, P.hy], [71, 89.5], 19, 18, 80); [P.th2, P.sh2] = ik([P.hx, P.hy], [68.5, 89.5], 19, 18, 80); P.ft = 0;
      const S = [P.hx + Math.cos(P.tr * RD) * 28, P.hy + Math.sin(P.tr * RD) * 28];
      [P.ua, P.fa] = ik(S, [P.hx + 4.5, P.hy - 4], 14, 12, 125); [P.ua2, P.fa2] = ik(S, [P.hx - 3.5, P.hy - 4], 14, 12, 135); }
    if (mv.pin) { const g0 = geo(mv.pinFrom === 'b' ? B : A, true), H = [P.hx, P.hy], S = [H[0] + Math.cos(P.tr * RD) * 28, H[1] + Math.sin(P.tr * RD) * 28];
      // a planted foot keeps the angle it was planted at: it never tips into the floor as the shin leans over it
      const X = g0.p, flat = a => Math.abs(((a % 360) + 540) % 360 - 180) < 25;
      if (mv.pin.includes('foot')) { [P.th, P.sh] = ik(H, g0.A, 19, 18, P.th); const a = X.ft !== undefined ? X.ft : X.sh - 90; if (flat(a)) P.ft = a; }
      if (mv.pin.includes('foot2') && g0.A2) { [P.th2, P.sh2] = ik(H, g0.A2, 19, 18, P.th2); const a = X.ft2 !== undefined ? X.ft2 : X.sh2 - 90; if (flat(a)) P.ft2 = a; }
      if (mv.pin.includes('hand')) [P.ua, P.fa] = ik(S, g0.W, 14, 12, P.ua); }
    P.mat = onFloor(A) || onFloor(B);
    // alternating moves change legs only when both feet are down (pose A), so nothing jumps between steps
    if (mv.alt && cycle % 2) { [P.th, P.th2] = [P.th2, P.th]; [P.sh, P.sh2] = [P.sh2, P.sh]; if (!mv.armSwing && P.ua2 !== undefined) { [P.ua, P.ua2] = [P.ua2, P.ua]; [P.fa, P.fa2] = [P.fa2, P.fa]; } }
    // arms swing continuously, opposite to the lifting leg: a sine over the whole two-step cycle, no reset
    if (mv.armSwing) { const w = Math.sin(Math.PI * (cycle + phase)); P.ua = 85 - 32 * w; P.fa = P.ua - 15 - 35 * Math.max(0, w); P.ua2 = 85 + 32 * w; P.fa2 = P.ua2 - 15 - 35 * Math.max(0, -w); }
    return P;
  }
  /* One steady frame for a whole exercise in the player: the box that holds the figure through the entire movement, at the
     stage's own shape. Nothing is cropped (floor work is wide, standing work is tall) and the camera never jumps. */
  const isFront = (key, ex) => !!rigOf(key, ex) || !!FRONT[key] || key === 'side-bend' || key === 'side-lunge' || key === 'seated-twist' || key === 'wrist-ext' || key === 'wrist-flex' || key === 'hipcircle' || ex === 'side-bend' || ex === 'wu-hip';
  function frame(key, mv, ratio, ex) {
    if (isFront(key, ex)) return null;
    const poses = mv ? [0, .25, .5, .75, 1].flatMap(u => [0, 1].map(c => animPose(key, mv, u, c, u))) : [T[key] || T.stand];
    let x0 = 1e9, x1 = -1e9, y0 = 1e9;
    for (const o of poses) { const g = geo({ ...o }), p = g.p, c = [g.S[0] + Math.cos(p.nk * RD) * 11.4, g.S[1] + Math.sin(p.nk * RD) * 11.4];
      for (const q of [g.H, g.S, g.E, g.W, g.K, g.A, g.T, g.K2, g.A2, g.T2, g.E2, g.W2, [c[0] - 9, c[1]], [c[0] + 9, c[1]], [c[0], c[1] - 9]]) if (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); }
      if (p.prop === 'chair') { x0 = Math.min(x0, 34); x1 = Math.max(x1, 90); } else if (p.prop) { x0 = Math.min(x0, p.hx - 34); x1 = Math.max(x1, p.hx + 34); }
      if (p.w) { x0 = Math.min(x0, p.w - 4); x1 = Math.max(x1, p.w + 4); } if (p.top) { x0 = Math.min(x0, 46); x1 = Math.max(x1, 128); y0 = Math.min(y0, 26); } }
    x0 -= 11; x1 += 11; y0 -= 8; const y1 = 100; let w = x1 - x0, h = Math.max(62, y1 - y0); y0 = y1 - h;
    if (w / h < ratio) { const nw = h * ratio; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / ratio; y0 -= (nh - h) * .72; h = nh; }
    return [x0, y0, w, h].map(v => v.toFixed(1)).join(' ');
  }
  return { FRONT, T, geo, svg, MOVES, animPose, setFemale, frame, isFront };
})();

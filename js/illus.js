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
    'overhead-triceps': { ua: -75, fa: 135, far: ['E', -125], hl: 'ua' },      // one hand down the back, the other hand on that elbow
    'cross-body': { ua: 10, fa: 170, hl: 'ua' },
    sleeper: { ...LY, hy: 80, ua: 0, fa: -90, th: -20, sh: 40, hl: 'fa' },
    'door-er': { tr: -88, ua: 88, fa: 0, w: 86, hl: 'ua' },      // elbow at the side bent 90°, forearm level against the frame
    child: { hx: 40, hy: 78, tr: 5, nk: 10, ua: 15, fa: 15, th: 30, sh: 180, hl: 'tr' },
    uptrap: { nk: -55, ua: -30, fa: -130, hl: 'nk' },
    levator: { nk: -30, ua: -60, fa: 150, hl: 'nk' },
    chintuck: { nk: -97, hd: 13, zoom: true, hl: 'nk' },
    'shoulder-roll': { zoom: true, rollCue: true, ua: 92, fa: 88 },      // side-on, upper body: the shoulder draws a circle, up, back, down, forward      // head drawn back over the shoulders, chin slightly down, eyes level: a tuck, not a tilt
    'supine-chin': { ...LY, nk: 178, th: -60, sh: 60, hl: 'nk' },
    scm: { nk: -115, hl: 'nk' },
    'neck-ext': { nk: -48, hand: [-6.3, .6, -22], hand2: [-7.2, -2.6, -46], armBack: true, ghost: .55, zoom: true, hl: 'nk' },      // both hands on the back of the head; the near arm crosses in front of the face, so it is drawn see-through there
    'iso-neck': { nk: -90, hand: [8.2, 1.2, 20], zoom: true, hl: 'nk' },             // palm on the forehead, head pressing into it
    sphinx: { ...PR, tr: -25, nk: -30, ua: 90, hl: 'tr' },
    'side-bend': { tr: -72, ua: -60, fa: -60, hl: 'tr' },
    allfours: { ...AF, hl: 'tr' },
    'knees-chest': { ...LY, th: -100, sh: 60, ua: -35, fa: -35, hl: 'tr' },
    'supine-twist': { ...LY, hy: 84, th: -60, sh: 60, ua: 10, fa: 10, hl: 'tr' },
    seated: { hx: 60, hy: 72, tr: -84, nk: -86, th: 0, sh: 90, ua: 60, fa: 10, prop: 'chair' },
    'seated-twist': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, ua: 160, fa: 40, prop: 'chair', hl: 'tr' },
    'seated-side': { hx: 60, hy: 72, tr: -60, nk: -60, th: 0, sh: 90, ua: -60, fa: -60, prop: 'chair', hl: 'tr' },
    'half-kneel': { hy: 66, th: 0, sh: 90, th2: 100, sh2: 180, hl: 'th2' },
    'half-kneel-reach': { hy: 66, tr: -93, th: 0, sh: 90, th2: 100, sh2: 180, ua: -86, fa: -98, hl: 'th2' },      // same position, the arm on the kneeling side reaching up
    thomas: { hx: 85, hy: 52, tr: 180, nk: 180, th: -122, sh: 30, grab: ['K', 75, 0, -1], th2: 14, sh2: 96, prop: 'bed', hl: 'th2' },      // one knee hugged to the chest, the other thigh hangs just below level off the edge, shin dropping
    couch: { hx: 76, hy: 66, th: 0, sh: 90, th2: 110, sh2: -92, w: 62, hl: 'th2 sh2' },      // back knee on the floor close to the wall, shin up the wall behind
    'quad-stand': { th2: 100, sh2: -103, grab: ['A2', 120, 1, -1], w: 99, far: ['wall', 3, 30], hl: 'th2' },      // the hand holds the ankle behind
    figure4: { ...LY, th: -70, sh: 60, th2: -35, sh2: -140, grab: ['K', -40, 1, 1], note: 'ANKLE ON THE OTHER KNEE · PULL THE THIGH IN', hl: 'th2' },      // hands pulling the supporting thigh toward the chest
    pigeon: { hx: 60, hy: 76, tr: -60, nk: -60, ua: 60, fa: 60, th: 150, sh: 30, th2: 170, sh2: 170, hl: 'th' },
    'seated-fig4': { hx: 60, hy: 72, tr: -55, nk: -55, th: 0, sh: 90, th2: -15, sh2: 130, prop: 'chair', hl: 'th2' },
    'knee-opp': { ...LY, th: -110, sh: 40, th2: 0, sh2: 0, grab: ['K', -40, 0, 1], hl: 'th' },      // hand on the knee, drawing it across
    'itb-cross': { th: 75, sh: 100, th2: 105, sh2: 80, tr: -100, hl: 'th' },
    butterfly: { hx: 60, hy: 88, tr: -60, nk: -60, th: 10, sh: 175, hl: 'th' },
    frog: { ...AF, hy: 72, th: 60, sh: 180, hl: 'th' },
    'side-lunge': { hx: 60, hy: 70, tr: -75, nk: -75, th: 40, sh: 110, th2: 5, sh2: 5, hl: 'th2' },
    '9090': { hx: 70, hy: 86, tr: -85, nk: -85, ua: 60, fa: 60, th: -8, sh: 25, th2: 188, sh2: 150, hl: 'th' },
    'supine-ham': { ...LY, hx: 80, th: -80, sh: -80, th2: 0, sh2: 0, ua: -52, fa: -66, strap: true, hl: 'th' },      // hands hold a strap looped round the lifted foot
    'heel-step': { th2: 28, sh2: 28, tr: -62, nk: -66, ua: 60, fa: 40, prop: 'step', hl: 'th2' },      // front knee straight, heel on the step, hinge from the hips with a flat back
    'seated-ham': { hx: 60, hy: 88, tr: -60, nk: -50, ua: -20, fa: -20, th: 0, sh: 0, th2: -39, sh2: 65, hl: 'th' },      // one leg straight, the other bent
    'wall-calf': { hx: 62, hy: 58, tr: -65, ua: 10, fa: 10, th: 60, sh: 95, th2: 115, sh2: 115, ft2: 0, w: 100, hl: 'sh2' },
    'wall-calf-bent': { hx: 62, hy: 58, tr: -65, ua: 10, fa: 10, th: 60, sh: 95, th2: 100, sh2: 120, ft2: 0, w: 100, hl: 'sh2' },
    'heel-drop': { hy: 40, ft: 30, prop: 'stair', hl: 'sh' },
    'knee-wall': { hx: 70, hy: 66, th: 10, sh: 70, th2: 100, sh2: 180, w: 104, hl: 'sh' },
    'kneel-shin': { hx: 48, hy: 76, th: 40, sh: 180, hl: 'sh' },
    'toe-wall': { ft: -40, w: 85, hl: 'sh' },
    'peroneal': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, th2: -15, sh2: 130, prop: 'chair', hl: 'sh2' },
    'foam-roll': { ...LY, tr: 172, nk: 168, th: -65, sh: 55, hand: [-6, .5, 150], armBack: true, roll: 0.62, hl: 'tr' },      // roll across the mid-back, hands behind the head
    /* Open book is done lying on the side, which a side-on camera cannot show, so this one pose is drawn from above
       (top: true): the profile is the person on their side, knees bent and stacked in front, both arms out in front. */
    'open-book': { top: true, hx: 98, hy: 60, tr: 180, nk: 180, th: -90, sh: 0, th2: -84, sh2: 3, ua: -90, fa: -90, ua2: -90, fa2: -90, hl: 'tr' },
    'thread': { ...AF, ua: 180, fa: 180, hl: 'tr' },
    hug: { ua: 20, fa: 170, hl: 'tr' },
    'wall-lat': { hx: 40, tr: -5, nk: -5, ua: 0, fa: 0, w: 96, hl: 'tr' },
    'downdog': { hx: 86, hy: 56, tr: 42, nk: 42, ua: 42, fa: 42, th: 113, sh: 113, ft: 0, hl: 'sh' },      // folded forward from the hips (belly toward the thighs), hands in front, heels back
    'wgs': { hx: 55, hy: 68.5, tr: -40, nk: -40, ua: 60, fa: 60, th: 10, sh: 90, th2: 152, sh2: 152, hl: 'th2' },      // long lunge: front shin upright, back leg straight on its toes
    'leg-swing': { th2: 20, sh2: 20, ua: 176, fa: 176, w: 41, hl: 'th2' },      // one hand on a wall for balance
    'arm-circle': { ua: -60, fa: -60, hl: 'ua' },
    'wrist-flex': { ua: 0, fa: 0, hl: 'fa' },
    'wrist-ext': { ua: 0, fa: 0, hl: 'fa' },
    'jaw': { nk: -88, hand: [5, -4.6, 30], zoom: true, hl: 'nk' },                 // fingertips on the jaw muscle, in front of the ear
    'deep-squat': { hx: 50, hy: 70, tr: -70, nk: -75, ua: 0, fa: 0, th: 20, sh: 125, hl: 'th' },
    'wall-angel': { ua: -120, fa: -120, w: 57, hl: 'ua' },
    pendulum: { hx: 48, tr: -42, nk: -36, prop: 'table', far: ['pt', 93.5, 40.5, -80], note: 'ONE HAND ON THE TABLE · THE OTHER ARM HANGS LOOSE', hl: 'ua' },      // hinged forward with a long back, head clear of the table, free arm hanging straight down
    'band-row': { ua: 150, fa: 10, band: { at: 'W', x: 116, y: 31 }, hl: 'ua' },                 // band tied in front at chest height
    'face-pull': { ua: -20, fa: -115, band: { at: 'W', x: 116, y: 15 }, hl: 'ua' },            // band tied in front at face height
    'prone-T': { ...PR, ua: -90, fa: -90, hl: 'ua' },
    'prone-Y': { ...PR, ua: -30, fa: -30, hl: 'ua' },
    'prone-W': { ...PR, ua: -90, fa: -10, hl: 'fa' },
    'wall-slide': { hx: 66.4, hy: 53.3, tr: -83, nk: -83, th: 97, sh: 97, ft: 0, ua: -10, fa: -84, w: 88, hl: 'ua' },      // leaning in from the ankles, forearms upright on the wall, elbows at shoulder height
    'scap-pushup': { hx: 73.2, hy: 72.8, tr: -19.2, nk: -21, ua: 90, fa: 90, th: 160.8, sh: 160.8, toes: true, hl: 'ua' },
    deadbug: { ...LY, ua: -172, fa: -172, ua2: -90, fa2: -90, th: -90, sh: 0, th2: -8, sh2: -8, hl: 'tr' },      // one arm lowers overhead and the opposite leg lowers; the other arm stays pointing at the ceiling, the other knee stays above the hip
    plank: { hy: 80, tr: -8, nk: -16, ua: 90, fa: 0, th: 172, sh: 172, toes: true, hl: 'tr' },      // one straight line from shoulders to ankles, on the toes
    'side-plank': { hy: 80, tr: -8, nk: -16, ua: -90, fa: -90, th: 172, sh: 172, toes: true, hl: 'tr' },
    copenhagen: { hy: 82, tr: -12, nk: -20, ua: -90, fa: -90, th: 172.5, sh: 172.5, toes: true, th2: 175, sh2: 175, prop: 'bench', hl: 'th2' },
    birddog: { ...AF, ua: -6, fa: -6, ua2: 90, fa2: 90, th2: 178, sh2: 178, hl: 'tr' },      // one arm reaches forward, the opposite leg reaches back; the other hand and knee stay on the floor
    bridge: { hx: 92, hy: 72, tr: 145, nk: 175, ua: 0, fa: 0, th: -5, sh: 95, hl: 'th' },
    'sl-bridge': { hx: 92, hy: 72, tr: 145, nk: 175, th: -5, sh: 95, th2: -50, sh2: -50, grab: ['K2', -60, 0, 1], hl: 'th' },      // one knee held to the chest
    clam: { hx: 90, hy: 86, tr: 180, nk: 180, ua: 0, fa: 0, th: -35, sh: 70, th2: -65, sh2: 55, hl: 'th2' },
    'side-raise-leg': { hx: 90, hy: 86, tr: 180, nk: 180, ua: 0, fa: 0, th: -10, sh: 20, th2: -40, sh2: -40, hl: 'th2' },
    rdl: { hx: 45, tr: -5, nk: -10, th: 85, sh: 95, hl: 'th' },
    'split-squat': { hx: 58, hy: 66, tr: -88, nk: -88, th: 22, sh: 97, th2: 118, sh2: 165, hl: 'th' },
    squat: { hx: 50, hy: 60, tr: -70, nk: -75, ua: 0, fa: 0, th: 20, sh: 110, hl: 'th' },
    'step-up': { hx: 56, th2: 30, sh2: 90, prop: 'stair', hl: 'th2' },
    'ham-curl': { ...PR, sh: 250, band: { at: 'A', x: -14, y: 89, peg: true }, hl: 'th' },      // band round the ankle, tied low behind the feet
    nordic: { hx: 72, hy: 71.4, tr: -50, nk: -50, ua: 40, fa: 0, th: 130, sh: 180, hl: 'th' },
    tke: { band: { at: 'K', x: 112, y: 72, r: 5.8 }, hl: 'sh' },                                 // band behind the knee, tied in front at knee height
    'band-er': { ua: 90, fa: 0, hl: 'fa' },
    'band-ir': { ua: 90, fa: 25, hl: 'fa' },
    'reverse-fly': { hx: 50, tr: -25, nk: -30, ua: -90, fa: -90, hl: 'ua' },
    'pull-apart': { ua: 0, fa: 0, hl: 'ua' },
    'toe-raise': { ft: -35, hl: 'sh' },
    'calf-raise': { hy: 47, ft: 45, hl: 'sh' },
    'seated-calf': { hx: 60, hy: 72, tr: -80, nk: -80, th: -10, sh: 88, ft: 24, prop: 'chair', hl: 'sh' },       // heel lifted, toes stay on the floor
    'hammer-curl': { ua: 90, fa: -30, hl: 'fa' },
    pushdown: { ua: 90, fa: 80, band: { at: 'W', x: 90, y: -5, hook: true }, hl: 'ua' },         // band tied above
    march: { th2: 0, sh2: 90, hl: 'th2' },
    superman: { hx: 60, hy: 86, tr: -15, nk: -20, ua: -5, fa: -5, th: -172, sh: -172, hl: 'tr' },
    pushup: { hx: 73.2, hy: 72.8, tr: -19.2, nk: -21, ua: 90, fa: 90, th: 160.8, sh: 160.8, toes: true, hl: 'ua' },
    pulldown: { ua: -75, fa: -75, band: { at: 'W', x: 79, y: -6, hook: true }, hl: 'ua' },       // band tied overhead
    press: { ua: -90, fa: -90, hl: 'ua' },
    'lateral-raise': { ua: 0, fa: 0, hl: 'ua' },
    shrug: { hl: 'nk' },
    suitcase: { wt: true, hl: 'tr' },
    'ball-squeeze': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, prop: 'chair', ball: [78, 88], hl: 'th' },
    balance: { th2: 60, sh2: 90, hl: 'sh' },
    monster: { th: 70, sh: 105, th2: 110, sh2: 75, hl: 'th' },
    'towel': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, prop: 'chair', hl: 'sh' },
    'band-foot': { hx: 60, hy: 88, tr: -60, nk: -50, ua: -20, fa: -20, th: 0, sh: 0, band: { at: 'T', x: 126, y: 84, peg: true, r: 4.2 }, hl: 'sh' },      // band round the front of the foot
    'curl-up': { ...LY, hy: 84, th: -60, sh: 60, th2: 0, sh2: 0, ua: 20, fa: 20, hl: 'tr' },
    pallof: { ua: 0, fa: 0, band: { at: 'W', x: 83, y: 31, label: 'BAND FROM THE SIDE' }, hl: 'tr' },      // tied beside you at chest height; you press straight out and resist the turn
    'hip-thrust': { hx: 92, hy: 72, tr: 180, nk: 188, ua: 0, fa: 0, th: 0, sh: 90, prop: 'benchL', wt: true, hl: 'th' },
    breathing: { ...LY, th: -60, sh: 60, ua: 5, fa: -60, ua2: 0, fa2: -110, hl: 'tr' },      // elbows resting beside the body, one hand on the belly, the other on the chest
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
    const shoeLow = (K, A, a) => { const ux = Math.cos(a * R), uy = Math.sin(a * R); const ny = ux;      // the sole is always on the same side of the foot (see shoe() in the renderer)
      const q = (t, n) => A[1] + uy * t + ny * n; return Math.max(q(-1.9, -2), q(-3.3, .4), q(-3, 2.7), q(9.4, 2.7), q(10.3, 1.5), q(8.4, -.5), q(2.6, -2.4), q(1, -2.5)) + 1; };
    /* Foot angle. Unless a pose sets it, a foot sits square to its shin. Three things override that:
       1. a foot standing on the floor or mat lies flat on it (ankle at floor height, shin fairly upright). The exception is
          a trailing leg, thigh and shin both angled back, which is on its toes: walking, the back leg of a lunge.
       2. when the shin itself lies on the floor (kneeling, all fours, lying face down), the foot continues the line of the
          shin, the top of the foot resting on the floor. Poses marked toes: true (planks, push-ups) stay on the toes.
       3. if the shoe would still go through the floor, it is turned just far enough to rest on it.
       1 and 2 are blended over the last few units of height, so a foot that lands or lifts during a movement never snaps. */
    const footA = (set, th, sh, K, A, solve) => { if (set !== undefined) return set; if (p.top) return sh - 90; const def = sh - 90, sn = Math.abs(Math.sin(sh * R)), trail = cl((-Math.cos(th * R) - .1) / .15) * cl((-Math.cos(sh * R) - .1) / .15);
      const w1 = cl((A[1] - 83.5) / 3) * cl((sn - .42) / .15) * (1 - trail), w2 = p.toes ? 0 : cl((A[1] - 76) / 9) * cl((.5 - sn) / .35) * (Math.sin(def * R) > 0 ? 1 : 0);      // wide blends: a foot leaving the floor turns gradually, it never flips
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
      if (p.hand2) { const up = d(p.nk, 1), c = ad(S, d(p.nk, 11.4)), Q = [c[0] - up[1] * p.hand2[0] + up[0] * p.hand2[1], c[1] + up[0] * p.hand2[0] + up[1] * p.hand2[1]]; [p.ua2, p.fa2] = ik(S, Q, 14, 12, p.hand2[2]); }      // the other hand has its own spot, so both arms can be seen
      if (p.grab) { const q = { K, A, K2, A2 }[p.grab[0]]; if (q) [p.ua, p.fa] = ik(S, [q[0] + (p.grab[2] || 0), q[1] + (p.grab[3] || 0)], 14, 12, p.grab[1]); }
      const SA = [S[0] + (p.sx || 0), S[1] + (p.sy || 0)];      // where the arms hang from: the shoulder can ride up, back, down and forward on the trunk
      const al = p.al === undefined ? 1 : p.al, E = ad(SA, d(p.ua, 14 * al)), W = ad(E, d(p.fa, 12 * al));      // al < 1: arm pointing toward the viewer
      /* far: what the other arm does when the two arms are not doing the same thing. ['E', hint] = holds the near elbow,
         ['K' | 'K2' | 'A' | 'A2', hint] = holds that joint, ['pt', x, y, hint] = rests on a fixed spot (a table),
         ['wall', dy, hint] = holds the wall at dy below shoulder height */
      if (p.far) { const k = p.far[0], Q = k === 'pt' ? [p.far[1], p.far[2]] : k === 'wall' ? [(p.w || 0) - 3, S[1] + p.far[1]] : { E, K, A, K2, A2 }[k]; if (Q) [p.ua2, p.fa2] = ik(SA, Q, 14, 12, p.far[p.far.length - 1]); }
      const E2 = p.ua2 !== undefined ? ad(SA, d(p.ua2, 14)) : null, W2 = E2 ? ad(E2, d(p.fa2 !== undefined ? p.fa2 : p.ua2, 12)) : null;
      const hand = (e, w) => w ? w[1] + 2.2 * (w[1] - e[1]) / 12 + 2.5 : -99, c = ad(S, d(p.nk, 11.4));
      const low = Math.max(shoeLow(K, A, fa1), two ? shoeLow(K2, A2, fa2) : -99, K[1] + 4.5, two ? K2[1] + 4.5 : -99, H[1] + 7.7, S[1] + 6.4, c[1] + 6.8, E[1] + 3.2, E2 ? E2[1] + 3.2 : -99, hand(E, W), hand(E2, W2));
      return { p, H, S, SA, E, W, K, A, N, K2, A2, T, T2, E2, W2, low, seg: { tr: [H, S], nk: [S, N], ua: [S, E], fa: [E, W], th: [H, K], sh: [K, A], th2: [H, K2], sh2: [K2, A2] } }; };
    if (raw || p.top) return build(false);
    if (p.prop) return build(true);
    let g = build(false);
    p.dyG = 0; for (let k = 0; k < 6; k++) { const dy = FLOOR - g.low; if (Math.abs(dy) < .05 || Math.abs(dy) > 12) break; p.hy += dy; p.dyG += dy; g = build(k > 0); }
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
    jaw: u => ({ tilt: 0, lift: 0, turn: 0, L: 'jaw', R: 'jaw' }),      // facing you: fingertips of both hands on the jaw muscles, just in front of the ears
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
      const fixed = { jaw: [[sh[0] - sx * 2, 89], [80 + sx * 13.4, 54.6]], collar: [[sh[0] - sx * 9, 84], [80 - sx * 9.5, 68]], sit: [[sh[0] + sx * 3.5, 102], [sh[0] + sx * 1, 130]], behind: [[sh[0] + sx * 6.5, 97], [sh[0] - sx * 5, 118]] }[pose] || [rE, rH];
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
    if (ao > .02 && opt.arrow !== false && full.tilt) { const R = 49, a0 = (-90 - 13) * Math.PI / 180, a1 = (-90 + full.tilt - 9) * Math.PI / 180, P0 = [piv[0] + R * Math.cos(a0), piv[1] + R * Math.sin(a0)], P1 = [piv[0] + R * Math.cos(a1), piv[1] + R * Math.sin(a1)];
      const tg = Math.atan2(-Math.cos(a1), Math.sin(a1)), hd = k => [P1[0] + 4.2 * Math.cos(tg + k * 2.55), P1[1] + 4.2 * Math.sin(tg + k * 2.55)];
      o += `<path d="M${q(P0)}A${R} ${R} 0 0 0 ${q(P1)}M${q(hd(1))}L${q(P1)}L${q(hd(-1))}" style="stroke:${TOPd}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${ao.toFixed(2)}"/>`; }
    return o + '</g></svg>';
  }

  /* Shared garden scene for the front and close-up views. */
  const sceneFront = (V, F) => `<rect x="-200" y="-200" width="560" height="400" ${F(V('ill-bg', '#FBEDE1'))}/><circle cx="80" cy="42" r="50" ${F(V('ill-glow', '#FFF7F0'))}/><g ${F(V('ill-cloud', '#F4E6D9'))}><circle cx="24" cy="10" r="6"/><circle cx="32" cy="7" r="7.5"/><circle cx="40" cy="11" r="5.5"/><rect x="18" y="10" width="28" height="6" rx="3"/></g><ellipse cx="34" cy="97" rx="66" ry="13" ${F(V('ill-hill', '#CFDCBD'))}/><circle cx="18" cy="84" r="9" ${F(V('ill-bush', '#B4C7A3'))}/><circle cx="142" cy="84" r="10" ${F(V('ill-bush2', '#9DB58C'))}/><ellipse cx="80" cy="99" rx="110" ry="8" ${F(V('ill-ground', '#EFDCCB'))}/><rect x="-200" y="99" width="560" height="200" ${F(V('ill-ground', '#EFDCCB'))}/>`;

  /* Wrist stretches, as a close-up of the forearm and both hands (from across the room the hand is too small to read).
     Both bend the hand down at the wrist; what differs is which way the palm faces, so that is made unmistakable:
     kind 'ext'  = extensor stretch, PALM DOWN: knuckles, tendons and fingernails on top, thumb underneath, fingers curled.
     kind 'flex' = flexor stretch, PALM UP: the lighter palm with its creases on top, thumb on top, fingers straight.
     A caption says it in words too. u = 0 flat, 1 = stretch. The helping hand comes in, lands on the fingers and then
     travels with them. */
  function wristView(kind, u, opt = {}) {
    u = Math.max(0, Math.min(1, u));
    const f = n => n.toFixed(1), V = (n, d) => `var(--${n},${d})`, F = c => `style="fill:${c}"`, E = t => t * t * (3 - 2 * t), cl = t => Math.max(0, Math.min(1, t)), R = Math.PI / 180;
    const stretch = kind === 'ext' || kind === 'flex', kin = stretch ? E(cl(u / .3)) : 0, k = stretch ? E(cl((u - .22) / .78)) : E(u);          // stretches: the helping hand arrives first, then the wrist bends
    const TOP = V('fig-top', '#E8793F'), TOPd = V('fig-top2', '#CF6630'), SK = '#F1C4A2', SKd = '#E0AB8A', SKl = '#D69878', PALM = '#FADCC6', NAIL = '#FCEADD', PR = V('ill-prop', '#D8C7B6'), PR2 = V('ill-prop2', '#C4B09C'), BAND = V('ill-stem', '#7F9A70');
    /* kinds: ext / flex = stretches (hand bends down, other hand helps); curl / rcurl = wrist curls with a light weight, forearm
       supported (hand lifts); grip = squeezing a rolled towel; open = opening the fingers against a rubber band */
    const up = kind === 'flex' || kind === 'curl' || kind === 'grip' || kind === 'open', a = stretch ? 70 * k : kind === 'curl' ? 22 - 60 * k : kind === 'rcurl' ? 24 - 56 * k : 0, W = [86, 50];
    const d = (ang, l) => [Math.cos(ang * R) * l, Math.sin(ang * R) * l], ad = (p, v) => [p[0] + v[0], p[1] + v[1]], q = p => f(p[0]) + ' ' + f(p[1]);
    const curlF = stretch ? (up ? 5 : 34) * k : kind === 'grip' ? -(70 + 85 * k) : kind === 'open' ? -(95 - 88 * k) : kind === 'curl' ? -70 : 65;      // how far the fingers fold (negative = toward the palm when the palm faces up)
    const af = a + curlF, knu = ad(W, d(a, 13)), tip = ad(knu, d(af, 12)), mid = [(knu[0] + tip[0]) / 2, (knu[1] + tip[1]) / 2], topP = d(a - 90, 1), topF = d(af - 90, 1);      // top = the side that faces up when the hand is flat
    const bar = (p0, p1, w, col, cap = 'round') => `<path d="M${q(p0)}L${q(p1)}" style="stroke:${col}" stroke-width="${w}" stroke-linecap="${cap}" fill="none"/>`, off = (p, v, t) => [p[0] + v[0] * t, p[1] + v[1] * t];
    const label = { ext: 'PALM DOWN', flex: 'PALM UP', curl: 'PALM UP', rcurl: 'PALM DOWN', grip: 'SQUEEZE', open: 'OPEN' }[kind];
    let o = `<svg class="ill" viewBox="${opt.fit ? '24 8 112 84' : '0 -8 160 108'}"${opt.fit || opt.slice ? ' preserveAspectRatio="xMidYMid slice"' : ''} role="img" aria-label="${label.toLowerCase()}">`;
    if (opt.scene !== false) o += sceneFront(V, F);
    o += `<text x="80" y="17" text-anchor="middle" font-size="6.2" font-weight="700" letter-spacing=".5" font-family="system-ui,-apple-system,sans-serif" ${F(TOPd)}>${label}</text>`;
    o += `<g ${opt.mirror ? 'transform="translate(160 0) scale(-1 1)"' : ''}>`;
    if (!stretch) o += `<rect x="-20" y="59" width="${kind === 'curl' || kind === 'rcurl' ? 94 : 130}" height="5" rx="2.5" ${F(PR)}/><rect x="-20" y="64" width="${kind === 'curl' || kind === 'rcurl' ? 88 : 124}" height="3" ${F(PR2)} opacity=".5"/>`;      // forearm supported on a table edge
    // the arm: sleeve in from the left, straight and level; cuff; wrist; palm; fingers
    o += bar([-20, 50], [70, 50], 17.4, TOPd) + bar([-20, 50], [70, 50], 16, TOP) + bar([67, 50], [71.5, 50], 16, TOPd, 'butt');
    /* The hand, drawn in its own frame (x along the hand from the wrist, y across it; the side facing up is y < 0) and then
       turned at the wrist. Four separate fingers with two joints each, a two-part thumb, and the surface that faces up:
       the back of the hand (knuckles, tendons, nails) when the palm is down, the palm (pads, creases) when it is up. */
    const FING = [[-4.35, 11.2], [-1.45, 12.8], [1.45, 12], [4.35, 9.6]], c1 = curlF * .55, c2 = curlF * .45 + (stretch ? 0 : Math.sign(curlF) * 8);      // [offset across the hand, length]; index finger first
    const rr = (x, y, w, h, r, fill, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fill}" ${extra}/>`;
    const finger = ([y, len], i) => { const p1 = len * .52, p2 = len - p1 + .6, edge = `stroke="${SKd}" stroke-width=".45"`;
      const tipD = up ? (stretch ? `<path d="M${f(p2 * .42)} -1V1" stroke="${SKl}" stroke-width=".4" stroke-linecap="round" opacity=".8"/>` : '') : rr(p2 - 3.1, -1.05, 2.5, 2.1, .9, NAIL, `stroke="${SKl}" stroke-width=".35"`);
      return `<g transform="translate(0 ${y})">${rr(-1.2, -1.5, p1 + 2.2, 3, 1.5, SK, edge)}<g transform="translate(${f(p1)} 0) rotate(${f(c2)})">${rr(-1.2, -1.42, p2 + 1.2, 2.84, 1.42, SK, edge)}${tipD}</g>${up ? '' : `<path d="M-.4 -1.1Q.9 0 -.4 1.1" stroke="${SKl}" stroke-width=".45" fill="none" stroke-linecap="round"/>`}</g>`; };
    const thumbG = side => `<g transform="translate(2.6 ${side * 4.6}) rotate(${side * (stretch ? 34 : kind === 'grip' ? 62 : 44)})">${rr(-1.6, -1.9, 7.4, 3.8, 1.9, SK, `stroke="${SKd}" stroke-width=".45"`)}<g transform="translate(5 0) rotate(${side * -16})">${rr(-1, -1.6, 5.4, 3.2, 1.6, SK, `stroke="${SKd}" stroke-width=".45"`)}${up ? '' : rr(1.9, -1, 2.2, 2, .9, NAIL, `stroke="${SKl}" stroke-width=".35"`)}</g></g>`;
    const palmG = `<path d="M-2 -4.6C1 -5.6 5 -6.3 9.6 -6.2Q13.6 -6 13.8 -2.6V2.6Q13.6 6 9.6 6.2C5 6.3 1 5.6 -2 4.6Z" fill="${SK}" stroke="${SKd}" stroke-width=".5" stroke-linejoin="round"/>` +
      (up ? `<ellipse cx="4.6" cy="-2.9" rx="4.3" ry="2.5" transform="rotate(-10 4.6 -2.9)" fill="${PALM}"/><ellipse cx="5.6" cy="2.9" rx="5" ry="2.3" fill="${PALM}"/><path d="M1.6 -.4Q6.4 -1.6 12.4 .5M2.4 3.9Q7.2 1.6 12.6 3.6M8.2 -5.2Q9.6 -2.4 12.8 -2.6" stroke="${SKl}" stroke-width=".5" fill="none" stroke-linecap="round" opacity=".85"/>`
          : `<path d="M1.2 -3.4L11.6 -4.4M1 -1.1L11.8 -1.5M1 1.1L11.8 1.5M1.2 3.4L11.6 4.4" stroke="${SKl}" stroke-width=".4" stroke-linecap="round" opacity=".5"/>${FING.map(([y]) => `<ellipse cx="12.6" cy="${y}" rx="1.25" ry="1.15" fill="${SKd}" opacity=".75"/>`).join('')}`);
    const handObj = kind === 'grip' ? `<ellipse cx="13.4" cy="-6.4" rx="${f(5.2 - 1.1 * k)}" ry="${f(5.6 - 1.4 * k)}" ${F(PR)} stroke="${PR2}" stroke-width=".8"/><path d="M11.4 -8.6Q13.6 -6.2 11.6 -4" stroke="${PR2}" stroke-width=".7" fill="none"/>`
      : kind === 'curl' ? `<circle cx="9" cy="-6.8" r="6.6" ${F(PR2)}/><circle cx="9" cy="-6.8" r="3.7" ${F(PR)}/><circle cx="9" cy="-6.8" r="1.4" ${F(PR2)}/>` : kind === 'rcurl' ? `<circle cx="9" cy="6.8" r="6.6" ${F(PR2)}/><circle cx="9" cy="6.8" r="3.7" ${F(PR)}/><circle cx="9" cy="6.8" r="1.4" ${F(PR2)}/>` : '';
    o += bar([72, 50], [W[0] - 1, W[1]], 10.4, SKd) + bar([72, 50], [W[0] - 1, W[1]], 9.4, SK);
    o += `<g transform="translate(${q(W)}) rotate(${f(a)})">${up ? '' : thumbG(1)}${kind === 'rcurl' ? handObj : ''}${palmG}${kind === 'rcurl' ? '' : handObj}<g transform="translate(13 0) rotate(${f(c1)})">${FING.map(finger).join('')}</g>${up ? thumbG(-1) : ''}<path d="M-1.6 -4.2Q-.4 0 -1.6 4.2" stroke="${SKl}" stroke-width=".5" fill="none" stroke-linecap="round" opacity=".7"/></g>`;
    if (kind === 'open') { const tt = ad(ad(W, d(a, 5.5)), d(a - 90, 9.5)), m2 = [(tip[0] + tt[0]) / 2, (tip[1] + tt[1]) / 2], L2 = Math.hypot(tip[0] - tt[0], tip[1] - tt[1]);      // rubber band from the thumb to the fingertips, stretching as the hand opens
      o += `<ellipse cx="${f(m2[0])}" cy="${f(m2[1])}" rx="${f(L2 / 2 + 2.4)}" ry="2.6" transform="rotate(${f(Math.atan2(tip[1] - tt[1], tip[0] - tt[0]) / R)} ${q(m2)})" fill="none" style="stroke:${BAND}" stroke-width="1.6"/>`; }
    if (stretch) {      // helping hand: sleeve from the upper right, palm across the fingers; it waits just clear of them at the start
      const hc = off(off(mid, topF, 7.4), topF, 13 * (1 - kin)), src = [150, -2], hl = Math.hypot(src[0] - hc[0], src[1] - hc[1]), hu = [(src[0] - hc[0]) / hl, (src[1] - hc[1]) / hl], hw = ad(hc, [hu[0] * 9, hu[1] * 9]);
      o += bar(hw, src, 17.4, TOPd) + bar(hw, src, 16, TOP) + bar(hw, ad(hw, [hu[0] * 4.5, hu[1] * 4.5]), 16, TOPd, 'butt') + bar(hc, hw, 11, SKd);
      o += `<ellipse cx="${f(hc[0])}" cy="${f(hc[1])}" rx="9.4" ry="5.4" transform="rotate(${f(af)} ${q(hc)})" fill="${SKd}" stroke="${SKl}" stroke-width=".6"/>`;
      [-5.4, -1.8, 1.8, 5.4].forEach(t => { const b0 = off(ad(hc, d(af, t)), topF, -3), e = off(ad(hc, d(af, t)), topF, -3 - 6.5 * kin); o += bar(b0, e, 3.5, SKl) + bar(b0, e, 2.7, SKd); }); }
    const ao = 1 - cl(k * 2.4), dir = stretch ? 1 : -1;
    if (ao > .02 && opt.arrow !== false && kind !== 'grip' && kind !== 'open') { const a0 = dir * 16 + (stretch ? 0 : 22), a1 = dir * 60 + (stretch ? 0 : 22), c0 = ad(W, d(a0, 36)), c1 = ad(W, d(a1, 36)), tg = a1 + dir * 90, h1 = ad(c1, d(tg + 180 - 32, 4.4)), h2 = ad(c1, d(tg + 180 + 32, 4.4));
      o += `<path d="M${q(c0)}A36 36 0 0 ${dir > 0 ? 1 : 0} ${q(c1)}M${q(h1)}L${q(c1)}L${q(h2)}" style="stroke:${TOPd}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${ao.toFixed(2)}"/>`; }
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
  const HANDS = { 'wrist-ext': 'ext', 'wrist-flex': 'flex', 'wrist-curl': 'curl', 'wrist-rcurl': 'rcurl', 'hand-grip': 'grip', 'hand-open': 'open' };      // pictures drawn as a close-up of the hand
  const REST = { hx: 80, hy: 57, lean: 0, rot: 0, turn: 0, ts: 1, nod: 0, lift: 0, shr: 0, tw: 0, aL: [97, 93, 1, 1], aR: [83, 87, 1, 1], lL: [92, 90, 1, 1], lR: [88, 90, 1, 1] };
  const FCHAIR = { ...REST, hy: 68, view: 'chair', lL: [94, 90, .4, .92], lR: [86, 90, .4, .92] };      // sitting tall on a chair, facing you, feet flat
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
    rest: { a: { ...REST, aL: [96, 92, 1, 1], aR: [84, 88, 1, 1] }, b: { ...REST, shr: .07, ts: 1.012, aL: [97, 93, 1, 1], aR: [83, 87, 1, 1] } },      // between sets: stand tall and breathe; barely visible on purpose, so it can never be mistaken for a shoulder exercise
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
    /* seated on a chair, from the front. Twist: hips, knees and feet stay square while the chest turns, the head follows,
       one hand goes to the outside of the opposite knee and the other to the chair back. */
    'seated-twist': { a: { ...FCHAIR, aL: [95, 64, 1, 1.1], aR: [85, 116, 1, 1.1] }, b: { ...FCHAIR, tw: 1, turn: -.75, aL: [142, -108, 1, .8], aR: [115, 120, 1.15, 1.3] } },
    'seated-side': { a: { ...FCHAIR, aL: [95, 64, 1, 1.1], aR: [85, 116, 1, 1.1] }, b: { ...FCHAIR, lean: -14, aL: [104, 88, 1, .95], aR: [-98, -138, 1, 1] } },      // one hand holds the seat, the other arm reaches up and over
    /* doorway chest stretches, from the front: standing in the doorway, both forearms upright on the frame, elbows below
       (low) or above (high) shoulder height, then the chest eases forward through the door */
    'doorway-low': { a: { ...REST, door: 1, note: 'HANDS STAY · CHEST FORWARD', aL: [152, 270, 1, 1], aR: [28, -90, 1, 1] }, b: { ...REST, door: 1, note: 'HANDS STAY · CHEST FORWARD', ts: 1.05, aL: [158, 268, 1.06, 1.04], aR: [22, -88, 1.06, 1.04] } },
    'doorway-high': { a: { ...REST, door: 1, note: 'HANDS STAY · CHEST FORWARD', aL: [203, 270, 1, 1], aR: [-23, -90, 1, 1] }, b: { ...REST, door: 1, note: 'HANDS STAY · CHEST FORWARD', ts: 1.05, aL: [197, 268, 1.06, 1.04], aR: [-17, -88, 1.06, 1.04] } },
    /* one arm on a wall or door frame beside you, from the front: the arm stays where it is and the body turns away from it */
    'wall-chest': { a: { ...REST, post: 105, aR: [0, -90, 1, 1] }, b: { ...REST, post: 105, tw: .8, turn: -.6, aR: [0, -90, 1.285, 1] } },      // elbow bent 90°, palm and forearm on the wall at shoulder height
    biceps: { a: { ...REST, post: 117, aR: [0, 0, 1, 1] }, b: { ...REST, post: 117, tw: .8, turn: -.6, aR: [0, 0, 1.148, 1.148] } },              // arm straight, palm flat on the wall at shoulder height
    'door-er': { a: { ...REST, post: 105.5, aR: [86, 0, 1, 1] }, b: { ...REST, post: 105.5, tw: .5, turn: -.45, aR: [86, 0, 1, 1.2] } },          // elbow at the side bent 90°, forearm against the frame
    /* wall slides, seen from behind: you face the wall, forearms on it with the elbows at shoulder height, and slide them up into a Y */
    'wall-slide': { a: { ...REST, back: 1, wallBg: 1, note: 'FACING THE WALL', aL: [172, 270, .5, 1], aR: [8, -90, .5, 1] }, b: { ...REST, back: 1, wallBg: 1, note: 'FACING THE WALL', lift: .6, aL: [236, 262, .95, 1], aR: [-56, -82, .95, 1] } },
    /* figure-4 on the back, seen from above. The legs make the "4": one foot stays down with the knee bent, the other ankle
       rests across that knee with its knee out to the side. Both hands then reach to the supporting thigh and draw it in.
       The legs are drawn over the arms, so the "4" is never hidden. */
    figure4: { a: { ...REST, rot: -90, view: 'top', armsUnder: 1, note: 'ANKLE ON THE OTHER KNEE · PULL THE THIGH IN', lL: [90, 90, .75, .3], lR: [63, 188, 1, 1], aL: [100, 96, 1, 1], aR: [80, 84, 1, 1] },
      b: { ...REST, rot: -90, view: 'top', armsUnder: 1, note: 'ANKLE ON THE OTHER KNEE · PULL THE THIGH IN', lL: [90, 90, .55, .3], lR: [67, 202, 1, 1], aL: [86, 86, 1.1, 1.1], aR: [112, 112, 1.1, 1.1] } },      // limb lengths are true, so the crossed leg forms a real triangle: hip, knee out to the side, ankle on the other knee
    butterfly: { a: { ...REST, hy: 80, view: 'sit', lL: [196, 28, .9, .84], lR: [-16, 152, .9, .84], aL: [82, 66, 1, 1], aR: [98, 114, 1, 1] }, b: { ...REST, hy: 80, view: 'sit', lL: [174, 6, .95, .86], lR: [6, 174, .95, .86], aL: [82, 66, 1, 1], aR: [98, 114, 1, 1] } }
  };
  const RIG_ILL = { 'itb-cross': 'itb', 'side-raise-leg': 'side-leg', doorway: 'doorway-low', 'corner-high': 'doorway-high', 'wall-biceps': 'biceps' };
  const rigOf = (key, ex) => RIG[ex] || RIG[key] || RIG[RIG_ILL[key]] || null;
  function frontRig(spec, u, opt = {}) {
    u = Math.max(0, Math.min(1, u));
    const A = spec.a, B = spec.b, mixv = (x, y) => typeof x === 'number' && typeof y === 'number' ? x + (y - x) * u : Array.isArray(x) && Array.isArray(y) ? x.map((v, i) => typeof v === 'number' ? v + (y[i] - v) * u : v) : x, P = {}; for (const k in A) P[k] = mixv(A[k], B[k]);
    const f = n => n.toFixed(1), V = (n, d) => `var(--${n},${d})`, F = c => `style="fill:${c}"`, FM = female, R = Math.PI / 180, cl = t => Math.max(0, Math.min(1, t));
    const TOP = V('fig-top', '#E8793F'), TOPd = V('fig-top2', '#CF6630'), LEG = V('fig-leg', '#2F3439'), SK = '#F1C4A2', SKd = '#E0AB8A', HAIR = '#2E2420', PR2 = V('ill-prop2', '#C4B09C');
    const d = (a, l) => [Math.cos(a * R) * l, Math.sin(a * R) * l], ad = (p, v) => [p[0] + v[0], p[1] + v[1]], q = p => f(p[0]) + ' ' + f(p[1]), n = v => +v.toFixed(2);
    const hc = [P.hx, P.hy], up = d(-90 + P.lean, 1), pr = [-up[1], up[0]], at = (t, w) => [hc[0] + up[0] * t * P.ts + pr[0] * w, hc[1] + up[1] * t * P.ts + pr[1] * w], sc = at(23, 0), head = [at(23, 0)[0] + up[0] * 10.5 * (.55 + .45 * P.ts), at(23, 0)[1] + up[1] * 10.5 * (.55 + .45 * P.ts)];
    const lying = P.rot !== 0, view = P.view || 'stand';
    const tw = P.tw || 0, twc = 1 - .3 * tw, tws = -1.6 * tw, atT = (t, w) => at(t, t >= 11 ? w * twc + tws * Math.min(1, (t - 11) / 6) : w);      // tw: the chest turned (shoulders narrower and shifted), hips square
    const arm = (sd, a) => { const sh = ad(atT(21, sd * 9.5), [up[0] * 3 * P.shr, up[1] * 3 * P.shr]), el = ad(sh, d(a[0], 12.5 * a[2])), ha = ad(el, d(a[1], 11.5 * a[3])); return { sh, el, ha }; }, L = arm(-1, P.aL); let Rr = arm(1, P.aR);
    if (P.holdR) { const l1 = 12.5 * P.aR[2], l2 = 11.5 * P.aR[3], S0 = Rr.sh, tg = L.ha, vx = tg[0] - S0[0], vy = tg[1] - S0[1], dist = Math.max(Math.abs(l1 - l2) + .1, Math.min(l1 + l2 - .1, Math.hypot(vx, vy) || 1)), ux = vx / (Math.hypot(vx, vy) || 1), uy = vy / (Math.hypot(vx, vy) || 1);
      const aa = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), hh = Math.sqrt(Math.max(0, l1 * l1 - aa * aa)), c0 = [S0[0] + ux * aa, S0[1] + uy * aa], e1 = [c0[0] - uy * hh, c0[1] + ux * hh], e2 = [c0[0] + uy * hh, c0[1] - ux * hh], out = e => (e[0] - sc[0]) * pr[0] + (e[1] - sc[1]) * pr[1] - ((e[0] - sc[0]) * up[0] + (e[1] - sc[1]) * up[1]) * .4;
      Rr = { sh: S0, el: out(e1) > out(e2) ? e1 : e2, ha: [S0[0] + ux * dist, S0[1] + uy * dist] }; }
    const leg = (sd, a) => { const hp = at(-1, sd * 4.6), kn = ad(hp, d(a[0], 17 * a[2])), ft = ad(kn, d(a[1], 17 * a[3])); return { hp, kn, ft, sd }; }, lL = leg(-1, P.lL), lR = leg(1, P.lR);
    const SOLE = '#BFC5CC', pts = Pp => Pp.map(v => f(v[0]) + ',' + f(v[1])).join(' '), mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    // tapered limb with rounded ends, the same construction as the side-on figure, so both figures look like one person
    const limb = (a, b, wa, wb, col) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      return `<circle cx="${f(a[0])}" cy="${f(a[1])}" r="${f(wa / 2)}" ${F(col)}/><circle cx="${f(b[0])}" cy="${f(b[1])}" r="${f(wb / 2)}" ${F(col)}/><polygon points="${pts([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2], [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]])}" ${F(col)}/>`; };
    if (P.bare === 'L') L.bare = true;      // sleeve pushed up, so a forearm lying across the body stands out from it
    // arm: sleeve with a darker edge so it reads against the body, ribbed cuff, hand
    const drawArm = o => { const dx = o.ha[0] - o.el[0], dy = o.ha[1] - o.el[1], l = Math.hypot(dx, dy) || 1, hp = [o.ha[0] + dx / l * 2.1, o.ha[1] + dy / l * 2.1], ang = Math.atan2(dy, dx) / R, short = l < 3;
      const hand = `<ellipse cx="${f(hp[0])}" cy="${f(hp[1])}" rx="${short ? 2.9 : 3.1}" ry="2.6" transform="rotate(${f(ang)} ${q(hp)})" fill="${SK}" stroke="${SKd}" stroke-width=".45"/>`;
      if (o.bare) return limb(o.sh, o.el, 8, 6.9, TOPd) + limb(o.sh, o.el, 6.8, 5.7, TOP) + limb(o.el, o.ha, 5.6, 4.8, SKd) + limb(o.el, o.ha, 4.7, 4, SK) + hand;
      return hand + limb(o.sh, o.el, 8, 6.9, TOPd) + limb(o.el, o.ha, 6.9, 5.9, TOPd) + limb(o.sh, o.el, 6.8, 5.7, TOP) + limb(o.el, o.ha, 5.7, 4.8, TOP) + (short ? '' : limb(mix(o.el, o.ha, .84), o.ha, 4.9, 4.8, TOPd)); };
    // leg: thigh and shin taper, a little bare ankle, then a trainer drawn for the way the foot is seen
    const drawLeg = o => { const dx = o.ft[0] - o.kn[0], dy = o.ft[1] - o.kn[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, free = lying || view === 'sit';
      let sh = limb(o.hp, o.kn, 9.8, 7.9, LEG) + limb(o.kn, mix(o.kn, o.ft, .84), 7.9, 5.6, LEG) + limb(mix(o.kn, o.ft, .8), o.ft, 4.5, 4.2, SK);
      if (free) { const c = [o.ft[0] + ux * 2.6, o.ft[1] + uy * 2.6], a = Math.atan2(uy, ux) / R;      // lying or sitting on the floor: the sole or the top of the shoe faces you
        sh += `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="3.5" ry="5.2" transform="rotate(${f(a)} ${q(c)})" fill="#CFC7BE"/><ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="2.9" ry="4.6" transform="rotate(${f(a)} ${q(c)})" fill="#fff"/><path d="M${f(c[0] - uy * 1.6)} ${f(c[1] + ux * 1.6)}L${f(c[0] + uy * 1.6)} ${f(c[1] - ux * 1.6)}" stroke="#D8D1C9" stroke-width=".6" stroke-linecap="round"/>`; }
      else { const cx = o.ft[0] + o.sd * 1.3, cy = o.ft[1] + 1.9;      // standing or on a chair: the toe of the trainer points at you
        sh += `<path d="M${f(cx - 4.9)} ${f(cy + 2.3)}Q${f(cx - 5.3)} ${f(cy - 2.9)} ${f(cx)} ${f(cy - 3.2)}Q${f(cx + 5.3)} ${f(cy - 2.9)} ${f(cx + 4.9)} ${f(cy + 2.3)}Z" fill="#fff" stroke="#CFC7BE" stroke-width=".8" stroke-linejoin="round"/><path d="M${f(cx - 4.9)} ${f(cy + 2.3)}H${f(cx + 4.9)}" stroke="${SOLE}" stroke-width="1.4" stroke-linecap="round"/><path d="M${f(cx - 1.5)} ${f(cy - 1.4)}h3M${f(cx - 1.7)} ${f(cy - .1)}h3.4" stroke="#C9C2BA" stroke-width=".5" stroke-linecap="round"/>`; }
      return sh; };
    const box = view === 'top' || view === 'side' ? (opt.fit ? '26 26 108 72' : '24 -14 112 138') : view === 'sit' || view === 'chair' ? (opt.fit ? '40 30 80 68' : '30 12 100 88') : (opt.fit ? '34 0 92 98' : '18 -6 124 111');
    let o = `<svg class="ill" viewBox="${box}"${opt.fit || opt.slice ? ' preserveAspectRatio="xMidYMid slice"' : ''} role="img" aria-label="exercise">`;
    if (opt.scene !== false) o += view === 'top' ? `<rect x="-200" y="-200" width="560" height="400" ${F(V('ill-bg', '#FBEDE1'))}/><rect x="28" y="23.2" width="104" height="80" rx="8" fill="#000" opacity=".05"/><rect x="28" y="22" width="104" height="80" rx="8" ${F(V('ill-bg', '#FBEDE1'))}/><rect x="28" y="22" width="104" height="80" rx="8" ${F(V('ill-mat', '#F4B48D'))} opacity=".42"/><rect x="30.6" y="24.6" width="98.8" height="74.8" rx="6" fill="none" style="stroke:${V('ill-mat', '#F4B48D')}" stroke-width=".7" opacity=".7"/><rect x="56.5" y="10.6" width="47" height="8.2" rx="4.1" ${F(V('ill-glow', '#FFF7F0'))}/><text x="80" y="16.4" text-anchor="middle" font-size="4.6" font-weight="700" letter-spacing=".5" font-family="system-ui,-apple-system,sans-serif" ${F(V('fig-top2', '#CF6630'))}>SEEN FROM ABOVE</text>`
      : sceneFront(V, F) + (view === 'side' || view === 'sit' ? `<rect x="22" y="89.5" width="116" height="4" rx="2" ${F(V('ill-mat', '#F4B48D'))}/>` : '');
    o += `<g ${opt.mirror ? 'transform="translate(160 0) scale(-1 1)"' : ''}>`;
    // the lowest point of the posed figure is put on the floor (standing and sitting) or the mat (lying on the side)
    const rp = p => { const r = P.rot * R, x = p[0] - 80, y = p[1] - 60; return [80 + x * Math.cos(r) - y * Math.sin(r), 60 + x * Math.sin(r) + y * Math.cos(r)]; };
    const lows = [lL.ft, lR.ft, lL.kn, lR.kn].filter((p, i) => !(P.bench && (i === 1 || i === 3))).map((p, i) => rp(p)[1] + (lying ? 4 : i < 2 ? 4.3 : 2.6)).concat(lying ? [L.el, L.ha, Rr.el, Rr.ha].map(p => rp(p)[1] + 3) : []).concat([rp(at(0, -9))[1] + (lying ? 1 : 0), rp(at(0, 9))[1], rp(at(22, -10))[1] + (lying ? 1 : 0), rp([hc[0], hc[1] + (view === 'sit' ? 8.4 : 0)])[1]]);
    const dyv = view === 'top' ? 2 : (view === 'side' ? 92.6 : 93.7) - Math.max(...lows);
    if (view !== 'top' && opt.scene !== false) o += `<ellipse cx="${f(lying ? 80 : (lL.ft[0] + lR.ft[0]) / 2)}" cy="94.2" rx="${lying ? 40 : f(Math.max(14, Math.abs(lR.ft[0] - lL.ft[0]) / 2 + 9))}" ry="1.6" fill="#000" opacity=".08"/>`;
    if (view === 'chair') o += `<rect x="62.5" y="${f(hc[1] - 32 + dyv)}" width="35" height="36" rx="4" ${F(V('ill-prop', '#D8C7B6'))}/><rect x="59" y="${f(hc[1] + 2 + dyv)}" width="42" height="6" rx="3" ${F(V('ill-prop', '#D8C7B6'))}/><rect x="61.5" y="${f(hc[1] + 8 + dyv)}" width="4" height="${f(93.4 - hc[1] - 8 - dyv)}" rx="1" ${F(PR2)}/><rect x="94.5" y="${f(hc[1] + 8 + dyv)}" width="4" height="${f(93.4 - hc[1] - 8 - dyv)}" rx="1" ${F(PR2)}/>`;
    if (P.bench) { const tf = rp(lR.ft), ty = tf[1] + dyv + 3.4; o += `<rect x="${f(tf[0] - 13)}" y="${f(ty)}" width="26" height="${f(Math.max(2, 93.4 - ty))}" rx="2.5" ${F(V('ill-prop', '#D8C7B6'))}/>`; }
    o += `<g transform="translate(0 ${f(dyv)}) rotate(${f(P.rot)} 80 60)">`;
    // arms lifted off the floor (seen from above): their shadow separates from them as they rise
    if (P.lift > .02 && view === 'top') [L, Rr].forEach(a => { o += `<path d="M${q(a.sh)}L${q(a.el)}L${q(a.ha)}" transform="translate(${f(-2.6 * P.lift)} ${f(1.6 * P.lift)})" stroke="#000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${(.13 * P.lift).toFixed(3)}"/>`; });
    if (P.under) o += drawArm(P.under === 'R' ? Rr : L);
    const BAND = V('ill-stem', '#7F9A70');      // resistance bands are green, so they never read as part of the figure or as a stray line
    if (Array.isArray(P.band)) o += `<rect x="${f(P.band[0] - 2)}" y="14" width="4" height="79.4" rx="1.5" ${F(PR2)}/>`;      // the post or door the band is tied to
    let doorFront = '';
    if (P.wallBg) o += `<rect x="36" y="-4" width="88" height="${f(97.4 - dyv)}" rx="3" ${F(V('ill-prop', '#D8C7B6'))} opacity=".55"/>`;      // the wall you are facing
    if (P.post) o += `<rect x="${f(P.post - 2.5)}" y="-2" width="5" height="${f(96 - dyv)}" rx="1.5" ${F(PR2)}/>`;      // the wall or door frame beside you
    if (P.door) { const PRd = V('ill-prop', '#D8C7B6'), xl = Math.min(L.el[0], L.ha[0]) - 4.6, xr = Math.max(Rr.el[0], Rr.ha[0]) + 4.6, B = spec.b, fx = s => 80 + s * (9.5 + 12.5 * Math.abs(Math.cos(B[s < 0 ? 'aL' : 'aR'][0] * R))) + s * 4.6;      // door frame: two posts where the forearms end up, and the top of the frame
      const l0 = fx(-1), r0 = fx(1), post = x => `<rect x="${f(x - 3.4)}" y="3" width="6.8" height="${f(91 - dyv)}" rx="1.5" ${F(PR2)}`; o += `<rect x="${f(l0 - 5)}" y="1" width="${f(r0 - l0 + 10)}" height="5" rx="1.5" ${F(PRd)}/>` + post(l0) + ' opacity=".35"/>' + post(r0) + ' opacity=".35"/>';
      doorFront = post(l0) + ' opacity=".5"/>' + post(r0) + ' opacity=".5"/>'; }      // you face out of the doorway, so the frame is in front of your forearms: it is drawn see-through over them
    if (!P.armsUnder) o += drawLeg(lL) + (P.legTop ? '' : drawLeg(lR));
    if (P.band === 'knees') { const m = [(lL.kn[0] + lR.kn[0]) / 2, (lL.kn[1] + lR.kn[1]) / 2], dxk = lR.kn[0] - lL.kn[0], dyk = lR.kn[1] - lL.kn[1];      // a loop band round both legs, just above the knees
      o += `<ellipse cx="${f(m[0])}" cy="${f(m[1] - 2.5)}" rx="${f(Math.hypot(dxk, dyk) / 2 + 4.6)}" ry="2.7" transform="rotate(${f(Math.atan2(dyk, dxk) / R)} ${f(m[0])} ${f(m[1] - 2.5)})" fill="none" style="stroke:${BAND}" stroke-width="2"/>`; }
    if (!P.back) o += `<ellipse cx="${f(atT(24.6, 0)[0])}" cy="${f(atT(24.6, 0)[1])}" rx="${f(7.4 * twc)}" ry="3.3" transform="rotate(${f(P.lean)} ${q(atT(24.6, 0))})" ${F(TOPd)}/>`;      // hood resting behind the neck
    o += `<path d="M${q(at(-1.5, -9))} C${q(at(8, -7.4))} ${q(atT(14, -9.6))} ${q(atT(20, -9.8))} Q${q(atT(25, -9.6))} ${q(atT(24.5, -4))} L${q(atT(24.5, 4))} Q${q(atT(25, 9.6))} ${q(atT(20, 9.8))} C${q(atT(14, 9.6))} ${q(at(8, 7.4))} ${q(at(-1.5, 9))} Z" ${F(TOP)}/>${tw > .02 ? `<path d="M${q(at(22, tws - 5.6 * tw))}Q${q(at(11, -4.4 * tw))} ${q(at(0, 0))}" style="stroke:${TOPd}" stroke-width="1" stroke-linecap="round" fill="none" opacity=".6"/>` : ''}<path d="M${q(at(-1.6, -8.2))}L${q(at(-1.6, 8.2))}" style="stroke:${TOPd}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
    const scT = atT(23, 0), hdT = [head[0] + (scT[0] - sc[0]), head[1] + (scT[1] - sc[1])];
    o += `<path d="M${q(scT)}L${q([scT[0] + up[0] * 6, scT[1] + up[1] * 6])}" stroke="${SKd}" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="${f(scT[0] + pr[0] * -1.4 * tw)}" cy="${f(scT[1] + .6)}" rx="${f(5.6 * (1 - .15 * tw))}" ry="2" transform="rotate(${f(P.lean)} ${q(scT)})" ${F(TOPd)}/>`;
    if (P.shr > .02) [L, Rr].forEach(a => { o += `<circle cx="${f(a.sh[0])}" cy="${f(a.sh[1] + .6)}" r="4.1" ${F(TOP)}/>`; });      // shoulders riding up
    if (P.back) o += `<path d="M${q(at(19.5, -4.6 + 2 * P.lift))}L${q(at(12.5, -4 + 2 * P.lift))}M${q(at(19.5, 4.6 - 2 * P.lift))}L${q(at(12.5, 4 - 2 * P.lift))}" style="stroke:${TOPd}" stroke-width="1.1" stroke-linecap="round" fill="none" opacity=".7"/>`;      // shoulder blades, drawing together as the arms lift
    const dx = P.turn * 4.2, sp = 1 - Math.abs(P.turn) * .3, ex = 2.5 * sp, ndy = 1.7 * P.nod;
    if (P.back) o += `<g transform="translate(${q(hdT)}) rotate(${f(P.lean)})">${FM ? `<path d="${TAIL}" fill="${HAIR}"/>` : ''}<ellipse cx="-6.4" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="6.4" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="0" cy="0" rx="6.6" ry="7.6" fill="${SK}"/><path d="M-6.95 1C-7.7 -11.6 7.7 -11.6 6.95 1C6.6 5.4 3.6 7 0 7C-3.6 7 -6.6 5.4 -6.95 1Z" fill="${HAIR}"/></g>`;
    else o += `<g transform="translate(${q(hdT)}) rotate(${f(P.lean)})">${FM ? `<path d="${TAIL}" fill="${HAIR}"/>` : ''}<ellipse cx="${n(-6.4 - dx * .5)}" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="${n(6.4 - dx * .5)}" cy="1.2" rx="1.3" ry="1.9" fill="${SK}"/><ellipse cx="0" cy="0" rx="6.6" ry="7.6" fill="${SK}"/><path d="${CAP}" transform="translate(${n(-dx * .14)} ${n(ndy * .55)})" fill="${HAIR}"/><g transform="translate(0 ${n(ndy)})">` +
      `<path d="M${n(dx - ex - 1)} -1.9q1 -.6 2 -.1M${n(dx + ex - 1)} -2q1 -.5 2 .1" stroke="${HAIR}" stroke-width=".5" fill="none" stroke-linecap="round"/><circle cx="${n(dx - ex)}" cy=".1" r=".72" fill="#2A1E19"/><circle cx="${n(dx + ex)}" cy=".1" r=".72" fill="#2A1E19"/>` +
      `<path d="M${n(dx * 1.12)} 1.1q${n(P.turn * 1.4)} 1.1 ${n(P.turn * .4)} 1.6" stroke="${SKd}" stroke-width=".55" fill="none" stroke-linecap="round"/>${[-1, 1].map(sd => Math.abs(dx + sd * 3.9 * sp) < 5 ? `<circle cx="${n(dx + sd * 3.9 * sp)}" cy="2.7" r="1" fill="#F2A48C" opacity=".35"/>` : '').join('')}<path d="M${n(dx - 1.6)} 4.1q1.6 1.1 3.2 0" stroke="#B5745C" stroke-width=".55" fill="none" stroke-linecap="round"/></g></g>`;
    if (P.band === 1) o += `<path d="M${q(L.ha)}L${q(Rr.ha)}" style="stroke:${BAND}" stroke-width="2" stroke-linecap="round"/>`;
    if (Array.isArray(P.band)) o += `<path d="M${f(P.band[0])} ${f(Rr.ha[1])}L${q(Rr.ha)}" style="stroke:${BAND}" stroke-width="2" stroke-linecap="round"/><circle cx="${f(P.band[0])}" cy="${f(Rr.ha[1])}" r="2.2" fill="none" style="stroke:${BAND}" stroke-width="1.4"/>`;
    o += (P.under === 'L' ? '' : drawArm(L)) + (P.under === 'R' ? '' : drawArm(Rr)) + doorFront + (P.armsUnder ? drawLeg(lL) + drawLeg(lR) : '') + (P.legTop ? `<g opacity="${P.legTop}">${drawLeg(lR)}</g>` : '');
    const wt = h => `<rect x="${f(h[0] - 4.2)}" y="${f(h[1] - 1.6)}" width="8.4" height="3.2" rx="1.2" ${F(PR2)}/><rect x="${f(h[0] - 5)}" y="${f(h[1] - 2.6)}" width="2.2" height="5.2" rx=".8" ${F(V('ill-prop', '#D8C7B6'))}/><rect x="${f(h[0] + 2.8)}" y="${f(h[1] - 2.6)}" width="2.2" height="5.2" rx=".8" ${F(V('ill-prop', '#D8C7B6'))}/>`;
    if (P.wt) { if (P.wt.includes('L')) o += wt(L.ha); if (P.wt.includes('R')) o += wt(Rr.ha); }
    o += '</g></g>';
    if (P.note) { const w = P.note.length * 2.55 + 8; const ny = view === 'top' ? 108 : 96.4; o += `<rect x="${f(80 - w / 2)}" y="${ny}" width="${f(w)}" height="6.6" rx="3.3" ${F(V('ill-glow', '#FFF7F0'))}/><text x="80" y="${ny + 4.8}" text-anchor="middle" font-size="4" font-weight="700" letter-spacing=".4" font-family="system-ui,-apple-system,sans-serif" ${F(TOPd)}>${P.note}</text>`; }      // one short line for what cannot be seen from this angle
    return o + '</svg>';
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
  if (opt.front !== false && HANDS[key]) return wristView(HANDS[key], opt.u ?? 1, opt);
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
    /* The sole is on a fixed side of the foot: below it when the toes point forward. It used to be picked as "the side away
       from the knee", which has no answer when the foot lies in line with the shin (kneeling, lying face down, a leg stretched
       back), so the shoe flipped upside down and back from one frame to the next. */
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
    if (p.band) { x0 = Math.min(x0, p.band.x - 6); x1 = Math.max(x1, p.band.x + 6); y0 = Math.min(y0, p.band.y - 10); } if (p.prop === 'chair') { x0 = Math.min(x0, 32); x1 = Math.max(x1, 92); } if (p.w) { x0 = Math.min(x0, p.w - 6); x1 = Math.max(x1, p.w + 6); }
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
  /* left side: the figure and its props are mirrored about the middle of the frame, so it faces the other way and stays in view */
  const MIRX = opt.mirror ? (() => { const v = vb.split(' ').map(Number); return 2 * v[0] + v[2]; })() : 0;
  if (opt.mirror) out += `<g transform="translate(${f(MIRX)} 0) scale(-1 1)">`;
  if (p.w) out += `<rect x="${p.w - 2}" y="-8" width="4" height="101" rx="1" ${F(PR2)}/>`;
  if (floor) out += `<rect x="12" y="89.5" width="136" height="4" rx="2" ${F(V('ill-mat', '#F4B48D'))}/>`;
  const props = { chair: `<rect x="36" y="74" width="52" height="6" rx="3" ${F(PR)}/><rect x="36" y="36" width="6" height="40" rx="3" ${F(PR)}/><rect x="40" y="80" width="4" height="13" rx="1" ${F(PR2)}/><rect x="80" y="80" width="4" height="13" rx="1" ${F(PR2)}/>`,
    step: `<rect x="70" y="68" width="42" height="25" rx="3" ${F(PR)}/>`, box: `<rect x="86" y="58" width="46" height="35" rx="3" ${F(PR)}/>`, stair: `<rect x="60" y="83" width="44" height="10" rx="2" ${F(PR)}/>`,
    bed: `<rect x="14" y="54" width="78" height="39" rx="4" ${F(PR)}/><rect x="14" y="54" width="78" height="6" rx="3" ${F(V('ill-mat', '#F4B48D'))}/>`,
    bench: `<rect x="100" y="58" width="52" height="35" rx="3" ${F(PR)}/>`, benchL: `<rect x="10" y="78" width="56" height="15" rx="3" ${F(PR)}/>`, table: `<rect x="82" y="42" width="36" height="5" rx="2" ${F(PR)}/><rect x="110" y="47" width="5" height="46" rx="1" ${F(PR2)}/>` };
  if (p.prop && props[p.prop]) out += props[p.prop];
  (p.ln || []).forEach(l => out += `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" style="stroke:${PR2}" stroke-width="5" stroke-linecap="round"/>`);
  const BD = p.band ? { ...p.band, y: p.band.y + (p.band.hook ? 0 : (p.dyG || 0)) } : null, BAND = V('ill-stem', '#7F9A70');
  if (BD) out += BD.hook ? `<rect x="${f(BD.x - 9)}" y="${f(BD.y - 4)}" width="18" height="3.4" rx="1.7" ${F(PR2)}/><rect x="${f(BD.x - 1.2)}" y="${f(BD.y - 1)}" width="2.4" height="3" ${F(PR2)}/>`
    : BD.peg ? `<rect x="${f(BD.x - 2)}" y="${f(BD.y - 5)}" width="4" height="${f(93.4 - BD.y + 5)}" rx="1.5" ${F(PR2)}/>` : `<rect x="${f(BD.x - 2)}" y="${f(BD.y - 9)}" width="4" height="${f(93.4 - BD.y + 9)}" rx="1.5" ${F(PR2)}/>`;
  if (p.ball) out += `<circle cx="${p.ball[0]}" cy="${p.ball[1]}" r="6" ${F(PR2)}/>`;
  if (p.roll) { const rx = g.H[0] + (g.S[0] - g.H[0]) * p.roll, ry = 93.7 - 5.2; out += `<circle cx="${f(rx)}" cy="${f(ry)}" r="5.2" ${F(PR)}/><circle cx="${f(rx)}" cy="${f(ry)}" r="2" ${F(PR2)}/>`; }
  // soft contact shadow under the body
  if (opt.scene !== false && !p.prop && !p.top) { const lo = body.filter(q => q[1] > 80).map(q => q[0]), a = lo.length ? Math.min(...lo) : g.H[0] - 8, b = lo.length ? Math.max(...lo) : g.H[0] + 8; out += `<ellipse cx="${f((a + b) / 2)}" cy="${floor ? 94.4 : 94.6}" rx="${f(Math.max(9, (b - a) / 2 + 3))}" ry="1.5" fill="#000" opacity=".09"/>`; }
  // back to front: far arm, far leg, neck, torso with hood, near leg, head, near arm
  const E2 = g.E2 || g.E, W2 = g.W2 || g.W;
  out += arm(g.SA, E2, W2, TOPd, TOPd, true);
  if (g.K2) out += leg(g.H, g.K2, g.A2, g.T2, LEGd, true);
  out += limb(g.S, c, 5, 4.6, SKd);
  out += limb(g.H, mix(g.H, g.K, .3), 15.4, 12.2, LEG);
  out += torso(g.H, g.S);
  out += leg(g.H, g.K, g.A, g.T, LEG);
  // head in its own frame: up = from neck to crown, forward = the way the face looks
  if (p.armBack) out += arm(g.SA, g.E, g.W, TOP, TOPd);      // hands clasped behind the head: the forearm passes behind it, the face stays clear
  // hd turns the head on the neck (a nod), separately from where the neck carries it: a chin tuck slides the head back while the face stays level
  out += `<g transform="translate(${f(c[0])} ${f(c[1])}) rotate(${f(p.nk + 90 + (p.hd || 0))}) scale(1.1)">`;
  if (FM) out += `<path d="M-2.6 -6C-5.8 -8.6 -10.8 -7.4 -11.4 -2.8C-11.8 .6 -11 3.6 -9.5 6.2C-9.4 3.4 -8.4 .8 -5 -1.2Z" fill="${HAIR}"/>`;
  out += `<ellipse cx="0" cy="0" rx="5.6" ry="6.2" fill="${SK}"/><path d="M5.3 -.9Q6.8 .7 5.3 1.7Z" fill="${SK}"/>`;
  out += FM ? `<path d="M4.4 -3.8C3.4 -7.6 -4.2 -8 -5.7 -2.8C-6.3 -.2 -5.8 2.4 -4.5 4.1C-3.4 4 -2.7 3.5 -2.6 2.6C-2.5 .8 -1.8 -.9 -.4 -2C1 -3 2.8 -3.2 4.4 -3.8Z" fill="${HAIR}"/>`
    : `<path d="M4.3 -4.2C3.4 -7.6 -4.4 -7.9 -5.7 -2.6C-6 -.8 -5.7 1.2 -5 2.4L-3.3 2.3C-3.3 .7 -2.9 -.9 -1.9 -2C-.6 -3.1 2.1 -3.4 4.3 -4.2Z" fill="${HAIR}"/>`;
  const ex = FM ? -1.6 : -2.4;   // ear sits on the hairline, skin coloured with one soft inner curve
  out += `<ellipse cx="${ex}" cy="1.1" rx="1.15" ry="1.55" fill="${SK}"/><path d="M${ex + .35} .4Q${ex - .45} 1.1 ${ex + .25} 1.9" stroke="#D69878" stroke-width=".35" fill="none" stroke-linecap="round"/><path d="M2.7 -2.3Q3.4 -2.7 4.1 -2.35" stroke="${HAIR}" stroke-width=".45" fill="none" stroke-linecap="round"/><circle cx="3.4" cy="-.6" r=".6" fill="#2A1E19"/><circle cx="4.2" cy="1.5" r=".85" fill="#F2A48C" opacity=".35"/><path d="M2.9 3Q3.8 3.6 4.7 2.9" stroke="#B5745C" stroke-width=".55" fill="none" stroke-linecap="round"/></g>`;
  if (!p.armBack) out += arm(g.SA, g.E, g.W, TOP, TOPd);
  if (p.armBack && p.ghost) out += `<g opacity="${p.ghost}">${arm(g.SA, g.E, g.W, TOP, TOPd)}</g>`;      // the same arm again over the head, see-through: you see the hand and arm and still see the face
  if (BD) { const J = { W: g.W, K: g.K, A: g.A, T: g.T }[BD.at] || g.W, an = [BD.x, BD.y + (BD.hook ? 2 : 0)], mx = (an[0] + J[0]) / 2, my = (an[1] + J[1]) / 2, lab = BD.label || 'BAND', lw = lab.length * 2.75 + 6;
    out += `<path d="M${f(an[0])} ${f(an[1])}L${f(J[0])} ${f(J[1])}" style="stroke:${BAND}" stroke-width="2.1" stroke-linecap="round"/><circle cx="${f(an[0])}" cy="${f(an[1])}" r="2.3" style="fill:${V('ill-glow', '#FFF7F0')};stroke:${BAND}" stroke-width="1.5"/>`;
    out += BD.at === 'W' ? `<circle cx="${f(J[0])}" cy="${f(J[1])}" r="1.9" style="fill:${BAND}"/>` : `<circle cx="${f(J[0])}" cy="${f(J[1])}" r="${BD.r || 4.6}" fill="none" style="stroke:${BAND}" stroke-width="2"/>`;      // gripped in the hand, or looped round the limb
    const ly = Math.max(-2, Math.min(my - 6.5, 84)); out += `<rect x="${f(mx - lw / 2)}" y="${f(ly - 4.3)}" width="${f(lw)}" height="6.4" rx="3.2" style="fill:${V('ill-glow', '#FFF7F0')};stroke:${BAND}" stroke-width=".6"/><text x="${f(mx)}" y="${f(ly + .5)}"${opt.mirror ? ` transform="translate(${f(2 * mx)} 0) scale(-1 1)"` : ''} text-anchor="middle" font-size="4" font-weight="700" letter-spacing=".4" font-family="system-ui,-apple-system,sans-serif" style="fill:${BAND}">${lab}</text>`; }
  if (p.strap) out += `<path d="M${f(g.W[0])} ${f(g.W[1])}L${f(g.T[0])} ${f(g.T[1])}" style="stroke:${V('ill-stem', '#7F9A70')}" stroke-width="1.6" stroke-linecap="round"/>`;
  if (p.rollCue) { const cx = g.S[0] - 7, cy = g.S[1] - 1, R2 = 8.4, pt = a => [cx + R2 * Math.cos(a * R), cy + R2 * Math.sin(a * R)], a0 = pt(-112), a1 = pt(-218), tg = (-218 - 90) * R, hd = k => [a1[0] - 3.9 * Math.cos(tg + k * .62), a1[1] - 3.9 * Math.sin(tg + k * .62)];      // round arrow behind the shoulder: up, back and down, clear of the face
    out += `<path d="M${f(a0[0])} ${f(a0[1])}A${R2} ${R2} 0 0 0 ${f(a1[0])} ${f(a1[1])}M${f(hd(1)[0])} ${f(hd(1)[1])}L${f(a1[0])} ${f(a1[1])}L${f(hd(-1)[0])} ${f(hd(-1)[1])}" style="stroke:${TOPd}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".9"/>`; }
  if (p.wt) out += `<rect x="${f(g.W[0] - 5)}" y="${f(g.W[1])}" width="10" height="8" rx="2" ${F(PR2)}/>`;
  out += opt.mirror ? '</g>' : '';
  if (p.note && (opt.vb || !opt.fit)) { const v = vb.split(' ').map(Number), fs = Math.min(4.2, v[2] / (p.note.length * .66)), w = p.note.length * fs * .62 + fs * 2, cx = v[0] + v[2] / 2, y = v[1] + v[3] - fs * 2.4;      // one short line for what cannot be seen from this angle (not on small thumbnails)
    out += `<rect x="${f(cx - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(fs * 1.7)}" rx="${f(fs * .85)}" ${F(V('ill-glow', '#FFF7F0'))}/><text x="${f(cx)}" y="${f(y + fs * 1.22)}" text-anchor="middle" font-size="${f(fs)}" font-weight="700" letter-spacing=".3" font-family="system-ui,-apple-system,sans-serif" ${F(TOPd)}>${p.note}</text>`; }
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
    'shoulder-roll': { roll: true, a: {}, b: {}, tempo: [2.5, 0, 0, 0] },      // one backward circle of the shoulders every two and a half seconds
    'wrist-curl': { rig: true, a: {}, b: {} }, 'reverse-wrist': { rig: true, a: {}, b: {} }, grip: { rig: true, a: {}, b: {} }, 'finger-ext': { rig: true, a: {}, b: {} },
    'lateral-raise': { rig: true, a: {}, b: {}, tempo: [1.5, 0.5, 2.5, 0.5] }, 'pull-apart': { rig: true, a: {}, b: {}, tempo: [1.5, 1, 2, 0.5] }, 'band-er': { rig: true, a: {}, b: {}, tempo: [1.5, 0.5, 2.5, 0.5] }, 'band-ir': { rig: true, a: {}, b: {}, tempo: [1.5, 0.5, 2.5, 0.5] }, monster: { rig: true, a: {}, b: {}, tempo: [0.9, 0.2, 0.9, 0.2] },
    'wu-march': { ill: 'stand', a: { th2: 90, sh2: 90 }, b: { th2: -5, sh2: 90 }, tempo: [0.45, 0.05, 0.45, 0], alt: true, armSwing: true },
    walk: { ill: 'walk', a: {}, b: { th: 118, sh: 130, th2: 62, sh2: 72, ua: 62, fa: 12, ua2: 112, fa2: 92 }, tempo: [0.6, 0, 0.6, 0] },
    'chin-tuck': { ill: 'chintuck', a: { nk: -75, hd: -15 }, b: { nk: -97, hd: 13 }, tempo: [1.5, 2, 1.5, .5] },      // from head-forward to head-back: the head glides straight back and the chin tucks, it never tips backward
    'neck-ext': { ill: 'neck-ext', a: { nk: -84 }, b: {}, tempo: [2, 2, 2, .5] },
    'wu-swing': { ill: 'stand', a: { ua: 126, fa: 132 }, b: { ua: -84, fa: -88 }, tempo: [1, 0, 1, 0] },      // from a little behind the body, forward and up to overhead: never past what a shoulder can do
    'wu-hip': { ill: 'stand', a: {}, b: {}, circle: true, flipAt: 5, tempo: [3.2, 0, 0, 0] },      // five circles one way, then the other way
    'wu-cat': { ill: 'allfours', a: { nk: -46, curl: 4.5 }, b: { nk: 26, curl: -7 }, tempo: [2.4, 0.4, 2.4, 0.4] },      // cow: back sags, head up; cat: back rounds up, head drops
    'cat-cow': { a: { nk: -46, curl: 4.5 }, b: { nk: 26, curl: -7 }, tempo: [2.4, 0.4, 2.4, 0.4] },
    pendulum: { a: { ua: 76, fa: 74 }, b: { ua: 104, fa: 106 }, tempo: [1.1, 0, 1.1, 0] },      // a small, relaxed swing of the hanging arm
    'arm-circles': { spin: true, small: true, tempo: [2.4, 0, 0, 0] },      // arms out to the sides (toward you), circles growing from small to large
    'leg-swing': { a: { th2: 128, sh2: 140 }, b: { th2: 22, sh2: 30 }, tempo: [0.9, 0, 0.9, 0] },
    'knee-wall': { a: { th2: 104 }, b: { th2: 121 }, pin: ['knee2', 'foot'], tempo: [2, 1, 2, 0] },      // back knee stays on the floor, the hips glide forward, the front knee travels over the toes
    'open-book': { book: true, a: {}, b: {}, tempo: [3, 1, 3, 0] },
    'supine-chin': { a: { nk: 180, hd: 0 }, b: { nk: 180, hd: 11 } }, 'chin-lift': { a: { nk: 180, hd: 11 }, b: { nk: 189, hd: 14 } },      // lying head-left: the nod (hd) brings the chin toward the chest with the head still on the mat; the lift then raises it a little 'prone-neck': { a: { nk: 8 }, b: { nk: -22 } },
    'band-row': { a: { ua: 15, fa: 5 }, b: { ua: 150, fa: 10 } }, 'face-pull': { a: { ua: 5, fa: 0 }, b: { ua: -20, fa: -115 } },
    'prone-Y': { a: { ua: 6, fa: 6 }, b: { ua: -28, fa: -28 } }, 'wall-slide': { rig: true, a: {}, b: {}, tempo: [2, 0.5, 2.5, 0.5] },
    pulldown: { a: { ua: -80, fa: -85 }, b: { ua: 55, fa: -65 } }, press: { a: { ua: 35, fa: -80 }, b: { ua: -85, fa: -88 } },
    pushup: { a: {}, b: { hx: 75.2, hy: 83.6, tr: -10, nk: -12, ua: 150 }, pin: ['foot', 'hand'] },
    'hammer-curl': { a: { fa: 85 }, b: { fa: -55 } }, pushdown: { a: { fa: -25 }, b: { fa: 88 } },
    deadbug: { a: { ua: -90, fa: -90, ua2: -90, fa2: -90, th2: -90, sh2: 0 }, b: { ua: -172, fa: -172, ua2: -90, fa2: -90, th2: -8, sh2: -8 }, swap: true, tempo: [2.5, 0.5, 2.5, 0.5] },      // the other side uses the other arm and leg, same view
    'curl-up': { a: { tr: 180, nk: 180 }, b: { tr: 192, nk: 205 } },
    birddog: { a: { ua: 90, fa: 90, ua2: 90, fa2: 90, th2: 90, sh2: 180 }, b: { ua: -6, fa: -6, ua2: 90, fa2: 90, th2: 178, sh2: 178 }, tuck: 42, swap: true, tempo: [2, 2, 2, 0.5] },      // reach, hold, sweep back; the supporting hand never leaves the floor
    pallof: { a: { ua: 55, fa: -45 }, b: { ua: 0, fa: 0 } },
    superman: { a: { tr: -3, nk: -4, ua: 4, fa: 4, th: 180, sh: 180 }, b: { th: 188, sh: 188 } },
    rdl: { a: { hx: 52, tr: -88, nk: -88, th: 90, sh: 90 }, b: { hx: 45, tr: -12, nk: -18, th: 84, sh: 96 }, pin: ['foot'] },
    bridge: { a: { hx: 97, hy: 86, tr: 176, nk: 180 }, b: {}, pin: ['foot'], pinFrom: 'b' },
    'sl-bridge': { a: { hx: 97, hy: 86, tr: 176, nk: 180, th2: -80, sh2: -30 }, b: {}, pin: ['foot'], pinFrom: 'b' },
    'hip-thrust': { a: { hx: 88.2, hy: 86, tr: 210, nk: 200 }, b: {}, pin: ['foot'], pinFrom: 'b' },
    clam: { rig: true, a: {}, b: {}, tempo: [1.5, 1, 2, 0.5] }, 'side-leg': { rig: true, a: {}, b: {}, tempo: [1.5, 0.5, 2.5, 0.5] },
    march: { a: { th2: 90, sh2: 90 }, b: { th2: -10, sh2: 90 } },
    'split-squat': { a: { ...SQ, hy: 56 }, b: { ...SQ, hy: 70 }, pin: ['foot', 'foot2'] },
    'sit-stand': { ill: 'squat', a: { hx: 62, hy: 53, tr: -88, nk: -88, ua: 90, fa: 90, th: 90, sh: 90 }, b: { hx: 46, hy: 70, tr: -58, nk: -62, ua: 10, fa: 5, th: 20, sh: 110 }, pin: ['foot'] , tempo: [3, 0.5, 1.5, 0.5] },      // sit back down over three seconds, stand up briskly
    'step-up': { a: { hx: 56, hy: 53, th: 90, sh: 90, th2: 30, sh2: 90 }, b: { hx: 72, hy: 44, th: 92, sh: 92, th2: 88, sh2: 90 }, pin: ['foot2'] },
    'ham-curl': { a: { sh: 180 }, b: { sh: 255 } },
    tke: { a: { hy: 54.8, hx: 71.6, th: 74 }, b: {}, pin: ['foot'], pinFrom: 'b', tempo: [1.5, 1, 1.5, 0.5] },      // knee slightly bent against the band, then pressed fully straight and held
    nordic: { a: { hx: 60, hy: 67, tr: -90, nk: -90, th: 90, sh: 180, ua: 70, fa: 10 }, b: {}, tempo: [4, 0, 2, 1] },
    'calf-raise': { ill: 'stand', a: { hy: 53, ft: 0 }, b: { hy: 47.4, ft: 40 }, tempo: [1.5, 0.5, 3, 0.5] },      // rise, pause, lower over three seconds, as the instruction says
    'seated-calf': { a: { ft: 0 }, b: { th: -10, sh: 88, ft: 24 } }, 'toe-raise': { a: { ft: 0 }, b: { ft: -32 } }
  };
  const DEF = { hx: 70, hy: 53, tr: -90, nk: -90, ua: 90, fa: 90, th: 90, sh: 90 }, RD = Math.PI / 180;
  function ik(P, Q, l1, l2, hint) {   // two-bone IK: angles (degrees) of both segments so that the chain from P ends at Q
    const dx = Q[0] - P[0], dy = Q[1] - P[1], d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, Math.hypot(dx, dy))), base = Math.atan2(dy, dx);
    const al = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)), diff = a => Math.abs(((a - hint * RD + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
    const a1 = diff(base + al) < diff(base - al) ? base + al : base - al, J = [P[0] + Math.cos(a1) * l1, P[1] + Math.sin(a1) * l1];
    return [a1 / RD, Math.atan2(Q[1] - J[1], Q[0] - J[0]) / RD];
  }
  function animPose(key, mv, u, cycle = 0, phase = 0, other = false) {
    const base = T[mv.ill || key] || T.stand, A = { ...DEF, ...base, ...(mv.a || {}) }, B = { ...DEF, ...base, ...(mv.b || {}) };
    for (const X of [A, B]) { const Y = X === A ? B : A; if (X.ft === undefined && Y.ft !== undefined) X.ft = X.sh - 90; }
    const P = { ...A }; for (const k in B) if (typeof B[k] === 'number' && typeof A[k] === 'number') P[k] = A[k] + (B[k] - A[k]) * u;
    if (mv.tuck) P.fa = P.ua - mv.tuck * Math.sin(Math.PI * u);      // the elbow bends on the way, so the reaching hand clears the floor instead of sweeping through it
    if (mv.roll) { const a = 2 * Math.PI * phase; P.sx = -3 * Math.sin(a); P.sy = -1 - 2.7 * Math.cos(a); P.ua = 92 + 3 * Math.sin(a); P.fa = 88 + 4 * Math.sin(a); }      // up, then back, then down, then forward: a backward roll for a figure facing right
    if (mv.spin) { P.ua = P.fa = -90 + 360 * phase; if (mv.small) P.al = Math.min(.62, .2 + .045 * (cycle + phase)); }
    /* open book, seen from above: the top arm lifts off the bottom one, points at the ceiling (toward the viewer, so it
       shortens to nothing) and opens down behind the back, while the head turns after it. Knees and bottom arm stay put. */
    if (mv.book) { const c = Math.cos(u * 165 * RD); P.al = Math.max(.03, Math.abs(c)); P.ua = P.fa = c >= 0 ? -90 : 90; P.nk = 180 - 16 * u; }
    /* hip circles: the pelvis traces an ellipse (forward, side, back, side), the trunk counter-tilts so the head stays
       over the feet, both feet stay planted, hands rest on the hips. One continuous loop per cycle. */
    if (mv.circle) { const back = mv.flipAt && cycle >= mv.flipAt; if (back) phase = (1 - phase) % 1; P._phase = phase; const a = 2 * Math.PI * phase, c = Math.cos(a), sn = Math.sin(a);
      P.hx = 70 + 5 * c; P.hy = 54 + 1.3 * sn; P.tr = -90 - 9 * c; P.nk = -90 - 4 * c;
      [P.th, P.sh] = ik([P.hx, P.hy], [71, 89.5], 19, 18, 80); [P.th2, P.sh2] = ik([P.hx, P.hy], [68.5, 89.5], 19, 18, 80); P.ft = 0;
      const S = [P.hx + Math.cos(P.tr * RD) * 28, P.hy + Math.sin(P.tr * RD) * 28];
      [P.ua, P.fa] = ik(S, [P.hx + 4.5, P.hy - 4], 14, 12, 125); [P.ua2, P.fa2] = ik(S, [P.hx - 3.5, P.hy - 4], 14, 12, 135); }
    /* forearms sliding up a wall: the feet stay put and the body leans in from the ankles exactly as far as it takes to keep
       the forearms on the wall, so the hands never drift off it */
    if (mv.wall) { const g0 = geo(A, true), ax = g0.A[0], ay = g0.A[1], wallX = (base.w || 88) - 3.2; let best = 0, err = 1e9;
      for (let dl = 0; dl <= 30; dl += .25) { const wx = ax + 37 * Math.sin(dl * RD) + 28 * Math.cos((-90 + dl) * RD) + 14 * Math.cos(P.ua * RD) + 12 * Math.cos(P.fa * RD), e = Math.abs(wx - wallX); if (e < err) { err = e; best = dl; } }
      P.hx = ax + 37 * Math.sin(best * RD); P.hy = ay - 37 * Math.cos(best * RD); P.tr = P.nk = -90 + best; P.th = P.sh = 90 + best; P.ft = 0; }
    if (mv.pin) { const g0 = geo(mv.pinFrom === 'b' ? B : A, true);
      // a kneeling knee stays where it is: the thigh pivots on it and carries the hips
      if (mv.pin.includes('knee2') && g0.K2) { P.hx = g0.K2[0] - Math.cos(P.th2 * RD) * 19; P.hy = g0.K2[1] - Math.sin(P.th2 * RD) * 19; }
      const H = [P.hx, P.hy], S = [H[0] + Math.cos(P.tr * RD) * 28, H[1] + Math.sin(P.tr * RD) * 28];
      // a planted foot keeps the angle it was planted at: it never tips into the floor as the shin leans over it
      const X = g0.p, flat = a => Math.abs(((a % 360) + 540) % 360 - 180) < 25;
      if (mv.pin.includes('foot')) { [P.th, P.sh] = ik(H, g0.A, 19, 18, P.th); const a = X.ft !== undefined ? X.ft : X.sh - 90; if (flat(a)) P.ft = a; }
      if (mv.pin.includes('foot2') && g0.A2) { [P.th2, P.sh2] = ik(H, g0.A2, 19, 18, P.th2); const a = X.ft2 !== undefined ? X.ft2 : X.sh2 - 90; if (flat(a)) P.ft2 = a; }
      if (mv.pin.includes('hand')) [P.ua, P.fa] = ik(S, g0.W, 14, 12, P.ua); }
    P.mat = onFloor(A) || onFloor(B);
    // alternating moves change legs only when both feet are down (pose A), so nothing jumps between steps
    if (mv.alt && cycle % 2) { [P.th, P.th2] = [P.th2, P.th]; [P.sh, P.sh2] = [P.sh2, P.sh]; if (!mv.armSwing && P.ua2 !== undefined) { [P.ua, P.ua2] = [P.ua2, P.ua]; [P.fa, P.fa2] = [P.fa2, P.fa]; } }
    // arms swing continuously, opposite to the lifting leg: a sine over the whole two-step cycle, no reset
    // the other side of a move that uses one arm and the opposite leg: the same view, with the other arm and the other leg doing the work
    if (other && mv.swap) for (const [a, b] of [['ua', 'ua2'], ['fa', 'fa2'], ['th', 'th2'], ['sh', 'sh2'], ['ft', 'ft2']]) { const t = P[a]; P[a] = P[b]; P[b] = t; if (P[a] === undefined) delete P[a]; if (P[b] === undefined) delete P[b]; }
    if (mv.armSwing) { const w = Math.sin(Math.PI * (cycle + phase)); P.ua = 85 - 32 * w; P.fa = P.ua - 15 - 35 * Math.max(0, w); P.ua2 = 85 + 32 * w; P.fa2 = P.ua2 - 15 - 35 * Math.max(0, -w); }
    return P;
  }
  /* One steady frame for a whole exercise in the player: the box that holds the figure through the entire movement, at the
     stage's own shape. Nothing is cropped (floor work is wide, standing work is tall) and the camera never jumps. */
  const isFront = (key, ex) => !!rigOf(key, ex) || !!FRONT[key] || !!HANDS[key] || key === 'side-bend' || key === 'side-lunge' || key === 'hipcircle' || ex === 'side-bend' || ex === 'wu-hip';
  function frame(key, mv, ratio, ex) {
    if (isFront(key, ex)) return null;
    const poses = mv ? [0, .25, .5, .75, 1].flatMap(u => [0, 1].map(c => animPose(key, mv, u, c, u))) : [T[key] || T.stand];
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, zoom = false, hipY = 0;
    for (const o of poses) { const g = geo({ ...o }), p = g.p, c = [g.S[0] + Math.cos(p.nk * RD) * 11.4, g.S[1] + Math.sin(p.nk * RD) * 11.4];
      if (p.zoom) { zoom = true; hipY = Math.max(hipY, g.H[1]); }      // small neck and head movements: frame the upper body only, so they can be seen
      for (const q of (p.zoom ? [g.H, g.S, g.E, g.W, g.E2, g.W2, [g.S[0] - 16, g.S[1]], [g.S[0] + 16, g.S[1]], [c[0] - 9, c[1]], [c[0] + 9, c[1]], [c[0], c[1] - 9]] : [g.H, g.S, g.E, g.W, g.K, g.A, g.T, g.K2, g.A2, g.T2, g.E2, g.W2, [c[0] - 9, c[1]], [c[0] + 9, c[1]], [c[0], c[1] - 9]])) if (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); }
      if (p.prop === 'chair') { x0 = Math.min(x0, 34); x1 = Math.max(x1, 90); } else if (p.prop) { x0 = Math.min(x0, p.hx - 34); x1 = Math.max(x1, p.hx + 34); }
      if (p.w) { x0 = Math.min(x0, p.w - 4); x1 = Math.max(x1, p.w + 4); } if (p.prop === 'table') x1 = Math.max(x1, 120);
      if (p.top) { x0 = Math.min(x0, 46); x1 = Math.max(x1, 128); y0 = Math.min(y0, 26); } if (p.band) { x0 = Math.min(x0, p.band.x - 4); x1 = Math.max(x1, p.band.x + 4); y0 = Math.min(y0, p.band.y - 2); } }
    x0 -= 11; x1 += 11; y0 -= 8; const y1 = zoom ? hipY + 9 : 100; let w = x1 - x0, h = Math.max(zoom ? 40 : 62, y1 - y0); y0 = y1 - h;
    if (w / h < ratio) { const nw = h * ratio; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / ratio; y0 -= (nh - h) * .72; h = nh; }
    return [x0, y0, w, h].map(v => v.toFixed(1)).join(' ');
  }
  return { FRONT, T, geo, svg, MOVES, animPose, setFemale, frame, isFront };
})();

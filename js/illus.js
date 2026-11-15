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
    'neck-ext': { nk: -25, ua: -20, fa: -150, hl: 'nk' },
    'iso-neck': { nk: -90, ua: -110, fa: -150, hl: 'nk' },
    sphinx: { ...PR, tr: -25, nk: -30, ua: 90, hl: 'tr' },
    'side-bend': { tr: -72, ua: -60, fa: -60, hl: 'tr' },
    allfours: { ...AF, hl: 'tr' },
    'knees-chest': { ...LY, th: -100, sh: 60, ua: -35, fa: -35, hl: 'tr' },
    'supine-twist': { ...LY, hy: 84, th: -60, sh: 60, ua: 10, fa: 10, hl: 'tr' },
    'seated-twist': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, ua: 160, fa: 40, prop: 'chair', hl: 'tr' },
    'seated-side': { hx: 60, hy: 72, tr: -60, nk: -60, th: 0, sh: 90, ua: -60, fa: -60, prop: 'chair', hl: 'tr' },
    'half-kneel': { hy: 66, th: 0, sh: 90, th2: 100, sh2: 180, hl: 'th2' },
    thomas: { hx: 85, hy: 52, tr: 180, nk: 180, ua: 0, fa: 0, th: -105, sh: 30, th2: 85, sh2: 90, prop: 'bed', hl: 'th2' },
    couch: { hy: 66, th: 0, sh: 90, th2: 100, sh2: 175, w: 66, hl: 'th2 sh2' },
    'quad-stand': { th2: 95, sh2: -110, hl: 'th2' },
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
    'wall-calf': { hx: 62, hy: 58, tr: -65, ua: 10, fa: 10, th: 60, sh: 95, th2: 115, sh2: 115, w: 100, hl: 'sh2' },
    'wall-calf-bent': { hx: 62, hy: 58, tr: -65, ua: 10, fa: 10, th: 60, sh: 95, th2: 100, sh2: 120, w: 100, hl: 'sh2' },
    'heel-drop': { hy: 40, ft: 30, prop: 'stair', hl: 'sh' },
    'knee-wall': { hx: 70, hy: 66, th: 10, sh: 70, th2: 100, sh2: 180, w: 104, hl: 'sh' },
    'kneel-shin': { hx: 48, hy: 76, th: 40, sh: 180, hl: 'sh' },
    'toe-wall': { ft: -40, w: 85, hl: 'sh' },
    'peroneal': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, th2: -15, sh2: 130, prop: 'chair', hl: 'sh2' },
    'foam-roll': { ...LY, tr: 170, th: -65, sh: 55, hl: 'tr' },
    'open-book': { ...LY, hy: 86, th: -30, sh: 120, ua: -80, fa: -80, hl: 'tr' },
    'thread': { ...AF, ua: 180, fa: 180, hl: 'tr' },
    hug: { ua: 20, fa: 170, hl: 'tr' },
    'wall-lat': { hx: 40, tr: -5, nk: -5, ua: 0, fa: 0, w: 96, hl: 'tr' },
    'downdog': { hx: 70, hy: 40, tr: 150, nk: 150, ua: 160, fa: 160, th: 75, sh: 85, hl: 'sh' },
    'wgs': { hx: 55, hy: 70, tr: -40, nk: -40, ua: 60, fa: 60, th: 40, sh: 120, th2: 160, sh2: 160, hl: 'th2' },
    'leg-swing': { th2: 20, sh2: 20, ua: -170, fa: -170, hl: 'th2' },
    'arm-circle': { ua: -60, fa: -60, hl: 'ua' },
    'wrist-flex': { ua: 0, fa: 0, hl: 'fa' },
    'wrist-ext': { ua: 0, fa: 0, hl: 'fa' },
    'jaw': { nk: -85, ua: -100, fa: -170, hl: 'nk' },
    'deep-squat': { hx: 50, hy: 70, tr: -70, nk: -75, ua: 0, fa: 0, th: 20, sh: 125, hl: 'th' },
    'wall-angel': { ua: -120, fa: -120, w: 57, hl: 'ua' },
    pendulum: { hx: 50, tr: -30, nk: -30, prop: 'table', hl: 'ua' },
    'band-row': { ua: 150, fa: 10, hl: 'ua' },
    'face-pull': { ua: 0, fa: 160, hl: 'ua' },
    'prone-T': { ...PR, ua: -90, fa: -90, hl: 'ua' },
    'prone-Y': { ...PR, ua: -30, fa: -30, hl: 'ua' },
    'prone-W': { ...PR, ua: -90, fa: -10, hl: 'fa' },
    'wall-slide': { hx: 62, tr: -75, ua: -10, fa: -80, w: 88, hl: 'ua' },
    'scap-pushup': { hx: 74, hy: 75, tr: -24, nk: -25, ua: 90, fa: 90, th: 156, sh: 156, hl: 'ua' },
    deadbug: { ...LY, ua: -90, fa: -90, th: -90, sh: 0, th2: -10, sh2: -10, hl: 'tr' },
    plank: { hy: 82, tr: -12, nk: -20, ua: 90, fa: 0, th: 168, sh: 168, hl: 'tr' },
    'side-plank': { hy: 82, tr: -12, nk: -20, ua: -90, fa: -90, th: 168, sh: 168, hl: 'tr' },
    copenhagen: { hy: 82, tr: -12, nk: -20, ua: -90, fa: -90, th: 168, sh: 168, th2: 175, sh2: 175, prop: 'bench', hl: 'th2' },
    birddog: { ...AF, ua: 0, fa: 0, th2: -175, sh2: -175, hl: 'tr' },
    bridge: { hx: 92, hy: 72, tr: 145, nk: 175, ua: 0, fa: 0, th: -5, sh: 95, hl: 'th' },
    'sl-bridge': { hx: 92, hy: 72, tr: 145, nk: 175, ua: 0, fa: 0, th: -5, sh: 95, th2: -50, sh2: -50, hl: 'th' },
    clam: { hx: 90, hy: 86, tr: 180, nk: 180, ua: 0, fa: 0, th: -35, sh: 70, th2: -65, sh2: 55, hl: 'th2' },
    'side-raise-leg': { hx: 90, hy: 86, tr: 180, nk: 180, ua: 0, fa: 0, th: -10, sh: 20, th2: -40, sh2: -40, hl: 'th2' },
    rdl: { hx: 45, tr: -5, nk: -10, th: 85, sh: 95, hl: 'th' },
    'split-squat': { hx: 50, hy: 72, tr: -65, nk: -70, ua: 0, fa: 0, th: 0, sh: 90, hl: 'th' },
    squat: { hx: 50, hy: 60, tr: -70, nk: -75, ua: 0, fa: 0, th: 20, sh: 110, hl: 'th' },
    'step-up': { th2: 30, sh2: 90, prop: 'box', hl: 'th2' },
    'ham-curl': { ...PR, sh: 120, hl: 'th' },
    nordic: { hx: 60, hy: 66, tr: -40, nk: -45, ua: 50, fa: 50, th: 180, sh: 180, hl: 'th' },
    tke: { th: 95, sh: 95, w: 20, hl: 'sh' },
    'band-er': { ua: 90, fa: 0, hl: 'fa' },
    'band-ir': { ua: 90, fa: 25, hl: 'fa' },
    'reverse-fly': { hx: 50, tr: -25, nk: -30, ua: -90, fa: -90, hl: 'ua' },
    'pull-apart': { ua: 0, fa: 0, hl: 'ua' },
    'toe-raise': { ft: -35, hl: 'sh' },
    'calf-raise': { hy: 47, ft: 45, hl: 'sh' },
    'seated-calf': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, ft: 45, prop: 'chair', hl: 'sh' },
    'hammer-curl': { ua: 90, fa: -30, hl: 'fa' },
    pushdown: { ua: 90, fa: 80, hl: 'ua' },
    march: { th2: 0, sh2: 90, hl: 'th2' },
    superman: { hx: 60, hy: 86, tr: -15, nk: -20, ua: -5, fa: -5, th: -172, sh: -172, hl: 'tr' },
    pushup: { hx: 74, hy: 75, tr: -24, nk: -25, ua: 90, fa: 90, th: 156, sh: 156, hl: 'ua' },
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
    'hip-thrust': { hx: 92, hy: 72, tr: 150, nk: 175, ua: 0, fa: 0, th: -5, sh: 95, prop: 'benchL', wt: true, hl: 'th' },
    breathing: { ...LY, th: -60, sh: 60, ua: 10, fa: 10, hl: 'tr' },
    'tennis-ball': { ...LY, th: -60, sh: 60, ball: [64, 80], hl: 'nk' }
  };
  function geo(o) {
    const p = { hx: 70, hy: 53, tr: -90, nk: -90, ua: 90, fa: 90, th: 90, sh: 90, ...o }, R = Math.PI / 180;
    const d = (a, l) => [Math.cos(a * R) * l, Math.sin(a * R) * l], ad = (q, v) => [q[0] + v[0], q[1] + v[1]];
    const H = [p.hx, p.hy], S = ad(H, d(p.tr, 28)), E = ad(S, d(p.ua, 14)), W = ad(E, d(p.fa, 12)), K = ad(H, d(p.th, 19)), A = ad(K, d(p.sh, 18)), N = ad(S, d(p.nk, 10));
    const two = p.th2 !== undefined, K2 = two ? ad(H, d(p.th2, 19)) : null, A2 = two ? ad(K2, d(p.sh2, 18)) : null;
    const T = ad(A, d(p.ft !== undefined ? p.ft : p.sh - 90, 7)), T2 = two ? ad(A2, d(p.sh2 - 90, 7)) : null;
    return { p, H, S, E, W, K, A, N, K2, A2, T, T2, seg: { tr: [H, S], nk: [S, N], ua: [S, E], fa: [E, W], th: [H, K], sh: [K, A], th2: [H, K2], sh2: [K2, A2] } };
  }
  function svg(key) {
  const o = T[key] || T.stand, g = geo(o), p = g.p, f = v => v.toFixed(1), R = Math.PI / 180;
  const SK = '#edc9ab', SK2 = '#c39b7c', SKd = '#d9b494', CL = '#3f6fa8', CLd = '#2f5a8c', CL2 = '#2a4c78', HL = '#ff5a3d', PR = '#4d6782', PR2 = '#3a5068';
  const id = key.replace(/[^a-z0-9]/gi, '');
  // tapered limb: quad from a (width wa) to b (width wb), rounded ends
  const limb = (a, b, wa, wb, c, c2) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    const P = [[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2], [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]];
    return `<circle cx="${f(a[0])}" cy="${f(a[1])}" r="${wa / 2}" fill="${c}"/><circle cx="${f(b[0])}" cy="${f(b[1])}" r="${wb / 2}" fill="${c}"/><polygon points="${P.map(q => f(q[0]) + ',' + f(q[1])).join(' ')}" fill="${c}"/>` +
      (c2 ? `<polygon points="${[P[1], P[2], [P[2][0] * .5 + P[3][0] * .5, P[2][1] * .5 + P[3][1] * .5]].map(q => f(q[0]) + ',' + f(q[1])).join(' ')}" fill="${c2}" opacity=".5"/>` : ''); };
  const foot = (A, T, c) => { const dx = T[0] - A[0], dy = T[1] - A[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
    const P = [[A[0] - ux * 2 + nx * 3, A[1] - uy * 2 + ny * 3], [T[0] + ux * 2 + nx * 1.5, T[1] + uy * 2 + ny * 1.5], [T[0] + ux * 3 - nx * 1.5, T[1] + uy * 3 - ny * 1.5], [A[0] - ux * 3 - nx * 3.5, A[1] - uy * 3 - ny * 3.5]];
    return `<polygon points="${P.map(q => f(q[0]) + ',' + f(q[1])).join(' ')}" fill="${c}" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>`; };
  const hand = (E, W, c) => { const dx = W[0] - E[0], dy = W[1] - E[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l; return `<ellipse cx="${f(W[0] + ux * 2.5)}" cy="${f(W[1] + uy * 2.5)}" rx="3.6" ry="2.4" transform="rotate(${f(Math.atan2(dy, dx) / R)} ${f(W[0] + ux * 2.5)} ${f(W[1] + uy * 2.5)})" fill="${c}"/>`; };
  // torso: shoulders wider than hips, slight chest curve; built from hip H to shoulder S
  const torso = (H, S) => { const dx = S[0] - H[0], dy = S[1] - H[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, ux = dx / l, uy = dy / l;
    const pt = (t, w) => [H[0] + ux * l * t + nx * w, H[1] + uy * l * t + ny * w];
    const front = [pt(0, 6.5), pt(.3, 6), pt(.6, 7), pt(.9, 8), pt(1.02, 7)], back = [pt(1.02, -7), pt(.85, -8.5), pt(.55, -7.5), pt(.3, -6.5), pt(0, -6.5)];
    const path = 'M' + [...front, ...back].map(q => f(q[0]) + ' ' + f(q[1])).join(' L') + ' Z';
    const waist = 'M' + [pt(.42, 6.3), pt(.42, -7)].map(q => f(q[0]) + ' ' + f(q[1])).join(' L');
    return `<path d="${path}" fill="${CL}"/><path d="${path}" fill="url(#sh${id})" opacity=".35"/><path d="${waist}" stroke="${CLd}" stroke-width="1.2" opacity=".6"/>`; };
  const hl = (p.hl || '').split(' ').map(k => g.seg[k]).filter(s => s && s[0] && s[1]);
  const lying = p.tr !== undefined && Math.abs(Math.sin(p.tr * R)) < 0.5 && p.hy > 60, floor = lying || p.hy >= 66 && !p.prop;
  let out = `<svg class="ill" viewBox="0 0 160 100" role="img" aria-label="${key}"><defs><filter id="gl${id}"><feGaussianBlur stdDeviation="2.5"/></filter><linearGradient id="sh${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient></defs>`;
  out += `<rect x="0" y="92" width="160" height="8" fill="#2b4257"/>`;
  if (p.w) out += `<rect x="${p.w - 2}" y="0" width="4" height="92" fill="${PR2}"/>`;
  if (floor) out += `<rect x="14" y="89" width="132" height="4" rx="2" fill="#6a4e7a"/>`;
  const props = { chair: `<rect x="36" y="74" width="52" height="6" rx="2" fill="${PR}"/><rect x="36" y="36" width="6" height="40" rx="2" fill="${PR}"/><rect x="40" y="80" width="5" height="12" fill="${PR2}"/><rect x="80" y="80" width="5" height="12" fill="${PR2}"/>`,
    step: `<rect x="70" y="68" width="42" height="24" fill="${PR}"/>`, box: `<rect x="86" y="58" width="46" height="34" fill="${PR}"/>`, stair: `<rect x="60" y="83" width="44" height="9" fill="${PR}"/>`,
    bed: `<rect x="14" y="54" width="78" height="38" rx="3" fill="${PR}"/><rect x="14" y="54" width="78" height="6" rx="3" fill="#6a4e7a"/>`,
    bench: `<rect x="100" y="58" width="52" height="34" fill="${PR}"/>`, benchL: `<rect x="8" y="58" width="52" height="34" fill="${PR}"/>`, table: `<rect x="82" y="42" width="36" height="5" fill="${PR}"/><rect x="110" y="47" width="5" height="45" fill="${PR2}"/>` };
  if (p.prop && props[p.prop]) out += props[p.prop];
  (p.ln || []).forEach(l => out += `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="${PR}" stroke-width="5" stroke-linecap="round"/>`);
  if (p.ball) out += `<circle cx="${p.ball[0]}" cy="${p.ball[1]}" r="6" fill="${PR}"/>`;
  hl.forEach(s => out += `<line x1="${f(s[0][0])}" y1="${f(s[0][1])}" x2="${f(s[1][0])}" y2="${f(s[1][1])}" stroke="${HL}" stroke-width="16" stroke-linecap="round" opacity=".5" filter="url(#gl${id})"/>`);
  // far leg (darker, drawn first)
  if (g.K2) out += limb(g.H, g.K2, 11, 8, CL2) + limb(g.K2, g.A2, 7.5, 5, SK2) + foot(g.A2, g.T2, '#4a3a34');
  // shorts + torso
  out += limb(g.H, [g.H[0] + (g.K[0] - g.H[0]) * .28, g.H[1] + (g.K[1] - g.H[1]) * .28], 14, 11, CL2);
  out += torso(g.H, g.S);
  // near leg
  out += limb(g.H, g.K, 11, 8, CL2, '#1e3a5c') + limb(g.K, g.A, 7.5, 5, SK, SKd) + foot(g.A, g.T, '#5a4a44');
  // arm
  out += limb(g.S, g.E, 7, 5.5, SK, SKd) + limb(g.E, g.W, 5.5, 4, SK, SKd) + hand(g.E, g.W, SK);
  if (p.wt) out += `<rect x="${f(g.W[0] - 5)}" y="${f(g.W[1])}" width="10" height="8" rx="2" fill="#8fa5b6"/>`;
  hl.forEach(s => out += `<line x1="${f(s[0][0])}" y1="${f(s[0][1])}" x2="${f(s[1][0])}" y2="${f(s[1][1])}" stroke="${HL}" stroke-width="2" stroke-linecap="round" opacity=".9" stroke-dasharray="1 4"/>`);
  // neck, head with jaw, hair
  const nk = p.nk * R, c = [g.N[0] + Math.cos(nk) * 4.5, g.N[1] + Math.sin(nk) * 4.5];
  out += limb(g.S, g.N, 5, 4.5, SK) + `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="6" ry="7" transform="rotate(${f(p.nk + 90)} ${f(c[0])} ${f(c[1])})" fill="${SK}"/>`;
  out += `<path d="M${f(c[0] - 6)} ${f(c[1])} a6 7 0 0 1 12 0 l-1 -2 l-10 0 Z" fill="#3b2a22" transform="rotate(${f(p.nk + 90)} ${f(c[0])} ${f(c[1])})"/>`;
  // ear + facing hint: a small dot for the eye on the facing side
  return out + '</svg>';
}
  return { T, geo, svg };
})();

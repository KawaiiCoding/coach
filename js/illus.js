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
    'seated-twist': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, ua: 160, fa: 40, ln: CHAIR, hl: 'tr' },
    'seated-side': { hx: 60, hy: 72, tr: -60, nk: -60, th: 0, sh: 90, ua: -60, fa: -60, ln: CHAIR, hl: 'tr' },
    'half-kneel': { hy: 66, th: 0, sh: 90, th2: 100, sh2: 180, hl: 'th2' },
    thomas: { hx: 85, hy: 52, tr: 180, nk: 180, ua: 0, fa: 0, th: -105, sh: 30, th2: 85, sh2: 90, ln: [[20, 56, 90, 56]], hl: 'th2' },
    couch: { hy: 66, th: 0, sh: 90, th2: 100, sh2: 175, w: 66, hl: 'th2 sh2' },
    'quad-stand': { th2: 95, sh2: -110, hl: 'th2' },
    figure4: { ...LY, th: -70, sh: 60, th2: -35, sh2: -140, hl: 'th2' },
    pigeon: { hx: 60, hy: 76, tr: -60, nk: -60, ua: 60, fa: 60, th: 150, sh: 30, th2: 170, sh2: 170, hl: 'th' },
    'seated-fig4': { hx: 60, hy: 72, tr: -55, nk: -55, th: 0, sh: 90, th2: -15, sh2: 130, ln: CHAIR, hl: 'th2' },
    'knee-opp': { ...LY, th: -110, sh: 40, th2: 0, sh2: 0, ua: -35, fa: -35, hl: 'th' },
    'itb-cross': { th: 75, sh: 100, th2: 105, sh2: 80, tr: -100, hl: 'th' },
    butterfly: { hx: 60, hy: 88, tr: -60, nk: -60, th: 10, sh: 175, hl: 'th' },
    frog: { ...AF, hy: 72, th: 60, sh: 180, hl: 'th' },
    'side-lunge': { hx: 60, hy: 70, tr: -75, nk: -75, th: 40, sh: 110, th2: 5, sh2: 5, hl: 'th2' },
    '9090': { hx: 70, hy: 86, tr: -85, nk: -85, ua: 60, fa: 60, th: -8, sh: 25, th2: 188, sh2: 150, hl: 'th' },
    'supine-ham': { ...LY, hx: 80, th: -80, sh: -80, th2: 0, sh2: 0, hl: 'th' },
    'heel-step': { th2: 30, sh2: 0, tr: -75, ln: [[70, 70, 110, 70], [110, 70, 110, 92]], hl: 'th2' },
    'seated-ham': { hx: 60, hy: 88, tr: -60, nk: -50, ua: -20, fa: -20, th: 0, sh: 0, hl: 'th' },
    'wall-calf': { hx: 62, hy: 58, tr: -65, ua: 10, fa: 10, th: 60, sh: 95, th2: 115, sh2: 115, w: 100, hl: 'sh2' },
    'wall-calf-bent': { hx: 62, hy: 58, tr: -65, ua: 10, fa: 10, th: 60, sh: 95, th2: 100, sh2: 120, w: 100, hl: 'sh2' },
    'heel-drop': { hy: 40, ft: 30, ln: [[60, 85, 100, 85], [100, 85, 100, 92]], hl: 'sh' },
    'knee-wall': { hx: 70, hy: 66, th: 10, sh: 70, th2: 100, sh2: 180, w: 104, hl: 'sh' },
    'kneel-shin': { hx: 48, hy: 76, th: 40, sh: 180, hl: 'sh' },
    'toe-wall': { ft: -40, w: 85, hl: 'sh' },
    'peroneal': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, th2: -15, sh2: 130, ln: CHAIR, hl: 'sh2' },
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
    pendulum: { hx: 50, tr: -30, nk: -30, ln: [[82, 44, 115, 44], [112, 44, 112, 92]], hl: 'ua' },
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
    copenhagen: { hy: 82, tr: -12, nk: -20, ua: -90, fa: -90, th: 168, sh: 168, th2: 175, sh2: 175, ln: [[100, 60, 150, 60], [150, 60, 150, 92]], hl: 'th2' },
    birddog: { ...AF, ua: 0, fa: 0, th2: -175, sh2: -175, hl: 'tr' },
    bridge: { hx: 92, hy: 72, tr: 145, nk: 175, ua: 0, fa: 0, th: -5, sh: 95, hl: 'th' },
    'sl-bridge': { hx: 92, hy: 72, tr: 145, nk: 175, ua: 0, fa: 0, th: -5, sh: 95, th2: -50, sh2: -50, hl: 'th' },
    clam: { hx: 90, hy: 86, tr: 180, nk: 180, ua: 0, fa: 0, th: -35, sh: 70, th2: -65, sh2: 55, hl: 'th2' },
    'side-raise-leg': { hx: 90, hy: 86, tr: 180, nk: 180, ua: 0, fa: 0, th: -10, sh: 20, th2: -40, sh2: -40, hl: 'th2' },
    rdl: { hx: 45, tr: -5, nk: -10, th: 85, sh: 95, hl: 'th' },
    'split-squat': { hx: 50, hy: 72, tr: -65, nk: -70, ua: 0, fa: 0, th: 0, sh: 90, hl: 'th' },
    squat: { hx: 50, hy: 60, tr: -70, nk: -75, ua: 0, fa: 0, th: 20, sh: 110, hl: 'th' },
    'step-up': { th2: 30, sh2: 90, ln: [[85, 60, 130, 60], [130, 60, 130, 92]], hl: 'th2' },
    'ham-curl': { ...PR, sh: 120, hl: 'th' },
    nordic: { hx: 60, hy: 66, tr: -40, nk: -45, ua: 50, fa: 50, th: 180, sh: 180, hl: 'th' },
    tke: { th: 95, sh: 95, w: 20, hl: 'sh' },
    'band-er': { ua: 90, fa: 0, hl: 'fa' },
    'band-ir': { ua: 90, fa: 25, hl: 'fa' },
    'reverse-fly': { hx: 50, tr: -25, nk: -30, ua: -90, fa: -90, hl: 'ua' },
    'pull-apart': { ua: 0, fa: 0, hl: 'ua' },
    'toe-raise': { ft: -35, hl: 'sh' },
    'calf-raise': { hy: 47, ft: 45, hl: 'sh' },
    'seated-calf': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, ft: 45, ln: CHAIR, hl: 'sh' },
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
    'ball-squeeze': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, ln: CHAIR, ball: [78, 88], hl: 'th' },
    balance: { th2: 60, sh2: 90, hl: 'sh' },
    monster: { th: 70, sh: 105, th2: 110, sh2: 75, hl: 'th' },
    'towel': { hx: 60, hy: 72, tr: -80, nk: -80, th: 0, sh: 90, ln: CHAIR, hl: 'sh' },
    'band-foot': { hx: 60, hy: 88, tr: -60, nk: -50, ua: -20, fa: -20, th: 0, sh: 0, hl: 'sh' },
    'curl-up': { ...LY, hy: 84, th: -60, sh: 60, th2: 0, sh2: 0, ua: 20, fa: 20, hl: 'tr' },
    pallof: { ua: 0, fa: 0, hl: 'tr' },
    'hip-thrust': { hx: 92, hy: 72, tr: 150, nk: 175, ua: 0, fa: 0, th: -5, sh: 95, ln: [[20, 60, 60, 60], [20, 60, 20, 92]], wt: true, hl: 'th' },
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
    const o = T[key] || T.stand, g = geo(o), p = g.p;
    const ln = (a, b, w, c, op) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${op ? ` opacity="${op}"` : ''}/>`;
    const hs = (p.hl || '').split(' ').map(k => g.seg[k]).filter(s => s && s[0] && s[1]).map(s => ln(s[0], s[1], 9, '#ff4d3d', 0.55)).join('');
    let pr = (p.w ? ln([p.w, 6], [p.w, 92], 3, '#5f7b92') : '') + (p.ln || []).map(l => ln([l[0], l[1]], [l[2], l[3]], 3, '#5f7b92')).join('');
    if (p.ball) pr += `<circle cx="${p.ball[0]}" cy="${p.ball[1]}" r="6" fill="#5f7b92"/>`;
    if (p.wt) pr += `<rect x="${(g.W[0] - 5).toFixed(1)}" y="${(g.W[1]).toFixed(1)}" width="10" height="8" rx="2" fill="#8fa5b6"/>`;
    const b = [[g.H, g.S], [g.S, g.E], [g.E, g.W], [g.H, g.K], [g.K, g.A], [g.A, g.T]]; if (g.K2) b.push([g.H, g.K2], [g.K2, g.A2], [g.A2, g.T2]);
    const c = [g.N[0] + Math.cos(p.nk * Math.PI / 180) * 4, g.N[1] + Math.sin(p.nk * Math.PI / 180) * 4];
    return `<svg class="ill" viewBox="0 0 160 100" role="img" aria-label="schematic: ${key}">${ln([8, 92], [152, 92], 2, '#5f7b92')}${pr}${hs}${b.map(s => ln(s[0], s[1], 3, '#d7e3ec')).join('')}${ln(g.S, g.N, 3, '#d7e3ec')}<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="5" fill="#10202e" stroke="#d7e3ec" stroke-width="2.4"/></svg>`;
  }
  return { T, geo, svg };
})();

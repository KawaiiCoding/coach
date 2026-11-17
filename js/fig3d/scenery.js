/* Scenery: the garden the 2D pictures show (ground, hills, leafy bushes, sun glow, cloud), built in the same room as the
   figure, so turning and zooming the view moves everything together. Colours come from the app's theme (light or dark).
   Bushes and hills stand in a ring round the mat; whatever would come between the camera and the figure shrinks away, so the
   view of the coach is never blocked. The sun glow and the cloud are not here: the app paints them on a fixed layer behind this
   page, so they stay perfectly still while the room turns. */
const SCN = (() => {
  const dark = new URLSearchParams(location.search).get('cs') === 'dark';
  const css = (n, l, d) => { try { const v = parent !== window && parent.getComputedStyle(parent.document.documentElement).getPropertyValue('--' + n).trim(); if (v) return v; } catch (e) {} return dark ? d : l; };
  const basic = c => new THREE.MeshBasicMaterial({ color: new THREE.Color(c) });
  const M = { ground: basic(css('ill-ground', '#F1DFCE', '#352C25')), hill: basic(css('ill-hill', '#D2DEC0', '#3A4632')), b1: basic(css('ill-bush', '#B4C7A3', '#5D7151')), b2: basic(css('ill-bush2', '#9DB58C', '#4C6042')),
    glow: basic(css('ill-glow', '#FFF7F0', '#33291F')), cloud: basic(css('ill-cloud', '#F4E6D9', '#3A3029')) };
  disc.geometry = new THREE.CircleGeometry(455, 96); disc.material = M.ground; disc.position.set(MAT.x + 36, -2.6, 0); disc.renderOrder = -6; disc.material.depthWrite = false;
  const ring = [], lobe = new THREE.SphereGeometry(1, 20, 14);
  const place = (g, ang, rad, sc) => { g.userData = { ang, sc }; g.position.set(Math.sin(ang) * rad, -2.6, Math.cos(ang) * rad); g.renderOrder = -4; scene.add(g); ring.push(g); };
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(lobe, M.hill); m.scale.set(150, 30 + 8 * (i % 3), 70); const g = new THREE.Group(); g.add(m); m.rotation.y = i * 60 * R; m.renderOrder = -5; place(g, (i * 60 + 20) * R, 432, 1); }
  for (let i = 0; i < 14; i++) { const g = new THREE.Group(), k = 1.25 + ((i * 37) % 10) / 10 * .85, mat = i % 3 === 1 ? M.b2 : M.b1;
    [[0, 15, 8], [-7, 9, 8], [7, 9, 8], [-12, 2, 7], [12, 2, 7], [0, 4, 10]].forEach(([x, y, r], n) => { const m = new THREE.Mesh(lobe, mat); m.scale.setScalar(r * k); m.position.set(x * k * .8, (y + 4) * k, ((n * 5) % 7 - 3) * k * .9); m.renderOrder = -3; g.add(m); });
    place(g, (i * 360 / 14 + (i % 2) * 9) * R, 285 + ((i * 53) % 95), 1); }
  /* called before every picture: yaw of the camera (degrees), size of what the camera sees */
  return function update(yaw) { const y = yaw * R;
    ring.forEach(g => { const f = Math.cos(g.userData.ang - y), s = 1 - ramp(-.5, -.05, f); g.visible = s > .01; g.scale.setScalar(Math.max(.01, s)); }); };
})();

/* A visitor. Now and then a small cat or dog wanders across the garden behind the mat: a real object in the room, never between
   the camera and the coach and never over the mat. Nothing about it repeats on a schedule: the wait, the animal, its coat, the
   side it comes from, its pace, how far away it passes and whether it stops to look are all drawn afresh each time. */
const PET = (() => {
  const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const COATS = { cat: [['#F0B273', '#DE9A58', '#FFF6EA', '#D98E4C'], ['#A7ADB3', '#9198A0', '#F7F7F5', '#7E858D'], ['#FFFFFF', '#ECE7E1', '#FFFFFF', '#E9D9C6'], ['#F5E6D2', '#E6D2B8', '#FFFFFF', '#D9BE9C']],
    dog: [['#FBF4EA', '#EBE0D2', '#FFFFFF', '#C98A55', 1], ['#F3E3CB', '#E2CEB0', '#FFF8EE', '#8A6248', 1], ['#D7A877', '#C3925F', '#FFF1DF', '#B07E4E', 0], ['#FFFFFF', '#ECE7E1', '#FFFFFF', '#4A423D', 1]] };
  const g = new THREE.Group(); g.visible = false; scene.add(g);
  let parts = null, st = null, next = rnd(20, 90);      // a surprise: once in a workout at a moment nobody can predict, after that only now and then
  const sph = (par, mat, r, sx, sy, sz, x, y, z, w = .3) => { const p = part(ell(r, sx, sy, sz, 44), mat, GP, par, w); p.position.set(x, y, z); return p; };
  const LEG = 8.5;
  function leg(par, mat, paw, x, z) { const j = new THREE.Group(); j.position.set(x, LEG + 1.5, z); par.add(j); const geo = new THREE.CapsuleGeometry(3.1, LEG - 3.4, 10, 28); geo.translate(0, -LEG / 2 + .6, 0); part(geo, mat, GP, j, .3);
    sph(j, paw, 4, 1.16, .8, 1.06, .8, -LEG + 2.5, 0); return j; }      // a round paw that fully caps the leg
  /* Chunky and soft: a big round head, a plump body, short thick legs. The dog has floppy ears, patches, a collar and a stubby
     tail; the cat has pointed ears, a white chest and paws, a plain coat and a long tail held up. */
  function build(kind, coat) { while (g.children.length) g.remove(g.children[0]);
    const m = toon(coat[0], coat[1]), white = toon(coat[2], coat[2]), mark = toon(coat[3], coat[3]), dk = toon('#2A1E19', '#2A1E19'), pink = toon('#EFA39A', '#EFA39A'), cat = kind === 'cat', H = LEG + 9.5;
    const body = new THREE.Group(); body.position.y = H; g.add(body);
    sph(body, m, 10, 1.5, 1, .98, 0, 0, 0); sph(body, m, 9.2, 1, 1, 1, 7, 1, 0); sph(body, white, 9.6, 1.4, .8, .76, 1.5, -3.3, 0, 0);
    if (cat) {
      sph(body, white, 9, 1, .9, .6, 8.2, -1.9, 0, 0); }      // white bib
    else { sph(body, mark, 6.4, 1.25, .62, 1.1, -3, 6.9, -2.5, 0); sph(body, mark, 4.6, 1.1, .9, .62, 5, 2.5, 7.9, 0); sph(body, mark, 4.2, 1, .9, .62, -6, 1, -8.1, 0); }      // patches stand a little proud of the coat, so their edges are clean
    const head = new THREE.Group(); head.position.set(14.5, 9.5, 0); body.add(head);
    sph(head, m, 10, 1, .93, 1.06, 0, 0, 0);
    const ears = [];
    if (cat) { sph(head, white, 4.4, .95, .72, 1.2, 7.2, -3, 0, 0); sph(head, pink, 1.05, 1, .75, 1.3, 10.9, -1.6, 0, 0);
      [1, -1].forEach(s => { sph(head, dk, 1.55, .45, 1.15, 1, 8.6, 1.6, s * 4.2, 0); sph(head, toon('#FFFFFF', '#FFFFFF'), .5, 1, 1, 1, 9.2, 2.3, s * 4.5, 0);
        const e = new THREE.Group(); e.position.set(-.5, 7.2, s * 5.6); e.rotation.x = s * .32; head.add(e); part(new THREE.ConeGeometry(3.9, 7, 14), m, GP, e, .3).position.y = 2.6; const inn = part(new THREE.ConeGeometry(2.1, 4.4, 12), pink, GP, e, 0); inn.position.set(1.75, 1.9, 0); inn.scale.set(.5, 1, 1); ears.push(e); }); }
    else { sph(head, white, 5, 1.2, .8, 1.05, 8.4, -3.4, 0, .3); sph(head, dk, 1.7, 1, .85, 1.25, 14.1, -2.1, 0, 0);
      { const t = new THREE.TorusGeometry(2.1, .3, 6, 14, Math.PI * .8); t.rotateZ(Math.PI * 1.1); t.rotateY(Math.PI / 2); part(t, dk, GP, head, 0).position.set(12.2, -4.4, 0); }
      [1, -1].forEach(s => { sph(head, dk, 1.65, .5, 1.12, 1, 9.0, 2.9, s * 3.6, 0); sph(head, toon('#FFFFFF', '#FFFFFF'), .52, 1, 1, 1, 9.75, 3.6, s * 3.85, 0);      // big clear eyes with a highlight
        const e = new THREE.Group(); e.position.set(-3.4, 5.5, s * 7); head.add(e); const flap = sph(e, mark, 5, .7, 1.55, .34, 0, -5.6, s * 4.2, .3); flap.rotation.x = -s * .55; e.userData.s = s; ears.push(e); }); }
    const tail = new THREE.Group(); tail.position.set(-14.2, 3.5, 0); body.add(tail); const segs = [tail];
    let tube = null, tip = null;
    if (cat) { tube = part(new THREE.BufferGeometry(), m, GP, tail, .3); tip = sph(tail, white, 2.05, 1, 1, 1, 0, 0, 0, .3); }      // the tail is one smooth tube, redrawn along a curve every frame
    else { const geo = new THREE.CapsuleGeometry(2, 4.5, 4, 12); geo.translate(0, 3.2, 0); part(geo, coat[4] ? mark : m, GP, tail, .3); }
    const legs = [[8.5, 4.6], [8.5, -4.6], [-8.5, 4.6], [-8.5, -4.6]].map(([x, z]) => leg(g, m, cat || coat[4] ? white : m, x, z));
    parts = { body, head, tail, segs, ears, legs, cat, H, tube, tip }; }
  const tailPts = Array.from({ length: 9 }, () => V3()), tailCurve = new THREE.CatmullRomCurve3(tailPts);
  /* dt: seconds since the last picture; yaw: camera angle (degrees); wv: width of what the camera sees */
  return function update(dt, yaw, wv, force) {
    if (force && force.hide) { st = null; g.visible = false; return false; }
    if (force) { build(force.kind, COATS[force.kind][force.coat]); const y = yaw * R; st = { rx: Math.cos(y), rz: -Math.sin(y), bx: -Math.sin(y), bz: -Math.cos(y), d0: 150, d1: 150, wig: 0, wf: 60, wp: 0, half: 150, vd: 1, dir: force.dir || 1, a: force.a, end: force.end ?? 1e9, sp: 36, ph: force.ph || 0, stop: force.stop ? -1e9 : null, wait: 0, size: 1, hold0: 1e9 }; g.scale.setScalar(1); g.visible = true; }      // for looking at one on purpose
    if (!st) { next -= dt; if (next > 0) return false; const kind = pick(['cat', 'dog']); build(kind, pick(COATS[kind]));
      const y = yaw * R, dir = Math.random() < .5 ? 1 : -1, depth = rnd(125, 215), half = wv / 2 + 70;
      st = { rx: Math.cos(y), rz: -Math.sin(y), bx: -Math.sin(y), bz: -Math.cos(y), d0: depth, d1: rnd(115, 230), wig: rnd(0, 20), wf: rnd(40, 80), wp: rnd(0, 6), half, vd: 1, uturn: Math.random() < .28, dir, a: -half, end: half, sp: rnd(24, 46), ph: 0, stop: Math.random() < .5 ? rnd(-.35, .35) * half : null, wait: 0, size: rnd(.85, 1.15) };
      g.scale.setScalar(st.size); g.visible = true; }
    const p = parts, s = st; let moving = true;
    if (s.stop !== null && s.vd > 0 && s.a >= s.stop) { s.wait += dt; moving = false; if (s.hold0 === undefined) s.hold0 = rnd(1.6, 4.2); if (s.wait > s.hold0) { s.stop = null; if (s.uturn) s.vd = -1; } }      // sometimes it stops, looks, and goes back the way it came
    if (moving) { s.a += s.vd * s.sp * dt; s.ph += s.sp * dt * .21; }
    /* Where it is: across the view on a slanted, gently weaving line that always stays well behind the mat. If the camera is turned
       so that it would come between the viewer and the coach, it shrinks away like the bushes do. */
    const lat = s.dir * s.a, back = Math.max(104, s.d0 + (s.d1 - s.d0) * (s.a + s.half) / (2 * s.half) + s.wig * Math.sin(s.a / s.wf + s.wp));
    const px = s.rx * lat + s.bx * back + MAT.x + 36, pz = s.rz * lat + s.bz * back;
    if (s.px !== undefined && moving) { const want = Math.atan2(-(pz - s.pz), px - s.px); let d = want - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * Math.min(1, dt * 5 + (s.first ? 0 : 1)); s.first = 1; }
    s.px = px; s.pz = pz; g.position.set(px, -2.4, pz);
    { const yv = yaw * R, f = (px * Math.sin(yv) + pz * Math.cos(yv)) / (Math.hypot(px, pz) || 1), vis = 1 - ramp(-.45, 0, f); g.scale.setScalar(Math.max(.001, s.size * vis)); }
    /* A soft, bouncy walk: the legs go in diagonal pairs and lift as they swing, the body bobs twice a stride, rocks from side to
       side and squashes a little as it lands; the head, the ears and the tail follow a moment later, so nothing moves as one stiff piece. */
    const k = s.gait = (s.gait ?? 1) + ((moving ? 1 : 0) - (s.gait ?? 1)) * Math.min(1, dt * 6), ph = s.ph, tm = performance.now() / 1000;
    p.legs.forEach((l, i) => { const a = ph + (i === 0 || i === 3 ? 0 : Math.PI), sw = Math.sin(a); l.rotation.z = sw * .62 * k; l.position.y = LEG + 1.5 + Math.max(0, Math.cos(a)) * 2.4 * k; });
    const bob = Math.abs(Math.sin(ph)), land = Math.sin(2 * ph - .6);
    p.body.position.y = p.H + (bob * 1.9 - .5) * k - (1 - k) * (p.cat ? 1.2 : .6); p.body.rotation.x = Math.sin(ph) * .1 * k; p.body.rotation.z = land * .045 * k + (1 - k) * (p.cat ? .1 : .05);
    p.body.scale.set(1 - .035 * land * k, 1 + .06 * land * k, 1 + .02 * land * k);
    p.head.position.y = 9.5 + Math.sin(2 * ph - 1.3) * .9 * k; p.head.rotation.z = Math.sin(2 * ph - 1.6) * .07 * k + (1 - k) * .1 * Math.sin(tm * 1.4);
    p.head.rotation.y = k * .12 * Math.sin(ph - .5) - (1 - k) * s.dir * 1.05 * ramp(0, .7, s.wait);      // when it stops it turns to look at the coach
    p.head.rotation.x = Math.sin(ph - .4) * .08 * k + (1 - k) * .18 * Math.sin(tm * .9);                   // and tilts its head
    if (p.cat) { let x = 0, y = 0, z = 0; tailPts.forEach((q, i) => { q.set(x, y, z); const th = 1.05 - .2 * i + .12 * Math.sin(ph - i * .45) * k, sw = .22 * Math.sin(tm * 1.6 - i * .5) * (i / 8); x -= Math.sin(th) * 3.1; y += Math.cos(th) * 3.1; z += sw * 3.1; });      // up and back from the body, the tip curling forward, swaying as it walks
      const geo = new THREE.TubeGeometry(tailCurve, 28, 1.85, 14, false); p.tube.children.forEach(mm => { mm.geometry.dispose(); mm.geometry = geo; }); p.tip.position.copy(tailPts[8]); p.ears.forEach((e, i) => { e.rotation.z = .06 * Math.sin(2 * ph - 2 + i) * k; }); }
    else { p.tail.rotation.z = .75; p.tail.rotation.x = .75 * Math.sin(tm * (k > .5 ? 11 : 16)); p.ears.forEach(e => { e.rotation.x = -e.userData.s * .34 * Math.max(0, Math.sin(2 * ph - 1.9)) * k; e.rotation.z = .16 * Math.sin(2 * ph - 2.2) * k; }); }
    if (s.a > s.end || s.a < -s.half - 1) { st = null; g.visible = false; next = rnd(260, 900); } return !!st; }; })();

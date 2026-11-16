/* Props: chair, door frame, dumbbells, band, tennis ball; contact shadow. */
/* Props. Each is its own object in the room. A move lists the props it uses; they ease in and out with the move. Hands grip or
   plant on them, the body rests on them, and anything held counts in the balance. */
const PM = { wood: toon('#D8C7B6', '#C4B09C', 0xA8957F), dark: toon('#4A5057', '#3A4046', 0x24282c), band: toon('#7F9A70', '#6B8660', 0x566E4C), ball: toon('#D4E157', '#BFCB45', 0x9AA536), steel: toon('#C9CED4', '#AEB4BB', 0x8F959C) };
const GP = 4, PROPS = {}, CHAIR = { x: -35, seat: 46 };
const box = (g, mat, w, h, d, x, y, z) => part(new THREE.BoxGeometry(w, h, d), mat, GP, g, .4).position.set(x, y, z);
const cyl = (g, mat, r, len, x, y, z, axis) => { const geo = new THREE.CylinderGeometry(r, r, len, 20); if (axis === 'x') geo.rotateZ(Math.PI / 2); if (axis === 'z') geo.rotateX(Math.PI / 2); part(geo, mat, GP, g, .34).position.set(x, y, z); };
function prop(name, parents, build) { const gs = parents.map(par => { const g = new THREE.Group(); g.visible = false; par.add(g); return g; }); gs.forEach(build); PROPS[name] = { gs, show: 0, cfg: {} }; }
prop('chair', [scene], g => { const x = CHAIR.x; box(g, PM.wood, 42, 4, 42, x, CHAIR.seat - 2, 0);
  [[17, 17], [17, -17], [-17, 17], [-17, -17]].forEach(([a, b]) => box(g, PM.wood, 3.6, CHAIR.seat - 4, 3.6, x + a, (CHAIR.seat - 4) / 2, b));
  [17, -17].forEach(b => box(g, PM.wood, 3.6, 46, 3.6, x - 19.2, CHAIR.seat + 23, b)); box(g, PM.wood, 3, 20, 37, x - 19.2, CHAIR.seat + 34, 0); });
prop('door', [scene], g => { [42, -42].forEach(z => box(g, PM.wood, 5, 205, 10, 0, 102.5, z)); box(g, PM.wood, 5, 10, 94, 0, 210, 0); });      // an 80 cm opening
prop('ball', [scene, scene], g => part(ell(3.3, 1, 1, 1, 24), PM.ball, GP, g, .3));
/* Blocks: plain boxes a move places in the room (a step, a bench, a table, a wall, a bed, a towel). props: { blocks: [[x0, x1, y0, y1, z0, z1, 'wood' | 'soft' | 'wall'], ...] } */
PM.soft = toon('#EADFD3', '#D9CCBE', 0xBFAF9E); PM.wall = toon('#F4E7DA', '#E8D8C8', 0xD2BFAC);
prop('blocks', [scene, scene, scene, scene], g => part(new THREE.BoxGeometry(1, 1, 1), PM.wood, GP, g, 0));
prop('roller', [scene], g => { const geo = new THREE.CylinderGeometry(7, 7, 46, 28); geo.rotateX(Math.PI / 2); part(geo, PM.band, GP, g, .34); });
prop('weight', [arms[0].wr], g => { g.position.set(0, -6.4, -2.3); cyl(g, PM.steel, 1.15, 8.6, 0, 0, 0, 'x'); [5.7, -5.7].forEach(x => cyl(g, PM.dark, 3.5, 3.2, x, 0, 0, 'x')); });
const blocksOf = x => (x.props && x.props.blocks) || [];
function propPoints(x) { const o = [], pr = x.props || {}; blocksOf(x).forEach(b => { for (const X of [b[0], b[1]]) for (const Y of [b[2], Math.min(b[3], 175)]) for (const Z of [Math.max(b[4], -45), Math.min(b[5], 45)]) o.push([X, Y, Z]); });
  if (pr.door) { const dx = pr.door.x ?? 8; o.push([dx, 0, 42], [dx, 0, -42], [dx, 190, 42], [dx, 190, -42]); }
  if (x.stance === 'chair') o.push([CHAIR.x - 21, 0, 21], [CHAIR.x - 21, 92, -21], [CHAIR.x + 21, 0, 21]);
  if (pr.band && pr.band.anchor) o.push(pr.band.anchor); (pr.band && pr.band.s || []).forEach(q => q.forEach(e => { if (Array.isArray(e)) o.push(e); }));
  return o; }
/* A named spot on the body, for bands and balls: handR, handL, kneeR, kneeL, ankleR, ankleL, footR, footL, or a fixed [x, y, z]. */
function spot(e, out) { if (Array.isArray(e)) return out.set(e[0], e[1], e[2]); const r = e.endsWith('R'), a = arms[r ? 0 : 1], l = legs[r ? 0 : 1];
  if (e.startsWith('hand')) return palm(a, out); if (e.startsWith('knee')) return l.kn.getWorldPosition(out); if (e.startsWith('ankle')) return out.set(0, 3, 0).applyMatrix4(l.an.matrixWorld); return out.set(8, -3, 0).applyMatrix4(l.an.matrixWorld); }
prop('band', [scene, scene], g => { const geo = new THREE.CylinderGeometry(1, 1, 1, 12); part(geo, PM.band, GP, g, .3); });
prop('dumbbells', arms.map(a => a.wr), g => { const s = g.parent === arms[0].wr ? 1 : -1; g.position.set(0, -6.4, -s * 2.3); cyl(g, PM.steel, 1.15, 8.6, 0, 0, 0, 'x'); [5.7, -5.7].forEach(x => cyl(g, PM.dark, 3.5, 3.2, x, 0, 0, 'x')); });
function palm(a, out) { return out.set(0, -6.4, -a.s * 2.3).applyMatrix4(a.wr.matrixWorld); } const pa = V3(), pb = V3(); const palmOld = (a, out) => out.set(0, -6.4, -a.s * 2.3).applyMatrix4(a.wr.matrixWorld);
function strand(g, A1, B1, rest) { const len = Math.max(.1, A1.distanceTo(B1)), r = .95 * Math.sqrt(rest / Math.max(rest, len));      // a band thins as it stretches
  g.position.copy(A1).add(B1).multiplyScalar(.5); g.quaternion.setFromUnitVectors(UP, sv.subVectors(B1, A1).normalize()); g.scale.set(r, len, r); }
function syncProps(p) { const want = {}, use = k => { Object.assign(want, EX[k].props || {}); if (stance(k) === 'chair') want.chair = want.chair || {}; };
  use(cur);
  for (const name in PROPS) { const P = PROPS[name]; if (want[name]) P.cfg = want[name]; P.show = want[name] ? 1 : 0;
    P.gs.forEach(g => { g.visible = P.show > .5; }); }
  PROPS.door.gs[0].position.x = PROPS.door.cfg.x ?? 8;
  const bare = !!EX[cur].barefoot; legs.forEach(l => { l.shod.forEach(g => g.visible = !bare); l.bare.forEach(g => g.visible = bare); });      // bare feet where the move needs them (e.g. a ball under the sole)
  scene.updateMatrixWorld(true);
  { const c = want.ball || {}, g0 = PROPS.ball.gs[0], g1 = PROPS.ball.gs[1], r = c.r || 3.3; g1.visible = false;      // ball: under a foot (ballX, ballZ), between the knees, or two under the head
    if (c.at === 'knees') { legs[0].kn.getWorldPosition(pa); legs[1].kn.getWorldPosition(pb); g0.position.copy(pa).add(pb).multiplyScalar(.5); g0.position.x -= 2; g0.rotation.z = 0; }
    else if (c.at) { g0.position.set(c.at[0], c.at[1], c.at[2]); if (c.two) { g1.visible = P0('ball'); g1.position.set(c.at[0], c.at[1], -c.at[2]); g1.scale.setScalar(r / 3.3); } }
    else { g0.position.set(p.ballX, p.ballY, p.ballZ); g0.rotation.z = -p.ballX / 3.3; }
    g0.scale.setScalar(r / 3.3); }
  { const bl = want.blocks || []; PROPS.blocks.gs.forEach((g, i) => { const b = bl[i]; g.visible = !!b; if (!b) return; g.position.set((b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2); g.scale.set(b[1] - b[0], b[3] - b[2], b[5] - b[4]);
      g.children[0].children[0].material = bodyMat(PM[b[6] || 'wood'], GP, false); }); }
  if (want.roller) PROPS.roller.gs[0].position.set(want.roller.x, 7, 0);
  if (PROPS.band.show > .5) { const c = PROPS.band.cfg, an = c.anchor, st = c.s || (an ? [[an, 'handR'], [an, 'handL']] : [['handR', 'handL']]);
    PROPS.band.gs.forEach((g, i) => { g.visible = !!st[i]; if (st[i]) strand(g, spot(st[i][0], pa).clone(), spot(st[i][1], pb), c.rest || (an ? 60 : 30)); }); }
}
const P0 = n => PROPS[n].show > .5;
const sc = document.createElement('canvas'); sc.width = sc.height = 128;
{ const c = sc.getContext('2d'), gr = c.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(90,40,15,.36)'); gr.addColorStop(.6, 'rgba(90,40,15,.12)'); gr.addColorStop(1, 'rgba(90,40,15,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); }
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = .05; shadow.renderOrder = -1; scene.add(shadow);

/* Solver: posing the rig, legs and hands to their targets, body and mat collision, balance over the support. */
const H = V3(), A = V3(), e = V3(), pole = V3(), pp = V3(), K = V3(), ax = V3(), ay = V3(), az = V3(), UP = V3(0, 1, 0);
const M = new THREE.Matrix4(), qRoot = new THREE.Quaternion(), qT = new THREE.Quaternion(), qS = new THREE.Quaternion(), qF = new THREE.Quaternion(), qi = new THREE.Quaternion();
const kp = V3(), ZAX = V3(0, 0, 1), XF = V3(1, 0, 0), XB = V3(-1, 0, 0), DN = V3(0, -1, 0), qT2 = new THREE.Quaternion(), qS2 = new THREE.Quaternion(), qF2 = new THREE.Quaternion();
const basis = (q, yDir, fwd) => { ay.copy(yDir).normalize(); ax.copy(fwd).addScaledVector(ay, -fwd.dot(ay)).normalize(); az.crossVectors(ax, ay); return q.setFromRotationMatrix(M.makeBasis(ax, ay, az)); };
function shape(p, t) {                                          // everything that does not depend on where the hips are
  const br = (Math.sin(t * 2 * Math.PI / 4.2) * .5 + .5) * .012 + p.breath * .02;   // gentle idle sway and breathing so it never looks frozen
  root.rotation.set((p.pelS + p.roll) * R, p.pelT * R, -p.pel * R);      // roll: lying on one side
  bendTorso(br, p);
  bendNeck(p);
  const trunkZ = -(p.pel + p.lum + p.che) * R, trunkX = (p.pelS + p.lumS + p.cheS) * R;
  arms.forEach(a => { const r = a.s > 0, flex = r ? p.flexR : p.flexL, abd = r ? p.abdR : p.abdL, elb = r ? p.elbR : p.elbL;
    const lift = smoother((Math.max(flex, abd) - 60) / 110);                                // the shoulder girdle rises as the arm goes overhead
    a.sh.position.set((r ? p.shFR : p.shFL) * 2.4, SHO.y + 3.4 * lift + 3.4 * (r ? p.shrR : p.shrL), a.s * (SHO.z - 1.4 * lift));      // shr: shrug; shF: shoulder drawn forward (+) or back (-)
    const curl = r ? p.curlR : p.curlL, wf = r ? p.wfR : p.wfL, pro = r ? p.proR : p.proL, rot = r ? p.rotR : p.rotL;
    a.sh.rotation.set(-a.s * abd * R - trunkX * (1 - ramp(20, 80, abd)), a.s * rot * R, clamp(flex * R - trunkZ, -50 * R, 180 * R));      // arm angles are given against the room; the shoulder itself stays inside its own range
    a.el.rotation.set(0, 0, elb * R); a.wr.rotation.set(a.s * wf * R, a.s * pro * R, p.wri * R);
    a.fingers.forEach((sg, i) => { const c = clamp(curl * (1 + .16 * i), 0, 1.08); sg[0].rotation.x = a.s * c * 80 * R; sg[1].rotation.x = a.s * c * 100 * R; sg[2].rotation.x = a.s * c * 68 * R; });
    a.t0.rotation.set(a.s * ((5 + 33 * curl) * (1 - (r ? p.plantR : p.plantL)) - 6 * (r ? p.plantR : p.plantL)) * R, 0, (20 - 44 * curl) * R); a.t1.rotation.set(a.s * 22 * curl * R, 0, (4 - 40 * curl) * R); });
  arms.forEach(a => { a.qs.copy(a.sh.quaternion); a.qe.copy(a.el.quaternion); a.qw.copy(a.wr.quaternion); });
}
/* Limits that apply when a hand is driven to a target (the pose limits cannot see these, so they are enforced here). */
const thA = V3(), thB = V3(), wFree = V3(), eFree = V3(), fr = V3(), SH_BACK = Math.sin(46 * R), SH_ACROSS = Math.sin(50 * R), core0 = V3(), core1 = V3(), coreN = V3(), push = V3(), pPush = V3(), cq = V3();
function corePen(pt, r) {                                       // how far a point of radius r is inside the trunk (a capsule along the spine); coreN points out of it
  cq.subVectors(core1, core0); const t = clamp(cv3.subVectors(pt, core0).dot(cq) / cq.lengthSq(), 0, 1); coreN.subVectors(pt, cv3.copy(core0).addScaledVector(cq, t));
  const d = coreN.length() || 1e-6; coreN.multiplyScalar(1 / d); return 9.4 + r - d; }
/* The body as solid shapes: capsules for the trunk, both thighs, both shins and the other arm, a sphere for the head.
   bodyPen(point, radius) says how far a point of that size is inside any of them and which way is out. The arm solver uses it
   to keep every hand, fingertip and elbow outside the body; the automatic test uses the same function to verify it. */
const headC = V3(), CAP = Array.from({ length: 8 }, () => ({ a: V3(), b: V3(), r: 0 })), bestN = V3(); let capN = 0;
function buildBody(self) { root.updateMatrixWorld(true); capN = 0; const add = (r) => { const c = CAP[capN++]; c.r = r; return c; };
  let c = add(9.4); c.a.set(0, 3, 0).applyMatrix4(root.matrixWorld); c.b.set(0, 23, 0).applyMatrix4(chest.matrixWorld); core0.copy(c.a); core1.copy(c.b);
  legs.forEach(l => { c = add(7.2); l.hip.getWorldPosition(c.a); l.kn.getWorldPosition(c.b); c = add(4.8); l.kn.getWorldPosition(c.a); l.an.getWorldPosition(c.b); });
  arms.forEach(o => { if (o === self) return; c = add(3.3); o.el.getWorldPosition(c.a); o.wr.getWorldPosition(c.b); c = add(2.4); o.wr.getWorldPosition(c.a); o.tips[1].getWorldPosition(c.b); });
  headC.set(HC[0], HC[1], 0).applyMatrix4(head.matrixWorld); }
function bodyPen(pt, r) { let best = -1e9;
  for (let i = 0; i < capN; i++) { const c = CAP[i]; cq.subVectors(c.b, c.a); const t = clamp(cv3.subVectors(pt, c.a).dot(cq) / (cq.lengthSq() || 1e-6), 0, 1); coreN.subVectors(pt, cv3.copy(c.a).addScaledVector(cq, t));
    const d = coreN.length() || 1e-6, pen = c.r + r - d; if (pen > best) { best = pen; bestN.copy(coreN).multiplyScalar(1 / d); } }
  if (r < 4) { coreN.subVectors(pt, headC); const d = coreN.length() || 1e-6, pen = 8.5 + r - d; if (pen > best) { best = pen; bestN.copy(coreN).multiplyScalar(1 / d); } }      // hands and fingertips; an elbow may pass beside the ear
  coreN.copy(bestN); return best; }
function wristLimit(a, maxBend) {                               // wrist: at most maxBend degrees of bend from the forearm's line, at most 95 of turn at the wrist itself
  const q = a.wr.quaternion, n = Math.hypot(q.y, q.w); if (n > 1e-5) qTw.set(0, q.y / n, 0, q.w / n); else qTw.copy(QI);
  qSw.copy(qTw).invert().multiply(q); if (qSw.w < 0) qSw.set(-qSw.x, -qSw.y, -qSw.z, -qSw.w);
  const bend = 2 * Math.acos(clamp(qSw.w, -1, 1)) / R; if (bend > maxBend) qSw.copy(qB.copy(QI).slerp(qSw, maxBend / bend));
  if (qTw.w < 0) qTw.set(0, -qTw.y, 0, -qTw.w); const turn = 2 * Math.acos(clamp(qTw.w, -1, 1)) / R; if (turn > 95) qTw.copy(qB.copy(QI).slerp(qTw, 95 / turn));
  q.copy(qTw).multiply(qSw); }
const stz = (p, r) => { const v = r ? p.fzR : p.fzL; return v > -90 ? v : p.footZ; }, sto = (p, r) => { const v = r ? p.toR : p.toL; return v > -90 ? v : p.toe; };      // each foot's own stance width and toe angle
function place(p, ox, oz, oy = 0) {                                      // put the hips somewhere, then solve hands and legs against the mat
  root.position.set(p.hipX + ox, p.hipY + oy, p.hipZ + oz);
  const kdm = Math.max(p.kdR, p.kdL);                               // a knee on the mat is a fixed contact: the hip rides on the thigh above it
  if (kdm > .001) { const dk = p.hipX + ox - p.knX; root.position.y += (KNEE_Y + Math.sqrt(Math.max(1, L.thigh ** 2 - dk * dk)) - root.position.y) * kdm; }
  root.updateMatrixWorld(true);
  { let drop = 0; const reach = L.thigh + L.shin - .25;             // a supporting leg must reach the mat: if it would over-stretch, the hips come down
    legs.forEach(l => { const r = l.s > 0, on = (1 - ramp(.15, 2.6, r ? p.liftR : p.liftL)) * (1 - ramp(0, 1, r ? p.kdR : p.kdL)) * (1 - ramp(0, 1, r ? p.freeR : p.freeL)) * (1 - ramp(0, 1, p.rest)); if (on <= 0) return; const ph = (r ? p.heelR : p.heelL) * R, fw = 11.6 - 11.6 * Math.cos(ph) + 7 * Math.sin(ph), c = Math.cos(sto(p, r) * R), sn = Math.sin(sto(p, r) * R);
      l.hip.getWorldPosition(H); const hz = Math.hypot((r ? p.fxR : p.fxL) + c * fw - H.x, l.s * stz(p, r) + l.s * sn * fw - H.z), top = (r ? p.flR : p.flL) + 1 + 11.6 * Math.sin(ph) + 7 * Math.cos(ph) + Math.sqrt(Math.max(0, reach * reach - hz * hz));
      drop = Math.max(drop, (H.y - top) * on); });
    root.position.y -= drop; }
  // legs: two-bone IK in 3D. The ankle is pinned to the mat, the knee tracks over the toes, the foot stays flat.
  root.updateMatrixWorld(true); root.getWorldQuaternion(qRoot);
  legs.forEach(l => { const r = l.s > 0, fx = r ? p.fxR : p.fxL, lift = r ? p.liftR : p.liftL, kn = r ? p.kneelR : p.kneelL; let ph = (r ? p.heelR : p.heelL) * R;
    l.hip.getWorldPosition(H); pole.set(Math.cos(sto(p, r) * R), 0, l.s * Math.sin(sto(p, r) * R)); const fz = stz(p, r);
    const free = r ? p.freeR : p.freeL; const ku = p.kpU + (r ? p.kuR : p.kuL), ko = p.kpO + (r ? p.koR : p.koL); kp.copy(pole).multiplyScalar(Math.max(0, 1 - Math.abs(ku) - Math.abs(ko))).addScaledVector(UP, ku).addScaledVector(cv3.set(0, 0, l.s), ko).addScaledVector(XF, r ? p.kxR : p.kxL).normalize(); const flr = r ? p.flR : p.flL, tu = (r ? p.tuR : p.tuL) * R, tuLift = 6 * Math.sin(tu) + 7 * Math.cos(tu) - 7;      // flr: height of what this foot stands on; tu: toes lifted, weight on the heel      // which way the knee points: over the toes when standing, up when lying or sitting
    for (let it = 0; it < 2; it++) {
      const fw = 11.6 - 11.6 * Math.cos(ph) + 7 * Math.sin(ph);                              // heel raise: the ankle swings up and forward over the ball of the foot
      A.set(fx + pole.x * fw, 1 + 11.6 * Math.sin(ph) + 7 * Math.cos(ph) + lift + flr + tuLift, l.s * fz + pole.z * fw);
      l.tg.copy(A); e.subVectors(A, H); const d = clamp(e.length(), minReach(L.thigh, L.shin, KNEE_MAX), L.thigh + L.shin - .2); e.normalize();      // the knee never folds past its range
      pp.copy(kp).addScaledVector(e, -kp.dot(e)).normalize();
      const be = Math.acos(clamp((L.thigh ** 2 + d * d - L.shin ** 2) / (2 * L.thigh * d), -1, 1));
      K.copy(H).addScaledVector(e, L.thigh * Math.cos(be)).addScaledVector(pp, L.thigh * Math.sin(be));
      A.copy(H).addScaledVector(e, d);
      ax.copy(pole).multiplyScalar(Math.cos(ph)).addScaledVector(UP, -Math.sin(ph)); az.copy(UP).multiplyScalar(Math.cos(ph)).addScaledVector(pole, Math.sin(ph));
      sv.subVectors(K, A).normalize(); const dors = Math.atan2(sv.dot(ax), sv.dot(az));       // how far the shin leans over the foot
      const kneeFlex = Math.PI - Math.acos(clamp((L.thigh ** 2 + L.shin ** 2 - d * d) / (2 * L.thigh * L.shin), -1, 1)), dMax = (22 + (ANKLE_DORSI - 22) * clamp(kneeFlex / (60 * R), 0, 1)) * R;      // the calf crosses the knee: straight knee, less ankle bend
      if (it === 0 && dors > dMax && free < .5) { ph += dors - dMax; continue; }     // past the ankle's range the heel lifts, as it does on a person
      break; }
    basis(qT, ay.subVectors(H, K), pp); basis(qS, ay.subVectors(K, A), pp);
    const qFree = free > .001 ? qT2.copy(qS).multiply(qS2.setFromAxisAngle(ZAX, -(r ? p.ankR : p.ankL) * R)) : null;      // a foot off the mat hangs from the shin at its own ankle angle
    basis(qF, az.copy(UP).multiplyScalar(Math.cos(ph)).addScaledVector(pole, Math.sin(ph)), K.copy(pole).multiplyScalar(Math.cos(ph)).addScaledVector(UP, -Math.sin(ph)));
    if (qFree) qF.slerp(qFree, free);
    if (tu > .001) qF.multiply(qS2.setFromAxisAngle(ZAX, tu));
    if (p.soles > .001) { basis(qF2, cv3.set(0, .45, l.s * .9), XF); qF.slerp(qF2, p.soles); }      // soles together: toes forward, each sole turned to face the other foot
    const kd = r ? p.kdR : p.kdL;
    if (kd > .001) {                                        // knee down, toes tucked: knee pinned to the mat, shin running back to the planted foot
      const fw = 11.6 - 11.6 * Math.cos(ph) + 7 * Math.sin(ph); K.set(p.knX, KNEE_Y, l.s * p.knZ); A.set(fx + pole.x * fw, 1 + 11.6 * Math.sin(ph) + 7 * Math.cos(ph) + lift, l.s * fz + pole.z * fw);
      basis(qT2, ay.subVectors(H, K), XF); basis(qS2, ay.subVectors(K, A), DN); qT.slerp(qT2, kd); qS.slerp(qS2, kd); }
    if (kn > .001) {                                        // kneeling with the foot released: knee on the mat under the hip, shin and the top of the foot along the mat.
      K.set(p.knX, KNEE_Y, l.s * p.knZ); A.set(p.knX - KN.back, KN.ankleY + 14 * Math.sin(Math.PI * kn), l.s * p.knZ);      // the shin lifts while the foot turns over, so the toes clear the mat
      basis(qT2, ay.subVectors(H, K), XF); basis(qS2, ay.subVectors(K, A), DN); basis(qF2, KN.up, KN.toe);
      qT.slerp(qT2, kn); qS.slerp(qS2, kn); qF.slerp(qF2, kn); }
    const bend = ph * (1 - kn); if (Math.abs(bend - l.heel) > 1e-4) { l.heel = bend; l.shoes.forEach(g => bendShoe(g, bend)); l.toes.rotation.z = bend; }      // toes stay on the floor while the foot rolls over the ball
    l.hip.quaternion.copy(qi.copy(qRoot).invert()).multiply(qT);
    l.kn.quaternion.copy(qi.copy(qT).invert()).multiply(qS);
    l.an.quaternion.copy(qi.copy(qS).invert()).multiply(qF);
  });
  arms.forEach(a => { a.sh.quaternion.copy(a.qs); a.el.quaternion.copy(a.qe); a.wr.quaternion.copy(a.qw); });
  // optional hand targets: two-bone IK from the shoulder, blended over the angle pose. Elbows bend back like elbows.
  // Floor rule: if any fingertip, thumb tip, wrist or elbow would end up below the mat surface, the hand is lifted until it clears.
  arms.forEach(a => { const r = a.s > 0, w = r ? p.ikR : p.ikL; a.miss = 0; root.updateMatrixWorld(true);
    chest.getWorldQuaternion(qRoot); a.wr.getWorldPosition(wFree); a.el.getWorldPosition(eFree); const wk = w;      // where the free arm has its wrist and elbow
    buildBody(a); push.set(0, 0, 0); pPush.set(0, 0, 0);
    // A free arm is left exactly as posed unless it would pass into the body; then it is solved like a placed arm and eased out of the way.
    const inFree = Math.max(bodyPen(wFree, 3.2), bodyPen(a.tips[1].getWorldPosition(sv), 1.7), bodyPen(eFree, 4.2)), guard = w < .001 ? clamp((inFree + 1.5) / 1.5, 0, 1) : 1; if (guard <= 0) return;
    for (let it = 0, lift = 0; it < 7; it++) {
      a.sh.getWorldPosition(H);
      A.set((r ? p.hRx : p.hLx) + (p.hipX + ox) * (1 - p.hW), Math.max(2.7, r ? p.hRy : p.hLy) + lift, (r ? p.hRz : p.hLz) + (p.hipZ + oz) * (1 - p.hW));
      { const hw = r ? p.hRhead : p.hLhead;                     // the hand travels from its body-side target to a target on the head, along a path a person would use:
        if (hw > .001) { head.localToWorld(cv3.set(r ? p.hRhx : p.hLhx, r ? p.hRhy : p.hLhy, r ? p.hRhz : p.hLhz));      // first straight up on its own side, clear of the body,
          const up = smoother(hw / .7), over = smoother((hw - .4) / .6), arc = Math.sin(Math.PI * hw) ** 2;                 // then across the top of the head: never across the face
          A.x += (cv3.x - A.x) * up + 15 * arc; A.y += (cv3.y - A.y) * up + 4 * arc; A.z += (cv3.z - A.z) * over + a.s * 6 * arc; } }
      { const ot = r ? p.onThighR : p.onThighL; if (ot > .001) { const lg = legs[r ? 0 : 1]; lg.hip.getWorldPosition(thA); lg.kn.getWorldPosition(thB); thA.lerp(thB, .72).add(cv3.set(-6.2, 11.4, 0)); A.lerp(thA, ot); } }      // resting on the thigh: measured from the leg as it is now
      A.lerpVectors(wFree, A, wk); a.tg.copy(A); A.add(push);
      { const near = minReach(L.ua, L.fa, ELBOW_MAX) + 4, ln = cv3.subVectors(A, H).length(); if (ln < near) A.addScaledVector(sv.set(1, .25, 0).applyQuaternion(qRoot).normalize(), near - ln); }      // a target too close to the shoulder is eased forward, so the arm never flips
      { const eo = r ? p.eoR : p.eoL; pole.set(-.9 * (1 - eo), .1 + .25 * eo, a.s * (.42 + .58 * eo)); pole.lerp(cv3.set(-.25, -1, a.s * .5), r ? p.edR : p.edL); if (wk < 1) pole.lerpVectors(cv3.subVectors(eFree, H).normalize(), pole, wk); pole.add(pPush); }      // elbow points back and a little out; "elbow out" for a hand on the head
      e.subVectors(A, H); const d = clamp(e.length(), minReach(L.ua, L.fa, ELBOW_MAX), L.ua + L.fa - .15); e.normalize();
      pp.copy(pole).addScaledVector(e, -pole.dot(e)).normalize();
      const be = Math.acos(clamp((L.ua ** 2 + d * d - L.fa ** 2) / (2 * L.ua * d), -1, 1));
      K.copy(H).addScaledVector(e, L.ua * Math.cos(be)).addScaledVector(pp, L.ua * Math.sin(be));
      for (let n = 0; n < 5 && K.y < 5; n++) { pole.y += .5; pp.copy(pole).addScaledVector(e, -pole.dot(e)).normalize(); K.copy(H).addScaledVector(e, L.ua * Math.cos(be)).addScaledVector(pp, L.ua * Math.sin(be)); }
      A.copy(H).addScaledVector(e, d);
      // Shoulder range. The upper arm, seen from the ribcage, may go at most SH_BACK behind the body and SH_ACROSS across it.
      // If the target would need more, the upper arm stops at the limit and the hand stops short of the target (the test reports it).
      sv.subVectors(K, H).normalize().applyQuaternion(qi.copy(qRoot).invert()); let lim = false;
      if (sv.x < -SH_BACK) { sv.x = -SH_BACK; lim = true; } if (-a.s * sv.z > SH_ACROSS) { sv.z = -a.s * SH_ACROSS; lim = true; }
      if (lim) { const k = Math.sqrt(Math.max(1e-6, 1 - sv.x * sv.x) / Math.max(1e-6, sv.y * sv.y + sv.z * sv.z)); if (sv.x === -SH_BACK) { sv.y *= k; sv.z *= k; } sv.normalize().applyQuaternion(qRoot);
        K.copy(H).addScaledVector(sv, L.ua); sv.subVectors(A, K).normalize();
        const cs = sv.dot(cv3.subVectors(H, K).normalize()), cmax = Math.cos((180 - ELBOW_MAX) * R);      // keep the elbow inside its range too
        if (cs > cmax) { sv.addScaledVector(cv3, -(cs - cmax) * 1.2).normalize(); } A.copy(K).addScaledVector(sv, L.fa); }
      fr.copy(pp).negate();                                    // the inside of the elbow faces away from where the elbow points: a twist reference that never degenerates
      basis(qT, ay.subVectors(H, K), fr); basis(qS, ay.subVectors(K, A), fr);
      a.sh.quaternion.copy(a.qs).slerp(qi.copy(qRoot).invert().multiply(qT), guard);
      a.el.quaternion.copy(a.qe).slerp(qi.copy(qT).invert().multiply(qS), guard);
      a.wr.quaternion.copy(a.qw);
      const pl = r ? p.plantR : p.plantL;                       // planted hand: palm flat on the mat, fingers forward, whatever the forearm is doing
      if (pl > .001) { a.sh.updateWorldMatrix(false, true); a.el.getWorldQuaternion(qT2); ax.set(0, 0, -a.s); if (p.plantWall > .5) ay.set(0, -1, 0); else ay.set(-Math.cos(4 * R), Math.sin(4 * R), 0); az.crossVectors(ax, ay);
        if (p.palmIn > .5) { az.set(0, 0, 1); ay.set(-.45, .89, 0); ax.crossVectors(ay, az); }      // palm facing in toward the middle, fingers pointing down and forward (holding the outside of something)      // on the mat: palm down, fingers forward; on a wall or frame: palm forward, fingers up
        qS.setFromRotationMatrix(M.makeBasis(ax, ay, az)); a.wr.quaternion.slerp(qi.copy(qT2).invert().multiply(qS), pl); wristLimit(a, 92); }
      a.sh.updateWorldMatrix(false, true);
      let low = 1e9; a.tips.forEach((g, i) => { low = Math.min(low, g.getWorldPosition(sv).y - (i < 5 ? 1.25 : i === 5 ? 2.6 : 4.4)); });
      // Body rule: neither the wrist nor the elbow may enter the trunk. The hand target is pushed out, the elbow is steered away.
      let pw1 = bodyPen(a.wr.getWorldPosition(sv), 3.2); if (pw1 > 0) push.addScaledVector(coreN, pw1 + .05);
      const ph1 = bodyPen(a.tips[1].getWorldPosition(sv), 1.7); if (ph1 > 0) { push.addScaledVector(coreN, ph1 + .05); pw1 = Math.max(pw1, ph1); }      // fingertips count too
      const pe1 = bodyPen(a.el.getWorldPosition(sv), 4.2); if (pe1 > 0) pPush.addScaledVector(coreN, .05 + pe1 * .3);
      a.miss = w > .99 ? a.wr.getWorldPosition(sv).distanceTo(cv3.copy(a.tg).add(push)) : 0;      // short of the (steered) target only when a joint limit stopped it
      if (low >= 0 && pw1 <= .02 && pe1 <= .05) break; if (low < 0) lift += -low + .05; }
    const hd = r ? p.holdR : p.holdL;                           // hand resting on the head: it continues the line of the forearm, laid onto the skull, palm toward it
    if (hd > .001) { a.sh.updateWorldMatrix(false, true); a.el.getWorldQuaternion(qT); a.wr.getWorldPosition(H);
      az.set(HC[0], HC[1], 0).applyMatrix4(head.matrixWorld).sub(H).normalize();             // from the wrist toward the centre of the skull
      ay.subVectors(a.el.getWorldPosition(cv3), H).normalize(); ay.addScaledVector(az, -ay.dot(az)).normalize();      // minus the finger direction: the forearm's line, flattened onto the skull
      az.multiplyScalar(-a.s); ax.crossVectors(ay, az);
      qS.setFromRotationMatrix(M.makeBasis(ax, ay, az)); a.wr.quaternion.slerp(qi.copy(qT).invert().multiply(qS), hd); wristLimit(a, 55); } });
  { const fl = Math.max((p.kneelR + p.kneelL) / 2, p.rest), hx = p.hipX + ox, lie = clamp(-p.pel / 90, 0, 1) * p.rest;      // contact shadow: under the feet when standing, under the whole body when it is on the mat
    shadow.position.x = (hx * .35 + 9) * (1 - fl) + (hx + 14 - 44 * lie) * fl; shadow.scale.set(66 + Math.abs(hx) * .6 * (1 - fl) + fl * (70 + 70 * lie), 30 + p.footZ * 2.2 + 8 * lie, 1); }
}
/* Balance. The centre of mass is computed from the standard body-segment mass fractions (Dempster: head and neck 8.1%, trunk
   49.7%, upper arm 2.8%, forearm 1.6%, hand 0.6%, thigh 10%, shank 4.65%, foot 1.45%, each at its own centre). The support point
   is the weighted centre of whatever is carrying weight (feet, balls of the feet, knees). The solver then moves the hips until
   the centre of mass sits exactly above that point: the pose decides the shape, the maths decides where the body must be. */
const COM = V3(), SUP = V3(), cv3 = V3();
const massAt = (obj, x, y, z, m) => COM.addScaledVector(cv3.set(x, y, z).applyMatrix4(obj.matrixWorld), m);
function centreOfMass(p0) { root.updateMatrixWorld(true); COM.set(0, 0, 0);
  massAt(head, 1.5, 11, 0, .081); massAt(chest, 0, 12, 0, .216); massAt(chest, 0, -4, 0, .0695); massAt(root, 0, 7, 0, .0695); massAt(root, -1, 1, 0, .142);
  arms.forEach(a => { massAt(a.sh, 0, -L.ua * .436, 0, .028); massAt(a.el, 0, -L.fa * .43, 0, .016); massAt(a.wr, 0, -6, 0, .006); });
  legs.forEach(l => { massAt(l.hip, 0, -L.thigh * .433, 0, .1); massAt(l.kn, 0, -L.shin * .433, 0, .0465); massAt(l.an, 5, -4, 0, .0145); });
  if (p0 && p0.load > 0) { arms.forEach(a => massAt(a.wr, 0, -7, 0, .043 * p0.load)); COM.multiplyScalar(1 / (1 + .086 * p0.load)); }      // a held weight is part of what has to be balanced
  return COM; }
function supportPoint(p) { let sx = 0, sz = 0, sw = 0; const add = (x, z, w) => { sx += x * w; sz += z * w; sw += w; };
  legs.forEach(l => { const r = l.s > 0, kn = r ? p.kneelR : p.kneelL, heel = r ? p.heelR : p.heelL, lift = r ? p.liftR : p.liftL, fx = r ? p.fxR : p.fxL;
    add(p.knX, l.s * p.knZ, 5 * (r ? p.kdR : p.kdL));                                                                  // a knee on the mat carries most of the weight
    const along = 5.5 + 6.1 * ramp(4, 20, heel), c = Math.cos(sto(p, r) * R), sn = Math.sin(sto(p, r) * R);                    // flat foot: mid-foot; heel up: ball of the foot
    add((fx + c * along) * (1 - kn) + (p.knX - KN.back - 15) * kn, l.s * stz(p, r) + l.s * sn * along * (1 - kn), r ? p.wR : p.wL); });
  return SUP.set(sx / Math.max(sw, 1e-6), 0, sz / Math.max(sw, 1e-6)); }
let balance = { x: 0, z: 0, err: 0 };
/* Resting on the mat. When a pose says rest (sitting, lying), the body is lowered until its lowest point touches the mat: the
   real surface of the pelvis and back is measured, so nothing sinks in and nothing hovers. The head is then laid down the same
   way: the neck angle is solved so the back of the head meets the mat (unless the pose holds the head up). */
function trunkLow() { root.updateMatrixWorld(true); const m = root.matrixWorld.elements; let lo = 1e9;
  [hipsG, shirtG].forEach(g => { const a = g.attributes.position.array; for (let i = 0; i < a.length; i += 3) { const y = m[1] * a[i] + m[5] * a[i + 1] + m[9] * a[i + 2] + m[13]; if (y < lo) lo = y; } });
  return lo; }
function apply(p, t) {
  shape(p, t);
  const hands = Math.max(p.plantR, p.plantL), w = p.bal * (1 - hands), sway = Math.sin(t * .9) * .35 * (1 - hands) * (1 - p.rest); let ox = 0, oz = 0, oy = 0, err = 0;
  if (w > .001) for (let it = 0; it < 14; it++) {                 // solve the hip position that puts the centre of mass over the support point
    place(p, ox, oz); centreOfMass(p); supportPoint(p);
    const dx = SUP.x + sway - COM.x, dz = SUP.z - COM.z; err = Math.hypot(dx, dz);
    if (err < .01) break; ox += dx * .9; oz += dz * .9; }
  const fx = ox * w + sway * (1 - w), fz = oz * w;
  if (p.rest > .001) { place(p, fx, fz); oy = (.12 + p.seat - trunkLow()) * p.rest; }
  if (w < .999 || oy) place(p, fx, fz, oy);                       // as hands, bottom or back take weight, the balance correction eases out
  if (p.rest > .5 && p.headUp < .5) { const pn = { ...p };        // lay the head down
    for (let it = 0; it < 4; it++) { root.updateMatrixWorld(true); const hb = cv3.set(HC[0] - .3, HC[1], 0).applyMatrix4(head.matrixWorld).y - 12.5; if (Math.abs(hb) < .05) break;
      pn.nec = clamp(pn.nec - hb / .3, -30, 45); bendNeck(pn); } }
  arms.forEach(skinArm);
  balance = { x: ox * w, z: oz * w, err: w > .999 ? err : 0 };
}

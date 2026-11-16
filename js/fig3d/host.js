/* Host: camera, framing, render loop and the small interface the app talks to (window.FIG).
   The app embeds this page in the player and drives it with the same clock as the rep counter: FIG.show(id) picks the move,
   FIG.drive(u, cycle, phase) says where in the repetition it is (0 = start position, 1 = end position). Without drive() the
   move loops by itself. FIG.thumb(id, w, h) returns a still picture for lists. With ?lab in the address the page shows a
   button for every move, for looking at them one by one. */
const QS = new URLSearchParams(location.search), LAB = QS.has('lab');
if (LAB) document.body.classList.add('lab');
const cam = { yaw: 0, pitch: 7, tYaw: 0, tPitch: 7, drag: null, lastUser: -1e9, over: null };
let cur = 'squat', now = 0, paused = null, moveT0 = 0, fade = null, drive = null, restU = 0, W = 300, Hpx = 300;
const stance = k => EX[k].stance || 'stand', FADE = .28, HOLD = 1, cv = renderer.domElement, tgt = V3(22, 96, 0), VIEW0 = [1, 22, 96, 0];
function frame(w, h) { W = w || innerWidth || 300; Hpx = h || innerHeight || 300; const asp = W / Hpx, Hh = Math.max(268, 190 / asp);
  renderer.setSize(W, Hpx, !w); camera.left = -Hh * asp / 2; camera.right = Hh * asp / 2; camera.top = Hh * .5; camera.bottom = -Hh * .5; camera.updateProjectionMatrix(); views.clear(); }
/* Camera control: one finger (or the mouse) turns the figure, a pinch or the wheel zooms, a double tap goes back to the move's
   best view. What the user chose is kept until they recentre or another move is shown. */
const ptrs = new Map(); let pinch = 0, lastTap = 0;
const recentre = () => { cam.held = false; cam.uZoom = 1; cam.lastUser = -1e9; };
cam.uZoom = 1; cam.zNow = 1; cam.held = false;
cv.addEventListener('pointerdown', ev => { ptrs.set(ev.pointerId, ev); try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
  if (ptrs.size === 1) { const t = performance.now(); if (t - lastTap < 320) { recentre(); lastTap = 0; cam.drag = null; return; } lastTap = t; cam.drag = { x: ev.clientX, y: ev.clientY, yaw: cam.tYaw, pitch: cam.tPitch, moved: false }; }
  else { cam.drag = null; const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / cam.uZoom; } });
cv.addEventListener('pointermove', ev => { if (!ptrs.has(ev.pointerId)) return; ptrs.set(ev.pointerId, ev);
  if (ptrs.size >= 2) { const [a, b] = [...ptrs.values()]; cam.uZoom = clamp(Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / (pinch || 1), .6, 3.2); cam.held = true; return; }
  if (!cam.drag) return; const dx = ev.clientX - cam.drag.x, dy = ev.clientY - cam.drag.y; if (Math.abs(dx) + Math.abs(dy) > 6) { cam.drag.moved = true; lastTap = 0; cam.held = true; }
  cam.tYaw = cam.drag.yaw - dx * .45; cam.tPitch = clamp(cam.drag.pitch + dy * .25, -4, 60); cam.lastUser = now; });
const endDrag = ev => { ptrs.delete(ev.pointerId); cam.drag = null; cam.lastUser = now; };
cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
cv.addEventListener('wheel', ev => { ev.preventDefault(); cam.uZoom = clamp(cam.uZoom * Math.exp(-ev.deltaY * .0015), .6, 3.2); cam.held = true; }, { passive: false });

/* The pose of a move. Catalogue moves are written as P(u, phase, cycle); on their own they loop with the usual rep timing. */
const REST = { breath: 0 };
function poseOf(k, t, d) { const x = EX[k];
  if (x.P) { if (d) return x.P(d.u, d.ph, d.cyc); const P = x.period || 5.2, c = Math.floor(t / P), ph = (((t % P) + P) % P) / P; return x.P(x.cont ? ph : x.period ? hold11(t) : rep(t), ph, c); }
  return x.pose(t); }
Object.values(EX).forEach(x => { if (x.P && !x.pose) x.pose = function (t) { return poseOf(Object.keys(EX).find(k => EX[k] === x), t, null); }; });

/* Framing. Every move frames itself: the body is posed at the start, middle and end of the move, the outline of all its joints
   (and the props it uses) is measured as the camera sees it, and the camera is centred and zoomed to hold it with a margin. */
const views = new Map(), fvr = V3(), fu = V3(), fp = V3();
function fitView(k, yaw, pitch) { const key = k + '|' + yaw + '|' + pitch; if (views.has(key)) return views.get(key);
  const x = EX[k], y = yaw * R, pi = pitch * R; fvr.set(Math.cos(y), 0, -Math.sin(y)); fu.set(-Math.sin(y) * Math.sin(pi), Math.cos(pi), -Math.cos(y) * Math.sin(pi));
  let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; const add = (pt, r) => { const a = pt.dot(fvr), b = pt.dot(fu); a0 = Math.min(a0, a - r); a1 = Math.max(a1, a + r); b0 = Math.min(b0, b - r); b1 = Math.max(b1, b + r); };
  const keep = cur; cur = k;
  (x.P ? [0, .5, 1] : [0, 1.3, 2.4]).forEach(u => { const p = full(x.P ? x.P(u, u * .5, 0) : x.pose(u)); apply(p, 0); scene.updateMatrixWorld(true);
    const f = x.focus;
    if (!f || f === 'head') add(fp.set(HC[0], HC[1], 0).applyMatrix4(head.matrixWorld), 15);
    if (f === 'head') { arms.forEach(a => { add(a.sh.getWorldPosition(fp), 9); add(a.wr.getWorldPosition(fp), 4); }); add(chest.getWorldPosition(fp), 12); return; }
    if (f === 'hands') { arms.forEach(a => { add(a.wr.getWorldPosition(fp), 12); add(a.el.getWorldPosition(fp), 5); a.tips.forEach(g => add(g.getWorldPosition(fp), 4)); }); return; }
    if (f === 'feet') { legs.forEach(l => { add(l.an.getWorldPosition(fp), 16); add(l.kn.getWorldPosition(fp), 6); }); return; }
    add(root.getWorldPosition(fp), 13); add(chest.getWorldPosition(fp), 14);
    arms.forEach(a => { add(a.sh.getWorldPosition(fp), 7); add(a.el.getWorldPosition(fp), 6); add(a.wr.getWorldPosition(fp), 5); a.tips.forEach(g => add(g.getWorldPosition(fp), 3)); });
    legs.forEach(l => { add(l.kn.getWorldPosition(fp), 8); add(l.an.getWorldPosition(fp), 7); add(fp.set(15, -6, 0).applyMatrix4(l.an.matrixWorld), 5); }); });
  if (!x.focus) { add(fp.set((a0 + a1) / 2 * fvr.x, 0, (a0 + a1) / 2 * fvr.z), 4); propPoints(x).forEach(q => add(fp.set(q[0], q[1], q[2]), 2)); }
  cur = keep;
  const asp = W / Hpx, Hh = Math.max(268, 190 / asp), m = x.focus ? 1.12 : 1.16, ca = (a0 + a1) / 2; let zoom = Math.min(Hh * asp / ((a1 - a0) * m), Hh / ((b1 - b0) * m)), cb = (b0 + b1) / 2;
  if (!LAB && !x.focus) { const g = stance(k) === 'stand' && !x.mat ? .075 : .12, fb = fp.set(fvr.x * ca, 0, fvr.z * ca).dot(fu);      // inside the app the floor sits at a fixed height above the bottom edge, on the ground of the scene behind
    zoom = Math.min(Hh * asp / ((a1 - a0) * 1.14), Hh * (1 - g) / ((b1 - fb) * 1.16)); cb = fb + Hh / zoom * (.5 - g); }
  const v = [zoom, fvr.x * ca + fu.x * cb, fu.y * cb, fvr.z * ca + fu.z * cb]; views.set(key, v); return v; }
const viewOf = k => cam.over || (EX[k].view && !EX[k].P ? EX[k].view : fitView(k, EX[k].yaw || 0, EX[k].pitch ?? 7));
function go(k) { if (!EX[k] || (k === cur && !fade)) return; fade = { to: k, t0: now, swapped: false }; if (LAB) [...nav.children].forEach(b => b.classList.toggle('on', b.dataset.k === k)); }
function showMove(k) { cur = k; moveT0 = now; const x = EX[k], pi = x.pitch ?? 7, yw = x.yaw || 0; Object.assign(cam, { yaw: yw, tYaw: yw, pitch: pi, tPitch: pi, lastUser: -1e9, held: false, uZoom: 1, zNow: 1 });
  const vw = viewOf(k); camera.zoom = vw[0]; tgt.set(vw[1], vw[2], vw[3]); camera.updateProjectionMatrix(); }
const moveTime = () => Math.max(0, now - moveT0 - HOLD);
function aim() { const y = cam.yaw * R, pi = cam.pitch * R;
  camera.position.set(tgt.x + Math.sin(y) * Math.cos(pi) * CAM_D, tgt.y + Math.sin(pi) * CAM_D, tgt.z + Math.cos(y) * Math.cos(pi) * CAM_D);
  camera.lookAt(tgt); camera.updateMatrixWorld(); camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  HIPC.set(-1, 1, 0).applyMatrix4(root.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
  HEADC.set(HC[0] + 1.2, HC[1] - 1.5, 0).applyMatrix4(head.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
  renderer.render(scene, camera); }
function draw(t, dt) {
  if (fade) { const el = now - fade.t0; if (!fade.swapped && el >= FADE) { showMove(fade.to); fade.swapped = true; }
    cv.style.opacity = el < FADE ? 1 - smoother(el / FADE) : smoother((el - FADE) / FADE); if (el >= 2 * FADE) { fade = null; cv.style.opacity = 1; } }
  matG.visible = LAB || stance(cur) !== 'stand' || !!EX[cur].mat; disc.visible = LAB;
  const pNow = full(poseOf(cur, moveTime(), drive)); if (drive) pNow.breath += restU; apply(pNow, t); syncProps(pNow);
  const yw = EX[cur].yaw || 0;
  if (!cam.drag && !cam.held) { const d = ((yw - cam.tYaw) % 360 + 540) % 360 - 180, k = 1 - Math.exp(-dt * 2.2); cam.tYaw += d * k; cam.tPitch += ((EX[cur].pitch ?? 7) - cam.tPitch) * k; }
  const k = dt ? 1 - Math.exp(-dt * 10) : 1; cam.yaw += (cam.tYaw - cam.yaw) * k; cam.pitch += (cam.tPitch - cam.pitch) * k;
  const vw = viewOf(cur), kv = dt ? 1 - Math.exp(-dt * 3) : 1;
  cam.zNow += (cam.uZoom - cam.zNow) * k; camera.zoom += (vw[0] * cam.zNow - camera.zoom) * (cam.held ? k : kv); tgt.x += (vw[1] - tgt.x) * kv; tgt.y += (vw[2] - tgt.y) * kv; tgt.z += (vw[3] - tgt.z) * kv; camera.updateProjectionMatrix();
  aim(); }
const nav = document.getElementById('nav');
if (LAB) Object.entries(EX).forEach(([k, x]) => { const b = document.createElement('button'); b.textContent = x.label || k; b.onclick = () => go(k); b.dataset.k = k; nav.append(b); });
addEventListener('resize', () => frame()); frame();
cur = EX[QS.get('ex')] ? QS.get('ex') : Object.keys(EX)[0]; showMove(cur);
let last = performance.now(), live = !QS.has('still');
function loop(ms) { const dt = Math.min(.05, (ms - last) / 1000); last = ms; if (!paused && live) { now += dt; draw(now, dt); } requestAnimationFrame(loop); }
requestAnimationFrame(loop);
window.FIG = {
  has: k => !!EX[k], list: () => Object.keys(EX).filter(k => EX[k].P),
  show(k, instant) { if (!EX[k]) return false; drive = null; if (instant || k === cur) { if (k !== cur) showMove(k); } else go(k); return true; },
  drive(u, cyc, ph) { drive = { u, cyc: cyc || 0, ph: ph || 0 }; },      // position inside the repetition, from the app's own clock
  recentre, moved: () => cam.held,
  free() { if (drive) { drive = null; moveT0 = now; } },      // let the move loop by itself, starting from its start position
  size: () => frame(),
  /* a still picture of a move at its end position, for lists */
  thumb(k, w, h, type) { if (!EX[k]) return null; const keepCur = cur, keepLive = live; live = false; frame(w, h); cur = k; const x = EX[k], yw = x.yaw || 0, pi = x.pitch ?? 7;
    matG.visible = LAB || stance(k) !== 'stand' || !!x.mat; disc.visible = LAB; const p = full(x.P ? x.P(x.tu ?? 1, .25, 0) : x.pose(x.tt ?? 2)); const vw = fitView(k, yw, pi); apply(p, 0); syncProps(p); camera.zoom = vw[0]; tgt.set(vw[1], vw[2], vw[3]); camera.updateProjectionMatrix(); cam.yaw = yw; cam.pitch = pi; aim();
    const url = cv.toDataURL(type || 'image/png'); cur = keepCur; live = keepLive; return url; },
};

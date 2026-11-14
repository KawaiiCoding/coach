/* Minimal WebGL renderer: Lambert shading with a hemisphere fill, per-vertex colour, alpha,
   emissive glow, colour-ID picking and an orbit camera. No dependencies. */
const GL = (() => {
  const VS = `attribute vec3 aPos; attribute vec3 aNrm; attribute vec3 aCol;
    uniform mat4 uMVP, uModel; uniform mat3 uNrm;
    varying vec3 vN, vC, vP;
    void main(){ vN = normalize(uNrm * aNrm); vC = aCol; vP = (uModel * vec4(aPos,1.0)).xyz; gl_Position = uMVP * vec4(aPos,1.0); }`;
  const FS = `precision mediump float;
    varying vec3 vN, vC, vP;
    uniform vec3 uTint, uEmis, uLight, uEye; uniform float uAlpha, uMix, uPick; uniform vec3 uId;
    void main(){
      if (uPick > 0.5) { gl_FragColor = vec4(uId, 1.0); return; }
      vec3 n = normalize(vN); vec3 l = normalize(uLight);
      float d = max(dot(n, l), 0.0);
      vec3 l2 = normalize(vec3(-0.6, 0.3, -0.7)); float d2 = max(dot(n, l2), 0.0);
      float hemi = 0.6 + 0.4 * n.y;
      vec3 base = mix(vC, uTint, uMix);
      vec3 v = normalize(uEye - vP); vec3 h = normalize(l + v);
      float spec = pow(max(dot(n, h), 0.0), 24.0) * 0.22;
      float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.12;
      vec3 c = base * (0.5 * hemi + 0.62 * d + 0.3 * d2) + spec + rim + uEmis * (0.6 + 0.4 * d);
      gl_FragColor = vec4(c, uAlpha); }`;

  /* ---- tiny matrix helpers (column-major) ---- */
  const m4 = {
    persp(f, a, n, fr) { const t = 1 / Math.tan(f / 2); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fr + n) / (n - fr), -1, 0, 0, 2 * fr * n / (n - fr), 0]; },
    look(e, c, u) {
      const z = nrm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = nrm(cross(u, z)), y = cross(z, x);
      return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
    },
    mul(a, b) { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; },
    id() { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }
  };
  const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  /* ---- geometry builders: each returns {pos, nrm, col, idx} ---- */
  function frames(pts) {
    // parallel-transport frames along a polyline
    const T = [], N = [], B = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      T.push(nrm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]));
    }
    let n = Math.abs(T[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    n = nrm(cross(cross(T[0], n), T[0]));
    for (let i = 0; i < pts.length; i++) {
      if (i) { const t = T[i]; n = nrm(cross(cross(t, n), t)); }
      N.push(n); B.push(cross(T[i], n));
    }
    return { T, N, B };
  }
  function tube(pts, radii, colors, Q = 10, ry = 1) {
    const { N, B } = frames(pts), pos = [], nr = [], col = [], idx = [];
    for (let i = 0; i < pts.length; i++) {
      const P = pts[i], r = radii[i], c = colors[i], n = N[i], b = B[i];
      for (let j = 0; j <= Q; j++) {
        const a = j / Q * Math.PI * 2, cs = Math.cos(a) * r, sn = Math.sin(a) * r * ry;
        pos.push(P[0] + n[0] * cs + b[0] * sn, P[1] + n[1] * cs + b[1] * sn, P[2] + n[2] * cs + b[2] * sn);
        const nn = nrm([n[0] * cs + b[0] * sn, n[1] * cs + b[1] * sn, n[2] * cs + b[2] * sn]);
        nr.push(nn[0], nn[1], nn[2]); col.push(c[0], c[1], c[2]);
      }
    }
    for (let i = 0; i < pts.length - 1; i++) for (let j = 0; j < Q; j++) { const a = i * (Q + 1) + j, b = a + Q + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    // caps
    for (const end of [0, pts.length - 1]) {
      const P = pts[end], c = colors[end], ci = pos.length / 3;
      pos.push(P[0], P[1], P[2]); const t = end ? nrm([P[0] - pts[end - 1][0], P[1] - pts[end - 1][1], P[2] - pts[end - 1][2]]) : nrm([pts[0][0] - pts[1][0], pts[0][1] - pts[1][1], pts[0][2] - pts[1][2]]);
      nr.push(t[0], t[1], t[2]); col.push(c[0], c[1], c[2]);
      for (let j = 0; j < Q; j++) { const a = end * (Q + 1) + j; end ? idx.push(ci, a + 1, a) : idx.push(ci, a, a + 1); }
    }
    return { pos, nrm: nr, col, idx };
  }
  function sphere(c, r, col, seg = 12, sc = [1, 1, 1]) {
    const pos = [], nr = [], cl = [], idx = [];
    for (let i = 0; i <= seg; i++) { const ph = i / seg * Math.PI; for (let j = 0; j <= seg; j++) { const th = j / seg * Math.PI * 2; const n = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
      pos.push(c[0] + n[0] * r * sc[0], c[1] + n[1] * r * sc[1], c[2] + n[2] * r * sc[2]); const nn = nrm([n[0] / sc[0], n[1] / sc[1], n[2] / sc[2]]); nr.push(nn[0], nn[1], nn[2]); cl.push(col[0], col[1], col[2]); } }
    for (let i = 0; i < seg; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    return { pos, nrm: nr, col: cl, idx };
  }
  function cyl(a, b, r, col, Q = 10) { return tube([a, b], [r, r], [col, col], Q); }
  function box(cx, cy, cz, w, h, d, col, rx = 0) {
    const pos = [], nr = [], cl = [], idx = [], c = Math.cos(rx), s = Math.sin(rx);
    const rot = ([x, y, z]) => [x, y * c - z * s, y * s + z * c];
    const faces = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 1, 0], [0, 0, -1]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [0, 0, -1], [1, 0, 0]], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]]];
    for (const [n, u, v] of faces) {
      const base = pos.length / 3, nn = rot(n);
      for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const p = rot([n[0] * w / 2 + u[0] * su * w / 2 + v[0] * sv * w / 2, n[1] * h / 2 + u[1] * su * h / 2 + v[1] * sv * h / 2, n[2] * d / 2 + u[2] * su * d / 2 + v[2] * sv * d / 2]);
        pos.push(cx + p[0], cy + p[1], cz + p[2]); nr.push(nn[0], nn[1], nn[2]); cl.push(col[0], col[1], col[2]);
      }
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    return { pos, nrm: nr, col: cl, idx };
  }
  function merge(list) {
    const pos = [], nr = [], col = [], idx = []; let off = 0;
    for (const g of list) { pos.push(...g.pos); nr.push(...g.nrm); col.push(...g.col); for (const i of g.idx) idx.push(i + off); off += g.pos.length / 3; }
    return { pos, nrm: nr, col, idx };
  }

  /* ---- renderer ---- */
  function create(canvas) {
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: true });
    if (!gl) return null;
    const prog = gl.createProgram();
    for (const [t, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) { const sh = gl.createShader(t); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(prog, sh); }
    gl.linkProgram(prog); gl.useProgram(prog);
    const A = { pos: gl.getAttribLocation(prog, 'aPos'), nrm: gl.getAttribLocation(prog, 'aNrm'), col: gl.getAttribLocation(prog, 'aCol') };
    const U = {}; for (const n of ['uMVP', 'uModel', 'uNrm', 'uTint', 'uEmis', 'uLight', 'uEye', 'uAlpha', 'uMix', 'uPick', 'uId']) U[n] = gl.getUniformLocation(prog, n);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); const u32 = !!gl.getExtension('OES_element_index_uint');
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const meshes = [];
    function mesh(geom, opt = {}) {
      const m = { n: geom.idx.length, alpha: 1, emis: [0, 0, 0], tint: [0, 0, 0], mix: 0, id: 0, data: null, pulse: 0, cull: true, ...opt, bufs: {} };
      m.bufs.pos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, m.bufs.pos); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.pos), gl.STATIC_DRAW);
      m.bufs.nrm = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, m.bufs.nrm); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.nrm), gl.STATIC_DRAW);
      m.bufs.col = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, m.bufs.col); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.col), gl.STATIC_DRAW);
      m.bufs.idx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.bufs.idx); const big = u32 && geom.pos.length / 3 > 65535; m.itype = big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT; gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, big ? new Uint32Array(geom.idx) : new Uint16Array(geom.idx), gl.STATIC_DRAW);
      let cx = 0, cy = 0, cz = 0; const n = geom.pos.length / 3; for (let i = 0; i < n; i++) { cx += geom.pos[i * 3]; cy += geom.pos[i * 3 + 1]; cz += geom.pos[i * 3 + 2]; } m.center = [cx / n, cy / n, cz / n];
      meshes.push(m); return m;
    }
    function clear() { for (const m of meshes) for (const k in m.bufs) gl.deleteBuffer(m.bufs[k]); meshes.length = 0; }

    const cam = { yaw: 0.3, pitch: 0.12, dist: 660, target: [0, 150, 0], fov: 32 * Math.PI / 180 };
    let VP = m4.id(), eye = [0, 0, 1];
    function resize() { const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight; if (canvas.width !== w * dpr | 0 || canvas.height !== h * dpr | 0) { canvas.width = w * dpr; canvas.height = h * dpr; } }
    function camera() {
      const c = cam, cp = Math.cos(c.pitch);
      eye = [c.target[0] + c.dist * Math.sin(c.yaw) * cp, c.target[1] + c.dist * Math.sin(c.pitch), c.target[2] + c.dist * Math.cos(c.yaw) * cp];
      const P = m4.persp(c.fov, canvas.width / canvas.height, 5, 4000), V = m4.look(eye, c.target, [0, 1, 0]);
      VP = m4.mul(P, V);
    }
    function drawMesh(m, pick) {
      gl.bindBuffer(gl.ARRAY_BUFFER, m.bufs.pos); gl.enableVertexAttribArray(A.pos); gl.vertexAttribPointer(A.pos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.bufs.nrm); gl.enableVertexAttribArray(A.nrm); gl.vertexAttribPointer(A.nrm, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.bufs.col); gl.enableVertexAttribArray(A.col); gl.vertexAttribPointer(A.col, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.bufs.idx);
      gl.uniform3fv(U.uTint, m.tint); gl.uniform1f(U.uMix, m.mix); gl.uniform1f(U.uAlpha, m.alpha);
      const e = m.pulse ? m.emis.map(v => v * (0.7 + 0.3 * Math.sin(Date.now() / 180))) : m.emis;
      gl.uniform3fv(U.uEmis, e); gl.uniform1f(U.uPick, pick ? 1 : 0);
      gl.uniform3f(U.uId, (m.id & 255) / 255, ((m.id >> 8) & 255) / 255, ((m.id >> 16) & 255) / 255);
      if (m.cull) gl.enable(gl.CULL_FACE); else gl.disable(gl.CULL_FACE);
      gl.drawElements(gl.TRIANGLES, m.n, m.itype || gl.UNSIGNED_SHORT, 0);
    }
    function render(bg = [0.055, 0.1, 0.15]) {
      resize(); camera();
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(U.uMVP, false, VP); gl.uniformMatrix4fv(U.uModel, false, m4.id()); gl.uniformMatrix3fv(U.uNrm, false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
      gl.uniform3f(U.uLight, 0.4, 0.8, 0.5); gl.uniform3fv(U.uEye, eye);
      gl.depthMask(true);
      for (const m of meshes) if (m.alpha >= 0.999 && !m.hidden) drawMesh(m, false);
      const tr = meshes.filter(m => m.alpha < 0.999 && !m.hidden && m.alpha > 0.01);
      tr.sort((a, b) => dist2(b.center, eye) - dist2(a.center, eye));
      gl.depthMask(false); for (const m of tr) drawMesh(m, false); gl.depthMask(true);
    }
    const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    function pick(x, y) {
      // x, y in CSS pixels relative to the canvas
      resize(); camera();
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(U.uMVP, false, VP); gl.disable(gl.BLEND);
      for (const m of meshes) if (m.id && !m.hidden && !m.nopick) drawMesh(m, true);
      const dpr = canvas.width / canvas.clientWidth, px = new Uint8Array(4);
      gl.readPixels(Math.round(x * dpr), Math.round(canvas.height - y * dpr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      gl.enable(gl.BLEND);
      const id = px[0] | (px[1] << 8) | (px[2] << 16);
      return id ? meshes.find(m => m.id === id) : null;
    }
    function project(p) { // world -> CSS px
      const v = [VP[0] * p[0] + VP[4] * p[1] + VP[8] * p[2] + VP[12], VP[1] * p[0] + VP[5] * p[1] + VP[9] * p[2] + VP[13], 0, VP[3] * p[0] + VP[7] * p[1] + VP[11] * p[2] + VP[15]];
      return [(v[0] / v[3] * 0.5 + 0.5) * canvas.clientWidth, (0.5 - v[1] / v[3] * 0.5) * canvas.clientHeight];
    }
    return { gl, cam, mesh, clear, render, pick, project, meshes, eye: () => eye };
  }
  return { create, tube, sphere, cyl, box, merge, nrm, cross };
})();

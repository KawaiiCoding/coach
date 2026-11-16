/* Look: renderer, scene, flat two-tone materials with outlines. Shared helpers. */
/* Prototype: one rigged 3D figure, drawn flat so it matches the 2D illustrations, that can be turned by dragging. */
THREE.ColorManagement.enabled = false;                 // colours pass straight through, exactly the 2D hex values
const R = Math.PI / 180, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smoother = t => { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const ramp = (a, b, u) => { const t = clamp((u - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, stencil: true, preserveDrawingBuffer: true });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
const CAM_D = 600;

/* ---------- look: flat two-tone colour with a soft edge; the light is fixed to the camera, so every view is lit like the 2D art ---------- */
const LIGHT = V3(-.5, .74, .45).normalize();
const HIPC = V3(), HEADC = V3();                               // view-space centres of the pelvis and the head, refreshed every frame
function toon(col, shade, outline, cen, r0 = 0, r1 = 0) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color(col) }, uS: { value: new THREE.Color(shade) }, uL: { value: LIGHT }, uCen: { value: cen || HIPC }, uR: { value: new THREE.Vector2(r0, r1) } },
    vertexShader: `uniform vec3 uCen; uniform vec2 uR; varying vec3 vN; varying float vD;
      void main(){ vec3 n = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.);
        if (uR.y > 0.) { float w = 1. - smoothstep(uR.x, uR.y, distance(mv.xyz, uCen)); n = normalize(mix(n, normalize(mv.xyz - uCen), w)); }   // near the centre, shade as one rounded mass
        vN = n; vD = -mv.z - ${CAM_D}.; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uC, uS, uL; varying vec3 vN; varying float vD;
      void main(){ vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
        float d = dot(n, uL), k = smoothstep(-.1, .14, d);
        vec3 c = mix(uS, uC, k);
        c = mix(c, uC + (vec3(1.) - uC) * .16, smoothstep(.8, .98, d) * .55);      // soft sheen where the light lands
        c *= 1. - .05 * smoothstep(.1, -.9, n.y) * k;                                // undersides sit a touch darker
        c *= 1. - clamp(vD / 30., -1., 1.) * .045;                                   // the far arm and leg fall back slightly
        gl_FragColor = vec4(c, 1.); }`,
  });
  m.userData.outline = outline || new THREE.Color(shade).multiplyScalar(.8).getHex();
  return m;
}
const PAL = {
  top: toon('#E8793F', '#CF6630'), trim: toon('#D46A33', '#BC5A29'), leg: toon('#2F3439', '#23282C', 0x16191c), hip: toon('#2F3439', '#23282C', 0x16191c, HIPC, 17, 36), face: toon('#F1C4A2', '#E0AB8A', 0xC48C6A, HEADC, 200, 201), skin: toon('#F1C4A2', '#E0AB8A', 0xC48C6A),
  hair: toon('#3A2D27', '#2A201C', 0x1A1412), shoe: toon('#FFFFFF', '#E6E0D9', 0xC4BCB2), sole: toon('#C9CED4', '#B1B7BE', 0x9BA1A8),
  cuff: toon('#3B4147', '#2C3136'), eye: toon('#2A1E19', '#2A1E19'), mouth: toon('#B5745C', '#B5745C'), cheek: toon('#F2B39A', '#EDA890'),
};
/* Outlines are drawn per body group (torso, head, each arm, each leg) through the stencil buffer: a group never draws a
   line over itself, so there are no seams at elbows, wrists or the waist, only a clean line round each whole limb. */
const G = { torso: 11, legR: 10, legL: 9, armR: 16, armL: 32, head: 64, hair: 128 };
const MASK = { 11: 8, 10: 6, 9: 5 };      // torso skips anything in the lower-body family; a leg skips itself and the torso, but not the other leg
const bodyCache = new Map(), lineCache = new Map();
function bodyMat(mat, gid, dbl) {
  const key = mat.uuid + gid + (dbl ? 'd' : '');
  if (!bodyCache.has(key)) { const m = mat.clone(); m.uniforms.uL.value = LIGHT; m.uniforms.uCen.value = mat.uniforms.uCen.value; Object.assign(m, { stencilWrite: true, stencilRef: gid, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp, side: dbl ? THREE.DoubleSide : THREE.FrontSide }); bodyCache.set(key, m); }
  return bodyCache.get(key);
}
function lineMat(col, w, gid) {
  const key = col + '_' + w + '_' + gid;
  if (!lineCache.has(key)) lineCache.set(key, new THREE.ShaderMaterial({
    side: THREE.BackSide, uniforms: { uC: { value: new THREE.Color(col) }, uW: { value: w } },
    stencilWrite: true, stencilRef: gid, stencilFunc: THREE.NotEqualStencilFunc, stencilFuncMask: MASK[gid] || 255, stencilWriteMask: 0,
    vertexShader: `uniform float uW; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * uW, 1.); }`,
    fragmentShader: `uniform vec3 uC; void main(){ gl_FragColor = vec4(uC, 1.); }`,
  }));
  return lineCache.get(key);
}
function part(geo, mat, gid, parent, w = .4, dbl = false) {
  const g = new THREE.Group(), m = new THREE.Mesh(geo, bodyMat(mat, gid, dbl));
  m.renderOrder = 0; g.add(m);
  if (w) { const o = new THREE.Mesh(geo, lineMat(mat.userData.outline, w, gid)); o.renderOrder = 1; g.add(o); }
  parent.add(g);
  return g;
}

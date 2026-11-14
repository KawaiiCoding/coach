/* Minimal glTF-binary (.glb) loader: meshes with POSITION / NORMAL / indices, node transforms, base colours.
   Returns [{name, pos, nrm, idx, col}] in model space. Enough for anatomy models exported from Blender (Z-Anatomy, BodyParts3D). */
const GLB = (() => {
  const T = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  function parse(buf) {
    const dv = new DataView(buf); if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('Not a GLB file');
    let off = 12, json = null, bin = null;
    while (off < buf.byteLength) { const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true); const chunk = buf.slice(off + 8, off + 8 + len);
      if (type === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(chunk)); else if (type === 0x004E4942) bin = chunk; off += 8 + len; }
    const acc = i => { const a = json.accessors[i], bv = json.bufferViews[a.bufferView], Ty = T[a.componentType], n = N[a.type], stride = bv.byteStride || n * Ty.BYTES_PER_ELEMENT;
      const base = (bv.byteOffset || 0) + (a.byteOffset || 0);
      if (stride === n * Ty.BYTES_PER_ELEMENT && base % Ty.BYTES_PER_ELEMENT === 0) return new Ty(bin, base, a.count * n); // tightly packed: one view
      const out = new Float64Array(a.count * n), dv2 = new DataView(bin), get = { 5120: 'getInt8', 5121: 'getUint8', 5122: 'getInt16', 5123: 'getUint16', 5125: 'getUint32', 5126: 'getFloat32' }[a.componentType], sz = Ty.BYTES_PER_ELEMENT;
      for (let k = 0; k < a.count; k++) for (let j = 0; j < n; j++) out[k * n + j] = dv2[get](base + k * stride + j * sz, true); return out; };
    const mats = (json.materials || []).map(m => (m.pbrMetallicRoughness && m.pbrMetallicRoughness.baseColorFactor) || null);
    const out = [];
    const mat4 = n => { if (n.matrix) return n.matrix; const t = n.translation || [0, 0, 0], r = n.rotation || [0, 0, 0, 1], s = n.scale || [1, 1, 1], [x, y, z, w] = r;
      const m = [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0, 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0, 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0, t[0], t[1], t[2], 1];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) m[i * 4 + j] *= s[i]; return m; };
    const mul = (a, b) => { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; };
    const ap = (m, p, w) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12] * w, m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13] * w, m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14] * w];
    const visit = (ni, pm, pname) => { const n = json.nodes[ni], m = mul(pm, mat4(n)), name = n.name || pname || '';
      if (n.mesh !== undefined) for (const pr of json.meshes[n.mesh].primitives) { if (pr.mode !== undefined && pr.mode !== 4) continue; if (pr.attributes.POSITION === undefined) continue;
        const P = acc(pr.attributes.POSITION), Nn = pr.attributes.NORMAL !== undefined ? acc(pr.attributes.NORMAL) : null, idx = pr.indices !== undefined ? Array.from(acc(pr.indices)) : [...Array(P.length / 3).keys()];
        const pos = [], nrm = [], col = pr.material !== undefined && mats[pr.material] ? mats[pr.material].slice(0, 3) : [0.62, 0.25, 0.22];
        for (let k = 0; k < P.length / 3; k++) { const p = ap(m, [P[k * 3], P[k * 3 + 1], P[k * 3 + 2]], 1); pos.push(...p); if (Nn) { const q = ap(m, [Nn[k * 3], Nn[k * 3 + 1], Nn[k * 3 + 2]], 0); const l = Math.hypot(...q) || 1; nrm.push(q[0] / l, q[1] / l, q[2] / l); } }
        if (!Nn) { for (let k = 0; k < pos.length; k++) nrm.push(0); for (let k = 0; k < idx.length; k += 3) { const a = idx[k] * 3, b = idx[k + 1] * 3, c = idx[k + 2] * 3; const u = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], v = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
          const fn = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; for (const q of [a, b, c]) { nrm[q] += fn[0]; nrm[q + 1] += fn[1]; nrm[q + 2] += fn[2]; } }
          for (let k = 0; k < nrm.length; k += 3) { const l = Math.hypot(nrm[k], nrm[k + 1], nrm[k + 2]) || 1; nrm[k] /= l; nrm[k + 1] /= l; nrm[k + 2] /= l; } }
        out.push({ name: (json.meshes[n.mesh].name || name) + ' ' + name, pos, nrm, idx, col }); }
      for (const c of n.children || []) visit(c, m, name); };
    const scene = json.scenes[json.scene || 0]; const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    for (const r of scene.nodes) visit(r, I, '');
    return out;
  }
  /* Map mesh names to the app's muscle ids. Patterns are tried in order; the first match wins. */
  const PATS = [[/trapezius.*(upper|superior|descend)|upper.*trapez/, 'upTrap'], [/trapezius.*(lower|inferior|ascend)|lower.*trapez/, 'trapLow'], [/trapez/, 'trapMid'], [/levator scap/, 'levator'], [/rhomboid/, 'rhomboid'], [/serratus anterior/, 'serratus'],
    [/pectoralis minor/, 'pecMinor'], [/pector/, 'pecMajor'], [/deltoid.*(post|spinal)|posterior deltoid/, 'deltPost'], [/deltoid/, 'deltAnt'], [/supraspin/, 'supra'], [/infraspin|teres minor/, 'infra'], [/subscap/, 'subscap'], [/teres major/, 'teresMaj'], [/latissimus/, 'lats'],
    [/coracobrach/, 'coraco'], [/biceps femoris/, 'bicFem'], [/biceps/, 'biceps'], [/brachialis/, 'brachialis'], [/triceps/, 'triceps'], [/flexor carpi|flexor digitorum superficialis|palmaris|pronator teres|flexor pollicis longus|flexor digitorum profundus/, 'wristFlex'], [/extensor carpi|extensor digitorum|brachioradialis|extensor pollicis|supinator|extensor indicis|abductor pollicis longus/, 'wristExt'],
    [/sternocleido/, 'scm'], [/scalen/, 'scalenes'], [/longus colli|longus capitis/, 'longus'], [/splenius|semispinalis/, 'splenius'], [/rectus capitis|obliquus capitis/, 'subocc'], [/masseter|temporalis|pterygoid/, 'jaw'],
    [/rectus abdominis/, 'abs'], [/external oblique|obliquus externus/, 'oblExt'], [/internal oblique|obliquus internus/, 'oblInt'], [/transvers.*abdom/, 'transv'], [/erector|iliocostal|longissimus|spinalis/, 'erector'], [/multifid/, 'multifidus'], [/quadratus lumb/, 'quadlum'],
    [/psoas/, 'psoas'], [/iliacus/, 'iliacus'], [/rectus femoris/, 'rectFem'], [/tensor fasc|iliotibial/, 'tfl'], [/sartorius/, 'sartorius'], [/gluteus maximus/, 'gmax'], [/gluteus medius/, 'gmed'], [/gluteus minimus/, 'gmin'], [/piriformis|obturator|gemellus|quadratus femoris/, 'pirif'],
    [/adductor magnus/, 'addMag'], [/adductor|pectineus/, 'addLong'], [/gracilis/, 'gracilis'], [/vastus lateralis/, 'vlat'], [/vastus medialis/, 'vmed'], [/vastus intermedius/, 'vint'], [/semitend|semimemb/, 'medHams'],
    [/gastrocn/, 'gastroc'], [/soleus/, 'soleus'], [/tibialis anterior/, 'tibAnt'], [/tibialis posterior/, 'tibPost'], [/fibularis|peroneus|peroneal/, 'peroneals'], [/extensor digitorum longus|extensor hallucis/, 'toeExt'], [/flexor digitorum longus|flexor hallucis/, 'toeFlex'], [/popliteus/, 'popliteus'], [/plantar|abductor hallucis|flexor digitorum brevis/, 'plantar']];
  function match(name) { const n = name.toLowerCase().replace(/[_.]/g, ' '); for (const [re, id] of PATS) if (re.test(n)) return { id, g: /(^|[^a-z])(l|left|lt|sin)([^a-z]|$)/.test(n) ? 1 : -1 }; return null; }
  const isBone = name => /bone|skull|vertebra|rib|femur|tibia|fibula|humerus|radius|ulna|scapula|clavicle|pelvis|ilium|sacrum|sternum|patella|mandible|cranium|phalan|metacarp|metatars|tarsal|carpal|hyoid|skeleton/i.test(name);
  const isSkin = name => /skin|body|integument|makehuman/i.test(name);
  const isTendon = name => /tendon|fascia|aponeurosis|retinacul|iliotibial tract/i.test(name);
  return { parse, match, isBone, isSkin, isTendon, PATS };
})();

/* Limits: range of motion for a flexible adult, coupling rules between joints. Every pose passes through full(). */
const keys = Object.keys(BASE);
/* Range of motion (degrees) for a healthy, flexible adult. Every pose is clamped to this table before it reaches the figure,
   so no move, and no blend between moves, can ask a joint for something a person cannot do. Hinge joints (knee, elbow) and the
   ankle are limited again inside the solvers. */
const LIM = { lum: [-25, 55], che: [-20, 35], lumS: [-25, 25], cheS: [-26, 26], lumT: [-8, 8], cheT: [-35, 35], pelT: [-40, 40], pelS: [-12, 12],
  nec: [-50, 45], hea: [-20, 20], necS: [-40, 40], headT: [-78, 78], abdR: [-10, 180], abdL: [-10, 180],
  rotR: [-90, 80], rotL: [-90, 80], elbR: [0, 150], elbL: [0, 150], wfR: [-88, 80], wfL: [-88, 80], proR: [-85, 88], proL: [-85, 88], wri: [-25, 25],
  curlR: [0, 1], curlL: [0, 1], heelR: [-14, 78], heelL: [-14, 78], toe: [-10, 35], tuR: [0, 30], tuL: [0, 30], shrR: [-.3, 1], shrL: [-.3, 1], shFR: [-1, 1], shFL: [-1, 1] };
const KNEE_MAX = 150, ELBOW_MAX = 150, ANKLE_DORSI = 38, clamped = new Set();
/* Coupling rules: ranges are not independent. Combinations that load a joint badly are reduced, the way a careful coach would cue.
   - Lower back: the more it is flexed, the less twist and side bend it is allowed (flexion plus rotation is the classic disc-loading combination).
   - Neck: the more it is extended, the less rotation it is allowed (extension plus rotation closes the joints and vessels on one side).
   Muscles that cross two joints are handled in the solvers: a straight knee tightens the calf (less ankle bend), and the checker
   tests the hamstring rule (a straight knee allows about 90 degrees of hip flexion, a bent knee about 125). */
const limit = (o, k, a, b) => { if (o[k] < a - 1e-6 || o[k] > b + 1e-6) { clamped.add(k); o[k] = clamp(o[k], a, b); } };
const full = p => { const o = { ...BASE, ...p }; for (const k in LIM) limit(o, k, LIM[k][0], LIM[k][1]);
  const lf = clamp(o.lum / 55, 0, 1), ne = clamp(-o.nec / 50, 0, 1);
  limit(o, 'lumT', -8 * (1 - .6 * lf), 8 * (1 - .6 * lf)); limit(o, 'lumS', -25 * (1 - .4 * lf), 25 * (1 - .4 * lf)); limit(o, 'headT', -78 * (1 - .5 * ne), 78 * (1 - .5 * ne));
  return o; };
const minReach = (l1, l2, maxFlex) => Math.sqrt(l1 * l1 + l2 * l2 - 2 * l1 * l2 * Math.cos((180 - maxFlex) * R));

const seg = (a, b, u) => smoother((u - a) / (b - a));
const mixP = (a, b, k) => { const o = {}; keys.forEach(n => o[n] = a[n] + (b[n] - a[n]) * k); return o; };

/* Attention and awareness content: a guided body scan script, and plain-language locations for every muscle
   so the app can direct attention to the right place during a stretch or exercise. */
const SCAN = [
  { n: 'Arriving', z: [100, 215, 75, 205], lines: ['Let your body be heavy. There is nothing to do right now.', 'Breathe in through the nose… and let the breath out slowly.', 'Notice the places where your body touches the floor or the chair.'] },
  { n: 'Feet', z: [100, 402, 40, 26], lines: ['Bring your attention down to your feet.', 'Notice warmth or coolness, weight, the touch of the floor or your socks.', 'On your next out-breath, let the feet soften and fall outward.'] },
  { n: 'Lower legs', z: [100, 350, 30, 36], lines: ['Move your attention up into the calves and shins.', 'There is nothing to change. Only notice what is there.', 'Breathe out, and let the lower legs grow heavy.'] },
  { n: 'Thighs and hips', z: [100, 255, 38, 56], lines: ['Feel the weight of your thighs.', 'Notice the hips, the place that carries you all day.', 'As you breathe out, let the hips sink and widen.'] },
  { n: 'Belly and lower back', z: [100, 170, 28, 30], lines: ['Rest your attention on the belly.', 'Feel it rise as you breathe in, and fall as you breathe out.', 'Let the lower back spread and settle with each out-breath.'] },
  { n: 'Chest and upper back', z: [100, 118, 34, 24], lines: ['Notice the chest and the ribs moving with the breath.', 'Feel the space between the shoulder blades.', 'Breathe out, and let the chest soften.'] },
  { n: 'Shoulders, arms and hands', z: [100, 160, 72, 60], lines: ['Let your shoulders slide down, away from your ears.', 'Follow the arms down to the elbows, the wrists, the hands.', 'Let the fingers uncurl. The hands have nothing to hold.'] },
  { n: 'Neck and throat', z: [100, 82, 24, 18], lines: ['Bring your attention to the neck.', 'Notice any holding at the back of the neck, without judging it.', 'With the out-breath, let the neck lengthen and release.'] },
  { n: 'Jaw, eyes and forehead', z: [100, 50, 24, 26], lines: ['Let the teeth part. The tongue rests softly in the mouth.', 'Soften the eyes, and the small muscles around them.', 'Let the forehead become smooth and wide.'] },
  { n: 'Whole body', z: [100, 215, 75, 205], lines: ['Now feel the whole body at once, breathing.', 'If the mind has wandered, that is normal. Come back to the breath.', 'Take one more slow breath, and carry this ease with you.'] }
];
const WHERE = {
  jaw: 'the sides of your jaw', scm: 'the front and side of your neck', scalenes: 'the side of your neck, above the collarbone', longus: 'the deep front of your neck',
  upTrap: 'the top of your shoulder, up to your neck', levator: 'the upper inside corner of your shoulder blade', splenius: 'the back of your neck', subocc: 'the base of your skull',
  deltAnt: 'the front and side of your shoulder', deltPost: 'the back of your shoulder', supra: 'the top of your shoulder blade', infra: 'the back of your shoulder blade', subscap: 'the deep front of your shoulder',
  teresMaj: 'the back of your armpit', pecMinor: 'just below your collarbone, near the shoulder', serratus: 'the side of your ribs, under the armpit', rhomboid: 'the space between your shoulder blades',
  trapMid: 'the space between your shoulder blades', trapLow: 'the lower tips of your shoulder blades', lats: 'the side of your back, below the armpit', pecMajor: 'the front of your chest',
  biceps: 'the front of your upper arm', brachialis: 'the front of your elbow', coraco: 'the inner front of your upper arm', triceps: 'the back of your upper arm', wristFlex: 'the inside of your forearm', wristExt: 'the outside of your forearm',
  abs: 'the front of your belly', oblExt: 'the side of your waist', oblInt: 'the side of your waist', transv: 'the deep belt of your waist', erector: 'the long muscles beside your spine', multifidus: 'the small deep muscles along your lower spine', quadlum: 'the side of your lower back, between ribs and hip',
  psoas: 'the deep front of your hip', iliacus: 'the front of your hip', rectFem: 'the front of your thigh, up to the hip', tfl: 'the outer front of your hip', sartorius: 'the front of your hip and inner knee',
  gmax: 'your buttock', gmed: 'the outer side of your hip', gmin: 'the outer side of your hip', pirif: 'deep in your buttock', addLong: 'your inner thigh, near the groin', addMag: 'your inner thigh', gracilis: 'the long line of your inner thigh',
  vlat: 'the outer front of your thigh', vmed: 'the inner front of your thigh, above the knee', vint: 'the front of your thigh', bicFem: 'the back of your thigh, outer side', medHams: 'the back of your thigh, inner side',
  gastroc: 'the upper part of your calf', soleus: 'the lower part of your calf, toward the heel', tibAnt: 'the front of your shin', tibPost: 'the inside of your lower leg and arch', peroneals: 'the outside of your lower leg',
  toeExt: 'the front of your ankle and top of your foot', toeFlex: 'the sole of your foot and deep calf', popliteus: 'the back of your knee', plantar: 'the sole of your foot'
};
/* What an exercise should and should not feel like. */
function FEEL(x, whyId) {
  const isStretch = x.sets == null, id = whyId || x.m[0], where = WHERE[id] || 'the working muscle';
  const good = !isStretch ? (x.type === 'isometric' || x.type === 'endurance' ? `Steady effort and warmth in ${where}; a slow build of fatigue while you keep breathing.` : x.type === 'control' ? `Light, precise effort in ${where}. It should feel controlled rather than hard.` : `Effort and warmth in ${where}. The last two reps should feel like work but stay clean.`)
    : x.type === 'release' ? `A dull "good ache" in ${where} that fades within 30 to 60 seconds.` : x.type === 'dynamic' || x.type === 'mobility' ? `Easy, smooth movement and gentle warmth around ${where}; a little more range with each rep.` : `A mild, steady pull in ${where}, about 3 to 4 out of 10, that eases slightly as you hold.`;
  const bad = isStretch ? 'Sharp or pinching pain, tingling, numbness, or pain inside a joint. Ease off or stop.' : 'Pain in a joint, sharp pain, or the effort moving into your neck or lower back. Make it smaller or rest.';
  return { where, good, bad };
}

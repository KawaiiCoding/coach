/* Training stages. The app moves through them from consistency and pain trend in the log. */
const STAGES = [
  { id: 1, n: 'Calm it down', weeks: 'weeks 1 to 2', goal: 'Reduce pain and tension, learn the breathing, build the daily habit.',
    does: ['Warm-up and diaphragm breathing every day', 'Gentle mobility and short, easy stretches (20 s)', 'Two low-level control exercises (bridge, chin tuck, clamshell)', 'A short body scan in the evening', 'Micro-breaks every 45 minutes'],
    progress: 'Move on when you have done 4 or more days a week for two weeks and pain is 3/10 or less on most days.', level: 1, stretchHold: 20, strength: 2 },
  { id: 2, n: 'Restore length and control', weeks: 'weeks 3 to 6', goal: 'Lengthen what is held short, switch on what is switched off, build range of motion.',
    does: ['Full stretch doses (30 s, 2 to 3 reps)', 'Three to four strengthening exercises, level 1 and 2, 2 to 3 sets', 'Mobility drills before, static holds after', 'Loaded breathing twice a week', 'Weekly range-of-motion check'],
    progress: 'Move on when the strength exercises feel easy at their dose, range of motion has improved, and pain stays at 3/10 or less.', level: 2, stretchHold: 30, strength: 4 },
  { id: 3, n: 'Build capacity', weeks: 'weeks 7 to 12', goal: 'Make the muscles strong enough that the day no longer overloads them.',
    does: ['Progressive strength: add reps, then holds, then load, one at a time', 'Level 3 exercises where appropriate (split squat, Nordic curl, Copenhagen, overhead press)', 'Stretching kept as maintenance, 2 to 3 times a week', 'Longer walks or other activity you enjoy'],
    progress: 'Move on when a full session is comfortable, pain is occasional, and you can do the day without flare-ups.', level: 3, stretchHold: 30, strength: 5 },
  { id: 4, n: 'Maintain', weeks: 'ongoing', goal: 'Keep the gains with the least time: short daily habits plus two strength sessions a week.',
    does: ['Five-minute morning routine: breathing, two mobility drills', 'Two strength sessions a week, 20 minutes', 'Micro-breaks and position changes at work', 'Return to stage 2 for a week after any flare-up'],
    progress: 'Stay here. If pain returns, drop back a stage for two weeks.', level: 3, stretchHold: 30, strength: 4 }
];
const WARMUP = [
  { id: 'wu-march', n: 'March on the spot', secs: 60, feel: ['psoas', 'rectFem', 'gastroc'], how: 'Lift the knees to hip height, swing the arms, breathe through the nose.' },
  { id: 'wu-swing', n: 'Arm swings and shoulder rolls', secs: 45, feel: ['deltAnt', 'deltPost', 'pecMajor', 'upTrap'], how: 'Swing both arms forward and back, then roll the shoulders backwards ten times.' },
  { id: 'wu-hip', n: 'Hip circles', secs: 45, feel: ['gmed', 'oblExt', 'quadlum'], how: 'Hands on the hips, circle the pelvis slowly, five each way, then standing leg swings.' },
  { id: 'wu-cat', n: 'Cat-cow', secs: 45, feel: ['erector', 'abs', 'multifidus'], how: 'On hands and knees, round and arch the spine with the breath, slowly through every segment.' }
];
const SECTION_WHY = {
  warmup: 'Three minutes of easy movement raises muscle temperature and blood flow, which makes stretches more effective and strengthening safer. Stretching cold tissue is less comfortable and gains less.',
  breath: 'Slow breathing with a long out-breath switches the body from "on" to "rest" and lowers muscle tone everywhere. It comes at the end, after the stretches, as part of the cool-down.',
  pre: 'A primer is a short, 20-second stretch of your tightest muscle, done right before you strengthen its opposite. A tight muscle partly switches off the muscle on the other side of the joint (a tight hip flexor quiets the buttock; a tight chest quiets the upper back). Loosening it briefly first lets the weak muscle work properly in the next exercise. It is not the real stretch: that comes later in the session, held longer, when you are warm. The idea is standard in physiotherapy; the research support is modest, so if you are short of time this is the step to skip.',
  strength: 'Muscles that are held long and switched off do not fix themselves with stretching; they need load. Strength work comes before the long stretches because long static holds before loading slightly reduce force and control.',
  stretch: 'The main stretches come last, on warm tissue, when they lengthen most. Hold to mild tightness only. Length gains need daily repetition for two to four weeks.',
  calm: 'A body scan teaches you to notice tension and let it go, so you drop it sooner during the day. It also marks the end of the session for the nervous system.'
};

/* Resets: short ready-made routines for a moment in the day. Each step references an exercise id from the libraries
   (warm-up moves, stretches, strength, breathing) and can override its time. Order follows the usual rule:
   warm-ups are dynamic only (no long static holds before activity); cool-downs start with easy movement,
   then static stretches, then slow breathing. Steps the user's safety rules exclude are dropped automatically.
   cat: warm | cool | energy | calm. */
const RESETS = [
  /* ---------- warm up ---------- */
  { id: 'pre-walk', n: 'Before a walk or run', cat: 'warm', ill: 'leg-swing', sub: 'Wake up the legs',
    steps: [{ r: 'wu-march', t: 45 }, { r: 'wu-hip', t: 30 }, { r: 'leg-swing' }, { r: 'calf-raise', reps: 12, sets: 1 }, { r: 'wu-swing', t: 30 }] },
  { id: 'pre-bike', n: 'Before a ride', cat: 'warm', ill: 'march', sub: 'Hips, knees and back ready',
    steps: [{ r: 'wu-march', t: 45 }, { r: 'wu-hip', t: 30 }, { r: 'leg-swing' }, { r: 'sit-stand', reps: 8, sets: 1 }, { r: 'wu-swing', t: 30 }] },
  { id: 'morning', n: 'Morning wake-up', cat: 'warm', ill: 'side-bend', sub: 'Loosen up after sleep',
    steps: [{ r: 'wu-march', t: 40 }, { r: 'wu-swing', t: 30 }, { r: 'cat-cow' }, { r: 'bridge', reps: 10, sets: 1 }, { r: 'wu-march', t: 30 }] },

  /* ---------- cool down ---------- */
  { id: 'post-walk', n: 'After a walk', cat: 'cool', ill: 'wall-calf', sub: 'Calves, hips, hamstrings',
    steps: [{ r: 'walk', t: 60 }, { r: 'calf-straight', t: 25, reps: 1 }, { r: 'quad-stand', t: 25, reps: 1 }, { r: 'heel-step', t: 25, reps: 1 }, { r: 'breath:seated', t: 60 }] },
  { id: 'post-run', n: 'After a run', cat: 'cool', ill: 'quad-stand', sub: 'Bring the heart rate down',
    steps: [{ r: 'walk', t: 90 }, { r: 'calf-straight', t: 30, reps: 1 }, { r: 'calf-bent', t: 25, reps: 1 }, { r: 'quad-stand', t: 30, reps: 1 }, { r: 'half-kneel', t: 30, reps: 1 }, { r: 'heel-step', t: 30, reps: 1 }, { r: 'breath:seated', t: 60 }] },
  { id: 'post-bike', n: 'After a ride', cat: 'cool', ill: 'half-kneel', sub: 'Open the hips and chest',
    steps: [{ r: 'walk', t: 60 }, { r: 'half-kneel', t: 30, reps: 1 }, { r: 'quad-stand', t: 30, reps: 1 }, { r: 'doorway-low', t: 30, reps: 1 }, { r: 'calf-straight', t: 25, reps: 1 }, { r: 'breath:seated', t: 60 }] },

  /* ---------- energise ---------- */
  { id: 'sitting', n: 'After sitting long', cat: 'energy', ill: 'doorway', sub: 'Undo the chair',
    steps: [{ r: 'wu-march', t: 40 }, { r: 'half-kneel', t: 25, reps: 1 }, { r: 'doorway-low', t: 25, reps: 1 }, { r: 'chin-tuck', reps: 6 }, { r: 'calf-raise', reps: 12, sets: 1 }, { r: 'wu-swing', t: 30 }] },
  { id: 'sofa', n: 'Off the sofa', cat: 'energy', ill: 'bridge', sub: 'Switch the glutes back on',
    steps: [{ r: 'chin-tuck', reps: 6 }, { r: 'cat-cow' }, { r: 'bridge', reps: 10, sets: 1 }, { r: 'half-kneel', t: 25, reps: 1 }, { r: 'wu-march', t: 40 }] },
  { id: 'desk', n: 'Two-minute desk break', cat: 'energy', ill: 'seated-twist', sub: 'Stay in your chair',
    steps: [{ r: 'chin-tuck', reps: 6 }, { r: 'wu-swing', t: 25 }, { r: 'seated-twist', reps: 2 }, { r: 'seated-side', t: 20, reps: 1 }, { r: 'wrist-ext', t: 20, reps: 1 }] },
  { id: 'phone', n: 'Phone neck', cat: 'energy', ill: 'chintuck', sub: 'Head back over the shoulders',
    steps: [{ r: 'chin-tuck', reps: 8 }, { r: 'uptrap', t: 20, reps: 1 }, { r: 'doorway-low', t: 25, reps: 1 }, { r: 'wall-slide', reps: 8, sets: 1 }] },

  /* ---------- unwind ---------- */
  { id: 'bed', n: 'Before bed', cat: 'calm', ill: 'knees-chest', sub: 'Slow down for sleep',
    steps: [{ r: 'knees-chest', t: 30, reps: 1 }, { r: 'supine-twist', t: 25, reps: 1 }, { r: 'figure4', t: 25, reps: 1 }, { r: 'breath:belly', t: 120 }, { r: 'scan', t: 150 }] },
  { id: 'calm2', n: 'Two-minute calm', cat: 'calm', ill: 'seated-twist', sub: 'Just breathe',
    steps: [{ r: 'breath:seated', t: 120 }] },
  { id: 'shoulders', n: 'Tight shoulders', cat: 'calm', ill: 'uptrap', sub: 'Let them drop',
    steps: [{ r: 'wu-swing', t: 30 }, { r: 'uptrap', t: 25, reps: 1 }, { r: 'levator', t: 25, reps: 1 }, { r: 'hug', t: 25, reps: 1 }, { r: 'breath:seated', t: 60 }] }
];
const RESET_CATS = [['all', 'All'], ['warm', 'Warm up'], ['cool', 'Cool down'], ['energy', 'Energise'], ['calm', 'Unwind']];

/* Short coach tips, one a day, said at the start of a session. */
const TIPS = [
  'The best posture is your next one. Change position every half hour.',
  'Breathe out on the effort. It keeps the pressure off your back and pelvic floor.',
  'A stretch should feel like a mild pull, never a sharp pain.',
  'Little and often beats long and rare. Five minutes today counts.',
  'Relax your jaw. Most of us clench without noticing.',
  'Slow on the way down. That is where strength is built.',
  'Screens at eye level save your neck hours of work.',
  'After sitting, stand up and walk for two minutes. Your hips will thank you.'
];

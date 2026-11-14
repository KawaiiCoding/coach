/* Breathing, diaphragm and meditation module. Written to standard physiotherapy and respiratory-care practice;
   sources are listed in SOURCES. Not a substitute for assessment of breathlessness. */
const BREATH = {
  screen: {
    q: 'Do you get short of breath when lying flat on your back, which eases when you sit up?',
    red: 'Breathlessness that appears lying flat and eases on sitting up (orthopnoea) can come from the heart, the lungs, severe reflux, a weak diaphragm or sleep apnoea. It needs a doctor, not a breathing exercise. Book an appointment; go urgently if it comes with chest pain, swollen ankles, waking up gasping, blue lips, fever, or if it is new and getting worse. Until then, sleep with the head and chest raised on pillows or a wedge, and use the breathing practice below only sitting or on your side.',
    yellow: 'Mild tightness lying down that does not limit you is common with a stiff rib cage, a tense diaphragm and upper-chest breathing habits. Train the diaphragm sitting first, then on your side, then on your back with a roll under the knees. If it worsens or wakes you, see a doctor.'
  },
  why: [
    'The diaphragm is the main breathing muscle: a dome under the lungs that flattens as it contracts, drawing air in and pushing the belly out. It is supplied by the phrenic nerves from the neck (C3 to C5).',
    'Under stress, after long sitting, and with a stiff rib cage, people shift to upper-chest breathing: the scalenes, sternocleidomastoid and upper trapezius lift the ribs on every breath, 20,000 times a day. That is one of the most common sources of neck and shoulder tension.',
    'Slow breathing at about six breaths a minute with a long exhale raises vagal (parasympathetic) activity, lowers heart rate and blood pressure in the short term, and reduces anxiety. The effect is reliable in trials; the size is modest, so it works best as a daily habit rather than a one-off.',
    'Lying on the back, the abdominal contents push the relaxed diaphragm up. In most people this is harmless; with a weak diaphragm, excess abdominal weight, lung disease or heart failure it can cause breathlessness. That is why the app screens for it.'
  ],
  /* exercises: name, position, dose, steps, cues, level */
  ex: [
    { id: 'belly', n: 'Diaphragmatic breathing, lying', pos: 'On your back, knees bent or a roll under the knees, one hand on the chest and one below the ribs.', dose: '5 minutes, twice a day', level: 1, pattern: [4, 0, 6, 0],
      steps: ['Breathe in through the nose for four counts so the lower hand rises and the upper hand stays still.', 'Let the breath out through pursed lips or the nose for six counts; the belly falls on its own.', 'Keep the shoulders, jaw and neck soft. If the upper hand moves first, make the breath smaller.'],
      cue: 'Small and slow beats big and deep. Aim for six to eight breaths a minute; stop if you feel light-headed and breathe normally for a minute.' },
    { id: 'croc', n: 'Crocodile breathing', pos: 'Face down, forehead on the hands, legs relaxed.', dose: '3 minutes, once or twice a day', level: 1, pattern: [4, 1, 6, 0],
      steps: ['Breathe in and feel the belly press into the floor and the lower back and sides of the waist rise.', 'Breathe out slowly and feel the belly soften.', 'The floor gives feedback that the breath is going down and out, not up into the chest.'],
      cue: 'The best position for learning, because the chest cannot lift. Skip if lying face down is uncomfortable for the neck.' },
    { id: 'side', n: 'Side-lying with rib expansion', pos: 'On your side, head on a pillow, top hand on the lower ribs of the upper side.', dose: '3 minutes each side', level: 2, pattern: [4, 0, 6, 0],
      steps: ['Breathe in and send the breath into the hand, so the upper ribs spread sideways.', 'Breathe out fully and feel the ribs fall.', 'Switch sides. One side is often stiffer; give it an extra minute.'],
      cue: 'Trains the lateral part of the diaphragm and loosens a stiff rib cage. This is the position to use if lying flat feels tight.' },
    { id: 'seated', n: 'Seated 4-6 breathing', pos: 'Sitting tall, feet flat, hands on the thighs or lower ribs.', dose: '2 to 5 minutes, any time', level: 1, pattern: [4, 0, 6, 0],
      steps: ['In through the nose for four, out for six, with no pause.', 'Let the shoulders drop on every exhale.', 'Use it at the desk, before sleep, and whenever the neck tightens.'],
      cue: 'The portable version. A longer exhale than inhale is what calms the nervous system.' },
    { id: 'box', n: 'Box breathing', pos: 'Sitting or lying.', dose: '3 to 4 minutes', level: 2, pattern: [4, 4, 4, 4],
      steps: ['In for four, hold for four, out for four, hold empty for four.', 'Keep the holds relaxed; the throat stays open, the shoulders down.'],
      cue: 'Good for focus and for settling before sleep. Shorten the holds to two counts if they create strain; skip the holds altogether in pregnancy or with heart or lung disease.' },
    { id: 'sigh', n: 'Physiological sigh', pos: 'Anywhere.', dose: '1 to 3 breaths when tense', level: 1, pattern: [2, 0, 6, 0],
      steps: ['Two inhales through the nose: a normal one, then a small top-up to fill the lungs.', 'One long, slow exhale through the mouth.'],
      cue: 'The fastest way to drop tension in the moment; it re-inflates collapsed air sacs and lengthens the exhale.' },
    { id: 'load', n: 'Diaphragm strength: loaded breathing', pos: 'On your back, a book or a 1 to 2 kg bag on the belly.', dose: '2 sets of 10 slow breaths', level: 3, pattern: [4, 1, 6, 0],
      steps: ['Breathe in and lift the weight with the belly, keeping the chest quiet.', 'Breathe out slowly and let it sink.', 'Add weight slowly over weeks; an inspiratory muscle trainer (a small resistance device) is the clinical version.'],
      cue: 'Only after the lying technique is easy. Not with a hernia, recent abdominal surgery or any breathlessness lying flat.' }
  ],
  sleep: [
    'If lying flat feels tight but you have been checked and cleared: a wedge or two pillows under the head and shoulders (not just the head, which bends the neck), and a roll under the knees to relax the belly and lower back.',
    'Side-lying with a pillow that keeps the neck level and a pillow between the knees is the easiest position for breathing and for the spine.',
    'Nasal breathing at night keeps breathing slower and more diaphragmatic. If you snore loudly or wake unrefreshed, ask about a sleep study.',
    'Avoid a big meal or alcohol within three hours of bed; both push breathing toward the chest and worsen reflux and snoring.'
  ],
  meditation: {
    intro: 'Meditation for tension is not about emptying the mind. It is practising noticing tension and letting it go, over and over, so the body learns to drop it sooner during the day. Ten minutes a day for a few weeks is enough to measure a change in stress, sleep and pain intensity; the evidence is moderate and consistent.',
    bodyScan: ['Lie on your back or sit supported. Take three slow 4-6 breaths.', 'Bring attention to the feet. Notice weight, warmth, contact with the floor. Do not change anything for ten seconds, then let them soften.', 'Move up: calves, thighs, hips. At each stop: notice, wait, soften on an out-breath.', 'Belly and lower back: let the belly rise with each in-breath, the back spread on each out-breath.', 'Chest, shoulders, arms, hands. Let the shoulders slide away from the ears.', 'Neck, jaw, tongue, eyes, forehead. Let the teeth part and the tongue rest on the roof of the mouth.', 'Finish by feeling the whole body breathe for a minute. When the mind wanders, that is normal; return to the breath without judging.'],
    tips: ['Same time, same place: after waking or before sleep works for most people.', 'Shorter and daily beats longer and rare. Start with five minutes.', 'If lying down makes you sleepy, sit. If sitting makes the neck ache, lie down with a roll under the knees.', 'Pain during a scan is information, not failure. Breathe toward it; do not fight it.']
  },
  SOURCES: [
    'American Thoracic Society / ERS statement on respiratory muscle testing and training.',
    'Zaccaro et al. 2018, "How breath-control can change your life": systematic review of slow breathing and psychophysiological effects (Frontiers in Human Neuroscience).',
    'Hopper et al. 2019, JBI Evidence Synthesis: diaphragmatic breathing for physiological and psychological stress in adults.',
    'Goyal et al. 2014, JAMA Internal Medicine: meditation programmes for psychological stress and well-being (meta-analysis).',
    'NHS and NICE guidance on breathlessness: orthopnoea as a red flag requiring medical assessment.'
  ]
};

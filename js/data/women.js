/* Sex-specific adaptation. Follows published guidance (listed in WOMEN.sources); not reviewed by a clinician.
   The rules only ever remove or soften exercises and add pelvic-floor work, notes and warning signs. */
const WOMEN = {
  now: [['health', 'I want to improve my general health'], ['period', 'I get painful periods'], ['preg', 'I am pregnant'], ['post', 'I had a baby in the last 12 months'], ['meno', 'I am in peri- or post-menopause']],
  sym: [['leak', 'I leak urine when I cough, laugh, jump or run'], ['prolapse', 'I feel heaviness, dragging or a bulge in the vagina'], ['pelvicPain', 'I have pelvic pain, or pain with sex or tampons']],
  pregStop: ['Vaginal bleeding or fluid leaking', 'Regular painful contractions', 'Chest pain, palpitations or breathlessness before you start', 'Dizziness or feeling faint', 'A headache that will not go away, or blurred vision', 'Calf pain or swelling', 'Your baby moving less than usual', 'Sudden swelling of the face, hands or feet'],
  periodRed: 'See a doctor for: bleeding that soaks a pad or tampon every hour, pain that painkillers do not control or that keeps you from work or school, pain between periods or with sex, bleeding between periods or after sex, or periods that stop.',
  sources: ['ACOG Committee Opinion 804 (2020): Physical activity and exercise during pregnancy and the postpartum period.', 'NHS: Exercise in pregnancy; Your post-pregnancy body; Pelvic floor exercises.', 'UK Chief Medical Officers 2019: physical activity for pregnant women and after childbirth.', 'NICE NG210 (2021): Pelvic floor dysfunction, prevention and non-surgical management; NICE NG123: Urinary incontinence and pelvic organ prolapse in women.', 'Goom, Donnelly and Brockwell 2019: Returning to running postnatal, guidelines for health professionals.', 'Armour et al. 2019, Cochrane Review: Exercise for dysmenorrhoea.', 'Royal Osteoporosis Society 2018: Strong, Steady and Straight, exercise and osteoporosis consensus statement.']
};
const W_SUPINE = ['subocc-ball', 'breathing', 'thoracic-roll', 'knees-chest', 'supine-twist', 'thomas', 'figure4', 'knee-opp', 'supine-ham', 'supine-chin', 'chin-lift', 'deadbug', 'curl-up', 'bridge', 'sl-bridge', 'hip-thrust', 'pf-relax'];
const W_PRONE = ['sphinx', 'prone-neck', 'prone-T', 'prone-Y', 'prone-W', 'superman', 'ham-curl'];
const W_ABLOAD = ['curl-up', 'plank', 'scap-pushup', 'pushup', 'copenhagen', 'hip-thrust', 'superman'];
const W_DEEP = ['couch', 'pigeon', 'frog', 'supine-twist', 'seated-twist'];
const W_PRESSURE = ['curl-up', 'plank', 'hip-thrust', 'suitcase', 'copenhagen', 'nordic'];
const OSTEO_AVOID = ['curl-up', 'knees-chest', 'seated-ham', 'supine-twist', 'seated-twist', 'child-side', 'prayer', 'neck-ext', 'heel-step', 'hug', 'pigeon', 'thomas', 'downdog'];      // sustained or loaded forward rounding of the spine, and end-range twists

/* pelvic floor: muscle, exercises, coaching, a seated figure */
(() => {
  const pf = { id: 'pfloor', n: 'Pelvic floor (levator ani)', side: 'f', layer: 3, reg: 'Hip', tend: 'weak',
    o: 'Back of the pubic bone, the ischial spine and the tendinous arch over obturator internus.', i: 'Perineal body, the walls of the urethra, vagina and anal canal, and the coccyx.',
    act: 'Supports the bladder, womb and bowel; closes the urethra and anus; relaxes to empty; works with the diaphragm and deep abdominals.', nv: 'Pudendal nerve and direct branches of S3 to S4.',
    note: 'Stretched and weakened by pregnancy and birth, and affected by the hormonal changes of menopause; it can also be too tight, which causes pain rather than leaking.',
    a: ['pel', 0.02, 1, 2], b: ['pel', 0.02, 1, -5], ch: ['f', 100, 224, 6, 4, 0], chain: ['transv', 'multifidus'], relax: [], load: () => 0.1 };
  MUSCLES.push(pf); MUSCLE.pfloor = pf;
  WHERE.pfloor = 'the base of your pelvis, between your sitting bones';
  ILLUS.T.sit = { hx: 60, hy: 72, tr: -88, nk: -88, th: 0, sh: 90, prop: 'chair', hl: '' };
  const ex = [
    { id: 'pf-kegel', n: 'Pelvic floor squeezes (slow holds)', m: ['pfloor', 'transv'], sets: 1, reps: 10, hold: 8, sides: 1, type: 'control', level: 1, ill: 'sit',
      how: 'Sitting, lying or standing. Squeeze as if stopping wind and urine at the same time, and lift upward inside. Hold while you keep breathing, then let go completely for the same length of time.',
      cue: 'Build toward 10 holds of 10 seconds, then 10 quick squeezes, three times a day for at least three months. If you cannot feel it, or symptoms do not improve, ask for a pelvic health physiotherapist.' },
    { id: 'pf-quick', n: 'Pelvic floor quick squeezes', m: ['pfloor'], sets: 1, reps: 10, hold: 1, sides: 1, type: 'control', level: 1, ill: 'sit',
      how: 'Squeeze and lift quickly and firmly, then release fully. One second on, two seconds off.', cue: 'These train the fast fibres that catch a cough or a sneeze. Squeeze just before you cough, sneeze or lift ("the knack").' },
    { id: 'pf-relax', n: 'Pelvic floor release breathing', m: ['pfloor'], sets: 1, reps: 10, hold: 6, sides: 1, type: 'control', level: 1, ill: 'breathing',
      how: 'Lie with the knees bent and supported, or sit. Breathe in slowly into the belly and imagine the sitting bones widening and the pelvic floor softening downward. Breathe out without squeezing.',
      cue: 'For a pelvic floor that is tight or painful, letting go is the exercise. Do not add squeezes until the pain has been assessed.' }
  ];
  ex.forEach(e => { STRENGTH.push(e); STRENGTH_BY[e.id] = e; });
  COACH['pf-kegel'] = { focus: ['A lift and squeeze inside, around the back and front passages', 'Easy breathing throughout', 'A complete let-go after every squeeze'], avoid: ['Holding your breath or bearing down', 'Clenching the buttocks, thighs or belly instead', 'Practising while passing urine'] };
  COACH['pf-quick'] = { focus: ['A fast, firm lift', 'Full release between squeezes'], avoid: ['Rushing so that the release is skipped', 'Tensing the shoulders or jaw'] };
  COACH['pf-relax'] = { focus: ['The pelvic floor softening downward as you breathe in', 'The belly and hips heavy'], avoid: ['Squeezing or lifting', 'Pushing down hard', 'Holding the breath'] };
})();

/* Rules for this person today. P = profile, L = today's log. */
function adaptRules(P, L) {
  const R = { exclude: new Set(), maxLevel: 3, breathAvoid: [], breath: null, stretchCap: 0, add: [], notes: [], stop: null, gentle: false, scanNote: '' };
  const ex = ids => ids.forEach(i => R.exclude.add(i));
  if (P.osteo) { ex(OSTEO_AVOID); R.add.push('sit-stand', 'balance');
    R.notes.push('Osteoporosis: exercises that round the spine forward under load or twist it to the end of range are left out. Strength, balance and back-extension work are kept, because they protect bone and reduce falls.'); }
  if (P.sex !== 'f') return R;
  const w = P.w || { now: [], sym: [] }, now = w.now || [], sym = w.sym || [];
  const preg = now.includes('preg') ? (w.tri || 1) : 0, post = now.includes('post') ? (w.post || 'late') : null;
  if (preg) {
    R.maxLevel = Math.min(R.maxLevel, 2); R.stretchCap = 20; R.breathAvoid.push('box', 'load', 'croc'); ex(['subocc-ball']); R.stop = WOMEN.pregStop;
    R.notes.push('Pregnancy: moderate activity is recommended (about 150 minutes a week) unless your midwife or doctor has advised otherwise. You should be able to hold a conversation while exercising. No breath-holding, no straining, and stretch gently: joints are looser in pregnancy.');
    if (preg >= 2) { ex(W_SUPINE); ex(W_PRONE); ex(['curl-up', 'plank', 'scap-pushup', 'copenhagen', 'child-side', 'prayer']); ex(W_DEEP); R.breath = 'side'; R.scanNote = 'Lie on your left side with a pillow between the knees, or sit supported.';
      R.notes.push('After about 16 weeks, exercises lying flat on your back or on your front are left out, because lying flat can reduce blood return to the heart. Side-lying, seated and standing versions are used instead.'); }
  }
  if (post) {
    const cs = !!w.cs;
    if (post === 'early') { R.maxLevel = 1; ex(W_ABLOAD); ex(['deadbug', 'side-plank', 'pallof', 'rdl', 'split-squat', 'step-up']); if (cs) { ex(W_PRONE); R.breathAvoid.push('croc'); } R.breathAvoid.push('load', 'box');
      R.notes.push('First six weeks after birth: gentle walking, pelvic floor squeezes and belly breathing can start as soon as they feel comfortable. Everything harder waits for your six-week check.' + (cs ? ' After a caesarean, avoid abdominal exercises and lifting anything heavier than your baby until you are cleared.' : '')); }
    else if (post === 'mid') { R.maxLevel = cs ? 1 : 2; ex(['curl-up', 'plank', 'pushup', 'copenhagen', 'hip-thrust', 'nordic']); R.breathAvoid.push('load'); if (cs) R.breathAvoid.push('croc');
      R.notes.push('Six to twelve weeks after birth: low-impact strengthening is built up gradually. Running and jumping are not recommended before twelve weeks, and only when you have no leaking, heaviness or pain.'); }
    else R.notes.push('Three to twelve months after birth: full training can be rebuilt. If your belly domes or bulges along the midline during an exercise, make it easier; and keep the pelvic floor work going.');
  }
  if (now.includes('meno')) { R.add.push('sit-stand', 'balance'); R.notes.push('Peri- and post-menopause: muscle and bone are lost faster, so strength work two or three times a week and balance practice are prioritised. Pelvic floor exercises help with the bladder changes that are common at this stage.'); }
  if (sym.includes('pelvicPain')) { R.add.push('pf-relax'); ex(['pf-kegel', 'pf-quick']);
    R.notes.push('Pelvic pain or pain with sex: squeezing exercises can make a tight pelvic floor worse, so only the release breathing is included. Please see your doctor or a pelvic health physiotherapist; this deserves an assessment.'); }
  else if (sym.includes('leak') || sym.includes('prolapse') || preg || post || now.includes('meno')) R.add.unshift('pf-kegel');
  if (sym.includes('leak')) { R.add.push('pf-quick'); ex(['curl-up']); R.notes.push('Leaking: supervised pelvic floor training for at least three months is the first-line treatment (at least eight squeezes, three times a day). Breathe out on effort, and squeeze just before a cough or sneeze. Ask your doctor about a pelvic health physiotherapist.'); }
  if (sym.includes('prolapse')) { ex(W_PRESSURE); R.notes.push('Heaviness or a bulge can be a prolapse. Book a routine appointment with your doctor. Exercises that push pressure downward are left out, and pelvic floor training is included because it improves symptoms.'); }
  if (L && L.period) { R.gentle = true; R.maxLevel = Math.min(R.maxLevel, 1);
    R.notes.push('Period pain today: the session is gentler. Heat on the lower belly, a walk, slow breathing and hip and lower-back stretches are safe and help many women. ' + WOMEN.periodRed); }
  else if (now.includes('period')) R.notes.push('Painful periods: regular exercise through the month reduces period pain for many women. On a painful day, tap "Period pain today" for a gentler session.');
  if (now.includes('health') && R.notes.length === 0) R.notes.push('General health: the plan balances what your day does to your body. Add 150 minutes a week of activity that raises your breathing, and strength work on two days.');
  R.add = [...new Set(R.add)].filter(i => !R.exclude.has(i));
  return R;
}

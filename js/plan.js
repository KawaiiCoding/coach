/* Routine builder: from the tension analysis, pick stretches for shortened or overworked muscles,
   strengthening for lengthened or inhibited muscles and the antagonists of tight ones, then assemble a session and a week. */
const PLAN = (() => {
  const C = v => Math.max(0, Math.min(1, v));
  const names = ids => ids.map(i => MUSCLE[i] ? MUSCLE[i].n : i).join(', ');
  const dose = x => x.hold != null && x.sets == null ? (x.hold ? `hold ${x.hold} s × ${x.reps}${x.sides > 1 ? ' each side' : ''}` : `${x.reps} slow reps${x.sides > 1 ? ' each side' : ''}`)
    : `${x.sets} × ${x.reps}${x.hold ? ` (${x.hold} s holds)` : ''}${x.sides > 1 ? ' each side' : ''}`;
  const secs = x => x.sets == null ? ((x.hold || 4) * x.reps * x.sides + 10) : ((x.hold || 3) * x.reps + 45) * x.sets * (x.sides > 1 ? 2 : 1);

  /* Antagonist pairs used for the balance report (upper and lower crossed patterns, plus the limbs). */
  const PAIRS = [
    ['Neck', ['splenius', 'subocc', 'upTrap', 'levator'], ['longus', 'trapLow'], 'forward-head pattern'],
    ['Chest / upper back', ['pecMajor', 'pecMinor', 'subscap', 'lats'], ['rhomboid', 'trapMid', 'trapLow', 'infra', 'deltPost'], 'rounded-shoulder pattern'],
    ['Shoulder girdle', ['upTrap', 'levator'], ['trapLow', 'serratus'], 'shrugged-shoulder pattern'],
    ['Lower back / abdomen', ['erector', 'quadlum', 'psoas'], ['abs', 'transv', 'multifidus', 'oblInt'], 'lumbar hollowing pattern'],
    ['Hip', ['psoas', 'iliacus', 'rectFem', 'tfl'], ['gmax', 'gmed', 'gmin'], 'sitting hip pattern'],
    ['Thigh', ['bicFem', 'medHams', 'addMag'], ['vlat', 'vmed', 'vint'], 'knee balance'],
    ['Lower leg', ['gastroc', 'soleus', 'toeFlex'], ['tibAnt', 'toeExt', 'peroneals'], 'ankle balance'],
    ['Forearm', ['wristFlex', 'biceps'], ['wristExt', 'triceps'], 'grip and typing balance']
  ];

  function build(A, p, posture) {
    const lying = p.scene === 'side' || p.scene === 'supine';
    const score = {};
    MUSCLES.forEach(m => { const a = A[m.id]; score[m.id] = { tight: m.tend === 'weak' ? 0 : a.shortening * 0.6 + a.pain * 0.4 + (a.T > 0.6 ? 0.15 : 0), long: a.passive, pain: a.pain, pressure: a.pressure }; });
    // stretch targets: shortened or overworked, excluding muscles that are usually weak rather than tight
    const tight = MUSCLES.filter(m => m.tend !== 'weak' && (A[m.id].shortening > 0.15 || A[m.id].pain > 0.45 || A[m.id].T > 0.65)).sort((a, b) => score[b.id].tight - score[a.id].tight);
    const stretches = [], covered = new Set();
    for (const m of tight) {
      if (stretches.length >= 6 || covered.has(m.id)) continue;
      const a = A[m.id];
      const cands = STRETCHES.filter(s => s.m.includes(m.id) && !stretches.includes(s));
      if (!cands.length) continue;
      const prefer = a.shortening > 0.25 ? ['static', 'pnf'] : ['release', 'mobility', 'static'];
      cands.sort((x, y) => (prefer.indexOf(x.type) === -1 ? 9 : prefer.indexOf(x.type)) - (prefer.indexOf(y.type) === -1 ? 9 : prefer.indexOf(y.type)) || x.m.indexOf(m.id) - y.m.indexOf(m.id));
      const s = cands[0]; stretches.push(s); s.m.forEach(i => covered.add(i)); s.why = m;
    }
    // strength targets: lengthened muscles that tend to be weak, antagonists of the tight ones, and known weak links of the posture pattern
    const weakIds = new Map();
    MUSCLES.forEach(m => { if (m.tend === 'weak' && A[m.id].passive > 0.12) weakIds.set(m.id, 0.6 + A[m.id].passive); });
    tight.slice(0, 6).forEach(m => m.relax.forEach(i => { if (MUSCLE[i].tend !== 'tight') weakIds.set(i, Math.max(weakIds.get(i) || 0, 0.5 + score[m.id].tight)); }));
    const weakList = [...weakIds.entries()].sort((a, b) => b[1] - a[1]).map(e => MUSCLE[e[0]]);
    const strength = [], sc = new Set();
    for (const m of weakList) {
      if (strength.length >= 6 || sc.has(m.id)) continue;
      const cands = STRENGTH.filter(s => s.m.includes(m.id) && !strength.includes(s)).sort((x, y) => x.level - y.level || x.m.indexOf(m.id) - y.m.indexOf(m.id));
      if (!cands.length) continue;
      const s = cands[0]; strength.push(s); s.m.forEach(i => sc.add(i)); s.why = m;
    }
    // mobility / warm-up: one dynamic drill for the most affected region
    const region = tight[0] ? tight[0].reg : 'Trunk';
    const mob = STRETCHES.filter(s => (s.type === 'dynamic' || s.type === 'mobility') && s.m.some(i => MUSCLE[i].reg === region || MUSCLE[i].reg === 'Trunk')).slice(0, 2);
    // balance report
    const balance = PAIRS.map(([n, tightIds, weakIdsP, label]) => {
      const mr = ids => ids.reduce((s, i) => s + A[i].r, 0) / ids.length, mt = ids => ids.reduce((s, i) => s + A[i].T, 0) / ids.length, mp = ids => ids.reduce((s, i) => s + A[i].pain, 0) / ids.length;
      const rs = mr(tightIds), rw = mr(weakIdsP), ts = mt(tightIds), ps = Math.max(mp(tightIds), mp(weakIdsP));
      let state = 'balanced', verdict = 'No marked imbalance in this posture.';
      if (rs < 0.95 && rw > 1.03) { state = 'crossed'; verdict = `Classic ${label}: ${names(tightIds)} shortened, ${names(weakIdsP)} lengthened. Stretch the first group and strengthen the second.`; }
      else if (rs < 0.94) { state = 'short'; verdict = `${names(tightIds)} held short. Stretch them and keep the opposite group active.`; }
      else if (rw > 1.06 || ts > 0.55) { state = 'overloaded'; verdict = `${names(ts > 0.55 ? tightIds : weakIdsP)} ${ts > 0.55 ? 'working hard' : 'held long'}. Change position more often and strengthen the ${names(weakIdsP)}.`; }
      return { n, state, verdict, pain: ps };
    });
    const total = stretches.reduce((s, x) => s + secs(x), 0) + strength.reduce((s, x) => s + secs(x), 0) + mob.reduce((s, x) => s + secs(x), 0);
    const minutes = Math.round(5 + total / 60);
    return { stretches, strength, mob, balance, minutes, tight: tight.slice(0, 6), weak: weakList.slice(0, 6), lying };
  }

  function habits(p, posture) {
    const h = ['Change position every 30 to 45 minutes and walk for two or three minutes; the best posture is the next one.'];
    if (p.scene === 'sofa') h.push('On the sofa: sit back so the lumbar spine is supported (add a cushion), keep screens near eye level, and alternate arm and leg positions. Avoid the armrest as a pillow for more than a few minutes.');
    if (p.scene === 'chair') h.push('At the desk: screen top at eye level, elbows about 90° with the forearms supported, hips slightly above the knees, feet flat.');
    if (p.scene === 'side') h.push('Side sleeping: a pillow thick enough to keep the neck level with the spine, a pillow between the knees, and the lower arm forward rather than under the pillow. Swap sides if one shoulder or hip aches.');
    if (p.scene === 'supine') h.push('Back sleeping: a low pillow that keeps the chin level, and a small roll under the knees to unload the lumbar spine.');
    if ((p.time || 0) > 60) h.push(`Held for ${p.time} min in the model: the tissue effects of a posture come from duration more than from the angle itself. Set a timer.`);
    if (p.hand > 3) h.push('Carrying: swap sides every few minutes, or split the load into two bags.');
    return h;
  }

  const links = (x, kind) => { const q = encodeURIComponent(x.n + ' ' + kind); return `<div class="links"><a href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener">Google</a> · <a href="https://www.google.com/search?tbm=isch&q=${q}" target="_blank" rel="noopener">images</a> · <a href="https://www.youtube.com/results?search_query=${q}+how+to" target="_blank" rel="noopener">video</a></div>`; };
  function html(R, p, posture) {
    const item = (x, kind) => `<div class="ex">${ILLUS.svg(x.ill)}<div><b>${x.n}</b> <span class="mu">${names(x.m)}</span><div class="dose">${dose(x)}${x.why ? ` · for the ${x.why.n.toLowerCase()}` : ''}</div><div>${x.how}</div><div class="cue">${x.cue}</div>${links(x, x.sets == null ? 'stretch' : 'exercise')}</div></div>`;
    const st = R.balance.map(b => `<div class="bal ${b.state}"><b>${b.n}</b> <span class="tag">${b.state}</span><div>${b.verdict}</div></div>`).join('');
    const hb = habits(p, posture).map(x => `<li>${x}</li>`).join('');
    return `<h2>Suggested routine (about ${R.minutes} min)</h2>
<p class="note">Built from the posture, the time held and the model's estimate of each muscle's length and load. It is a model, not an examination.</p>
<h3>Balance check</h3>${st}
<h3>1. Warm up (5 min)</h3><p>Brisk walk, easy cycling, or arm and leg swings until lightly warm. Stretching cold tissue is less effective and less comfortable.</p>
${R.mob.length ? `<h3>2. Mobility</h3>${R.mob.map(x => item(x)).join('')}` : ''}
<h3>${R.mob.length ? 3 : 2}. Lengthen what is short or overworked</h3>${R.stretches.length ? R.stretches.map(x => item(x)).join('') : '<p>Nothing is clearly shortened in this posture.</p>'}
<h3>${R.mob.length ? 4 : 3}. Strengthen what is long or switched off</h3>${R.strength.length ? R.strength.map(x => item(x)).join('') : '<p>No strengthening targets stand out.</p>'}
<h3>Week</h3><ul class="week"><li><b>Daily</b>: the mobility and stretching section (10 to 15 min), ideally after a warm shower or activity.</li><li><b>Mon · Wed · Fri</b>: add the strengthening section. Progress one variable at a time: reps, hold, then load.</li><li><b>Every hour at the desk or sofa</b>: one minute of chin tucks, band pull-aparts or a doorway stretch.</li><li><b>Re-check in 2 to 4 weeks</b>: range of motion should improve first; soreness changes more slowly.</li></ul>
<h3>Habits</h3><ul>${hb}</ul>
<details><summary>Safety, evidence and limits</summary><div class="note">
<p>Stretch to mild tightness, never into pain. Static holds of 10 to 30 s (30 to 60 s over 65), two to four repetitions, about 60 s per muscle, at least two or three days a week and ideally daily (ACSM Guidelines for Exercise Testing and Prescription). Strength: 8 to 12 repetitions, two to four sets, two or three non-consecutive days a week. Long static stretching (over 60 s per muscle) right before strength or power activity can reduce performance; use dynamic drills before and static holds after.</p>
<p>Do not stretch a fresh muscle tear, a swollen joint or a numb limb. Avoid forceful neck stretches and any position that produces tingling, dizziness or arm or leg symptoms. The "tight versus weak" grouping follows Janda's crossed-syndrome framework, which is widely used clinically but is a simplification: the model estimates length and load from geometry, not from your tissue.</p>
<p>See a clinician promptly for: pain after a fall or injury, pain that wakes you at night or does not ease with rest, numbness or weakness in a limb, loss of bladder or bowel control, numbness around the groin, fever or unexplained weight loss with back pain, chest pain, or pain that has not improved after about two weeks of sensible self-care. This app does not diagnose.</p>
</div></details>`;
  }
  return { build, html, dose, names, links, PAIRS };
})();

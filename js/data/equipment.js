/* What each exercise needs. Two kinds: equipment you have to own (band, weights, foam roller, tennis ball, bench) and things
   every home has (chair, wall, doorway, step, table, towel, bed). The plan only picks exercises whose equipment you have;
   with "No equipment" it never picks one that needs any. Household things are named so you can get them ready. */
const EQUIP = (() => {
  const NAMES = { rail: 'Something to hold', band: 'Band', weights: 'Weights', roller: 'Foam roller', ball: 'Tennis ball', bench: 'Bench', softball: 'Soft ball',
    chair: 'Chair', wall: 'Wall', door: 'Doorway', step: 'Step', table: 'Table', towel: 'Towel', bed: 'Bed' };
  const GEAR = ['band', 'weights', 'roller', 'ball', 'softball', 'bench'];      // what counts as equipment; the rest is household
  const by = {
    band: ['band-row', 'face-pull', 'band-er', 'band-ir', 'pull-apart', 'pulldown', 'pushdown', 'pallof', 'monster', 'tke', 'ham-curl', 'band-eversion', 'band-inversion', 'finger-ext'],
    weights: ['reverse-fly', 'lateral-raise', 'press', 'shrug', 'hammer-curl', 'wrist-curl', 'reverse-wrist', 'suitcase', 'rdl', 'hip-thrust'],
    roller: ['thoracic-roll'], ball: ['subocc-ball'], softball: ['ball-squeeze'], bench: ['hip-thrust', 'copenhagen'],
    chair: ['seated-side', 'seated-twist', 'seated-fig4', 'peroneal', 'ball-squeeze', 'seated-calf', 'short-foot', 'brace', 'pf-kegel', 'pf-quick', 'sit-stand', 'breath:seated', 'breath:box', 'breath:sigh'],
    wall: ['wall-lat', 'calf-straight', 'calf-bent', 'knee-wall', 'toe-wall', 'wall-slide', 'couch'],
    door: ['doorway-low', 'doorway-high', 'wall-chest', 'biceps', 'door-er', 'pulldown', 'pushdown'],
    step: ['heel-step', 'heel-drop', 'step-up'], rail: ['quad-stand', 'leg-swing', 'heel-drop'], table: ['pendulum'], towel: ['grip', 'short-foot', 'supine-ham', 'band-er'], bed: ['thomas'] };
  const of = {}; Object.entries(by).forEach(([k, ids]) => ids.forEach(id => (of[id] = of[id] || []).push(k)));
  let have = null;                                                // null: everything; otherwise the list of equipment owned
  const needs = id => of[id] || [], gear = id => needs(id).filter(k => GEAR.includes(k));
  return { NAMES, GEAR, needs, gear, set(v) { have = Array.isArray(v) ? v : null; }, get have() { return have; },
    ok: id => !have || gear(id).every(k => have.includes(k)),
    text: id => needs(id).map(k => NAMES[k]).join(', ') };
})();

/* 2D body chart: front and back outlines with one ellipse per muscle (right side, mirrored to the left). */
const CHART = (() => {
  const css = c => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
  function draw(el, st) {
    const { A, mode, sel } = st, M2 = 'translate(200,0) scale(-1,1) ', pain = [];
    const role = id => !sel ? null : id === sel ? 'tense' : MUSCLE[sel].chain.includes(id) ? 'chain' : MUSCLE[sel].relax.includes(id) ? 'relax' : 'dim';
    const col = m => { const r = role(m.id), a = A[m.id]; if (r) return css(SCENE.COL[r]); if (mode === 'short') return css(SCENE.divc(a.r)); if (mode === 'pain') return css(SCENE.heat(a.pain)); return css(SCENE.heat(a.T)); };
    const view = (v, k) => {
      const ms = MUSCLES.filter(m => m.ch[0] === v).sort((a, b) => b.layer - a.layer); // deep first, superficial drawn on top
      const sh = m => {
        const [, x, y, rx, ry, r] = m.ch, rl = role(m.id), deep = m.layer === 3, a = A[m.id];
        const e = t => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="${t}rotate(${r} ${x} ${y})" fill="${col(m)}" fill-opacity="${rl === 'dim' ? 0.2 : deep ? 0.62 : 0.84}" stroke="${m.id === sel ? '#fff' : deep ? '#e6eef4' : '#0e1a26'}" stroke-width="${m.id === sel ? 2.2 : 0.8}"${deep ? ' stroke-dasharray="3 2"' : ''}/>`;
        let d = '';
        if (mode === 'pain' && !sel && a.pain > 0.55) { pain.push(m.n); const c = t => `<circle cx="${x}" cy="${y}" r="3.5" fill="#ff2d55" stroke="#fff" stroke-width=".8" transform="${t}" class="pulse"/>`; d = c('') + c(M2); }
        return `<g class="cm" data-id="${m.id}"><title>${m.n}</title>${e('')}${e(M2)}${d}</g>`;
      };
      return `<g transform="translate(${k * 210},0)"><image href="${BODYIMG[v]}" x="0" y="0" width="200" height="430"/>${ms.map(sh).join('')}<text x="100" y="441" fill="#8fa5b6" font-size="11" text-anchor="middle">${v === 'f' ? 'FRONT' : 'BACK'}</text></g>`;
    };
    el.innerHTML = view('f', 0) + view('b', 1);
    return pain;
  }
  return { draw };
})();

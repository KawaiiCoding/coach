/* The 3D coach figure inside the app. The figure itself lives in its own page (fig3d.html, the files in js/fig3d/), so its
   code cannot disturb the app. This file puts that page in the player, drives it with the app's own rep clock, and makes the
   small still pictures for lists. A move is shown in 3D only when it passed every rule of the figure test (js/fig3d/ok.js);
   every other move, and every device without 3D graphics, keeps the 2D picture. */
const FIG3D = (() => {
  const OK = new Set(typeof FIG3D_OK !== 'undefined' ? FIG3D_OK : []);
  let mode = '3d', female = false, ill2id = null;
  const supported = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  const on = () => mode === '3d' && supported, has = id => OK.has(id);
  const ALIAS = { stand: 'rest', rest: 'rest', walk: 'walk', squat: 'sit-stand', allfours: 'cat-cow', seated: 'brace', sit: 'pf-kegel', breathing: 'breathing' };
  /* the 3D move for a picture: the exercise's own id when it has one, otherwise the first exercise drawn with that picture */
  function idFor(ill, ex) { if (ex && OK.has(ex)) return ex; if (ex && typeof ILLUS !== 'undefined' && ILLUS.MOVES[ex] && !OK.has(ex)) return null;
    if (!ill2id) { ill2id = {}; try { [...STRETCHES, ...STRENGTH].forEach(x => { if (!(x.ill in ill2id)) ill2id[x.ill] = x.id; }); } catch (e) {} }
    const id = ex ? null : (ALIAS[ill] || ill2id[ill]); return id && OK.has(id) ? id : null; }
  const src = extra => 'fig3d.html?sex=' + (female ? 'f' : 'm') + '&cs=' + (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light') + (extra || '');      // cs: the figure's page must declare the same light/dark scheme as the app, or the browser gives it a solid backdrop

  /* ---- still pictures for lists: made one at a time by a hidden copy of the figure, then kept ---- */
  let tf = null, tReady = false, busy = false; const cache = new Map(), waiting = new Map();
  function thumbFrame() { if (tf) return tf; tf = document.createElement('iframe'); tf.setAttribute('aria-hidden', 'true'); tf.tabIndex = -1;
    tf.style.cssText = 'position:fixed;left:-9999px;top:0;width:352px;height:256px;border:0;visibility:hidden;pointer-events:none'; tf.src = src('&still');
    tf.onload = () => { const wait = () => { try { if (tf.contentWindow.FIG) { tReady = true; pump(); return; } } catch (e) {} setTimeout(wait, 60); }; wait(); };
    document.body.appendChild(tf); return tf; }
  const put = (el, url) => { if (!el.isConnected || el.dataset.f3done) return; el.dataset.f3done = '1'; el.innerHTML = ILLUS.scene() + `<img class="f3img" alt="" src="${url}">`; };
  function pump() { if (!tReady || busy) return; const next = waiting.keys().next(); if (next.done) return; const key = next.value, els = waiting.get(key); waiting.delete(key); busy = true;
    const [id, big] = key.split('|'); let url = null; try { url = tf.contentWindow.FIG.thumb(id, big === '1' ? 640 : 352, big === '1' ? 400 : 256); } catch (e) {}
    if (url) { cache.set(key, url); els.forEach(el => put(el, url)); } busy = false; if (waiting.size) setTimeout(pump, 12); }
  function fill(root) { if (!on()) return; (root || document).querySelectorAll('.f3t:not([data-f3done])').forEach(el => { const key = el.dataset.f3 + '|' + (el.clientWidth > 150 ? 1 : 0), url = cache.get(key);
    if (url) return put(el, url); if (!waiting.has(key)) waiting.set(key, []); waiting.get(key).push(el); }); if (waiting.size) { thumbFrame(); pump(); } }
  let scan = 0; const watch = () => { if (!scan) scan = requestAnimationFrame(() => { scan = 0; fill(); }); };
  if (typeof MutationObserver !== 'undefined') addEventListener('DOMContentLoaded', () => new MutationObserver(watch).observe(document.body, { childList: true, subtree: true }));
  /* wrap a 2D picture so that it is replaced by the 3D still when there is one */
  const wrap = (svg, ill, ex) => { const id = on() ? idFor(ill, ex) : null; return id ? `<span class="f3t" data-f3="${id}">${svg}</span>` : svg; };
  function reset() { cache.clear(); waiting.clear(); tReady = false; if (tf) { tf.remove(); tf = null; } }

  /* ---- the moving figure in the player ---- */
  function stage(el) {      // makes sure the picture area holds the scene and the figure's page; returns its handle
    if (el._f3 && el._f3.fr.isConnected) return el._f3;
    el.innerHTML = ILLUS.scene() + `<iframe class="f3frame" title="Coach figure" src="${src()}"></iframe><button class="f3re" aria-label="Recentre the view" hidden><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3v3.2M12 17.8V21M3 12h3.2M17.8 12H21"/></svg></button>`;
    const fr = el.querySelector('iframe'), btn = el.querySelector('.f3re'), h = { fr, id: null, last: null, ready: false,
      api() { try { return fr.contentWindow && fr.contentWindow.FIG; } catch (e) { return null; } },
      draw(id, st, mirror) { h.last = [id, st, mirror]; const F = h.ready && h.api(); if (!F) return; if (h.id !== id) { F.show(id, h.id === null); h.id = id; }
        if (st) F.drive(st.u, st.cyc, st.ph); else F.free(); fr.style.transform = mirror ? 'scaleX(-1)' : ''; btn.hidden = !F.moved(); } };
    fr.onload = () => { const wait = () => { if (!fr.isConnected) return; if (h.api()) { h.ready = true; fr.classList.add('on'); if (h.last) h.draw(...h.last); return; } setTimeout(wait, 50); }; wait(); };
    btn.onclick = ev => { ev.stopPropagation(); const F = h.api(); if (F) F.recentre(); btn.hidden = true; };
    return el._f3 = h; }
  return { on, has, idFor, wrap, fill, stage, supported,
    get mode() { return mode; }, setMode(m) { mode = m === '2d' ? '2d' : '3d'; }, setFemale(v) { if (female !== !!v) { female = !!v; reset(); } } };
})();

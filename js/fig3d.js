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
  function idFor(ill, ex) { if (ill === 'shoulder-roll' && OK.has(ill)) return ill;      // a part of a warm-up with its own picture
    if (ex && OK.has(ex)) return ex; if (ex && typeof ILLUS !== 'undefined' && ILLUS.MOVES[ex] && !OK.has(ex)) return null;
    if (!ill2id) { ill2id = {}; try { [...STRETCHES, ...STRENGTH].forEach(x => { if (!(x.ill in ill2id)) ill2id[x.ill] = x.id; }); } catch (e) {} }
    const id = ex ? null : (ALIAS[ill] || ill2id[ill]); return id && OK.has(id) ? id : null; }
  const src = extra => 'fig3d.html?sex=' + (female ? 'f' : 'm') + '&cs=' + (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light') + (extra || '');      // cs: the figure's page must declare the same light/dark scheme as the app, or the browser gives it a solid backdrop

  /* ---- still pictures for lists: made one at a time by a hidden copy of the figure, then kept ---- */
  /* Pictures are kept on the device (small WebP files in local storage, per figure and per version of the moves), so from the second
     visit on they are simply there: no drawing, no waiting. */
  let tf = null, tReady = false, busy = false, slice = 0; const cache = new Map(), waiting = new Map(), VER = (typeof FIG3D_VER !== 'undefined' ? FIG3D_VER : '0');
  const sk = key => 'fig3d.t.' + VER + '.' + (female ? 'f' : 'm') + '.' + key;
  const keep = (key, url) => { try { localStorage.setItem(sk(key), url); } catch (e) {} };
  const recall = key => { try { return localStorage.getItem(sk(key)); } catch (e) { return null; } };
  try { Object.keys(localStorage).forEach(k => { if (k.startsWith('fig3d.t.') && !k.startsWith('fig3d.t.' + VER + '.')) localStorage.removeItem(k); }); } catch (e) {}
  function thumbFrame() { if (tf) return tf; tf = document.createElement('iframe'); tf.setAttribute('aria-hidden', 'true'); tf.tabIndex = -1;
    tf.style.cssText = 'position:fixed;left:-9999px;top:0;width:352px;height:256px;border:0;visibility:hidden;pointer-events:none'; tf.src = src('&still');
    tf.onload = () => { const wait = () => { try { if (tf.contentWindow.FIG) { tReady = true; pump(); return; } } catch (e) {} setTimeout(wait, 60); }; wait(); };
    document.body.appendChild(tf); return tf; }
  const put = (el, url) => { if (!el.isConnected || el.dataset.f3done) return; el.dataset.f3done = '1'; el.innerHTML = `<span class="f3bg"></span><img class="f3img" alt="" src="${url}">`; };
  function pump() { if (!tReady || busy) return; const next = waiting.keys().next(); if (next.done) return; const key = next.value, els = waiting.get(key); waiting.delete(key); busy = true;
    const [id, kw, kh] = key.split('|'); let url = null; try { const F = tf.contentWindow.FIG, w = +kw, h = +kh, pt = /^pet:(\w+):(\d)$/.exec(id); url = pt ? F.petThumb(pt[1], +pt[2], w, h) : F.thumb(id, w, h, 'image/webp'); } catch (e) {}
    if (url) { cache.set(key, url); keep(key, url); els.forEach(el => put(el, url)); } busy = false; if (waiting.size) { if (performance.now() - slice < 14) pump(); else setTimeout(() => { slice = performance.now(); pump(); }, 0); } }
  function fill(root) { if (!on()) return; (root || document).querySelectorAll('.f3t:not([data-f3done])').forEach(el => { const cw = el.clientWidth || 88, ch = el.clientHeight || 64, sc = Math.min(2, Math.max(1.5, devicePixelRatio || 2)), key = el.dataset.f3 + '|' + Math.round(cw * sc / 16) * 16 + '|' + Math.round(ch * sc / 16) * 16, url = cache.get(key) || recall(key); if (url && !cache.has(key)) cache.set(key, url);      // drawn at the shape of the box it goes in, so nothing is cropped
    if (url) return put(el, url); if (!waiting.has(key)) waiting.set(key, []); waiting.get(key).push(el); }); if (waiting.size) { thumbFrame(); pump(); } }
  let scan = 0; const watch = () => { if (!scan) scan = requestAnimationFrame(() => { scan = 0; fill(); }); };
  const start = () => { if (typeof MutationObserver !== 'undefined') new MutationObserver(watch).observe(document.body, { childList: true, subtree: true }); watch(); };      // also scan what is already on the page: the first screen is drawn before this starts
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start); else start(); addEventListener('load', watch); addEventListener('pageshow', watch);
  /* wrap a 2D picture so that it is replaced by the 3D still when there is one */
  const wrap = (svg, ill, ex) => { const id = on() ? idFor(ill, ex) : null; if (!id) return svg; const url = [...cache.keys()].find(k => k.startsWith(id + '|')); return `<span class="f3t" data-f3="${id}"><span class="f3bg"></span>${url ? `<img class="f3img" alt="" src="${cache.get(url)}">` : ''}</span>`; };      // never the old drawing first: a plain backdrop (or the last 3D picture) until the right one is ready
  function reset() { cache.clear(); waiting.clear(); tReady = false; if (tf) { tf.remove(); tf = null; } document.querySelectorAll('.f3t[data-f3done]').forEach(el => { delete el.dataset.f3done; }); watch(); }      // the pictures already on the page are drawn again for the new figure

  /* ---- the moving figure in the player ---- */
  function stage(el) {      // makes sure the picture area holds the scene and the figure's page; returns its handle
    if (el._f3 && el._f3.fr.isConnected) return el._f3;
    el.innerHTML = `<div class="f3bg"></div><iframe class="f3frame" title="Coach figure" src="${src()}"></iframe><button class="f3re" aria-label="Recentre the view" hidden><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3v3.2M12 17.8V21M3 12h3.2M17.8 12H21"/></svg></button>`;
    const fr = el.querySelector('iframe'), btn = el.querySelector('.f3re'), h = { fr, id: null, last: null, ready: false,
      api() { try { return fr.contentWindow && fr.contentWindow.FIG; } catch (e) { return null; } },
      draw(id, st, mirror) { h.last = [id, st, mirror]; const F = h.ready && h.api(); if (!F) return; if (h.id !== id) { F.show(id, h.id === null); h.id = id; }
        if (st) F.drive(st.u, st.cyc, st.ph); else F.free(); fr.style.transform = mirror ? 'scaleX(-1)' : ''; btn.hidden = !F.moved(); } };
    fr.onload = () => { const wait = () => { if (!fr.isConnected) return; if (h.api()) { h.ready = true; fr.classList.add('on'); if (h.last) h.draw(...h.last); return; } setTimeout(wait, 50); }; wait(); };
    btn.onclick = ev => { ev.stopPropagation(); const F = h.api(); if (F) F.recentre(); btn.hidden = true; };
    return el._f3 = h; }
  /* the cats and dogs that wander past now and then, for the catalogue */
  const PETS = [['dog', 0, 'Dog, white with tan patches'], ['dog', 1, 'Dog, cream with brown patches'], ['dog', 2, 'Dog, golden'], ['dog', 3, 'Dog, white with dark patches'], ['cat', 0, 'Cat, ginger'], ['cat', 1, 'Cat, grey'], ['cat', 2, 'Cat, white'], ['cat', 3, 'Cat, cream']];
  const petFrame = (kind, coat) => `<div class="exart petart"><div class="f3bg"></div><iframe class="f3frame on" title="Visitor" src="${src('&pet=' + kind + '&coat=' + coat)}"></iframe></div>`;
  return { on, has, idFor, wrap, fill, stage, supported, PETS, petFrame,
    get mode() { return mode; }, setMode(m) { mode = m === '2d' ? '2d' : '3d'; }, setFemale(v) { if (female !== !!v) { female = !!v; reset(); } } };
})();

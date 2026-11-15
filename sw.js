/* Offline cache for GitHub Pages. Bump CACHE when files change. */
const CACHE = 'tension-coach-v1';
const FILES = ['./', './index.html', './explorer.html', './manifest.webmanifest', './css/today.css', './css/style.css',
  './js/data/bodyimg.js', './js/kinematics.js', './js/data/muscles.js', './js/data/postures.js', './js/data/stretches.js', './js/data/strength.js',
  './js/data/breathing.js', './js/data/regions.js', './js/data/stages.js', './js/data/coaching.js', './js/illus.js', './js/plan.js', './js/today.js',
  './js/gl.js', './js/glb.js', './js/skinning.js', './js/scene3d.js', './js/chart.js', './js/app.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png', './icons/icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => { if (res.ok && new URL(e.request.url).origin === location.origin) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return res; }).catch(() => caches.match('./index.html'))));
});

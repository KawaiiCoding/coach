/* Offline cache for GitHub Pages. Bump CACHE when files change. */
const CACHE = 'tension-coach-v84';
const FILES = ['./', './index.html', './manifest.webmanifest', './css/app.css',
  './js/kinematics.js', './js/data/muscles.js', './js/data/postures.js', './js/data/stretches.js', './js/data/strength.js',
  './js/data/breathing.js', './js/data/regions.js', './js/data/stages.js', './js/data/coaching.js', './js/data/mindful.js', './js/illus.js', './js/data/women.js',
  './js/data/resets.js', './js/plan.js', './js/coach.js', './js/app.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png', './icons/icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // the recordings list must be fresh: network first, cached copy only when offline
  if (e.request.url.includes('/audio/coach/index.json')) { e.respondWith(fetch(e.request).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return res; }).catch(() => caches.match(e.request))); return; }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => { if (res.ok && new URL(e.request.url).origin === location.origin) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return res; }).catch(() => caches.match('./index.html'))));
});
/* a move reminder opens the app straight into the suggested reset */
self.addEventListener('notificationclick', e => {
  e.notification.close(); const id = e.notification.data && e.notification.data.reset, url = './index.html' + (id ? '?reset=' + id : '');
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => { for (const c of cs) if ('focus' in c) return c.focus(); return self.clients.openWindow(url); }));
});

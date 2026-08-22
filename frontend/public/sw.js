/* SUGIDash service worker — offline-capable since Phase 4c.
 *
 * Strategy:
 *  - Precache the app shell ('/', '/index.html', manifest, icons) on install.
 *  - Navigation requests: network-first, falling back to cached '/index.html'
 *    so any client-side route (e.g. /login, /management/...) boots offline.
 *  - Same-origin build assets (/assets/*): stale-while-revalidate runtime cache
 *    — first visit populates it, subsequent offline loads serve from cache.
 *  - API GETs: network-only (never serve stale data silently); failures surface
 *    to the app's own error states.
 */
const SHELL_CACHE = 'sugi-dash-shell-v2';
const RUNTIME_CACHE = 'sugi-dash-runtime-v2';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // cross-origin (GeoJSON etc.) → network

  // 1) SPA navigations: network-first, cached shell fallback → app boots offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .catch(() =>
          caches.match('/index.html').then(
            (hit) => hit || caches.match('/')
          )
        )
    );
    return;
  }

  // 2) Hashed build assets: stale-while-revalidate runtime cache
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const refresh = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || refresh;
      })
    );
    return;
  }

  // 3) API calls: never cache — let app-level error states handle offline
});

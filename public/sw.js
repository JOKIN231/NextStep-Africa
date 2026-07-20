// Minimal service worker for NextStep Africa.
//
// Purpose: satisfy the installability requirement (a registered service
// worker with a real fetch handler) so Chrome/Android/Desktop will fire
// `beforeinstallprompt`, plus give repeat visits a light speed boost.
//
// Deliberately NOT a full offline-first cache: opportunities, blog posts,
// and auth all come from Supabase and must always be fetched live. This
// worker only ever touches same-origin GET requests for the static app
// shell — Supabase calls and anything cross-origin pass straight through,
// untouched and uncached.

const CACHE_NAME = 'nextstep-africa-shell-v1';
const PRECACHE_URLS = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests for the app shell. Everything
  // else (Supabase reads/writes, external images, POST/PUT/DELETE) is
  // left completely alone.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Network-first: always try to get the freshest copy. Only fall back to
  // the cache if the network genuinely fails (offline).
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

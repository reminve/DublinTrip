// SERVICE WORKER HARD PURGE & CACHE KILL-SWITCH
const CACHE_NAME = 'dublin2026-v999-KILL-CACHE';

self.addEventListener('install', (event) => {
  console.log('[SW] Unregistering and clearing all caches...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('[SW] Deleting cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Pass-through all network requests directly (no stale caching)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

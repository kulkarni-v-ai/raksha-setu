const CACHE_NAME = 'raksha-setu-v2';
const OFFLINE_URL = '/index.html';

// Core app shell files to cache for offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests: Network-first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for offline use
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          // Serve cached API response when offline
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({ offline: true, message: 'You are offline. Showing cached data.' }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Map tiles: Cache-first (they rarely change)
  if (url.hostname.includes('basemaps') || url.hostname.includes('tile')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        }).catch(() => new Response('', { status: 408 }));
      })
    );
    return;
  }

  // App shell & assets: Cache-first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Cache new assets
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // If it's a navigation request, serve the app shell
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('', { status: 408 });
        });
    })
  );
});

// Background Sync: queue failed SOS alerts for retry when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sos-retry') {
    event.waitUntil(retrySOS());
  }
});

async function retrySOS() {
  // Will be populated by the app when SOS fails due to offline
  const cache = await caches.open('sos-queue');
  const requests = await cache.keys();
  for (const req of requests) {
    try {
      const cachedRes = await cache.match(req);
      const body = await cachedRes.json();
      await fetch(req.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      await cache.delete(req);
    } catch (e) {
      // Will retry on next sync
    }
  }
}

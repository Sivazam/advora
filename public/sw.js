// Advora PWA Service Worker
const CACHE_NAME = 'advora-pwa-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/portal',
  '/manifest.json',
  '/navLogo.webp',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/maskable-icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (
          response.status === 200 &&
          (event.request.url.includes('/_next/static/') ||
            event.request.url.includes('/uploads/') ||
            event.request.url.includes('/navLogo') ||
            event.request.url.includes('/icon-'))
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/portal');
          }
        });
      })
  );
});

const CACHE_NAME = 'eenvoq-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installs the Service Worker and caches essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Failed to pre-cache some assets during service worker install:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activates the Service Worker and claims control of clients, cleaning old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepts network fetches to satisfy offline PWA audit protocols
self.addEventListener('fetch', (event) => {
  // Only intercept HTTP/HTTPS schemes (some plugins/extensions use chrome-extension:// etc.)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Do not cache non-safe, third-party, or API requests globally
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache the newly fetched asset dynamically (only local static files and pages)
        const canCache = event.request.method === 'GET' && 
                         !event.request.url.includes('/api/') && 
                         !event.request.url.includes('socket.io') &&
                         !event.request.url.includes('vite');

        if (canCache) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch((error) => {
        // Offline fallback for main page navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        throw error;
      });
    })
  );
});

const CACHE_NAME = 'swift-volt-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/login',
  '/dashboard',
  '/dashboard/catalogue',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if found
      if (response) {
        return response;
      }
      
      // Otherwise fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache API responses and Next.js static assets automatically
        if (
          event.request.url.includes('/api/') || 
          event.request.url.includes('/_next/')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch((error) => {
      // Fallback for offline API failure
      if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('application/json')) {
        return new Response(JSON.stringify({ error: 'Offline mode active', details: error.message }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Prevent ERR_FAILED for HTML navigation requests by returning a fallback response instead of undefined
      return new Response(
        '<html><body><h1>Offline Mode / Server Unreachable</h1><p>The Next.js development server is currently unreachable. Please ensure it is running and try refreshing.</p></body></html>',
        {
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

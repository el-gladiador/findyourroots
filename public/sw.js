const CACHE_NAME = 'find-your-roots-v5';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Increment this version number when you want to force an update
const SW_VERSION = '1.0.5';
const SW_TIMESTAMP = Date.now();

console.log(`Service Worker version ${SW_VERSION} loaded at ${new Date(SW_TIMESTAMP).toISOString()}`);

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon.ico'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log(`Service Worker: Installing version ${SW_VERSION}...`);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return Promise.allSettled(
          STATIC_FILES.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
            });
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        // Don't skip waiting automatically - let the client decide
        return self.clients.matchAll({ type: 'window' }).then(clients => {
          console.log(`Service Worker: Notifying ${clients.length} clients of new version`);
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATE_AVAILABLE',
              version: SW_VERSION,
              timestamp: SW_TIMESTAMP
            });
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`Service Worker: Activating version ${SW_VERSION}...`);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_NAME)) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log(`Service Worker: Activated version ${SW_VERSION} - taking control`);
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients that the new version is active
        return self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: SW_VERSION,
              timestamp: SW_TIMESTAMP
            });
          });
        });
      })
  );
});

// Message event - handle commands from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message', event.data);
  
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('Service Worker: User approved update - activating...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.action === 'GET_VERSION') {
    const versionInfo = {
      type: 'SW_VERSION_INFO',
      version: SW_VERSION,
      timestamp: SW_TIMESTAMP
    };
    
    // Send response back to the client
    event.source.postMessage(versionInfo);
  }
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (different origin)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.includes('/api/') || 
      url.hostname.includes('firebase') || 
      url.hostname.includes('google')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // For all other requests, use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            if (!response.ok) {
              return response;
            }

            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html').then((offlinePage) => {
                return offlinePage || new Response(
                  '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
                  { headers: { 'Content-Type': 'text/html' } }
                );
              });
            }
            throw new Error('Network failed and no cache available');
          });
      })
  );
});
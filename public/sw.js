// Increment this version number when you want to force an update
const SW_VERSION = '1.3.03';
const SW_TIMESTAMP = Date.now();

const CACHE_NAME = `find-your-roots-v${SW_VERSION}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const JS_CACHE = `${CACHE_NAME}-js`;

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
  '/icons/favicon.ico',
  '/images/profile-zaki.jpg'
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
        // Don't send update notifications here - let activation handle it
        console.log(`Service Worker: Version ${SW_VERSION} installed, waiting for activation`);
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
        console.log('Service Worker: Current caches:', cacheNames);
        
        // Delete ALL old caches, including those from previous versions
        const cachesToDelete = cacheNames.filter(cacheName => {
          return !cacheName.includes(`find-your-roots-v${SW_VERSION}`);
        });
        
        console.log('Service Worker: Caches to delete:', cachesToDelete);
        
        return Promise.all(
          cachesToDelete.map((cacheName) => {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log(`Service Worker: Activated version ${SW_VERSION} - taking control`);
        return self.clients.claim();
      })
      .then(() => {
        // Check if there are existing clients to determine if this is an update
        return self.clients.matchAll({ type: 'window' });
      })
      .then(clients => {
        if (clients.length > 0) {
          console.log(`Service Worker: Notifying ${clients.length} clients about new version ${SW_VERSION}`);
          
          // This is an update - notify clients
          clients.forEach(client => {
            try {
              client.postMessage({
                type: 'SW_UPDATE_AVAILABLE',
                version: SW_VERSION,
                timestamp: SW_TIMESTAMP
              });
              console.log('Service Worker: Update notification sent to client');
            } catch (error) {
              console.error('Service Worker: Failed to send update message:', error);
            }
          });
        } else {
          console.log('Service Worker: No existing clients - this is a fresh installation');
        }
      })
  );
});

// Message event - handle commands from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message', event.data);
  
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('Service Worker: User approved update - calling skipWaiting()...');
    
    // Call skipWaiting immediately
    self.skipWaiting();
    
    // Notify the client that skipWaiting was called
    if (event.source) {
      event.source.postMessage({
        type: 'SW_SKIP_WAITING_COMPLETE',
        timestamp: Date.now()
      });
    }
  }
  
  if (event.data && event.data.action === 'GET_VERSION') {
    // Only send version info - don't send update notifications here
    // to avoid notification loops
    const versionInfo = {
      type: 'SW_VERSION_INFO',
      version: SW_VERSION,
      timestamp: SW_TIMESTAMP
    };
    
    console.log('Service Worker: Sending version info only (no update notification)');
    
    // Send response back to the client
    if (event.source) {
      event.source.postMessage(versionInfo);
    }
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

  // Handle JavaScript chunks with network-first strategy to prevent stale chunk errors
  if (url.pathname.includes('/_next/static/chunks/') || 
      url.pathname.includes('.js') || 
      url.pathname.includes('.js.map')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // Cache the new JS chunk
            const responseClone = response.clone();
            caches.open(JS_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Only fall back to cache for JS files if network fails
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              console.log('Service Worker: Serving cached JS file:', url.pathname);
              return cachedResponse;
            }
            // If no cached version, throw an error
            throw new Error(`JavaScript file not available: ${url.pathname}`);
          });
        })
    );
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

  // For all other requests (HTML, CSS, images), use cache-first strategy
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
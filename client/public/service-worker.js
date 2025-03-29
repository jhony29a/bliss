// Service Worker for Bliss Dating App
const CACHE_NAME = 'bliss-cache-v1';

// Assets to cache on install for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS and JS files will be auto-cached when the app loads
];

// Install event - caches static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache -', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine if a request is for an API
const isApiRequest = (url) => {
  return url.pathname.startsWith('/api/');
};

// Helper function to determine if a request is for an asset
const isAssetRequest = (url) => {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(url.pathname);
};

// Main fetch event handler
self.addEventListener('fetch', (event) => {
  // Clone the request to avoid consuming it
  const requestUrl = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (requestUrl.origin !== location.origin) {
    return;
  }
  
  // For API requests, try network first, then fail gracefully
  if (isApiRequest(requestUrl)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Você está offline. Por favor, reconecte para usar esta funcionalidade.' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // For asset requests (CSS, JS, images), use cache-first strategy
  if (isAssetRequest(requestUrl)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache, fetch from network and cache for future
          return fetch(event.request)
            .then((response) => {
              // Don't cache non-ok responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response - one to return, one to cache
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // If fetch fails, show a generic offline page for assets
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/');
              }
              
              return new Response('Falha ao carregar o recurso. Você está offline.', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
    );
    return;
  }
  
  // For HTML pages, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then((cachedResponse) => {
            // If the main page is in the cache, return it
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If nothing in cache, return cached home page
            return caches.match('/');
          });
      })
  );
});

// Background sync for failed operations when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-likes') {
    event.waitUntil(syncLikes());
  }
});

// Function to sync pending messages
async function syncMessages() {
  try {
    const db = await openDatabase();
    const pendingMessages = await db.getAll('pendingMessages');
    
    await Promise.all(pendingMessages.map(async (message) => {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        
        if (response.ok) {
          await db.delete('pendingMessages', message.id);
        }
      } catch (err) {
        console.error('Failed to sync message:', err);
      }
    }));
  } catch (err) {
    console.error('Error syncing messages:', err);
  }
}

// Function to sync pending likes
async function syncLikes() {
  try {
    const db = await openDatabase();
    const pendingLikes = await db.getAll('pendingLikes');
    
    await Promise.all(pendingLikes.map(async (like) => {
      try {
        const response = await fetch('/api/swipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(like),
        });
        
        if (response.ok) {
          await db.delete('pendingLikes', like.id);
        }
      } catch (err) {
        console.error('Failed to sync like:', err);
      }
    }));
  } catch (err) {
    console.error('Error syncing likes:', err);
  }
}

// Simplified IndexedDB wrapper for offline data
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bliss-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingLikes')) {
        db.createObjectStore('pendingLikes', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      
      // Simplified IndexedDB API
      resolve({
        add: (store, item) => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(store, 'readwrite');
            const objStore = tx.objectStore(store);
            const req = objStore.add(item);
            
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
            
            tx.oncomplete = () => db.close();
          });
        },
        
        getAll: (store) => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(store, 'readonly');
            const objStore = tx.objectStore(store);
            const req = objStore.getAll();
            
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
            
            tx.oncomplete = () => db.close();
          });
        },
        
        delete: (store, id) => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(store, 'readwrite');
            const objStore = tx.objectStore(store);
            const req = objStore.delete(id);
            
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
            
            tx.oncomplete = () => db.close();
          });
        }
      });
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
      data: {
        url: data.url || '/'
      },
      actions: [
        {
          action: 'view',
          title: 'Ver',
        },
        {
          action: 'close',
          title: 'Fechar',
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Bliss', options)
    );
  } catch (e) {
    console.error('Error showing notification:', e);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  // Navigate to the relevant URL when clicking the notification
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then((clientList) => {
        const url = event.notification.data.url;
        
        // If we have a client already open, focus it
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
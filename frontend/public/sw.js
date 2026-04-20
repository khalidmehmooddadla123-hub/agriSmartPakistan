const CACHE_NAME = 'agrismart360-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
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

// Fetch — only handle same-origin GET for static assets; never intercept API / HMR / navigations
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/socket.io/')) return;
  if (url.pathname.includes('/@vite/')) return;
  if (url.pathname.includes('/@react-refresh')) return;
  if (url.pathname.includes('/@fs/')) return;
  if (url.pathname.includes('/node_modules/')) return;
  if (url.pathname.endsWith('.hot-update.json')) return;
  if (url.search.includes('import') || url.search.includes('t=')) return;

  // Do NOT intercept navigations — let the browser + SPA router handle them
  if (request.mode === 'navigate') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = (() => { try { return event.data?.json() || {}; } catch { return {}; } })();
  const title = data.title || 'AgriSmart360';
  const options = {
    body: data.message || data.body || 'New notification',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    tag: data.type || 'default',
    data: { url: data.url || '/notifications' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

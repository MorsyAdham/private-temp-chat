// Service worker — enables PWA install prompt on Android Chrome
// Stale-while-revalidate for app files: cached response served instantly,
// then refreshed from the network in the background for the next load.
const CACHE = 'our-room-v16';
const STATIC = [
    '/', '/index.html', '/style.css', '/manifest.json', '/icon.svg', '/icon-192.png', '/icon-512.png',
    '/js/config.js', '/js/auth.js', '/js/utils.js', '/js/chat-core.js', '/js/render.js',
    '/js/receipts-notifications.js', '/js/ui-todo.js', '/js/media.js', '/js/theme-pwa.js', '/js/events.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll(STATIC).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('push', e => {
    let data = { title: '💕 Just us', body: 'New message' };
    try { data = e.data.json(); } catch (_) {}
    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            // SVG icons are unreliable for the Notification API (Chrome/Android often
            // silently fail to render them and fall back to a generic bell) — use PNGs.
            icon: '/icon-512.png',
            badge: '/icon-192.png',
            tag: 'chat-message',
            renotify: true,
            vibrate: [100, 50, 100]
        })
    );
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wcs => {
            if (wcs.length > 0) return wcs[0].focus();
            return clients.openWindow('/');
        })
    );
});

self.addEventListener('fetch', e => {
    // Only handle same-origin GET requests — skip ALL cross-origin (Supabase, fonts, CDN)
    if (e.request.method !== 'GET') return;
    if (!e.request.url.startsWith(self.location.origin)) return;

    // Stale-while-revalidate: serve cache instantly if we have it, refresh in the background.
    // HTML is still network-first so a hard refresh always sees a new deploy right away.
    const isHtml = e.request.mode === 'navigate' || e.request.destination === 'document';

    e.respondWith(
        caches.open(CACHE).then(async cache => {
            const cached = await cache.match(e.request);

            const networkFetch = fetch(e.request).then(res => {
                if (res.ok) cache.put(e.request, res.clone());
                return res;
            }).catch(() => cached);

            if (isHtml) return networkFetch.catch(() => cached);
            if (cached) {
                networkFetch.catch(() => {});
                return cached;
            }
            return networkFetch;
        })
    );
});

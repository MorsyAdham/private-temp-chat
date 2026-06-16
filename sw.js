// Service worker — enables PWA install prompt on Android Chrome
// Network-first for app files so updates are always picked up on normal refresh.
// Falls back to cache only when offline.
const CACHE = 'our-room-v7';
const STATIC = ['/', '/index.html', '/style.css', '/app.js', '/manifest.json', '/icon.svg'];

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
            icon: '/icon.svg',
            badge: '/icon.svg',
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

    // Network-first: always try the network, fall back to cache when offline
    e.respondWith(
        fetch(e.request).then(res => {
            if (res.ok) {
                const clone = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
            }
            return res;
        }).catch(() => caches.match(e.request))
    );
});

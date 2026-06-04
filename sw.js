// Service worker — enables PWA install prompt on Android Chrome
// Only caches same-origin static files. Never intercepts API / cross-origin requests.
const CACHE = 'our-room-v1';
const STATIC = ['/', '/index.html', '/style.css', '/app.js', '/manifest.json', '/icon.svg'];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
    // Only handle same-origin GET requests — skip ALL cross-origin (Supabase, fonts, CDN)
    if (e.request.method !== 'GET') return;
    if (!e.request.url.startsWith(self.location.origin)) return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res.ok) {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            });
        })
    );
});

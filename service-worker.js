const cacheName = 'cgpa-tracker-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/service-worker.js',
  '/favicon.ico'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== cacheName ? caches.delete(key) : null))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
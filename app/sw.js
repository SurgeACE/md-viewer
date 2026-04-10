/* ============================================
   MDView — Service Worker
   Network-first for dev agility, cache fallback for offline
   Bump CACHE_VERSION on every deploy to bust stale caches
   ============================================ */

const CACHE_VERSION = 2;
const CACHE_NAME = `mdview-v${CACHE_VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './css/theme.css',
  './css/editor.css',
  './css/home.css',
  './css/profile.css',
  './css/animations.css',
  './js/app.js',
  './js/store.js',
  './js/router.js',
  './js/theme.js',
  './js/markdown.js',
  './js/screens/profile.js',
  './js/screens/home.js',
  './js/screens/editor.js',
  'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js',
  'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js',
  'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css'
];

// Install: pre-cache assets, skip waiting to activate immediately
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: purge ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: NETWORK-FIRST — always try fresh, fall back to cache for offline
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Clone and update cache with fresh copy
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

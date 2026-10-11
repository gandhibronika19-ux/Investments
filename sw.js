/* Rupee Ledger service worker: app files network-first (always fresh online, cached offline). */
const CACHE = 'rupee-ledger-v1.0.0';
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/app.css",
  "js/config.js",
  "js/vendor/chart.umd.js",
  "js/vendor/supabase.js",
  "js/engine.js",
  "js/sample.js",
  "js/app-core.js",
  "js/app-forms.js",
  "js/app-views.js",
  "js/app-views2.js",
  "js/app-views3.js",
  "icons/icon-192.png",
  "icons/icon-512.png"
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('supabase.in')) return; // never cache your financial data
  if (url.origin === location.origin) {
    // network-first for the app's own files: online you always get the latest deploy and config,
    // offline you get the cached copy
    e.respondWith(caches.open(CACHE).then((c) => fetch(req).then((r) => { if (r && r.ok) c.put(req, r.clone()); return r; })
      .catch(() => c.match(req, { ignoreSearch: true }).then((hit) => hit || c.match('index.html')))));
  } else if (url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com')) {
    // fonts: cache-first
    e.respondWith(caches.open(CACHE).then(async (c) => (await c.match(req)) || fetch(req).then((r) => { c.put(req, r.clone()); return r; })));
  }
});

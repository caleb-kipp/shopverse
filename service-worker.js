const CACHE_NAME = "shopverse-cache-v1";
const OFFLINE_URL = "offline.html";

// Pre-cache important files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "./",              // index.html
        "./index.html",
        "./offline.html",
        "./styles.css",    // your CSS file (adjust name)
        "./script.js",     // your JS file (adjust name)
        "./icon-192.png",
        "./icon-512.png"
      ]);
    })
  );
  self.skipWaiting();
});

// Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // For page navigations
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    // For CSS/JS/images
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
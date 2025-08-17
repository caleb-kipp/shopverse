const CACHE_NAME = "shopverse-cache-v2";
const OFFLINE_PAGE = "/offline.html";

// Install core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_PAGE,
        "/index.html",
        "/icon-192-any.png",
        "/icon-512-any.png",
        "/icon-192-maskable.png",
        "/icon-512-maskable.png"
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_PAGE))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((resp) => {
        return resp || fetch(event.request);
      })
    );
  }
});

// Background Sync - retry failed requests (e.g., add to cart)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-cart") {
    event.waitUntil(sendCartData());
  }
});

async function sendCartData() {
  console.log("✅ Retrying cart sync...");
  // Example: POST offline cart to server
  // await fetch("/api/sync-cart", { method: "POST", body: JSON.stringify(cartData) });
}

// Periodic Sync - update products in background
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "update-products") {
    event.waitUntil(fetch("/api/products").then(() => {
      console.log("✅ Products updated in background");
    }));
  }
});

// Push Notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "ShopVerse", {
      body: data.body || "Check out our latest deals!",
      icon: "/icon-192-any.png",
      badge: "/icon-192-maskable.png"
    })
  );
});
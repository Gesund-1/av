/* ============================================
   SERVICE WORKER — PWA Portal Berita Termux
   ============================================ */

const CACHE_NAME = "berita-termux-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
];

// Install
self.addEventListener("install", function (event) {
  console.log("[SW] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS).catch(function (err) {
        console.log("[SW] Gagal cache asset:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", function (event) {
  console.log("[SW] Activate");
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", function (event) {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  // API (Serveo) — network-first
  if (url.hostname.includes("serveousercontent.com")) {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone).catch(function(){});
          });
          return response;
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || new Response(
              JSON.stringify({ sukses: false, pesan: "Offline" }),
              { headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
    return;
  }

  // Static — cache-first
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (response.status === 200 && url.origin === location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone).catch(function(){});
          });
        }
        return response;
      }).catch(function () {
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});

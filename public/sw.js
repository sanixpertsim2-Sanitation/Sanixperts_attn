const CACHE_NAME = "sanitation-shell-v2";
const CORE_ASSETS = [
  "/",
  "/dashboard",
  "/macy/lines",
  "/cleaning-log",
  "/help",
  "/manifest.json",
  "/favicon.ico",
  "/assets/give-go-sanixpert-logo.png",
  "/styles/safari.css",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

const RESPONSIVE_ASSETS = [
  "/assets/hero-glow.png",
  "/assets/hero-glow.webm",
  "/assets/launch.mp4",
  "/assets/macy.jpg",
  "/assets/jfk.jpg",
  "/assets/cece.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        // Cache core assets first (essential for offline)
        await cache.addAll(CORE_ASSETS);
        
        // Cache responsive assets with error handling
        const responsivePromises = RESPONSIVE_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset);
            if (response.ok) {
              await cache.put(asset, response);
            }
          } catch (error) {
            // Silently fail for non-essential responsive assets
            console.warn(`Failed to cache ${asset}:`, error);
          }
        });
        
        await Promise.allSettled(responsivePromises);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
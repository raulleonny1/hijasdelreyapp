/* La Orden de las Hijas del Rey — service worker (requerido para instalar en Android).
 * - No toca /api/* (auth y respuestas)
 * - Fetch handler siempre presente (criterio de instalabilidad de Chrome)
 */
const CACHE = "hdr-static-v3";
const PRECACHE = [
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/logo.jpeg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navegación: red primero; offline → página de respaldo
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match("/offline.html");
        return cached || new Response("Sin conexión", { status: 503, statusText: "Offline" });
      }),
    );
    return;
  }

  const isStatic =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.png" ||
    url.pathname === "/apple-touch-icon.png" ||
    url.pathname === "/logo.jpeg" ||
    url.pathname === "/offline.html" ||
    /\.(?:png|jpe?g|webp|svg|ico|woff2?|m4a|mp3)$/i.test(url.pathname);

  if (!isStatic) {
    // Chrome exige un fetch handler; para el resto dejamos pasar a la red
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        if (cached) return cached;
        throw new Error("offline");
      }
    }),
  );
});

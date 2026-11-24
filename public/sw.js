/* Billu Class service worker: lets saved pages open offline. */
const PAGES = "cheatjs-pages-v1";
const ASSETS = "cheatjs-assets-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => ![PAGES, ASSETS].includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  const accept = req.headers.get("accept") || "";
  const isPage = req.mode === "navigate" || accept.includes("text/html");
  const isRsc = url.searchParams.has("_rsc");

  // Pages: network first, fall back to the saved copy
  if (isPage && !isRsc) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES);
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(url.pathname + url.search, res.clone());
          return res;
        } catch {
          const hit = (await cache.match(url.pathname + url.search)) || (await cache.match(url.pathname));
          if (hit) return hit;
          const home = await cache.match(new URL("study", self.registration.scope).pathname);
          if (home) return home;
          return new Response("<h1>Offline</h1><p>Open the Study page once while online and press “Save for offline”.</p>", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
            status: 503,
          });
        }
      })()
    );
    return;
  }

  // Static files: cache first
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || /\.(woff2?|png|svg|ico|css|js)$/.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSETS);
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })()
    );
    return;
  }

  // Search index: network first, saved copy offline
  if (url.pathname === "/search-index.json") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES);
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return (await cache.match(req)) || new Response("[]", { headers: { "Content-Type": "application/json" } });
        }
      })()
    );
  }
});

const CACHE = "mokpo-watersafe-v2";
const SHELL = ["/", "/map", "/safety", "/facilities", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Kakao Maps, Supabase, Vercel and other third-party resources must be
  // handled directly by the browser. Returning our HTML fallback for an
  // external script causes strict MIME-type failures.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Only document navigations may fall back to the cached app shell.
        // Scripts, manifests and JSON must keep their correct MIME type.
        if (request.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }

        return new Response("Offline resource unavailable", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }),
  );
});

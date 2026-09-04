/*
 * Loan Calculator Pro — service worker.
 *
 * The calculators do all their arithmetic in the browser, so once the page
 * itself is on the device there is genuinely nothing left to fetch: working out
 * an EMI or a SIP maturity offline gives exactly the same answer as online.
 * That is what this caches for. The rates tables and the blog come from the
 * database and are honestly unavailable without a connection.
 *
 * Deliberately NOT cached:
 *   /api/*    — responses depend on the caller and some are writes.
 *   /admin/*  — session-specific pages. A cached copy would be a privacy leak
 *               as well as wrong, since it could be served to a signed-out
 *               visitor on a shared device.
 *   RSC payloads — Next's client navigations fetch these; a stale one breaks
 *               routing in ways that are hard to diagnose.
 *
 * Bump VERSION to retire every cache from the previous release.
 */

const VERSION = "v1";
const PAGE_CACHE = `lcp-pages-${VERSION}`;
const ASSET_CACHE = `lcp-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

/** Seeded on install so the app works offline even on a first cold launch. */
const PRECACHE = ["/", OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      // `cache: "reload"` bypasses the HTTP cache, so a fresh install never
      // seeds itself from a stale copy of the previous deploy.
      await Promise.allSettled(
        PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" }))),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("lcp-") && k !== PAGE_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Content-hashed build output: the URL changes when the file does. */
async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

/**
 * Pages: always prefer the network so rates and posts are current, and fall
 * back to the last copy of this page, then to the offline notice.
 */
async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;

    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;

    return new Response("You are offline.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Third-party requests (ads, fonts, analytics) are left entirely alone.
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/admin")) return;

  // Next's client-side navigation payloads must always come from the network.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  }
});

/** Lets the page trigger an immediate update instead of waiting for a reload. */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

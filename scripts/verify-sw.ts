/**
 * Exercises public/sw.js against a stubbed Service Worker environment.
 *
 *   npm run verify:sw
 *
 * A service worker sits in front of every request the site makes, so a mistake
 * in its routing is not a cosmetic bug: caching an /admin page would serve one
 * operator's session to the next visitor on a shared device, and caching an RSC
 * payload breaks navigation in ways that only show up on a stale deploy.
 *
 * Browsers will not let us assert any of that from a test page, so the worker
 * is loaded here into a fake global scope with stub Cache and fetch
 * implementations, and its handlers are driven directly.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

let failures = 0;

function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(
    `  ${ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? `  — ${detail}` : ""}`,
  );
}

const head = (s: string) => console.log(`\n\x1b[1m${s}\x1b[0m`);

/* ------------------------------------------------------------------ */
/* Stub environment                                                    */
/* ------------------------------------------------------------------ */

/** Minimal in-memory stand-in for the Cache API, keyed by request URL. */
class FakeCache {
  store = new Map<string, unknown>();
  added: string[] = [];

  async match(req: { url: string } | string) {
    const key = typeof req === "string" ? new URL(req, ORIGIN).href : req.url;
    return this.store.get(key) ?? undefined;
  }
  async put(req: { url: string } | string, res: unknown) {
    const key = typeof req === "string" ? new URL(req, ORIGIN).href : req.url;
    this.store.set(key, res);
  }
  async add(req: { url: string }) {
    this.added.push(req.url);
    this.store.set(req.url, { ok: true, from: "precache", url: req.url });
  }
}

const ORIGIN = "https://loancalculatorpro.in";
const caches = new Map<string, FakeCache>();
const deletedCaches: string[] = [];

const cacheStorage = {
  async open(name: string) {
    if (!caches.has(name)) caches.set(name, new FakeCache());
    return caches.get(name)!;
  },
  async keys() {
    return [...caches.keys()];
  },
  async delete(name: string) {
    deletedCaches.push(name);
    return caches.delete(name);
  },
};

/** Requests whose URL contains this string make fetch() reject. */
let offlineMarker: string | null = null;
const fetchLog: string[] = [];

async function fakeFetch(req: { url: string } | string) {
  const url = typeof req === "string" ? req : req.url;
  fetchLog.push(url);
  if (offlineMarker !== null && url.includes(offlineMarker)) {
    throw new TypeError("Failed to fetch");
  }
  return { ok: true, from: "network", url, clone: () => ({ from: "network", url }) };
}

type Listener = (event: Record<string, unknown>) => void;
const listeners: Record<string, Listener> = {};

const self: Record<string, unknown> = {
  location: { origin: ORIGIN },
  addEventListener: (type: string, fn: Listener) => {
    listeners[type] = fn;
  },
  skipWaiting: async () => {},
  clients: { claim: async () => {} },
};

const sandbox = {
  self,
  caches: cacheStorage,
  fetch: fakeFetch,
  URL,
  Request: class {
    url: string;
    cache?: string;
    constructor(url: string, init?: { cache?: string }) {
      this.url = new URL(url, ORIGIN).href;
      this.cache = init?.cache;
    }
  },
  Response: class {
    body: unknown;
    status: number;
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status ?? 200;
    }
  },
  Promise,
  console,
};

const source = readFileSync(join(process.cwd(), "public", "sw.js"), "utf8");
runInNewContext(source, sandbox);

check("worker registers install/activate/fetch handlers", ["install", "activate", "fetch"].every((t) => typeof listeners[t] === "function"));

/** Drives one handler and waits for whatever it passed to waitUntil. */
async function dispatch(type: string, event: Record<string, unknown>) {
  const waits: Promise<unknown>[] = [];
  const responses: Promise<unknown>[] = [];
  listeners[type]({
    ...event,
    waitUntil: (p: Promise<unknown>) => waits.push(p),
    respondWith: (p: Promise<unknown>) => responses.push(p),
  });
  await Promise.all(waits);
  return responses;
}

/** Builds a request object shaped like the fields sw.js actually reads. */
function request(
  path: string,
  opts: { method?: string; mode?: string; headers?: Record<string, string> } = {},
) {
  const headers = opts.headers ?? {};
  return {
    url: new URL(path, ORIGIN).href,
    method: opts.method ?? "GET",
    mode: opts.mode ?? "no-cors",
    headers: { get: (k: string) => headers[k] ?? headers[k.toUpperCase()] ?? null },
  };
}

const nav = (path: string) => request(path, { mode: "navigate" });

async function main() {
  /* ---------------------------------------------------------------- */
  head("Install — seeds the offline shell");
  await dispatch("install", {});
  const pageCache = [...caches.entries()].find(([k]) => k.startsWith("lcp-pages-"))?.[1];
  check("a versioned page cache is created", Boolean(pageCache), [...caches.keys()].join(", "));
  check(
    "precaches the homepage and the offline page",
    Boolean(
      pageCache?.added.some((u) => u.endsWith("/")) &&
        pageCache?.added.some((u) => u.endsWith("/offline")),
    ),
    pageCache?.added.join(", "),
  );

  /* ---------------------------------------------------------------- */
  head("Activate — retires previous versions");
  caches.set("lcp-pages-v0", new FakeCache());
  caches.set("lcp-assets-v0", new FakeCache());
  caches.set("some-other-app-cache", new FakeCache());
  await dispatch("activate", {});
  check("deletes the previous release's page cache", deletedCaches.includes("lcp-pages-v0"));
  check("deletes the previous release's asset cache", deletedCaches.includes("lcp-assets-v0"));
  check(
    "leaves caches belonging to anything else alone",
    !deletedCaches.includes("some-other-app-cache"),
  );
  check(
    "keeps the current version",
    [...caches.keys()].some((k) => k.startsWith("lcp-pages-")),
  );

  /* ---------------------------------------------------------------- */
  head("Fetch — requests the worker must not touch");
  const untouched: [string, ReturnType<typeof request>][] = [
    ["POST (a form submission)", request("/", { method: "POST", mode: "navigate" })],
    ["/api/feedback", request("/api/feedback")],
    ["/api/admin/login", request("/api/admin/login", { mode: "navigate" })],
    ["/admin dashboard", nav("/admin")],
    ["/admin/scheme-rates", nav("/admin/scheme-rates")],
    ["RSC payload by query param", request("/sip-calculator?_rsc=abc12", { mode: "navigate" })],
    ["RSC payload by header", request("/sip-calculator", { mode: "navigate", headers: { RSC: "1" } })],
    ["a third-party script", request("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")],
    ["a same-origin XHR that is not a navigation", request("/blog")],
  ];

  for (const [name, req] of untouched) {
    const responses = await dispatch("fetch", { request: req });
    check(`leaves ${name} to the network`, responses.length === 0);
  }

  /* ---------------------------------------------------------------- */
  head("Fetch — build assets are cache-first");
  const assetReq = request("/_next/static/chunks/main-abc123.js");
  fetchLog.length = 0;
  const first = await dispatch("fetch", { request: assetReq });
  await Promise.all(first);
  check("first request goes to the network", fetchLog.length === 1);

  fetchLog.length = 0;
  const second = await dispatch("fetch", { request: assetReq });
  const secondBody = (await second[0]) as { from: string };
  check("second request is served from cache", fetchLog.length === 0 && secondBody.from === "network", `fetches: ${fetchLog.length}`);

  /* ---------------------------------------------------------------- */
  head("Fetch — pages are network-first");
  offlineMarker = null;
  fetchLog.length = 0;
  const online = await dispatch("fetch", { request: nav("/sip-calculator") });
  const onlineBody = (await online[0]) as { from: string };
  check("online: served fresh from the network", onlineBody.from === "network" && fetchLog.length === 1);

  head("Fetch — offline behaviour");
  offlineMarker = ORIGIN;
  const cached = await dispatch("fetch", { request: nav("/sip-calculator") });
  const cachedBody = (await cached[0]) as { url: string };
  check(
    "a page visited before is served from cache",
    cachedBody?.url?.endsWith("/sip-calculator"),
    String(cachedBody?.url),
  );

  const never = await dispatch("fetch", { request: nav("/bank-interest-rates/home-loan") });
  const neverBody = (await never[0]) as { from?: string; url?: string; status?: number };
  check(
    "a page never visited falls back to the offline page",
    neverBody?.url?.endsWith("/offline") === true,
    JSON.stringify(neverBody),
  );

  /* ---------------------------------------------------------------- */
  head("Privacy — nothing sensitive reached a cache");
  const allKeys = [...caches.values()].flatMap((c) => [...c.store.keys()]);
  check(
    "no /admin URL was ever cached",
    !allKeys.some((k) => k.includes("/admin")),
    allKeys.filter((k) => k.includes("/admin")).join(", "),
  );
  check(
    "no /api URL was ever cached",
    !allKeys.some((k) => k.includes("/api")),
    allKeys.filter((k) => k.includes("/api")).join(", "),
  );
  check("no RSC payload was cached", !allKeys.some((k) => k.includes("_rsc")));

  console.log(
    failures === 0
      ? "\n\x1b[32mAll service worker checks passed.\x1b[0m\n"
      : `\n\x1b[31m${failures} check(s) failed.\x1b[0m\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main();

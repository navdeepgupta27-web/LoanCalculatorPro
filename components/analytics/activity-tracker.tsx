"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * First-party, cookie-free page and event tracking.
 *
 * What is stored: a random session id (sessionStorage, gone when the tab
 * closes), the path, the referrer host, a coarse device bucket and a salted
 * one-way hash of the IP. No cookie, no cross-site identifier, no raw IP.
 * Visitors sending Do Not Track are skipped entirely — the site advertises
 * itself as private, so it should behave that way.
 */

const SESSION_KEY = "lcp_sid";
const ENDPOINT = "/api/track";

function doNotTrack(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { msDoNotTrack?: string };
  const win = window as Window & { doNotTrack?: string };
  const signal = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack;
  return signal === "1" || signal === "yes";
}

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

function send(payload: Record<string, unknown>) {
  if (doNotTrack()) return;
  const body = JSON.stringify({ ...payload, sessionId: sessionId() });
  try {
    // sendBeacon survives the page unloading, and never blocks navigation.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

/** Records a named interaction, e.g. `trackEvent("calculate", { loanType })`. */
export function trackEvent(event: string, meta?: Record<string, unknown>) {
  send({
    event,
    path: typeof window !== "undefined" ? window.location.pathname : null,
    meta: meta ?? null,
  });
}

export function ActivityTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // The admin area is a private tool, not audience traffic — never log it.
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    // Defer past first paint so tracking never competes with rendering.
    const id = window.setTimeout(() => {
      send({
        event: "pageview",
        path: pathname,
        referrer: document.referrer || null,
      });
    }, 350);

    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

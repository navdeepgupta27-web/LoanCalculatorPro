"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Registers the service worker and offers the app for installation.
 *
 * Two very different paths, because the platforms differ:
 *
 *  - Chrome (Android, desktop) fires `beforeinstallprompt` once it decides the
 *    visitor is engaged enough. We hold onto that event and show our own card,
 *    so the offer appears in the app's own voice rather than as a browser bar.
 *
 *  - Safari on iOS fires nothing and has no install API at all. The user has to
 *    go through Share -> Add to Home Screen, so all we can do is say so — and
 *    only after they have stuck around long enough to plausibly want it.
 *
 * Dismissal is remembered, because an install nag that returns on every page is
 * worse than no install prompt.
 */

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "lcp-install-dismissed";
/** How long a dismissal lasts before we are allowed to ask again. */
const DISMISS_DAYS = 60;
/** Safari gives no engagement signal, so time on the page stands in for one. */
const IOS_DELAY_MS = 25_000;

function wasDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return true;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    // Private windows and blocked site data both throw. Treat that as "never
    // asked" rather than failing to render.
    return false;
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari's own non-standard flag, still the only reliable check on iOS.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  // Chrome and Firefox on iOS cannot install to the home screen at all, so
  // showing them the Share-sheet instructions would be a dead end.
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return iOS && safari;
}

export function InstallPrompt() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Register the service worker. Kept out of development, where a cached shell
  // fights every edit you make.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // An unavailable service worker costs offline support and nothing else,
        // so there is nothing useful to tell the visitor.
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return;

    const onPrompt = (event: Event) => {
      // Suppress Chrome's own bar so ours is the only offer on screen.
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
    };

    const onInstalled = () => setDeferred(null);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIosSafari()) {
      timer = setTimeout(() => setShowIosHint(true), IOS_DELAY_MS);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDeferred(null);
    setShowIosHint(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Nothing to do — the prompt simply reappears next visit.
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // The visitor closed the browser's dialog; nothing to report.
    } finally {
      setInstalling(false);
      // The event can only be used once, whichever way it went.
      setDeferred(null);
    }
  }, [deferred]);

  // The admin area is a desk tool, not something anyone installs.
  if (pathname.startsWith("/admin")) return null;

  const visible = deferred !== null || showIosHint;
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Loan Calculator Pro"
      className="fixed bottom-20 left-4 z-[100] w-[min(21rem,calc(100vw-2rem))] lg:bottom-5 no-print"
    >
      <div className="card animate-[fade-up_0.35s_var(--ease-out-expo)_both] p-4 shadow-[var(--shadow-lift)]">
        <div className="flex items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-xl font-extrabold text-white"
            aria-hidden="true"
          >
            ₹
          </span>

          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold text-[var(--text)]">
              Add to your home screen
            </p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--text-secondary)]">
              {showIosHint ? (
                <>
                  Tap <strong className="text-[var(--text)]">Share</strong>, then{" "}
                  <strong className="text-[var(--text)]">Add to Home Screen</strong>. The
                  calculators then work without a signal.
                </>
              ) : (
                <>Opens full screen and keeps working without a signal.</>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        {deferred && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={install}
              disabled={installing}
              className="flex-1 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              {installing ? "Installing…" : "Install"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

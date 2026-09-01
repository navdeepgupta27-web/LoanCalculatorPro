"use client";

import { useEffect, useRef } from "react";

import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdFormat = "auto" | "fluid" | "rectangle" | "horizontal";

interface AdSlotProps {
  /** The data-ad-slot id from your AdSense dashboard. */
  slot?: string;
  format?: AdFormat;
  layoutKey?: string;
  className?: string;
  /** Reserve height so the ad does not shift content when it loads. */
  minHeight?: number;
  label?: boolean;
}

/**
 * A single AdSense display unit.
 *
 * The AdSense loader script is included once in the root layout; this component
 * only renders the `<ins>` element and pushes it into the queue. The original
 * static page repeated the loader four times and never emitted an `<ins>` at
 * all, which is why no ad ever appeared.
 *
 * With no `slot` configured the component renders nothing in production —
 * pushing an empty unit is an AdSense policy violation, and an empty grey box
 * is worse for users than no box.
 */
export function AdSlot({
  slot,
  format = "auto",
  layoutKey,
  className,
  minHeight = 100,
  label = true,
}: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current) return;
    // React 18/19 double-invokes effects in dev; the guard stops a duplicate
    // push, which AdSense rejects with "already have ads in them".
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* blocked by an ad blocker, or the script has not loaded — harmless */
    }
  }, [slot]);

  if (!slot) {
    if (process.env.NODE_ENV !== "production") {
      return (
        <div
          className={cn(
            "ad-slot my-6 grid place-items-center rounded-xl border-2 border-dashed border-[var(--border)] px-4 text-center text-xs text-[var(--text-muted)]",
            className,
          )}
          style={{ minHeight }}
        >
          Ad slot — set the matching NEXT_PUBLIC_ADSENSE_SLOT_* env var to activate
        </div>
      );
    }
    return null;
  }

  return (
    <div className={cn("ad-slot my-6 w-full overflow-hidden text-center", className)}>
      {label && (
        <p className="mb-1 text-[0.625rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Advertisement
        </p>
      )}
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block", minHeight }}
        data-ad-client={SITE.adsenseClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Preconfigured placements                                            */
/* ------------------------------------------------------------------ */

export function AdLeaderboard({ className }: { className?: string }) {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP}
      format="horizontal"
      minHeight={90}
      className={cn("mx-auto max-w-3xl", className)}
    />
  );
}

export function AdInArticle({ className }: { className?: string }) {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE}
      format="fluid"
      layoutKey="-fb+5w+4e-db+86"
      minHeight={200}
      className={className}
    />
  );
}

export function AdSidebar({ className }: { className?: string }) {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
      format="rectangle"
      minHeight={250}
      className={className}
    />
  );
}

export function AdFooter({ className }: { className?: string }) {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM}
      format="horizontal"
      minHeight={90}
      className={cn("mx-auto max-w-3xl", className)}
    />
  );
}

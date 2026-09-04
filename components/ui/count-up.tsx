"use client";

import { useEffect, useRef, useState } from "react";

import { useFormat } from "@/components/country/country-provider";
import type { Formatters } from "@/lib/format";

type Formatter = "currency" | "compact" | "number" | "percent";

interface CountUpProps {
  value: number;
  format?: Formatter;
  decimals?: number;
  durationMs?: number;
  className?: string;
}

/** Takes the formatters as an argument — it sits outside any component, so it
 *  cannot reach the country context itself. */
function render(
  value: number,
  format: Formatter,
  decimals: number,
  fmt: Formatters,
): string {
  switch (format) {
    case "currency":
      return fmt.currency(value, decimals);
    case "compact":
      return fmt.compact(value);
    case "percent":
      return `${value.toFixed(decimals)}%`;
    default:
      return fmt.number(value);
  }
}

/**
 * Animates a figure from its previous value to the new one.
 *
 * The calculator recalculates on every keystroke, so the tween always starts
 * from whatever is currently on screen rather than from zero — numbers glide
 * between states instead of restarting each time.
 */
export function CountUp({
  value,
  format = "currency",
  decimals = 0,
  durationMs = 700,
  className,
}: CountUpProps) {
  const fmt = useFormat();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;

    /** Land exactly on the target, abandoning any tween in progress. */
    const snap = () => {
      fromRef.current = to;
      setDisplay(to);
    };

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Nothing to tween: a non-finite target, an unchanged value, a reader who
    // asked for less motion, or a hidden tab (where rAF never runs). A
    // zero-delay timer keeps this out of the effect body, where a synchronous
    // setState would cascade a render.
    if (!Number.isFinite(to) || from === to || prefersReduced || document.hidden) {
      const immediate = setTimeout(snap, 0);
      return () => clearTimeout(immediate);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutExpo — fast out of the gate, gentle landing.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    // Browsers suspend rAF while a tab is backgrounded, which would otherwise
    // freeze the figure part-way through a tween — on a finance page that means
    // showing a number that is simply wrong. setTimeout keeps running (merely
    // throttled), so this guarantees the value always lands.
    const guard = setTimeout(snap, durationMs + 300);

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(guard);
    };
  }, [value, durationMs]);

  return (
    <span className={className} suppressHydrationWarning>
      {render(display, format, decimals, fmt)}
    </span>
  );
}

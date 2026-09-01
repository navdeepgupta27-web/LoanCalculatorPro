"use client";

import { useEffect, useRef } from "react";

/**
 * Reading-progress bar pinned under the header.
 *
 * The width is written straight to the DOM node inside a rAF rather than
 * through React state — a scroll handler that re-renders on every frame is a
 * reliable way to make a long amortisation table feel sluggish.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = barRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      el.style.transform = `scaleX(${pct / 100})`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-16 z-40 h-0.5 bg-transparent no-print" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-brand-500 via-brand-400 to-accent-500"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll-reveal animation.
 *
 * A single shared IntersectionObserver serves every `<Reveal>` on the page —
 * one observer for fifty elements rather than fifty observers — and each
 * element is unobserved the moment it has played, so scrolling stays cheap.
 */

let observer: IntersectionObserver | null = null;

function sharedObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer?.unobserve(entry.target);
          }
        }
      },
      // Fire slightly before the element reaches the viewport edge so the
      // animation is already settling by the time it is properly in view.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
  }
  return observer;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger in milliseconds, for lists of cards. */
  delay?: number;
  as?: ElementType;
}

export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = sharedObserver();
    if (!io) {
      // No IntersectionObserver (very old browser): show content immediately
      // rather than leaving it invisible forever.
      el.classList.add("is-visible");
      return;
    }

    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

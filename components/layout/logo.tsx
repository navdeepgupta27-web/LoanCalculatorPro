import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Brand mark: a rupee sign over a descending bar series — the shape of an
 * outstanding balance being paid down, which is what the whole site is about.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Loan Calculator Pro">
      <defs>
        <linearGradient id="lcp-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="55%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#lcp-mark)" />
      {/* Descending bars = the balance falling away over the tenure. */}
      <rect x="10" y="27" width="5" height="11" rx="2" fill="#fff" opacity="0.95" />
      <rect x="18" y="31" width="5" height="7" rx="2" fill="#fff" opacity="0.72" />
      <rect x="26" y="34" width="5" height="4" rx="2" fill="#fff" opacity="0.5" />
      {/* Rupee glyph. */}
      <path
        d="M28 10h10M28 14.6h10M35.6 10c0 4-2.6 4.6-6 4.6h-1.6l8 8.4"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-2.5 transition-opacity hover:opacity-90", className)}
      aria-label="Loan Calculator Pro — home"
    >
      <LogoMark className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3" />
      {showText && (
        <span className="flex flex-col leading-none">
          {/* The full name is long, so it steps down a size on narrow screens
              and never wraps away from the mark. */}
          <span className="whitespace-nowrap font-display text-[0.9375rem] font-extrabold tracking-tight text-[var(--text)] sm:text-[1.0625rem]">
            Loan Calculator <span className="gradient-text">Pro</span>
          </span>
          <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            EMI &amp; Savings
          </span>
        </span>
      )}
    </Link>
  );
}

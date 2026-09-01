import type { ReactNode } from "react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "brand" | "accent" | "amber" | "rose";
  icon?: string;
}) {
  const toneClass = {
    neutral: "text-[var(--text)]",
    brand: "text-brand-600 dark:text-brand-300",
    accent: "text-accent-600 dark:text-accent-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  }[tone];

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
        {icon && <span className="text-base leading-none">{icon}</span>}
      </div>
      <p className={cn("mt-1.5 font-display text-2xl font-extrabold tnum", toneClass)}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Horizontal bars, proportional to the largest row. */
export function BarList({
  title,
  rows,
  emptyLabel = "Nothing recorded yet",
  formatValue = formatNumber,
}: {
  title: string;
  rows: { label: string; value: number; href?: string }[];
  emptyLabel?: string;
  formatValue?: (n: number) => string;
}) {
  const max = rows.length ? Math.max(...rows.map((r) => r.value)) : 0;

  return (
    <div className="card p-5">
      <h2 className="font-display text-sm font-bold text-[var(--text)]">{title}</h2>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">{emptyLabel}</p>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.label} className="relative">
              <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-lg px-2.5 py-1.5">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 rounded-lg bg-brand-500/12 transition-[width] duration-700 ease-[var(--ease-out-expo)]"
                  style={{ width: max > 0 ? `${(row.value / max) * 100}%` : "0%" }}
                />
                <span className="relative truncate text-[0.8125rem] text-[var(--text-secondary)]">
                  {row.href ? (
                    <a
                      href={row.href}
                      className="transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                    >
                      {row.label}
                    </a>
                  ) : (
                    row.label
                  )}
                </span>
                <span className="relative shrink-0 text-[0.8125rem] font-bold text-[var(--text)] tnum">
                  {formatValue(row.value)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * 30-day traffic column chart.
 *
 * Rendered as plain divs rather than SVG — with at most 30 columns it is
 * cheaper, and it keeps this a server component with no client JavaScript.
 */
export function DailyChart({
  data,
  title = "Traffic — last 30 days",
}: {
  data: { day: string; views: number; visitors: number }[];
  title?: string;
}) {
  const max = data.length ? Math.max(...data.map((d) => d.views)) : 0;
  const totalViews = data.reduce((s, d) => s + d.views, 0);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-sm font-bold text-[var(--text)]">{title}</h2>
        <p className="text-xs text-[var(--text-muted)]">
          <strong className="text-[var(--text-secondary)] tnum">{formatNumber(totalViews)}</strong>{" "}
          page views
        </p>
      </div>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          No traffic recorded yet. Visit the live site to generate the first data points.
        </p>
      ) : (
        <>
          <div className="mt-5 flex h-32 items-end gap-[3px]">
            {data.map((d) => (
              <div
                key={d.day}
                className="group relative flex-1 rounded-t-sm bg-brand-500/80 transition-colors hover:bg-brand-500"
                style={{ height: `${max > 0 ? Math.max(2, (d.views / max) * 100) : 2}%` }}
                title={`${d.day}: ${d.views} views, ${d.visitors} visitors`}
              >
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[0.7rem] font-medium shadow-lg group-hover:block">
                  <strong className="tnum">{d.views}</strong> views ·{" "}
                  <strong className="tnum">{d.visitors}</strong> visitors
                  <br />
                  <span className="text-[var(--text-muted)]">{d.day}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[0.7rem] text-[var(--text-muted)]">
            <span>{data[0]?.day}</span>
            <span>{data[data.length - 1]?.day}</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-[var(--text)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

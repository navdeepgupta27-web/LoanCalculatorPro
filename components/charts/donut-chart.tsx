"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * Principal-vs-interest donut.
 *
 * Drawn as SVG arcs rather than with a charting library — the whole component
 * is a few hundred bytes of markup and animates by transitioning
 * `stroke-dasharray`, which the compositor handles on the GPU.
 */
export function DonutChart({
  segments,
  size = 220,
  thickness = 26,
  centerLabel,
  centerValue,
  className,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  // Segments start collapsed and expand on mount so the chart draws itself in.
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Each arc begins where the previous one ended. The start offsets come from a
  // prefix sum rather than a running counter, so nothing is mutated mid-render.
  const arcs = useMemo(() => {
    const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
    const fractions = segments.map((s) => (total > 0 ? Math.max(0, s.value) / total : 0));

    return segments.map((seg, i) => {
      const precedingFraction = fractions
        .slice(0, i)
        .reduce((sum, fraction) => sum + fraction, 0);
      return {
        ...seg,
        index: i,
        fraction: fractions[i],
        length: fractions[i] * circumference,
        offset: precedingFraction * circumference,
      };
    });
  }, [segments, circumference]);

  const active = hovered !== null ? arcs[hovered] : null;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label={`Breakdown: ${segments.map((s) => `${s.label} ${formatCurrency(s.value)}`).join(", ")}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-subtle)"
            strokeWidth={thickness}
          />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={hovered === arc.index ? thickness + 5 : thickness}
              strokeLinecap="butt"
              strokeDasharray={`${mounted ? arc.length : 0} ${circumference}`}
              strokeDashoffset={-arc.offset}
              className="cursor-pointer transition-all duration-[900ms] ease-[var(--ease-out-expo)]"
              onMouseEnter={() => setHovered(arc.index)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {active ? (
            <>
              <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {active.label}
              </span>
              <span className="font-display text-xl font-extrabold tnum" style={{ color: active.color }}>
                {formatCurrency(active.value)}
              </span>
              <span className="text-xs font-medium text-[var(--text-muted)] tnum">
                {(active.fraction * 100).toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              {centerLabel && (
                <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {centerLabel}
                </span>
              )}
              <span className="font-display text-xl font-extrabold text-[var(--text)] tnum sm:text-2xl">
                {centerValue}
              </span>
            </>
          )}
        </div>
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {arcs.map((arc) => (
          <li
            key={arc.label}
            className="flex cursor-pointer items-center gap-2 text-sm"
            onMouseEnter={() => setHovered(arc.index)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: arc.color }} />
            <span className="text-[var(--text-secondary)]">{arc.label}</span>
            <span className="font-semibold text-[var(--text)] tnum">
              {(arc.fraction * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

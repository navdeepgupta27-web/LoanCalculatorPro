"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { formatCompact, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ChartPoint {
  /** Instalment number, 1-based. */
  x: number;
  y: number;
  label: string;
}

export interface ChartSeries {
  name: string;
  color: string;
  points: ChartPoint[];
  /** Dashed line, used for the "without prepayment" baseline. */
  dashed?: boolean;
}

const PAD = { top: 16, right: 14, bottom: 30, left: 56 };

/**
 * Outstanding-balance line/area chart with a hover crosshair.
 *
 * Long tenures produce 360 data points, which is more than a 700px-wide chart
 * can resolve — series are downsampled to at most ~180 points (always keeping
 * the last one so the payoff lands exactly on zero).
 */
export function BalanceChart({
  series,
  height = 260,
  yFormatter = formatCompact,
  className,
}: {
  series: ChartSeries[];
  height?: number;
  yFormatter?: (v: number) => string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.max(320, entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const sampled = useMemo(() => {
    const MAX = 180;
    return series.map((s) => {
      if (s.points.length <= MAX) return s;
      const stride = Math.ceil(s.points.length / MAX);
      const pts = s.points.filter((_, i) => i % stride === 0);
      const last = s.points[s.points.length - 1];
      if (pts[pts.length - 1] !== last) pts.push(last);
      return { ...s, points: pts };
    });
  }, [series]);

  const { maxX, maxY } = useMemo(() => {
    let mx = 1;
    let my = 1;
    for (const s of sampled) {
      for (const p of s.points) {
        if (p.x > mx) mx = p.x;
        if (p.y > my) my = p.y;
      }
    }
    return { maxX: mx, maxY: my * 1.06 };
  }, [sampled]);

  const innerW = Math.max(1, width - PAD.left - PAD.right);
  const innerH = Math.max(1, height - PAD.top - PAD.bottom);

  const sx = (x: number) => PAD.left + (maxX <= 1 ? 0 : ((x - 1) / (maxX - 1)) * innerW);
  const sy = (y: number) => PAD.top + innerH - (y / maxY) * innerH;

  const paths = useMemo(
    () =>
      sampled.map((s) => {
        if (!s.points.length) return { ...s, line: "", area: "" };
        const line = s.points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(" ");
        const first = s.points[0];
        const last = s.points[s.points.length - 1];
        const area = `${line} L${sx(last.x).toFixed(2)},${(PAD.top + innerH).toFixed(2)} L${sx(first.x).toFixed(2)},${(PAD.top + innerH).toFixed(2)} Z`;
        return { ...s, line, area };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sampled, width, height, maxX, maxY],
  );

  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => (maxY / count) * i);
  }, [maxY]);

  const xTicks = useMemo(() => {
    const primary = sampled[0]?.points ?? [];
    if (primary.length < 2) return [];
    const count = Math.min(6, primary.length);
    const step = Math.floor((primary.length - 1) / (count - 1)) || 1;
    const out: ChartPoint[] = [];
    for (let i = 0; i < primary.length; i += step) out.push(primary[i]);
    if (out[out.length - 1] !== primary[primary.length - 1]) out.push(primary[primary.length - 1]);
    return out;
  }, [sampled]);

  const primary = sampled[0]?.points ?? [];

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!primary.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - PAD.left;
    const ratio = Math.min(1, Math.max(0, relX / innerW));
    setHoverIndex(Math.round(ratio * (primary.length - 1)));
  };

  const hoverPoint = hoverIndex !== null ? primary[hoverIndex] : null;

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
        className="touch-pan-y"
        role="img"
        aria-label="Outstanding loan balance over time"
      >
        <defs>
          {paths.map((s, i) => (
            <linearGradient key={s.name} id={`${uid}-g${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={s.dashed ? 0.1 : 0.28} />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal gridlines with value labels on the left. */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={sy(t)}
              x2={width - PAD.right}
              y2={sy(t)}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray={i === 0 ? undefined : "3 5"}
            />
            <text
              x={PAD.left - 9}
              y={sy(t) + 4}
              textAnchor="end"
              className="fill-[var(--text-muted)] text-[10px] font-medium"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {yFormatter(t)}
            </text>
          </g>
        ))}

        {xTicks.map((t) => (
          <text
            key={t.x}
            x={sx(t.x)}
            y={height - 9}
            textAnchor="middle"
            className="fill-[var(--text-muted)] text-[10px] font-medium"
          >
            {t.label}
          </text>
        ))}

        {paths.map((s, i) => (
          <g key={s.name}>
            {!s.dashed && <path d={s.area} fill={`url(#${uid}-g${i})`} className="transition-opacity duration-500" style={{ opacity: drawn ? 1 : 0 }} />}
            <path
              d={s.line}
              fill="none"
              stroke={s.color}
              strokeWidth={s.dashed ? 1.8 : 2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.dashed ? "6 5" : undefined}
              style={
                s.dashed
                  ? { opacity: drawn ? 0.75 : 0 }
                  : {
                      // Draw-in effect: the stroke is revealed from left to right.
                      strokeDasharray: 4000,
                      strokeDashoffset: drawn ? 0 : 4000,
                      transition: "stroke-dashoffset 1.4s var(--ease-out-expo)",
                    }
              }
            />
          </g>
        ))}

        {hoverPoint && (
          <g className="pointer-events-none">
            <line
              x1={sx(hoverPoint.x)}
              y1={PAD.top}
              x2={sx(hoverPoint.x)}
              y2={PAD.top + innerH}
              stroke="var(--text-muted)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            {sampled.map((s) => {
              const p = s.points[Math.min(hoverIndex!, s.points.length - 1)];
              if (!p) return null;
              return (
                <circle
                  key={s.name}
                  cx={sx(p.x)}
                  cy={sy(p.y)}
                  r="4.5"
                  fill="var(--surface)"
                  stroke={s.color}
                  strokeWidth="2.5"
                />
              );
            })}
          </g>
        )}
      </svg>

      {hoverPoint && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[9.5rem] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-lift)]"
          style={{
            left: Math.min(Math.max(sx(hoverPoint.x) - 76, 4), width - 160),
          }}
        >
          <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {hoverPoint.label}
          </p>
          {sampled.map((s) => {
            const p = s.points[Math.min(hoverIndex!, s.points.length - 1)];
            if (!p) return null;
            return (
              <div key={s.name} className="flex items-center justify-between gap-3 py-0.5 text-xs">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="font-semibold text-[var(--text)] tnum">{formatCurrency(p.y)}</span>
              </div>
            );
          })}
        </div>
      )}

      <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
        {series.map((s) => (
          <li key={s.name} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span
              className={cn("h-0.5 w-5 rounded-full", s.dashed && "opacity-60")}
              style={{
                background: s.dashed
                  ? `repeating-linear-gradient(to right, ${s.color} 0 5px, transparent 5px 9px)`
                  : s.color,
              }}
            />
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

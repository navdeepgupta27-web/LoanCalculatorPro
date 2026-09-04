"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import type { SchemeRate } from "@/lib/queries";
import { STATUTORY_SCHEMES, type SchemeConfig } from "@/lib/schemes";
import { cn } from "@/lib/utils";

interface Draft {
  rate: string;
  periodLabel: string;
  sourceUrl: string;
  effectiveDate: string;
  verified: boolean;
  notes: string;
}

function draftFrom(row: SchemeRate | undefined): Draft {
  return {
    rate: row?.rate != null ? String(row.rate) : "",
    periodLabel: row?.period_label ?? "",
    sourceUrl: row?.source_url ?? "",
    effectiveDate: row?.effective_date ?? new Date().toISOString().slice(0, 10),
    verified: row?.verified === 1,
    notes: row?.notes ?? "",
  };
}

export function SchemeRatesEditor({
  rates,
  country,
}: {
  rates: SchemeRate[];
  country: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const rowFor = (id: string) => rates.find((r) => r.scheme_id === id);
  const getDraft = (id: string): Draft => drafts[id] ?? draftFrom(rowFor(id));
  const setDraft = (id: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...getDraft(id), ...patch } }));

  const save = async (scheme: SchemeConfig) => {
    const d = getDraft(scheme.id);
    setSavingId(scheme.id);

    try {
      const res = await fetch("/api/admin/scheme-rates", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          country,
          schemeId: scheme.id,
          rate: d.rate ? Number(d.rate) : null,
          periodLabel: d.periodLabel || null,
          sourceUrl: d.sourceUrl || null,
          effectiveDate: d.effectiveDate || null,
          verified: d.verified,
          notes: d.notes || null,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        toast(json.error ?? "Could not save", "error");
        return;
      }

      toast(`${scheme.shortName} saved`);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[scheme.id];
        return next;
      });
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setSavingId(null);
    }
  };

  const verifiedCount = STATUTORY_SCHEMES.filter(
    (s) => rowFor(s.id)?.verified === 1,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3">
        <p className="text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--text)]">
            {verifiedCount} of {STATUTORY_SCHEMES.length}
          </strong>{" "}
          scheme rates confirmed. Unconfirmed figures still work as calculator defaults but are
          labelled &ldquo;awaiting confirmation&rdquo; wherever they appear publicly.
        </p>
      </div>

      {STATUTORY_SCHEMES.map((scheme) => {
        const row = rowFor(scheme.id);
        const d = getDraft(scheme.id);
        const dirty = drafts[scheme.id] !== undefined;
        const canVerify = Boolean(d.rate && d.sourceUrl);

        return (
          <div
            key={scheme.id}
            className={cn(
              "card p-5 transition-colors",
              dirty && "border-amber-300 dark:border-amber-800",
              row?.verified === 1 && !dirty && "border-accent-300 dark:border-accent-800",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-[var(--text)]">
                <span className="text-lg">{scheme.emoji}</span>
                {scheme.name.replace(" Calculator", "")}
                {row?.verified === 1 ? (
                  <Badge tone="accent">Confirmed</Badge>
                ) : row?.rate != null ? (
                  <Badge tone="amber">Awaiting confirmation</Badge>
                ) : (
                  <Badge>Not set</Badge>
                )}
              </h2>
              {row?.updated_at && (
                <span className="text-xs text-[var(--text-muted)]">
                  updated {formatDateTime(row.updated_at)}
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Rate (% p.a.)
                </span>
                <Input
                  inputMode="decimal"
                  value={d.rate}
                  onChange={(e) => setDraft(scheme.id, { rate: e.target.value })}
                  placeholder="7.1"
                  className="text-sm"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Period
                </span>
                <Input
                  value={d.periodLabel}
                  onChange={(e) => setDraft(scheme.id, { periodLabel: e.target.value })}
                  placeholder="Q2 FY 2026-27 (Jul–Sep 2026)"
                  className="text-sm"
                />
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Source URL
                </span>
                <Input
                  type="url"
                  value={d.sourceUrl}
                  onChange={(e) => setDraft(scheme.id, { sourceUrl: e.target.value })}
                  placeholder="https://www.indiapost.gov.in/..."
                  className="text-sm"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Recorded on
                </span>
                <Input
                  type="date"
                  value={d.effectiveDate}
                  onChange={(e) => setDraft(scheme.id, { effectiveDate: e.target.value })}
                  className="text-sm"
                />
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Notes
                </span>
                <Input
                  value={d.notes}
                  onChange={(e) => setDraft(scheme.id, { notes: e.target.value })}
                  placeholder="Anything worth remembering about this figure"
                  className="text-sm"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--border)] pt-3.5">
              <label
                className={cn(
                  "flex items-center gap-2.5",
                  canVerify ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                )}
                title={
                  canVerify
                    ? "Tick once you have read this figure on the source page"
                    : "Needs both a rate and a source URL"
                }
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-accent-600"
                  checked={d.verified}
                  disabled={!canVerify}
                  onChange={(e) => setDraft(scheme.id, { verified: e.target.checked })}
                />
                <span className="text-sm font-semibold text-[var(--text)]">
                  I have checked this against the source
                </span>
              </label>

              {d.sourceUrl && (
                <a
                  href={d.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
                >
                  Open source ↗
                </a>
              )}

              <Button
                size="sm"
                variant={dirty ? "primary" : "secondary"}
                disabled={savingId === scheme.id || !dirty}
                className="ml-auto"
                onClick={() => save(scheme)}
              >
                {savingId === scheme.id ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        );
      })}

      <div className="card p-5">
        <h2 className="font-display text-sm font-bold text-[var(--text)]">
          Where to check these
        </h2>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
          <li>
            <strong>PPF and Sukanya Samriddhi</strong> — notified quarterly by the Department of
            Economic Affairs; also listed by India Post.
          </li>
          <li>
            <strong>EPF</strong> — declared annually by EPFO with government approval.
          </li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
          Small-savings rates change every quarter, so this page is worth a two-minute visit each
          April, July, October and January. Re-running{" "}
          <code className="rounded bg-[var(--bg-subtle)] px-1 py-0.5">npm run db:scheme-rates</code>{" "}
          refreshes the seeded values but never reverts a row you have already confirmed.
        </p>
      </div>
    </div>
  );
}

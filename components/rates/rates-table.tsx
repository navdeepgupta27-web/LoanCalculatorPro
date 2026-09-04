"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { useFormat } from "@/components/country/country-provider";
import { LOAN_TYPE_MAP, type LoanTypeId } from "@/lib/site";
import type { BankCategory, RateWithBank } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<BankCategory, string> = {
  public: "Public sector",
  private: "Private bank",
  housing: "Housing finance",
  nbfc: "NBFC",
  sfb: "Small finance bank",
};

type SortKey = "rate" | "name" | "tenure";

/**
 * Public rates table.
 *
 * A rate is only shown as a figure once it has been marked verified against the
 * lender's own published page. Unverified rows stay visible — so the lender
 * list is complete — but read "Not published" rather than displaying a number
 * nobody has checked.
 */
export function RatesTable({
  rates,
  showLoanType = false,
}: {
  rates: RateWithBank[];
  showLoanType?: boolean;
}) {
  const { compact: formatCompact, date: formatDate, rate: formatRate } = useFormat();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BankCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("rate");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = rates.filter((r) => {
      if (category !== "all" && r.bank_category !== category) return false;
      if (!q) return true;
      return r.bank_name.toLowerCase().includes(q) || r.bank_short_name.toLowerCase().includes(q);
    });

    // Rows the table will not show a figure for always sink to the bottom,
    // whichever sort is active — an unverified rate heading a "lowest rate
    // first" list would read as the best offer available.
    const shown = (r: RateWithBank) => r.verified === 1 && r.min_rate != null;

    return rows.sort((a, b) => {
      if (shown(a) !== shown(b)) return shown(a) ? -1 : 1;
      if (sort === "name") return a.bank_name.localeCompare(b.bank_name);
      if (sort === "tenure") return (b.max_tenure_years ?? 0) - (a.max_tenure_years ?? 0);
      const ar = a.min_rate ?? Number.POSITIVE_INFINITY;
      const br = b.min_rate ?? Number.POSITIVE_INFINITY;
      return ar - br;
    });
  }, [rates, query, category, sort]);

  const categories = useMemo(
    () => Array.from(new Set(rates.map((r) => r.bank_category))) as BankCategory[],
    [rates],
  );

  const published = filtered.filter((r) => r.verified === 1 && r.min_rate != null);
  const lowest = published.length ? Math.min(...published.map((r) => r.min_rate!)) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Search lenders…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search lenders"
          className="min-w-[12rem] flex-1 sm:max-w-xs"
        />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as BankCategory | "all")}
          aria-label="Filter by lender type"
          className="w-auto min-w-[10rem]"
        >
          <option value="all">All lender types</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort rates"
          className="w-auto min-w-[9rem]"
        >
          <option value="rate">Lowest rate first</option>
          <option value="name">Lender A–Z</option>
          <option value="tenure">Longest tenure</option>
        </Select>
        <span className="ml-auto text-sm text-[var(--text-muted)]">
          {filtered.length} lender{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead className="bg-[var(--bg-subtle)]">
              <tr>
                <th className="px-4 py-3 text-left text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Lender
                </th>
                {showLoanType && (
                  <th className="px-4 py-3 text-left text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Loan type
                  </th>
                )}
                <th className="px-4 py-3 text-right text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Interest rate (p.a.)
                </th>
                <th className="px-4 py-3 text-left text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Processing fee
                </th>
                <th className="px-4 py-3 text-right text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Max tenure
                </th>
                <th className="px-4 py-3 text-right text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  As of
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isPublished = r.verified === 1 && r.min_rate != null;
                const isLowest = isPublished && lowest != null && r.min_rate === lowest;

                return (
                  <tr
                    // A lender with no rate row for this type has a null id, so
                    // the key comes from the pair that is always unique.
                    key={`${r.bank_id}-${r.loan_type}`}
                    className={cn(
                      "border-t border-[var(--border)] transition-colors hover:bg-[var(--bg-subtle)]",
                      isLowest && "bg-accent-50/50 dark:bg-accent-950/20",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[0.7rem] font-extrabold text-white"
                          style={{ background: r.bank_accent }}
                          aria-hidden="true"
                        >
                          {r.bank_short_name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[var(--text)]">{r.bank_name}</p>
                          <p className="text-[0.7rem] text-[var(--text-muted)]">
                            {CATEGORY_LABEL[r.bank_category]}
                          </p>
                        </div>
                      </div>
                    </td>

                    {showLoanType && (
                      <td className="px-4 py-3">
                        <Link
                          href={`/bank-interest-rates/${LOAN_TYPE_MAP[r.loan_type as LoanTypeId]?.rateSlug ?? ""}`}
                          className="text-[var(--text-secondary)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                        >
                          {LOAN_TYPE_MAP[r.loan_type as LoanTypeId]?.label ?? r.loan_type}
                        </Link>
                      </td>
                    )}

                    <td className="px-4 py-3 text-right">
                      {isPublished ? (
                        <span className="flex items-center justify-end gap-2">
                          {isLowest && <Badge tone="accent">Lowest</Badge>}
                          <span className="font-display text-base font-bold text-[var(--text)] tnum">
                            {formatRate(r.min_rate!)}
                            {r.max_rate != null && r.max_rate > r.min_rate! && (
                              <span className="font-normal text-[var(--text-muted)]">
                                {" "}
                                – {formatRate(r.max_rate)}
                              </span>
                            )}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs italic text-[var(--text-muted)]">Not published</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {r.processing_fee || <span className="text-[var(--text-muted)]">—</span>}
                    </td>

                    <td className="px-4 py-3 text-right text-[var(--text-secondary)] tnum">
                      {r.max_tenure_years ? `${r.max_tenure_years} yrs` : "—"}
                      {r.max_amount ? (
                        <span className="block text-[0.7rem] text-[var(--text-muted)]">
                          up to {formatCompact(r.max_amount)}
                        </span>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-right text-xs text-[var(--text-muted)]">
                      {r.effective_date ? formatDate(r.effective_date) : "—"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.source_url && (
                          <a
                            href={r.source_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="rounded-lg border border-[var(--border)] px-2 py-1 text-[0.7rem] font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
                            title={`Open ${r.bank_name}'s published rate page`}
                          >
                            Verify ↗
                          </a>
                        )}
                        {isPublished && (
                          <Link
                            href={`/${LOAN_TYPE_MAP[r.loan_type as LoanTypeId]?.slug ?? ""}?rate=${r.min_rate}`}
                            className="rounded-lg bg-brand-600 px-2 py-1 text-[0.7rem] font-semibold text-white transition-colors hover:bg-brand-500"
                          >
                            Calculate
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={showLoanType ? 7 : 6} className="px-4 py-12 text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                      No lenders match that search.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

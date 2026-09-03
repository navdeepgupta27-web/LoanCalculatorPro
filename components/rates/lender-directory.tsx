"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Input, Select } from "@/components/ui/field";
import { LOAN_TYPES, LOAN_TYPE_MAP, type LoanTypeId } from "@/lib/site";
import type { BankCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface DirectoryRow {
  id: number;
  name: string;
  short_name: string;
  category: BankCategory;
  accent: string;
  /** Loan types this lender has a verified rate for. */
  publishedTypes: LoanTypeId[];
}

const CATEGORY_LABEL: Record<BankCategory, string> = {
  public: "Public sector bank",
  private: "Private bank",
  housing: "Housing finance company",
  nbfc: "NBFC",
  sfb: "Small finance bank",
};

/**
 * Index of every lender on the site.
 *
 * The rates index used to render rate rows, which meant an empty table until
 * someone had entered rates. Listing lenders instead makes the page a complete
 * directory of the Indian market from the start, and the per-type badges show
 * exactly where published rates already exist.
 */
export function LenderDirectory({ rows }: { rows: DirectoryRow[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BankCategory | "all">("all");

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category))) as BankCategory[],
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.short_name.toLowerCase().includes(q);
    });
  }, [rows, query, category]);

  const grouped = useMemo(() => {
    const map = new Map<BankCategory, DirectoryRow[]>();
    for (const row of filtered) {
      const list = map.get(row.category) ?? [];
      list.push(row);
      map.set(row.category, list);
    }
    return [...map.entries()];
  }, [filtered]);

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
          className="w-auto min-w-[13rem]"
        >
          <option value="all">All lender types</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </Select>
        <span className="ml-auto text-sm text-[var(--text-muted)]">
          {filtered.length} lender{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {grouped.length === 0 && (
        <div className="card px-6 py-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">No lenders match that search.</p>
        </div>
      )}

      {grouped.map(([cat, list]) => (
        <section key={cat}>
          <h2 className="mb-2.5 mt-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
            {CATEGORY_LABEL[cat]}{" "}
            <span className="font-normal normal-case">({list.length})</span>
          </h2>

          <div className="card divide-y divide-[var(--border)] overflow-hidden">
            {list.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-[var(--bg-subtle)]"
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[0.7rem] font-extrabold text-white"
                  style={{ background: row.accent }}
                  aria-hidden="true"
                >
                  {row.short_name.slice(0, 2).toUpperCase()}
                </span>

                <span className="min-w-[10rem] flex-1 font-semibold text-[var(--text)]">
                  {row.name}
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  {LOAN_TYPES.map((t) => {
                    const published = row.publishedTypes.includes(t.id);
                    return (
                      <Link
                        key={t.id}
                        href={`/bank-interest-rates/${t.rateSlug}`}
                        title={
                          published
                            ? `${row.name} — ${t.label} rate published`
                            : `${t.label} rate not published yet`
                        }
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[0.7rem] font-semibold transition-colors",
                          published
                            ? "border-accent-300 bg-accent-50 text-accent-700 dark:border-accent-700 dark:bg-accent-950 dark:text-accent-300"
                            : "border-[var(--border)] text-[var(--text-muted)] hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300",
                        )}
                      >
                        {t.shortLabel}
                      </Link>
                    );
                  })}
                </div>

                <span className="w-full text-xs text-[var(--text-muted)] sm:w-auto">
                  {row.publishedTypes.length > 0 ? (
                    <>
                      {row.publishedTypes.length} rate
                      {row.publishedTypes.length === 1 ? "" : "s"} published
                    </>
                  ) : (
                    "rates to be confirmed"
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="text-xs leading-relaxed text-[var(--text-muted)]">
        Green marks a loan type where we have a rate transcribed from that lender&rsquo;s own
        published page and dated. Grey means we have not confirmed one yet — we leave it blank
        rather than estimate. Follow any badge for the full{" "}
        {LOAN_TYPE_MAP.home.label.toLowerCase()} or other rate comparison.
      </p>
    </div>
  );
}

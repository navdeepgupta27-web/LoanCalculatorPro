import Link from "next/link";

import { FeedbackList } from "@/components/admin/feedback-list";
import { PageHeading, StatTile } from "@/components/admin/widgets";
import { formatNumber } from "@/lib/format";
import { getFeedback, getFeedbackStats } from "@/lib/queries";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "actioned", label: "Actioned" },
  { value: "archived", label: "Archived" },
];

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;

  const [items, stats] = await Promise.all([
    getFeedback(status).catch(() => []),
    getFeedbackStats().catch(() => ({ total: 0, unread: 0, avgRating: null, last7Days: 0 })),
  ]);

  return (
    <>
      <PageHeading
        title="Feedback"
        description="Everything submitted through the public feedback form. Opening a message marks it read."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total received" value={formatNumber(stats.total)} icon="💬" />
        <StatTile
          label="Unread"
          value={formatNumber(stats.unread)}
          tone={stats.unread > 0 ? "rose" : "accent"}
          icon="🔔"
        />
        <StatTile label="Last 7 days" value={formatNumber(stats.last7Days)} icon="📅" />
        <StatTile
          label="Average rating"
          value={stats.avgRating != null ? `${stats.avgRating.toFixed(1)} ★` : "—"}
          hint={stats.avgRating == null ? "No ratings submitted yet" : "Out of 5"}
          tone="amber"
          icon="⭐"
        />
      </div>

      <nav className="mb-4 flex flex-wrap gap-1.5" aria-label="Filter feedback">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/feedback" : `/admin/feedback?status=${f.value}`}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
              status === f.value
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-400",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <FeedbackList items={items} />
    </>
  );
}

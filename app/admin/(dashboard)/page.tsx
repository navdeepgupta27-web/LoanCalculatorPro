import Link from "next/link";

import { BarList, DailyChart, PageHeading, StatTile } from "@/components/admin/widgets";
import { formatNumber, timeAgo } from "@/lib/format";
import { getDashboardSummary, getFeedback } from "@/lib/queries";

export default async function AdminDashboardPage() {
  const [summary, recentFeedback] = await Promise.all([
    getDashboardSummary(),
    getFeedback("all", 5).catch(() => []),
  ]);

  const { feedback, activity, coverage, posts } = summary;

  return (
    <>
      <PageHeading
        title="Dashboard"
        description="Traffic, feedback and content at a glance. Everything here is first-party data from your own database."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Visitors (7d)"
          value={formatNumber(activity.uniqueVisitors7d)}
          hint={`${formatNumber(activity.last7Days)} page views`}
          tone="brand"
          icon="👥"
        />
        <StatTile
          label="Views today"
          value={formatNumber(activity.today)}
          hint={`${formatNumber(activity.last30Days)} in the last 30 days`}
          icon="📈"
        />
        <StatTile
          label="Unread feedback"
          value={formatNumber(feedback.unread)}
          hint={`${formatNumber(feedback.total)} total${
            feedback.avgRating != null ? ` · ${feedback.avgRating.toFixed(1)}★ average` : ""
          }`}
          tone={feedback.unread > 0 ? "rose" : "accent"}
          icon="💬"
        />
        <StatTile
          label="Published guides"
          value={formatNumber(posts.published)}
          hint={`${formatNumber(posts.drafts)} drafts · ${formatNumber(posts.views)} reads`}
          icon="📝"
        />
      </div>

      {coverage.missing > 0 && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            {coverage.missing} of {coverage.total} bank rates are still unverified
          </p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
            Unverified rows show as &ldquo;Not published&rdquo; on the public site rather than
            displaying an unchecked figure.{" "}
            <Link href="/admin/rates" className="font-semibold underline underline-offset-2">
              Add and verify rates →
            </Link>
          </p>
        </div>
      )}

      <div className="mt-4">
        <DailyChart data={activity.daily} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <BarList
          title="Most-visited pages (30d)"
          rows={activity.topPaths.map((p) => ({ label: p.path, value: p.views, href: p.path }))}
        />
        <BarList
          title="Top events (30d)"
          rows={activity.topEvents.map((e) => ({ label: e.event, value: e.count }))}
        />
        <BarList
          title="Traffic sources (30d)"
          rows={activity.topReferrers.map((r) => ({ label: r.referrer, value: r.count }))}
          emptyLabel="No referrers yet — all traffic so far is direct."
        />
        <BarList
          title="Devices (30d)"
          rows={activity.devices.map((d) => ({ label: d.device, value: d.count }))}
        />
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-[var(--text)]">Latest feedback</h2>
          <Link
            href="/admin/feedback"
            className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300"
          >
            View all →
          </Link>
        </div>

        {recentFeedback.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
            No feedback yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recentFeedback.map((f) => (
              <li key={f.id} className="px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text)]">{f.name}</span>
                  {f.rating && <span className="text-xs text-amber-500">{"★".repeat(f.rating)}</span>}
                  <span className="rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {f.category}
                  </span>
                  {f.status === "new" && (
                    <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-red-700 dark:bg-red-950 dark:text-red-300">
                      New
                    </span>
                  )}
                  <span className="ml-auto text-xs text-[var(--text-muted)]">
                    {timeAgo(f.created_at)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{f.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

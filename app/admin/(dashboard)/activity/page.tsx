import Link from "next/link";

import { BarList, DailyChart, PageHeading, StatTile } from "@/components/admin/widgets";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/format";
import { getActivityStats, getRecentActivity } from "@/lib/queries";
import { cn } from "@/lib/utils";

const EVENT_FILTERS = [
  { value: "all", label: "All events" },
  { value: "pageview", label: "Page views" },
  { value: "share", label: "Shares" },
  { value: "export_csv", label: "CSV exports" },
  { value: "feedback_submitted", label: "Feedback" },
  { value: "loan_type_change", label: "Loan switches" },
  { value: "compare_prefill", label: "Rate prefills" },
];

const DEVICE_ICON: Record<string, string> = {
  mobile: "📱",
  tablet: "📲",
  desktop: "🖥️",
  unknown: "❔",
};

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event = "all" } = await searchParams;

  const [stats, rows] = await Promise.all([
    getActivityStats().catch(() => null),
    getRecentActivity(150, event).catch(() => []),
  ]);

  return (
    <>
      <PageHeading
        title="Activity"
        description="First-party analytics from your own database — no cookie, and visitors sending Do Not Track are excluded. Vercel Analytics runs alongside this and is reported separately in the Vercel dashboard."
      />

      {stats && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Views today" value={formatNumber(stats.today)} tone="brand" icon="📈" />
            <StatTile label="Views (7d)" value={formatNumber(stats.last7Days)} icon="📊" />
            <StatTile
              label="Unique visitors (7d)"
              value={formatNumber(stats.uniqueVisitors7d)}
              hint="By session, not by person"
              tone="accent"
              icon="👥"
            />
            <StatTile label="Views (30d)" value={formatNumber(stats.last30Days)} icon="🗓️" />
          </div>

          <DailyChart data={stats.daily} />

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <BarList
              title="Top pages (30d)"
              rows={stats.topPaths.map((p) => ({ label: p.path, value: p.views, href: p.path }))}
            />
            <BarList
              title="Referrers (30d)"
              rows={stats.topReferrers.map((r) => ({ label: r.referrer, value: r.count }))}
              emptyLabel="All traffic so far is direct."
            />
            <BarList
              title="Devices (30d)"
              rows={stats.devices.map((d) => ({
                label: `${DEVICE_ICON[d.device] ?? "❔"} ${d.device}`,
                value: d.count,
              }))}
            />
          </div>
        </>
      )}

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg font-bold text-[var(--text)]">Event log</h2>

        <nav className="mb-3 flex flex-wrap gap-1.5" aria-label="Filter events">
          {EVENT_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === "all" ? "/admin/activity" : `/admin/activity?event=${f.value}`}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                event === f.value
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-400",
              )}
            >
              {f.label}
            </Link>
          ))}
        </nav>

        <div className="card overflow-hidden">
          {rows.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">
              No activity recorded for this filter yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] border-collapse text-sm">
                <thead className="bg-[var(--bg-subtle)]">
                  <tr>
                    {["When", "Event", "Path", "Referrer", "Device", "Detail"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-[var(--border)]">
                      <td
                        className="whitespace-nowrap px-4 py-2.5 text-[var(--text-muted)]"
                        title={formatDateTime(r.created_at)}
                      >
                        {timeAgo(r.created_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[0.7rem] font-semibold text-[var(--text-secondary)]">
                          {r.event}
                        </span>
                      </td>
                      <td className="max-w-[16rem] truncate px-4 py-2.5 text-[var(--text-secondary)]">
                        {r.path ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">{r.referrer ?? "direct"}</td>
                      <td className="px-4 py-2.5 text-[var(--text-muted)]">
                        {DEVICE_ICON[r.device ?? "unknown"] ?? ""} {r.device ?? "—"}
                      </td>
                      <td
                        className="max-w-[14rem] truncate px-4 py-2.5 text-[0.75rem] text-[var(--text-muted)]"
                        title={r.meta ?? ""}
                      >
                        {r.meta ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-[var(--text-muted)]">
          IP addresses are stored only as a salted one-way hash and are never displayed. Bots and
          crawlers are filtered out before anything is written.
        </p>
      </div>
    </>
  );
}

import Link from "next/link";

import { PageHeading, StatTile } from "@/components/admin/widgets";
import { ButtonLink } from "@/components/ui/button";
import { formatDate, formatNumber, timeAgo } from "@/lib/format";
import { getAllPosts } from "@/lib/queries";
import { parseTags } from "@/lib/types";
import { cn, readingTime } from "@/lib/utils";

export default async function AdminBlogPage() {
  const posts = await getAllPosts().catch(() => []);

  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft");
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

  return (
    <>
      <PageHeading
        title="Blog"
        description="Write and publish guides. Published posts appear on the site, in the sitemap, and in the homepage strip."
        action={<ButtonLink href="/admin/blog/new">+ New post</ButtonLink>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatTile label="Published" value={formatNumber(published.length)} tone="accent" icon="✅" />
        <StatTile label="Drafts" value={formatNumber(drafts.length)} tone="amber" icon="✏️" />
        <StatTile label="Total reads" value={formatNumber(totalViews)} tone="brand" icon="👁️" />
      </div>

      {posts.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <span className="text-3xl">📝</span>
          <p className="mt-3 font-display text-base font-bold text-[var(--text)]">No posts yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-[var(--text-secondary)]">
            Guides are one of the strongest SEO assets this site has — they rank for questions the
            calculator pages cannot target.
          </p>
          <ButtonLink href="/admin/blog/new" className="mt-5">
            Write the first post
          </ButtonLink>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-sm">
              <thead className="bg-[var(--bg-subtle)]">
                <tr>
                  {["Title", "Status", "Reads", "Published", "Updated", ""].map((h) => (
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
                {posts.map((p) => {
                  const tags = parseTags(p.tags);
                  return (
                    <tr key={p.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/blog/${p.id}`}
                          className="font-semibold text-[var(--text)] transition-colors hover:text-brand-600 dark:hover:text-brand-300"
                        >
                          {p.title}
                        </Link>
                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[0.7rem] text-[var(--text-muted)]">
                          <span className="font-mono">/blog/{p.slug}</span>
                          <span>·</span>
                          <span>{readingTime(p.content)} min</span>
                          {tags.slice(0, 2).map((t) => (
                            <span key={t} className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5">
                              {t}
                            </span>
                          ))}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[0.7rem] font-bold uppercase",
                            p.status === "published"
                              ? "bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                          )}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] tnum">
                        {formatNumber(p.views)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                        {p.published_at ? formatDate(p.published_at) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                        {timeAgo(p.updated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/admin/blog/${p.id}`}
                            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600"
                          >
                            Edit
                          </Link>
                          {p.status === "published" && (
                            <a
                              href={`/blog/${p.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600"
                            >
                              View ↗
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

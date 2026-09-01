import Link from "next/link";

import { AdLeaderboard } from "@/components/ads/ad-slot";
import { PostCard, PostCover } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/ui/reveal";
import { formatDate } from "@/lib/format";
import { getPublishedPosts } from "@/lib/queries";
import { breadcrumbSchema, itemListSchema, pageMetadata } from "@/lib/seo";
import type { Post } from "@/lib/types";
import { readingTime } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Loan Guides — Borrowing in India, Explained Plainly",
  description:
    "Practical, jargon-free writing on home loan prepayment, balance transfers, credit scores, processing fees and how to read a loan agreement before you sign it.",
  path: "/blog",
  keywords: [
    "loan guides India",
    "home loan tips",
    "how to prepay home loan",
    "balance transfer home loan",
    "credit score for loan",
    "loan agreement explained",
    "personal finance India blog",
  ],
});

export const revalidate = 1800;

export default async function BlogIndexPage() {
  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts(60);
  } catch {
    // Render the empty state rather than a 500 if the database is unreachable.
  }

  const [featured, ...rest] = posts;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/blog" },
          ]),
          itemListSchema(
            "Loan guides",
            posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` })),
          ),
        ]}
      />

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <li>
                <Link href="/" className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[var(--text-secondary)]">Guides</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
                Borrowing, <span className="gradient-text">explained plainly</span>
              </h1>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                No jargon, no product pitches, no affiliate links. Just the mechanics of Indian
                loans and the decisions that actually move the numbers.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <span className="text-4xl">📝</span>
            <h2 className="mt-4 font-display text-xl font-bold text-[var(--text)]">
              No guides published yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">
              The first articles are on their way. In the meantime, the calculator and the bank
              rates tables are ready to use.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link
                href="/"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
              >
                Open the calculator
              </Link>
              <Link
                href="/bank-interest-rates"
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                See bank rates
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Lead article gets a wide, two-column treatment. */}
            <Reveal>
              <Link
                href={`/blog/${featured.slug}`}
                className="card card-lift group grid overflow-hidden md:grid-cols-2"
              >
                <PostCover
                  variant={featured.cover_variant}
                  title={featured.title}
                  className="h-52 transition-transform duration-500 group-hover:scale-[1.03] md:h-full md:min-h-[16rem]"
                />
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <span className="w-fit rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300">
                    Latest
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-[var(--text)] transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300 sm:text-3xl">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
                      {featured.excerpt}
                    </p>
                  )}
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    <time dateTime={featured.published_at ?? featured.created_at}>
                      {formatDate(featured.published_at ?? featured.created_at)}
                    </time>
                    {" · "}
                    {readingTime(featured.content)} min read
                  </p>
                </div>
              </Link>
            </Reveal>

            <div className="my-8">
              <AdLeaderboard />
            </div>

            {rest.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <PostCard key={post.id} post={post} delay={i * 60} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

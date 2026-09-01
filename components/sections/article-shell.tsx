import Link from "next/link";
import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/reveal";

/**
 * Shared frame for the prose pages (about, legal, FAQ): breadcrumb, hero
 * heading and a readable measure. Keeps those pages consistent without each
 * one re-implementing the layout.
 */
export function ArticleShell({
  title,
  lede,
  breadcrumb,
  updated,
  children,
  wide = false,
}: {
  title: ReactNode;
  lede?: ReactNode;
  breadcrumb: string;
  updated?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="mesh-bg" aria-hidden="true" />
        <div className={`relative mx-auto px-4 py-12 sm:px-6 ${wide ? "max-w-7xl lg:px-8" : "max-w-3xl"}`}>
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <li>
                <Link href="/" className="transition-colors hover:text-brand-600 dark:hover:text-brand-300">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[var(--text-secondary)]">{breadcrumb}</li>
            </ol>
          </nav>

          <Reveal>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
              {title}
            </h1>
          </Reveal>

          {lede && (
            <Reveal delay={90}>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                {lede}
              </p>
            </Reveal>
          )}

          {updated && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Last updated {updated}
            </p>
          )}
        </div>
      </section>

      <div className={`mx-auto px-4 py-12 sm:px-6 ${wide ? "max-w-7xl lg:px-8" : "max-w-3xl"}`}>
        {children}
      </div>
    </>
  );
}

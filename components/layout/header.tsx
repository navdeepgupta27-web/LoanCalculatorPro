"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LOAN_TYPES, PRIMARY_NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";
import { ThemeToggle } from "./theme";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  // The mobile sheet records the path it was opened on rather than a bare
  // boolean, so any navigation closes it by derivation — no effect watching
  // pathname, and it works for link clicks and browser back alike.
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);
  const menuOpen = openedOnPath !== null && openedOnPath === pathname;
  const setMenuOpen = (open: boolean) => setOpenedOnPath(open ? pathname : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // The initial read happens on the next frame rather than synchronously in
    // the effect body, so a page restored mid-scroll still gets the condensed
    // header without triggering a cascading render on mount.
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 no-print",
          scrolled
            ? "glass border-b border-[var(--border)] shadow-[0_1px_16px_-8px_rgb(15_23_42/0.25)]"
            : "border-b border-transparent bg-[var(--bg)]",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {/* The calculator entry expands into the six loan types. */}
            <div
              className="relative"
              onMouseEnter={() => setCalcOpen(true)}
              onMouseLeave={() => setCalcOpen(false)}
            >
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  isActive("/")
                    ? "text-brand-700 dark:text-brand-300"
                    : "text-[var(--text-secondary)] hover:text-[var(--text)]",
                )}
                aria-expanded={calcOpen}
              >
                Calculators
                <svg
                  viewBox="0 0 20 20"
                  className={cn("h-3.5 w-3.5 transition-transform duration-200", calcOpen && "rotate-180")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 7.5 5 5 5-5" />
                </svg>
              </Link>

              <div
                className={cn(
                  "absolute left-0 top-full w-[27rem] pt-2 transition-all duration-200",
                  calcOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0",
                )}
              >
                <div className="card grid grid-cols-2 gap-1 p-2 shadow-[var(--shadow-lift)]">
                  {LOAN_TYPES.map((t) => (
                    <Link
                      key={t.id}
                      href={`/${t.slug}`}
                      className="group flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--bg-subtle)]"
                    >
                      <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                        {t.emoji}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[0.8125rem] font-semibold text-[var(--text)]">
                          {t.label}
                        </span>
                        <span className="text-[0.7rem] text-[var(--text-muted)]">EMI calculator</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {PRIMARY_NAV.filter((n) => n.href !== "/").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  isActive(item.href)
                    ? "text-brand-700 dark:text-brand-300"
                    : "text-[var(--text-secondary)] hover:text-[var(--text)]",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/feedback"
              className="hidden rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgb(79_70_229/0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_-6px_rgb(79_70_229/0.6)] sm:block"
            >
              Give Feedback
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] lg:hidden"
            >
              <span className="relative block h-4 w-4">
                <span
                  className={cn(
                    "absolute left-0 h-0.5 w-4 rounded-full bg-current transition-all duration-300",
                    menuOpen ? "top-[7px] rotate-45" : "top-0.5",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-[7px] h-0.5 w-4 rounded-full bg-current transition-all duration-200",
                    menuOpen && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-0.5 w-4 rounded-full bg-current transition-all duration-300",
                    menuOpen ? "top-[7px] -rotate-45" : "top-[13px]",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden no-print",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMenuOpen(false)}
        />
        <nav
          aria-label="Mobile"
          className={cn(
            "absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lift)] transition-all duration-300 ease-[var(--ease-out-expo)]",
            menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          )}
        >
          <p className="px-1 pb-2 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Calculators
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {LOAN_TYPES.map((t) => (
              <Link
                key={t.id}
                href={`/${t.slug}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--bg-subtle)]"
              >
                <span>{t.emoji}</span>
                {t.shortLabel}
              </Link>
            ))}
          </div>

          <p className="px-1 pb-2 pt-5 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Explore
          </p>
          <div className="flex flex-col gap-0.5">
            {PRIMARY_NAV.filter((n) => n.href !== "/").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/feedback"
              className="mt-2 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 px-3 py-3 text-center text-sm font-semibold text-white"
            >
              Give Feedback
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}

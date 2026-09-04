"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1z" },
  { href: "/admin/feedback", label: "Feedback", icon: "M3 5h14v9H7l-4 3z" },
  { href: "/admin/activity", label: "Activity", icon: "M3 12h3l2-6 3 12 2.5-7H17" },
  { href: "/admin/rates", label: "Bank rates", icon: "M3 16h14M4 8h12M5 8V6l5-3 5 3v2M6 8v8m8-8v8" },
  { href: "/admin/scheme-rates", label: "Scheme rates", icon: "M3 13l4-4 3 3 6-6M13 6h4v4" },
  { href: "/admin/blog", label: "Blog", icon: "M5 3h7l3 3v11H5zM12 3v3h3" },
];

export function AdminNav({ email, unread }: { email: string; unread: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  };

  const links = (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            isActive(item.href)
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]",
          )}
        >
          <svg
            viewBox="0 0 20 20"
            className="h-[18px] w-[18px] shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={item.icon} />
          </svg>
          <span className="flex-1">{item.label}</span>
          {item.href === "/admin/feedback" && unread > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden">
        <Logo href="/admin" showText={false} />
        <span className="font-display text-sm font-bold text-[var(--text)]">Admin</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle admin menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-b border-[var(--border)] bg-[var(--surface)] p-3 lg:hidden">
          <div className="flex flex-col gap-1">{links}</div>
          <button
            type="button"
            onClick={signOut}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)]"
          >
            Sign out
          </button>
        </nav>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 lg:flex">
        <Logo href="/admin" />

        <nav className="mt-7 flex flex-1 flex-col gap-1">{links}</nav>

        <div className="border-t border-[var(--border)] pt-4">
          <Link
            href="/"
            className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
          >
            ↗ View live site
          </Link>

          <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--bg-subtle)] p-2.5">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[var(--text)]">{email}</p>
              <p className="text-[0.65rem] text-[var(--text-muted)]">Signed in</p>
            </div>
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}

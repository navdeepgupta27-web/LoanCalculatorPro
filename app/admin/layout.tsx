import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * The admin area is excluded from search entirely — belt and braces alongside
 * the Disallow in robots.txt, since robots.txt is only a request.
 */
export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-[var(--bg)]">{children}</div>;
}

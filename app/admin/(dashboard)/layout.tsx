import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { ToastProvider } from "@/components/ui/toast";
import { requireAdmin } from "@/lib/auth";
import { getFeedbackStats } from "@/lib/queries";

/**
 * Every admin page is rendered per-request and behind `requireAdmin()`, which
 * redirects to the login page when the session cookie is missing or invalid.
 * The guard lives in the layout rather than in proxy/middleware so it runs in
 * the same trust boundary as the data access it protects.
 */
export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  let unread = 0;
  try {
    unread = (await getFeedbackStats()).unread;
  } catch {
    // A badge count is not worth failing the whole console over.
  }

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <AdminNav email={session.email} unread={unread} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}

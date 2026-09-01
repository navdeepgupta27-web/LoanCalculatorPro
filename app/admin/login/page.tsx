import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/layout/logo";
import { getSession, isAdminConfigured } from "@/lib/auth";

export default async function AdminLoginPage() {
  // Already signed in — no reason to show the form again.
  const session = await getSession().catch(() => null);
  if (session) redirect("/admin");

  const configured = isAdminConfigured();

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="mesh-bg" aria-hidden="true" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo href="/" />
        </div>

        <div className="card p-6 sm:p-7">
          <h1 className="font-display text-xl font-bold text-[var(--text)]">Admin sign-in</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Restricted area. There is no sign-up.
          </p>

          {configured ? (
            <LoginForm className="mt-6" />
          ) : (
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Admin access is not configured
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                Set <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD_HASH</code> and{" "}
                <code>AUTH_SECRET</code> in your environment, then restart. Generate the values
                with <code>npm run gen:secret</code> and{" "}
                <code>npm run gen:hash -- &lsquo;your-password&rsquo;</code>.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Failed attempts are rate-limited. Sessions last 7 days.
        </p>
      </div>
    </div>
  );
}

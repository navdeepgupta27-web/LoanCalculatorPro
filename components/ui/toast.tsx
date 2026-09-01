"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<{
  toast: (message: string, tone?: ToastTone) => void;
} | null>(null);

const TONE_STYLES: Record<ToastTone, string> = {
  success: "border-accent-300 bg-accent-50 text-accent-900 dark:border-accent-700 dark:bg-accent-950 dark:text-accent-100",
  error: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
  info: "border-brand-300 bg-brand-50 text-brand-900 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-100",
};

const TONE_ICONS: Record<ToastTone, ReactNode> = {
  success: (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 10.5 4 4 8-9" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 6v5m0 3h.01M10 2.5 18 17H2z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9v5m0-8h.01" />
    </svg>
  ),
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-[var(--shadow-lift)]",
              "animate-[slide-in-right_0.35s_var(--ease-out-expo)_both]",
              TONE_STYLES[t.tone],
            )}
          >
            {TONE_ICONS[t.tone]}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Falls back to a no-op outside the provider so components using it can also be
 * rendered in isolation (e.g. an admin page without the public shell).
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? { toast: () => {} };
}

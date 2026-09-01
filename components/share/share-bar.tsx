"use client";

import { useState } from "react";

import { trackEvent } from "@/components/analytics/activity-tracker";
import { SocialIcon } from "@/components/layout/social-icons";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface ShareBarProps {
  title: string;
  /** Absolute or relative URL. Defaults to the current page. */
  url?: string;
  text?: string;
  className?: string;
  label?: string;
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.94 24c6.6 0 11.95-5.37 11.95-12S18.54 0 11.94 0 0 5.37 0 12s5.35 12 11.94 12Zm-6.5-11.83 11.5-4.44c.53-.2 1 .13.83.94l-1.96 9.24c-.14.65-.53.81-1.07.5l-2.96-2.19-1.43 1.38c-.16.16-.29.3-.6.3l.21-3.02 5.5-4.97c.24-.21-.05-.33-.37-.12l-6.79 4.28-2.93-.91c-.63-.2-.65-.63.14-.94Z" />
    </svg>
  );
}

/**
 * Share controls.
 *
 * Uses the native share sheet on mobile when available — one tap into the OS
 * picker beats a row of icons — and falls back to per-network intent URLs on
 * desktop. Nothing is sent anywhere until the visitor actually clicks.
 */
export function ShareBar({ title, url, text, className, label = "Share" }: ShareBarProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const resolve = () => {
    if (!url) return typeof window !== "undefined" ? window.location.href : "";
    if (url.startsWith("http")) return url;
    return typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  };

  const share = async (network: string, href: string) => {
    trackEvent("share", { network, title });
    window.open(href, "_blank", "noopener,noreferrer,width=640,height=560");
  };

  const copy = async () => {
    const link = resolve();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast("Link copied to clipboard");
      trackEvent("share", { network: "copy", title });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast("Could not copy — please copy the address bar instead", "error");
    }
  };

  const nativeShare = async () => {
    const link = resolve();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url: link });
        trackEvent("share", { network: "native", title });
      } catch {
        /* the visitor dismissed the sheet */
      }
      return;
    }
    void copy();
  };

  const link = typeof window !== "undefined" ? resolve() : "";
  const e = encodeURIComponent;
  const shareText = text ?? title;

  const networks = [
    {
      key: "whatsapp",
      name: "WhatsApp",
      href: `https://wa.me/?text=${e(`${shareText} ${link}`)}`,
      icon: <SocialIcon icon="whatsapp" className="h-4 w-4" />,
      hover: "hover:bg-[#25D366] hover:border-[#25D366]",
    },
    {
      key: "x",
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${e(shareText)}&url=${e(link)}`,
      icon: <SocialIcon icon="x" className="h-3.5 w-3.5" />,
      hover: "hover:bg-black hover:border-black",
    },
    {
      key: "facebook",
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${e(link)}`,
      icon: <SocialIcon icon="facebook" className="h-4 w-4" />,
      hover: "hover:bg-[#1877F2] hover:border-[#1877F2]",
    },
    {
      key: "linkedin",
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(link)}`,
      icon: <SocialIcon icon="linkedin" className="h-4 w-4" />,
      hover: "hover:bg-[#0A66C2] hover:border-[#0A66C2]",
    },
    {
      key: "telegram",
      name: "Telegram",
      href: `https://t.me/share/url?url=${e(link)}&text=${e(shareText)}`,
      icon: <TelegramIcon className="h-4 w-4" />,
      hover: "hover:bg-[#26A5E4] hover:border-[#26A5E4]",
    },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-2 no-print", className)}>
      {label && (
        <span className="mr-0.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </span>
      )}

      {/* Native sheet on touch devices; the icon row stays for everyone else. */}
      <button
        type="button"
        onClick={nativeShare}
        className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 sm:hidden"
        aria-label="Share"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      </button>

      <div className="hidden items-center gap-2 sm:flex">
        {networks.map((n) => (
          <button
            key={n.key}
            type="button"
            onClick={() => share(n.key, n.href)}
            aria-label={`Share on ${n.name}`}
            title={`Share on ${n.name}`}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)]",
              "text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:text-white",
              n.hover,
            )}
          >
            {n.icon}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        title="Copy link"
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5",
          copied
            ? "border-accent-400 bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-300"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-brand-400 hover:text-brand-600",
        )}
      >
        {copied ? (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 10.5 4 4 8-9" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="7" y="7" width="10" height="10" rx="2" />
            <path d="M13 5.5A2.5 2.5 0 0 0 10.5 3h-5A2.5 2.5 0 0 0 3 5.5v5A2.5 2.5 0 0 0 5.5 13" strokeLinecap="round" />
          </svg>
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

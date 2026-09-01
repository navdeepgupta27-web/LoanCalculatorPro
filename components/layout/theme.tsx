"use client";

import { cn } from "@/lib/utils";

export const THEME_STORAGE_KEY = "lcp-theme";

/**
 * Applies the stored theme before first paint.
 *
 * This runs as a blocking inline script in <head>: if the theme were applied
 * from a useEffect instead, every visitor would see a flash of the wrong
 * background on each navigation.
 *
 * Dark is the site default, so a first-time visitor gets dark regardless of
 * their OS setting. Only an explicit choice — stored from the toggle — moves
 * them to light, and that choice always wins afterwards.
 */
export const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    document.documentElement.setAttribute('data-theme', stored === 'light' ? 'light' : 'dark');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`.trim();

/**
 * Theme toggle.
 *
 * Holds no React state at all: the current theme already lives on
 * `<html data-theme>`, set before first paint by the script above, and the icon
 * swap is driven by the `dark:` variant reading that same attribute. Mirroring
 * it into state would only create a source of truth that can disagree with the
 * DOM — and a hydration mismatch on the very first render.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* private browsing — the choice just will not persist */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)]",
        "bg-[var(--surface)] text-[var(--text-secondary)] transition-all duration-200",
        "hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300",
        className,
      )}
    >
      {/* Both icons render; CSS cross-fades them on the data-theme attribute. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="absolute h-[18px] w-[18px] scale-100 rotate-0 opacity-100 transition-all duration-300 dark:scale-50 dark:rotate-90 dark:opacity-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="absolute h-[18px] w-[18px] scale-50 -rotate-90 opacity-0 transition-all duration-300 dark:scale-100 dark:rotate-0 dark:opacity-100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  );
}

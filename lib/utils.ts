import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Loan Basics 101" -> "loan-basics-101" */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Rough reading time for blog posts, at 210 wpm. */
export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 210));
}

/** Coarse device bucket from a user-agent string, for the activity log. */
export function deviceFromUserAgent(ua: string | null | undefined): string {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/bot|crawler|spider|crawling|headless/.test(s)) return "bot";
  if (/ipad|tablet|playbook|silk/.test(s)) return "tablet";
  if (/mobi|android|iphone|ipod/.test(s)) return "mobile";
  return "desktop";
}

/** "https://google.com/search?q=x" -> "google.com" */
export function hostOf(url: string | null | undefined): string {
  if (!url) return "direct";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 40);
  }
}

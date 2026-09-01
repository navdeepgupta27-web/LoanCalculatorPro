import type { LoanTypeId } from "./site";

export type FeedbackStatus = "new" | "read" | "actioned" | "archived";
export type FeedbackCategory =
  | "general"
  | "bug"
  | "feature"
  | "rates"
  | "accuracy"
  | "partnership";

export interface Feedback {
  id: number;
  name: string;
  email: string | null;
  rating: number | null;
  category: FeedbackCategory;
  subject: string | null;
  message: string;
  page_url: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  status: FeedbackStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityRow {
  id: number;
  event: string;
  path: string | null;
  referrer: string | null;
  session_id: string | null;
  device: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  meta: string | null;
  created_at: string;
}

export type PostStatus = "draft" | "published";
export type CoverVariant = "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet";

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_variant: CoverVariant;
  tags: string | null;
  author: string;
  status: PostStatus;
  seo_title: string | null;
  seo_description: string | null;
  keywords: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BankCategory = "public" | "private" | "nbfc" | "sfb" | "housing";

export interface Bank {
  id: number;
  slug: string;
  name: string;
  short_name: string;
  category: BankCategory;
  accent: string;
  website: string | null;
  sort_order: number;
  created_at: string;
}

export interface Rate {
  id: number;
  bank_id: number;
  loan_type: LoanTypeId;
  min_rate: number | null;
  max_rate: number | null;
  processing_fee: string | null;
  max_tenure_years: number | null;
  max_amount: number | null;
  source_url: string | null;
  effective_date: string | null;
  /** 0 until you have checked the figure against the lender's own page. */
  verified: number;
  notes: string | null;
  updated_at: string;
}

/** A rate joined to its bank — what the public rates table renders. */
export interface RateWithBank extends Rate {
  bank_name: string;
  bank_short_name: string;
  bank_slug: string;
  bank_category: BankCategory;
  bank_accent: string;
  bank_website: string | null;
}

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

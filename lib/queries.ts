import "server-only";

import { DEFAULT_COUNTRY } from "./countries";
import { all, one, run, scalar } from "./db";
import type {
  ActivityRow,
  Bank,
  Feedback,
  Post,
  RateWithBank,
} from "./types";
import type { LoanTypeId } from "./site";

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

/**
 * Published guides, newest first.
 *
 * `country` filters to guides written for one market. The blog index and the
 * post pages deliberately do not pass it — they are shared pages and show
 * everything — but the homepage strip does, so a US visitor is not offered a
 * guide whose title is a rupee figure.
 */
export async function getPublishedPosts(
  limit = 50,
  offset = 0,
  country?: string,
): Promise<Post[]> {
  return all<Post>(
    `SELECT * FROM posts
      WHERE status = 'published'
        AND (published_at IS NULL OR published_at <= datetime('now'))
        ${country ? "AND country = ?" : ""}
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT ? OFFSET ?`,
    country ? [country, limit, offset] : [limit, offset],
  );
}

export async function getPostBySlug(slug: string, includeDrafts = false): Promise<Post | null> {
  return one<Post>(
    includeDrafts
      ? `SELECT * FROM posts WHERE slug = ?`
      : `SELECT * FROM posts WHERE slug = ? AND status = 'published'`,
    [slug],
  );
}

export async function getAllPosts(): Promise<Post[]> {
  return all<Post>(`SELECT * FROM posts ORDER BY updated_at DESC`);
}

export async function incrementPostViews(id: number) {
  await run(`UPDATE posts SET views = views + 1 WHERE id = ?`, [id]);
}

/** Newest published posts excluding `slug`, for the "keep reading" strip. */
export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  return all<Post>(
    `SELECT * FROM posts
      WHERE status = 'published' AND slug != ?
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT ?`,
    [slug, limit],
  );
}

/* ------------------------------------------------------------------ */
/* Banks & rates                                                       */
/* ------------------------------------------------------------------ */

const RATE_SELECT = `
  SELECT r.*,
         b.name       AS bank_name,
         b.short_name AS bank_short_name,
         b.slug       AS bank_slug,
         b.category   AS bank_category,
         b.accent     AS bank_accent,
         b.website    AS bank_website
    FROM rates r
    JOIN banks b ON b.id = r.bank_id
`;

/**
 * Every rate query is scoped to one country.
 *
 * The parameter is required rather than defaulting to India: a caller that
 * forgets it would silently show Indian lenders on a US page, which is worse
 * than a compile error.
 */
export async function getRates(country: string, loanType?: LoanTypeId): Promise<RateWithBank[]> {
  // Anything the public table will not show a figure for — unverified, or with
  // no rate at all — sorts last, so an unchecked row can never head up a
  // "lowest rate first" list. Within each group: cheapest floor, then a stable
  // tiebreak so the order does not shuffle between renders.
  const order = `ORDER BY (r.verified = 0 OR r.min_rate IS NULL),
                          r.min_rate ASC, b.sort_order ASC, b.name ASC`;
  if (loanType) {
    return all<RateWithBank>(
      `${RATE_SELECT} WHERE b.country = ? AND r.loan_type = ? ${order}`,
      [country, loanType],
    );
  }
  return all<RateWithBank>(`${RATE_SELECT} WHERE b.country = ? ${order}`, [country]);
}

/**
 * Every lender, whether or not it has a rate for this loan type.
 *
 * The public tables start from `banks` and LEFT JOIN the rate, so the page is a
 * complete directory of the market from day one rather than an empty table
 * until someone fills it in. Lenders without a published rate render as
 * "Not published" and sort last.
 */
export async function getRatesForLoanType(
  country: string,
  loanType: LoanTypeId,
): Promise<RateWithBank[]> {
  return all<RateWithBank>(
    `SELECT r.id                     AS id,
            b.id                     AS bank_id,
            COALESCE(r.loan_type, ?) AS loan_type,
            r.min_rate, r.max_rate, r.processing_fee, r.max_tenure_years,
            r.max_amount, r.source_url, r.effective_date,
            COALESCE(r.verified, 0)  AS verified,
            r.notes, r.updated_at,
            b.name       AS bank_name,
            b.short_name AS bank_short_name,
            b.slug       AS bank_slug,
            b.category   AS bank_category,
            b.accent     AS bank_accent,
            b.website    AS bank_website
       FROM banks b
       LEFT JOIN rates r ON r.bank_id = b.id AND r.loan_type = ?
      WHERE b.country = ?
      ORDER BY (COALESCE(r.verified, 0) = 0 OR r.min_rate IS NULL),
               r.min_rate ASC, b.sort_order ASC, b.name ASC`,
    [loanType, loanType, country],
  );
}

/** A lender plus the loan types it has verified rates for. */
export interface LenderDirectoryRow extends Bank {
  /** Comma-separated loan_type values, or null when nothing is published. */
  published_types: string | null;
}

export async function getLenderDirectory(country: string): Promise<LenderDirectoryRow[]> {
  return all<LenderDirectoryRow>(
    `SELECT b.*,
            (SELECT GROUP_CONCAT(r.loan_type)
               FROM rates r
              WHERE r.bank_id = b.id AND r.verified = 1 AND r.min_rate IS NOT NULL
            ) AS published_types
       FROM banks b
      WHERE b.country = ?
      ORDER BY b.sort_order ASC, b.name ASC`,
    [country],
  );
}

/** Only rows with a rate you have marked verified — what comparisons may use. */
export async function getVerifiedRates(
  country: string,
  loanType?: LoanTypeId,
): Promise<RateWithBank[]> {
  const where = `WHERE b.country = ? AND r.verified = 1 AND r.min_rate IS NOT NULL`;
  const order = `ORDER BY r.min_rate ASC, b.name ASC`;
  if (loanType) {
    return all<RateWithBank>(`${RATE_SELECT} ${where} AND r.loan_type = ? ${order}`, [
      country,
      loanType,
    ]);
  }
  return all<RateWithBank>(`${RATE_SELECT} ${where} ${order}`, [country]);
}

export async function getBanks(country: string): Promise<Bank[]> {
  return all<Bank>(
    `SELECT * FROM banks WHERE country = ? ORDER BY sort_order ASC, name ASC`,
    [country],
  );
}

export interface RateCoverage {
  /** Rate rows recorded (published or not). */
  total: number;
  verified: number;
  missing: number;
  /** Lenders listed on the site — the denominator users actually see. */
  lenders: number;
  lastUpdated: string | null;
}

export async function getRateCoverage(
  country: string,
  loanType?: LoanTypeId,
): Promise<RateCoverage> {
  const filter = loanType ? `WHERE country = ? AND loan_type = ?` : `WHERE country = ?`;
  const args = loanType ? [country, loanType] : [country];

  const [row, lenders] = await Promise.all([
    one<{ total: number; verified: number; last_updated: string | null }>(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN verified = 1 AND min_rate IS NOT NULL THEN 1 ELSE 0 END) AS verified,
              MAX(updated_at) AS last_updated
         FROM rates ${filter}`,
      args,
    ),
    scalar<number>(`SELECT COUNT(*) FROM banks WHERE country = ?`, [country], 0),
  ]);

  const total = Number(row?.total ?? 0);
  const verified = Number(row?.verified ?? 0);
  return {
    total,
    verified,
    missing: total - verified,
    lenders: Number(lenders),
    lastUpdated: row?.last_updated ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Scheme rates (PPF, SSY, EPF …)                                      */
/* ------------------------------------------------------------------ */

export interface SchemeRate {
  id: number;
  scheme_id: string;
  rate: number | null;
  period_label: string | null;
  source_url: string | null;
  effective_date: string | null;
  verified: number;
  notes: string | null;
  updated_at: string;
}

export async function getSchemeRates(country: string): Promise<SchemeRate[]> {
  return all<SchemeRate>(
    `SELECT * FROM scheme_rates WHERE country = ? ORDER BY scheme_id ASC`,
    [country],
  );
}

/**
 * The stored rate for one scheme, or null when nothing has been recorded.
 *
 * Returns unverified rows too — the calculators use them as an editable
 * default, clearly labelled, while the public rates table only presents a
 * figure as confirmed once `verified` is set.
 */
export async function getSchemeRate(country: string, schemeId: string): Promise<SchemeRate | null> {
  return one<SchemeRate>(
    `SELECT * FROM scheme_rates WHERE country = ? AND scheme_id = ?`,
    [country, schemeId],
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

export async function getFeedback(status?: string, limit = 200): Promise<Feedback[]> {
  if (status && status !== "all") {
    return all<Feedback>(
      `SELECT * FROM feedback WHERE status = ? ORDER BY created_at DESC LIMIT ?`,
      [status, limit],
    );
  }
  return all<Feedback>(`SELECT * FROM feedback ORDER BY created_at DESC LIMIT ?`, [limit]);
}

export interface FeedbackStats {
  total: number;
  unread: number;
  avgRating: number | null;
  last7Days: number;
}

export async function getFeedbackStats(): Promise<FeedbackStats> {
  const row = await one<{
    total: number;
    unread: number;
    avg_rating: number | null;
    last7: number;
  }>(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS unread,
            AVG(rating) AS avg_rating,
            SUM(CASE WHEN created_at > datetime('now','-7 days') THEN 1 ELSE 0 END) AS last7
       FROM feedback`,
  );
  return {
    total: Number(row?.total ?? 0),
    unread: Number(row?.unread ?? 0),
    avgRating: row?.avg_rating != null ? Number(row.avg_rating) : null,
    last7Days: Number(row?.last7 ?? 0),
  };
}

/* ------------------------------------------------------------------ */
/* Activity                                                            */
/* ------------------------------------------------------------------ */

export async function getRecentActivity(limit = 100, event?: string): Promise<ActivityRow[]> {
  if (event && event !== "all") {
    return all<ActivityRow>(
      `SELECT * FROM activity WHERE event = ? ORDER BY created_at DESC LIMIT ?`,
      [event, limit],
    );
  }
  return all<ActivityRow>(`SELECT * FROM activity ORDER BY created_at DESC LIMIT ?`, [limit]);
}

export interface ActivityStats {
  today: number;
  last7Days: number;
  last30Days: number;
  uniqueVisitors7d: number;
  topPaths: { path: string; views: number }[];
  topEvents: { event: string; count: number }[];
  devices: { device: string; count: number }[];
  daily: { day: string; views: number; visitors: number }[];
  topReferrers: { referrer: string; count: number }[];
}

export async function getActivityStats(): Promise<ActivityStats> {
  const [today, last7Days, last30Days, uniqueVisitors7d] = await Promise.all([
    scalar<number>(`SELECT COUNT(*) FROM activity WHERE created_at > datetime('now','-1 day')`, [], 0),
    scalar<number>(`SELECT COUNT(*) FROM activity WHERE created_at > datetime('now','-7 days')`, [], 0),
    scalar<number>(`SELECT COUNT(*) FROM activity WHERE created_at > datetime('now','-30 days')`, [], 0),
    scalar<number>(
      `SELECT COUNT(DISTINCT session_id) FROM activity WHERE created_at > datetime('now','-7 days')`,
      [],
      0,
    ),
  ]);

  const [topPaths, topEvents, devices, daily, topReferrers] = await Promise.all([
    all<{ path: string; views: number }>(
      `SELECT path, COUNT(*) AS views FROM activity
        WHERE event = 'pageview' AND path IS NOT NULL AND created_at > datetime('now','-30 days')
        GROUP BY path ORDER BY views DESC LIMIT 12`,
    ),
    all<{ event: string; count: number }>(
      `SELECT event, COUNT(*) AS count FROM activity
        WHERE created_at > datetime('now','-30 days')
        GROUP BY event ORDER BY count DESC LIMIT 12`,
    ),
    all<{ device: string; count: number }>(
      `SELECT COALESCE(device,'unknown') AS device, COUNT(*) AS count FROM activity
        WHERE created_at > datetime('now','-30 days')
        GROUP BY device ORDER BY count DESC`,
    ),
    all<{ day: string; views: number; visitors: number }>(
      `SELECT date(created_at) AS day,
              COUNT(*) AS views,
              COUNT(DISTINCT session_id) AS visitors
         FROM activity
        WHERE created_at > datetime('now','-29 days')
        GROUP BY day ORDER BY day ASC`,
    ),
    all<{ referrer: string; count: number }>(
      `SELECT referrer, COUNT(*) AS count FROM activity
        WHERE referrer IS NOT NULL AND referrer != '' AND created_at > datetime('now','-30 days')
        GROUP BY referrer ORDER BY count DESC LIMIT 10`,
    ),
  ]);

  return {
    today: Number(today),
    last7Days: Number(last7Days),
    last30Days: Number(last30Days),
    uniqueVisitors7d: Number(uniqueVisitors7d),
    topPaths: topPaths.map((r) => ({ path: r.path, views: Number(r.views) })),
    topEvents: topEvents.map((r) => ({ event: r.event, count: Number(r.count) })),
    devices: devices.map((r) => ({ device: r.device, count: Number(r.count) })),
    daily: daily.map((r) => ({ day: r.day, views: Number(r.views), visitors: Number(r.visitors) })),
    topReferrers: topReferrers.map((r) => ({ referrer: r.referrer, count: Number(r.count) })),
  };
}

/* ------------------------------------------------------------------ */
/* Dashboard roll-up                                                   */
/* ------------------------------------------------------------------ */

export async function getDashboardSummary() {
  const [feedback, activity, coverage, postCounts] = await Promise.all([
    getFeedbackStats(),
    getActivityStats(),
    // The dashboard headline reports the primary market; per-country
    // coverage is on the rates screen itself.
    getRateCoverage(DEFAULT_COUNTRY),
    one<{ published: number; drafts: number; views: number }>(
      `SELECT SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) AS published,
              SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END)     AS drafts,
              SUM(views)                                          AS views
         FROM posts`,
    ),
  ]);

  return {
    feedback,
    activity,
    coverage,
    posts: {
      published: Number(postCounts?.published ?? 0),
      drafts: Number(postCounts?.drafts ?? 0),
      views: Number(postCounts?.views ?? 0),
    },
  };
}

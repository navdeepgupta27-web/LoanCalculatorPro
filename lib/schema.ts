/**
 * SQLite schema. Every statement is idempotent so it can be replayed on every
 * cold start — which is how the schema is kept in sync on serverless hosts
 * without a separate migration step.
 */
export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS feedback (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     name        TEXT    NOT NULL,
     email       TEXT,
     rating      INTEGER,
     category    TEXT    NOT NULL DEFAULT 'general',
     subject     TEXT,
     message     TEXT    NOT NULL,
     page_url    TEXT,
     user_agent  TEXT,
     ip_hash     TEXT,
     status      TEXT    NOT NULL DEFAULT 'new',
     admin_note  TEXT,
     created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
     updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_feedback_status  ON feedback (status)`,

  `CREATE TABLE IF NOT EXISTS activity (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     event       TEXT    NOT NULL,
     path        TEXT,
     referrer    TEXT,
     session_id  TEXT,
     device      TEXT,
     user_agent  TEXT,
     ip_hash     TEXT,
     meta        TEXT,
     created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE INDEX IF NOT EXISTS idx_activity_created ON activity (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_event   ON activity (event)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_session ON activity (session_id)`,

  `CREATE TABLE IF NOT EXISTS posts (
     id              INTEGER PRIMARY KEY AUTOINCREMENT,
     slug            TEXT    NOT NULL UNIQUE,
     title           TEXT    NOT NULL,
     excerpt         TEXT,
     content         TEXT    NOT NULL,
     cover_variant   TEXT    NOT NULL DEFAULT 'indigo',
     tags            TEXT,
     author          TEXT    NOT NULL DEFAULT 'Loan Calculator Pro',
     status          TEXT    NOT NULL DEFAULT 'draft',
     seo_title       TEXT,
     seo_description TEXT,
     keywords        TEXT,
     views           INTEGER NOT NULL DEFAULT 0,
     published_at    TEXT,
     created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
     updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE INDEX IF NOT EXISTS idx_posts_status    ON posts (status, published_at DESC)`,

  `CREATE TABLE IF NOT EXISTS banks (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     country     TEXT    NOT NULL DEFAULT 'in',
     slug        TEXT    NOT NULL,
     name        TEXT    NOT NULL,
     short_name  TEXT    NOT NULL,
     category    TEXT    NOT NULL DEFAULT 'private',
     accent      TEXT    NOT NULL DEFAULT '#4f46e5',
     website     TEXT,
     sort_order  INTEGER NOT NULL DEFAULT 100,
     created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
  /* A slug is unique within a country, not globally: HSBC is a real lender in
     the UK, the UAE, Singapore and Canada, and all four are separate rows. */
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_banks_country_slug ON banks (country, slug)`,
  `CREATE INDEX IF NOT EXISTS idx_banks_country ON banks (country, sort_order)`,

  `CREATE TABLE IF NOT EXISTS rates (
     id              INTEGER PRIMARY KEY AUTOINCREMENT,
     bank_id         INTEGER NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
     /* Denormalised from the bank so rate queries can filter without a join. */
     country         TEXT    NOT NULL DEFAULT 'in',
     loan_type       TEXT    NOT NULL,
     min_rate        REAL,
     max_rate        REAL,
     processing_fee  TEXT,
     max_tenure_years INTEGER,
     max_amount      REAL,
     source_url      TEXT,
     effective_date  TEXT,
     verified        INTEGER NOT NULL DEFAULT 0,
     notes           TEXT,
     updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
     UNIQUE (bank_id, loan_type)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_rates_type ON rates (country, loan_type, verified)`,

  /* Government-set rates for PPF, Sukanya Samriddhi, EPF and the like.
     Kept out of the code because they are revised quarterly (small savings)
     or annually (EPF), and carry a source and date exactly like bank rates. */
  `CREATE TABLE IF NOT EXISTS scheme_rates (
     id             INTEGER PRIMARY KEY AUTOINCREMENT,
     country        TEXT    NOT NULL DEFAULT 'in',
     scheme_id      TEXT    NOT NULL,
     rate           REAL,
     /* Free text, e.g. "Q2 FY 2026-27 (Jul-Sep 2026)". */
     period_label   TEXT,
     source_url     TEXT,
     effective_date TEXT,
     verified       INTEGER NOT NULL DEFAULT 0,
     notes          TEXT,
     updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_scheme_rates_country_id ON scheme_rates (country, scheme_id)`,
  `CREATE INDEX IF NOT EXISTS idx_scheme_rates_verified ON scheme_rates (country, verified)`,

  `CREATE TABLE IF NOT EXISTS settings (
     key        TEXT PRIMARY KEY,
     value      TEXT,
     updated_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,

  `CREATE TABLE IF NOT EXISTS login_attempts (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     ip_hash    TEXT NOT NULL,
     ok         INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE INDEX IF NOT EXISTS idx_login_ip ON login_attempts (ip_hash, created_at DESC)`,
];

/**
 * Columns added after the first release.
 *
 * SQLite has no ADD COLUMN IF NOT EXISTS, and there is no migration-version
 * table here, so these are applied on every cold start and the "duplicate
 * column name" error is expected and ignored. Only ever append: a statement
 * that drops or rewrites data does not belong in a list that re-runs.
 */
export const COLUMN_ADDITIONS: string[] = [
  `ALTER TABLE banks ADD COLUMN country TEXT NOT NULL DEFAULT 'in'`,
  `ALTER TABLE rates ADD COLUMN country TEXT NOT NULL DEFAULT 'in'`,
  `ALTER TABLE scheme_rates ADD COLUMN country TEXT NOT NULL DEFAULT 'in'`,
  // Guides are written for one market — the existing ones quote rupee figures
  // in their titles — so the homepage strip can show only the relevant set.
  `ALTER TABLE posts ADD COLUMN country TEXT NOT NULL DEFAULT 'in'`,
];

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
     slug        TEXT    NOT NULL UNIQUE,
     name        TEXT    NOT NULL,
     short_name  TEXT    NOT NULL,
     category    TEXT    NOT NULL DEFAULT 'private',
     accent      TEXT    NOT NULL DEFAULT '#4f46e5',
     website     TEXT,
     sort_order  INTEGER NOT NULL DEFAULT 100,
     created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,

  `CREATE TABLE IF NOT EXISTS rates (
     id              INTEGER PRIMARY KEY AUTOINCREMENT,
     bank_id         INTEGER NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
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
  `CREATE INDEX IF NOT EXISTS idx_rates_type ON rates (loan_type, verified)`,

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

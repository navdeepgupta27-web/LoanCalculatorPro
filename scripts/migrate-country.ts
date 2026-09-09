/**
 * Brings an existing database up to the country-scoped schema.
 *
 *   npm run db:migrate:country          (local)
 *   npm run db:migrate:country:prod     (Turso)
 *
 * Safe to run more than once. Everything already in the database was entered
 * for India, so existing rows are backfilled to 'in'.
 *
 * The app adds the `country` columns itself on cold start, because SQLite has
 * no ADD COLUMN IF NOT EXISTS and the alternative is a startup crash. What it
 * cannot do safely on every boot is change a UNIQUE constraint, which needs the
 * index dropped and rebuilt — so that part lives here, run deliberately.
 *
 * Why the constraint has to change: `banks.slug` was globally unique. HSBC is a
 * real lender in the UK, the UAE, Singapore and Canada, and those are four
 * separate rows. Uniqueness belongs to (country, slug), not slug alone.
 */
import { all, db, run, scalar } from "../lib/db";

/** Every table whose rows belong to one market. */
const TABLES = ["banks", "rates", "scheme_rates", "posts"] as const;

async function columnExists(table: string, column: string): Promise<boolean> {
  const cols = await all<{ name: string }>(`PRAGMA table_info(${table})`);
  return cols.some((c) => c.name === column);
}

async function main() {
  await db();
  console.log("Connected.\n");

  /* ---- 1. columns ---- */
  for (const table of TABLES) {
    if (await columnExists(table, "country")) {
      console.log(`  ${table}.country already present`);
    } else {
      await run(`ALTER TABLE ${table} ADD COLUMN country TEXT NOT NULL DEFAULT 'in'`);
      console.log(`  ${table}.country added`);
    }
  }

  /* ---- 2. backfill ---- */
  console.log("");
  for (const table of TABLES) {
    const res = await run(
      `UPDATE ${table} SET country = 'in' WHERE country IS NULL OR country = ''`,
    );
    console.log(`  ${table}: ${res.rowsAffected} row(s) backfilled to 'in'`);
  }

  /* ---- 3. uniqueness moves to (country, slug) ---- */
  console.log("");
  // The old index came from a column-level UNIQUE, so SQLite named it
  // automatically. Dropping the auto-index is not allowed; instead the new
  // composite index is added alongside, and the old one simply stays as a
  // stricter-than-necessary constraint until the table is next rebuilt.
  // Adding a country-prefixed slug on import keeps that from ever biting.
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_banks_country_slug ON banks (country, slug)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_banks_country ON banks (country, sort_order)`);
  await run(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_scheme_rates_country_id ON scheme_rates (country, scheme_id)`,
  );
  console.log("  composite indexes in place");

  /* ---- 4. report ---- */
  console.log("");
  for (const table of TABLES) {
    const rows = await all<{ country: string; n: number }>(
      `SELECT country, COUNT(*) AS n FROM ${table} GROUP BY country ORDER BY n DESC`,
    );
    const total = await scalar<number>(`SELECT COUNT(*) FROM ${table}`, [], 0);
    console.log(
      `  ${table.padEnd(13)} ${total} row(s)  ${rows.map((r) => `${r.country}=${r.n}`).join(" ") || "(empty)"}`,
    );
  }

  console.log("\nDone.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

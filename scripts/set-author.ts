/**
 * Puts a real name on the existing guides.
 *
 *   npm run db:author          (local)
 *   npm run db:author:prod     (Turso)
 *
 * Posts were seeded with the site's own name as the author, which on a site
 * giving people figures to make money decisions on is the weakest possible
 * attribution — Google reads unattributed financial writing as low trust, and
 * says so in its own quality guidance.
 *
 * Only rows still carrying the old placeholder are touched, so a post that has
 * been given a different author by hand keeps it. Safe to re-run.
 */
import { all, db, run } from "../lib/db";
import { AUTHOR } from "../lib/site";

// "LoanCalc Pro" is the name the site used before it was renamed; two of the
// earliest posts were seeded under it.
const PLACEHOLDERS = ["Loan Calculator Pro", "LoanCalc Pro", "Admin", ""];

async function main() {
  await db();

  const before = await all<{ author: string; n: number }>(
    `SELECT author, COUNT(*) AS n FROM posts GROUP BY author ORDER BY n DESC`,
  );
  console.log("\nBefore:");
  for (const r of before) console.log(`  ${r.n} × ${r.author || "(blank)"}`);

  const placeholders = PLACEHOLDERS.map(() => "?").join(", ");
  const res = await run(
    `UPDATE posts SET author = ? WHERE author IN (${placeholders}) OR author IS NULL`,
    [AUTHOR.name, ...PLACEHOLDERS],
  );

  const after = await all<{ author: string; n: number }>(
    `SELECT author, COUNT(*) AS n FROM posts GROUP BY author ORDER BY n DESC`,
  );
  console.log(`\n${res.rowsAffected} row(s) updated.\n\nAfter:`);
  for (const r of after) console.log(`  ${r.n} × ${r.author || "(blank)"}`);
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

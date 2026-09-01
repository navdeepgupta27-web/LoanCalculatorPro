/**
 * Hashes an admin password for ADMIN_PASSWORD_HASH.
 *
 *   npm run gen:hash -- 'your-strong-password'
 *
 * Quote the password so the shell does not interpret $ ! or spaces.
 * Note that anything typed on the command line lands in your shell history —
 * clear it afterwards, or run this with a leading space if your shell is
 * configured to skip those.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("\nUsage: npm run gen:hash -- 'your-strong-password'\n");
  process.exit(1);
}

if (password.length < 12) {
  console.error(
    `\nThat password is ${password.length} characters. Use at least 12 — this is the only` +
      `\ncredential protecting your admin console.\n`,
  );
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

console.log(`
Add this to your environment (and delete any plaintext ADMIN_PASSWORD):

ADMIN_PASSWORD_HASH=${hash}
`);

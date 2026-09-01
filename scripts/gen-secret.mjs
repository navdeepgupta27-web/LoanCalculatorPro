/**
 * Prints a cryptographically random AUTH_SECRET and IP_SALT.
 *
 *   npm run gen:secret
 */
import { randomBytes } from "node:crypto";

const secret = randomBytes(48).toString("base64url");
const salt = randomBytes(24).toString("hex");

console.log(`
Add these to .env.local (development) and to your Vercel project's
environment variables (production). Use DIFFERENT values in each.

AUTH_SECRET=${secret}
IP_SALT=${salt}

Rotating AUTH_SECRET signs everyone out immediately.
Rotating IP_SALT resets unique-visitor de-duplication and login rate limits.
`);

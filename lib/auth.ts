import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { all, hashIp, run } from "./db";

/**
 * Single-operator admin authentication.
 *
 * There is deliberately no sign-up route and no user table: the one legitimate
 * account is defined by environment variables, so an attacker cannot create an
 * account even if they find the login page. Sessions are stateless signed JWTs
 * held in an HTTP-only cookie.
 */

export const SESSION_COOKIE = "lcp_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const MAX_FAILED_ATTEMPTS = 8;
const LOCKOUT_WINDOW_MINUTES = 15;

export interface AdminSession {
  email: string;
  issuedAt: number;
}

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is missing or shorter than 32 characters. Generate one with `npm run gen:secret`.",
    );
  }
  return new TextEncoder().encode(secret);
}

/** True when the admin credentials have actually been configured. */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_EMAIL &&
      (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD) &&
      process.env.AUTH_SECRET,
  );
}

/* ------------------------------------------------------------------ */
/* Credential check                                                    */
/* ------------------------------------------------------------------ */

/**
 * Compares in constant time via bcrypt. When only a plaintext `ADMIN_PASSWORD`
 * is set (convenient in local dev) it is compared directly — production should
 * always use `ADMIN_PASSWORD_HASH`.
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const plain = process.env.ADMIN_PASSWORD;

  if (!expectedEmail) return false;

  const emailOk = email.trim().toLowerCase() === expectedEmail;
  // Always run the expensive comparison so a wrong email is not measurably
  // faster to reject than a wrong password.
  let passwordOk = false;
  if (hash) {
    passwordOk = await bcrypt.compare(password, hash);
  } else if (plain) {
    passwordOk = timingSafeEqual(password, plain);
  }

  return emailOk && passwordOk;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ------------------------------------------------------------------ */
/* Rate limiting                                                       */
/* ------------------------------------------------------------------ */

export async function isLockedOut(ip: string): Promise<boolean> {
  const rows = await all<{ n: number }>(
    `SELECT COUNT(*) AS n FROM login_attempts
      WHERE ip_hash = ? AND ok = 0 AND created_at > datetime('now', ?)`,
    [hashIp(ip), `-${LOCKOUT_WINDOW_MINUTES} minutes`],
  );
  return Number(rows[0]?.n ?? 0) >= MAX_FAILED_ATTEMPTS;
}

export async function recordLoginAttempt(ip: string, ok: boolean) {
  await run(`INSERT INTO login_attempts (ip_hash, ok) VALUES (?, ?)`, [hashIp(ip), ok ? 1 : 0]);
  // Opportunistic cleanup so the table never grows without bound.
  await run(`DELETE FROM login_attempts WHERE created_at < datetime('now', '-7 days')`);
}

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

export async function createSession(email: string): Promise<void> {
  const token = await new SignJWT({ email, issuedAt: Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("loancalculatorpro.in")
    .setAudience("lcp-admin")
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<AdminSession | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: "loancalculatorpro.in",
      audience: "lcp-admin",
    });
    if (typeof payload.email !== "string") return null;
    // A session is only valid for the address currently configured, so
    // changing ADMIN_EMAIL immediately invalidates any outstanding cookie.
    if (payload.email.toLowerCase() !== process.env.ADMIN_EMAIL?.trim().toLowerCase()) return null;
    return { email: payload.email, issuedAt: Number(payload.issuedAt) || 0 };
  } catch {
    return null;
  }
}

/** Server-component guard: redirects to the login page when signed out. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Route-handler guard: returns a 401 response instead of redirecting. */
export async function requireAdminApi(): Promise<AdminSession | Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export function isResponse(v: unknown): v is Response {
  return v instanceof Response;
}

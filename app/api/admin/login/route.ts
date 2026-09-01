import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createSession,
  destroySession,
  isAdminConfigured,
  isLockedOut,
  recordLoginAttempt,
  verifyCredentials,
} from "@/lib/auth";
import { clientIp } from "@/lib/db";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin access is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and AUTH_SECRET.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Enter your email and password." }, { status: 400 });
  }

  const ip = clientIp(request.headers);

  try {
    if (await isLockedOut(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many failed attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    }

    const ok = await verifyCredentials(parsed.data.email, parsed.data.password);
    await recordLoginAttempt(ip, ok);

    if (!ok) {
      // Deliberately vague: naming which half was wrong would confirm the
      // email address to an attacker.
      return NextResponse.json(
        { ok: false, error: "Those credentials were not recognised." },
        { status: 401 },
      );
    }

    await createSession(parsed.data.email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/login] failed:", err);
    return NextResponse.json({ ok: false, error: "Sign-in failed. Please try again." }, { status: 500 });
  }
}

/** Sign out. */
export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}

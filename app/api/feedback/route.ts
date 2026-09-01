import { NextResponse } from "next/server";
import { z } from "zod";

import { clientIp, hashIp, run, scalar } from "@/lib/db";

/** Feedback is written, never cached. */
export const dynamic = "force-dynamic";

const FeedbackSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(120),
  email: z.string().trim().email("That email address does not look right.").max(200).optional().or(z.literal("")),
  category: z
    .enum(["general", "bug", "feature", "rates", "accuracy", "partnership"])
    .default("general"),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "A little more detail would help.").max(5000),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  pageUrl: z.string().trim().max(500).nullable().optional(),
  /** Honeypot — must stay empty. */
  website: z.string().max(200).optional(),
});

const MAX_PER_HOUR = 5;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Bots fill the hidden field. Return success so they do not learn otherwise.
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(request.headers);
  const ipHash = hashIp(ip);

  try {
    const recent = await scalar<number>(
      `SELECT COUNT(*) FROM feedback WHERE ip_hash = ? AND created_at > datetime('now','-1 hour')`,
      [ipHash],
      0,
    );

    if (Number(recent) >= MAX_PER_HOUR) {
      return NextResponse.json(
        { ok: false, error: "That is a lot of feedback in one hour. Please try again later." },
        { status: 429 },
      );
    }

    await run(
      `INSERT INTO feedback (name, email, rating, category, subject, message, page_url, user_agent, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.email || null,
        data.rating ?? null,
        data.category,
        data.subject || null,
        data.message,
        data.pageUrl || null,
        request.headers.get("user-agent")?.slice(0, 400) ?? null,
        ipHash,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[feedback] insert failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save your message. Please try again shortly." },
      { status: 500 },
    );
  }
}

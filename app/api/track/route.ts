import { NextResponse } from "next/server";
import { z } from "zod";

import { clientIp, hashIp, run } from "@/lib/db";
import { deviceFromUserAgent, hostOf } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TrackSchema = z.object({
  event: z.string().trim().min(1).max(60),
  path: z.string().trim().max(300).nullable().optional(),
  referrer: z.string().trim().max(500).nullable().optional(),
  sessionId: z.string().trim().max(80).nullable().optional(),
  meta: z.record(z.string(), z.unknown()).nullable().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = TrackSchema.safeParse(body);
  // Analytics must never surface an error to a visitor — a bad payload is
  // simply dropped.
  if (!parsed.success) return new NextResponse(null, { status: 204 });

  const data = parsed.data;
  const userAgent = request.headers.get("user-agent");
  const device = deviceFromUserAgent(userAgent);

  // Crawlers are not an audience; logging them would distort every figure.
  if (device === "bot") return new NextResponse(null, { status: 204 });

  // Never log the admin console, whatever the client claims.
  if (data.path?.startsWith("/admin")) return new NextResponse(null, { status: 204 });

  try {
    await run(
      `INSERT INTO activity (event, path, referrer, session_id, device, user_agent, ip_hash, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.event,
        data.path ?? null,
        // Only the referring host is kept, never the full URL with its query.
        data.referrer ? hostOf(data.referrer) : null,
        data.sessionId ?? null,
        device,
        userAgent?.slice(0, 300) ?? null,
        hashIp(clientIp(request.headers)),
        data.meta ? JSON.stringify(data.meta).slice(0, 1000) : null,
      ],
    );

    // Blog reads are counted off the same beacon rather than during render,
    // which would either be cached away or force the post page to be dynamic.
    if (data.event === "pageview" && data.path?.startsWith("/blog/")) {
      const slug = data.path.slice("/blog/".length).split(/[?#/]/)[0];
      if (slug) {
        await run(`UPDATE posts SET views = views + 1 WHERE slug = ? AND status = 'published'`, [slug]);
      }
    }
  } catch (err) {
    console.error("[track] insert failed:", err);
  }

  return new NextResponse(null, { status: 204 });
}

import { ImageResponse } from "next/og";

import { getPostBySlug } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const alt = "Loan Calculator Pro guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENTS: Record<string, string> = {
  indigo: "#6366f1",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
};

/** Per-article social card, so each guide unfurls with its own headline. */
export default async function BlogOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);

  const title = post?.title ?? "Loan guides";
  const accent = ACCENTS[post?.cover_variant ?? "indigo"] ?? ACCENTS.indigo;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0b1020",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: accent,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -240,
            right: -180,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: `radial-gradient(circle, ${accent}55, transparent 70%)`,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 15,
              background: `linear-gradient(135deg, ${accent}, #4f46e5)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            ₹
          </div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>Loan Calculator Pro</div>
          <div style={{ fontSize: 20, color: "#8b93a9" }}>· Guides</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 52 : 62,
            fontWeight: 800,
            lineHeight: 1.14,
            letterSpacing: -1.8,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#8b93a9", letterSpacing: 1.5 }}>
          {SITE.domain.toUpperCase()}
        </div>
      </div>
    ),
    size,
  );
}

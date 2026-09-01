import { ImageResponse } from "next/og";

import { SITE } from "@/lib/site";

/**
 * Social preview card. Rendered once at build time and reused by every page
 * that does not define its own, so links always unfurl with real branding
 * instead of a blank rectangle.
 */
export const alt = "LoanCalc Pro — EMI calculator with part-payment savings and bank comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
        {/* Aurora wash, matching the site hero. */}
        <div
          style={{
            position: "absolute",
            top: -220,
            left: -140,
            width: 700,
            height: 700,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(99,102,241,0.55), rgba(99,102,241,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            right: -160,
            width: 640,
            height: 640,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(16,185,129,0.45), rgba(16,185,129,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #6366f1, #4f46e5 55%, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            ₹
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>LoanCalc Pro</div>
            <div style={{ fontSize: 17, color: "#8b93a9", letterSpacing: 2 }}>
              {SITE.domain.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -2.4,
              maxWidth: 940,
            }}
          >
            Know exactly what your loan costs
          </div>
          <div style={{ fontSize: 27, color: "#b4bcd0", maxWidth: 900, lineHeight: 1.4 }}>
            EMI, part-payment savings, tenure vs EMI reduction and side-by-side bank comparison —
            free, and calculated in your browser.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["Home", "Car", "Personal", "Business", "Education", "Gold"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.06)",
                fontSize: 21,
                color: "#eef1f8",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

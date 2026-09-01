import { ImageResponse } from "next/og";

/** Home-screen icon for iOS. Solid background — iOS does not honour transparency. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 55%, #10b981 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>₹</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>EMI</div>
      </div>
    ),
    size,
  );
}

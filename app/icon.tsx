import { ImageResponse } from "next/og";

/**
 * Browser-tab icon, generated at build time so there is no binary asset to keep
 * in sync with the brand colours.
 */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 55%, #10b981 100%)",
          borderRadius: 16,
          color: "white",
          fontSize: 42,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        ₹
      </div>
    ),
    size,
  );
}

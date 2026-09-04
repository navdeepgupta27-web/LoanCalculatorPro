import { ImageResponse } from "next/og";

/**
 * Browser-tab icon, generated at build time so there is no binary asset to keep
 * in sync with the brand colours.
 *
 * 96px rather than a more usual 32 or 64: Google will only consider a favicon
 * for search results if it is square and a multiple of 48px. 64 is not, which
 * is why this was previously ineligible.
 */
export const size = { width: 96, height: 96 };
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
          borderRadius: size.width * 0.25,
          color: "white",
          fontSize: size.width * 0.66,
          fontWeight: 800,
          letterSpacing: -(size.width * 0.03),
        }}
      >
        ₹
      </div>
    ),
    size,
  );
}

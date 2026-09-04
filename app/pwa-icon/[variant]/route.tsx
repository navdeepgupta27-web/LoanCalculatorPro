import { ImageResponse } from "next/og";

/**
 * Home-screen icons for the installed app.
 *
 * A browser will not offer to install a site unless the manifest carries a
 * 192px and a 512px icon; the 64px favicon and the 180px Apple touch icon do
 * not count. These are generated from the same gradient as `app/icon.tsx` so
 * there is still no binary asset to keep in sync with the brand colours.
 *
 * Two purposes, two shapes:
 *
 *  - "any" is drawn as-is, so it gets the rounded-square treatment.
 *  - "maskable" is cropped by the launcher to whatever shape the phone uses —
 *    a circle on Pixel, a squircle on Samsung. The background therefore has to
 *    bleed to every edge, and the glyph has to sit inside the safe zone (the
 *    middle 80%) or its edges get shaved off.
 */

interface Variant {
  size: number;
  maskable: boolean;
}

const VARIANTS: Record<string, Variant> = {
  "192.png": { size: 192, maskable: false },
  "512.png": { size: 512, maskable: false },
  "maskable-192.png": { size: 192, maskable: true },
  "maskable-512.png": { size: 512, maskable: true },
};

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((variant) => ({ variant }));
}

// The four names above are the only ones that exist; anything else is a 404
// rather than an on-demand render.
export const dynamicParams = false;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ variant: string }> },
) {
  const { variant } = await params;
  const spec = VARIANTS[variant];
  if (!spec) return new Response("Not found", { status: 404 });

  const { size, maskable } = spec;

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
          // A maskable icon is cropped by the launcher, so it must not round
          // its own corners — the mask supplies the shape.
          borderRadius: maskable ? 0 : size * 0.22,
          color: "white",
          // Smaller glyph on the maskable variant keeps it clear of the crop.
          fontSize: maskable ? size * 0.46 : size * 0.62,
          fontWeight: 800,
          letterSpacing: -(size * 0.03),
        }}
      >
        ₹
      </div>
    ),
    { width: size, height: size },
  );
}

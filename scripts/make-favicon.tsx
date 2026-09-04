/**
 * Generates public/favicon.ico from the same artwork as app/icon.tsx.
 *
 *   npm run gen:favicon
 *
 * Browsers and crawlers request /favicon.ico regardless of what the page links
 * to. An earlier attempt served that path from a route handler in the app
 * directory, but Next treats `favicon.ico` there as a metadata file rather than
 * a route: locally it returned the intended redirect, and on Vercel it became a
 * 200 with an empty body — a blank icon, which is worse than nothing, since a
 * crawler can cache it as the site's favicon.
 *
 * A plain file in public/ has no such special-casing. It is committed as a
 * binary rather than generated during the build so that what ships is exactly
 * what was checked.
 *
 * The .ico wraps a PNG, which every browser since IE7 reads. That keeps a
 * single source of artwork instead of a second hand-drawn copy that could
 * drift away from the real icon.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/** Must stay a multiple of 48: Google ignores favicons that are not. */
const SIZE = 96;

async function renderPng(): Promise<Buffer> {
  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 55%, #10b981 100%)",
          borderRadius: SIZE * 0.25,
          color: "white",
          fontSize: SIZE * 0.66,
          fontWeight: 800,
          letterSpacing: -(SIZE * 0.03),
        }}
      >
        ₹
      </div>
    ),
    { width: SIZE, height: SIZE },
  );

  return Buffer.from(await response.arrayBuffer());
}

/** Wraps PNG bytes in a single-image ICO container. */
function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  // 0 means 256 in this field; every size we use fits in a byte.
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2); // palette size, 0 for truecolour
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12); // offset to the data

  return Buffer.concat([header, entry, png]);
}

async function main() {
  const png = await renderPng();
  const ico = pngToIco(png, SIZE);
  const out = join(process.cwd(), "public", "favicon.ico");
  writeFileSync(out, ico);
  console.log(`Wrote ${out} — ${SIZE}x${SIZE}, ${ico.length} bytes`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

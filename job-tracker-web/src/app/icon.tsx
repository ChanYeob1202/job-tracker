import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Landr "L" monogram — solid brand blue, matching the nav wordmark
// and sidebar logo (Tailwind brand-600 #1466d0).
export default function Icon() {
  return new ImageResponse(
    (
      // Transparent 32x32 canvas; the solid square is inset so it reads
      // smaller in the tab, sharp-cornered, with a big bold "L".
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 0,
            background: "#1466d0",
          }}
        >
          {/* "L" drawn as a filled shape, not a font glyph — so thickness is
             ours to control. Stem width = 26px, foot height = 24px in a 100
             viewBox. Make those numbers bigger to make the L fatter. */}
          <svg width="18" height="18" viewBox="0 0 100 100">
            <path d="M28 14 H54 V60 H86 V84 H28 Z" fill="white" />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

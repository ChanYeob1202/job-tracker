import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Landr "L" monogram — matches the nav wordmark gradient
// (Tailwind from-brand-600 #1466d0 → to-accent-600 #7c3aed).
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
          fontSize: 22,
          fontWeight: 700,
          color: "white",
          borderRadius: 7,
          background: "linear-gradient(135deg, #1466d0 0%, #7c3aed 100%)",
        }}
      >
        L
      </div>
    ),
    {
      ...size,
    }
  );
}

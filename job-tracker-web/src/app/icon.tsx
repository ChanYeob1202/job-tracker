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
          background: "#1466d0",
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

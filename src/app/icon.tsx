import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          background: "linear-gradient(135deg, #fde047 0%, #fbbf24 60%, #d97706 100%)",
          color: "#0a0a0a",
          fontWeight: 900,
          fontSize: 22,
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderRadius: 6,
        }}
      >
        S
      </div>
    ),
    { ...size },
  );
}

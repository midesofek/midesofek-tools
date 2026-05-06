import { ImageResponse } from "next/og";
import { getTool } from "@/lib/tools";

export const runtime = "edge";
export const alt = "QR Code Generator — midesofek-tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const tool = getTool("qr-code-generator");

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: "#0a0a0a",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "24px",
          opacity: 0.6,
        }}
      >
        <span>MideSofek-tools</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ fontSize: "96px" }}>{tool?.icon ?? "🔗"}</div>
        <div style={{ fontSize: "72px", fontWeight: 700, lineHeight: 1.1 }}>
          {tool?.name ?? "QR Code Generator"}
        </div>
        <div style={{ fontSize: "32px", opacity: 0.7, maxWidth: "900px" }}>
          {tool?.shortDescription}
        </div>
      </div>
      <div
        style={{ display: "flex", gap: "16px", fontSize: "20px", opacity: 0.5 }}
      >
        <span>Free</span>
        <span>·</span>
        <span>Open Source</span>
        <span>·</span>
        <span>No Signup</span>
      </div>
    </div>,
    { ...size },
  );
}

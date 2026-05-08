import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "midesofek-tools — Free, open-source tools for builders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
      <div style={{ fontSize: "32px", opacity: 0.6 }}>midesofek-tools</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ fontSize: "84px", fontWeight: 700, lineHeight: 1.1 }}>
          Free, open-source tools for builders, traders, and creators.
        </div>
        <div style={{ fontSize: "32px", opacity: 0.7 }}>
          No signup. No tracking. Runs in your browser.
        </div>
      </div>
      <div
        style={{ display: "flex", gap: "16px", fontSize: "20px", opacity: 0.5 }}
      >
        <span>tools.midesofek.com</span>
      </div>
    </div>,
    { ...size },
  );
}

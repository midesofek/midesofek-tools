import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(to right, #627eea, #8b5cf6, #10b981, #f59e0b)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            opacity: 0.5,
            letterSpacing: "2px",
          }}
        >
          TOOLS.MIDESOFEK.COM
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-3px",
            }}
          >
            Ethereum Signature Verifier
          </div>
          <div style={{ fontSize: "36px", opacity: 0.7, display: "flex" }}>
            EOA, ERC-1271, EIP-6492, EIP-7702, Safe. When it fails, see exactly why.
          </div>
          <div
            style={{
              fontSize: "24px",
              opacity: 0.5,
              display: "flex",
              fontFamily: "monospace",
              marginTop: "12px",
            }}
          >
            isValidSignature() || ecrecover()
          </div>
        </div>
        <div style={{ display: "flex", fontSize: "24px", opacity: 0.5 }}>
          Free • No signup • Open source
        </div>
      </div>
    ),
    { ...size },
  );
}

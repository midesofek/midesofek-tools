import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { fetchReceipt } from "@/app/onchain-receipt-generator/lib/fetch-receipt";
import { enrichReceiptWithPrices } from "@/app/onchain-receipt-generator/lib/fetch-prices";
import { CHAINS, type Chain } from "@/app/onchain-receipt-generator/types";
import {
  formatUsd,
  formatAmount,
  formatTimestamp,
} from "@/app/onchain-receipt-generator/lib/format";

export const runtime = "edge";

// Color palette per chain — the single accent color is the brand of the receipt
const CHAIN_ACCENT: Record<
  Chain,
  { bg: string; accent: string; text: string }
> = {
  ethereum: { bg: "#0a0a0a", accent: "#627eea", text: "#ffffff" },
  base: { bg: "#0a0a0a", accent: "#0052ff", text: "#ffffff" },
  bsc: { bg: "#0a0a0a", accent: "#f0b90b", text: "#ffffff" },
  solana: { bg: "#0a0a0a", accent: "#9945ff", text: "#ffffff" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get("hash");

  if (!hash) {
    return new Response("Missing hash parameter", { status: 400 });
  }

  // Fetch + enrich (same pipeline as the JSON API route)
  const fetchResult = await fetchReceipt(hash);
  if (!fetchResult.ok) {
    return new Response(fetchResult.error, { status: 404 });
  }

  const receipt = await enrichReceiptWithPrices(fetchResult.receipt);
  const chainInfo = CHAINS[receipt.chain];
  const palette = CHAIN_ACCENT[receipt.chain];

  // Decide headline content (same logic as Receipt.tsx / ReceiptPDF.tsx)
  const showNative = parseFloat(receipt.value.amount) > 0;
  const showTokens = !showNative && receipt.tokenTransfers.length > 0;

  // Pick the single most important number to feature huge
  const headlineAmount = showNative
    ? formatAmount(receipt.value.amount)
    : showTokens
      ? formatAmount(receipt.tokenTransfers[0].amount)
      : "—";
  const headlineSymbol = showNative
    ? receipt.value.symbol
    : showTokens
      ? receipt.tokenTransfers[0].symbol
      : "";
  const headlineUsd = showNative
    ? receipt.value.usdValue
    : showTokens
      ? receipt.tokenTransfers[0].usdValue
      : undefined;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: palette.bg,
        color: palette.text,
        padding: "64px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Accent bar — chain identity strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          background: palette.accent,
          display: "flex",
        }}
      />

      {/* Top row: chain name + status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: palette.accent,
              letterSpacing: "2px",
            }}
          >
            {chainInfo.name.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: "20px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: receipt.status === "success" ? "#064e3b" : "#7f1d1d",
              color: receipt.status === "success" ? "#a7f3d0" : "#fecaca",
              display: "flex",
            }}
          >
            {receipt.status === "success" ? "● Success" : "● Failed"}
          </div>
        </div>
        <div style={{ fontSize: "20px", opacity: 0.5, display: "flex" }}>
          ONCHAIN RECEIPT
        </div>
      </div>

      {/* Center: the headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "28px", opacity: 0.5, display: "flex" }}>
          {showNative ? "Amount" : showTokens ? "Transferred" : "Transaction"}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: "140px",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-4px",
            }}
          >
            {headlineAmount}
          </div>
          <div style={{ fontSize: "48px", opacity: 0.6 }}>{headlineSymbol}</div>
        </div>
        {headlineUsd !== undefined && (
          <div style={{ fontSize: "32px", opacity: 0.5, display: "flex" }}>
            {formatUsd(headlineUsd)} at time of tx
          </div>
        )}

        {/* Multi-token: show additional transfers as compact lines */}
        {showTokens && receipt.tokenTransfers.length > 1 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "16px",
              gap: "6px",
              opacity: 0.6,
            }}
          >
            {receipt.tokenTransfers.slice(1, 3).map((t, i) => (
              <div key={i} style={{ fontSize: "24px", display: "flex" }}>
                + {formatAmount(t.amount)} {t.symbol}
              </div>
            ))}
            {receipt.tokenTransfers.length > 3 && (
              <div style={{ fontSize: "20px", opacity: 0.6, display: "flex" }}>
                +{receipt.tokenTransfers.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom row: date + branding */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: "20px",
          opacity: 0.5,
        }}
      >
        <div style={{ display: "flex" }}>
          {formatTimestamp(receipt.timestamp)}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span>tools.midesofek.com</span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}

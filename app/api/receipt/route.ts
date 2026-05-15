import { NextRequest, NextResponse } from "next/server";
import { fetchReceipt } from "@/app/onchain-receipt-generator/lib/fetch-receipt";
import { enrichReceiptWithPrices } from "@/app/onchain-receipt-generator/lib/fetch-prices";

// Simple in-memory rate limiter (resets on server restart).
// For production scale, replace with Upstash Redis or Vercel KV.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window
const RATE_LIMIT_MAX = 30; // 30 receipts per minute per IP
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: RATE_LIMIT_MAX - entry.count };
}

function getClientIp(req: NextRequest): string {
  // Vercel sets x-forwarded-for; fall back to "unknown" for local dev
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get("hash");

  if (!hash) {
    return NextResponse.json(
      { ok: false, error: "Missing 'hash' query parameter" },
      { status: 400 },
    );
  }

  // Rate limit by IP
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    const result = await fetchReceipt(hash);

    if (!result.ok) {
      // Receipt-fetching failures (not found, invalid hash) — 200 with error in body.
      // This is intentional: it's not an HTTP error, it's a business-logic outcome.
      return NextResponse.json(result, {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      });
    }

    // Enrich with USD prices — non-fatal if it fails
    const enriched = await enrichReceiptWithPrices(result.receipt);

    // Cache successful receipts aggressively — past transactions are immutable
    return NextResponse.json(
      { ok: true, receipt: enriched },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      },
    );
  } catch (err) {
    console.error("Unexpected error in /api/receipt:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkDelegation } from "@/app/eip-7702-decoder/lib/check-delegation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_CHECKS_PER_MINUTE = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { ok: false, error: "Missing 'address' query parameter" },
      { status: 400 },
    );
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, MAX_CHECKS_PER_MINUTE);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded — try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    const result = await checkDelegation(address);

    // Delegation state can change on any transaction, so we cache only briefly.
    // 30 seconds is enough to absorb a burst of the same address (share-links)
    // without going stale for a real check-then-un-delegate flow.
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch (err) {
    console.error("Unexpected error in /api/eip-7702-check:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't reach the RPC. Try again shortly." },
      { status: 500 },
    );
  }
}

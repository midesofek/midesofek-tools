import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export type RateLimitResult = { ok: boolean; remaining: number };

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(ip: string, max: number = 30): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: max - entry.count };
}

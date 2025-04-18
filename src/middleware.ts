import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (you'll get these values from Upstash dashboard)
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Rate limiter configurations
const RATE_LIMITS = {
  GLOBAL: { tokens: 60, interval: "1m" }, // 60 requests per minute
  TRADING: { tokens: 30, interval: "1m" }, // 30 requests per minute
  JUPITER: { tokens: 40, interval: "1m" }, // 40 requests per minute
} as const;

// Initialize rate limiters with Upstash Redis
const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.GLOBAL.tokens,
    RATE_LIMITS.GLOBAL.interval
  ),
  analytics: true, // Enable analytics
  prefix: "global_ratelimit",
  timeout: 1000, // Redis timeout in ms
});

const tradingLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.TRADING.tokens,
    RATE_LIMITS.TRADING.interval
  ),
  analytics: true,
  prefix: "trading_ratelimit",
  timeout: 1000,
});

const jupiterLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.JUPITER.tokens,
    RATE_LIMITS.JUPITER.interval
  ),
  analytics: true,
  prefix: "jupiter_ratelimit",
  timeout: 1000,
});

function createErrorResponse(
  status: number,
  message: string,
  resetTime: number
) {
  return new NextResponse(
    JSON.stringify({
      error: message,
      status,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "Retry-After": String(Math.ceil(resetTime / 1000)),
        "X-RateLimit-Reset": String(
          Math.ceil(Date.now() / 1000 + resetTime / 1000)
        ),
      },
    }
  );
}

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
  const path = request.nextUrl.pathname;

  try {
    let result;

    if (path.startsWith("/api/jupiter")) {
      result = await jupiterLimiter.limit(`jupiter_${ip}`);
      if (!result.success) {
        return createErrorResponse(
          429,
          "Too many Jupiter API requests",
          result.reset
        );
      }
    } else if (path.startsWith("/api/flash")) {
      result = await tradingLimiter.limit(`trading_${ip}`);
      if (!result.success) {
        return createErrorResponse(
          429,
          "Too many trading requests",
          result.reset
        );
      }
    } else if (path.startsWith("/api")) {
      result = await globalLimiter.limit(ip);
      if (!result.success) {
        return createErrorResponse(429, "Too many requests", result.reset);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return createErrorResponse(500, "Internal server error", 60);
  }
}

export const config = {
  matcher: ["/api/:path*", "/api/flash/:path*", "/api/jupiter/:path*"],
};

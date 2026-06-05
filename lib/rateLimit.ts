import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Lazily create the Redis client so missing env vars don't crash at build time
function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function createLimiter(requests: number, windowSeconds: number) {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds}s`),
    analytics: false,
  });
}

// Limits per use-case
const limiters = {
  // Login attempts: 10 per minute per IP
  login: () => createLimiter(10, 60),
  // Part requests / form submissions: 5 per minute per IP
  submission: () => createLimiter(5, 60),
  // DWS admin actions: 30 per minute per IP
  admin: () => createLimiter(30, 60),
};

export type LimiterKey = keyof typeof limiters;

export async function checkRateLimit(
  req: NextRequest,
  key: LimiterKey,
): Promise<NextResponse | null> {
  const limiter = limiters[key]();
  if (!limiter) return null; // No Redis configured — skip silently

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const { success, limit, remaining, reset } = await limiter.limit(`${key}:${ip}`);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }

  return null; // Allowed
}

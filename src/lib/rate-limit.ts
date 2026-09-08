import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Fixed-window rate limiting for unauthenticated public endpoints.
 *
 * The routes that send email (`/api/auth/request`, `/api/contact`,
 * `/api/newsletter/subscribe`) had no throttle at all, which made them an
 * email-bombing vector: each unthrottled POST spends Resend quota and, worse,
 * burns the sending domain's reputation. Cost and deliverability are the real
 * damage here, not CPU.
 *
 * Backed by the shared Redis client when REDIS_URL is set, so the window is
 * shared across serverless instances. Without Redis it degrades to a
 * per-instance in-process window — weaker under Vercel's fan-out, but still
 * stops the single-client floods that make up most abuse.
 *
 * Fails OPEN. A Redis outage must not lock legitimate users out of sign-in;
 * that trade runs the opposite way to `requireAdmin`, which fails closed
 * because there the downside is unauthorized access rather than lost logins.
 */

export interface RateLimitRule {
  /** Maximum requests permitted inside the window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfter: number };

/** In-process fallback used when Redis is absent or unreachable. */
const localWindows = new Map<string, { count: number; resetAt: number }>();

/**
 * Redis exposes INCR; the in-memory mock in lib/redis.ts does not. Feature-detect
 * rather than checking which branch that module returned, so this keeps working
 * if the mock later grows the method.
 */
function redisIncrementer(): { incr: (k: string) => Promise<number>; expire: (k: string, s: number) => Promise<unknown>; ttl: (k: string) => Promise<number> } | null {
  const client = redis as unknown as Record<string, unknown>;
  if (!client || client.isOpen !== true) return null;
  if (typeof client.incr !== 'function' || typeof client.expire !== 'function' || typeof client.ttl !== 'function') {
    return null;
  }
  return client as unknown as ReturnType<typeof redisIncrementer>;
}

function checkLocal(key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  const entry = localWindows.get(key);

  if (!entry || entry.resetAt <= now) {
    localWindows.set(key, { count: 1, resetAt: now + rule.windowSec * 1000 });
    // Opportunistic sweep so a long-lived instance doesn't accumulate windows.
    if (localWindows.size > 5000) {
      for (const [k, v] of localWindows) {
        if (v.resetAt <= now) localWindows.delete(k);
      }
    }
    return { ok: true };
  }

  entry.count += 1;
  if (entry.count > rule.limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

/**
 * Count one hit against `key` and report whether it may proceed.
 *
 * `key` should already be namespaced by caller and subject, e.g.
 * `auth-request:ip:1.2.3.4`.
 */
export async function rateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const client = redisIncrementer();

  if (!client) {
    return checkLocal(key, rule);
  }

  try {
    const namespaced = `ratelimit:${key}`;
    const count = await client.incr(namespaced);

    // First hit in a fresh window: attach the expiry. Without this the key would
    // persist forever and permanently lock the subject out.
    if (count === 1) {
      await client.expire(namespaced, rule.windowSec);
    }

    if (count > rule.limit) {
      const ttl = await client.ttl(namespaced);
      return { ok: false, retryAfter: ttl > 0 ? ttl : rule.windowSec };
    }

    return { ok: true };
  } catch (error) {
    console.warn('Rate limit check failed, allowing request:', error);
    return { ok: true };
  }
}

/**
 * Best-effort client IP. Vercel populates `x-forwarded-for`; the leftmost entry
 * is the original client. Falls back to a constant so a missing header collapses
 * callers into one shared bucket rather than silently disabling the limit.
 */
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Standard 429 with Retry-After, so well-behaved clients back off correctly. */
export function tooManyRequests(retryAfter: number, message = 'Too many requests. Please try again shortly.'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

/**
 * Apply several rules at once (e.g. per-IP and per-email) and surface the first
 * breach. Rules are evaluated in order, so put the narrower subject first for
 * the more accurate Retry-After.
 */
export async function rateLimitAll(
  checks: Array<{ key: string; rule: RateLimitRule }>
): Promise<RateLimitResult> {
  for (const { key, rule } of checks) {
    const result = await rateLimit(key, rule);
    if (!result.ok) return result;
  }
  return { ok: true };
}

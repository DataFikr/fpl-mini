import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

/**
 * Interim admin guard for sensitive routes that expose subscriber PII or can
 * trigger email sends (e.g. /api/admin/emails, /api/newsletter/*).
 *
 * This is the stop-gap protection until the magic-link auth workstream lands a
 * session-based admin allowlist. It checks a shared secret supplied via one of:
 *   - `Authorization: Bearer <key>` header
 *   - `x-admin-key: <key>` header
 *   - `?key=<key>` query param (convenience for the admin dashboard fetch)
 *
 * The expected secret is `ADMIN_KEY`, falling back to the existing `CRON_SECRET`
 * so production (which already sets CRON_SECRET) is protected immediately.
 * Fails CLOSED: if neither env var is set, access is denied.
 *
 * Usage inside a route handler:
 *   const denied = requireAdmin(request);
 *   if (denied) return denied;
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_KEY || process.env.CRON_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: 'Admin access is not configured. Set the ADMIN_KEY environment variable.' },
      { status: 503 }
    );
  }

  const provided = extractKey(request);

  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

function extractKey(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }

  const headerKey = request.headers.get('x-admin-key');
  if (headerKey) {
    return headerKey.trim();
  }

  const queryKey = new URL(request.url).searchParams.get('key');
  if (queryKey) {
    return queryKey.trim();
  }

  return null;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

import { NextRequest, NextResponse } from 'next/server';
import {
  consumeLoginToken,
  getOrCreateUser,
  createSession,
  sessionCookieOptions,
  SESSION_COOKIE,
} from '@/lib/auth';

/**
 * GET /api/auth/verify?token=...
 * Consumes a magic-link token, creates the user + session, sets the session
 * cookie, and redirects into the app. Invalid/expired tokens redirect to the
 * login page with an error flag.
 */
export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const token = params.get('token') || '';
  const next = params.get('next') || '';

  const email = await consumeLoginToken(token);
  if (!email) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid', request.url));
  }

  const user = await getOrCreateUser(email);
  const { raw, expiresAt } = await createSession(user.id);

  // Only honour a same-site relative destination.
  const dest = /^\/(?!\/)/.test(next) ? next : '/app';
  const res = NextResponse.redirect(new URL(dest, request.url));
  res.cookies.set(SESSION_COOKIE, raw, sessionCookieOptions(expiresAt));
  return res;
}

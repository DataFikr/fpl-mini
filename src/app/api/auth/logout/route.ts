import { NextRequest, NextResponse } from 'next/server';
import { destroySession, SESSION_COOKIE } from '@/lib/auth';

/**
 * Logs out: revokes the session row and clears the cookie. Supports GET (for a
 * plain link) and POST (for a fetch); both redirect home.
 */
async function handle(request: NextRequest) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  await destroySession(raw);

  const res = NextResponse.redirect(new URL('/', request.url));
  res.cookies.set(SESSION_COOKIE, '', { path: '/', expires: new Date(0) });
  return res;
}

export const GET = handle;
export const POST = handle;

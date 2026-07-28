// Server-only module: uses node `crypto`, Prisma, and next/headers cookies.
// (Do not import from Client Components.)
import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/database';
import type { User } from '@prisma/client';
import { isFreeLaunchWindow } from '@/lib/premium';

/**
 * Hand-rolled magic-link (passwordless) auth — workstream A.
 *
 * Flow: request → email a single-use signed token → verify consumes it and
 * mints a DB-backed session cookie. We store only SHA-256 hashes of the raw
 * secrets, never the secrets themselves. Sessions are DB-backed (not stateless
 * JWTs) so premium-flag changes and revocation take effect immediately.
 *
 * Server-only: uses node `crypto`, Prisma, and next/headers cookies.
 */

export const SESSION_COOKIE = 'fpl_session';
const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function newRawToken(): string {
  // base64url is URL-safe (A–Z a–z 0–9 - _), so it needs no extra encoding.
  return randomBytes(32).toString('base64url');
}

export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(normalizeEmail(email));
}

/** Create a single-use login token and return the RAW value for the email link. */
export async function createLoginToken(email: string): Promise<string> {
  const raw = newRawToken();
  await prisma.loginToken.create({
    data: {
      tokenHash: hashToken(raw),
      email: normalizeEmail(email),
      expiresAt: new Date(Date.now() + LOGIN_TOKEN_TTL_MS),
    },
  });
  return raw;
}

/** Verify + consume a login token. Returns the associated email, or null if invalid/expired/used. */
export async function consumeLoginToken(raw: string): Promise<string | null> {
  if (!raw) return null;
  const token = await prisma.loginToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!token || token.consumedAt || token.expiresAt < new Date()) return null;

  // Mark consumed atomically-ish; if already consumed by a race, bail.
  const consumed = await prisma.loginToken.updateMany({
    where: { id: token.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (consumed.count === 0) return null;

  return token.email;
}

export async function getOrCreateUser(email: string): Promise<User> {
  const normalized = normalizeEmail(email);
  return prisma.user.upsert({
    where: { email: normalized },
    update: {},
    create: { email: normalized },
  });
}

/** Create a DB-backed session; returns the raw cookie value + its expiry. */
export async function createSession(userId: string): Promise<{ raw: string; expiresAt: Date }> {
  const raw = newRawToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { tokenHash: hashToken(raw), userId, expiresAt } });
  return { raw, expiresAt };
}

/** Resolve the current session's user from the request cookie, or null. */
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export async function destroySession(raw: string | undefined): Promise<void> {
  if (!raw) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(raw) } });
}

/** Cookie options for the session cookie — httpOnly, secure in prod, 30-day. */
export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
}

/** True if the user currently holds active premium (flag + not-expired). */
export function hasActivePremium(user: Pick<User, 'isPremium' | 'premiumUntil'> | null): boolean {
  // Launch hold: premium is free for everyone through GW5 while we validate the
  // live API + retune the model. Unlocks all gates without a paid entitlement.
  if (isFreeLaunchWindow()) return true;
  if (!user || !user.isPremium) return false;
  return !user.premiumUntil || user.premiumUntil > new Date();
}

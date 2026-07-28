/**
 * Signed newsletter confirmation tokens (double opt-in, workstream E / I5).
 * HMAC over `email:leagueId` so a verify link can't be forged. Reuses the
 * existing CRON_SECRET/ADMIN_KEY secret; no DB token table needed.
 */
import { createHmac, timingSafeEqual } from 'crypto';

const secret = () => process.env.NEWSLETTER_SECRET || process.env.CRON_SECRET || process.env.ADMIN_KEY || 'dev-newsletter-secret';

const b64url = (s: string) => Buffer.from(s).toString('base64url');
const unb64url = (s: string) => Buffer.from(s, 'base64url').toString('utf8');

export function signSubToken(email: string, leagueId: number): string {
  const payload = `${email.toLowerCase()}:${leagueId}`;
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${b64url(payload)}.${sig}`;
}

export function verifySubToken(token: string): { email: string; leagueId: number } | null {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const payload = unb64url(body);
    const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const [email, leagueId] = payload.split(':');
    if (!email || !leagueId) return null;
    return { email, leagueId: parseInt(leagueId, 10) };
  } catch {
    return null;
  }
}

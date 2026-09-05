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

/**
 * Team-scoped variant, for squad deadline reminders (DeadlineSubscription).
 *
 * The payload is prefixed `t:` so a league token and a team token can never be
 * swapped: without it, `signSubToken(email, 123)` and a team id of 123 would
 * produce identical signatures and one unsubscribe link would silently cancel
 * the wrong subscription.
 */
export function signTeamToken(email: string, fplTeamId: number): string {
  const payload = `t:${email.toLowerCase()}:${fplTeamId}`;
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${b64url(payload)}.${sig}`;
}

export function verifyTeamToken(token: string): { email: string; fplTeamId: number } | null {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const payload = unb64url(body);
    if (!payload.startsWith('t:')) return null;
    const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const [, email, teamId] = payload.split(':');
    if (!email || !teamId) return null;
    return { email, fplTeamId: parseInt(teamId, 10) };
  } catch {
    return null;
  }
}

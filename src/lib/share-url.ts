/**
 * UTM tagging for every link the app hands to a user to share.
 *
 * The Sep 2026 diagnostic found `ShareLeagueButton` built its URL as
 * `${origin}/app/league/${id}?teamId=…` with no UTM parameters at all, so every
 * WhatsApp, X, email and copied link arrived as **Direct**. Direct was 45% of new
 * users — read at the time as "attribution loss, not brand" — and the one viral
 * mechanic that demonstrably works (9 shares per 275 sessions) was invisible.
 *
 * `method` is already tracked on the `share_league` event, so tagging it here
 * lets the GA4 acquisition report and the event report be reconciled: which
 * channel people *share* to, versus which one actually sends traffic back.
 */

export type ShareMethod = 'native' | 'copy' | 'whatsapp' | 'x' | 'email' | 'download' | 'unknown';

/** GA4 reads `utm_source`/`utm_medium`/`utm_campaign` off the landing URL. */
export function withShareUtm(
  url: string,
  method: ShareMethod,
  campaign = 'league_share',
): string {
  try {
    // Relative inputs need a base to parse; the origin is stripped back off below
    // if the caller passed a relative path.
    const isAbsolute = /^https?:\/\//i.test(url);
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://fplranker.com';
    const u = new URL(url, base);

    u.searchParams.set('utm_source', 'share');
    // The medium is the app the link was sent through, which is the question
    // "where does our word-of-mouth actually live" is asking.
    u.searchParams.set('utm_medium', method);
    u.searchParams.set('utm_campaign', campaign);

    return isAbsolute ? u.toString() : `${u.pathname}${u.search}`;
  } catch {
    // A malformed URL must never block a share.
    return url;
  }
}

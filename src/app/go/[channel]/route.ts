import { NextRequest, NextResponse } from 'next/server';

/**
 * Tagged landing links for off-site channels — /go/tiktok, /go/youtube.
 *
 * GA4 attributes a visit from the UTM parameters on the landing URL. TikTok and
 * YouTube open links in an in-app browser that strips the referrer, so an
 * untagged bio link (`fplranker.com`) is indistinguishable from someone typing
 * the address and lands in "(direct) / (none)". August 2026 is the proof: 852
 * video views across the two platforms produced zero attributable sessions,
 * because no video link carried a tag.
 *
 * These exist rather than raw UTM strings so the bio link stays short and the
 * destination can change without editing a profile on two platforms.
 *
 *   /go/tiktok                              → /app         · campaign "bio"
 *   /go/tiktok?c=teamid                     → /app         · campaign "teamid"
 *   /go/youtube?to=/app/find-team-id&c=teamid
 *
 * Temporary (307), not permanent: a browser must not cache a bio link to the
 * destination it happened to have during one campaign.
 */

const CHANNELS: Record<string, { source: string; medium: string }> = {
  tiktok: { source: 'tiktok', medium: 'social' },
  youtube: { source: 'youtube', medium: 'social' },
  instagram: { source: 'instagram', medium: 'social' },
  x: { source: 'x', medium: 'social' },
  reddit: { source: 'reddit', medium: 'social' },
};

/** Default landing page — the app shell, where a team ID can be entered. */
const DEFAULT_DEST = '/app';

/** Campaign when a link carries no `?c=` — i.e. the profile bio link itself. */
const DEFAULT_CAMPAIGN = 'bio';

/**
 * Only same-site absolute paths. `//evil.com` is a protocol-relative URL that
 * would otherwise redirect off-site, so the second character is checked too.
 */
function safeDest(raw: string | null): string {
  if (!raw || !/^\/(?!\/)/.test(raw)) return DEFAULT_DEST;
  return raw;
}

/** Campaign/content values end up in reports — keep them boring and readable. */
function safeTag(raw: string | null, fallback = ''): string {
  if (!raw) return fallback;
  const v = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  return v || fallback;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
) {
  const { channel } = await params;
  const key = (channel || '').toLowerCase();
  const cfg = CHANNELS[key];

  const url = new URL(request.url);
  const dest = safeDest(url.searchParams.get('to'));
  const campaign = safeTag(url.searchParams.get('c'), DEFAULT_CAMPAIGN);
  const content = safeTag(url.searchParams.get('v'));

  const target = new URL(dest, url.origin);
  // An unknown channel still redirects rather than 404s — a mistyped bio link
  // should land the visitor on the app, just without inventing attribution.
  if (cfg) {
    target.searchParams.set('utm_source', cfg.source);
    target.searchParams.set('utm_medium', cfg.medium);
    target.searchParams.set('utm_campaign', campaign);
    if (content) target.searchParams.set('utm_content', content);
  }

  const res = NextResponse.redirect(target, 307);
  // These are entry points for humans, never destinations for a crawler.
  res.headers.set('x-robots-tag', 'noindex, nofollow');
  return res;
}

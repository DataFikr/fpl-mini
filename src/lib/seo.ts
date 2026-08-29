/**
 * Single source of truth for the site's canonical identity.
 *
 * The repo historically hard-coded three different hosts (fplranker.com,
 * fpl-mini.vercel.app, fpl-league-hub.vercel.app), which split SEO/LLM entity
 * signals. Everything SEO-facing — canonical tags, sitemap, robots, JSON-LD,
 * OG — must derive from these constants. Never hard-code a *.vercel.app host.
 */
export const SITE_URL = 'https://fplranker.com';
export const SITE_NAME = 'FPL Ranker';
export const SITE_TAGLINE = 'Fantasy Premier League Mini-League Analytics';

/** Absolute URL for a path on the canonical domain (e.g. absUrl('/blog') ). */
export const absUrl = (path = '/'): string => new URL(path, SITE_URL).toString();

/** Canonical YouTube channel. Also the source of the landing page's Shorts band. */
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@fplranker';

/** Canonical TikTok profile — the larger of the two video channels by reach. */
export const TIKTOK_CHANNEL_URL = 'https://www.tiktok.com/@fplranker';

/** Official social profiles — used for Organization `sameAs`. */
export const SOCIAL_LINKS = [
  'https://x.com/fplranker',
  'https://www.reddit.com/user/fplranker/',
  'https://instagram.com/FPLRanker',
  YOUTUBE_CHANNEL_URL,
  TIKTOK_CHANNEL_URL,
];

/**
 * The tagged link to put in a channel's profile bio, so GA4 can attribute the
 * visit. Untagged links from TikTok/YouTube in-app browsers arrive as direct
 * traffic — see src/app/go/[channel]/route.ts.
 */
export const bioLink = (channel: 'tiktok' | 'youtube' | 'instagram' | 'x' | 'reddit'): string =>
  absUrl(`/go/${channel}`);

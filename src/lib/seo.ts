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

/** Official social profiles — used for Organization `sameAs`. */
export const SOCIAL_LINKS = [
  'https://x.com/fplranker',
  'https://www.reddit.com/user/fplranker/',
  'https://instagram.com/FPLRanker',
];

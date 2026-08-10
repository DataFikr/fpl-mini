/**
 * Single source of truth for the blog index, sorted newest-first.
 *
 * Every post is now a data-driven registry entry (src/content/blog-posts.ts)
 * rendered in the app theme. The three bespoke hand-built routes
 * (world-cup-fatigue, fdr-tools, beyond-the-points) were migrated into the
 * registry on 2026-08-09 with their original publish dates intact, so this no
 * longer needs a separate legacy list.
 */
import { getAllPosts } from './blog-posts';

export interface BlogIndexTile {
  /** Canonical path. Identical to `appHref` — /blog now redirects into /app/blog. */
  href: string;
  /** App-themed reader path: /app/blog/<slug>. */
  appHref: string;
  /** Bare slug. */
  slug: string;
  /** Always true — every post is a registry post rendered via AppArticle. */
  registry: boolean;
  title: string;
  excerpt: string;
  /** Human display date, e.g. "26 July 2026". */
  date: string;
  /** ISO date for sorting. */
  dateISO: string;
  category: string;
  image: string | null;
  imageAlt: string;
}

/**
 * Formats a `YYYY-MM-DD` publish date for display.
 *
 * Must format in UTC. `new Date('2026-07-26')` is parsed as UTC midnight, so
 * formatting it in a negative-offset local zone renders the previous day — a
 * post published on the 26th displayed as the 25th for every US visitor.
 */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

/** Newest-first blog index for every blog surface. */
export function getBlogIndex(): BlogIndexTile[] {
  return getAllPosts()
    .map((p) => ({
      href: `/app/blog/${p.slug}`,
      appHref: `/app/blog/${p.slug}`,
      slug: p.slug,
      registry: true,
      title: p.title,
      excerpt: p.summary,
      date: formatPostDate(p.date),
      dateISO: p.date,
      category: p.category,
      image: p.coverImage ?? null,
      imageAlt: p.coverAlt ?? p.title,
    }))
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}

/**
 * Single source of truth for the blog index — used by BOTH the public `/blog`
 * page and the in-app `/app/blog` tab so the two surfaces can never drift.
 *
 * It composes the data-driven registry posts (src/content/blog-posts.ts) with
 * the bespoke long-form posts that keep their own hand-built routes, then sorts
 * newest-first. World Cup Fatigue is historical now, so it falls to the bottom.
 */
import { getAllPosts } from './blog-posts';

export interface BlogIndexTile {
  /** Public/canonical path (registry → /blog/<slug>; legacy → its own route). Used by the marketing /blog. */
  href: string;
  /** In-app path (registry → app-themed reader /app/blog/<slug>; legacy → its bespoke public page). */
  appHref: string;
  /** Bare slug (registry posts only; empty for legacy). */
  slug: string;
  /** True for data-driven registry posts (rendered in-app via AppArticle). */
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

// Bespoke long-form posts with their own hand-built routes.
const LEGACY: Omit<BlogIndexTile, 'appHref' | 'slug' | 'registry'>[] = [
  {
    href: '/blog/world-cup-fatigue',
    title: 'World Cup Fatigue Watch: Which FPL Stars Risk a Slow Start to 2026/27',
    excerpt:
      'The 2026 World Cup is over — Spain are champions and the Premier League contingent is back. Here is how each premium asset’s tournament run reshapes their Gameweek 1 fatigue risk in your mini-league.',
    date: 'June 2, 2026',
    dateISO: '2026-06-02',
    category: 'Analysis',
    image: '/images/blog/world_cup.jpg',
    imageAlt: 'World Cup Fatigue Watch',
  },
  {
    href: '/blog/fdr-tools',
    title: 'Master Your Long-Term Planning: Top 5 FPL Fixture Difficulty (FDR) Tools',
    excerpt:
      'While the official FPL site provides a basic 1-5 difficulty scale, top-tier managers know the official ratings often lag behind. Here are five FDR tools that sharpen your fixture planning.',
    date: 'February 17, 2026',
    dateISO: '2026-02-17',
    category: 'Analysis',
    image: '/images/blog/feature_3_fixture_fdr.png',
    imageAlt: 'FPL Fixture Difficulty Rating Tools',
  },
  {
    href: '/blog/beyond-the-points',
    title: 'Beyond the Points: How FPLRanker Turns Your Mini-League into a Premier League Experience',
    excerpt:
      'Fantasy Premier League is 10% picking players and 90% bragging to your friends. Here is how FPLRanker keeps your mini-league group chat alive all season.',
    date: 'January 5, 2026',
    dateISO: '2026-01-05',
    category: 'News',
    image: '/images/blog/fplranker_news_highlight.png',
    imageAlt: 'FPLRanker Mini-League Experience',
  },
];

/** Composed, newest-first blog index for both blog surfaces. */
export function getBlogIndex(): BlogIndexTile[] {
  const registry: BlogIndexTile[] = getAllPosts().map((p) => ({
    href: `/blog/${p.slug}`,
    appHref: `/app/blog/${p.slug}`,
    slug: p.slug,
    registry: true,
    title: p.title,
    excerpt: p.summary,
    date: new Date(p.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    dateISO: p.date,
    category: p.category,
    image: p.coverImage ?? null,
    imageAlt: p.coverAlt ?? p.title,
  }));
  const legacy: BlogIndexTile[] = LEGACY.map((l) => ({
    ...l,
    appHref: l.href, // bespoke posts keep their own themed public pages
    slug: '',
    registry: false,
  }));
  return [...legacy, ...registry].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}

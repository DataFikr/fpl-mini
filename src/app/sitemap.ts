import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getAllPosts } from '@/content/blog-posts';
import { getTopPlayerSlugs } from '@/lib/players';
import { FPLApiService } from '@/services/fpl-api';

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entry = (path: string, changeFrequency: ChangeFreq, priority: number) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  const core: MetadataRoute.Sitemap = [
    entry('/', 'daily', 1),
    entry('/app', 'daily', 0.9),
    entry('/predictions', 'daily', 0.85),
    entry('/players', 'daily', 0.8),
    entry('/premium', 'monthly', 0.7),
    entry('/master-the-league', 'monthly', 0.8),
    entry('/app/blog', 'weekly', 0.7),
    entry('/app/find-team-id', 'monthly', 0.6),
    entry('/app/faq', 'monthly', 0.6),
    entry('/about', 'monthly', 0.5),
    entry('/contact', 'monthly', 0.4),
    entry('/privacy', 'yearly', 0.3),
  ];

  // Every post is a registry post rendered at /app/blog/<slug>. The three former
  // bespoke routes were migrated into the registry on 2026-08-09, and /blog/*
  // now 308-redirects here — so only the canonical /app URLs belong in the map.
  const registryPosts = getAllPosts().map((p) => entry(`/app/blog/${p.slug}`, 'weekly', 0.7));

  // Programmatic SEO surface (I5): player pages + the upcoming gameweek captaincy page.
  let players: MetadataRoute.Sitemap = [];
  let gameweeks: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getTopPlayerSlugs(200);
    players = slugs.map((s) => entry(`/players/${s}`, 'daily', 0.6));
    const gw = await new FPLApiService().getCurrentGameweek().catch(() => 1);
    const next = Math.min(38, gw + 1);
    gameweeks = [...new Set([gw, next])].map((g) => entry(`/gameweek/${g}/captaincy`, 'daily', 0.7));
  } catch { /* API unavailable at build — core sitemap still emits */ }

  return [...core, ...registryPosts, ...gameweeks, ...players];
}

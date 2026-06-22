import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { BLOG } from '@/app/app/_lib/screen-data';

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

export default function sitemap(): MetadataRoute.Sitemap {
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
    entry('/master-the-league', 'monthly', 0.8),
    entry('/blog', 'weekly', 0.7),
    entry('/find-team-id', 'monthly', 0.6),
    entry('/app/faq', 'monthly', 0.6),
    entry('/about', 'monthly', 0.5),
    entry('/contact', 'monthly', 0.4),
    entry('/privacy', 'yearly', 0.3),
  ];

  // Public long-form blog posts (static routes under /blog).
  const publicPosts = ['/blog/world-cup-fatigue', '/blog/fdr-tools', '/blog/beyond-the-points']
    .map((p) => entry(p, 'monthly', 0.7));

  // App blog articles — sourced from the data so new posts auto-appear.
  const appPosts = BLOG.map((a) => entry(`/app/blog/${a.id}`, 'monthly', 0.6));

  return [...core, ...publicPosts, ...appPosts];
}

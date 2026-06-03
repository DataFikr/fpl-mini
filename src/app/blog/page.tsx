import { Metadata } from 'next';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - FPL Tips and Content | FPLRanker',
  description:
    'FPLRanker blog with FPL tips, fixture analysis, mini-league strategies, and Fantasy Premier League content.',
};

const blogPosts = [
  {
    slug: '/blog/world-cup-fatigue',
    title: 'World Cup Fatigue Watch: Which FPL Stars Risk a Slow Start to 2026/27',
    excerpt:
      'A summer World Cup across the USA, Canada and Mexico means heat, travel and a brutally short pre-season. Here are the nine premium assets carrying the most burnout risk into Gameweek 1 — and how to play it in your mini-league...',
    date: 'June 2, 2026',
    image: null, // uses designed cover
    imageAlt: 'World Cup Fatigue Watch',
    isLatest: true,
  },
  {
    slug: '/blog/fdr-tools',
    title: 'Master Your Long-Term Planning: Top 5 FPL Fixture Difficulty (FDR) Tools',
    excerpt:
      'In the world of Fantasy Premier League, information is power, but visualization is king. While the official FPL site provides a basic 1-5 difficulty scale, top-tier managers know that the official ratings often lag behind...',
    date: 'February 17, 2026',
    image: '/images/blog/feature_3_fixture_fdr.png',
    imageAlt: 'FPL Fixture Difficulty Rating Tools',
    isLatest: false,
  },
  {
    slug: '/blog/beyond-the-points',
    title: 'Beyond the Points: How FPLRanker Turns Your Mini-League into a Premier League Experience',
    excerpt:
      "Let's be honest: Fantasy Premier League is 10% picking players and 90% bragging to your friends. But as the season drags on, your mini-league group chat can start to feel a bit quiet...",
    date: 'January 5, 2026',
    image: '/images/blog/fplranker_news_highlight.png',
    imageAlt: 'FPLRanker Mini-League Experience',
    isLatest: false,
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        {/* Hero */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-jakarta font-bold text-white mb-4">
              FPL Tips and <span className="text-gradient-primary">Content</span>
            </h1>
            <p className="text-lg text-fpl-text-secondary font-inter max-w-2xl mx-auto">
              Strategies, tools, and insights to help you dominate your Fantasy Premier League mini-league.
            </p>
          </div>
        </section>

        {/* Blog Tiles */}
        <main className="container mx-auto px-4 lg:px-8 pb-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={post.slug}
                className="group backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 overflow-hidden hover:border-fpl-accent/40 transition-all hover:shadow-lg flex flex-col"
              >
                {/* Image or Designed Cover */}
                <div className="relative w-full aspect-video overflow-hidden">
                  {post.isLatest ? (
                    // World Cup image cover for latest post
                    <>
                      <Image
                        src="/images/blog/world_cup.jpg"
                        alt="FIFA World Cup 2026"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                      <div className="relative h-full w-full p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fpl-accent text-fpl-dark text-[10px] font-jakarta font-extrabold uppercase tracking-wider">
                            ● Latest
                          </span>
                          <span className="text-white/70 font-jakarta text-xs font-semibold tracking-widest uppercase">
                            WC &apos;26
                          </span>
                        </div>
                        <div>
                          <div className="font-jakarta font-extrabold text-white leading-none text-2xl md:text-[1.7rem] mb-2">
                            Fatigue Watch
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-300/40 text-rose-100 text-[10px] font-jakarta font-bold uppercase">
                              High risk · 6
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400/25 border border-amber-200/40 text-amber-100 text-[10px] font-jakarta font-bold uppercase">
                              Medium · 3
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : post.image ? (
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : null}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs text-fpl-text-secondary/70 font-inter mb-2">{post.date}</div>
                  <h2 className="text-lg font-jakarta font-bold text-white mb-3 leading-snug group-hover:text-fpl-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-fpl-text-secondary font-inter leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <span className="mt-auto text-sm font-jakarta font-semibold text-fpl-accent group-hover:underline">
                    Continue Reading →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

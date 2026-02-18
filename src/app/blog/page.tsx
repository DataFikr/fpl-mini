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
    slug: '/blog/beyond-the-points',
    title: 'Beyond the Points: How FPLRanker Turns Your Mini-League into a Premier League Experience',
    excerpt:
      "Let's be honest: Fantasy Premier League is 10% picking players and 90% bragging to your friends. But as the season drags on, your mini-league group chat can start to feel a bit quiet...",
    date: 'January 5, 2026',
    image: '/images/blog/fplranker_news_highlight.png',
    imageAlt: 'FPLRanker Mini-League Experience',
  },
  {
    slug: '/blog/fdr-tools',
    title: 'Master Your Long-Term Planning: Top 5 FPL Fixture Difficulty (FDR) Tools',
    excerpt:
      'In the world of Fantasy Premier League, information is power, but visualization is king. While the official FPL site provides a basic 1-5 difficulty scale, top-tier managers know that the official ratings often lag behind...',
    date: 'February 17, 2026',
    image: '/images/blog/feature_3_fixture_fdr.png',
    imageAlt: 'FPL Fixture Difficulty Rating Tools',
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
        <main className="container mx-auto px-4 pb-16">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={post.slug}
                className="group backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 overflow-hidden hover:border-fpl-accent/40 transition-all hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative w-full aspect-video overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="text-xs text-fpl-text-secondary/70 font-inter mb-2">{post.date}</div>
                  <h2 className="text-lg font-jakarta font-bold text-white mb-3 leading-snug group-hover:text-fpl-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-fpl-text-secondary font-inter leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <span className="text-sm font-jakarta font-semibold text-fpl-accent group-hover:underline">
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

import { Metadata } from 'next';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogIndex } from '@/content/blog-index';

export const metadata: Metadata = {
  title: 'Blog - FPL Tips and Content | FPLRanker',
  description:
    'FPLRanker blog with FPL tips, fixture analysis, mini-league strategies, and Fantasy Premier League content.',
  alternates: { canonical: '/blog' },
};

// Newest first — the fresh 2026/27 posts lead; World Cup fatigue falls to the bottom as the oldest.
const blogPosts = getBlogIndex();

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
                key={post.href}
                href={post.href}
                className="group backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 overflow-hidden hover:border-fpl-accent/40 transition-all hover:shadow-lg flex flex-col"
              >
                {/* Image or category placeholder */}
                <div className="relative w-full aspect-video overflow-hidden">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-fpl-primary/30 via-fpl-dark to-fpl-dark flex items-center justify-center p-5">
                      {post.category && (
                        <span className="px-3 py-1 rounded-full bg-fpl-accent/15 text-fpl-accent text-[11px] font-jakarta font-extrabold uppercase tracking-wider">
                          {post.category}
                        </span>
                      )}
                    </div>
                  )}
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

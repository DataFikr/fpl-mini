import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { AffiliateLink } from '@/components/ui/affiliate-link';
import { LineupPitch } from '@/components/blog/lineup-pitch';
import { getKitbagUrlByShort } from '@/utils/kitbag-urls';
import { absUrl } from '@/lib/seo';
import { getAllPosts, getPost } from '@/content/blog-posts';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post not found — FPL Ranker' };

  const path = `/blog/${post.slug}`;
  return {
    title: `${post.title} | FPLRanker`,
    description: post.description,
    alternates: { canonical: path },
    openGraph: {
      title: post.title,
      description: post.description,
      url: absUrl(path),
      type: 'article',
      ...(post.coverImage ? { images: [{ url: absUrl(post.coverImage) }] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const published = new Date(post.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        <article className="container mx-auto px-4 lg:px-8 py-12 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="text-xs text-fpl-text-secondary/70 font-inter mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-fpl-accent">Home</Link>
            <span className="mx-1.5">›</span>
            <Link href="/blog" className="hover:text-fpl-accent">Blog</Link>
            <span className="mx-1.5">›</span>
            <span className="text-fpl-text-secondary">{post.category}</span>
          </nav>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-fpl-accent/15 text-fpl-accent text-[10px] font-jakarta font-extrabold uppercase tracking-wider">
                {post.category}
              </span>
              <time dateTime={post.date} className="text-xs text-fpl-text-secondary/70 font-inter">
                {published}
              </time>
            </div>
            <h1 className="text-3xl md:text-4xl font-jakarta font-bold text-white leading-tight">
              {post.title}
            </h1>
          </header>

          {post.coverImage && (
            <div className="relative w-full aspect-video rounded-fpl overflow-hidden mb-8">
              <Image
                src={post.coverImage}
                alt={post.coverAlt ?? post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          {/* AI-extraction summary — first content under H1 */}
          <p className="text-lg text-fpl-text-secondary font-inter leading-relaxed mb-10">
            {post.summary}
          </p>

          {post.sections.map((section, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-xl md:text-2xl font-jakarta font-bold text-white mb-3">
                {section.heading}
              </h2>
              {section.body.map((para, j) => (
                <p key={j} className="text-base text-fpl-text-secondary font-inter leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </section>
          ))}

          {/* Ranked lists (e.g. Top 5 tools) with outbound links */}
          {post.lists && post.lists.length > 0 && (
            <>
              {post.lists.map((list, li) => (
                <section key={li} className="mb-10">
                  <h2 className="text-xl md:text-2xl font-jakarta font-bold text-white mb-3">
                    {list.heading}
                  </h2>
                  {list.intro && (
                    <p className="text-base text-fpl-text-secondary font-inter leading-relaxed mb-4">
                      {list.intro}
                    </p>
                  )}
                  <ol className="space-y-3">
                    {list.items.map((item, ii) => (
                      <li
                        key={ii}
                        className="flex gap-3 p-4 rounded-fpl bg-fpl-dark/40 border border-fpl-primary/15"
                      >
                        {list.ordered !== false && (
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-fpl-accent/15 text-fpl-accent font-jakarta font-extrabold text-sm flex items-center justify-center">
                            {ii + 1}
                          </span>
                        )}
                        <div className="min-w-0">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener"
                              className="font-jakarta font-bold text-white hover:text-fpl-accent"
                            >
                              {item.name} ↗
                            </a>
                          ) : (
                            <span className="font-jakarta font-bold text-white">{item.name}</span>
                          )}
                          <p className="text-sm text-fpl-text-secondary font-inter leading-relaxed mt-1">
                            {item.blurb}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </>
          )}

          {/* Suggested line-ups rendered on a pitch */}
          {post.lineups && post.lineups.length > 0 && (
            <section className="mb-10">
              {post.lineups.map((lineup, i) => (
                <LineupPitch key={i} lineup={lineup} />
              ))}
            </section>
          )}

          {/* Contextual Kitbag CTA(s) */}
          {post.kitTeams && post.kitTeams.length > 0 && (
            <div className="rounded-fpl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 p-5 my-10">
              <div className="text-sm font-jakarta font-bold text-white mb-3">
                Back your club — shop the official 2026/27 kit
              </div>
              <div className="flex flex-wrap gap-2">
                {post.kitTeams.map((team) => (
                  <AffiliateLink
                    key={team}
                    href={getKitbagUrlByShort(team)}
                    placement={`blog-${post.slug}`}
                    item={team}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white text-sm font-jakarta font-bold transition-colors"
                  >
                    Shop {team} on Kitbag
                  </AffiliateLink>
                ))}
              </div>
              <div className="text-[9px] text-gray-500 font-inter mt-2">
                Affiliate links · a commission is earned on purchases.
              </div>
            </div>
          )}

          {/* FAQ — native <details> keeps answers in the DOM for answer engines */}
          {post.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl md:text-2xl font-jakarta font-bold text-white mb-4">
                Frequently asked questions
              </h2>
              <div className="rounded-fpl border border-fpl-primary/20 divide-y divide-fpl-primary/10 overflow-hidden">
                {post.faq.map((item, i) => (
                  <details key={i} className="group bg-fpl-dark/40">
                    <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 text-white font-jakarta font-semibold text-sm">
                      {item.question}
                      <span className="text-fpl-accent ml-3 transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-fpl-text-secondary font-inter leading-relaxed">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Internal links */}
          <div className="mt-12 pt-6 border-t border-fpl-primary/15">
            <div className="text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase tracking-wider mb-3">
              Keep reading
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-jakarta font-semibold">
              <Link href="/app" className="text-fpl-accent hover:underline">Rank my team →</Link>
              <Link href="/blog" className="text-fpl-accent hover:underline">All FPL articles →</Link>
              <Link href="/blog/world-cup-fatigue" className="text-fpl-accent hover:underline">World Cup fatigue watch →</Link>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}

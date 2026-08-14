import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '../../_components/AppShell';
import { AppArticle } from '../../_components/AppArticle';
import { getPost, getAllPosts } from '@/content/blog-posts';
import { SITE_URL, absUrl } from '@/lib/seo';
import {
  StructuredData,
  ArticleStructuredData,
  FaqStructuredData,
  BreadcrumbStructuredData,
} from '@/components/seo/structured-data';

export const revalidate = 21600;

/** Posts are a static registry, so prerender them all. */
export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = getPost(id);
  if (!post) return { title: 'Blog — FPL Ranker' };
  const path = `/app/blog/${post.slug}`;
  return {
    title: `${post.title} — FPL Ranker`,
    description: post.description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${SITE_URL}${path}`,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      ...(post.coverImage ? { images: [{ url: absUrl(post.coverImage) }] } : {}),
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(id);
  // Every post is a registry post now. Sending unknown slugs to /blog/<id> would
  // bounce straight back here (that path redirects into /app/blog), so 404.
  if (!post) notFound();

  const path = `/app/blog/${post.slug}`;

  return (
    <>
      {/* Emitted here rather than in a layout: the old /blog/[slug]/layout.tsx
          carried this and was deleted in the migration to the app shell, which
          silently stripped BlogPosting/FAQPage schema from every post. */}
      <ArticleStructuredData
        title={post.title}
        description={post.description}
        path={path}
        datePublished={post.date}
        dateModified={post.updated ?? post.date}
        image={post.coverImage}
      />
      {post.faq.length > 0 && (
        <FaqStructuredData items={post.faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      )}
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', path: '/app' },
          { name: 'Blog', path: '/app/blog' },
          { name: post.title, path },
        ]}
      />
      {post.mentions && post.mentions.length > 0 && (
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': `${absUrl(path)}#mentions`,
            mainEntityOfPage: absUrl(path),
            mentions: post.mentions.map((m) => ({ '@type': 'Thing', name: m.name, sameAs: m.sameAs })),
          }}
        />
      )}

      <AppShell title="Blog" backHref="/app/blog"><AppArticle slug={id} /></AppShell>
    </>
  );
}

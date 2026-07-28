import { absUrl } from '@/lib/seo';
import {
  StructuredData,
  ArticleStructuredData,
  FaqStructuredData,
  BreadcrumbStructuredData,
} from '@/components/seo/structured-data';
import { getPost } from '@/content/blog-posts';

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const path = `/blog/${slug}`;

  return (
    <>
      {post && (
        <>
          <ArticleStructuredData
            title={post.title}
            description={post.description}
            path={path}
            datePublished={post.date}
            dateModified={post.updated ?? post.date}
            image={post.coverImage}
          />
          {post.faq.length > 0 && (
            <FaqStructuredData
              items={post.faq.map((f) => ({ question: f.question, answer: f.answer }))}
            />
          )}
          <BreadcrumbStructuredData
            items={[
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
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
                mentions: post.mentions.map((m) => ({
                  '@type': 'Thing',
                  name: m.name,
                  sameAs: m.sameAs,
                })),
              }}
            />
          )}
        </>
      )}
      {children}
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '../../_components/AppShell';
import { AppArticle } from '../../_components/AppArticle';
import { getPost } from '@/content/blog-posts';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = getPost(id);
  if (!post) return { title: 'Blog — FPL Ranker' };
  return { title: `${post.title} — FPL Ranker`, description: post.description };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Every post is a registry post now. Sending unknown slugs to /blog/<id> would
  // bounce straight back here (that path redirects into /app/blog), so 404.
  if (!getPost(id)) notFound();
  return <AppShell title="Blog" backHref="/app/blog"><AppArticle slug={id} /></AppShell>;
}

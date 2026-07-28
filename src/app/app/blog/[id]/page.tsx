import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
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
  // Only registry posts render in-app; unknown slugs fall back to the public blog.
  if (!getPost(id)) redirect(`/blog/${id}`);
  return <AppShell title="Blog" backHref="/app/blog"><AppArticle slug={id} /></AppShell>;
}

import type { Metadata } from 'next';
import { AppShell } from '../../_components/AppShell';
import { ArticleScreen } from '../../_components/ArticleScreen';
import { article } from '../../_lib/screen-data';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const a = article(id);
  return { title: `${a.title} — FPL Ranker`, description: a.excerpt };
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <AppShell title="Blog" backHref="/app/blog"><ArticleScreen id={id} /></AppShell>;
}

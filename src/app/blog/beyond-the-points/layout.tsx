import { Metadata } from 'next';
import { ArticleStructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = {
  title: 'Beyond the Points: Turn Your FPL Mini-League into a Premier League Experience | FPLRanker',
  description:
    'How FPLRanker turns your Fantasy Premier League mini-league into an ESPN-style experience — live headlines, rank progression, Manager of the Month and rival analytics.',
  alternates: { canonical: '/blog/beyond-the-points' },
  openGraph: {
    title: 'Beyond the Points: Turn Your FPL Mini-League into a Premier League Experience',
    description:
      'Live headlines, rank progression, Manager of the Month and rival analytics — the features that make your mini-league feel like the real thing.',
    url: 'https://fplranker.com/blog/beyond-the-points',
    type: 'article',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArticleStructuredData
        title="Beyond the Points: Turn Your FPL Mini-League into a Premier League Experience"
        description="How FPLRanker turns your FPL mini-league into an ESPN-style experience with live headlines, rank progression and rival analytics."
        path="/blog/beyond-the-points"
      />
      {children}
    </>
  );
}

import type { Metadata } from 'next';
import { AppShell } from '../_components/AppShell';
import { PlayersScreen } from '../_components/PlayersScreen';
import { getPlayersIndex } from '@/lib/players';

export const revalidate = 21600; // 6h — matches the public /players hub

/**
 * In-app player database (Players tab).
 *
 * `noindex, follow` rather than a robots Disallow: the public /players hub and
 * the 200 /players/[slug] pages are the indexed surface, and this must not
 * compete with them — but crawlers should still fetch this page so its outbound
 * links pass equity into that cluster. Deliberately absent from sitemap.ts.
 */
export const metadata: Metadata = {
  title: 'Players — FPL Ranker',
  robots: { index: false, follow: true },
};

export default async function AppPlayersPage() {
  const rows = await getPlayersIndex(200);
  return (
    <AppShell navActive="players">
      <PlayersScreen rows={rows} />
    </AppShell>
  );
}

import { AppShell } from '../../../_components/AppShell';
import { LiveLeagueScreen } from '../../../_components/LiveLeagueScreen';

export const metadata = { title: 'Live table — FPL Ranker' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const leagueId = parseInt(id, 10);

  return (
    <AppShell navActive="leagues" title="Live table" backHref={`/app/league/${id}`}>
      <LiveLeagueScreen leagueId={leagueId} />
    </AppShell>
  );
}

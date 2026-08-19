import { AppShell } from '../_components/AppShell';
import { LeaguesScreen } from '../_components/LeaguesScreen';
import { getManagerLeaguesData, type LeaguesData } from '../_lib/leagues-data';
import { isFplNotFound } from '@/services/fpl-api';
import { resolveTeamId } from '@/lib/team-id-server';

export const metadata = { title: 'My Leagues — FPL Ranker' };

export default async function Page({ searchParams }: { searchParams: { teamId?: string } }) {
  const sp = await searchParams;
  // Falls back to the visitor's remembered team when the URL carries none.
  const teamId = await resolveTeamId(sp.teamId);

  let data: LeaguesData | undefined;
  let notFound = false;

  if (teamId !== undefined) {
    try {
      data = await getManagerLeaguesData(teamId);
    } catch (e) {
      if (isFplNotFound(e)) notFound = true;
      else console.error('Failed to load manager leagues:', e);
    }
  }

  return (
    <AppShell navActive="leagues" teamId={teamId} rememberTeamId={!notFound} youName={data?.manager.team}>
      <LeaguesScreen data={data} teamId={teamId} notFound={notFound} />
    </AppShell>
  );
}

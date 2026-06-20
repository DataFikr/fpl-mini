import { AppShell } from '../_components/AppShell';
import { LeaguesScreen } from '../_components/LeaguesScreen';
import { getManagerLeaguesData, type LeaguesData } from '../_lib/leagues-data';
import { DEMO_TEAM } from '../_lib/screen-data';

export const metadata = { title: 'My Leagues — FPL Ranker' };

export default async function Page({ searchParams }: { searchParams: { teamId?: string } }) {
  const sp = await searchParams;
  const parsed = sp.teamId ? parseInt(sp.teamId) : NaN;
  const teamId = isNaN(parsed) ? DEMO_TEAM : parsed;

  let data: LeaguesData | undefined;
  try {
    data = await getManagerLeaguesData(teamId);
  } catch (e) {
    console.error('Failed to load manager leagues:', e);
  }

  return <AppShell navActive="leagues" teamId={teamId}><LeaguesScreen data={data} /></AppShell>;
}

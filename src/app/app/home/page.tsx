import { AppShell } from '../_components/AppShell';
import { HomeScreen, type HomeNotice } from '../_components/HomeScreen';
import { getHomeData, TeamNotFoundError, type HomeData } from '../_lib/home-data';
import { resolveTeamId } from '@/lib/team-id-server';

export const metadata = { title: 'Home — FPL Ranker' };

export default async function Page({ searchParams }: { searchParams: { teamId?: string } }) {
  const sp = await searchParams;
  // `?teamId=` when the visitor just entered one on the landing page, otherwise
  // the team they last loaded — Home is the post-login landing screen, so it has
  // to resolve a manager without one being in the URL.
  const teamId = await resolveTeamId(sp.teamId);

  let data: HomeData | undefined;
  let notice: HomeNotice | undefined;

  if (teamId !== undefined) {
    try {
      data = await getHomeData(teamId);
    } catch (e) {
      if (e instanceof TeamNotFoundError) notice = 'not-found';
      else { notice = 'error'; console.error('Failed to load home data:', e); }
    }
  }

  return (
    <AppShell
      navActive="home"
      teamId={teamId}
      // A mistyped id must not be remembered — it would follow the visitor
      // through every screen that falls back to the stored team.
      rememberTeamId={notice !== 'not-found'}
      youName={data?.manager.team}
      meta={data ? `${data.manager.team} · GW${data.gw} · ${data.manager.totalPoints} pts` : undefined}
    >
      <HomeScreen data={data} teamId={teamId} notice={notice} />
    </AppShell>
  );
}

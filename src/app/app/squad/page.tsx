import { AppShell } from '../_components/AppShell';
import { SquadScreen } from '../_components/SquadScreen';
import { getSquadData, SquadNotAvailableError, TeamNotFoundError, type SquadData } from '../_lib/squad-data';
import { resolveTeamId } from '@/lib/team-id-server';

export const metadata = { title: 'My Squad — FPL Ranker' };

export default async function Page({ searchParams }: { searchParams: { teamId?: string; gw?: string; leagueId?: string } }) {
  const sp = await searchParams;
  // No ?teamId= → fall back to the team this visitor last loaded, so arriving
  // from a screen that carries no id still shows their squad.
  const teamId = await resolveTeamId(sp.teamId);
  const leagueId = sp.leagueId ? parseInt(sp.leagueId) : undefined;

  let data: SquadData | undefined;
  // Why the pitch is missing, when it is: a mistyped ID and a squad that simply
  // isn't published yet are both "no data", but the user can only act on one.
  let notice: 'not-found' | 'not-published' | 'error' | undefined;
  let deadline: string | undefined;

  if (teamId !== undefined) {
    try {
      data = await getSquadData(teamId, sp.gw ? parseInt(sp.gw) : undefined);
    } catch (e) {
      if (e instanceof TeamNotFoundError) notice = 'not-found';
      else if (e instanceof SquadNotAvailableError) { notice = 'not-published'; deadline = e.deadline; }
      else { notice = 'error'; console.error('Failed to load squad data:', e); }
    }
  }

  return (
    <AppShell navActive="squad" teamId={teamId} rememberTeamId={notice !== 'not-found'} youName={data?.team.name} meta={data ? `${data.team.name} · GW${data.team.gw}` : undefined}>
      <SquadScreen data={data} leagueId={Number.isNaN(leagueId as number) ? undefined : leagueId} teamId={teamId} notice={notice} deadline={deadline} />
    </AppShell>
  );
}

import { AppShell } from '../_components/AppShell';
import { SquadScreen } from '../_components/SquadScreen';
import { getSquadData, type SquadData } from '../_lib/squad-data';
import { DEMO_TEAM } from '../_lib/screen-data';

export const metadata = { title: 'My Squad — FPL Ranker' };

export default async function Page({ searchParams }: { searchParams: { teamId?: string; gw?: string } }) {
  const sp = await searchParams;
  // Default to a real demo team so the pitch loads straight away (no ID prompt).
  const parsed = sp.teamId ? parseInt(sp.teamId) : NaN;
  const teamId = isNaN(parsed) ? DEMO_TEAM : parsed;

  let data: SquadData | undefined;
  try {
    data = await getSquadData(teamId, sp.gw ? parseInt(sp.gw) : undefined);
  } catch (e) {
    console.error('Failed to load squad data:', e);
  }

  return <AppShell navActive="squad" teamId={teamId}><SquadScreen data={data} /></AppShell>;
}

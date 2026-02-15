import { NextRequest, NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

const fplApi = new FPLApiService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.id);

    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // Fetch bootstrap (for phases) and manager entry (for leagues) in parallel
    const [bootstrap, managerEntry] = await Promise.all([
      fplApi.getBootstrapData(),
      fplApi.getManagerEntry(teamId),
    ]);

    // Extract phases (skip phase 1 which is "Overall")
    const phases = (bootstrap as any).phases || [];
    const monthlyPhases = phases.filter((p: any) => p.id > 1);

    // Determine current gameweek to filter out future phases
    const currentGW = bootstrap.events.find((e: any) => e.is_current)?.id || 1;
    const activePhases = monthlyPhases.filter((p: any) => p.start_event <= currentGW);

    // Get classic leagues for this manager
    const leagues = managerEntry?.leagues?.classic
      ?.filter((l: any) => l && l.id > 1000)
      ?.slice(0, 5) // Limit to 5 leagues to avoid too many API calls
      || [];

    if (leagues.length === 0) {
      return NextResponse.json({ phases: [], leagueLeaderboards: [] });
    }

    // For each league, fetch standings for each active phase
    const leagueLeaderboards = await Promise.all(
      leagues.map(async (league: any) => {
        const monthlyData = await Promise.all(
          activePhases.map(async (phase: any) => {
            try {
              const standings = await fplApi.getLeagueStandingsByPhase(league.id, phase.id);
              const top3 = (standings?.standings?.results || []).slice(0, 3).map((entry: any, index: number) => ({
                rank: index + 1,
                teamName: entry.entry_name || `Team ${entry.entry}`,
                managerName: entry.player_name || 'Unknown',
                entryId: entry.entry,
                totalPoints: entry.total,
                eventTotal: entry.event_total || 0,
              }));

              return {
                phaseId: phase.id,
                phaseName: phase.name,
                startEvent: phase.start_event,
                stopEvent: phase.stop_event,
                top3,
              };
            } catch (error) {
              console.warn(`Failed to fetch phase ${phase.id} for league ${league.id}:`, error);
              return {
                phaseId: phase.id,
                phaseName: phase.name,
                startEvent: phase.start_event,
                stopEvent: phase.stop_event,
                top3: [],
              };
            }
          })
        );

        return {
          leagueId: league.id,
          leagueName: league.name,
          months: monthlyData.filter((m: any) => m.top3.length > 0),
        };
      })
    );

    return NextResponse.json({
      teamId,
      phases: activePhases.map((p: any) => ({
        id: p.id,
        name: p.name,
        startEvent: p.start_event,
        stopEvent: p.stop_event,
      })),
      leagueLeaderboards: leagueLeaderboards.filter((l: any) => l.months.length > 0),
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}

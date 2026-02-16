import { NextRequest, NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

const fplApi = new FPLApiService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);

    if (isNaN(leagueId)) {
      return NextResponse.json({ error: 'Invalid league ID' }, { status: 400 });
    }

    const bootstrap = await fplApi.getBootstrapData();

    // Extract phases (skip phase 1 which is "Overall")
    const phases = (bootstrap as any).phases || [];
    const monthlyPhases = phases.filter((p: any) => p.id > 1);

    // Determine current gameweek to filter out future phases
    const currentGW = bootstrap.events.find((e: any) => e.is_current)?.id || 1;
    const activePhases = monthlyPhases.filter((p: any) => p.start_event <= currentGW);

    // Fetch standings for each active phase
    const monthlyData = await Promise.all(
      activePhases.map(async (phase: any) => {
        try {
          const standings = await fplApi.getLeagueStandingsByPhase(leagueId, phase.id);
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
          console.warn(`Failed to fetch phase ${phase.id} for league ${leagueId}:`, error);
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

    return NextResponse.json({
      leagueId,
      months: monthlyData.filter((m: any) => m.top3.length > 0),
    });
  } catch (error) {
    console.error('League leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}

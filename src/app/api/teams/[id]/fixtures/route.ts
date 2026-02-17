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

    // Fetch all needed data in parallel
    const [bootstrap, fixtures, managerPicks] = await Promise.all([
      fplApi.getBootstrapData(),
      fplApi.getFixtures(),
      (async () => {
        const currentGW = (await fplApi.getBootstrapData()).events.find((e: any) => e.is_current)?.id || 1;
        return fplApi.getManagerPicks(teamId, currentGW);
      })(),
    ]);

    const currentGW = bootstrap.events.find((e: any) => e.is_current)?.id || 1;

    // Build team lookup: id -> { name, short_name }
    const teamLookup: Record<number, { name: string; short_name: string }> = {};
    for (const t of bootstrap.teams) {
      teamLookup[t.id] = { name: t.name, short_name: t.short_name };
    }

    // Build fixtures by team: teamId -> array of { event, opponent_short, is_home, difficulty }
    const fixturesByTeam: Record<number, any[]> = {};
    for (const t of bootstrap.teams) {
      fixturesByTeam[t.id] = [];
    }

    for (const f of fixtures) {
      if (f.event && f.event >= currentGW && f.event <= 38) {
        // Home team fixture
        if (fixturesByTeam[f.team_h]) {
          fixturesByTeam[f.team_h].push({
            event: f.event,
            opponent_short: teamLookup[f.team_a]?.short_name || '?',
            is_home: true,
            difficulty: f.team_h_difficulty,
          });
        }
        // Away team fixture
        if (fixturesByTeam[f.team_a]) {
          fixturesByTeam[f.team_a].push({
            event: f.event,
            opponent_short: teamLookup[f.team_h]?.short_name || '?',
            is_home: false,
            difficulty: f.team_a_difficulty,
          });
        }
      }
    }

    // Sort fixtures by event for each team
    for (const tid of Object.keys(fixturesByTeam)) {
      fixturesByTeam[Number(tid)].sort((a: any, b: any) => a.event - b.event);
    }

    // Get the manager's current squad players
    const picks = managerPicks?.picks || [];
    const positionMap: Record<number, string> = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };

    const players = picks.map((pick: any) => {
      const player = bootstrap.elements.find((el: any) => el.id === pick.element);
      if (!player) return null;
      const team = bootstrap.teams.find((t: any) => t.id === player.team);
      return {
        id: player.id,
        name: player.web_name,
        position: positionMap[player.element_type] || 'MID',
        positionOrder: player.element_type,
        price: (player.now_cost / 10).toFixed(1),
        teamId: player.team,
        teamName: team?.name || 'Unknown',
        teamShort: team?.short_name || '?',
        teamCode: team?.code || 1,
        photo: player.photo ? player.photo.replace('.jpg', '.png') : null,
        isCaptain: pick.is_captain,
        isViceCaptain: pick.is_vice_captain,
        isStarting: pick.position <= 11,
        pickPosition: pick.position,
        fixtures: fixturesByTeam[player.team] || [],
      };
    }).filter(Boolean);

    // Build GW columns from currentGW to GW 38
    const gwColumns = [];
    for (let gw = currentGW; gw <= 38; gw++) {
      const event = bootstrap.events.find((e: any) => e.id === gw);
      gwColumns.push({
        id: gw,
        name: `GW${gw}`,
        deadline: event?.deadline_time || null,
      });
    }

    return NextResponse.json({
      currentGameweek: currentGW,
      gwColumns,
      players,
    });
  } catch (error) {
    console.error('Fixtures API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixture data' },
      { status: 500 }
    );
  }
}

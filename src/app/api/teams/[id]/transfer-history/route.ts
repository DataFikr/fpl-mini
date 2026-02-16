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

    const [bootstrap, transfers, managerHistory] = await Promise.all([
      fplApi.getBootstrapData(),
      fplApi.getManagerTransfers(teamId),
      fplApi.getManagerHistory(teamId),
    ]);

    const currentGW = bootstrap.events.find((e: any) => e.is_current)?.id || 1;

    // Build lookup for transfer cost per GW from manager history
    const gwHistoryMap: Record<number, any> = {};
    for (const gw of (managerHistory.current || [])) {
      gwHistoryMap[gw.event] = gw;
    }

    // Group transfers by gameweek
    const transfersByGW: Record<number, any[]> = {};
    for (const t of (transfers || [])) {
      if (!t.event) continue;
      if (!transfersByGW[t.event]) transfersByGW[t.event] = [];
      transfersByGW[t.event].push(t);
    }

    // Fetch live data for GWs that have transfers (batch, max concurrency)
    const gwsWithTransfers = Object.keys(transfersByGW).map(Number).sort((a, b) => b - a);
    const liveDataByGW: Record<number, any> = {};

    // Fetch live data in parallel (limit to 5 concurrent)
    const batchSize = 5;
    for (let i = 0; i < gwsWithTransfers.length; i += batchSize) {
      const batch = gwsWithTransfers.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (gw) => {
          try {
            const live = await fplApi.getLiveGameweekData(gw);
            return { gw, live };
          } catch {
            return { gw, live: null };
          }
        })
      );
      for (const r of results) {
        liveDataByGW[r.gw] = r.live;
      }
    }

    // Process each GW's transfers
    const gameweekTransfers = gwsWithTransfers.map((gw) => {
      const gwTransfers = transfersByGW[gw];
      const liveData = liveDataByGW[gw];
      const gwHistory = gwHistoryMap[gw];

      const details = gwTransfers.map((t: any) => {
        const playerIn = bootstrap.elements.find((el: any) => el.id === t.element_in);
        const playerOut = bootstrap.elements.find((el: any) => el.id === t.element_out);
        const teamIn = playerIn ? bootstrap.teams.find((tm: any) => tm.id === playerIn.team) : null;
        const teamOut = playerOut ? bootstrap.teams.find((tm: any) => tm.id === playerOut.team) : null;

        let pointsIn = 0;
        let pointsOut = 0;
        if (liveData?.elements) {
          const liveIn = liveData.elements.find((el: any) => el.id === t.element_in);
          const liveOut = liveData.elements.find((el: any) => el.id === t.element_out);
          pointsIn = liveIn?.stats?.total_points ?? 0;
          pointsOut = liveOut?.stats?.total_points ?? 0;
        }

        return {
          playerIn: {
            id: t.element_in,
            name: playerIn?.web_name || 'Unknown',
            team: teamIn?.short_name || 'UNK',
            teamCode: teamIn?.code || 1,
            points: pointsIn,
            cost: t.element_in_cost / 10,
          },
          playerOut: {
            id: t.element_out,
            name: playerOut?.web_name || 'Unknown',
            team: teamOut?.short_name || 'UNK',
            teamCode: teamOut?.code || 1,
            points: pointsOut,
            cost: t.element_out_cost / 10,
          },
          time: t.time,
        };
      });

      const totalPointsIn = details.reduce((s: number, t: any) => s + t.playerIn.points, 0);
      const totalPointsOut = details.reduce((s: number, t: any) => s + t.playerOut.points, 0);
      const transfersCost = gwHistory?.event_transfers_cost || 0;

      return {
        gameweek: gw,
        isCurrent: gw === currentGW,
        count: gwTransfers.length,
        cost: transfersCost,
        details,
        totalPointsIn,
        totalPointsOut,
      };
    });

    return NextResponse.json({
      teamId,
      currentGameweek: currentGW,
      gameweeks: gameweekTransfers,
    });
  } catch (error) {
    console.error('Transfer history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfer history' },
      { status: 500 }
    );
  }
}

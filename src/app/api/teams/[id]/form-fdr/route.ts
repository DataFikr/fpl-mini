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

    // Fetch bootstrap + fixtures + manager picks in parallel
    const [bootstrap, fixtures] = await Promise.all([
      fplApi.getBootstrapData(),
      fplApi.getFixtures(),
    ]);

    const currentGW = bootstrap.events.find((e: any) => e.is_current)?.id || 1;
    const managerPicks = await fplApi.getManagerPicks(teamId, currentGW);

    // Build team lookup
    const teamLookup: Record<number, { name: string; short_name: string; code: number }> = {};
    for (const t of bootstrap.teams) {
      teamLookup[t.id] = { name: t.name, short_name: t.short_name, code: t.code };
    }

    // Build fixtures by team for upcoming GWs (next 3)
    const fixturesByTeam: Record<number, { event: number; opponent: string; opponentCode: number; isHome: boolean; difficulty: number }[]> = {};
    for (const t of bootstrap.teams) {
      fixturesByTeam[t.id] = [];
    }

    for (const f of fixtures) {
      if (f.event && f.event > currentGW && f.event <= currentGW + 3) {
        if (fixturesByTeam[f.team_h]) {
          fixturesByTeam[f.team_h].push({
            event: f.event,
            opponent: teamLookup[f.team_a]?.short_name || '?',
            opponentCode: teamLookup[f.team_a]?.code || 0,
            isHome: true,
            difficulty: f.team_h_difficulty,
          });
        }
        if (fixturesByTeam[f.team_a]) {
          fixturesByTeam[f.team_a].push({
            event: f.event,
            opponent: teamLookup[f.team_h]?.short_name || '?',
            opponentCode: teamLookup[f.team_h]?.code || 0,
            isHome: false,
            difficulty: f.team_a_difficulty,
          });
        }
      }
    }

    for (const tid of Object.keys(fixturesByTeam)) {
      fixturesByTeam[Number(tid)].sort((a, b) => a.event - b.event);
    }

    // Get the manager's current squad
    const picks = managerPicks?.picks || [];
    const positionMap: Record<number, string> = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };
    const squadPlayerIds = new Set(picks.map((p: any) => p.element));

    // Fetch element summaries for all squad players (for form data)
    const playerElements = picks.map((pick: any) => {
      return bootstrap.elements.find((el: any) => el.id === pick.element);
    }).filter(Boolean);

    const elementSummaries = await Promise.all(
      playerElements.map(async (player: any) => {
        try {
          return { id: player.id, summary: await fplApi.getElementSummary(player.id) };
        } catch {
          return { id: player.id, summary: null };
        }
      })
    );

    const summaryMap: Record<number, any> = {};
    for (const es of elementSummaries) {
      summaryMap[es.id] = es.summary;
    }

    // Determine last 3 finished GWs
    const finishedGWs = bootstrap.events
      .filter((e: any) => e.finished)
      .sort((a: any, b: any) => b.id - a.id)
      .slice(0, 3)
      .map((e: any) => e.id);

    // Build all players in bootstrap for alternatives (compute form for top candidates only)
    // Pre-compute form for all players using their total_points and form field from bootstrap
    const allPlayersByPosition: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const el of bootstrap.elements) {
      if (el.element_type >= 1 && el.element_type <= 4) {
        allPlayersByPosition[el.element_type].push(el);
      }
    }

    // Build form-fdr data for each squad player
    const players = picks.map((pick: any) => {
      const player = bootstrap.elements.find((el: any) => el.id === pick.element);
      if (!player) return null;

      const team = teamLookup[player.team];
      const summary = summaryMap[player.id];

      // Extract last 3 GW points from element summary history
      const form: { gw: number; points: number; opponent: string; opponentCode: number }[] = [];
      if (summary?.history) {
        const recentHistory = summary.history
          .filter((h: any) => finishedGWs.includes(h.round))
          .sort((a: any, b: any) => a.round - b.round);

        for (const h of recentHistory) {
          form.push({
            gw: h.round,
            points: h.total_points,
            opponent: h.opponent_team ? (teamLookup[h.opponent_team]?.short_name || '?') : '?',
            opponentCode: h.opponent_team ? (teamLookup[h.opponent_team]?.code || 0) : 0,
          });
        }
      }

      const formTotal = form.reduce((s, f) => s + f.points, 0);

      // Get upcoming fixtures
      const upcomingFixtures = (fixturesByTeam[player.team] || []).slice(0, 3);
      const avgFDR = upcomingFixtures.length > 0
        ? upcomingFixtures.reduce((s, f) => s + f.difficulty, 0) / upcomingFixtures.length
        : 3;

      // Recommendation logic
      let recommendation: 'keep' | 'monitor' | 'transfer_out';
      let recommendationReason: string;

      if (formTotal >= 15 && avgFDR <= 3.0) {
        recommendation = 'keep';
        recommendationReason = `Strong form (${formTotal} pts) with favorable fixtures (avg FDR ${avgFDR.toFixed(1)})`;
      } else if (formTotal >= 10 || avgFDR <= 2.5) {
        recommendation = 'monitor';
        if (formTotal >= 10) {
          recommendationReason = `Decent form (${formTotal} pts) but ${avgFDR > 3 ? 'tough fixtures ahead' : 'mixed fixtures'}`;
        } else {
          recommendationReason = `Easy fixtures (avg FDR ${avgFDR.toFixed(1)}) but low recent output (${formTotal} pts)`;
        }
      } else {
        recommendation = 'transfer_out';
        recommendationReason = `Poor form (${formTotal} pts) and tough fixtures (avg FDR ${avgFDR.toFixed(1)})`;
      }

      // Find alternative player
      let alternative: any = null;
      if (recommendation !== 'keep') {
        const playerPrice = player.now_cost / 10;
        const candidates = allPlayersByPosition[player.element_type]
          .filter((el: any) => {
            if (squadPlayerIds.has(el.id)) return false;
            const elPrice = el.now_cost / 10;
            return elPrice >= playerPrice - 1.5 && elPrice <= playerPrice + 1.5;
          })
          .map((el: any) => {
            const elTeam = teamLookup[el.team];
            const elFixtures = (fixturesByTeam[el.team] || []).slice(0, 3);
            const elAvgFDR = elFixtures.length > 0
              ? elFixtures.reduce((s: number, f: any) => s + f.difficulty, 0) / elFixtures.length
              : 3;
            // Use FPL 'form' field (avg points per match over recent games)
            const avgFormPoints = parseFloat(el.form || '0');
            return {
              id: el.id,
              name: el.web_name,
              team: elTeam?.short_name || '?',
              teamCode: elTeam?.code || 1,
              price: (el.now_cost / 10).toFixed(1),
              avgFormPoints: Math.round(avgFormPoints * 10) / 10,
              totalPoints: el.total_points,
              avgFDR: Math.round(elAvgFDR * 10) / 10,
            };
          })
          .sort((a: any, b: any) => {
            // Prefer good FDR + high total points
            const aScore = a.totalPoints * (4 - a.avgFDR);
            const bScore = b.totalPoints * (4 - b.avgFDR);
            return bScore - aScore;
          });

        if (candidates.length > 0) {
          alternative = candidates[0];
        }
      }

      return {
        id: player.id,
        name: player.web_name,
        position: positionMap[player.element_type] || 'MID',
        positionOrder: player.element_type,
        price: (player.now_cost / 10).toFixed(1),
        teamShort: team?.short_name || '?',
        teamCode: team?.code || 1,
        isStarting: pick.position <= 11,
        isCaptain: pick.is_captain,
        isViceCaptain: pick.is_vice_captain,
        pickPosition: pick.position,
        form,
        formTotal,
        upcomingFixtures,
        avgFDR: Math.round(avgFDR * 10) / 10,
        recommendation,
        recommendationReason,
        alternative,
      };
    }).filter(Boolean);

    // Build GW columns for form (last 3) and upcoming (next 4)
    const formGwColumns = finishedGWs.sort((a: number, b: number) => a - b).map((gw: number) => ({
      id: gw,
      name: `GW${gw}`,
    }));

    const upcomingGwColumns = [];
    for (let gw = currentGW + 1; gw <= Math.min(currentGW + 3, 38); gw++) {
      const event = bootstrap.events.find((e: any) => e.id === gw);
      upcomingGwColumns.push({
        id: gw,
        name: `GW${gw}`,
        deadline: event?.deadline_time || null,
      });
    }

    return NextResponse.json({
      currentGameweek: currentGW,
      formGwColumns,
      upcomingGwColumns,
      players,
    });
  } catch (error) {
    console.error('Form & FDR API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form & FDR data' },
      { status: 500 }
    );
  }
}

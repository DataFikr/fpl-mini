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
    const { searchParams } = new URL(request.url);
    const entryId = parseInt(searchParams.get('entryId') || '0');
    const startEvent = parseInt(searchParams.get('startEvent') || '0');
    const stopEvent = parseInt(searchParams.get('stopEvent') || '0');

    if (isNaN(leagueId) || !entryId || !startEvent || !stopEvent) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const [bootstrap, managerHistory, managerTransfers] = await Promise.all([
      fplApi.getBootstrapData(),
      fplApi.getManagerHistory(entryId),
      fplApi.getManagerTransfers(entryId),
    ]);

    // Build lookups
    const playerLookup: Record<number, { name: string; teamId: number; elementType: number; selectedByPercent: string }> = {};
    for (const el of bootstrap.elements) {
      playerLookup[el.id] = {
        name: el.web_name,
        teamId: el.team,
        elementType: el.element_type,
        selectedByPercent: el.selected_by_percent || '0',
      };
    }

    const teamLookup: Record<number, string> = {};
    for (const t of bootstrap.teams) {
      teamLookup[t.id] = t.short_name;
    }

    // Get finished GWs in the phase range
    const phaseGWs = bootstrap.events
      .filter((e: any) => e.id >= startEvent && e.id <= stopEvent && e.finished)
      .map((e: any) => e.id);

    // Fetch picks and live data for each GW in the phase
    const gwData = await Promise.all(
      phaseGWs.map(async (gw: number) => {
        try {
          const [picks, liveData] = await Promise.all([
            fplApi.getManagerPicks(entryId, gw),
            fplApi.getLiveGameweekData(gw),
          ]);
          return { gw, picks, liveData };
        } catch {
          return null;
        }
      })
    );

    const validGwData = gwData.filter(Boolean) as { gw: number; picks: any; liveData: any }[];

    const highlights: any[] = [];
    const chips = managerHistory?.chips || [];
    const phaseChips = chips.filter((c: any) => c.event >= startEvent && c.event <= stopEvent);

    // Helper: get live points for a player in a GW
    function getLivePoints(liveData: any, elementId: number): number {
      const el = liveData?.elements?.find((e: any) => e.id === elementId);
      if (!el || !el.stats || el.stats.minutes === 0) return 0;
      const s = el.stats;
      const pos = playerLookup[elementId]?.elementType || 4;
      const goalPts = pos <= 2 ? 6 : pos === 3 ? 5 : 4;
      const csPts = pos <= 2 ? 4 : 0;
      return (
        (s.minutes >= 60 ? 2 : s.minutes > 0 ? 1 : 0) +
        s.goals_scored * goalPts +
        s.assists * 3 +
        (s.clean_sheets ? csPts : 0) +
        s.bonus +
        (s.penalties_saved || 0) * 5 -
        (s.penalties_missed || 0) * 2 -
        (s.own_goals || 0) * 2 -
        (s.yellow_cards || 0) -
        (s.red_cards || 0) * 3 +
        (pos === 1 && s.saves >= 3 ? Math.floor(s.saves / 3) : 0)
      );
    }

    // === 1. Captaincy Clustering ===
    // Detect when captain picks consistently delivered high points
    try {
      let captainGWs: { gw: number; name: string; points: number; multiplier: number }[] = [];

      for (const gwd of validGwData) {
        if (!gwd.picks?.picks) continue;
        const captain = gwd.picks.picks.find((p: any) => p.is_captain);
        if (!captain) continue;

        const rawPts = getLivePoints(gwd.liveData, captain.element);
        const totalPts = rawPts * captain.multiplier;
        const playerName = playerLookup[captain.element]?.name || 'Unknown';

        captainGWs.push({ gw: gwd.gw, name: playerName, points: totalPts, multiplier: captain.multiplier });
      }

      const highCaptainGWs = captainGWs.filter(c => c.points >= 10);

      if (highCaptainGWs.length >= 2) {
        const totalCaptainPts = captainGWs.reduce((s, c) => s + c.points, 0);
        const bestCaptain = captainGWs.reduce((best, c) => c.points > best.points ? c : best, captainGWs[0]);
        highlights.push({
          type: 'captaincy_clustering',
          icon: '👑',
          title: 'Captaincy Masterclass',
          description: `Captains delivered ${totalCaptainPts} pts across ${captainGWs.length} GWs with ${highCaptainGWs.length} double-digit hauls. Best pick: ${bestCaptain.name} with ${bestCaptain.points} pts on GW${bestCaptain.gw}.`,
          gameweek: bestCaptain.gw,
          points: totalCaptainPts,
        });
      } else if (captainGWs.length > 0) {
        const bestCaptain = captainGWs.reduce((best, c) => c.points > best.points ? c : best, captainGWs[0]);
        if (bestCaptain.points >= 8) {
          highlights.push({
            type: 'captaincy_clustering',
            icon: '👑',
            title: 'Captain Pick',
            description: `Best captain pick was ${bestCaptain.name} on GW${bestCaptain.gw} delivering ${bestCaptain.points} pts.`,
            gameweek: bestCaptain.gw,
            points: bestCaptain.points,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to compute captaincy clustering:', error);
    }

    // === 2. Differential Punts ===
    // Players with low ownership (<10%) that delivered big points
    try {
      let bestDifferential = { name: '', gw: 0, points: 0, ownership: 0 };

      for (const gwd of validGwData) {
        if (!gwd.picks?.picks) continue;

        for (const pick of gwd.picks.picks) {
          if (pick.position > 11) continue; // Only starting XI
          const player = playerLookup[pick.element];
          if (!player) continue;

          const ownership = parseFloat(player.selectedByPercent);
          if (ownership >= 15) continue; // Only low-ownership differentials

          const rawPts = getLivePoints(gwd.liveData, pick.element);
          const totalPts = rawPts * pick.multiplier;

          if (totalPts > bestDifferential.points) {
            bestDifferential = {
              name: player.name,
              gw: gwd.gw,
              points: totalPts,
              ownership,
            };
          }
        }
      }

      if (bestDifferential.points >= 6) {
        highlights.push({
          type: 'differential_punt',
          icon: '🎲',
          title: 'Differential Punt',
          description: `${bestDifferential.name} (${bestDifferential.ownership.toFixed(1)}% owned) delivered ${bestDifferential.points} pts on GW${bestDifferential.gw} — a bold pick that paid off.`,
          gameweek: bestDifferential.gw,
          points: bestDifferential.points,
        });
      }
    } catch (error) {
      console.warn('Failed to compute differential punt:', error);
    }

    // === 3. BPS & Defensive Grind ===
    // High bonus points and clean sheet contributions from defenders/GKs
    try {
      let totalBonus = 0;
      let totalCleanSheets = 0;
      let bestDefender = { name: '', gw: 0, bonus: 0, cleanSheets: 0, totalPts: 0 };

      for (const gwd of validGwData) {
        if (!gwd.picks?.picks || !gwd.liveData?.elements) continue;

        for (const pick of gwd.picks.picks) {
          if (pick.position > 11) continue;
          const player = playerLookup[pick.element];
          if (!player) continue;

          const liveEl = gwd.liveData.elements.find((el: any) => el.id === pick.element);
          if (!liveEl?.stats) continue;

          totalBonus += liveEl.stats.bonus || 0;

          if (player.elementType <= 2) {
            const cs = liveEl.stats.clean_sheets ? 1 : 0;
            totalCleanSheets += cs;
            const pts = getLivePoints(gwd.liveData, pick.element);

            if (pts > bestDefender.totalPts) {
              bestDefender = {
                name: player.name,
                gw: gwd.gw,
                bonus: liveEl.stats.bonus || 0,
                cleanSheets: cs,
                totalPts: pts,
              };
            }
          }
        }
      }

      if (totalBonus >= 8 || totalCleanSheets >= 3) {
        const parts: string[] = [];
        if (totalBonus >= 8) parts.push(`${totalBonus} bonus points`);
        if (totalCleanSheets >= 3) parts.push(`${totalCleanSheets} clean sheets`);
        const detail = bestDefender.totalPts > 0
          ? ` Best defensive return: ${bestDefender.name} with ${bestDefender.totalPts} pts on GW${bestDefender.gw}.`
          : '';
        highlights.push({
          type: 'bps_defensive_grind',
          icon: '🛡️',
          title: 'Defensive Grind',
          description: `Squad earned ${parts.join(' and ')} across the month.${detail}`,
          gameweek: bestDefender.gw || phaseGWs[0],
          points: totalBonus,
        });
      }
    } catch (error) {
      console.warn('Failed to compute BPS/defensive grind:', error);
    }

    // === 4. Triple Captain ===
    try {
      const tcChip = phaseChips.find((c: any) => c.name === '3xc');
      if (tcChip) {
        const gwHistory = managerHistory?.current?.find((h: any) => h.event === tcChip.event);
        const chipGwPoints = gwHistory?.points || 0;

        // Find the captain for that GW
        const tcGwd = validGwData.find(g => g.gw === tcChip.event);
        const captain = tcGwd?.picks?.picks?.find((p: any) => p.is_captain);
        const captainName = captain ? (playerLookup[captain.element]?.name || 'Unknown') : 'Unknown';
        const rawPts = captain && tcGwd ? getLivePoints(tcGwd.liveData, captain.element) : 0;
        const tcPts = rawPts * 3;

        highlights.push({
          type: 'triple_captain',
          icon: '3️⃣',
          title: `Triple Captain on GW${tcChip.event}`,
          description: `Triple Captained ${captainName} on GW${tcChip.event} for ${tcPts} pts (${chipGwPoints} total GW score).`,
          gameweek: tcChip.event,
          points: tcPts,
        });
      }
    } catch (error) {
      console.warn('Failed to compute triple captain:', error);
    }

    // === 5. Free Hit ===
    try {
      const fhChip = phaseChips.find((c: any) => c.name === 'freehit');
      if (fhChip) {
        const gwHistory = managerHistory?.current?.find((h: any) => h.event === fhChip.event);
        const chipGwPoints = gwHistory?.points || 0;

        const allGwPoints = (managerHistory?.current || []).map((h: any) => h.points);
        const avgPoints = allGwPoints.length > 0
          ? Math.round(allGwPoints.reduce((s: number, p: number) => s + p, 0) / allGwPoints.length)
          : 0;
        const diff = chipGwPoints - avgPoints;

        highlights.push({
          type: 'free_hit',
          icon: '🎯',
          title: `Free Hit on GW${fhChip.event}`,
          description: `Used Free Hit on GW${fhChip.event} scoring ${chipGwPoints} pts (${diff >= 0 ? '+' : ''}${diff} vs season avg of ${avgPoints}).`,
          gameweek: fhChip.event,
          points: chipGwPoints,
        });
      }
    } catch (error) {
      console.warn('Failed to compute free hit:', error);
    }

    // === 6. Wildcard ===
    try {
      const wcChip = phaseChips.find((c: any) => c.name === 'wildcard');
      if (wcChip) {
        // Calculate points in GWs after the wildcard within the phase
        const postWcGWs = (managerHistory?.current || [])
          .filter((h: any) => h.event >= wcChip.event && h.event <= stopEvent);
        const postWcTotal = postWcGWs.reduce((s: number, h: any) => s + h.points, 0);
        const gwCount = postWcGWs.length;

        const preWcGWs = (managerHistory?.current || [])
          .filter((h: any) => h.event >= startEvent && h.event < wcChip.event);
        const preWcTotal = preWcGWs.reduce((s: number, h: any) => s + h.points, 0);
        const preWcCount = preWcGWs.length;

        let desc = `Played Wildcard on GW${wcChip.event}, then scored ${postWcTotal} pts over ${gwCount} GW${gwCount > 1 ? 's' : ''}.`;
        if (preWcCount > 0) {
          const preAvg = Math.round(preWcTotal / preWcCount);
          const postAvg = gwCount > 0 ? Math.round(postWcTotal / gwCount) : 0;
          const avgDiff = postAvg - preAvg;
          desc += ` Average rose from ${preAvg} to ${postAvg} pts/GW (${avgDiff >= 0 ? '+' : ''}${avgDiff}).`;
        }

        highlights.push({
          type: 'wildcard',
          icon: '🃏',
          title: `Wildcard on GW${wcChip.event}`,
          description: desc,
          gameweek: wcChip.event,
          points: postWcTotal,
        });
      }
    } catch (error) {
      console.warn('Failed to compute wildcard:', error);
    }

    // === Fallback: Transfer Masterstroke (if we have few highlights) ===
    if (highlights.length < 3) {
      try {
        const phaseTransfers = (managerTransfers || []).filter(
          (t: any) => t.event >= startEvent && t.event <= stopEvent
        );

        if (phaseTransfers.length > 0) {
          let bestTransfer = { playerName: '', gw: 0, totalPoints: 0, description: '' };

          for (const transfer of phaseTransfers) {
            const playerId = transfer.element_in;
            const playerName = playerLookup[playerId]?.name || 'Unknown';
            const transferGW = transfer.event;

            try {
              const summary = await fplApi.getElementSummary(playerId);
              const postTransferHistory = (summary?.history || [])
                .filter((h: any) => h.round >= transferGW && h.round <= stopEvent);

              const totalPoints = postTransferHistory.reduce((s: number, h: any) => s + h.total_points, 0);
              const gwCount = postTransferHistory.length;

              if (totalPoints > bestTransfer.totalPoints) {
                let desc = `Transferred in ${playerName} on GW${transferGW} who delivered ${totalPoints} pts over ${gwCount} GW${gwCount > 1 ? 's' : ''}`;
                const doubleDigitCount = postTransferHistory.filter((h: any) => h.total_points >= 10).length;
                if (doubleDigitCount >= 2) {
                  desc = `Genius move on GW${transferGW}: ${playerName} delivered back-to-back double-digit hauls (${totalPoints} pts total)`;
                }
                bestTransfer = { playerName, gw: transferGW, totalPoints, description: desc };
              }
            } catch {
              // Skip
            }
          }

          if (bestTransfer.totalPoints > 0) {
            highlights.push({
              type: 'transfer_masterstroke',
              icon: '🔄',
              title: `${bestTransfer.playerName} transfer (GW${bestTransfer.gw})`,
              description: bestTransfer.description,
              gameweek: bestTransfer.gw,
              points: bestTransfer.totalPoints,
            });
          }
        }
      } catch (error) {
        console.warn('Failed to compute transfer highlight:', error);
      }
    }

    // Sort by points descending and take top 3
    highlights.sort((a, b) => (b.points || 0) - (a.points || 0));
    const topHighlights = highlights.slice(0, 3);

    return NextResponse.json({
      entryId,
      highlights: topHighlights,
    });
  } catch (error) {
    console.error('Highlights API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights data' },
      { status: 500 }
    );
  }
}

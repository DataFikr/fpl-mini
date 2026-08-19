import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getSessionUser, hasActivePremium } from '@/lib/auth';
import { CURRENT_SEASON } from '@/services/predictor-service';

const FREE_LIMIT = 10;

/**
 * GET /api/predictions/current — the latest gameweek's xPts board.
 * Free callers get the top 10; premium callers get the full list. Powers the
 * public /predictions teaser and (premium) the squad Prediction tab.
 */
export async function GET() {
  const latest = await prisma.playerPrediction.findFirst({
    where: { season: CURRENT_SEASON },
    orderBy: { gameweek: 'desc' },
    select: { gameweek: true },
  });
  if (!latest) return NextResponse.json({ available: false });

  const gw = latest.gameweek;
  const rows = await prisma.playerPrediction.findMany({
    where: { season: CURRENT_SEASON, gameweek: gw },
    // Ties are common pre-season, when xPts comes from FPL's coarse ep_next —
    // break them on price so the free top-10 is stable between requests.
    orderBy: [{ xPts: 'desc' }, { price: 'desc' }, { playerFplId: 'asc' }],
  });

  const user = await getSessionUser();
  const premium = hasActivePremium(user);
  const visible = premium ? rows : rows.slice(0, FREE_LIMIT);

  return NextResponse.json({
    available: true,
    season: CURRENT_SEASON,
    gameweek: gw,
    premium,
    total: rows.length,
    locked: premium ? 0 : Math.max(0, rows.length - FREE_LIMIT),
    players: visible.map((p) => ({
      id: p.playerFplId,
      name: p.webName,
      team: p.teamShort,
      position: p.position,
      price: p.price / 10,
      xPts: p.xPts,
      xMins: p.xMins,
    })),
  });
}

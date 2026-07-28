import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, hasActivePremium } from '@/lib/auth';
import { prisma } from '@/lib/database';

/**
 * GET /api/me — the current account (or { authenticated: false } when anonymous).
 * Powers the account chip and team-ID hydration. Never 401s on GET so callers
 * can treat "logged out" as a normal state.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ authenticated: false });

  const leagues = await prisma.userLeague.findMany({
    where: { userId: user.id },
    select: { leagueFplId: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    fplTeamId: user.fplTeamId,
    isPremium: hasActivePremium(user),
    premiumUntil: user.premiumUntil,
    leagues: leagues.map((l) => l.leagueFplId),
  });
}

/**
 * PATCH /api/me — persist the logged-in user's FPL team id and/or save a league.
 * Body: { fplTeamId?: number, addLeagueId?: number }. Used both when a user
 * enters an id while signed in and to migrate an anonymous localStorage id up
 * to the account on first login.
 */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  const data: { fplTeamId?: number } = {};
  const teamId = parseInt(String(body.fplTeamId), 10);
  if (Number.isFinite(teamId) && teamId > 0) data.fplTeamId = teamId;
  if (data.fplTeamId != null) {
    await prisma.user.update({ where: { id: user.id }, data });
  }

  const leagueId = parseInt(String(body.addLeagueId), 10);
  if (Number.isFinite(leagueId) && leagueId > 0) {
    await prisma.userLeague.upsert({
      where: { userId_leagueFplId: { userId: user.id, leagueFplId: leagueId } },
      update: {},
      create: { userId: user.id, leagueFplId: leagueId },
    });
  }

  return NextResponse.json({ success: true });
}

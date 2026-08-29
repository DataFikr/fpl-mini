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
 * PATCH /api/me — link/unlink the logged-in user's FPL team and/or save a league.
 * Body: { fplTeamId?: number | null, force?: boolean, addLeagueId?: number }.
 *
 * The linked team is the account's identity, so it is deliberately hard to
 * move: an id only lands on an account that has none, unless `force` marks the
 * write as a deliberate re-link from the account menu. Without that guard,
 * merely opening a rival's squad re-pointed the account at their team.
 * `fplTeamId: null` unlinks.
 */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  const leagueId = parseInt(String(body.addLeagueId), 10);
  if (Number.isFinite(leagueId) && leagueId > 0) {
    await prisma.userLeague.upsert({
      where: { userId_leagueFplId: { userId: user.id, leagueFplId: leagueId } },
      update: {},
      create: { userId: user.id, leagueFplId: leagueId },
    });
  }

  let linkedTeamId = user.fplTeamId;

  if (body.fplTeamId === null) {
    await prisma.user.update({ where: { id: user.id }, data: { fplTeamId: null } });
    linkedTeamId = null;
  } else if (body.fplTeamId !== undefined) {
    const teamId = parseInt(String(body.fplTeamId), 10);
    if (!Number.isFinite(teamId) || teamId <= 0) {
      return NextResponse.json({ error: 'Invalid team id' }, { status: 400 });
    }
    if (user.fplTeamId != null && teamId !== user.fplTeamId && body.force !== true) {
      // Browsing another manager must not steal the account's team.
      return NextResponse.json(
        { success: false, error: 'Team already linked', fplTeamId: user.fplTeamId },
        { status: 409 },
      );
    }
    if (teamId !== user.fplTeamId) {
      await prisma.user.update({ where: { id: user.id }, data: { fplTeamId: teamId } });
    }
    linkedTeamId = teamId;
  }

  return NextResponse.json({ success: true, fplTeamId: linkedTeamId });
}

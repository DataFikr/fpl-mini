import { NextRequest, NextResponse } from 'next/server';
import { FPLApiService, isFplNotFound } from '@/services/fpl-api';

/**
 * GET /api/teams/[id]/summary — the identity of an FPL team, nothing more.
 *
 * Exists because the account menu has to render "6454003 · Jogha Bonito" from
 * an id alone. `/api/teams/[id]` would do it, but that route goes through
 * TeamService and writes the team to the database; this is a read of one
 * Redis-cached FPL entry and no more.
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const teamId = parseInt(id, 10);
  if (!Number.isFinite(teamId) || teamId <= 0) {
    return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
  }

  try {
    const entry: any = await new FPLApiService().getManagerEntry(teamId);
    return NextResponse.json({
      id: teamId,
      name: entry?.name || `Team ${teamId}`,
      manager: `${entry?.player_first_name ?? ''} ${entry?.player_last_name ?? ''}`.trim(),
      totalPoints: entry?.summary_overall_points ?? 0,
      overallRank: entry?.summary_overall_rank ?? 0,
    });
  } catch (error) {
    if (isFplNotFound(error)) {
      return NextResponse.json({ error: 'No FPL team with that ID' }, { status: 404 });
    }
    console.error('Team summary API error:', error);
    return NextResponse.json({ error: 'Failed to load team' }, { status: 500 });
  }
}

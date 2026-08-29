import { NextRequest, NextResponse } from 'next/server';
import { searchTeams, indexSize } from '@/lib/manager-index';

/**
 * GET /api/search?q=<team name>
 *
 * Resolves a squad name to FPL team IDs so a visitor never has to go and look
 * up a 7-digit number before using the site. Backed by the index built from
 * league standings — see src/lib/manager-index.ts.
 *
 * Searches team names only, never manager names: a manager name is usually a
 * real name, and making those queryable would turn this into a people-finder.
 *
 * Replaces an earlier version that returned a hardcoded list of mock managers
 * regardless of the query (`FPLApiService.findTeamByName`), never mounted in
 * the UI.
 *
 * `indexed` lets the UI tell "no such team" apart from "the index doesn't cover
 * your league yet" — two very different messages.
 */
export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get('q') ?? '';

  if (q.trim().length < 2) {
    return NextResponse.json(
      { error: 'Enter at least 2 characters', teams: [] },
      { status: 400 }
    );
  }

  try {
    const [teams, indexed] = await Promise.all([searchTeams(q), indexSize()]);
    return NextResponse.json({ query: q.trim(), teams, indexed });
  } catch (error) {
    console.error('Team search failed:', error);
    return NextResponse.json({ error: 'Search unavailable', teams: [] }, { status: 500 });
  }
}

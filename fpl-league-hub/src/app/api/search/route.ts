import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/services/team-service';

const teamService = new TeamService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const teams = await teamService.searchTeams(query);
    
    return NextResponse.json({
      teams: teams.slice(0, 10) // Limit to top 10 results
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search teams' },
      { status: 500 }
    );
  }
}
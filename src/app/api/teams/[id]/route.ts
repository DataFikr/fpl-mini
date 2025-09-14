import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/services/team-service';

const teamService = new TeamService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.id);
    
    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    const team = await teamService.getOrCreateTeam(teamId);
    const leagues = await teamService.getTeamLeagues(teamId);
    
    return NextResponse.json({
      team,
      leagues
    });
  } catch (error) {
    console.error('Team API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}
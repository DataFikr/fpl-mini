import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/services/team-service';
import { FPLApiService } from '@/services/fpl-api';

const teamService = new TeamService();
const fplApi = new FPLApiService();

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

    const { searchParams } = new URL(request.url);
    const gameweek = searchParams.get('gameweek');
    
    let gwNumber: number;
    if (gameweek) {
      gwNumber = parseInt(gameweek);
      if (isNaN(gwNumber)) {
        gwNumber = await fplApi.getCurrentGameweek();
      }
    } else {
      gwNumber = await fplApi.getCurrentGameweek();
    }

    // Sync gameweek data first
    await teamService.syncGameweekData(teamId, gwNumber);

    // Get squad data from database
    const team = await teamService.getOrCreateTeam(teamId);
    const squadData = await teamService.getSquadAnalysis(teamId, gwNumber);

    return NextResponse.json({
      team,
      gameweek: gwNumber,
      squad: squadData
    });
  } catch (error) {
    console.error('Squad API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch squad data' },
      { status: 500 }
    );
  }
}
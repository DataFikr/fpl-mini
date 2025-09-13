import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/services/team-service';

const teamService = new TeamService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);
    
    if (isNaN(leagueId)) {
      return NextResponse.json(
        { error: 'Invalid league ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const debug = searchParams.get('debug');
    const team = searchParams.get('team');

    // Debug logging for pitch view
    if (debug === 'pitch-view-opened') {
      console.log(`🎯 PITCH VIEW OPENED FOR TEAM: ${team}`);
      return NextResponse.json({ debug: 'logged' });
    }
    
    if (debug === 'fetchSquadData-called') {
      const gameweek = searchParams.get('gameweek');
      console.log(`🔍 FETCH SQUAD DATA CALLED FOR TEAM: ${team}, GAMEWEEK: ${gameweek}`);
      return NextResponse.json({ debug: 'logged' });
    }
    
    if (debug === 'found-team-id') {
      const teamId = searchParams.get('teamId');
      console.log(`✅ FOUND TEAM ID ${teamId} FOR TEAM: ${team}`);
      return NextResponse.json({ debug: 'logged' });
    }
    
    if (debug === 'fpl-api-success') {
      console.log(`🌟 FPL API CALLS SUCCESSFUL FOR TEAM: ${team}`);
      return NextResponse.json({ debug: 'logged' });
    }
    
    if (debug === 'fpl-api-failed') {
      const picksOk = searchParams.get('picksOk');
      const bootstrapOk = searchParams.get('bootstrapOk');
      console.log(`❌ FPL API CALLS FAILED FOR TEAM: ${team} (picks: ${picksOk}, bootstrap: ${bootstrapOk})`);
      return NextResponse.json({ debug: 'logged' });
    }
    
    if (debug === 'live-data-success') {
      console.log(`📊 LIVE DATA FETCHED FOR TEAM: ${team}`);
      return NextResponse.json({ debug: 'logged' });
    }
    
    if (debug === 'squad-parsed') {
      const hasStarting = searchParams.get('hasStarting');
      console.log(`⚽ SQUAD PARSED FOR TEAM: ${team}, hasStarting: ${hasStarting}`);
      return NextResponse.json({ debug: 'logged' });
    }

    if (action === 'sync') {
      const league = await teamService.syncLeagueData(leagueId);
      return NextResponse.json({ league });
    }

    if (action === 'progression') {
      const progression = await teamService.getGameweekRankProgression(leagueId);
      return NextResponse.json({ progression });
    }

    // Default behavior - return league data
    const league = await teamService.syncLeagueData(leagueId);
    return NextResponse.json(league);
  } catch (error) {
    console.error('League API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league data' },
      { status: 500 }
    );
  }
}
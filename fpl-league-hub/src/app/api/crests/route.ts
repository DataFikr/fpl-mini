import { NextRequest, NextResponse } from 'next/server';
import { CrestService } from '@/services/crest-service';

const crestService = new CrestService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle batch generation for multiple teams
    if (body.teamNames && Array.isArray(body.teamNames)) {
      console.log('Generating crests for all teams:', body.teamNames);
      const results = await crestService.generateCrestsForAllTeams(body.teamNames);
      
      return NextResponse.json({
        crests: results,
        generated: true,
        count: Object.keys(results).length
      });
    }

    // Handle single team generation
    const { teamName } = body;
    if (!teamName || typeof teamName !== 'string') {
      return NextResponse.json(
        { error: 'Team name or teamNames array is required' },
        { status: 400 }
      );
    }

    const crestUrl = await crestService.generateCrestWithFallback(teamName);
    
    return NextResponse.json({
      crestUrl,
      generated: true
    });
  } catch (error) {
    console.error('Crest generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate team crest' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get('teamName');
    const teamIdParam = searchParams.get('teamId');
    const teamId = teamIdParam ? parseInt(teamIdParam, 10) : undefined;

    if (!teamName) {
      return NextResponse.json(
        { error: 'Team name parameter is required' },
        { status: 400 }
      );
    }

    // First try to get existing crest
    let crestUrl = await crestService.getCrestForTeam(teamName);
    
    // If no crest exists, generate one with the fans league logic
    if (!crestUrl) {
      crestUrl = await crestService.generateCrestWithFallback(teamName, teamId);
    }
    
    return NextResponse.json({
      crestUrl,
      exists: !!crestUrl
    });
  } catch (error) {
    console.error('Crest fetch API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team crest' },
      { status: 500 }
    );
  }
}
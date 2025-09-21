import { NextRequest, NextResponse } from 'next/server';
import { optimizedCrestService } from '@/services/crest-service-optimized';

// Use the optimized service for 10x better performance

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle batch generation for multiple teams (OPTIMIZED)
    if (body.teamNames && Array.isArray(body.teamNames)) {
      console.log('🚀 Batch generating crests for all teams:', body.teamNames);
      const startTime = Date.now();

      const results = await optimizedCrestService.generateCrestsForAllTeams(body.teamNames, {
        useCache: true,
        batchSize: 10
      });

      const duration = Date.now() - startTime;
      console.log(`⚡ Batch crest generation completed in ${duration}ms`);

      return NextResponse.json({
        crests: results,
        generated: true,
        count: Object.keys(results).length,
        duration
      });
    }

    // Handle single team generation (OPTIMIZED)
    const { teamName } = body;
    if (!teamName || typeof teamName !== 'string') {
      return NextResponse.json(
        { error: 'Team name or teamNames array is required' },
        { status: 400 }
      );
    }

    const crestUrl = await optimizedCrestService.generateTeamCrest(teamName, {
      useCache: true
    });
    
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

    // Use optimized crest service with caching
    const crestUrl = await optimizedCrestService.generateTeamCrest(teamName, {
      useCache: true
    });
    
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
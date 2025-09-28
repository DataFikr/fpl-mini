import { NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

export async function GET() {
  try {
    const fplApi = new FPLApiService();
    const currentGameweek = await fplApi.getCurrentGameweek();

    return NextResponse.json({
      success: true,
      gameweek: currentGameweek
    });
  } catch (error) {
    console.error('Failed to fetch current gameweek:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch current gameweek',
        gameweek: 6 // Fallback
      },
      { status: 500 }
    );
  }
}
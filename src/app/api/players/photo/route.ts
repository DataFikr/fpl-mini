import { NextRequest, NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';
import { findPlayerPhotoByName, type BootstrapElementLike } from '@/lib/fpl-images';

/**
 * Resolve official Premier League player photos by name.
 *
 * The FPL bootstrap feed blocks browser CORS, so the on-site Breaking News
 * ticker calls this server route to turn a player name (e.g. "Salah") into a
 * public, current-season action photo URL.
 *
 *   GET /api/players/photo?name=Salah          -> { photoUrl }
 *   GET /api/players/photo?names=Salah,Haaland  -> { photos: { Salah: url, ... } }
 *
 * Cached for an hour — player codes are stable across a season.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const namesParam = searchParams.get('names');

    if (!name && !namesParam) {
      return NextResponse.json({ error: 'Provide ?name= or ?names=' }, { status: 400 });
    }

    const fplApi = new FPLApiService();
    const bootstrap = await fplApi.getBootstrapData();
    const elements = (bootstrap.elements || []) as BootstrapElementLike[];

    if (namesParam) {
      const names = namesParam.split(',').map((n) => n.trim()).filter(Boolean).slice(0, 30);
      const photos: Record<string, string | null> = {};
      for (const n of names) {
        photos[n] = findPlayerPhotoByName(n, elements);
      }
      return NextResponse.json(
        { photos },
        { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
      );
    }

    const photoUrl = findPlayerPhotoByName(name, elements);
    return NextResponse.json(
      { photoUrl, found: !!photoUrl },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('Player photo lookup error:', error);
    return NextResponse.json({ error: 'Failed to resolve player photo' }, { status: 500 });
  }
}

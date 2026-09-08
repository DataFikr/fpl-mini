import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getXptsBySlugs } from '@/lib/players';

/**
 * GET /api/players/xpts?slugs=a,b,c — projected points for the comparison grid
 * on /players/[slug], for signed-in callers only.
 *
 * Why this exists: the player pages are ISR-cached pSEO, so every number
 * rendered server-side sits in static HTML that a crawler reads for free. In
 * September 2026 a headless scraper walked ~122 of the 200 sitemap player URLs
 * in two days, harvesting exactly this. The headline GW+1 xPts stays public —
 * it is what the page title and meta description promise, and pulling it would
 * cost the organic traffic these pages exist to earn. The comparison set is the
 * part that turns single numbers into a ranked dataset, so it moved behind a
 * session.
 *
 * A session is not a hard stop against a determined scraper (it can sign up),
 * but it converts anonymous bulk harvesting into an identifiable, rate-limitable
 * account — which is the realistic goal.
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ locked: true }, { status: 401 });
  }

  const slugsParam = new URL(request.url).searchParams.get('slugs') || '';
  const slugs = slugsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    // Bounded so a signed-in caller cannot turn this into a bulk export of the
    // whole projection table in one request.
    .slice(0, 12);

  if (!slugs.length) {
    return NextResponse.json({ error: 'Provide ?slugs=' }, { status: 400 });
  }

  const xPts = await getXptsBySlugs(slugs);
  return NextResponse.json({ locked: false, xPts });
}

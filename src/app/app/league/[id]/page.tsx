import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLeagueAppData } from '../../_lib/league-data';
import { LeagueDetailClient } from '../../_components/LeagueDetailClient';
import { FPLApiService } from '@/services/fpl-api';

interface PageProps {
  params: { id: string };
  searchParams: { teamId?: string };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  const leagueId = parseInt(id);
  const teamId = sp.teamId ? parseInt(sp.teamId) : undefined;
  if (isNaN(leagueId)) return { title: 'League — FPL Ranker' };
  try {
    // Light call (no per-manager history) — just name + focus rank for the card.
    const standings = await new FPLApiService().getLeagueStandings(leagueId);
    const name = standings.league?.name || 'Mini-League';
    const results: any[] = standings.standings?.results || [];
    const focus = teamId ? results.find((r) => r.entry === teamId) : undefined;
    const size = results.length;

    const title = focus
      ? `${focus.entry_name} is ${ordinal(focus.rank)} of ${size} in ${name} — FPL Ranker`
      : `${name} — FPL Ranker`;
    const description = focus
      ? `${focus.entry_name} sits ${ordinal(focus.rank)} in ${name}. See the live standings, ESPN-style headlines and rank analytics — and can you beat them?`
      : `Standings, ESPN-style headlines and rank analytics for ${name}.`;
    const ogUrl = `/api/og/league?id=${leagueId}${teamId ? `&teamId=${teamId}` : ''}`;

    return {
      title,
      description,
      openGraph: { title, description, images: [{ url: ogUrl, width: 1200, height: 630 }] },
      twitter: { card: 'summary_large_image', title, description, images: [ogUrl] },
    };
  } catch {
    return { title: 'League — FPL Ranker' };
  }
}

export default async function AppLeaguePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { teamId } = await searchParams;
  const leagueId = parseInt(id);
  if (isNaN(leagueId)) notFound();

  let data;
  try {
    data = await getLeagueAppData(leagueId, teamId ? parseInt(teamId) : undefined);
  } catch (e) {
    console.error('Failed to load /app league data:', e);
    return (
      <div className="app-scroll" style={{ paddingTop: 40 }}>
        <div className="scr-head"><div className="scr-title">LEAGUE UNAVAILABLE</div></div>
        <p style={{ fontFamily: 'var(--body)', color: 'var(--t2)', fontSize: 14, lineHeight: 1.5, marginTop: 12 }}>
          We couldn&rsquo;t load league <b>{leagueId}</b> right now. Check the ID and try again — the FPL API may also be busy.
        </p>
        <a className="s-btn s-btn--red hex" href="/app" style={{ marginTop: 18, textDecoration: 'none' }}>Back to start</a>
      </div>
    );
  }

  if (!data.managers.length) notFound();
  return <LeagueDetailClient data={data} />;
}

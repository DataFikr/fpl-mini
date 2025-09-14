import { notFound } from 'next/navigation';
import { FPLApiService } from '@/services/fpl-api';
import { LeaguePageClient } from './league-page-client';

interface LeaguePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: LeaguePageProps) {
  const resolvedParams = await params;
  const leagueId = parseInt(resolvedParams.id);

  if (isNaN(leagueId)) {
    return {
      title: 'League Not Found - FPL League Hub'
    };
  }

  try {
    const fplApi = new FPLApiService();
    const leagueStandings = await Promise.race([
      fplApi.getLeagueStandings(leagueId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]) as any;

    return {
      title: `${leagueStandings.league.name} - FPL League Hub`,
      description: `View detailed analysis for ${leagueStandings.league.name} - track rank progression, standings, and team performance across gameweeks.`
    };
  } catch {
    return {
      title: 'League Dashboard - FPL League Hub'
    };
  }
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  const resolvedParams = await params;
  const leagueId = parseInt(resolvedParams.id);

  if (isNaN(leagueId)) {
    notFound();
  }

  try {
    const fplApi = new FPLApiService();
    const leagueStandings = await Promise.race([
      fplApi.getLeagueStandings(leagueId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('League data timeout')), 8000))
    ]) as any;

    // Transform FPL API data to match expected format
    const league = {
      id: leagueId,
      name: leagueStandings.league.name,
      currentGameweek: 3, // Simplified
      standings: leagueStandings.standings.results.map((entry: any) => ({
        teamId: entry.entry,
        teamName: entry.entry_name,
        managerName: entry.player_name,
        rank: entry.rank,
        points: entry.total,
        gameweekPoints: entry.event_total || 0
      }))
    };

    const topTeams = league.standings.slice(0, 3);
    const averagePoints = league.standings.length > 0 
      ? Math.round(league.standings.reduce((sum, team) => sum + team.points, 0) / league.standings.length)
      : 0;

    return (
      <LeaguePageClient 
        leagueId={leagueId}
        league={league}
        topTeams={topTeams}
        averagePoints={averagePoints}
      />
    );
  } catch (error) {
    console.error('Error loading league data:', error);
    notFound();
  }
}


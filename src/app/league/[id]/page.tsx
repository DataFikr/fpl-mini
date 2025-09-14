import { notFound } from 'next/navigation';
import { TeamService } from '@/services/team-service';
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
    const teamService = new TeamService();
    const league = await teamService.syncLeagueData(leagueId);
    
    return {
      title: `${league.name} - FPL League Hub`,
      description: `View detailed analysis for ${league.name} - track rank progression, standings, and team performance across gameweeks.`
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
    const teamService = new TeamService();
    const league = await teamService.syncLeagueData(leagueId);

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


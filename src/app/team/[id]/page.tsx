import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FPLApiService } from '@/services/fpl-api';
import TeamPageClient from '@/components/team/team-page-client';

interface TeamPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: TeamPageProps) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.id);
    const fplApi = new FPLApiService();

    try {
      const managerData = await Promise.race([
        fplApi.getManagerEntry(teamId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]) as any;

      const teamName = managerData.name || `Team ${teamId}`;
      const managerName = `${managerData.player_first_name || ''} ${managerData.player_last_name || ''}`.trim();

      return {
        title: `${teamName} - FPL Dashboard | FPLRanker`,
        description: `${teamName} managed by ${managerName}. View pitch, transfers, captain analysis, and post-match insights.`
      };
    } catch {
      return {
        title: `Team ${teamId} - FPL Dashboard | FPLRanker`,
        description: `Fantasy Premier League team ${teamId} dashboard with pitch view, transfer impact, and match analysis.`
      };
    }
  } catch {
    return {
      title: 'FPL Team Dashboard | FPLRanker',
      description: 'Fantasy Premier League team dashboard.'
    };
  }
}

async function fetchBasicTeamData(teamId: number) {
  try {
    const fplApi = new FPLApiService();

    const [managerData, currentGameweek] = await Promise.all([
      Promise.race([
        fplApi.getManagerEntry(teamId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
      ]) as Promise<any>,
      fplApi.getCurrentGameweek(),
    ]);

    return {
      name: managerData.name || `Team ${teamId}`,
      managerName: `${managerData.player_first_name || ''} ${managerData.player_last_name || ''}`.trim() || 'FPL Manager',
      favouriteTeam: managerData.favourite_team || null,
      currentGameweek,
    };
  } catch (error) {
    console.error(`Failed to fetch basic data for team ${teamId}:`, error);
    return {
      name: `Team ${teamId}`,
      managerName: 'FPL Manager',
      favouriteTeam: null,
      currentGameweek: 6,
    };
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.id);

    if (isNaN(teamId)) {
      notFound();
    }

    const initialData = await fetchBasicTeamData(teamId);

    return <TeamPageClient teamId={teamId} initialData={initialData} />;
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark flex items-center justify-center p-8">
        <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 max-w-lg text-center border border-red-500/20">
          <h1 className="text-2xl font-jakarta font-bold text-red-400 mb-4">Error</h1>
          <p className="text-fpl-text-secondary font-inter mb-4">
            Failed to load team page: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Link href="/" className="inline-block px-6 py-2 bg-fpl-accent/20 text-fpl-accent rounded-fpl hover:bg-fpl-accent/30 transition-colors font-jakarta">
            Go Home
          </Link>
        </div>
      </div>
    );
  }
}

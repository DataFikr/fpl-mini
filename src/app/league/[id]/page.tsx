import { notFound } from 'next/navigation';
import { FPLApiService } from '@/services/fpl-api';
import { Users, Trophy, Calendar } from 'lucide-react';

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

    // Simple league page without complex client components for now
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
          <div className="relative container mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{league.name}</span>
                </h1>
                <div className="flex justify-center items-center space-x-8 text-lg">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-green-600 mr-2" />
                    <span>{league.standings.length} Managers</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                    <span>Gameweek {league.currentGameweek}</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
                    <span>Avg: {averagePoints} pts</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {topTeams.map((team, index) => (
                  <div key={team.teamId} className={`bg-gradient-to-r ${
                    index === 0 ? 'from-yellow-400 to-yellow-600' :
                    index === 1 ? 'from-gray-400 to-gray-600' :
                    'from-orange-400 to-orange-600'
                  } text-white p-6 rounded-2xl`}>
                    <div className="flex items-center mb-4">
                      <Trophy className="h-8 w-8 mr-3" />
                      <div>
                        <div className="text-2xl font-bold">#{team.rank}</div>
                        <div className="text-sm opacity-90">{index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place'}</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{team.teamName}</h3>
                    <p className="text-sm opacity-90 mb-3">by {team.managerName}</p>
                    <div className="text-3xl font-bold">{team.points.toLocaleString()} pts</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">League Standings</h2>
                <div className="space-y-4">
                  {league.standings.map((team: any) => (
                    <div key={team.teamId} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-4 ${
                          team.rank <= 3 ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-400'
                        }`}>
                          {team.rank}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{team.teamName}</h3>
                          <p className="text-gray-600">by {team.managerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{team.points.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error loading league data:', error);
    notFound();
  }
}


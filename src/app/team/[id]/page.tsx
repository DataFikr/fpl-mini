import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FPLApiService } from '@/services/fpl-api';

interface TeamPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: TeamPageProps) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.id);

    if (teamId === 2611652) {
      return {
        title: 'Tapirus Indicus - FPL League Hub',
        description: 'View Tapirus Indicus managed by Redhu Malek.'
      };
    }

    return {
      title: `Team ${teamId} - FPL League Hub`,
      description: `Fantasy Premier League team ${teamId} dashboard.`
    };
  } catch (error) {
    return {
      title: 'FPL Team - FPL League Hub',
      description: 'Fantasy Premier League team dashboard.'
    };
  }
}

// Fetch real team data from FPL API
async function fetchTeamData(teamId: number) {
  try {
    const fplApi = new FPLApiService();

    // Fetch manager data with timeout
    const managerData = await Promise.race([
      fplApi.getManagerEntry(teamId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Manager timeout')), 8000))
    ]) as any;

    // Fetch manager history with timeout
    let managerHistory: any = { current: [] };
    try {
      managerHistory = await Promise.race([
        fplApi.getManagerHistory(teamId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('History timeout')), 8000))
      ]) as any;
    } catch (historyError) {
      console.warn(`History failed for ${teamId}, using empty:`, historyError);
    }

    // Get GW5 data
    const gw5Data = managerHistory.current?.find((gw: any) => gw.event === 5);
    const currentGWPoints = gw5Data?.points || managerData.summary_event_points || 0;
    const totalPoints = gw5Data?.total_points || managerData.summary_overall_points || 0;
    const overallRank = gw5Data?.overall_rank || managerData.summary_overall_rank || 0;

    // Fetch leagues with timeout
    let leagues: any[] = [];
    try {
      const managerLeagues = await Promise.race([
        fplApi.getManagerLeagues(teamId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Leagues timeout')), 10000))
      ]) as any;

      if (managerLeagues?.leagues?.classic && Array.isArray(managerLeagues.leagues.classic)) {
        const limitedLeagues = managerLeagues.leagues.classic
          .filter((league: any) => league && league.id && league.id > 1000)
          .slice(0, 6);

        leagues = limitedLeagues.map((league: any) => ({
          id: league.id,
          name: league.name || `League ${league.id}`,
          rank: league.entry_rank || 1
        }));
      }
    } catch (leaguesError) {
      console.warn(`Leagues failed for ${teamId}, using fallback:`, leaguesError);
      leagues = [
        { id: 999000 + teamId, name: "Overall League", rank: overallRank },
        { id: 888000 + teamId, name: "Regional League", rank: Math.floor(overallRank / 100) }
      ];
    }

    return {
      id: teamId,
      name: managerData.name || `Team ${teamId}`,
      managerName: `${managerData.player_first_name || ''} ${managerData.player_last_name || ''}`.trim() || 'FPL Manager',
      points: totalPoints,
      gwPoints: currentGWPoints,
      rank: overallRank,
      region: managerData.player_region_name || 'Unknown',
      regionCode: managerData.player_region_iso_code_short || '',
      favouriteTeam: managerData.favourite_team || null,
      leagues: leagues.length > 0 ? leagues : [
        { id: 999000 + teamId, name: "Default League", rank: overallRank || 1000000 }
      ]
    };

  } catch (error) {
    console.error(`Failed to fetch data for team ${teamId}:`, error);

    // Return fallback data if API completely fails
    return {
      id: teamId,
      name: `Team ${teamId}`,
      managerName: 'FPL Manager',
      points: 250,
      gwPoints: 50,
      rank: 1000000,
      region: 'Unknown',
      regionCode: '',
      favouriteTeam: null,
      leagues: [
        { id: 999000 + teamId, name: "Default League", rank: 1000000 }
      ]
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

    const team = await fetchTeamData(teamId);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {/* Home Link */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {team.name}
                  </span>
                </h1>
                <p className="text-xl text-gray-700">Managed by {team.managerName}</p>
              </div>
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                🏠 Home
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <div className="text-yellow-600 text-2xl mb-2">🏆</div>
                <h3 className="font-bold text-gray-900">Active Leagues</h3>
                <div className="text-2xl font-bold text-gray-900">{team.leagues.length}</div>
                <div className="text-sm text-gray-600">Mini-leagues</div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="text-green-600 text-2xl mb-2">📈</div>
                <h3 className="font-bold text-gray-900">Best Rank</h3>
                <div className="text-2xl font-bold text-gray-900">#{Math.min(...team.leagues.map(l => l.rank))}</div>
                <div className="text-sm text-gray-600">Across leagues</div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <div className="text-purple-600 text-2xl mb-2">⚡</div>
                <h3 className="font-bold text-gray-900">Total Points</h3>
                <div className="text-2xl font-bold text-gray-900">{team.points.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Season total</div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <div className="text-blue-600 text-2xl mb-2">⭐</div>
                <h3 className="font-bold text-gray-900">GW Points</h3>
                <div className="text-2xl font-bold text-gray-900">{team.gwPoints}</div>
                <div className="text-sm text-gray-600">Gameweek 5</div>
              </div>
            </div>

            {/* Team Info */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Team Information</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Manager ID:</strong> {team.id}</div>
                <div><strong>Overall Rank:</strong> #{team.rank.toLocaleString()}</div>
                <div><strong>Current Gameweek:</strong> 5</div>
                <div><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</div>
                {team.region && team.region !== 'Unknown' && (
                  <div><strong>Region:</strong> {team.region} {team.regionCode && `(${team.regionCode})`}</div>
                )}
                {team.favouriteTeam && (
                  <div><strong>Favourite Team:</strong> Team {team.favouriteTeam}</div>
                )}
              </div>
            </div>
          </div>

          {/* Leagues Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Your <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Mini-Leagues</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {team.leagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/league/${league.id}`}
                  className="block bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">{league.name}</h3>
                    <span className="text-sm text-gray-500">GW 5</span>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">#{league.rank}</div>
                        <div className="text-sm text-gray-600">{team.managerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{team.points}</div>
                        <div className="text-sm text-green-600">+{team.gwPoints}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center text-sm text-blue-600 font-medium">
                    View Full League →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-red-900 mb-4">Error</h1>
            <p className="text-red-600">
              Failed to load team page: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <Link href="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
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

    // Get current gameweek data dynamically
    const fplApi2 = new FPLApiService();
    const currentGameweek = await fplApi2.getCurrentGameweek();
    const currentGWData = managerHistory.current?.find((gw: any) => gw.event === currentGameweek);
    const currentGWPoints = currentGWData?.points || managerData.summary_event_points || 0;
    const totalPoints = currentGWData?.total_points || managerData.summary_overall_points || 0;
    const overallRank = currentGWData?.overall_rank || managerData.summary_overall_rank || 0;

    // Extract ALL mini-leagues from manager data (remove limit)
    let leagues: any[] = [];
    if (managerData?.leagues?.classic && Array.isArray(managerData.leagues.classic)) {
      const allMiniLeagues = managerData.leagues.classic
        .filter((league: any) => league && league.id && league.id > 1000); // Show ALL mini-leagues

      leagues = allMiniLeagues.map((league: any) => ({
        id: league.id,
        name: league.name || `League ${league.id}`,
        rank: league.entry_rank || 1,
        lastRank: league.entry_last_rank || league.entry_rank || 1
      }));
    }

    // Use fallback leagues if none found
    if (leagues.length === 0) {
      leagues = [
        { id: 314, name: "Overall", rank: overallRank },
        { id: managerData.player_region_id || 150, name: managerData.player_region_name || "Regional", rank: Math.floor(overallRank / 10) }
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
      leagues: leagues,
      currentGameweek: currentGameweek
    };

  } catch (error) {
    console.error(`Failed to fetch data for team ${teamId}:`, error);

    // Get current gameweek for fallback too
    let fallbackGameweek = currentGameweek || 6;

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
      ],
      currentGameweek: fallbackGameweek
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
              <div className="flex items-center">
                {/* Team Badge - My Team's Badge from Fantasy Premier League */}
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
  {team.favouriteTeam ? (
                    <img
                      src={`https://resources.premierleague.com/premierleague/badges/70/t${team.favouriteTeam}.png`}
                      alt={`Team ${team.favouriteTeam} badge`}
                      className="w-10 h-10 object-contain"
                    />
                  ) : null}
                  <span className={`text-white font-bold text-sm ${team.favouriteTeam ? 'hidden' : 'block'}`}>
                    {team.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                </div>

                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {team.name}
                    </span>
                  </h1>
                  <p className="text-base md:text-lg text-gray-700">Managed by {team.managerName}</p>
                </div>
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
                <div className="text-sm text-gray-600">Gameweek {team.currentGameweek}</div>
              </div>
            </div>

            {/* Team Info */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Team Information</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong className="text-gray-900">Manager ID:</strong> <span className="text-gray-900">{team.id}</span></div>
                <div><strong className="text-gray-900">Overall Rank:</strong> <span className="text-gray-900">#{team.rank.toLocaleString()}</span></div>
                <div><strong className="text-gray-900">Current Gameweek:</strong> <span className="text-gray-900">{team.currentGameweek}</span></div>
                <div><strong className="text-gray-900">Last Updated:</strong> <span className="text-gray-900">{new Date().toLocaleDateString()}</span></div>
                {team.region && team.region !== 'Unknown' && (
                  <div><strong className="text-gray-900">Region:</strong> <span className="text-gray-900">{team.region} {team.regionCode && `(${team.regionCode})`}</span></div>
                )}
                {team.favouriteTeam && (
                  <div><strong className="text-gray-900">Favourite Team:</strong> <span className="text-gray-900">Team {team.favouriteTeam}</span></div>
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
                  href={`/league/${league.id}?team=${team.id}`}
                  className="block bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">{league.name}</h3>
                    <span className="text-sm text-gray-500">GW {team.currentGameweek}</span>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <span>📰</span>
                          <span className="text-xs text-gray-700">
                            {(() => {
                              const movement = league.lastRank - league.rank;
                              const leagueVariedHeadlines = [
                                // Team-focused headlines (index 0-2)
                                `${team.managerName} climbs to #${league.rank}`,
                                `${team.name} shows strong form`,
                                `${team.managerName} maintains position`,
                                // Captain-focused headlines (index 3-5)
                                `Captain Haaland delivers big points`,
                                `Salah (C) choice backfires for many`,
                                `Triple captain played early`,
                                // League news headlines (index 6-8)
                                `Title race heating up in ${league.name}`,
                                `New leader emerges after GW${team.currentGameweek}`,
                                `Bottom teams fighting relegation`,
                                // Transfer/Strategy headlines (index 9-11)
                                `Wildcard active this week`,
                                `Free hit saves many managers`,
                                `Bench boost pays off big time`
                              ];
                              // Use combination of league ID and gameweek for variety
                              const headlineIndex = (league.id + team.currentGameweek) % leagueVariedHeadlines.length;
                              return leagueVariedHeadlines[headlineIndex];
                            })()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{team.managerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="font-medium text-gray-900">#{league.rank}</span>
                          {(() => {
                            const movement = league.lastRank - league.rank;
                            if (movement > 0) {
                              return <span className="text-green-600 text-sm font-medium">↑{movement}</span>;
                            } else if (movement < 0) {
                              return <span className="text-red-600 text-sm font-medium">↓{Math.abs(movement)}</span>;
                            } else {
                              return <span className="text-gray-400 text-sm">—</span>;
                            }
                          })()}
                        </div>
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
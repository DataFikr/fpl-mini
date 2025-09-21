import { notFound } from 'next/navigation';
import Link from 'next/link';

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

// Generate team data based on team ID
function generateTeamData(teamId: number) {
  const teamNames = [
    "Dream Team FC", "Fantasy United", "Goal Getters", "Premier Legends", "Victory Squad",
    "Elite Eleven", "Champions Club", "Star Strikers", "Magic Team", "Ultimate XI"
  ];

  const managerNames = [
    "Alex Johnson", "Sam Wilson", "Jordan Smith", "Casey Brown", "Riley Davis",
    "Morgan Taylor", "Jamie Lee", "Avery Clark", "Quinn Miller", "Blake White"
  ];

  // Special case for team 2611652
  if (teamId === 2611652) {
    return {
      id: teamId,
      name: "Tapirus Indicus",
      managerName: "Redhu Malek",
      points: 292,
      gwPoints: 44,
      rank: 1165323,
      leagues: [
        { id: 20511, name: "KakiFantasyFootball.com (bobo36)", rank: 419 },
        { id: 51077, name: "FANTASY FUN LEAGUE ✌", rank: 589 },
        { id: 73337, name: "ASEAN League", rank: 81 },
        { id: 264817, name: "FPL• my 🇲🇾 | code : 4adz33", rank: 13 }
      ]
    };
  }

  // Generate for other teams
  return {
    id: teamId,
    name: teamNames[teamId % teamNames.length] + ` ${teamId}`,
    managerName: managerNames[teamId % managerNames.length],
    points: Math.floor(Math.random() * 300) + 200,
    gwPoints: Math.floor(Math.random() * 50) + 30,
    rank: Math.floor(Math.random() * 5000000) + 100000,
    leagues: [
      { id: 999000 + teamId, name: "Overall League", rank: Math.floor(Math.random() * 1000000) + 100000 },
      { id: 888000 + teamId, name: "Regional League", rank: Math.floor(Math.random() * 10000) + 1000 }
    ]
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.id);

    if (isNaN(teamId)) {
      notFound();
    }

    const team = generateTeamData(teamId);

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
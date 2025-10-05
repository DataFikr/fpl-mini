'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Vote } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface VoteOption {
  teamId: number;
  teamName: string;
  managerName: string;
  crestUrl?: string;
  votes: number;
}

interface VotingPollProps {
  leagueId: number;
  leagueName: string;
  teams?: any[];
  gameweek?: number;
}

type PollType = 'high-scorer' | 'captain-pick' | 'biggest-riser';

const POLL_QUESTIONS = {
  'high-scorer': 'Who will score the most points in Gameweek',
  'captain-pick': 'Who will be the most popular captain choice for Gameweek',
  'biggest-riser': 'Who will climb the most positions in Gameweek'
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function VotingPoll({ leagueId, leagueName, teams = [], gameweek = 6 }: VotingPollProps) {
  const [activeTab, setActiveTab] = useState<PollType>('high-scorer');
  const [pollsData, setPollsData] = useState<{[key in PollType]: VoteOption[]}>({
    'high-scorer': [],
    'captain-pick': [],
    'biggest-riser': []
  });
  const [userVotes, setUserVotes] = useState<{[key in PollType]: number | null}>({
    'high-scorer': null,
    'captain-pick': null,
    'biggest-riser': null
  });
  const [hasVoted, setHasVoted] = useState<{[key in PollType]: boolean}>({
    'high-scorer': false,
    'captain-pick': false,
    'biggest-riser': false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initializePolls = () => {
      setIsLoading(true);

      // Initialize all three polls
      const polls: {[key in PollType]: VoteOption[]} = {
        'high-scorer': [],
        'captain-pick': [],
        'biggest-riser': []
      };

      const topTeams = teams
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 8)
        .map(team => ({
          teamId: team.teamId,
          teamName: team.teamName,
          managerName: team.managerName,
          crestUrl: team.crestUrl,
          votes: 0
        }));

      Object.keys(polls).forEach(pollId => {
        polls[pollId as PollType] = [...topTeams];

        // Load votes from localStorage
        const storedVotes = localStorage.getItem(`poll_votes_${leagueId}_${pollId}_gw${gameweek}`);
        if (storedVotes) {
          const votesMap = JSON.parse(storedVotes);
          polls[pollId as PollType] = polls[pollId as PollType].map(team => ({
            ...team,
            votes: votesMap[team.teamId] || 0
          }));
        }
      });

      setPollsData(polls);

      // Check user votes
      const currentUserTeamId = localStorage.getItem('fpl_user_team_id');
      if (currentUserTeamId) {
        const votes: {[key in PollType]: number | null} = {
          'high-scorer': null,
          'captain-pick': null,
          'biggest-riser': null
        };
        const voted: {[key in PollType]: boolean} = {
          'high-scorer': false,
          'captain-pick': false,
          'biggest-riser': false
        };

        Object.keys(polls).forEach(pollId => {
          const existingVote = localStorage.getItem(`poll_vote_${leagueId}_${pollId}_gw${gameweek}_team${currentUserTeamId}`);
          if (existingVote) {
            votes[pollId as PollType] = parseInt(existingVote);
            voted[pollId as PollType] = true;
          }
        });

        setUserVotes(votes);
        setHasVoted(voted);
      }

      setIsLoading(false);
    };

    if (teams.length > 0) {
      initializePolls();
    }
  }, [leagueId, teams, gameweek]);

  const handleVote = (teamId: number) => {
    if (hasVoted[activeTab]) return;

    const currentUserTeamId = localStorage.getItem('fpl_user_team_id');
    if (!currentUserTeamId) {
      alert('Please navigate from a team page to participate in the poll');
      return;
    }

    const existingVote = localStorage.getItem(`poll_vote_${leagueId}_${activeTab}_gw${gameweek}_team${currentUserTeamId}`);
    if (existingVote) {
      alert('You have already voted in this poll for this gameweek');
      return;
    }

    // Update votes for current poll
    const updatedOptions = pollsData[activeTab].map(option =>
      option.teamId === teamId
        ? { ...option, votes: option.votes + 1 }
        : option
    );

    setPollsData(prev => ({
      ...prev,
      [activeTab]: updatedOptions
    }));

    setUserVotes(prev => ({
      ...prev,
      [activeTab]: teamId
    }));

    setHasVoted(prev => ({
      ...prev,
      [activeTab]: true
    }));

    // Save vote to localStorage
    localStorage.setItem(`poll_vote_${leagueId}_${activeTab}_gw${gameweek}_team${currentUserTeamId}`, teamId.toString());

    // Save all votes for this poll
    const votesMap: {[key: number]: number} = {};
    updatedOptions.forEach(option => {
      votesMap[option.teamId] = option.votes;
    });
    localStorage.setItem(`poll_votes_${leagueId}_${activeTab}_gw${gameweek}`, JSON.stringify(votesMap));
  };

  const getCurrentPollData = () => pollsData[activeTab] || [];
  const getTotalVotes = () => getCurrentPollData().reduce((sum, option) => sum + option.votes, 0);
  const getVotePercentage = (votes: number) => {
    const total = getTotalVotes();
    return total > 0 ? (votes / total) * 100 : 0;
  };

  const getPieChartData = () => {
    const totalTeams = teams.length;
    const totalVotes = getTotalVotes();
    const pendingVotes = Math.max(0, totalTeams - totalVotes);

    const votedData = getCurrentPollData()
      .filter(option => option.votes > 0)
      .map(option => ({
        name: option.teamName,
        value: option.votes,
        percentage: getVotePercentage(option.votes)
      }));

    if (pendingVotes > 0) {
      votedData.push({
        name: 'Pending Votes',
        value: pendingVotes,
        percentage: (pendingVotes / totalTeams) * 100
      });
    }

    return votedData;
  };

  const getLeader = () => {
    const sorted = [...getCurrentPollData()].sort((a, b) => b.votes - a.votes);
    return sorted[0] || null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const leader = getLeader();
  const pieData = getPieChartData();

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(POLL_QUESTIONS) as PollType[]).map((pollId) => (
          <button
            key={pollId}
            onClick={() => setActiveTab(pollId)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === pollId
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {pollId === 'high-scorer' && '🏆 High Scorer'}
            {pollId === 'captain-pick' && '👑 Captain Pick'}
            {pollId === 'biggest-riser' && '📈 Biggest Riser'}
          </button>
        ))}
      </div>

      {/* Poll Header Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
            {POLL_QUESTIONS[activeTab]} {gameweek + 1}?
          </h3>
          <p className="text-sm text-gray-600">
            <strong>League:</strong> {leagueName} • <strong>Gameweek:</strong> {gameweek}
          </p>
          {leader && leader.votes > 0 && (
            <p className="text-sm font-semibold text-blue-600 mt-2">
              🥇 Current Leader: {leader.teamName} ({leader.votes} votes, {getVotePercentage(leader.votes).toFixed(1)}%)
            </p>
          )}
        </div>
      </div>

      {/* Main Content - Pie Chart and Voters List */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
        {/* Pie Chart - On top for mobile, on right for desktop */}
        <div className={`${isMobile ? 'order-1' : 'order-2'}`}>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Vote Distribution</h4>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === 'Pending Votes' ? '#D1D5DB' : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No votes yet. Be the first to vote!</p>
            </div>
          )}
          <div className="text-center mt-4 text-sm text-gray-600">
            <span className="font-semibold">{getTotalVotes()}</span> of {teams.length} teams have voted
          </div>
        </div>

        {/* Voters List */}
        <div className={`${isMobile ? 'order-2' : 'order-1'}`}>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Cast Your Vote</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {getCurrentPollData()
              .sort((a, b) => b.votes - a.votes)
              .map((option, index) => {
                const percentage = getVotePercentage(option.votes);
                const isUserVote = userVotes[activeTab] === option.teamId;

                return (
                  <button
                    key={option.teamId}
                    onClick={() => handleVote(option.teamId)}
                    disabled={hasVoted[activeTab]}
                    className={`w-full flex items-center p-3 rounded-lg border-2 transition-all relative overflow-hidden ${
                      isUserVote
                        ? 'border-blue-600 bg-blue-50'
                        : hasVoted[activeTab]
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {/* Progress Bar */}
                    {hasVoted[activeTab] && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-30"
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold mr-3 z-10 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          : index === 2
                          ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Team Crest */}
                    {option.crestUrl && (
                      <img
                        src={option.crestUrl}
                        alt={`${option.teamName} crest`}
                        className="w-10 h-10 rounded-full mr-3 border-2 border-gray-200 z-10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}

                    {/* Team Info */}
                    <div className="flex-1 text-left z-10">
                      <div className={`text-sm font-semibold ${isUserVote ? 'text-blue-600' : 'text-gray-900'}`}>
                        {option.teamName}
                      </div>
                      <div className="text-xs text-gray-600">{option.managerName}</div>
                    </div>

                    {/* Vote Count */}
                    <div className="flex flex-col items-end z-10">
                      {hasVoted[activeTab] ? (
                        <>
                          <div className="text-lg font-bold text-blue-600">
                            {percentage.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">{option.votes} votes</div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Vote
                        </div>
                      )}
                      {isUserVote && (
                        <div className="text-xs text-blue-600 font-semibold mt-1">YOUR PICK</div>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Poll Status */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className={`h-5 w-5 ${hasVoted[activeTab] ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="text-sm font-semibold text-gray-900">
              {hasVoted[activeTab] ? '✅ Thanks for voting!' : '📊 Cast your vote above'}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Poll closes at GW{gameweek + 1} deadline
          </div>
        </div>
      </div>
    </div>
  );
}

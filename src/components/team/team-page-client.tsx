'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Crown, Target, ArrowRightLeft,
  BarChart3, Users, ChevronDown, ChevronUp, Shield, X,
  Zap, Trophy, AlertTriangle, Medal, Calendar
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// ─── Types ──────────────────────────────────────────────────

interface PlayerData {
  id: number;
  name: string;
  team: string;
  teamCode: number;
  points: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  multiplier: number;
  status?: string;
  minutes?: number;
  ownership?: number;
  xG?: string;
  xA?: string;
  bonus?: number;
  bps?: number;
  goals?: number;
  assists?: number;
  cleanSheet?: number;
  saves?: number;
  yellowCards?: number;
  redCards?: number;
}

interface DashboardData {
  teamId: number;
  teamName: string;
  managerName: string;
  favouriteTeam: number | null;
  region: string;
  currentGameweek: number;
  averageScore: number;
  header: {
    gwPoints: number;
    totalPoints: number;
    overallRank: number;
    prevOverallRank: number;
    gwRank: number;
    captainPoints: number;
    captainName: string;
    averageScore: number;
    pointsAboveAvg: number;
    transfersCost: number;
    transfersCount: number;
    benchPoints: number;
    leagues: { id: number; name: string; rank: number; lastRank: number }[];
  };
  squad: {
    starting: Record<string, PlayerData[]>;
    subs: PlayerData[];
    captain: PlayerData | null;
    viceCaptain: PlayerData | null;
    totalPoints: number;
    activeChip: string | null;
    entryHistory: any;
  } | null;
  transfers: {
    count: number;
    cost: number;
    details: {
      playerIn: { id: number; name: string; team: string; teamCode: number; points: number; cost: number };
      playerOut: { id: number; name: string; team: string; teamCode: number; points: number; cost: number };
      time: string;
    }[];
    totalPointsIn: number;
    totalPointsOut: number;
  };
  analysis: {
    captainName: string;
    captainPoints: number;
    captainBasePoints: number;
    benchPoints: number;
    differentials: PlayerData[];
    activeChip: string | null;
  };
}

interface LeaderboardEntry {
  rank: number;
  teamName: string;
  managerName: string;
  entryId: number;
  totalPoints: number;
  eventTotal: number;
}

interface MonthlyLeaderboard {
  phaseId: number;
  phaseName: string;
  startEvent: number;
  stopEvent: number;
  top3: LeaderboardEntry[];
}

interface LeagueLeaderboard {
  leagueId: number;
  leagueName: string;
  months: MonthlyLeaderboard[];
}

interface LeaderboardData {
  teamId: number;
  phases: { id: number; name: string; startEvent: number; stopEvent: number }[];
  leagueLeaderboards: LeagueLeaderboard[];
}

interface TeamPageClientProps {
  teamId: number;
  initialData: {
    name: string;
    managerName: string;
    favouriteTeam: number | null;
    currentGameweek: number;
  };
}

// ─── Main Component ─────────────────────────────────────────

export default function TeamPageClient({ teamId, initialData }: TeamPageClientProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'team' | 'transfers' | 'analysis' | 'rivals' | 'leaderboard'>('team');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<number>(0);

  useEffect(() => {
    fetchDashboard();
  }, [teamId]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}/dashboard`);
      if (res.ok) {
        const dashData = await res.json();
        setData(dashData);
      }
    } catch (error) {
      console.warn('Failed to fetch dashboard:', error);
    }
    setIsLoading(false);
  };

  const fetchLeaderboard = async () => {
    if (leaderboardData) return; // Already fetched
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/leaderboard`);
      if (res.ok) {
        const lbData = await res.json();
        setLeaderboardData(lbData);
        if (lbData.leagueLeaderboards?.length > 0) {
          setSelectedLeague(0);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch leaderboard:', error);
    }
    setLeaderboardLoading(false);
  };

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPerformanceGrade = (gwPoints: number, avg: number): { grade: string; color: string } => {
    const ratio = avg > 0 ? gwPoints / avg : 1;
    if (ratio >= 1.5) return { grade: 'A+', color: 'text-fpl-accent' };
    if (ratio >= 1.3) return { grade: 'A', color: 'text-fpl-accent' };
    if (ratio >= 1.1) return { grade: 'B+', color: 'text-green-400' };
    if (ratio >= 0.95) return { grade: 'B', color: 'text-yellow-400' };
    if (ratio >= 0.8) return { grade: 'C', color: 'text-orange-400' };
    if (ratio >= 0.6) return { grade: 'D', color: 'text-red-400' };
    return { grade: 'F', color: 'text-red-500' };
  };

  const getRankMovement = (current: number, previous: number) => {
    if (!previous || !current) return null;
    const diff = previous - current;
    if (diff > 0) return { direction: 'up' as const, amount: diff };
    if (diff < 0) return { direction: 'down' as const, amount: Math.abs(diff) };
    return { direction: 'same' as const, amount: 0 };
  };

  const tabs = [
    { key: 'team' as const, label: 'Team', icon: Shield },
    { key: 'transfers' as const, label: 'Transfers', icon: ArrowRightLeft },
    { key: 'analysis' as const, label: 'Analysis', icon: BarChart3 },
    { key: 'rivals' as const, label: 'Rivals', icon: Users },
    { key: 'leaderboard' as const, label: 'Leaderboard', icon: Medal },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fpl-accent mx-auto mb-4" />
          <p className="text-fpl-text-secondary font-inter">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-inter mb-4">Failed to load dashboard data</p>
          <button onClick={fetchDashboard} className="px-4 py-2 bg-fpl-accent/20 text-fpl-accent rounded-fpl hover:bg-fpl-accent/30 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { grade, color: gradeColor } = getPerformanceGrade(data.header.gwPoints, data.header.averageScore);
  const rankMove = getRankMovement(data.header.overallRank, data.header.prevOverallRank);

  // League movement summary
  const leaguesGained = data.header.leagues.filter(l => l.lastRank > l.rank).length;
  const leaguesLost = data.header.leagues.filter(l => l.lastRank < l.rank).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark">
      {/* Top Navigation */}
      <div className="backdrop-blur-fpl bg-fpl-dark/80 border-b border-fpl-primary/20 px-6 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/images/fplranker.png" alt="FPLRanker Logo" width={32} height={32} className="rounded-lg" />
            <Link href="/" className="font-jakarta font-bold text-white hover:text-fpl-accent transition-colors">FPLRanker</Link>
          </div>
          <Link href="/" className="px-4 py-2 text-fpl-text-secondary hover:text-white hover:bg-white/10 rounded-fpl transition-colors font-jakarta">
            Home
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* ═══════════════════════════════════════════════════
            SECTION 1: HEADER — "How Am I Doing?"
            ═══════════════════════════════════════════════════ */}
        <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-6 mb-6 border border-fpl-primary/20">
          {/* Team Identity */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-fpl-accent/30 to-fpl-primary/30 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {data.favouriteTeam ? (
                <img
                  src={`https://resources.premierleague.com/premierleague/badges/70/t${data.favouriteTeam}.png`}
                  alt="Team badge"
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {data.teamName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-jakarta font-bold text-gradient-primary truncate">{data.teamName}</h1>
              <p className="text-sm font-inter text-fpl-text-secondary">Managed by {data.managerName} · GW {data.currentGameweek}</p>
            </div>
            {/* Performance Grade */}
            <div className="flex-shrink-0 text-center">
              <div className={`text-3xl font-jakarta font-black ${gradeColor}`}>{grade}</div>
              <div className="text-xs text-fpl-text-secondary font-inter">GW Grade</div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* GW Points */}
            <div className="backdrop-blur-fpl bg-fpl-dark/60 p-4 rounded-fpl border border-fpl-accent/30 text-center">
              <div className="text-xs text-fpl-text-secondary font-inter mb-1">GW Points</div>
              <div className="text-2xl font-jakarta font-bold text-fpl-accent">{data.header.gwPoints}</div>
              {data.header.transfersCost > 0 && (
                <div className="text-xs text-red-400 font-inter">-{data.header.transfersCost} hit</div>
              )}
            </div>

            {/* Overall Rank */}
            <div className="backdrop-blur-fpl bg-fpl-dark/60 p-4 rounded-fpl border border-fpl-primary/30 text-center">
              <div className="text-xs text-fpl-text-secondary font-inter mb-1">Overall Rank</div>
              <div className="text-lg font-jakarta font-bold text-white">{data.header.overallRank.toLocaleString()}</div>
              {rankMove && rankMove.direction !== 'same' && (
                <div className={`text-xs font-inter flex items-center justify-center gap-1 ${rankMove.direction === 'up' ? 'text-fpl-accent' : 'text-red-400'}`}>
                  {rankMove.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {rankMove.amount.toLocaleString()}
                </div>
              )}
            </div>

            {/* Captain */}
            <div className="backdrop-blur-fpl bg-fpl-dark/60 p-4 rounded-fpl border border-yellow-500/30 text-center">
              <div className="text-xs text-fpl-text-secondary font-inter mb-1">Captain</div>
              <div className="text-lg font-jakarta font-bold text-yellow-400 flex items-center justify-center gap-1">
                <Crown className="w-4 h-4" />
                {data.header.captainPoints}
              </div>
              <div className="text-xs text-fpl-text-secondary font-inter truncate">{data.header.captainName}</div>
            </div>

            {/* League Rank */}
            <div className="backdrop-blur-fpl bg-fpl-dark/60 p-4 rounded-fpl border border-fpl-violet-500/30 text-center">
              <div className="text-xs text-fpl-text-secondary font-inter mb-1">Best League Rank</div>
              <div className="text-lg font-jakarta font-bold text-fpl-violet-400">
                #{data.header.leagues.length > 0 ? Math.min(...data.header.leagues.map(l => l.rank)) : '-'}
              </div>
              <div className="text-xs text-fpl-text-secondary font-inter">{data.header.leagues.length} leagues</div>
            </div>
          </div>

          {/* Drama Line */}
          <div className="flex flex-wrap gap-3">
            {data.header.pointsAboveAvg !== 0 && (
              <div className={`text-sm font-inter px-3 py-1.5 rounded-full ${
                data.header.pointsAboveAvg > 0
                  ? 'bg-fpl-accent/10 text-fpl-accent border border-fpl-accent/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {data.header.pointsAboveAvg > 0 ? '+' : ''}{data.header.pointsAboveAvg} vs average ({data.header.averageScore} pts)
              </div>
            )}
            {leaguesGained > 0 && (
              <div className="text-sm font-inter px-3 py-1.5 rounded-full bg-fpl-accent/10 text-fpl-accent border border-fpl-accent/20">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Gained places in {leaguesGained} league{leaguesGained > 1 ? 's' : ''}
              </div>
            )}
            {leaguesLost > 0 && (
              <div className="text-sm font-inter px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <TrendingDown className="w-3 h-3 inline mr-1" />
                Dropped in {leaguesLost} league{leaguesLost > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            TAB NAVIGATION
            ═══════════════════════════════════════════════════ */}
        <div className="flex gap-1 mb-6 backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-1 border border-fpl-primary/20 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); if (tab.key === 'leaderboard') fetchLeaderboard(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-jakarta font-medium text-sm transition-all flex-shrink-0 ${
                activeTab === tab.key
                  ? 'bg-fpl-accent/20 text-fpl-accent border border-fpl-accent/30'
                  : 'text-fpl-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════
            SECTION 2: PITCH VIEW (Team Tab)
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'team' && data.squad && (
          <div className="space-y-6">
            {/* Chip Banner */}
            {data.squad.activeChip && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-fpl p-3 text-center">
                <span className="text-yellow-400 font-jakarta font-bold uppercase text-sm">
                  {formatChipName(data.squad.activeChip)} Active
                </span>
              </div>
            )}

            {/* Interactive Pitch */}
            <div className="relative bg-gradient-to-b from-green-500 to-green-700 rounded-fpl mx-auto p-4 h-[480px] sm:h-[620px] lg:h-[680px] max-w-4xl overflow-hidden">
              {/* Pitch Markings */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect x="2" y="2" width="96" height="96" fill="none" stroke="white" strokeWidth="0.8" />
                  <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.6" />
                  <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="0.4" />
                  <circle cx="50" cy="50" r="0.5" fill="white" />
                  <rect x="20" y="2" width="60" height="18" fill="none" stroke="white" strokeWidth="0.6" />
                  <rect x="20" y="80" width="60" height="18" fill="none" stroke="white" strokeWidth="0.6" />
                  <rect x="35" y="2" width="30" height="8" fill="none" stroke="white" strokeWidth="0.6" />
                  <rect x="35" y="90" width="30" height="8" fill="none" stroke="white" strokeWidth="0.6" />
                  <circle cx="50" cy="12" r="0.5" fill="white" />
                  <circle cx="50" cy="88" r="0.5" fill="white" />
                </svg>
              </div>

              <div className="relative z-10 w-full h-full">
                {/* GKP */}
                <div className="absolute w-full flex justify-center" style={{ top: '8%', transform: 'translateY(-50%)' }}>
                  <div className="flex gap-4">
                    {(data.squad.starting.GKP || []).map((p, i) => (
                      <PitchPlayerCard key={i} player={p} onClick={() => setSelectedPlayer(p)} />
                    ))}
                  </div>
                </div>
                {/* DEF */}
                <div className="absolute w-full flex justify-center" style={{ top: '30%', transform: 'translateY(-50%)' }}>
                  <div className="flex gap-4 sm:gap-10 md:gap-12 justify-center" style={{ maxWidth: '98%' }}>
                    {(data.squad.starting.DEF || []).map((p, i) => (
                      <PitchPlayerCard key={i} player={p} onClick={() => setSelectedPlayer(p)} />
                    ))}
                  </div>
                </div>
                {/* MID */}
                <div className="absolute w-full flex justify-center" style={{ top: '55%', transform: 'translateY(-50%)' }}>
                  <div className="flex gap-4 sm:gap-10 md:gap-12 justify-center" style={{ maxWidth: '98%' }}>
                    {(data.squad.starting.MID || []).map((p, i) => (
                      <PitchPlayerCard key={i} player={p} onClick={() => setSelectedPlayer(p)} />
                    ))}
                  </div>
                </div>
                {/* FWD */}
                <div className="absolute w-full flex justify-center" style={{ top: '80%', transform: 'translateY(-50%)' }}>
                  <div className="flex gap-6 sm:gap-14 md:gap-18 justify-center">
                    {(data.squad.starting.FWD || []).map((p, i) => (
                      <PitchPlayerCard key={i} player={p} onClick={() => setSelectedPlayer(p)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Substitutes */}
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-4 border border-fpl-primary/20">
              <h3 className="text-sm font-jakarta font-semibold text-fpl-text-secondary mb-3 text-center uppercase tracking-wider">Substitutes</h3>
              <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
                {(data.squad.subs || []).map((p, i) => (
                  <PitchPlayerCard key={i} player={p} isSub onClick={() => setSelectedPlayer(p)} />
                ))}
              </div>
            </div>

            {/* Mini-Leagues Quick View */}
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-6 border border-fpl-primary/20">
              <h3 className="text-lg font-jakarta font-bold text-white mb-4">Your Mini-Leagues</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {data.header.leagues.map(league => {
                  const movement = league.lastRank - league.rank;
                  return (
                    <Link
                      key={league.id}
                      href={`/league/${league.id}?team=${teamId}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-fpl-dark/40 border border-fpl-primary/10 hover:border-fpl-accent/30 transition-all"
                    >
                      <span className="font-inter text-white text-sm truncate mr-2">{league.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-jakarta font-medium text-white">#{league.rank}</span>
                        {movement > 0 && <span className="text-fpl-accent text-xs">↑{movement}</span>}
                        {movement < 0 && <span className="text-red-400 text-xs">↓{Math.abs(movement)}</span>}
                        {movement === 0 && <span className="text-fpl-text-secondary text-xs">—</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            SECTION 3: TRANSFER IMPACT (Transfers Tab)
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'transfers' && (
          <div className="space-y-6">
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-6 border border-fpl-primary/20">
              <h2 className="text-xl font-jakarta font-bold text-white mb-2 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-fpl-accent" />
                GW {data.currentGameweek} Transfer Impact
              </h2>

              {data.transfers.count === 0 ? (
                <div className="text-center py-8">
                  <div className="text-fpl-text-secondary font-inter mb-2">No transfers made this gameweek</div>
                  <div className="text-sm text-fpl-text-secondary/60 font-inter">Free transfer banked</div>
                </div>
              ) : (
                <>
                  {/* Transfer Summary */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="px-3 py-1.5 rounded-full bg-fpl-primary/20 border border-fpl-primary/30 text-sm font-inter text-white">
                      {data.transfers.count} transfer{data.transfers.count > 1 ? 's' : ''}
                    </div>
                    {data.transfers.cost > 0 && (
                      <div className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-sm font-inter text-red-400">
                        -{data.transfers.cost} pts hit
                      </div>
                    )}
                  </div>

                  {/* Transfer Details */}
                  <div className="space-y-3 mb-6">
                    {data.transfers.details.map((transfer, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-fpl-dark/40 border border-fpl-primary/10">
                        {/* Player In */}
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-fpl-accent flex-shrink-0" />
                          <img
                            src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${transfer.playerIn.teamCode}-66.png`}
                            alt={transfer.playerIn.team}
                            className="w-8 h-8 object-contain"
                          />
                          <div className="min-w-0">
                            <div className="font-inter text-white text-sm font-medium truncate">{transfer.playerIn.name}</div>
                            <div className="text-xs text-fpl-text-secondary">{transfer.playerIn.team}</div>
                          </div>
                          <div className="ml-auto font-jakarta font-bold text-fpl-accent">{transfer.playerIn.points} pts</div>
                        </div>

                        <div className="text-fpl-text-secondary text-xs px-2">vs</div>

                        {/* Player Out */}
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                          <img
                            src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${transfer.playerOut.teamCode}-66.png`}
                            alt={transfer.playerOut.team}
                            className="w-8 h-8 object-contain"
                          />
                          <div className="min-w-0">
                            <div className="font-inter text-white text-sm font-medium truncate">{transfer.playerOut.name}</div>
                            <div className="text-xs text-fpl-text-secondary">{transfer.playerOut.team}</div>
                          </div>
                          <div className="ml-auto font-jakarta font-bold text-red-400">{transfer.playerOut.points} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Net Impact */}
                  {(() => {
                    const netGain = data.transfers.totalPointsIn - data.transfers.totalPointsOut;
                    const netAfterHit = netGain - data.transfers.cost;
                    const badge = getTransferBadge(netAfterHit);

                    return (
                      <div className="space-y-4">
                        {/* Visual Comparison Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-inter">
                            <span className="text-fpl-accent">IN: {data.transfers.totalPointsIn} pts</span>
                            <span className="text-red-400">OUT: {data.transfers.totalPointsOut} pts</span>
                          </div>
                          <div className="h-3 bg-fpl-dark/60 rounded-full overflow-hidden flex">
                            <div
                              className="bg-gradient-to-r from-fpl-accent to-green-400 rounded-l-full transition-all"
                              style={{ width: `${Math.max(5, (data.transfers.totalPointsIn / Math.max(1, data.transfers.totalPointsIn + data.transfers.totalPointsOut)) * 100)}%` }}
                            />
                            <div
                              className="bg-gradient-to-r from-red-400 to-red-500 rounded-r-full transition-all"
                              style={{ width: `${Math.max(5, (data.transfers.totalPointsOut / Math.max(1, data.transfers.totalPointsIn + data.transfers.totalPointsOut)) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Net Result */}
                        <div className="flex items-center justify-between p-4 rounded-fpl bg-fpl-dark/60 border border-fpl-primary/20">
                          <div>
                            <div className="text-sm text-fpl-text-secondary font-inter">Net Transfer Gain</div>
                            <div className={`text-2xl font-jakarta font-bold ${netGain >= 0 ? 'text-fpl-accent' : 'text-red-400'}`}>
                              {netGain >= 0 ? '+' : ''}{netGain}
                            </div>
                            {data.transfers.cost > 0 && (
                              <div className={`text-sm font-inter ${netAfterHit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                After hit: {netAfterHit >= 0 ? '+' : ''}{netAfterHit}
                              </div>
                            )}
                          </div>
                          {/* Transfer Badge */}
                          <div className={`px-4 py-2 rounded-fpl text-center ${badge.bg}`}>
                            <div className="text-lg">{badge.emoji}</div>
                            <div className={`text-sm font-jakarta font-bold ${badge.textColor}`}>{badge.label}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            SECTION 4: POST-MATCH ANALYSIS (Analysis Tab)
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {/* Captain Analysis */}
            <CollapsibleSection
              title="Captain Analysis"
              icon={<Crown className="w-5 h-5 text-yellow-400" />}
              isCollapsed={collapsedSections['captain']}
              onToggle={() => toggleSection('captain')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-fpl-dark/40 border border-yellow-500/20">
                  <div>
                    <div className="text-sm text-fpl-text-secondary font-inter">Your Captain</div>
                    <div className="text-white font-jakarta font-bold text-lg flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      {data.analysis.captainName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-jakarta font-bold text-yellow-400">{data.analysis.captainPoints} pts</div>
                    <div className="text-xs text-fpl-text-secondary font-inter">({data.analysis.captainBasePoints} x2)</div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Differential Impact */}
            <CollapsibleSection
              title="Differential Impact"
              icon={<Target className="w-5 h-5 text-fpl-accent" />}
              isCollapsed={collapsedSections['differentials']}
              onToggle={() => toggleSection('differentials')}
            >
              {data.analysis.differentials.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-fpl-text-secondary font-inter mb-3">
                    Players owned by &lt;10% of managers
                  </div>
                  {data.analysis.differentials.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-fpl-dark/40 border border-fpl-accent/10">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${p.teamCode}-66.png`}
                          alt={p.team}
                          className="w-8 h-8 object-contain"
                        />
                        <div>
                          <div className="font-inter text-white text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-fpl-text-secondary">{p.ownership?.toFixed(1)}% owned</div>
                        </div>
                      </div>
                      <div className="font-jakarta font-bold text-fpl-accent">{p.points} pts</div>
                    </div>
                  ))}
                  <div className="mt-3 p-3 rounded-lg bg-fpl-accent/5 border border-fpl-accent/20 text-center">
                    <span className="text-fpl-accent font-jakarta font-bold">
                      +{data.analysis.differentials.reduce((s, p) => s + p.points, 0)} pts
                    </span>
                    <span className="text-fpl-text-secondary font-inter text-sm"> from differentials</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-fpl-text-secondary font-inter text-sm">
                  No differentials scored this gameweek
                </div>
              )}
            </CollapsibleSection>

            {/* Bench Regret Meter */}
            <CollapsibleSection
              title="Bench Regret Meter"
              icon={<AlertTriangle className="w-5 h-5 text-orange-400" />}
              isCollapsed={collapsedSections['bench']}
              onToggle={() => toggleSection('bench')}
            >
              {(() => {
                const benchPts = data.analysis.benchPoints;
                const regretLevel = Math.min(100, Math.round((benchPts / Math.max(1, data.header.gwPoints)) * 100));
                const regretColor = regretLevel > 50 ? 'text-red-400' : regretLevel > 25 ? 'text-orange-400' : 'text-green-400';
                const barColor = regretLevel > 50 ? 'bg-red-400' : regretLevel > 25 ? 'bg-orange-400' : 'bg-green-400';

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-fpl-dark/40 border border-orange-500/20">
                      <div>
                        <div className="text-sm text-fpl-text-secondary font-inter">Bench Points</div>
                        <div className="text-2xl font-jakarta font-bold text-orange-400">{benchPts} pts</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-fpl-text-secondary font-inter">Regret Level</div>
                        <div className={`text-2xl font-jakarta font-bold ${regretColor}`}>{regretLevel}%</div>
                      </div>
                    </div>

                    {/* Visual Meter */}
                    <div className="space-y-1">
                      <div className="h-4 bg-fpl-dark/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-1000`}
                          style={{ width: `${regretLevel}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-fpl-text-secondary font-inter">
                        <span>No regrets</span>
                        <span>Maximum pain</span>
                      </div>
                    </div>

                    {benchPts > 10 && (
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-center text-sm font-inter text-red-400">
                        Your bench outscored many starting XIs this week
                      </div>
                    )}
                  </div>
                );
              })()}
            </CollapsibleSection>

            {/* Active Chip */}
            {data.analysis.activeChip && (
              <CollapsibleSection
                title="Chip Played"
                icon={<Zap className="w-5 h-5 text-purple-400" />}
                isCollapsed={collapsedSections['chip']}
                onToggle={() => toggleSection('chip')}
              >
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                  <div className="text-lg font-jakarta font-bold text-purple-400 uppercase">
                    {formatChipName(data.analysis.activeChip)}
                  </div>
                  <div className="text-sm text-fpl-text-secondary font-inter mt-1">
                    {data.analysis.activeChip === 'bboost' && `Bench contributed ${data.analysis.benchPoints} extra points`}
                    {data.analysis.activeChip === '3xc' && `Captain earned ${data.analysis.captainPoints} points (x3)`}
                    {data.analysis.activeChip === 'freehit' && 'One-week team used'}
                    {data.analysis.activeChip === 'wildcard' && 'Unlimited free transfers used'}
                  </div>
                </div>
              </CollapsibleSection>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            SECTION 5: RIVAL RADAR (Rivals Tab)
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'rivals' && (
          <div className="space-y-6">
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-6 border border-fpl-primary/20">
              <h2 className="text-xl font-jakarta font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-fpl-accent" />
                League Standings
              </h2>

              {data.header.leagues.length === 0 ? (
                <div className="text-center py-8 text-fpl-text-secondary font-inter">
                  No mini-league data available
                </div>
              ) : (
                <div className="space-y-4">
                  {data.header.leagues.slice(0, 8).map(league => {
                    const movement = league.lastRank - league.rank;
                    return (
                      <Link
                        key={league.id}
                        href={`/league/${league.id}?team=${teamId}`}
                        className="block p-4 rounded-lg bg-fpl-dark/40 border border-fpl-primary/10 hover:border-fpl-accent/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1 mr-3">
                            <div className="font-jakarta font-medium text-white truncate">{league.name}</div>
                            <div className="text-xs text-fpl-text-secondary font-inter mt-1">
                              {movement > 0 && <span className="text-fpl-accent">Gained {movement} place{movement > 1 ? 's' : ''} this GW</span>}
                              {movement < 0 && <span className="text-red-400">Dropped {Math.abs(movement)} place{Math.abs(movement) > 1 ? 's' : ''} this GW</span>}
                              {movement === 0 && <span>Position unchanged</span>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-jakarta font-bold text-white text-lg">#{league.rank}</div>
                            <div className="flex items-center gap-1 justify-end">
                              {movement > 0 && <TrendingUp className="w-3 h-3 text-fpl-accent" />}
                              {movement < 0 && <TrendingDown className="w-3 h-3 text-red-400" />}
                              {movement !== 0 && (
                                <span className={`text-xs ${movement > 0 ? 'text-fpl-accent' : 'text-red-400'}`}>
                                  {Math.abs(movement)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {data.header.leagues.length > 8 && (
                <div className="mt-4 text-center text-sm text-fpl-text-secondary font-inter">
                  +{data.header.leagues.length - 8} more leagues
                </div>
              )}
            </div>

            {/* Outperformance Badge */}
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-6 border border-fpl-primary/20 text-center">
              <div className="text-sm text-fpl-text-secondary font-inter mb-2">Your GW Performance</div>
              {data.header.pointsAboveAvg > 0 ? (
                <>
                  <div className="text-fpl-accent font-jakarta font-bold text-lg mb-1">
                    <Trophy className="w-5 h-5 inline mr-1" />
                    Above Average
                  </div>
                  <div className="text-sm text-fpl-text-secondary font-inter">
                    You scored {data.header.gwPoints} pts vs the {data.header.averageScore} average
                  </div>
                </>
              ) : (
                <>
                  <div className="text-orange-400 font-jakarta font-bold text-lg mb-1">Below Average</div>
                  <div className="text-sm text-fpl-text-secondary font-inter">
                    You scored {data.header.gwPoints} pts vs the {data.header.averageScore} average
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {/* ═══════════════════════════════════════════════════
            SECTION 6: MONTHLY LEADERBOARD (Leaderboard Tab)
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {leaderboardLoading ? (
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 border border-fpl-primary/20 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fpl-accent mx-auto mb-3" />
                <p className="text-fpl-text-secondary font-inter">Loading monthly leaderboards...</p>
              </div>
            ) : !leaderboardData || leaderboardData.leagueLeaderboards.length === 0 ? (
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 border border-fpl-primary/20 text-center">
                <Medal className="w-10 h-10 text-fpl-text-secondary mx-auto mb-3 opacity-50" />
                <p className="text-fpl-text-secondary font-inter">No leaderboard data available</p>
              </div>
            ) : (
              <>
                {/* League Selector */}
                {leaderboardData.leagueLeaderboards.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {leaderboardData.leagueLeaderboards.map((league, idx) => (
                      <button
                        key={league.leagueId}
                        onClick={() => setSelectedLeague(idx)}
                        className={`px-4 py-2 rounded-fpl font-jakarta font-medium text-sm whitespace-nowrap transition-all ${
                          selectedLeague === idx
                            ? 'bg-fpl-accent/20 text-fpl-accent border border-fpl-accent/30'
                            : 'bg-fpl-dark/40 text-fpl-text-secondary hover:text-white hover:bg-white/5 border border-fpl-primary/20'
                        }`}
                      >
                        {league.leagueName}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected League Leaderboard */}
                {(() => {
                  const league = leaderboardData.leagueLeaderboards[selectedLeague];
                  if (!league) return null;

                  return (
                    <div className="space-y-4">
                      <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-6 border border-fpl-primary/20">
                        <h2 className="text-xl font-jakarta font-bold text-white mb-1 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          {league.leagueName}
                        </h2>
                        <p className="text-sm text-fpl-text-secondary font-inter mb-5">Monthly top 3 performers</p>

                        <div className="space-y-5">
                          {league.months.map((month) => {
                            const winner = month.top3[0];
                            const runnersUp = month.top3.slice(1);
                            const winnerHighlight = winner?.entryId === teamId ? 'border-fpl-accent/40' : 'border-yellow-500/30';

                            return (
                              <div key={month.phaseId} className="rounded-lg bg-fpl-dark/40 border border-fpl-primary/10 overflow-hidden">
                                {/* Month Header */}
                                <div className="flex items-center gap-2 px-4 py-3 bg-fpl-primary/10 border-b border-fpl-primary/10">
                                  <Calendar className="w-4 h-4 text-fpl-accent" />
                                  <span className="font-jakarta font-semibold text-white text-sm">{month.phaseName}</span>
                                  <span className="text-xs text-fpl-text-secondary font-inter ml-auto">
                                    GW {month.startEvent}–{month.stopEvent}
                                  </span>
                                </div>

                                {/* Two-column layout: Winner + Trophy | Runners-up */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0">
                                  {/* LEFT: 1st Place with Trophy */}
                                  {winner && (
                                    <div className={`flex items-center gap-3 p-4 border-b md:border-b-0 md:border-r border-fpl-primary/10 bg-gradient-to-br from-yellow-500/5 to-fpl-dark/20 ${winnerHighlight}`}>
                                      {/* Trophy Image */}
                                      <div className="flex-shrink-0 w-20 h-28 sm:w-24 sm:h-32 relative">
                                        <Image
                                          src="/images/manager_of_the_month_trophy.png"
                                          alt="Manager of the Month Trophy"
                                          fill
                                          className="object-contain"
                                          sizes="96px"
                                        />
                                      </div>

                                      {/* Winner Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <span className="text-lg">🥇</span>
                                          <span className="font-inter text-white text-sm font-bold truncate">
                                            {winner.teamName}
                                          </span>
                                        </div>
                                        <div className="text-xs text-fpl-text-secondary font-inter truncate mb-2">
                                          {winner.managerName}
                                        </div>
                                        <div className="font-jakarta font-bold text-xl text-yellow-400">
                                          {winner.totalPoints} <span className="text-sm font-normal text-fpl-text-secondary">pts</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* RIGHT: 2nd & 3rd Place */}
                                  <div className="divide-y divide-fpl-primary/10">
                                    {runnersUp.map((entry) => {
                                      const bgHighlight = entry.entryId === teamId ? 'bg-fpl-accent/5 border-l-2 border-l-fpl-accent' : '';
                                      return (
                                        <div
                                          key={entry.entryId}
                                          className={`flex items-center gap-3 px-4 py-3 ${bgHighlight}`}
                                        >
                                          <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${
                                            entry.rank === 2 ? 'bg-gray-300/20' : 'bg-amber-600/20'
                                          }`}>
                                            <span className="font-jakarta font-bold text-sm">
                                              {entry.rank === 2 ? '🥈' : '🥉'}
                                            </span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-inter text-white text-sm font-medium truncate">
                                              {entry.teamName}
                                            </div>
                                            <div className="text-xs text-fpl-text-secondary font-inter truncate">
                                              {entry.managerName}
                                            </div>
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                            <div className="font-jakarta font-bold text-white">{entry.totalPoints}</div>
                                            <div className="text-xs text-fpl-text-secondary font-inter">pts</div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {runnersUp.length === 0 && (
                                      <div className="px-4 py-6 text-center text-fpl-text-secondary font-inter text-sm">
                                        No runners-up data
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          PLAYER DRAWER (Side Panel)
          ═══════════════════════════════════════════════════ */}
      {selectedPlayer && (
        <PlayerDrawer player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────

function PitchPlayerCard({ player, isSub = false, onClick }: { player: PlayerData; isSub?: boolean; onClick: () => void }) {
  const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.teamCode}-66.png`;
  const displayPoints = isSub ? player.points : player.points * player.multiplier;

  return (
    <button onClick={onClick} className="text-center relative flex flex-col items-center w-14 sm:w-20 lg:w-[90px] group cursor-pointer">
      {/* Captain Badge */}
      {player.isCaptain && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold z-30 shadow-lg border border-white">C</div>
      )}
      {player.isViceCaptain && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold z-30 shadow-lg border border-white">V</div>
      )}
      {/* Status Indicator */}
      {(player.status === 'i' || player.status === 's' || player.status === 'u' || player.status === 'd' || player.status === 'n' || (player.minutes === 0 && player.points === 0)) && (
        <div className="absolute -top-1 -left-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold z-30 shadow-lg border border-white">!</div>
      )}

      {/* Shirt */}
      <div className="relative mx-auto mb-1 w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 group-hover:scale-110 transition-transform">
        <img src={shirtUrl} alt={player.team} className="w-full h-full object-contain drop-shadow-md" />
      </div>

      {/* Name */}
      <div className="font-bold text-white bg-gradient-to-r from-purple-900 to-purple-800 rounded px-1 sm:px-2 py-0.5 mb-0.5 w-full border border-purple-600 text-[10px] sm:text-xs">
        <div className="leading-tight whitespace-nowrap truncate" title={player.name}>{player.name}</div>
      </div>

      {/* Points */}
      <div className="font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 rounded px-1 sm:px-2 py-0.5 w-full shadow-sm border border-cyan-400 text-[10px] sm:text-xs">
        <div className="flex items-center justify-center">
          {displayPoints}
          {player.multiplier > 1 && !isSub && (
            <span className="text-yellow-200 ml-0.5 font-bold">(x{player.multiplier})</span>
          )}
        </div>
      </div>

      {/* Ownership % */}
      {player.ownership !== undefined && player.ownership > 0 && (
        <div className="text-[9px] sm:text-[10px] text-white/70 mt-0.5 font-inter">{player.ownership.toFixed(0)}% owned</div>
      )}
    </button>
  );
}

function PlayerDrawer({ player, onClose }: { player: PlayerData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-sm bg-fpl-dark border-l border-fpl-primary/20 overflow-y-auto animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-fpl-dark/95 backdrop-blur-fpl border-b border-fpl-primary/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.teamCode}-66.png`}
              alt={player.team}
              className="w-10 h-10 object-contain"
            />
            <div>
              <h3 className="font-jakarta font-bold text-white">{player.name}</h3>
              <p className="text-sm text-fpl-text-secondary font-inter">{player.team}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-fpl-text-secondary" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-4 space-y-4">
          {/* Points */}
          <div className="text-center p-4 rounded-fpl bg-fpl-accent/10 border border-fpl-accent/20">
            <div className="text-3xl font-jakarta font-bold text-fpl-accent">
              {player.points * player.multiplier} pts
            </div>
            {player.multiplier > 1 && (
              <div className="text-sm text-fpl-text-secondary font-inter">
                {player.points} base x{player.multiplier} {player.isCaptain ? '(Captain)' : '(Triple Captain)'}
              </div>
            )}
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="xG" value={parseFloat(player.xG || '0').toFixed(2)} />
            <StatBox label="xA" value={parseFloat(player.xA || '0').toFixed(2)} />
            <StatBox label="Bonus" value={player.bonus?.toString() || '0'} />
            <StatBox label="BPS" value={player.bps?.toString() || '0'} />
            <StatBox label="Minutes" value={player.minutes?.toString() || '0'} />
            <StatBox label="Ownership" value={`${player.ownership?.toFixed(1) || '0'}%`} />
          </div>

          {/* Match Events */}
          <div className="space-y-2">
            <h4 className="text-sm font-jakarta font-semibold text-fpl-text-secondary uppercase tracking-wider">Match Events</h4>
            {(player.goals || 0) > 0 && <EventRow icon="⚽" label="Goals" value={player.goals!} />}
            {(player.assists || 0) > 0 && <EventRow icon="🅰️" label="Assists" value={player.assists!} />}
            {(player.cleanSheet || 0) > 0 && <EventRow icon="🛡️" label="Clean Sheet" value={1} />}
            {(player.saves || 0) > 0 && <EventRow icon="🧤" label="Saves" value={player.saves!} />}
            {(player.yellowCards || 0) > 0 && <EventRow icon="🟨" label="Yellow Cards" value={player.yellowCards!} />}
            {(player.redCards || 0) > 0 && <EventRow icon="🟥" label="Red Card" value={player.redCards!} />}
            {!player.goals && !player.assists && !player.cleanSheet && !player.saves && !player.yellowCards && !player.redCards && (
              <div className="text-sm text-fpl-text-secondary font-inter text-center py-2">No notable events</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-fpl-dark/40 border border-fpl-primary/10 text-center">
      <div className="text-xs text-fpl-text-secondary font-inter mb-1">{label}</div>
      <div className="text-lg font-jakarta font-bold text-white">{value}</div>
    </div>
  );
}

function EventRow({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-fpl-dark/30">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-sm font-inter text-white">{label}</span>
      </div>
      <span className="font-jakarta font-bold text-white">{value}</span>
    </div>
  );
}

function CollapsibleSection({ title, icon, children, isCollapsed, onToggle }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isCollapsed?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-jakarta font-bold text-white">{title}</h3>
        </div>
        {isCollapsed ? <ChevronDown className="w-5 h-5 text-fpl-text-secondary" /> : <ChevronUp className="w-5 h-5 text-fpl-text-secondary" />}
      </button>
      {!isCollapsed && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

function formatChipName(chipCode: string): string {
  const chipMap: Record<string, string> = {
    'wildcard': 'Wildcard',
    'bboost': 'Bench Boost',
    'freehit': 'Free Hit',
    '3xc': 'Triple Captain',
  };
  return chipMap[chipCode] || chipCode;
}

function getTransferBadge(netAfterHit: number) {
  if (netAfterHit >= 10) return { emoji: '🟢', label: 'Genius Move', bg: 'bg-fpl-accent/10 border border-fpl-accent/30', textColor: 'text-fpl-accent' };
  if (netAfterHit >= 4) return { emoji: '👍', label: 'Good Call', bg: 'bg-green-500/10 border border-green-500/30', textColor: 'text-green-400' };
  if (netAfterHit >= -3) return { emoji: '🟡', label: 'Neutral', bg: 'bg-yellow-500/10 border border-yellow-500/30', textColor: 'text-yellow-400' };
  if (netAfterHit >= -8) return { emoji: '🔴', label: 'Costly', bg: 'bg-red-500/10 border border-red-500/30', textColor: 'text-red-400' };
  return { emoji: '💀', label: 'Disaster', bg: 'bg-red-500/20 border border-red-500/40', textColor: 'text-red-500' };
}

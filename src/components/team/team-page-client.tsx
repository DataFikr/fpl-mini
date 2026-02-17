'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Crown, Target, ArrowRightLeft,
  BarChart3, ChevronDown, ChevronUp, Shield, X,
  Zap, AlertTriangle, CalendarDays
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

interface FixtureItem {
  event: number;
  opponent_short: string;
  is_home: boolean;
  difficulty: number;
}

interface FixturePlayer {
  id: number;
  name: string;
  position: string;
  positionOrder: number;
  price: string;
  teamId: number;
  teamName: string;
  teamShort: string;
  teamCode: number;
  photo: string | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isStarting: boolean;
  pickPosition: number;
  fixtures: FixtureItem[];
}

interface FixtureData {
  currentGameweek: number;
  gwColumns: { id: number; name: string; deadline: string | null }[];
  players: FixturePlayer[];
}

interface TransferHistoryGW {
  gameweek: number;
  isCurrent: boolean;
  count: number;
  cost: number;
  details: {
    playerIn: { id: number; name: string; team: string; teamCode: number; points: number; cost: number };
    playerOut: { id: number; name: string; team: string; teamCode: number; points: number; cost: number };
    time: string;
  }[];
  totalPointsIn: number;
  totalPointsOut: number;
}

interface TransferHistoryData {
  teamId: number;
  currentGameweek: number;
  gameweeks: TransferHistoryGW[];
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
  const [activeTab, setActiveTab] = useState<'team' | 'transfers' | 'analysis' | 'fixtures'>('team');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [fixtureData, setFixtureData] = useState<FixtureData | null>(null);
  const [fixtureLoading, setFixtureLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryData | null>(null);
  const [transferHistoryLoading, setTransferHistoryLoading] = useState(false);

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

  const fetchFixtures = async () => {
    if (fixtureData) return;
    setFixtureLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/fixtures`);
      if (res.ok) {
        setFixtureData(await res.json());
      }
    } catch (error) {
      console.warn('Failed to fetch fixtures:', error);
    }
    setFixtureLoading(false);
  };

  const fetchTransferHistory = async () => {
    if (transferHistory) return;
    setTransferHistoryLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/transfer-history`);
      if (res.ok) {
        setTransferHistory(await res.json());
      }
    } catch (error) {
      console.warn('Failed to fetch transfer history:', error);
    }
    setTransferHistoryLoading(false);
  };

  const getFDRColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-[#257d5a] text-white';
      case 2: return 'bg-[#00ff87] text-gray-900';
      case 3: return 'bg-[#ebebe4] text-gray-900';
      case 4: return 'bg-[#ff1751] text-white';
      case 5: return 'bg-[#861d46] text-white';
      default: return 'bg-gray-600 text-white';
    }
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
    { key: 'fixtures' as const, label: 'Fixtures', icon: CalendarDays },
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
            MINI-LEAGUES
            ═══════════════════════════════════════════════════ */}
        {data.header.leagues.length > 0 && (
          <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-6 mb-6 border border-fpl-primary/20">
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
        )}

        {/* ═══════════════════════════════════════════════════
            TAB NAVIGATION
            ═══════════════════════════════════════════════════ */}
        <div className="flex gap-1 mb-6 backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl p-1 border border-fpl-primary/20 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); if (tab.key === 'fixtures') fetchFixtures(); if (tab.key === 'transfers') fetchTransferHistory(); }}
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
            {/* Interactive Pitch */}
            <div className="relative bg-gradient-to-b from-green-500 to-green-700 rounded-fpl mx-auto p-4 h-[480px] sm:h-[620px] lg:h-[680px] max-w-4xl overflow-hidden">
              {/* Active Chip Badge */}
              {data.squad.activeChip && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40">
                  <div className={`px-4 py-1.5 rounded-full font-jakarta font-bold text-sm uppercase tracking-wide shadow-lg border backdrop-blur-sm ${
                    data.squad.activeChip === '3xc' ? 'bg-yellow-500/90 text-black border-yellow-300'
                    : data.squad.activeChip === 'bboost' ? 'bg-blue-500/90 text-white border-blue-300'
                    : data.squad.activeChip === 'freehit' ? 'bg-purple-500/90 text-white border-purple-300'
                    : data.squad.activeChip === 'wildcard' ? 'bg-red-500/90 text-white border-red-300'
                    : 'bg-yellow-500/90 text-black border-yellow-300'
                  }`}>
                    {formatChipName(data.squad.activeChip)} Active
                  </div>
                </div>
              )}
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

          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            SECTION 3: TRANSFER IMPACT (Transfers Tab)
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'transfers' && (
          <div className="space-y-6">
            {/* Current GW Transfer Impact (from dashboard data) */}
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-6 border border-fpl-primary/20">
              <h2 className="text-xl font-jakarta font-bold text-white mb-2 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-fpl-accent" />
                GW {data.currentGameweek} Transfer Impact
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-fpl-accent/20 text-fpl-accent font-inter">Current</span>
              </h2>

              {data.transfers.count === 0 ? (
                <div className="text-center py-8">
                  <div className="text-fpl-text-secondary font-inter mb-2">No transfers made this gameweek</div>
                  <div className="text-sm text-fpl-text-secondary/60 font-inter">Free transfer banked</div>
                </div>
              ) : (
                <>
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

                  <div className="space-y-3 mb-6">
                    {data.transfers.details.map((transfer, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-fpl-dark/40 border border-fpl-primary/10">
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-fpl-accent flex-shrink-0" />
                          <img
                            src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${transfer.playerIn.teamCode}-66.png`}
                            alt={transfer.playerIn.team}
                            className="w-8 h-8 object-contain"
                          />
                          <div className="min-w-0">
                            <div className="font-inter text-white text-sm font-medium truncate">{transfer.playerIn.name}</div>
                            <div className="text-xs text-fpl-text-secondary">{transfer.playerIn.team} | £{transfer.playerIn.cost}m</div>
                          </div>
                          <div className="ml-auto font-jakarta font-bold text-fpl-accent">{transfer.playerIn.points} pts</div>
                        </div>
                        <div className="text-fpl-text-secondary text-xs px-2">vs</div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                          <img
                            src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${transfer.playerOut.teamCode}-66.png`}
                            alt={transfer.playerOut.team}
                            className="w-8 h-8 object-contain"
                          />
                          <div className="min-w-0">
                            <div className="font-inter text-white text-sm font-medium truncate">{transfer.playerOut.name}</div>
                            <div className="text-xs text-fpl-text-secondary">{transfer.playerOut.team} | £{transfer.playerOut.cost}m</div>
                          </div>
                          <div className="ml-auto font-jakarta font-bold text-red-400">{transfer.playerOut.points} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const netGain = data.transfers.totalPointsIn - data.transfers.totalPointsOut;
                    const netAfterHit = netGain - data.transfers.cost;
                    const badge = getTransferBadge(netAfterHit);
                    return (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-inter">
                            <span className="text-fpl-accent">IN: {data.transfers.totalPointsIn} pts</span>
                            <span className="text-red-400">OUT: {data.transfers.totalPointsOut} pts</span>
                          </div>
                          <div className="h-3 bg-fpl-dark/60 rounded-full overflow-hidden flex">
                            <div className="bg-gradient-to-r from-fpl-accent to-green-400 rounded-l-full transition-all" style={{ width: `${Math.max(5, (data.transfers.totalPointsIn / Math.max(1, data.transfers.totalPointsIn + data.transfers.totalPointsOut)) * 100)}%` }} />
                            <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-r-full transition-all" style={{ width: `${Math.max(5, (data.transfers.totalPointsOut / Math.max(1, data.transfers.totalPointsIn + data.transfers.totalPointsOut)) * 100)}%` }} />
                          </div>
                        </div>
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

            {/* Transfer History - All Previous GWs */}
            <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-6 border border-fpl-primary/20">
              <h2 className="text-xl font-jakarta font-bold text-white mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-fpl-accent" />
                Transfer History
              </h2>

              {transferHistoryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fpl-accent mx-auto mb-3" />
                  <p className="text-fpl-text-secondary font-inter text-sm">Loading transfer history...</p>
                </div>
              ) : !transferHistory || transferHistory.gameweeks.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowRightLeft className="w-10 h-10 text-fpl-text-secondary/30 mx-auto mb-3" />
                  <p className="text-fpl-text-secondary font-inter">No transfer history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Season Summary */}
                  {(() => {
                    const totalTransfers = transferHistory.gameweeks.reduce((s, gw) => s + gw.count, 0);
                    const totalHits = transferHistory.gameweeks.reduce((s, gw) => s + gw.cost, 0);
                    const totalNetGain = transferHistory.gameweeks.reduce((s, gw) => s + (gw.totalPointsIn - gw.totalPointsOut), 0);
                    return (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-fpl-dark/60 border border-fpl-primary/10 text-center">
                          <div className="text-2xl font-jakarta font-bold text-white">{totalTransfers}</div>
                          <div className="text-xs text-fpl-text-secondary font-inter">Total Transfers</div>
                        </div>
                        <div className="p-3 rounded-lg bg-fpl-dark/60 border border-fpl-primary/10 text-center">
                          <div className={`text-2xl font-jakarta font-bold ${totalHits > 0 ? 'text-red-400' : 'text-fpl-accent'}`}>-{totalHits}</div>
                          <div className="text-xs text-fpl-text-secondary font-inter">Hits Taken</div>
                        </div>
                        <div className="p-3 rounded-lg bg-fpl-dark/60 border border-fpl-primary/10 text-center">
                          <div className={`text-2xl font-jakarta font-bold ${totalNetGain >= 0 ? 'text-fpl-accent' : 'text-red-400'}`}>
                            {totalNetGain >= 0 ? '+' : ''}{totalNetGain}
                          </div>
                          <div className="text-xs text-fpl-text-secondary font-inter">Net Points</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* GW-by-GW History (skip current GW since it's shown above) */}
                  {transferHistory.gameweeks
                    .filter(gw => !gw.isCurrent)
                    .map((gw) => {
                      const netGain = gw.totalPointsIn - gw.totalPointsOut;
                      const netAfterHit = netGain - gw.cost;
                      const badge = getTransferBadge(netAfterHit);

                      return (
                        <div key={gw.gameweek} className="rounded-lg bg-fpl-dark/30 border border-fpl-primary/10 overflow-hidden">
                          {/* GW Header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-fpl-primary/5 border-b border-fpl-primary/10">
                            <div className="flex items-center gap-2">
                              <span className="font-jakarta font-bold text-white text-sm">GW {gw.gameweek}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-fpl-primary/20 text-fpl-text-secondary font-inter">
                                {gw.count} transfer{gw.count > 1 ? 's' : ''}
                              </span>
                              {gw.cost > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-inter">
                                  -{gw.cost} pts hit
                                </span>
                              )}
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-jakarta font-bold ${badge.bg} ${badge.textColor}`}>
                              {badge.emoji} {badge.label}
                            </div>
                          </div>

                          {/* IN / NET / OUT Bar — right below header */}
                          <div className="px-4 py-3 border-b border-fpl-primary/10">
                            <div className="flex justify-between text-xs font-inter mb-1.5">
                              <span className="text-fpl-accent font-jakarta font-bold">IN: {gw.totalPointsIn}</span>
                              <span className={`font-jakarta font-bold ${netGain >= 0 ? 'text-fpl-accent' : 'text-red-400'}`}>
                                Net: {netGain >= 0 ? '+' : ''}{netGain}
                              </span>
                              <span className="text-red-400 font-jakarta font-bold">OUT: {gw.totalPointsOut}</span>
                            </div>
                            <div className="h-2.5 bg-fpl-dark/60 rounded-full overflow-hidden flex">
                              <div
                                className="bg-gradient-to-r from-fpl-accent to-green-400 rounded-l-full"
                                style={{ width: `${Math.max(5, (gw.totalPointsIn / Math.max(1, gw.totalPointsIn + gw.totalPointsOut)) * 100)}%` }}
                              />
                              <div
                                className="bg-gradient-to-r from-red-400 to-red-500 rounded-r-full"
                                style={{ width: `${Math.max(5, (gw.totalPointsOut / Math.max(1, gw.totalPointsIn + gw.totalPointsOut)) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Transfer Details */}
                          <div className="p-4 space-y-2">
                            {gw.details.map((transfer, i) => (
                              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-fpl-dark/40 border border-fpl-primary/5">
                                {/* Player In */}
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-fpl-accent flex-shrink-0" />
                                  <img
                                    src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${transfer.playerIn.teamCode}-66.png`}
                                    alt={transfer.playerIn.team}
                                    className="w-7 h-7 object-contain flex-shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-inter text-white text-xs font-medium truncate">{transfer.playerIn.name}</div>
                                    <div className="text-[10px] text-fpl-text-secondary">{transfer.playerIn.team} | £{transfer.playerIn.cost}m</div>
                                  </div>
                                </div>

                                {/* Points In (center) */}
                                <span className="font-jakarta font-bold text-fpl-accent text-xs flex-shrink-0">{transfer.playerIn.points}</span>
                                <ArrowRightLeft className="w-3 h-3 text-fpl-text-secondary/40 flex-shrink-0" />

                                {/* Player Out */}
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                  <img
                                    src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${transfer.playerOut.teamCode}-66.png`}
                                    alt={transfer.playerOut.team}
                                    className="w-7 h-7 object-contain flex-shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-inter text-white text-xs font-medium truncate">{transfer.playerOut.name}</div>
                                    <div className="text-[10px] text-fpl-text-secondary">{transfer.playerOut.team} | £{transfer.playerOut.cost}m</div>
                                  </div>
                                </div>

                                {/* Points Out (far right) */}
                                <span className="font-jakarta font-bold text-red-400 text-xs flex-shrink-0">{transfer.playerOut.points}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
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
        {/* ═══════════════════════════════════════════════════
            SECTION 5: FIXTURES (Fixtures Tab)
            ═══════════════════════════════════════════════════ */}
        {activeTab === 'fixtures' && (
          <div className="space-y-4">
            {fixtureLoading ? (
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 border border-fpl-primary/20 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fpl-accent mx-auto mb-3" />
                <p className="text-fpl-text-secondary font-inter">Loading fixtures...</p>
              </div>
            ) : !fixtureData || fixtureData.players.length === 0 ? (
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-8 border border-fpl-primary/20 text-center">
                <CalendarDays className="w-10 h-10 text-fpl-text-secondary mx-auto mb-3 opacity-50" />
                <p className="text-fpl-text-secondary font-inter">No fixture data available</p>
              </div>
            ) : (() => {
              const { gwColumns, players } = fixtureData;
              const positionLabels: Record<string, string> = { GKP: 'Goalkeeper', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Strikers' };
              const starters = players.filter(p => p.isStarting).sort((a, b) => a.positionOrder - b.positionOrder || a.pickPosition - b.pickPosition);
              const subs = players.filter(p => !p.isStarting).sort((a, b) => a.pickPosition - b.pickPosition);

              // Group starters by position
              const grouped: { label: string; players: FixturePlayer[] }[] = [];
              let lastPos = '';
              for (const p of starters) {
                if (p.position !== lastPos) {
                  grouped.push({ label: positionLabels[p.position] || p.position, players: [] });
                  lastPos = p.position;
                }
                grouped[grouped.length - 1].players.push(p);
              }
              if (subs.length > 0) {
                grouped.push({ label: 'Substitutes', players: subs });
              }

              return (
                <>
                  {/* FDR Key */}
                  <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl p-4 border border-fpl-primary/20">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-jakarta font-semibold text-fpl-text-secondary">FDR Key:</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map(d => (
                          <div key={d} className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${getFDRColor(d)}`}>{d}</div>
                        ))}
                      </div>
                      <span className="text-[10px] text-fpl-text-secondary font-inter">Easy</span>
                      <span className="text-[10px] text-fpl-text-secondary font-inter ml-auto">Hard</span>
                    </div>
                  </div>

                  {/* Fixture Table */}
                  <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl shadow-fpl border border-fpl-primary/20 overflow-x-auto">
                    <table className="w-full text-sm">
                      {/* Table Header */}
                      <thead>
                        <tr className="border-b border-fpl-primary/20">
                          <th className="sticky left-0 z-10 bg-fpl-dark/95 backdrop-blur-sm px-3 py-2 text-left text-[10px] font-jakarta font-semibold text-fpl-text-secondary uppercase tracking-wider w-12">Pos</th>
                          <th className="sticky left-12 z-10 bg-fpl-dark/95 backdrop-blur-sm px-2 py-2 text-left text-[10px] font-jakarta font-semibold text-fpl-text-secondary uppercase tracking-wider w-10"></th>
                          <th className="sticky left-[5.5rem] z-10 bg-fpl-dark/95 backdrop-blur-sm px-2 py-2 text-left text-[10px] font-jakarta font-semibold text-fpl-text-secondary uppercase tracking-wider min-w-[90px]">Player</th>
                          <th className="bg-fpl-dark/95 px-2 py-2 text-center text-[10px] font-jakarta font-semibold text-fpl-text-secondary uppercase tracking-wider w-14">Price</th>
                          <th className="bg-fpl-dark/95 px-2 py-2 text-center text-[10px] font-jakarta font-semibold text-fpl-text-secondary uppercase tracking-wider min-w-[60px]">Team</th>
                          {gwColumns.map(gw => (
                            <th key={gw.id} className="bg-fpl-dark/95 px-1 py-2 text-center text-[10px] font-jakarta font-semibold text-fpl-text-secondary uppercase tracking-wider min-w-[68px]">
                              <div>{gw.name}</div>
                              {gw.deadline && (
                                <div className="text-[8px] font-inter font-normal text-fpl-text-secondary/60">
                                  {new Date(gw.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grouped.map((group) => (
                          <>
                            {/* Position Group Header */}
                            <tr key={`header-${group.label}`} className="bg-fpl-primary/5">
                              <td colSpan={5 + gwColumns.length} className="px-3 py-1.5">
                                <span className="font-jakarta font-bold text-xs text-fpl-accent uppercase tracking-wider">{group.label}</span>
                              </td>
                            </tr>
                            {group.players.map((player) => (
                              <tr key={player.id} className="border-b border-fpl-primary/5 hover:bg-white/[0.02] transition-colors">
                                {/* Position */}
                                <td className="sticky left-0 z-10 bg-fpl-dark/95 backdrop-blur-sm px-3 py-2">
                                  <span className="text-[10px] font-jakarta font-medium text-fpl-text-secondary">{player.position}</span>
                                </td>
                                {/* Player Photo */}
                                <td className="sticky left-12 z-10 bg-fpl-dark/95 backdrop-blur-sm px-2 py-1">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-fpl-primary/20 flex-shrink-0 relative">
                                    {player.photo ? (
                                      <Image
                                        src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo}`}
                                        alt={player.name}
                                        fill
                                        className="object-cover object-top"
                                        sizes="32px"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-fpl-text-secondary text-[10px] font-bold">
                                        {player.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                {/* Player Name */}
                                <td className="sticky left-[5.5rem] z-10 bg-fpl-dark/95 backdrop-blur-sm px-2 py-2">
                                  <div className="font-inter text-white text-xs font-medium truncate max-w-[100px]">
                                    {player.name}
                                    {player.isCaptain && <span className="text-yellow-400 ml-0.5">(C)</span>}
                                    {player.isViceCaptain && <span className="text-fpl-text-secondary ml-0.5">(V)</span>}
                                  </div>
                                </td>
                                {/* Price */}
                                <td className="px-2 py-2 text-center">
                                  <span className="font-inter text-fpl-text-secondary text-xs">&pound;{player.price}</span>
                                </td>
                                {/* Team */}
                                <td className="px-2 py-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Image
                                      src={`https://resources.premierleague.com/premierleague/badges/20/t${player.teamCode}.png`}
                                      alt={player.teamShort}
                                      width={16}
                                      height={16}
                                      className="flex-shrink-0"
                                    />
                                    <span className="font-inter text-fpl-text-secondary text-[10px]">{player.teamShort}</span>
                                  </div>
                                </td>
                                {/* Fixture Cells */}
                                {gwColumns.map(gw => {
                                  const fixtures = player.fixtures.filter(f => f.event === gw.id);
                                  if (fixtures.length === 0) {
                                    return (
                                      <td key={gw.id} className="px-1 py-2 text-center">
                                        <div className="bg-gray-700/50 rounded px-1 py-1.5 text-[10px] text-fpl-text-secondary font-inter">-</div>
                                      </td>
                                    );
                                  }
                                  return (
                                    <td key={gw.id} className="px-1 py-2 text-center">
                                      <div className="flex flex-col gap-0.5">
                                        {fixtures.map((fix, fi) => (
                                          <div
                                            key={fi}
                                            className={`rounded px-1 py-1.5 text-[10px] font-inter font-bold ${getFDRColor(fix.difficulty)}`}
                                          >
                                            {fix.opponent_short} ({fix.is_home ? 'H' : 'A'})
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
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

'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Crown, Target, AlertTriangle, Zap, Users, Mail, Send, X, Flame, Skull, Copy, Swords, Ghost, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

// ─── Story Configuration ────────────────────────────────────

const STORY_CONFIGS: Record<string, { icon: React.ReactNode; color: string; bgColor: string; image: string }> = {
  breakthrough: {
    icon: <Crown className="h-6 w-6" />,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    image: '/images/headlines/news_gw_top_scorer.png'
  },
  masterstroke: {
    icon: <Target className="h-6 w-6" />,
    color: '#059669',
    bgColor: '#ECFDF5',
    image: '/images/headlines/news_captain_masterstroke.png'
  },
  disaster: {
    icon: <AlertTriangle className="h-6 w-6" />,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    image: '/images/headlines/news_captain_calamity.png'
  },
  rivalry: {
    icon: <Zap className="h-6 w-6" />,
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    image: '/images/headlines/news_title_race.png'
  },
  underdog: {
    icon: <TrendingUp className="h-6 w-6" />,
    color: '#0891B2',
    bgColor: '#ECFEFF',
    image: '/images/headlines/news_spectacular_charge.png'
  },
  bench_nightmare: {
    icon: <Skull className="h-6 w-6" />,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    image: '/images/headlines/news_bench_nightmare.png'
  },
  bottle_job: {
    icon: <TrendingDown className="h-6 w-6" />,
    color: '#BE123C',
    bgColor: '#FFF1F2',
    image: '/images/headlines/news_bottle_job.png'
  },
  differential: {
    icon: <Target className="h-6 w-6" />,
    color: '#0D9488',
    bgColor: '#F0FDFA',
    image: '/images/headlines/news_differential_masterclass.png'
  },
  clone_wars: {
    icon: <Copy className="h-6 w-6" />,
    color: '#6D28D9',
    bgColor: '#F5F3FF',
    image: '/images/headlines/news_clone_wars.png'
  },
  derby_day: {
    icon: <Swords className="h-6 w-6" />,
    color: '#B91C1C',
    bgColor: '#FEF2F2',
    image: '/images/headlines/news_derby_day.png'
  },
  ghost_ship: {
    icon: <Ghost className="h-6 w-6" />,
    color: '#6B7280',
    bgColor: '#F9FAFB',
    image: '/images/headlines/news_ghost_ship.png'
  },
  panic_merchant: {
    icon: <ShoppingCart className="h-6 w-6" />,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    image: '/images/headlines/news_bottle_job.png'
  },
  on_the_charge: {
    icon: <Flame className="h-6 w-6" />,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    image: '/images/headlines/news_on_the_charge.png'
  },
};

// ─── Headline Templates ─────────────────────────────────────

const HEADLINES: Record<string, { templates: string[]; subTemplates: string[] }> = {
  breakthrough: {
    templates: [
      "🚨 BREAKING: {teamName} delivers MONSTER gameweek!",
      "⚡ EXPLOSIVE: {teamName} absolutely DEMOLISHES the competition!",
      "🔥 UNSTOPPABLE: {teamName} goes NUCLEAR in GW{gameweek}!",
      "💥 GAMEWEEK HERO: {teamName} delivers a MASTERCLASS performance!",
      "🎯 SENSATIONAL: {teamName} pulls off the impossible with {points}-point HAUL!"
    ],
    subTemplates: [
      "MASSIVE {points}-point explosion rocks the league",
      "{points} points of pure DOMINANCE leaves rivals stunned",
      "EXPLOSIVE performance sends shockwaves through {leagueName}",
      "LEGENDARY {points}-point haul rewrites the history books",
      "UNSTOPPABLE force delivers {points} points of PURE CLASS"
    ]
  },
  masterstroke: {
    templates: [
      "⚡ {managerName} pulls off CAPTAINCY MASTERCLASS!",
      "🎯 GENIUS MOVE: {managerName} shows tactical BRILLIANCE!",
      "⭐ CAPTAIN FANTASTIC: {managerName} backs {player} to PERFECTION!",
      "🔮 ORACLE ALERT: {managerName} predicts the future with {player}!",
      "🧠 MASTERMIND: {managerName} outsmarts the field with {player}!"
    ],
    subTemplates: [
      "{player} HAULS {points} points with the armband",
      "DIFFERENTIAL pick {player} delivers {points} MASSIVE points",
      "TACTICAL GENIUS rewarded with {points}-point captain haul",
      "BOLD captaincy choice nets {points} points of GLORY",
      "{player} justifies {managerName}'s faith with {points} points"
    ]
  },
  disaster: {
    templates: [
      "😱 CAPTAIN CALAMITY: {managerName}'s armband choice results in a {points}-point disaster!",
      "💔 NIGHTMARE: {managerName} endures captaincy CATASTROPHE!",
      "🚨 DISASTER ALERT: {managerName} faces {player} meltdown!",
      "😤 CAPTAIN CHAOS: {managerName} left devastated by {player}!",
      "💀 HORROR SHOW: {managerName} watches {player} captain IMPLODE!"
    ],
    subTemplates: [
      "DEVASTATING {points}-point captain disaster strikes",
      "{player} delivers crushing {points}-point nightmare",
      "CAPTAIN MELTDOWN: Only {points} points from {player}",
      "HEARTBREAKING {points} points leave {managerName} in tears",
      "BRUTAL {points}-point reality check from captain {player}"
    ]
  },
  rivalry: {
    templates: [
      "🔥 TITLE RACE REACHES FEVER PITCH!",
      "⚔️ CHAMPIONSHIP WAR: The battle INTENSIFIES!",
      "🥊 HEAVYWEIGHT CLASH: {leader} vs {chaser} goes DOWN TO THE WIRE!",
      "🎭 DRAMA OVERLOAD: Title race becomes EDGE-OF-SEAT thriller!",
      "⚡ ELECTRIC TENSION: Championship fight reaches BOILING POINT!"
    ],
    subTemplates: [
      "Just {gap} points separate the WARRIORS!",
      "{chaser} CLOSES THE GAP — {gap} points behind!",
      "KNIFE-EDGE battle: {gap} points between glory and heartbreak",
      "PULSE-RACING drama with {gap} points the difference",
      "CHAMPIONSHIP THRILLER: {gap} points separate LEGENDS!"
    ]
  },
  underdog: {
    templates: [
      "🚀 {managerName} launches SPECTACULAR comeback!",
      "⚡ ROCKET RISE: {managerName} defies ALL expectations!",
      "🌟 CINDERELLA STORY: {managerName} climbs from the ASHES!",
      "🔥 PHOENIX RISING: {managerName} soars up the table!",
      "💫 MIRACLE RUN: {managerName} stages INCREDIBLE surge!"
    ],
    subTemplates: [
      "ROCKETS UP {improvement} places to shake up the table!",
      "CLIMBS {improvement} spots in STUNNING fashion!",
      "SURGES {improvement} positions in DRAMATIC comeback!",
      "LEAPS {improvement} places in SENSATIONAL resurgence!",
      "CATAPULTS {improvement} spots up in INCREDIBLE style!"
    ]
  },

  // ─── NEW HEADLINE TYPES ──────────────────────────────────

  bench_nightmare: {
    templates: [
      "😱 HEARTBREAK: {managerName} leaves {benchPoints} on the bench as {player} explodes!",
      "💀 BENCH NIGHTMARE: {managerName} watches {benchPoints} points ROT on the pine!",
      "🤦 WRONG CALL: {managerName} benches the WRONG players — {benchPoints} points wasted!",
      "😭 BENCH AGONY: {managerName} left {benchPoints} points gathering DUST!",
      "🪑 PINE PAIN: {managerName} benched the hero — {benchPoints} points LEFT BEHIND!"
    ],
    subTemplates: [
      "{benchPoints} points wasted on the bench — could have changed EVERYTHING",
      "Bench outscored some starting XIs with {benchPoints} points of AGONY",
      "DEVASTATING bench haul of {benchPoints} leaves {managerName} in tears",
      "Could have been top of the league with {benchPoints} extra bench points",
      "The bench had {benchPoints} points — selection NIGHTMARE"
    ]
  },
  bottle_job: {
    templates: [
      "📉 BOTTLE JOB: {managerName} drops from #{prevRank} to #{rank} in a single afternoon!",
      "😰 FREEFALL: {managerName} plummets {drop} places — is the season OVER?",
      "🆘 ALARM BELLS: {managerName} crashes {drop} places in {leagueName}!",
      "💔 CAPITULATION: {managerName} goes from contender to CRISIS in one gameweek!",
      "📉 COLLAPSE: {managerName}'s season takes DEVASTATING turn — down {drop} spots!"
    ],
    subTemplates: [
      "Crashed {drop} places in a single gameweek of HORROR",
      "From #{prevRank} to #{rank} — a DRAMATIC fall from grace",
      "{managerName} watching the league table through their FINGERS",
      "SHOCKING {drop}-place drop shakes {leagueName} to its CORE",
      "One gameweek changed EVERYTHING — {drop} places gone in a flash"
    ]
  },
  differential: {
    templates: [
      "🧠 GALAXY BRAIN: {managerName}'s {ownership}%-owned {player} saves the gameweek!",
      "🎯 DIFFERENTIAL MASTERCLASS: {managerName}'s secret weapon {player} DELIVERS!",
      "💎 HIDDEN GEM: {managerName} unearths {player} for a MASSIVE haul!",
      "🔮 VISIONARY: {managerName} saw what nobody else did with {player}!",
      "🌟 DIFFERENTIAL KING: {managerName}'s {player} pick is PURE GENIUS!"
    ],
    subTemplates: [
      "{player} owned by just {ownership}% — delivers {points} points of GLORY",
      "Only {ownership}% of managers had {player} — {points} points of BRILLIANCE",
      "DIFFERENTIAL pick {player} ({ownership}% owned) hauls {points} points",
      "{managerName} gains MASSIVE ground with {player} ({ownership}% owned, {points} pts)",
      "SECRET WEAPON {player} delivers {points} points that nobody saw COMING"
    ]
  },
  clone_wars: {
    templates: [
      "🧬 CLONE WARS: {ownership}% of the league now owns {player} — who will blink FIRST?",
      "📋 TEMPLATE ALERT: {player} is in EVERYONE'S team — {ownership}% ownership!",
      "🪞 MIRROR MATCH: {ownership}% own {player} — differentials will decide this title!",
      "🏭 FACTORY SETTINGS: {player} at {ownership}% ownership — are your teams IDENTICAL?",
      "👯 COPYCAT LEAGUE: {player} owned by {ownership}% — originality is DEAD!"
    ],
    subTemplates: [
      "{player} is THE template pick — {ownership}% can't all be wrong... or CAN they?",
      "With {ownership}% owning {player}, this league needs DIFFERENTIALS",
      "EVERYONE owns {player} — the title will be won ELSEWHERE",
      "{ownership}% ownership means {player} is basically a LEAGUE REQUIREMENT",
      "The {player} bandwagon hits {ownership}% — who DARES to be different?"
    ]
  },
  derby_day: {
    templates: [
      "⚔️ DERBY DAY: {manager1} and {manager2} separated by just {gap} point{s}!",
      "🥊 HEAD TO HEAD: {manager1} vs {manager2} — only {gap} point{s} between THEM!",
      "🔥 RIVALRY WATCH: {manager1} and {manager2} are NECK AND NECK!",
      "⚡ TOO CLOSE TO CALL: {gap} point{s} between {manager1} and {manager2}!",
      "🎯 SHOWDOWN: {manager1} and {manager2} locked in a {gap}-point BATTLE!"
    ],
    subTemplates: [
      "Just {gap} point{s} separate these two WARRIORS heading into the next GW",
      "ELECTRIC rivalry — {manager1} leads by a WHISKER over {manager2}",
      "One transfer, one captain pick could SWING this battle",
      "The group chat is about to get VERY interesting",
      "TENSION at its peak — {gap} point{s} is NOTHING in FPL"
    ]
  },
  ghost_ship: {
    templates: [
      "👻 ABANDONED: {managerName} hasn't made a transfer this GW — and is STILL in the top 5!",
      "💤 GHOST SHIP: {managerName} is on AUTOPILOT and it's somehow WORKING!",
      "🚢 SET & FORGET: {managerName} proves transfers are OVERRATED!",
      "😴 SLEEPING GIANT: {managerName} makes ZERO moves but stays in the fight!",
      "🧊 ICE COLD: {managerName} refuses to panic — ZERO transfers and NO regrets!"
    ],
    subTemplates: [
      "Zero transfers, zero stress, ALL the results",
      "While others panic-transfer, {managerName} TRUSTS the process",
      "The original team is STILL delivering — patience WINS",
      "No hits, no regrets — {managerName} plays the LONG game",
      "ZERO transfers and ranked #{rank} — that's FPL MASTERY"
    ]
  },
  panic_merchant: {
    templates: [
      "🛒 PANIC MERCHANT: {managerName} takes a -{cost} point hit — DESPERATE times!",
      "💸 TRANSFER MADNESS: {managerName} burns -{cost} points on {count} transfers!",
      "🔥 FIRE SALE: {managerName} rips up the squad with {count} transfers for -{cost}!",
      "😰 KNEE-JERK ALERT: {managerName} makes {count} transfers — PANIC or genius?",
      "💰 ALL-IN: {managerName} goes -{cost} — is this a MASTERSTROKE or MELTDOWN?"
    ],
    subTemplates: [
      "DESPERATE -{cost} hit on {count} transfers — will it pay off?",
      "{count} changes and -{cost} points — {managerName} is REBUILDING",
      "The BOLDEST move of the season: {count} transfers for -{cost}",
      "SCORCHED EARTH: {managerName} tears it up with {count} transfers",
      "When -{cost} is the cost of hope — {managerName} rolls the DICE"
    ]
  },
  on_the_charge: {
    templates: [
      "🔥 ON THE CHARGE: {managerName} records {streak} consecutive green arrows!",
      "📈 WINNING STREAK: {managerName} is on a {streak}-week HOT STREAK!",
      "🚀 MOMENTUM: {managerName} keeps climbing — {streak} green arrows IN A ROW!",
      "⚡ RED HOT: {managerName} is the form manager with {streak} weeks of GAINS!",
      "🎯 UNSTOPPABLE: {managerName}'s {streak}-week surge puts the league ON NOTICE!"
    ],
    subTemplates: [
      "{streak} consecutive green arrows — is the title race BACK ON?",
      "RELENTLESS form from {managerName} — {streak} weeks of CLIMBING",
      "Nobody is more IN FORM than {managerName} right now",
      "{streak} weeks, {streak} green arrows — this is SERIAL WINNING",
      "The hottest manager in {leagueName} — {streak} green arrows RUNNING"
    ]
  },
};

// ─── Interfaces ─────────────────────────────────────────────

interface EnhancedStory {
  id: string;
  type: string;
  headline: string;
  subheadline: string;
  details: string;
  teamName: string;
  managerName: string;
  points?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  image: string;
  variationIndex: number;
  priority: number;
}

interface EnhancedStorytellingProps {
  leagueId: number;
  gameweek?: number;
  teams?: any[];
  leagueName?: string;
  showImages?: boolean;
}

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: number;
  leagueName: string;
  stories: EnhancedStory[];
  gameweek: number;
}

// ─── Helper: Build headline from template ───────────────────

function buildHeadline(type: string, data: Record<string, any>, gameweek: number, leagueName: string, variationIndex: number) {
  const headlines = HEADLINES[type];
  if (!headlines) return null;

  const tIdx = variationIndex % headlines.templates.length;
  const sIdx = variationIndex % headlines.subTemplates.length;

  const replacePlaceholders = (str: string) => {
    let result = str;
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value ?? ''));
    }
    result = result.replace(/\{gameweek\}/g, String(gameweek));
    result = result.replace(/\{leagueName\}/g, leagueName);
    return result;
  };

  return {
    headline: replacePlaceholders(headlines.templates[tIdx]),
    subheadline: replacePlaceholders(headlines.subTemplates[sIdx]),
  };
}

// ─── Newsletter Modal ───────────────────────────────────────

function NewsletterModal({ isOpen, onClose, leagueId, leagueName, stories, gameweek }: NewsletterModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          leagueId,
          leagueName,
          stories: stories.slice(0, 6),
          gameweek,
          subscriptionType: 'newsletter'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isDemo) {
          setMessage('Subscription saved! Note: Email service is in demo mode.');
        } else {
          setMessage('Newsletter sent successfully! You\'ve been subscribed for weekly updates.');
        }
        setMessageType('success');
        setEmail('');
        setTimeout(() => { onClose(); setMessage(''); }, 3000);
      } else {
        setMessage(data.details ? `${data.error}: ${data.details}` : data.error || 'Failed to send newsletter');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to send newsletter. Please check your connection.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your League Newsletter!</h2>
          <p className="text-gray-600">Get this week's top headlines delivered to your inbox + weekly updates from {leagueName}</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Send Newsletter & Subscribe</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          You'll receive weekly updates about {leagueName} plus this gameweek's summary
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function EnhancedLeagueStorytelling({ leagueId, gameweek = 6, teams = [], leagueName = '', showImages = true }: EnhancedStorytellingProps) {
  const [stories, setStories] = useState<EnhancedStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<EnhancedStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  useEffect(() => {
    const generateStories = async () => {
      try {
        setIsLoading(true);

        // Fetch squad analysis data
        let squadData: any = null;
        try {
          const res = await fetch(`/api/leagues/${leagueId}/squad-analysis?gameweek=${gameweek}`);
          squadData = res.ok ? await res.json() : null;
        } catch {
          console.warn('Squad analysis unavailable');
        }

        const allStories: EnhancedStory[] = [];
        const seed = leagueId % 5;

        if (squadData?.analysis && teams.length > 0) {
          const analysis = squadData.analysis;

          // ─── 1. GAMEWEEK HERO (>= 70 pts) ────────────
          const hero = analysis
            .filter((t: any) => t.gwTotalPoints >= 70)
            .sort((a: any, b: any) => b.gwTotalPoints - a.gwTotalPoints)[0];

          if (hero) {
            const vi = (seed + 0) % 5;
            const h = buildHeadline('breakthrough', { teamName: hero.team, managerName: hero.manager, points: hero.gwTotalPoints }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.breakthrough;
              allStories.push({
                id: 'hero', type: 'breakthrough', ...h,
                details: `${hero.manager} has absolutely SMASHED gameweek ${gameweek}! A masterful ${hero.gwTotalPoints}-point performance that left the competition in the dust. This is the kind of gameweek that separates champions from pretenders!`,
                teamName: hero.team, managerName: hero.manager, points: hero.gwTotalPoints,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 95,
              });
            }
          }

          // ─── 2. CAPTAINCY MASTERSTROKE (captain >= 12 pts) ──
          const bestCap = analysis
            .filter((t: any) => t.squad?.captain && (t.squad.captain.points * t.squad.captain.multiplier) >= 12)
            .sort((a: any, b: any) => (b.squad.captain.points * b.squad.captain.multiplier) - (a.squad.captain.points * a.squad.captain.multiplier))[0];

          if (bestCap?.squad?.captain) {
            const vi = (seed + 1) % 5;
            const cp = bestCap.squad.captain.points * bestCap.squad.captain.multiplier;
            const h = buildHeadline('masterstroke', { managerName: bestCap.manager, player: bestCap.squad.captain.name, points: cp }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.masterstroke;
              allStories.push({
                id: 'captain-genius', type: 'masterstroke', ...h,
                details: `TACTICAL BRILLIANCE! ${bestCap.manager} showed true FPL mastery by backing ${bestCap.squad.captain.name} with the armband. This bold choice delivered ${cp} points of pure captaincy gold!`,
                teamName: bestCap.team, managerName: bestCap.manager, points: cp,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 85,
              });
            }
          }

          // ─── 3. CAPTAIN CALAMITY (captain <= 4 pts) ───
          const worstCap = analysis
            .filter((t: any) => t.squad?.captain && (t.squad.captain.points * t.squad.captain.multiplier) <= 4)
            .sort((a: any, b: any) => (a.squad.captain.points * a.squad.captain.multiplier) - (b.squad.captain.points * b.squad.captain.multiplier))[0];

          if (worstCap?.squad?.captain) {
            const vi = (seed + 2) % 5;
            const cp = worstCap.squad.captain.points * worstCap.squad.captain.multiplier;
            const h = buildHeadline('disaster', { managerName: worstCap.manager, player: worstCap.squad.captain.name, points: cp }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.disaster;
              allStories.push({
                id: 'captain-disaster', type: 'disaster', ...h,
                details: `HEARTBREAK! ${worstCap.manager} trusted ${worstCap.squad.captain.name} with the armband but received only ${cp} points in return. Sometimes the beautiful game can be cruel.`,
                teamName: worstCap.team, managerName: worstCap.manager, points: cp,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 90,
              });
            }
          }

          // ─── 4. BENCH NIGHTMARE (bench >= 12 pts) ─────
          const benchNightmare = analysis
            .filter((t: any) => t.benchPoints >= 12)
            .sort((a: any, b: any) => b.benchPoints - a.benchPoints)[0];

          if (benchNightmare) {
            const vi = (seed + 3) % 5;
            const topBenchPlayer = benchNightmare.squad?.subs
              ?.sort((a: any, b: any) => b.points - a.points)[0];
            const h = buildHeadline('bench_nightmare', {
              managerName: benchNightmare.manager,
              benchPoints: benchNightmare.benchPoints,
              player: topBenchPlayer?.name || 'a benched player',
            }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.bench_nightmare;
              allStories.push({
                id: 'bench-nightmare', type: 'bench_nightmare', ...h,
                details: `AGONISING! ${benchNightmare.manager} left a staggering ${benchNightmare.benchPoints} points on the bench this gameweek. ${topBenchPlayer ? `${topBenchPlayer.name} scored ${topBenchPlayer.points} points sitting on the pine!` : 'The bench outscored some starting XIs!'} That's the kind of pain that keeps you up at night.`,
                teamName: benchNightmare.team, managerName: benchNightmare.manager, points: benchNightmare.benchPoints,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 88,
              });
            }
          }

          // ─── 5. BOTTLE JOB (dropped >= 3 places) ──────
          const bottleJob = teams
            .filter(t => {
              const curr = t.rank || 99;
              const prev = t.lastWeekRank || curr;
              return curr - prev >= 3;
            })
            .sort((a, b) => {
              const aDrop = (a.rank || 0) - (a.lastWeekRank || a.rank || 0);
              const bDrop = (b.rank || 0) - (b.lastWeekRank || b.rank || 0);
              return bDrop - aDrop;
            })[0];

          if (bottleJob) {
            const vi = (seed + 4) % 5;
            const drop = (bottleJob.rank || 0) - (bottleJob.lastWeekRank || bottleJob.rank || 0);
            const h = buildHeadline('bottle_job', {
              managerName: bottleJob.managerName,
              prevRank: bottleJob.lastWeekRank,
              rank: bottleJob.rank,
              drop,
            }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.bottle_job;
              allStories.push({
                id: 'bottle-job', type: 'bottle_job', ...h,
                details: `A DISASTROUS gameweek for ${bottleJob.managerName}! Dropping ${drop} places from #${bottleJob.lastWeekRank} to #${bottleJob.rank} in ${leagueName}. The question on everyone's lips: can they recover, or is this the beginning of the end?`,
                teamName: bottleJob.teamName, managerName: bottleJob.managerName,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 82,
              });
            }
          }

          // ─── 6. DIFFERENTIAL MASTERCLASS (<10% owned, >= 8 pts) ──
          const diffHeroes: { manager: string; team: string; player: string; ownership: number; points: number }[] = [];
          for (const t of analysis) {
            if (t.playerOwnership) {
              for (const po of t.playerOwnership) {
                if (po.ownership < 10 && po.points >= 8) {
                  diffHeroes.push({ manager: t.manager, team: t.team, player: po.name, ownership: po.ownership, points: po.points });
                }
              }
            }
          }
          const bestDiff = diffHeroes.sort((a, b) => b.points - a.points)[0];

          if (bestDiff) {
            const vi = (seed + 0) % 5;
            const h = buildHeadline('differential', {
              managerName: bestDiff.manager,
              player: bestDiff.player,
              ownership: bestDiff.ownership.toFixed(1),
              points: bestDiff.points,
            }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.differential;
              allStories.push({
                id: 'differential', type: 'differential', ...h,
                details: `GALAXY BRAIN move! ${bestDiff.manager} backed ${bestDiff.player} when only ${bestDiff.ownership.toFixed(1)}% of managers dared. The reward? A stunning ${bestDiff.points}-point haul that rivals could only dream of. This is the kind of differential pick that wins leagues!`,
                teamName: bestDiff.team, managerName: bestDiff.manager, points: bestDiff.points,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 80,
              });
            }
          }

          // ─── 7. CLONE WARS (player owned by >= 80% of league) ──
          const playerCount: Record<string, { name: string; count: number }> = {};
          for (const t of analysis) {
            const allPlayers = [
              ...(t.squad?.starting?.GKP || []),
              ...(t.squad?.starting?.DEF || []),
              ...(t.squad?.starting?.MID || []),
              ...(t.squad?.starting?.FWD || []),
            ];
            for (const p of allPlayers) {
              if (!playerCount[p.name]) playerCount[p.name] = { name: p.name, count: 0 };
              playerCount[p.name].count++;
            }
          }
          const leagueSize = analysis.length;
          const templatePlayer = Object.values(playerCount)
            .filter(p => leagueSize >= 3 && (p.count / leagueSize) >= 0.8)
            .sort((a, b) => b.count - a.count)[0];

          if (templatePlayer) {
            const vi = (seed + 1) % 5;
            const ownershipPct = Math.round((templatePlayer.count / leagueSize) * 100);
            const h = buildHeadline('clone_wars', {
              player: templatePlayer.name,
              ownership: ownershipPct,
            }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.clone_wars;
              allStories.push({
                id: 'clone-wars', type: 'clone_wars', ...h,
                details: `${templatePlayer.name} is now owned by ${ownershipPct}% of managers in ${leagueName}! With the template this settled, the title race will be decided by the brave managers who dare to be different. Who will blink first and sell?`,
                teamName: leagueName, managerName: `${templatePlayer.count}/${leagueSize} managers`,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 65,
              });
            }
          }

          // ─── 8. DERBY DAY (two managers within 3 points) ──
          if (teams.length >= 2) {
            const sorted = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));
            let closestPair: { a: any; b: any; gap: number } | null = null;
            for (let i = 0; i < sorted.length - 1; i++) {
              const gap = Math.abs((sorted[i].points || 0) - (sorted[i + 1].points || 0));
              if (gap <= 3 && (!closestPair || gap < closestPair.gap)) {
                closestPair = { a: sorted[i], b: sorted[i + 1], gap };
              }
            }

            if (closestPair) {
              const vi = (seed + 2) % 5;
              const h = buildHeadline('derby_day', {
                manager1: closestPair.a.managerName,
                manager2: closestPair.b.managerName,
                gap: closestPair.gap,
                s: closestPair.gap === 1 ? '' : 's',
              }, gameweek, leagueName, vi);
              if (h) {
                const cfg = STORY_CONFIGS.derby_day;
                allStories.push({
                  id: 'derby-day', type: 'derby_day', ...h,
                  details: `The TENSION is unbearable! ${closestPair.a.managerName} and ${closestPair.b.managerName} are separated by just ${closestPair.gap} point${closestPair.gap === 1 ? '' : 's'} in ${leagueName}. Every captain choice, every transfer could swing this head-to-head battle. This is what FPL is all about!`,
                  teamName: `${closestPair.a.teamName} vs ${closestPair.b.teamName}`,
                  managerName: `${closestPair.a.managerName} vs ${closestPair.b.managerName}`,
                  icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                  variationIndex: vi, priority: 75,
                });
              }
            }
          }

          // ─── 9. TITLE RACE (top 2 within 30 pts) ──────
          if (teams.length >= 2) {
            const sorted = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));
            const leader = sorted[0];
            const chaser = sorted[1];
            const gap = (leader.points || 0) - (chaser.points || 0);

            if (gap <= 30 && gap > 3) {
              const vi = (seed + 3) % 5;
              const h = buildHeadline('rivalry', {
                leader: leader.managerName,
                chaser: chaser.managerName,
                gap,
              }, gameweek, leagueName, vi);
              if (h) {
                const cfg = STORY_CONFIGS.rivalry;
                allStories.push({
                  id: 'title-race', type: 'rivalry', ...h,
                  details: `The tension is ELECTRIC! ${leader.managerName} leads the championship race, but ${chaser.managerName} is breathing down their neck with just ${gap} points between them. Every transfer decision could swing this epic battle!`,
                  teamName: leader.teamName, managerName: leader.managerName,
                  icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                  variationIndex: vi, priority: 70,
                });
              }
            }
          }

          // ─── 10. SPECTACULAR SURGE (climbed >= 2 places) ──
          const bigClimber = teams
            .filter(t => {
              const curr = t.rank || 99;
              const prev = t.lastWeekRank || curr;
              return prev - curr >= 2;
            })
            .sort((a, b) => {
              const aI = (a.lastWeekRank || a.rank) - a.rank;
              const bI = (b.lastWeekRank || b.rank) - b.rank;
              return bI - aI;
            })[0];

          if (bigClimber) {
            const vi = (seed + 4) % 5;
            const improvement = (bigClimber.lastWeekRank || bigClimber.rank) - bigClimber.rank;
            const h = buildHeadline('underdog', { managerName: bigClimber.managerName, improvement }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.underdog;
              allStories.push({
                id: 'rocket-rise', type: 'underdog', ...h,
                details: `FROM NOWHERE! ${bigClimber.managerName} has pulled off one of the most dramatic surges of the season, climbing ${improvement} positions in a single gameweek!`,
                teamName: bigClimber.teamName, managerName: bigClimber.managerName,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 72,
              });
            }
          }

          // ─── 11. PANIC MERCHANT (transfer cost >= 8) ──
          const panicMerchant = analysis
            .filter((t: any) => t.transfersCost >= 8)
            .sort((a: any, b: any) => b.transfersCost - a.transfersCost)[0];

          if (panicMerchant) {
            const vi = (seed + 0) % 5;
            const h = buildHeadline('panic_merchant', {
              managerName: panicMerchant.manager,
              cost: panicMerchant.transfersCost,
              count: panicMerchant.transfersCount,
            }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.panic_merchant;
              allStories.push({
                id: 'panic-merchant', type: 'panic_merchant', ...h,
                details: `${panicMerchant.manager} has gone NUCLEAR with ${panicMerchant.transfersCount} transfers at a cost of -${panicMerchant.transfersCost} points! Is this a calculated gamble or pure panic? Only time will tell whether this scorched-earth strategy pays off.`,
                teamName: panicMerchant.team, managerName: panicMerchant.manager,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 78,
              });
            }
          }

          // ─── 12. GHOST SHIP (0 transfers this GW, ranked top 5) ──
          const ghostShip = analysis
            .filter((t: any) => t.transfersCount === 0 && t.rank <= 5)
            .sort((a: any, b: any) => a.rank - b.rank)[0];

          if (ghostShip) {
            const vi = (seed + 1) % 5;
            const h = buildHeadline('ghost_ship', {
              managerName: ghostShip.manager,
              rank: ghostShip.rank,
            }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.ghost_ship;
              allStories.push({
                id: 'ghost-ship', type: 'ghost_ship', ...h,
                details: `Patience is a virtue! ${ghostShip.manager} made ZERO transfers this gameweek and is sitting pretty at #${ghostShip.rank} in ${leagueName}. While others panic-buy and take hits, this manager trusts the process. Is this zen mastery or pure luck?`,
                teamName: ghostShip.team, managerName: ghostShip.manager,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 60,
              });
            }
          }

          // ─── 13. ON THE CHARGE (3+ consecutive green arrows) ──
          const charger = analysis
            .filter((t: any) => t.consecutiveGreenArrows >= 3)
            .sort((a: any, b: any) => b.consecutiveGreenArrows - a.consecutiveGreenArrows)[0];

          if (charger) {
            const vi = (seed + 2) % 5;
            const h = buildHeadline('on_the_charge', {
              managerName: charger.manager,
              streak: charger.consecutiveGreenArrows,
            }, gameweek, leagueName, vi);
            if (h) {
              const cfg = STORY_CONFIGS.on_the_charge;
              allStories.push({
                id: 'on-the-charge', type: 'on_the_charge', ...h,
                details: `MOMENTUM! ${charger.manager} is on an incredible ${charger.consecutiveGreenArrows}-week winning streak, climbing the table week after week. This is the kind of form that can carry a manager all the way to glory in ${leagueName}!`,
                teamName: charger.team, managerName: charger.manager,
                icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
                variationIndex: vi, priority: 76,
              });
            }
          }
        }

        // ─── Fallback if no stories generated ──────────
        if (allStories.length === 0) {
          const cfg = STORY_CONFIGS.rivalry;
          allStories.push({
            id: 'default', type: 'rivalry',
            headline: `Gameweek ${gameweek} DRAMA unfolds in ${leagueName}!`,
            subheadline: 'Epic battles and tactical masterstrokes light up the weekend',
            details: 'Another week, another rollercoaster of emotions! The beautiful game delivered its usual mix of triumph and heartbreak.',
            teamName: 'League', managerName: 'All Managers',
            icon: cfg.icon, color: cfg.color, bgColor: cfg.bgColor, image: cfg.image,
            variationIndex: 0, priority: 10,
          });
        }

        // Sort by priority and take top 6
        allStories.sort((a, b) => b.priority - a.priority);
        setStories(allStories.slice(0, 6));
      } catch (error) {
        console.error('Error generating stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateStories();
  }, [leagueId, gameweek, teams, leagueName]);

  // ─── Render ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header with Newsletter Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2 rounded-lg">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top Headlines</h2>
              <p className="text-sm text-gray-600">All the drama from Gameweek {gameweek}</p>
            </div>
          </div>

          <button
            onClick={() => setShowNewsletterModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Mail className="h-5 w-5" />
            <span>Get Newsletter</span>
          </button>
        </div>

        {/* Story Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="group bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left h-64 overflow-hidden"
            >
              {/* Story Image */}
              <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={story.image}
                  alt={story.headline}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                  quality={75}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDMyMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTBCOTgxO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzQjgyRjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIxOTIiIGZpbGw9InVybCgjZ3JhZCkiLz4KPHN2ZyB4PSI1MCUiIHk9IjUwJSIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjQsIC0yNCkiPgo8cGF0aCBkPSJNOSAydjJINy41QzYuMTIgNCAwIDUuMTIgMCA2LjV2MTFDMCAxOC44OCAxLjEyIDIwIDIuNSAyMGgxOWMxLjM4IDAgMi41LTEuMTIgMi41LTIuNXYtMTFDMjQgNS4xMiAyMi44OCA0IDIxLjUgNEgyMFYyaC0ydjJIOFYySDl6TTIgNi41QzIgNi4yMiAyLjIyIDYgMi41IDZoMTlDMjEuNzggNiAyMiA2LjIyIDIyIDYuNXYyLjI1SDJWNi41ek0yIDEwaDIwdjcuNUMyMiAxNy43OCAyMS43OCAxOCAyMS41IDE4aC0xOUMyLjIyIDE4IDIgMTcuNzggMiAxNy41VjEweiIvPgo8L3N2Zz4KPC9zdmc+';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-white">
                  {story.icon}
                </div>
              </div>

              {/* Story Content */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-gray-900 leading-tight" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {story.headline}
                </h3>
                <p className="text-xs font-semibold" style={{
                  color: story.color,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {story.subheadline}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{story.teamName}</span>
                  {story.points && <span className="font-bold">{story.points} pts</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Hero Image */}
            <div className="relative h-64">
              <Image
                src={selectedStory.image}
                alt={selectedStory.headline}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={85}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDY0MCAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9Im1vZGFsR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxMEI5ODE7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNCODJGNjtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjI1NiIgZmlsbD0idXJsKCNtb2RhbEdyYWQpIi8+Cjwvc3ZnPgo=';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center gap-3 mb-2">
                  {selectedStory.icon}
                  <span className="text-sm font-semibold">BREAKING NEWS</span>
                </div>
                <h1 className="text-2xl font-bold leading-tight">{selectedStory.headline}</h1>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-lg font-semibold mb-4" style={{ color: selectedStory.color }}>
                {selectedStory.subheadline}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 leading-relaxed">{selectedStory.details}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{selectedStory.teamName}</div>
                  <div className="text-sm text-gray-600">{selectedStory.managerName}</div>
                </div>
                {selectedStory.points && (
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: selectedStory.color }}>
                      {selectedStory.points}
                    </div>
                    <div className="text-sm text-gray-600">points</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Modal */}
      <NewsletterModal
        isOpen={showNewsletterModal}
        onClose={() => setShowNewsletterModal(false)}
        leagueId={leagueId}
        leagueName={leagueName}
        stories={stories}
        gameweek={gameweek}
      />
    </>
  );
}

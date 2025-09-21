'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Crown, Target, AlertTriangle, Zap, Users, Mail, Send, X } from 'lucide-react';
import Image from 'next/image';

// Enhanced story type mapping with image associations
const getStoryConfig = (type: string) => {
  switch (type) {
    case 'breakthrough':
      return {
        icon: <Crown className="h-6 w-6" />,
        color: '#DC2626',
        bgColor: '#FEF2F2',
        image: '/images/headlines/monster.png'
      };
    case 'masterstroke':
      return {
        icon: <Target className="h-6 w-6" />,
        color: '#059669',
        bgColor: '#ECFDF5',
        image: '/images/headlines/captain.png'
      };
    case 'disaster':
      return {
        icon: <AlertTriangle className="h-6 w-6" />,
        color: '#DC2626',
        bgColor: '#FEF2F2',
        image: '/images/headlines/captain_zero.png'
      };
    case 'rivalry':
      return {
        icon: <Zap className="h-6 w-6" />,
        color: '#7C3AED',
        bgColor: '#F3E8FF',
        image: '/images/headlines/fever_pitch.png'
      };
    case 'underdog':
      return {
        icon: <TrendingUp className="h-6 w-6" />,
        color: '#0891B2',
        bgColor: '#ECFEFF',
        image: '/images/headlines/monster.png'
      };
    default:
      return {
        icon: <Users className="h-6 w-6" />,
        color: '#6B7280',
        bgColor: '#F9FAFB',
        image: '/images/headlines/fever_pitch.png'
      };
  }
};

// ESPN-Style headline variations (5 per type)
const HEADLINE_VARIATIONS = {
  breakthrough: [
    {
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
    }
  ],
  masterstroke: [
    {
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
    }
  ],
  disaster: [
    {
      templates: [
        "😱 {managerName} suffers BRUTAL captain heartbreak!",
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
    }
  ],
  rivalry: [
    {
      templates: [
        "🔥 TITLE RACE REACHES FEVER PITCH!",
        "⚔️ CHAMPIONSHIP WAR: The battle INTENSIFIES!",
        "🥊 HEAVYWEIGHT CLASH: {leader} vs {chaser} goes DOWN TO THE WIRE!",
        "🎭 DRAMA OVERLOAD: Title race becomes EDGE-OF-SEAT thriller!",
        "⚡ ELECTRIC TENSION: Championship fight reaches BOILING POINT!"
      ],
      subTemplates: [
        "Just {gap} points separate the WARRIORS!",
        "{chaser} CLOSES THE GAP - {gap} points behind!",
        "KNIFE-EDGE battle: {gap} points between glory and heartbreak",
        "PULSE-RACING drama with {gap} points the difference",
        "CHAMPIONSHIP THRILLER: {gap} points separate LEGENDS!"
      ]
    }
  ],
  underdog: [
    {
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
    }
  ]
};

interface EnhancedStory {
  id: string;
  type: 'breakthrough' | 'masterstroke' | 'disaster' | 'rivalry' | 'underdog';
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
}

function NewsletterModal({ isOpen, onClose, leagueId, leagueName, stories }: NewsletterModalProps) {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          leagueId,
          leagueName,
          stories: stories.slice(0, 3) // Send top 3 stories
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🎉 Newsletter sent successfully! You\'ve been subscribed for weekly updates.');
        setMessageType('success');
        setEmail('');
        setTimeout(() => {
          onClose();
          setMessage('');
        }, 3000);
      } else {
        setMessage(data.error || 'Failed to send newsletter');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to send newsletter. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📰 Get Your League Newsletter!
          </h2>
          <p className="text-gray-600">
            Get this week's top headlines delivered to your inbox + weekly updates from {leagueName}
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
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
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

export function EnhancedLeagueStorytelling({ leagueId, gameweek = 6, teams = [], leagueName = '', showImages = true }: EnhancedStorytellingProps) {
  const [stories, setStories] = useState<EnhancedStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<EnhancedStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  const generateVariableHeadline = (type: string, data: any, variationIndex: number) => {
    const variations = HEADLINE_VARIATIONS[type as keyof typeof HEADLINE_VARIATIONS];
    if (!variations || variations.length === 0) return null;

    const variation = variations[0];
    const templateIndex = variationIndex % variation.templates.length;
    const subTemplateIndex = variationIndex % variation.subTemplates.length;

    const headline = variation.templates[templateIndex];
    const subheadline = variation.subTemplates[subTemplateIndex];

    // Replace placeholders
    const processedHeadline = headline
      .replace('{teamName}', data.teamName || '')
      .replace('{managerName}', data.managerName || '')
      .replace('{player}', data.player || '')
      .replace('{points}', data.points || '')
      .replace('{gameweek}', gameweek.toString());

    const processedSubheadline = subheadline
      .replace('{teamName}', data.teamName || '')
      .replace('{managerName}', data.managerName || '')
      .replace('{player}', data.player || '')
      .replace('{points}', data.points || '')
      .replace('{leagueName}', leagueName)
      .replace('{leader}', data.leader || '')
      .replace('{chaser}', data.chaser || '')
      .replace('{gap}', data.gap || '')
      .replace('{improvement}', data.improvement || '');

    return { headline: processedHeadline, subheadline: processedSubheadline };
  };

  useEffect(() => {
    const generateEnhancedStories = async () => {
      try {
        setIsLoading(true);

        // Get squad analysis data
        let squadData = null;
        try {
          const squadResponse = await fetch(`/api/leagues/${leagueId}/squad-analysis?gameweek=${gameweek}`);
          squadData = squadResponse.ok ? await squadResponse.json() : null;
        } catch (error) {
          console.warn('Squad analysis unavailable, using fallback stories');
        }

        const enhancedStories: EnhancedStory[] = [];

        if (squadData?.analysis && teams.length > 0) {
          // Generate a random seed based on league ID to ensure consistent but different variations per league
          const leagueSeed = leagueId % 5;

          // 1. 🚨 BREAKING: GAMEWEEK HERO (Monster Performance)
          const gwTopScorer = squadData.analysis
            .filter((team: any) => team.gwTotalPoints >= 70)
            .sort((a: any, b: any) => b.gwTotalPoints - a.gwTotalPoints)[0];

          if (gwTopScorer) {
            const variationIndex = (leagueSeed + 0) % 5;
            const headlineData = generateVariableHeadline('breakthrough', {
              teamName: gwTopScorer.team,
              managerName: gwTopScorer.manager,
              points: gwTopScorer.gwTotalPoints
            }, variationIndex);

            if (headlineData) {
              const config = getStoryConfig('breakthrough');
              enhancedStories.push({
                id: 'breaking-hero',
                type: 'breakthrough',
                headline: headlineData.headline,
                subheadline: headlineData.subheadline,
                details: `${gwTopScorer.manager} has absolutely SMASHED gameweek ${gameweek}! Their tactical genius shone through every selection, delivering a masterful ${gwTopScorer.gwTotalPoints}-point performance that left the competition in the dust. This is the kind of gameweek that separates champions from pretenders!`,
                teamName: gwTopScorer.team,
                managerName: gwTopScorer.manager,
                points: gwTopScorer.gwTotalPoints,
                icon: config.icon,
                color: config.color,
                bgColor: config.bgColor,
                image: config.image,
                variationIndex
              });
            }
          }

          // 2. ⚡ CAPTAINCY MASTERSTROKE
          const bestCaptain = squadData.analysis
            .filter((team: any) => team.squad?.captain && (team.squad.captain.points * team.squad.captain.multiplier) >= 12)
            .sort((a: any, b: any) => (b.squad.captain.points * b.squad.captain.multiplier) - (a.squad.captain.points * a.squad.captain.multiplier))[0];

          if (bestCaptain?.squad?.captain) {
            const variationIndex = (leagueSeed + 1) % 5;
            const captainPoints = bestCaptain.squad.captain.points * bestCaptain.squad.captain.multiplier;
            const headlineData = generateVariableHeadline('masterstroke', {
              managerName: bestCaptain.manager,
              player: bestCaptain.squad.captain.name,
              points: captainPoints
            }, variationIndex);

            if (headlineData) {
              const config = getStoryConfig('masterstroke');
              enhancedStories.push({
                id: 'captain-genius',
                type: 'masterstroke',
                headline: headlineData.headline,
                subheadline: headlineData.subheadline,
                details: `TACTICAL BRILLIANCE! ${bestCaptain.manager} showed true FPL mastery by backing ${bestCaptain.squad.captain.name} with the armband. While others played it safe, this bold choice delivered ${captainPoints} points of pure captaincy gold. This is how legends are made!`,
                teamName: bestCaptain.team,
                managerName: bestCaptain.manager,
                points: captainPoints,
                icon: config.icon,
                color: config.color,
                bgColor: config.bgColor,
                image: config.image,
                variationIndex
              });
            }
          }

          // 3. 💔 CAPTAIN DISASTER
          const captainDisaster = squadData.analysis
            .filter((team: any) => team.squad?.captain && (team.squad.captain.points * team.squad.captain.multiplier) <= 4)
            .sort((a: any, b: any) => (a.squad.captain.points * a.squad.captain.multiplier) - (b.squad.captain.points * b.squad.captain.multiplier))[0];

          if (captainDisaster?.squad?.captain) {
            const variationIndex = (leagueSeed + 2) % 5;
            const captainPoints = captainDisaster.squad.captain.points * captainDisaster.squad.captain.multiplier;
            const headlineData = generateVariableHeadline('disaster', {
              managerName: captainDisaster.manager,
              player: captainDisaster.squad.captain.name,
              points: captainPoints
            }, variationIndex);

            if (headlineData) {
              const config = getStoryConfig('disaster');
              enhancedStories.push({
                id: 'captain-disaster',
                type: 'disaster',
                headline: headlineData.headline,
                subheadline: headlineData.subheadline,
                details: `HEARTBREAK! ${captainDisaster.manager} trusted ${captainDisaster.squad.captain.name} with the armband but received only ${captainPoints} points in return. Sometimes the beautiful game can be cruel, and this was one of those gut-wrenching moments that every FPL manager dreads.`,
                teamName: captainDisaster.team,
                managerName: captainDisaster.manager,
                points: captainPoints,
                icon: config.icon,
                color: config.color,
                bgColor: config.bgColor,
                image: config.image,
                variationIndex
              });
            }
          }

          // 4. 🔥 TITLE RACE DRAMA
          if (teams.length >= 2) {
            const sortedTeams = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));
            const leader = sortedTeams[0];
            const chaser = sortedTeams[1];
            const pointsDiff = (leader.points || 0) - (chaser.points || 0);

            if (pointsDiff <= 30) {
              const variationIndex = (leagueSeed + 3) % 5;
              const headlineData = generateVariableHeadline('rivalry', {
                leader: leader.managerName,
                chaser: chaser.managerName,
                gap: pointsDiff
              }, variationIndex);

              if (headlineData) {
                const config = getStoryConfig('rivalry');
                enhancedStories.push({
                  id: 'title-race',
                  type: 'rivalry',
                  headline: headlineData.headline,
                  subheadline: headlineData.subheadline,
                  details: `The tension is ELECTRIC! ${leader.managerName} leads the championship race, but ${chaser.managerName} is breathing down their neck with just ${pointsDiff} points between them. Every transfer decision, every captain choice could swing this epic battle. This is FPL at its most thrilling!`,
                  teamName: leader.teamName,
                  managerName: leader.managerName,
                  icon: config.icon,
                  color: config.color,
                  bgColor: config.bgColor,
                  image: config.image,
                  variationIndex
                });
              }
            }
          }

          // 5. 🚀 SPECTACULAR SURGE
          const bigClimber = teams
            .filter(team => {
              const currentRank = team.rank || 99;
              const lastRank = team.lastWeekRank || currentRank;
              return lastRank - currentRank >= 2;
            })
            .sort((a, b) => {
              const aImprovement = (a.lastWeekRank || a.rank) - a.rank;
              const bImprovement = (b.lastWeekRank || b.rank) - b.rank;
              return bImprovement - aImprovement;
            })[0];

          if (bigClimber) {
            const variationIndex = (leagueSeed + 4) % 5;
            const improvement = (bigClimber.lastWeekRank || bigClimber.rank) - bigClimber.rank;
            const headlineData = generateVariableHeadline('underdog', {
              managerName: bigClimber.managerName,
              improvement: improvement
            }, variationIndex);

            if (headlineData) {
              const config = getStoryConfig('underdog');
              enhancedStories.push({
                id: 'rocket-rise',
                type: 'underdog',
                headline: headlineData.headline,
                subheadline: headlineData.subheadline,
                details: `FROM NOWHERE! ${bigClimber.managerName} has pulled off one of the most dramatic surges of the season, climbing ${improvement} positions in a single gameweek. This is the kind of momentum that can carry a manager all the way to glory!`,
                teamName: bigClimber.teamName,
                managerName: bigClimber.managerName,
                icon: config.icon,
                color: config.color,
                bgColor: config.bgColor,
                image: config.image,
                variationIndex
              });
            }
          }
        }

        // Add fallback stories if needed
        if (enhancedStories.length === 0) {
          const config = getStoryConfig('rivalry');
          enhancedStories.push({
            id: 'default-drama',
            type: 'rivalry',
            headline: `⚽ Gameweek ${gameweek} DRAMA unfolds in ${leagueName}!`,
            subheadline: `Epic battles and tactical masterstrokes light up the weekend`,
            details: `Another week, another rollercoaster of emotions! The beautiful game delivered its usual mix of triumph and heartbreak across the league.`,
            teamName: 'League',
            managerName: 'All Managers',
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            image: config.image,
            variationIndex: 0
          });
        }

        setStories(enhancedStories.slice(0, 5));
      } catch (error) {
        console.error('Error generating stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateEnhancedStories();
  }, [leagueId, gameweek, teams, leagueName]);

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
              📺
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top Headlines</h2>
              <p className="text-sm text-gray-600">ESPN-style drama from Gameweek {gameweek}</p>
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

        {/* Enhanced Story Cards Grid */}
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
      />
    </>
  );
}
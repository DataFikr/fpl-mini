'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Users, Trophy, Zap } from 'lucide-react';

interface NewsItem {
  id: string;
  type: 'climber' | 'masterstroke' | 'blunder' | 'rivalry';
  headline: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface BreakingNewsProps {
  leagueId: number;
  teams?: any[];
  gameweek?: number;
}

export function BreakingNews({ leagueId, teams = [], gameweek = 2 }: BreakingNewsProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateNewsItems = async () => {
      try {
        setIsLoading(true);
        
        // Fetch squad analysis data for generating news
        const squadResponse = await fetch(`/api/leagues/${leagueId}/squad-analysis?gameweek=${gameweek}`);
        const squadData = squadResponse.ok ? await squadResponse.json() : null;

        const generatedNews: NewsItem[] = [];

        // 1. Biggest Climber
        if (teams.length > 0) {
          // Find team with best rank improvement (assuming we have rank data)
          const topPerformer = teams.reduce((best, team) => {
            const currentRank = team.rank || 1;
            const improvement = (team.lastWeekRank || currentRank) - currentRank;
            return improvement > (best.improvement || 0) ? { ...team, improvement } : best;
          }, { improvement: 0 });

          if (topPerformer.improvement > 0) {
            generatedNews.push({
              id: 'climber',
              type: 'climber',
              headline: `🚀 ${topPerformer.teamName} Surges Up the Table!`,
              description: `Climbed ${topPerformer.improvement} positions to rank #${topPerformer.rank}. ${topPerformer.managerName} is on fire this gameweek!`,
              icon: <TrendingUp className="h-5 w-5" />,
              color: '#10B981',
              bgColor: '#ECFDF5'
            });
          }
        }

        // 2. Captaincy Masterstroke
        if (squadData?.analysis) {
          const bestCaptain = squadData.analysis
            .filter((team: any) => team.captainInfo?.points > 10)
            .sort((a: any, b: any) => (b.captainInfo?.points || 0) - (a.captainInfo?.points || 0))[0];

          if (bestCaptain) {
            generatedNews.push({
              id: 'masterstroke',
              type: 'masterstroke',
              headline: `⚡ Captain's Choice Pays Off Big!`,
              description: `${bestCaptain.teamName}'s captain ${bestCaptain.captainInfo.name} delivered ${bestCaptain.captainInfo.points} points. Masterful selection!`,
              icon: <Zap className="h-5 w-5" />,
              color: '#F59E0B',
              bgColor: '#FFFBEB'
            });
          }
        }

        // 3. Bench Blunder
        if (squadData?.analysis) {
          const biggestBenchPoints = squadData.analysis
            .filter((team: any) => team.benchPoints > 15)
            .sort((a: any, b: any) => b.benchPoints - a.benchPoints)[0];

          if (biggestBenchPoints) {
            generatedNews.push({
              id: 'blunder',
              type: 'blunder',
              headline: `😤 Points Left on the Bench!`,
              description: `${biggestBenchPoints.teamName} has ${biggestBenchPoints.benchPoints} points sitting on their bench. Those selections hurt!`,
              icon: <AlertCircle className="h-5 w-5" />,
              color: '#EF4444',
              bgColor: '#FEF2F2'
            });
          }
        }

        // 4. Rivalry Watch
        if (teams.length >= 2) {
          // Find the two teams closest in points for rivalry drama
          const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
          for (let i = 0; i < sortedTeams.length - 1; i++) {
            const pointsDiff = sortedTeams[i].points - sortedTeams[i + 1].points;
            if (pointsDiff <= 10 && pointsDiff > 0) {
              generatedNews.push({
                id: 'rivalry',
                type: 'rivalry',
                headline: `🔥 Title Race Heating Up!`,
                description: `Only ${pointsDiff} points separate ${sortedTeams[i].teamName} and ${sortedTeams[i + 1].teamName}. Every point counts now!`,
                icon: <Trophy className="h-5 w-5" />,
                color: '#8B5CF6',
                bgColor: '#F3E8FF'
              });
              break;
            }
          }
        }

        // Add default news if we don't have enough
        if (generatedNews.length === 0) {
          generatedNews.push({
            id: 'general',
            type: 'rivalry',
            headline: `⚽ Gameweek ${gameweek} Action Continues!`,
            description: `The Best Man League battle intensifies with every passing gameweek. Who will claim ultimate bragging rights?`,
            icon: <Users className="h-5 w-5" />,
            color: '#3B82F6',
            bgColor: '#EBF8FF'
          });
        }

        setNewsItems(generatedNews);
      } catch (error) {
        console.error('Error generating news:', error);
        // Fallback news
        setNewsItems([{
          id: 'fallback',
          type: 'rivalry',
          headline: `📈 League Updates Available`,
          description: `Check out the latest standings and squad analysis for exciting developments in your league.`,
          icon: <TrendingUp className="h-5 w-5" />,
          color: '#6B7280',
          bgColor: '#F9FAFB'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    generateNewsItems();
  }, [leagueId, teams, gameweek]);

  // Rotate news items every 5 seconds
  useEffect(() => {
    if (newsItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [newsItems.length]);

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#F9FAFB',
        borderRadius: '0.75rem',
        padding: '1rem',
        border: '1px solid #E5E7EB',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          animation: 'pulse 2s infinite',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '1rem',
            height: '1rem',
            backgroundColor: '#D1D5DB',
            borderRadius: '50%'
          }} />
          <div style={{
            width: '200px',
            height: '1rem',
            backgroundColor: '#D1D5DB',
            borderRadius: '0.25rem'
          }} />
        </div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return null;
  }

  const currentNews = newsItems[currentNewsIndex];

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Breaking News Header */}
      <div style={{
        backgroundColor: '#DC2626',
        color: '#FFFFFF',
        padding: '0.5rem 1rem',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{
          width: '0.5rem',
          height: '0.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }} />
        Breaking News
      </div>

      {/* News Content */}
      <div style={{
        padding: '1rem',
        backgroundColor: currentNews.bgColor,
        borderTop: `3px solid ${currentNews.color}`,
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.5s ease-in-out'
      }}>
        <div style={{
          color: currentNews.color,
          marginRight: '0.75rem',
          flexShrink: 0
        }}>
          {currentNews.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#1F2937',
            margin: 0,
            marginBottom: '0.25rem',
            lineHeight: '1.25'
          }}>
            {currentNews.headline}
          </h3>
          <p style={{
            fontSize: '0.75rem',
            color: '#6B7280',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {currentNews.description}
          </p>
        </div>
        
        {/* News Indicator Dots */}
        {newsItems.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '0.25rem',
            marginLeft: '0.75rem'
          }}>
            {newsItems.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: index === currentNewsIndex ? currentNews.color : '#D1D5DB',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
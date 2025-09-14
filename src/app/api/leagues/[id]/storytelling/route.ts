import { NextRequest, NextResponse } from 'next/server';

interface StoryRequest {
  leagueName: string;
  managerNames: string[];
  gameweekData: {
    gameweek: number;
    topScorer: { name: string; team: string; points: number };
    worstPerformer: { name: string; team: string; points: number };
    captainSuccess: { name: string; player: string; points: number } | null;
    captainDisaster: { name: string; player: string; points: number } | null;
    titleRace: { leader: string; chaser: string; gap: number } | null;
  };
}

interface CountryDetection {
  country: string;
  confidence: number;
  culturalContext: string;
  footballSlang: string[];
  references: string[];
}

interface Story {
  id: string;
  type: 'breakthrough' | 'masterstroke' | 'disaster' | 'rivalry' | 'underdog';
  headline: string;
  subheadline: string;
  details: string;
  teamName: string;
  managerName: string;
  points?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const storyData: StoryRequest = await request.json();
    
    // Generate standard ESPN-style breaking news stories
    const stories = generateEspnStories(storyData);

    return NextResponse.json({
      success: true,
      stories,
      countryDetection: {
        country: 'ESPN',
        confidence: 100,
        culturalContext: 'Standard ESPN-style sports journalism',
        footballSlang: ['BREAKING', 'MONSTER', 'EXPLOSIVE', 'MASSIVE', 'INCREDIBLE'],
        references: ['Premier League', 'Fantasy Football', 'FPL', 'Championship']
      },
      method: 'espn_style_storytelling',
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating stories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate stories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate standard ESPN-style stories using templates
function generateEspnStories(storyData: StoryRequest) {
  const stories = [];

  // Story 1: Top Scorer
  if (storyData.gameweekData.topScorer) {
    const top = storyData.gameweekData.topScorer;
    stories.push({
      id: 'top-scorer',
      type: 'breakthrough',
      headline: `🚨 BREAKING: ${top.name} delivers MONSTER gameweek performance!`,
      subheadline: `Absolutely EXPLOSIVE ${top.points}-point haul rocks ${storyData.leagueName}!`,
      details: `INCREDIBLE! ${top.name} has just delivered the performance of the season with a sensational ${top.points}-point explosion! This is the kind of week that separates the champions from the rest - pure fantasy football brilliance that has the entire league talking. When you need a big score, this is exactly how it's done!`,
      teamName: top.team,
      managerName: top.name,
      points: top.points
    });
  }

  // Story 2: Captain Genius
  if (storyData.gameweekData.captainSuccess) {
    const cap = storyData.gameweekData.captainSuccess;
    stories.push({
      id: 'captain-genius',
      type: 'masterstroke',
      headline: `⚡ ${cap.name} pulls off CAPTAINCY MASTERCLASS!`,
      subheadline: `${cap.player} delivers MASSIVE ${cap.points} points with the armband!`,
      details: `What a brilliant move! ${cap.name} showed true fantasy football wisdom by backing ${cap.player} with the captain's armband. The result? A stunning ${cap.points}-point haul that would make any FPL manager proud! This is exactly the kind of tactical brilliance that wins leagues. OUTSTANDING judgment!`,
      teamName: cap.team || '',
      managerName: cap.name,
      points: cap.points
    });
  }

  // Story 3: Captain Disaster  
  if (storyData.gameweekData.captainDisaster) {
    const dis = storyData.gameweekData.captainDisaster;
    stories.push({
      id: 'captain-disaster',
      type: 'disaster',
      headline: `💔 ${dis.name} suffers CAPTAINCY NIGHTMARE!`,
      subheadline: `${dis.player} delivers crushing ${dis.points}-point disappointment`,
      details: `HEARTBREAK! ${dis.name} will be devastated after ${dis.player} managed just ${dis.points} points with the captain's armband. Even the most experienced FPL managers would struggle to watch this unfold. Sometimes the beautiful game can be cruel, but that's what makes those brilliant weeks even sweeter when they come!`,
      teamName: dis.team || '',
      managerName: dis.name,
      points: dis.points
    });
  }

  // Story 4: Title Race
  if (storyData.gameweekData.titleRace) {
    const race = storyData.gameweekData.titleRace;
    stories.push({
      id: 'title-race',
      type: 'rivalry',
      headline: `🔥 Title race reaches FEVER PITCH in ${storyData.leagueName}!`,
      subheadline: `Just ${race.gap} points separate the championship contenders!`,
      details: `The tension is absolutely electric! ${race.leader} holds a slender ${race.gap}-point lead over ${race.chaser}, and you can feel the drama building with every gameweek. This is fantasy football at its finest - every transfer, every captain pick, every team selection could swing this epic battle. Championship-defining stuff!`,
      teamName: '',
      managerName: race.leader
    });
  }

  // Story 5: Worst Performance
  if (storyData.gameweekData.worstPerformer) {
    const worst = storyData.gameweekData.worstPerformer;
    stories.push({
      id: 'worst-performance',
      type: 'disaster',
      headline: `😱 ${worst.name} endures NIGHTMARE gameweek!`,
      subheadline: `Tough ${worst.points}-point week tests manager's resolve`,
      details: `Football can be harsh sometimes, and ${worst.name} knows it better than anyone after this challenging ${worst.points}-point struggle. But as every experienced fantasy manager will tell you, it's the tough weeks that make you appreciate the brilliant ones even more. Chin up - every great manager has been through weeks like this!`,
      teamName: worst.team,
      managerName: worst.name,
      points: worst.points
    });
  }

  return stories.slice(0, 5); // Limit to 5 stories
}
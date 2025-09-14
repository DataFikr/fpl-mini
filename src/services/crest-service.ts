import { prisma } from '@/lib/prisma';
import { FPLApiService } from './fpl-api';

export class CrestService {
  private fplApi: FPLApiService;

  constructor() {
    this.fplApi = new FPLApiService();
  }

  async generateTeamCrest(teamName: string, teamId?: number, forceRegenerate: boolean = false): Promise<string | null> {
    try {
      // Check if crest already exists (unless forcing regeneration)
      if (!forceRegenerate) {
        const existingCrest = await prisma.teamCrest.findUnique({
          where: { teamName: teamName }
        });

        if (existingCrest) {
          return existingCrest.crestUrl;
        }
      }

      // Since Premier League URLs are blocked, always use fallback crests
      // Generate a high-quality SVG crest for this team
      const crestUrl = this.generateFallbackCrest(teamName);
      
      if (crestUrl) {
        // Save to database (update if exists, create if new)
        const crest = await prisma.teamCrest.upsert({
          where: { teamName: teamName },
          update: { crestUrl: crestUrl },
          create: {
            teamName: teamName,
            crestUrl: crestUrl
          }
        });

        return crest.crestUrl;
      }

      return null;
    } catch (error) {
      console.error('Error generating team crest:', error);
      return null;
    }
  }

  private async getFansLeagueCrest(teamName: string, teamId?: number): Promise<string | null> {
    try {
      // Extract first 3 letters from team name for "Fans League" concept
      const first3Letters = teamName.toLowerCase().substring(0, 3);
      
      // Special mappings based on first 3 letters to Premier League teams
      const fansLeagueMappings: Record<string, string> = {
        // Known specific teams
        'kej': 'NEW', // Newcastle United (for ID 5100818, team "kejoryobkejor")
        'jog': 'MUN', // Manchester United (for ID 5093819, team "Jogha Bonito")
        'mer': 'LIV', // Liverpool (for "Meriam Pak Maon")
        'sam': 'TOT', // Tottenham (for "SampanKosong")
        'kic': 'ARS', // Arsenal (for "Kickin' FC")
        'int': 'MCI', // Manchester City (for "Interval")
        'nor': 'NEW', // Newcastle (for "Northen Rovers FC")
        'les': 'CHE', // Chelsea (for "Les Blues")
        'jas': 'LEI', // Leicester (for "Jasmine FC")
        'hot': 'BOU', // Bournemouth (for "Hot Days Ahead FC")
        'joe': 'WOL', // Wolves (for "Joe Branko United")
        'tat': 'BHA', // Brighton (for "TatzAshBurn")
        'kak': 'FUL', // Fulham (for "KakiBangkuFC")
        'awe': 'CRY', // Crystal Palace (for "Awe Donde")
        'dur': 'EVE', // Everton (for "DurianRuntuh14")
        'sit': 'SOU', // Southampton (for "SITEPU FC")
        'kip': 'BRE', // Brentford (for "Kipas Lipas")
        'hon': 'WHU', // West Ham (for "Honeydew")
        'kel': 'AVL', // Aston Villa (for "keladi")
        'syo': 'NFO', // Nottingham Forest (for "syok pod")
        
        // Traditional mappings
        'ars': 'ARS', // Arsenal
        'liv': 'LIV', // Liverpool
        'che': 'CHE', // Chelsea
        'tot': 'TOT', // Tottenham
        'mci': 'MCI', // Manchester City
        'mun': 'MUN', // Manchester United
        'new': 'NEW', // Newcastle
        'whu': 'WHU', // West Ham
        'bri': 'BHA', // Brighton
        'bha': 'BHA', // Brighton
        'cry': 'CRY', // Crystal Palace
        'eve': 'EVE', // Everton
        'ful': 'FUL', // Fulham
        'lee': 'LEE', // Leeds
        'lei': 'LEI', // Leicester
        'wol': 'WOL', // Wolves
        'sou': 'SOU', // Southampton
        'avl': 'AVL', // Aston Villa
        'bre': 'BRE', // Brentford
        'bur': 'BUR', // Burnley
        'wat': 'WAT', // Watford
        'bou': 'BOU', // Bournemouth
        'she': 'SHU', // Sheffield United
        'shu': 'SHU', // Sheffield United
        'lut': 'LUT', // Luton Town
        'nfo': 'NFO', // Nottingham Forest
        'not': 'NFO', // Nottingham Forest
        
        // Common prefixes
        'man': 'MUN', // Manchester (defaults to United)
        'uni': 'MUN', // United (defaults to Manchester United)
        'cit': 'MCI', // City (defaults to Manchester City)
        'spa': 'TOT', // Spurs-related
        'spu': 'TOT', // Spurs
        'gun': 'ARS', // Gunners
        'red': 'LIV', // Reds (defaults to Liverpool)
        'blu': 'CHE', // Blues (defaults to Chelsea)
        'mag': 'NEW', // Magpies
        'ham': 'WHU', // Hammers
        'vil': 'AVL', // Villa
        'for': 'NFO', // Forest
        'pal': 'CRY', // Palace
        'bri': 'BHA', // Brighton (alternative)
      };

      // Check if the first 3 letters match a Premier League team
      const matchedTeamCode = fansLeagueMappings[first3Letters];
      
      if (matchedTeamCode) {
        return `https://resources.premierleague.com/premierleague/badges/50/${matchedTeamCode.toLowerCase()}.png`;
      }

      // Fallback to original logic if no "Fans League" match
      return await this.getFPLTeamCrest(teamName);
    } catch (error) {
      console.error('Error getting fans league crest:', error);
      return await this.getFPLTeamCrest(teamName);
    }
  }

  private async getFPLTeamCrest(teamName: string): Promise<string | null> {
    try {
      // Get bootstrap data to access teams
      const bootstrap = await this.fplApi.getBootstrapData();
      
      // Map of team names/keywords to FPL team codes for crest URLs
      const teamMappings: Record<string, string> = {
        // Arsenal variations
        'arsenal': 'ARS',
        'gunners': 'ARS',
        'afc': 'ARS',
        
        // Liverpool variations  
        'liverpool': 'LIV',
        'reds': 'LIV',
        'lfc': 'LIV',
        
        // Manchester City variations
        'city': 'MCI',
        'manchester city': 'MCI',
        'man city': 'MCI',
        'mcfc': 'MCI',
        
        // Manchester United variations
        'united': 'MUN',
        'manchester united': 'MUN',
        'man united': 'MUN',
        'mufc': 'MUN',
        
        // Chelsea variations
        'chelsea': 'CHE',
        'blues': 'CHE',
        'cfc': 'CHE',
        
        // Tottenham variations
        'tottenham': 'TOT',
        'spurs': 'TOT',
        'thfc': 'TOT',
        
        // Newcastle variations
        'newcastle': 'NEW',
        'magpies': 'NEW',
        'nufc': 'NEW',
        
        // Other teams
        'west ham': 'WHU',
        'brighton': 'BHA',
        'crystal palace': 'CRY',
        'everton': 'EVE',
        'fulham': 'FUL',
        'leeds': 'LEE',
        'leicester': 'LEI',
        'wolves': 'WOL',
        'southampton': 'SOU',
        'aston villa': 'AVL',
        'brentford': 'BRE',
        'burnley': 'BUR',
        'norwich': 'NOR',
        'watford': 'WAT'
      };

      // Find matching team
      const teamNameLower = teamName.toLowerCase();
      let matchedTeamCode: string | null = null;

      // Check for exact matches first
      for (const [keyword, code] of Object.entries(teamMappings)) {
        if (teamNameLower.includes(keyword)) {
          matchedTeamCode = code;
          break;
        }
      }

      // If no match found, try to find from FPL teams data
      if (!matchedTeamCode) {
        const fplTeam = bootstrap.teams.find(team => 
          teamNameLower.includes(team.name.toLowerCase()) ||
          teamNameLower.includes(team.short_name.toLowerCase())
        );
        
        if (fplTeam) {
          matchedTeamCode = fplTeam.short_name;
        }
      }

      if (matchedTeamCode) {
        // Return the official Premier League crest URL
        return `https://resources.premierleague.com/premierleague/badges/50/${matchedTeamCode.toLowerCase()}.png`;
      }

      return null;
    } catch (error) {
      console.error('Error getting FPL team crest:', error);
      return null;
    }
  }

  async getCrestForTeam(teamName: string): Promise<string | null> {
    try {
      const crest = await prisma.teamCrest.findUnique({
        where: { teamName: teamName }
      });

      return crest?.crestUrl || null;
    } catch (error) {
      console.error('Error fetching team crest:', error);
      return null;
    }
  }

  async generateCrestWithFallback(teamName: string, teamId?: number, forceRegenerate: boolean = false): Promise<string> {
    const crestUrl = await this.generateTeamCrest(teamName, teamId, forceRegenerate);
    
    if (crestUrl) {
      return crestUrl;
    }

    // Fallback to a default crest based on team name initials
    return this.generateFallbackCrest(teamName);
  }

  async generateCrestsForAllTeams(teamNames: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    console.log(`Generating crests for ${teamNames.length} teams...`);
    
    for (const teamName of teamNames) {
      try {
        const crestUrl = await this.generateCrestWithFallback(teamName, undefined, true); // Force regenerate
        results[teamName] = crestUrl;
        console.log(`Generated crest for ${teamName}: ${crestUrl.substring(0, 50)}...`);
      } catch (error) {
        console.error(`Failed to generate crest for ${teamName}:`, error);
        // Ensure every team gets a crest, even if generation fails
        results[teamName] = this.generateFallbackCrest(teamName);
      }
    }
    
    return results;
  }

  private generateFallbackCrest(teamName: string): string {
    const initials = teamName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);

    // Generate a variety of football-themed SVG crests with team initials
    const colorPairs = [
      { primary: '#DC2626', secondary: '#FECACA' }, // Red
      { primary: '#059669', secondary: '#A7F3D0' }, // Green
      { primary: '#2563EB', secondary: '#DBEAFE' }, // Blue
      { primary: '#7C3AED', secondary: '#E9D5FF' }, // Purple
      { primary: '#EA580C', secondary: '#FED7AA' }, // Orange
      { primary: '#BE185D', secondary: '#FECDD3' }, // Pink
      { primary: '#0891B2', secondary: '#A5F3FC' }, // Cyan
      { primary: '#65A30D', secondary: '#D9F99D' }, // Lime
      { primary: '#4F46E5', secondary: '#C7D2FE' }, // Indigo
      { primary: '#C2410C', secondary: '#FDBA74' }  // Amber
    ];
    
    const colorIndex = teamName.length % colorPairs.length;
    const colors = colorPairs[colorIndex];
    
    // Different shield designs based on team name
    const shieldVariants = [
      `M100 15 L175 45 L175 115 Q175 160 100 185 Q25 160 25 115 L25 45 Z`, // Classic shield
      `M100 20 L170 50 L170 130 Q170 170 100 180 Q30 170 30 130 L30 50 Z`, // Rounded shield
      `M100 10 L180 40 L180 120 L160 160 L100 190 L40 160 L20 120 L20 40 Z`, // Angular shield
    ];
    
    const shieldIndex = (teamName.charCodeAt(0) + teamName.charCodeAt(1 % teamName.length)) % shieldVariants.length;
    const shieldPath = shieldVariants[shieldIndex];
    
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad_${teamName.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.primary}AA;stop-opacity:1" />
          </linearGradient>
          <radialGradient id="ball_${teamName.replace(/\s+/g, '')}" cx="50%" cy="40%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
          </radialGradient>
        </defs>
        
        <!-- Shield background with shadow -->
        <path d="${shieldPath}" 
              fill="url(#grad_${teamName.replace(/\s+/g, '')})" 
              stroke="#ffffff" 
              stroke-width="3"
              filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.3))"/>
        
        <!-- Inner border -->
        <path d="${shieldPath}" 
              fill="none" 
              stroke="${colors.secondary}" 
              stroke-width="2"
              transform="scale(0.9) translate(10, 10)"/>
        
        <!-- Football -->
        <circle cx="100" cy="85" r="22" 
                fill="url(#ball_${teamName.replace(/\s+/g, '')})" 
                stroke="#333" stroke-width="1.5"/>
        <path d="M85 80 L115 80 M100 65 L100 105 M90 73 L110 97 M110 73 L90 97" 
              stroke="#333" stroke-width="1.5" fill="none"/>
        
        <!-- Team initials with better styling -->
        <text x="100" y="145" 
              font-family="Arial Black, Arial, sans-serif" 
              font-size="28" 
              font-weight="900" 
              text-anchor="middle" 
              fill="#ffffff" 
              stroke="#333" 
              stroke-width="0.5"
              letter-spacing="2">${initials}</text>
        
        <!-- Small stars for decoration -->
        <circle cx="70" cy="60" r="2" fill="${colors.secondary}" opacity="0.8"/>
        <circle cx="130" cy="60" r="2" fill="${colors.secondary}" opacity="0.8"/>
        <circle cx="100" cy="45" r="1.5" fill="${colors.secondary}" opacity="0.6"/>
      </svg>
    `;

    // Convert SVG to data URL
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    
    return svgDataUrl;
  }
}
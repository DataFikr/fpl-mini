// Maps FPL short_name to Kitbag URL slug
const KITBAG_TEAM_SLUGS: Record<string, string> = {
  'ARS': 'arsenal',
  'AVL': 'aston-villa',
  'BOU': 'afc-bournemouth',
  'BRE': 'brentford',
  'BHA': 'brighton-and-hove-albion',
  'CHE': 'chelsea',
  'CRY': 'crystal-palace',
  'EVE': 'everton',
  'FUL': 'fulham',
  'IPS': 'ipswich-town',
  'LEI': 'leicester-city',
  'LIV': 'liverpool',
  'MCI': 'manchester-city',
  'MUN': 'manchester-united',
  'NFO': 'nottingham-forest',
  'NEW': 'newcastle-united',
  'SOU': 'southampton',
  'TOT': 'tottenham-hotspur',
  'WHU': 'west-ham-united',
  'WOL': 'wolverhampton-wanderers',
  // Full name fallbacks
  'Arsenal': 'arsenal',
  'Aston Villa': 'aston-villa',
  'Bournemouth': 'afc-bournemouth',
  'Brentford': 'brentford',
  'Brighton': 'brighton-and-hove-albion',
  'Chelsea': 'chelsea',
  'Crystal Palace': 'crystal-palace',
  'Everton': 'everton',
  'Fulham': 'fulham',
  'Ipswich': 'ipswich-town',
  'Leicester': 'leicester-city',
  'Liverpool': 'liverpool',
  'Man City': 'manchester-city',
  'Man Utd': 'manchester-united',
  "Nott'm Forest": 'nottingham-forest',
  'Newcastle': 'newcastle-united',
  'Southampton': 'southampton',
  'Spurs': 'tottenham-hotspur',
  'West Ham': 'west-ham-united',
  'Wolves': 'wolverhampton-wanderers',
};

export function getKitbagUrl(teamName: string): string {
  const slug = KITBAG_TEAM_SLUGS[teamName] || teamName.toLowerCase().replace(/\s+/g, '-');
  return `https://www.kitbag.com/en/premier-league/${slug}/`;
}

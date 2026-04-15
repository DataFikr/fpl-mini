// Base affiliate link from Impact.com / Fanatics (v3 — paths synced with Affiliate.md 2026-04-14)
const KITBAG_AFFILIATE_BASE = 'https://kitbag.evyy.net/2RjWR0';

// Map FPL Team ID to Kitbag's specific URL path
const kitbagTeamMapping: { [key: number]: string } = {
  1: "arsenal/football-kits/o-32081506+t-14639025+d-3450255+z-9-3136673921",
  2: "aston-villa/o-32205917+t-42657593+z-990-600420455",
  3: "bournemouth/o-19766981+t-69106041+z-93-2775263124",
  4: "brentford/o-42767070+t-92873730+z-93-3457121921",
  5: "brighton-and-hove-albion/o-42093692+t-58988263+z-8-2514150529",
  6: "chelsea/football-kits/o-43204817+t-76555113+d-7838378+z-9-3525597288",
  7: "crystal-palace/tops/o-21644895+t-54364770+d-9038120+z-9-3119968183",
  8: "everton/football-kits-socks/o-32425951+t-31980176+d-238309-44920+z-8-2544150529",
  9: "fulham/o-08873136+t-70433725+z-91-2453526142",
  10: "ipswich-town/o-32101416+t-25654893+z-92-3156123924",
  11: "leicester-city/o-20092215+t-47321593+z-99-3104204556",
  12: "liverpool/football-kits/o-23871581+t-70542614+d-5645367+z-9-2162594211",
  13: "manchester-city/football-kits/o-32641595+t-81758955+d-1283215+z-9-1180625011",
  14: "manchester-united/o-43084851+t-69861246+z-929-1306218906",
  15: "newcastle-united/o-19321586+t-70542613+d-345025+z-9-2162594211",
  16: "nottingham-forest/o-21981506+t-58273614+z-92-3156123924",
  17: "southampton/o-32101586+t-47321613+d-345025+z-9-2162594211",
  18: "tottenham-hotspur/football-kits/o-31211516+t-70322614+d-345025+z-9-2162594211",
  19: "west-ham-united/o-19321506+t-47321614+z-92-3156123924",
  20: "wolverhampton-wanderers/o-21981586+t-58273613+d-345025+z-9-2162594211",
};

// Map FPL Team ID to team primary color (hex)
export const teamPrimaryColors: { [key: number]: string } = {
  1: '#EF0107',  // Arsenal red
  2: '#670E36',  // Aston Villa claret
  3: '#DA291C',  // Bournemouth red
  4: '#E30613',  // Brentford red
  5: '#0057B8',  // Brighton blue
  6: '#034694',  // Chelsea blue
  7: '#1B458F',  // Crystal Palace blue
  8: '#003399',  // Everton blue
  9: '#000000',  // Fulham black
  10: '#0044AA', // Ipswich blue
  11: '#003090', // Leicester blue
  12: '#C8102E', // Liverpool red
  13: '#6CABDD', // Man City sky blue
  14: '#DA291C', // Man United red
  15: '#241F20', // Newcastle black
  16: '#DD0000', // Nottingham Forest red
  17: '#D71920', // Southampton red
  18: '#132257', // Spurs navy
  19: '#7A263A', // West Ham claret
  20: '#FDB913', // Wolves gold
};

/**
 * Generate an affiliate deep-link for a player's team on Kitbag.
 * Uses the Impact.com tracking base URL with an encoded destination.
 */
export function getKitbagUrl(teamId: number): string {
  const teamPath = kitbagTeamMapping[teamId];
  if (!teamPath) {
    // Fallback to base affiliate link
    return KITBAG_AFFILIATE_BASE;
  }
  const destinationUrl = `https://www.kitbag.com/en/premier-league/${teamPath}`;
  const encodedUrl = encodeURIComponent(destinationUrl);
  return `${KITBAG_AFFILIATE_BASE}?u=${encodedUrl}`;
}

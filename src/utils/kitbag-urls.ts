// Base affiliate link from Impact.com / Fanatics (v4 — paths verified by user 2026-04-15)
const KITBAG_AFFILIATE_BASE = 'https://kitbag.evyy.net/2RjWR0';

// Map FPL Team ID to Kitbag's specific URL path
// 1=ARS, 2=AVL, 3=BOU, 4=BRE, 5=BHA, 6=BUR, 7=CHE, 8=CRY, 9=EVE, 10=FUL,
// 11=LEE, 12=LIV, 13=MCI, 14=MUN, 15=NEW, 16=NFO, 17=SUN, 18=TOT, 19=WHU, 20=WOL
const kitbagTeamMapping: { [key: number]: string } = {
  1: "arsenal/o-54310484+t-47520158+z-81-746375396",
  2: "aston-villa/o-32205917+t-42657593+z-990-600420455",
  3: "bournemouth/o-19766981+t-69106041+z-93-2775263124",
  4: "brentford/o-42767070+t-92873730+z-93-3457121921",
  5: "brighton-and-hove-albion/o-42093692+t-58988263+z-8-2514150529",
  6: "burnley/o-10643751+t-98211304+z-901-2807681147",
  7: "chelsea/o-10206073+t-43996280+z-987-1427068653",
  8: "crystal-palace/o-87754862+t-98471470+z-84-2177508385",
  9: "everton/o-32207140+t-42212343+z-902-4145335992",
  10: "fulham/o-08873136+t-70433725+z-91-2453526142",
  11: "leeds-united/o-21087106+t-98622396+z-980-2037644477",
  12: "liverpool/o-76979384+t-69751129+z-84-3221256297",
  13: "manchester-city/o-10868273+t-36978944+z-960-2746739175",
  14: "manchester-united/o-43084851+t-69861246+z-929-1306218906",
  15: "newcastle-united/o-10754839+t-81316813+z-978-1772729556",
  16: "nottingham-forest/o-10648284+t-65639334+z-995-2041109111",
  17: "sunderland/o-65426028+t-64105319+z-82-1688433481",
  18: "tottenham-hotspur/o-87316006+t-25979625+z-7-1190775184",
  19: "west-ham-united/o-32202684+t-98773409+z-905-852504840",
  20: "wolverhampton-wanderers/o-32647195+t-76510091+z-906-1145136771",
};

// Map FPL Team ID to team primary color (hex)
export const teamPrimaryColors: { [key: number]: string } = {
  1: '#EF0107',  // Arsenal red
  2: '#670E36',  // Aston Villa claret
  3: '#DA291C',  // Bournemouth red
  4: '#E30613',  // Brentford red
  5: '#0057B8',  // Brighton blue
  6: '#6C1D45', // Burnley claret
  7: '#034694',  // Chelsea blue
  8: '#1B458F',  // Crystal Palace blue
  9: '#003399',  // Everton blue
  10: '#000000', // Fulham black
  11: '#FFCD00', // Leeds yellow
  12: '#C8102E', // Liverpool red
  13: '#6CABDD', // Man City sky blue
  14: '#DA291C', // Man United red
  15: '#241F20', // Newcastle black
  16: '#DD0000', // Nottingham Forest red
  17: '#EB172B', // Sunderland red
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

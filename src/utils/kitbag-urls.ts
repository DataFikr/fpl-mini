// Base affiliate link from Impact.com / Fanatics (v4 — paths verified by user 2026-04-15)
const KITBAG_AFFILIATE_BASE = 'https://kitbag.evyy.net/2RjWR0';

/**
 * Map FPL team SHORT NAME to team primary colour (hex).
 *
 * Short-keyed for the same reason the Kitbag paths are: FPL reassigns team `id`
 * every season, so an id-keyed colour table silently starts painting clubs in
 * each other's colours the moment the promoted sides shuffle the ordering.
 */
export const teamPrimaryColorByShort: { [short: string]: string } = {
  ARS: '#EF0107', // Arsenal red
  AVL: '#670E36', // Aston Villa claret
  BOU: '#DA291C', // Bournemouth red
  BRE: '#E30613', // Brentford red
  BHA: '#0057B8', // Brighton blue
  BUR: '#6C1D45', // Burnley claret
  CHE: '#034694', // Chelsea blue
  COV: '#6CB4EE', // Coventry sky blue
  CRY: '#1B458F', // Crystal Palace blue
  EVE: '#003399', // Everton blue
  FUL: '#000000', // Fulham black
  HUL: '#F18A00', // Hull amber
  IPS: '#0044A0', // Ipswich blue
  LEE: '#FFCD00', // Leeds yellow
  LIV: '#C8102E', // Liverpool red
  MCI: '#6CABDD', // Man City sky blue
  MUN: '#DA291C', // Man United red
  NEW: '#241F20', // Newcastle black
  NFO: '#DD0000', // Nottingham Forest red
  SUN: '#EB172B', // Sunderland red
  TOT: '#132257', // Spurs navy
  WHU: '#7A263A', // West Ham claret
  WOL: '#FDB913', // Wolves gold
};

/**
 * Map FPL team SHORT NAME to Kitbag's URL path — the single source of truth for
 * every Kitbag deep-link on the site.
 *
 * Keyed by `short_name` because FPL reassigns team `id` every season
 * (promotions/relegations shuffle the alphabetical order), so an id-keyed table
 * goes stale and starts resolving clubs to each other's stores.
 *
 * COVERAGE GAP — the 2026/27 promoted clubs (COV, HUL, IPS) have no entry here.
 * Their Kitbag paths carry opaque Fanatics facet ids (the `o-…+t-…+z-…`
 * segments) that cannot be derived or guessed, and kitbag.com serves 403 to
 * automated requests, so they could not be verified. Callers must gate on
 * `hasKitbagTeam()` rather than render a CTA that silently lands on the generic
 * Kitbag homepage. To close the gap: copy each club's store URL from the
 * Impact/Kitbag dashboard and add the path segment after `/en/premier-league/`.
 */
const kitbagPathByShort: { [short: string]: string } = {
  ARS: 'arsenal/o-54310484+t-47520158+z-81-746375396',
  AVL: 'aston-villa/o-32205917+t-42657593+z-990-600420455',
  BOU: 'bournemouth/o-19766981+t-69106041+z-93-2775263124',
  BRE: 'brentford/o-42767070+t-92873730+z-93-3457121921',
  BHA: 'brighton-and-hove-albion/o-42093692+t-58988263+z-8-2514150529',
  BUR: 'burnley/o-10643751+t-98211304+z-901-2807681147',
  CHE: 'chelsea/o-10206073+t-43996280+z-987-1427068653',
  CRY: 'crystal-palace/o-87754862+t-98471470+z-84-2177508385',
  EVE: 'everton/o-32207140+t-42212343+z-902-4145335992',
  FUL: 'fulham/o-08873136+t-70433725+z-91-2453526142',
  LEE: 'leeds-united/o-21087106+t-98622396+z-980-2037644477',
  LIV: 'liverpool/o-76979384+t-69751129+z-84-3221256297',
  MCI: 'manchester-city/o-10868273+t-36978944+z-960-2746739175',
  MUN: 'manchester-united/o-43084851+t-69861246+z-929-1306218906',
  NEW: 'newcastle-united/o-10754839+t-81316813+z-978-1772729556',
  NFO: 'nottingham-forest/o-10648284+t-65639334+z-995-2041109111',
  SUN: 'sunderland/o-65426028+t-64105319+z-82-1688433481',
  TOT: 'tottenham-hotspur/o-87316006+t-25979625+z-7-1190775184',
  WHU: 'west-ham-united/o-32202684+t-98773409+z-905-852504840',
  WOL: 'wolverhampton-wanderers/o-32647195+t-76510091+z-906-1145136771',
};

function buildAffiliateUrl(teamPath: string | undefined): string {
  if (!teamPath) return KITBAG_AFFILIATE_BASE; // fallback to base affiliate link
  const destinationUrl = `https://www.kitbag.com/en/premier-league/${teamPath}`;
  return `${KITBAG_AFFILIATE_BASE}?u=${encodeURIComponent(destinationUrl)}`;
}

/**
 * Generate an affiliate deep-link for a club's page on Kitbag, by FPL team
 * short name (e.g. "ARS"). Season-stable — preferred for new code.
 *
 * Falls back to the generic affiliate base for a club with no verified path, so
 * gate any club-specific CTA ("Shop HUL on Kitbag") on `hasKitbagTeam()` first —
 * otherwise the button promises a club store and delivers the homepage.
 */
export function getKitbagUrlByShort(short: string): string {
  return buildAffiliateUrl(kitbagPathByShort[(short || '').toUpperCase()]);
}

/**
 * Whether a club has a verified Kitbag store path. Use this to decide whether to
 * render a club-branded affiliate CTA at all — see the coverage-gap note on
 * `kitbagPathByShort`.
 */
export function hasKitbagTeam(short: string): boolean {
  return Boolean(kitbagPathByShort[(short || '').toUpperCase()]);
}

/**
 * FPL team `id` → `short_name` for the CURRENT season only.
 *
 * FPL numbers teams alphabetically and renumbers them every summer, so this
 * table is season-scoped and must be refreshed whenever the promoted clubs
 * change. Verified against `bootstrap-static` for 2026/27 on 2026-08-27.
 *
 * @deprecated Only exists to keep the id-keyed `getKitbagUrl` working. Pass a
 * `short_name` and call `getKitbagUrlByShort` instead — it never goes stale.
 */
const TEAM_SHORT_BY_ID_2026_27: { [id: number]: string } = {
  1: 'ARS', 2: 'AVL', 3: 'BOU', 4: 'BRE', 5: 'BHA',
  6: 'CHE', 7: 'COV', 8: 'CRY', 9: 'EVE', 10: 'FUL',
  11: 'HUL', 12: 'IPS', 13: 'LEE', 14: 'LIV', 15: 'MCI',
  16: 'MUN', 17: 'NEW', 18: 'NFO', 19: 'TOT', 20: 'SUN',
};

/**
 * Generate an affiliate deep-link for a player's team on Kitbag, by FPL team id.
 *
 * @deprecated `id` is season-volatile — prefer `getKitbagUrlByShort`. Resolving
 * through `TEAM_SHORT_BY_ID_2026_27` keeps this honest for the current season,
 * but it will need updating every summer, which is exactly why callers should
 * pass a short name instead.
 */
export function getKitbagUrl(teamId: number): string {
  return getKitbagUrlByShort(TEAM_SHORT_BY_ID_2026_27[teamId] ?? '');
}

/**
 * Append Impact (evyy.net) sub-affiliate tracking params to a Kitbag link so
 * clicks can be attributed by placement in the Impact dashboard. `subId1` is the
 * placement (e.g. "kit-hub"), `subId2` the item/context (e.g. "ARS"). Reconciled
 * against the GA4 `affiliate_click` event — see src/components/ui/affiliate-link.tsx.
 */
export function withKitbagSubIds(url: string, subId1?: string, subId2?: string): string {
  try {
    const u = new URL(url);
    if (subId1) u.searchParams.set('subId1', subId1);
    if (subId2) u.searchParams.set('subId2', subId2);
    return u.toString();
  } catch {
    return url;
  }
}

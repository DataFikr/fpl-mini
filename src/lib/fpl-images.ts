/**
 * FPL Image Helpers
 *
 * Sources official, public, current-season imagery from the Premier League
 * resources CDN. These URLs are stable, require no API key, and always reflect
 * the player's current club/kit, so they are the safe default for newsletters
 * and the on-site Breaking News ticker.
 *
 *   Player photo : https://resources.premierleague.com/premierleague/photos/players/<size>/p<code>.png
 *   Club badge   : https://resources.premierleague.com/premierleague/badges/<size>/t<code>.png
 *
 * `code` is the element/team `code` field from the FPL bootstrap-static feed
 * (NOT the `id`). For players the `photo` field ("118748.jpg") also yields the
 * code by stripping the extension.
 */

const PL_CDN = 'https://resources.premierleague.com/premierleague';

export type PlayerPhotoSize = '110x140' | '250x250';
export type BadgeSize = 25 | 50 | 70;

/** Official player headshot in current club kit. */
export function getPlayerPhotoUrl(
  codeOrPhoto: number | string | null | undefined,
  size: PlayerPhotoSize = '250x250'
): string | null {
  if (codeOrPhoto === null || codeOrPhoto === undefined || codeOrPhoto === '') return null;
  // Accept a raw code (118748) or a `photo` value ("118748.jpg").
  const code = String(codeOrPhoto).replace(/\.(png|jpg|jpeg)$/i, '');
  if (!/^\d+$/.test(code)) return null;
  return `${PL_CDN}/photos/players/${size}/p${code}.png`;
}

/** Official Premier League club badge. */
export function getClubBadgeUrl(teamCode: number | null | undefined, size: BadgeSize = 50): string | null {
  if (!teamCode) return null;
  return `${PL_CDN}/badges/${size}/t${teamCode}.png`;
}

/**
 * Official FPL kit-shirt image for a club (the pitch-view shirts). `teamCode`
 * is the bootstrap team `code`. Goalkeepers get the `_1` keeper variant.
 *   outfield: shirt_{code}-66.png   keeper: shirt_{code}_1-66.png
 */
export function getKitShirtUrl(teamCode: number | null | undefined, isGoalkeeper = false, size: 66 | 110 | 220 = 110): string | null {
  if (!teamCode) return null;
  const variant = isGoalkeeper ? '_1' : '';
  return `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${teamCode}${variant}-${size}.png`;
}

/**
 * Minimal element shape we read from bootstrap-static. The project's FPLPlayer
 * type omits `code`/`photo`, but the live API returns them — hence the loose
 * extra fields here.
 */
export interface BootstrapElementLike {
  web_name?: string;
  first_name?: string;
  second_name?: string;
  code?: number;
  photo?: string;
  team?: number;
}

function normalise(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z\s]/g, '')
    .trim();
}

/**
 * Find an official player photo by (web) name. Used to attach a face to a
 * Breaking News headline like "Haaland delivers MONSTER captaincy haul".
 * Returns null when no confident match is found — callers should fall back
 * to a club badge or themed placeholder rather than show a wrong face.
 */
export function findPlayerPhotoByName(
  name: string | null | undefined,
  elements: BootstrapElementLike[] | null | undefined
): string | null {
  if (!name || !elements || elements.length === 0) return null;
  const target = normalise(name);
  if (!target) return null;

  // 1) exact web_name match (most reliable: "Haaland", "Saka")
  let match = elements.find((el) => el.web_name && normalise(el.web_name) === target);

  // 2) full-name contains the searched token(s)
  if (!match) {
    match = elements.find((el) => {
      const full = normalise(`${el.first_name ?? ''} ${el.second_name ?? ''} ${el.web_name ?? ''}`);
      return target.split(/\s+/).every((tok) => tok.length > 2 && full.includes(tok));
    });
  }

  if (!match) return null;
  return getPlayerPhotoUrl(match.code ?? match.photo);
}

/**
 * Scan a block of story text (headline + details) for the first current PL
 * player mentioned and return their official photo URL. Lets us attach a real
 * "player in action" face to ESPN-style breaking-news copy that embeds names.
 */
export function findPlayerPhotoInText(
  text: string | null | undefined,
  elements: BootstrapElementLike[] | null | undefined
): { photoUrl: string; playerName: string } | null {
  if (!text || !elements || elements.length === 0) return null;
  const haystack = normalise(text);
  if (!haystack) return null;

  // Prefer longer web_names first to avoid matching short substrings.
  const candidates = elements
    .filter((el) => el.web_name && el.web_name.length >= 3)
    .sort((a, b) => (b.web_name!.length - a.web_name!.length));

  for (const el of candidates) {
    const token = normalise(el.web_name!);
    if (!token || token.length < 3) continue;
    // Word-boundary-ish check on the normalised (letters + spaces) haystack.
    if (new RegExp(`(^|\\s)${token}(\\s|$)`).test(haystack)) {
      const photoUrl = getPlayerPhotoUrl(el.code ?? el.photo);
      if (photoUrl) return { photoUrl, playerName: el.web_name! };
    }
  }
  return null;
}

/** Themed gradient + emoji fallback when no official image is available. */
export const STORY_THEME: Record<string, { emoji: string; gradient: string; accent: string }> = {
  breakthrough: { emoji: '🚀', gradient: 'linear-gradient(135deg,#10B981,#059669)', accent: '#10B981' },
  masterstroke: { emoji: '⚡', gradient: 'linear-gradient(135deg,#F59E0B,#D97706)', accent: '#F59E0B' },
  disaster:     { emoji: '💔', gradient: 'linear-gradient(135deg,#EF4444,#B91C1C)', accent: '#EF4444' },
  blunder:      { emoji: '😤', gradient: 'linear-gradient(135deg,#EF4444,#B91C1C)', accent: '#EF4444' },
  rivalry:      { emoji: '🔥', gradient: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', accent: '#8B5CF6' },
  climber:      { emoji: '📈', gradient: 'linear-gradient(135deg,#10B981,#059669)', accent: '#10B981' },
  underdog:     { emoji: '🐶', gradient: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', accent: '#3B82F6' },
};

export function getStoryTheme(type: string) {
  return STORY_THEME[type] ?? { emoji: '⚽', gradient: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', accent: '#3B82F6' };
}

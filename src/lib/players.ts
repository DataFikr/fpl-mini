/**
 * Player pSEO data (I5). Builds the /players/[slug] page model from the official
 * FPL bootstrap + fixtures, reusing the squad predictor's projection so the xPts
 * teaser matches the rest of the app. No player photos are used (copyright).
 */
import { FPLApiService } from '@/services/fpl-api';
import { buildFixtureContext, projectPlayer } from '@/app/app/_lib/prediction';

const POS: Record<number, string> = { 1: 'Goalkeeper', 2: 'Defender', 3: 'Midfielder', 4: 'Forward' };
const POS_SHORT: Record<number, string> = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };

export function slugify(s: string): string {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export function playerSlug(el: any): string {
  return slugify(`${el.first_name} ${el.second_name}`) || slugify(el.web_name);
}

export interface FdrFixture { gw: number; opp: string; short: string; home: boolean; diff: number }
export interface FormGw { gw: number; pts: number }
export interface PlayerPageData {
  slug: string; name: string; webName: string; teamId: number; teamName: string; teamShort: string;
  position: string; positionShort: string; price: string; ownership: string;
  totalPoints: number; goals: number; assists: number; ppg: string; form: string;
  gw: number; xPts: number; nextFixtures: FdrFixture[]; recentForm: FormGw[];
  cleanSheets: number; bonus: number;
}

/** Top-N players by ownership — for generateStaticParams + the sitemap. */
export async function getTopPlayerSlugs(limit = 200): Promise<string[]> {
  try {
    const fpl = new FPLApiService();
    const boot = await fpl.getBootstrapData();
    return [...(boot.elements as any[])]
      .sort((a, b) => parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent))
      .slice(0, limit)
      .map(playerSlug)
      .filter((s, i, arr) => s && arr.indexOf(s) === i);
  } catch {
    return [];
  }
}

/**
 * FPL element id → player-page slug.
 *
 * The predictor stores `playerFplId`, not a slug, so any surface built from the
 * predictions table needs this to link into /players/[slug]. Returns an empty
 * map on failure so callers fall back to plain text rather than dead links.
 */
export async function getSlugsByFplId(): Promise<Map<number, string>> {
  try {
    const boot = await new FPLApiService().getBootstrapData();
    return new Map((boot.elements as any[]).map((e) => [e.id, playerSlug(e)]));
  } catch {
    return new Map();
  }
}

export interface PlayerIndexRow {
  slug: string; webName: string; teamShort: string; elementType: number; positionShort: string;
  price: string; priceValue: number; ownership: string; totalPoints: number; xPts: number;
}

/**
 * The /players hub listing — the same top-N-by-ownership set used by
 * `generateStaticParams` and the sitemap, so the hub only ever links to pages
 * that are already generated and indexed.
 */
export async function getPlayersIndex(limit = 200): Promise<PlayerIndexRow[]> {
  try {
    const fpl = new FPLApiService();
    const [boot, fixtures, currentGw] = await Promise.all([
      fpl.getBootstrapData(),
      fpl.getFixtures().catch(() => []),
      fpl.getCurrentGameweek().catch(() => 1),
    ]);
    const teamsById = new Map((boot.teams as any[]).map((t) => [t.id, t]));
    const ctx = buildFixtureContext(fixtures as any[], currentGw);

    const seen = new Set<string>();
    return [...(boot.elements as any[])]
      .sort((a, b) => parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent))
      .slice(0, limit)
      .map((e) => {
        const slug = playerSlug(e);
        return {
          slug,
          webName: e.web_name,
          teamShort: (teamsById.get(e.team) || {}).short_name || '',
          elementType: e.element_type,
          positionShort: POS_SHORT[e.element_type] || '',
          price: (e.now_cost / 10).toFixed(1),
          priceValue: e.now_cost / 10,
          ownership: e.selected_by_percent,
          totalPoints: e.total_points,
          xPts: Math.round(projectPlayer(e, ctx).perGw * 10) / 10,
        };
      })
      .filter((r) => r.slug && !seen.has(r.slug) && seen.add(r.slug));
  } catch {
    return [];
  }
}

/**
 * Alternatives to a given player: same position, comparable price, ranked by
 * projected points. Answers the "best <player> alternatives" FAQ with real
 * names instead of a generic paragraph, and interlinks the pSEO cluster —
 * without these, player pages only ever link back out to the app.
 */
export async function getSimilarPlayers(slug: string, limit = 3): Promise<PlayerIndexRow[]> {
  try {
    const fpl = new FPLApiService();
    const [boot, fixtures, currentGw] = await Promise.all([
      fpl.getBootstrapData(),
      fpl.getFixtures().catch(() => []),
      fpl.getCurrentGameweek().catch(() => 1),
    ]);
    const elements = boot.elements as any[];
    const self = elements.find((e) => playerSlug(e) === slug);
    if (!self) return [];

    const teamsById = new Map((boot.teams as any[]).map((t) => [t.id, t]));
    const ctx = buildFixtureContext(fixtures as any[], currentGw);
    const selfPrice = self.now_cost / 10;

    // Nearest by price rather than a fixed band. Price outliers break banding:
    // Haaland at £14.7m has no other forward within £4m (next is Isak, £10.3m),
    // so any fixed window returns nothing for exactly the players people search
    // for most. Take the closest candidates by price, then rank those by xPts.
    const pool = elements
      .filter((e) =>
        e.id !== self.id &&
        e.element_type === self.element_type &&
        !['i', 's', 'u'].includes(e.status))
      .sort((a, b) =>
        Math.abs(a.now_cost / 10 - selfPrice) - Math.abs(b.now_cost / 10 - selfPrice))
      .slice(0, Math.max(limit * 4, 12));

    return pool
      .map((e) => ({ e, xPts: Math.round(projectPlayer(e, ctx).perGw * 10) / 10 }))
      .sort((a, b) => b.xPts - a.xPts)
      .slice(0, limit)
      .map(({ e, xPts }) => ({
        slug: playerSlug(e),
        webName: e.web_name,
        teamShort: (teamsById.get(e.team) || {}).short_name || '',
        elementType: e.element_type,
        positionShort: POS_SHORT[e.element_type] || '',
        price: (e.now_cost / 10).toFixed(1),
        priceValue: e.now_cost / 10,
        ownership: e.selected_by_percent,
        totalPoints: e.total_points,
        xPts,
      }));
  } catch {
    return [];
  }
}

export async function getPlayerData(slug: string): Promise<PlayerPageData | null> {
  const fpl = new FPLApiService();
  const [boot, fixtures, currentGw] = await Promise.all([
    fpl.getBootstrapData(),
    fpl.getFixtures().catch(() => []),
    fpl.getCurrentGameweek().catch(() => 1),
  ]);
  const el = (boot.elements as any[]).find((e) => playerSlug(e) === slug);
  if (!el) return null;

  const teamsById = new Map((boot.teams as any[]).map((t) => [t.id, t]));
  const team = teamsById.get(el.team) || { name: 'Unknown', short_name: '' };

  const ctx = buildFixtureContext(fixtures as any[], currentGw);
  const proj = projectPlayer(el, ctx);

  const upGws = [1, 2, 3, 4].map((n) => currentGw + n).filter((g) => g <= 38);
  const nextFixtures: FdrFixture[] = (fixtures as any[])
    .filter((f) => upGws.includes(f.event) && (f.team_h === el.team || f.team_a === el.team))
    .sort((a, b) => a.event - b.event)
    .slice(0, 4)
    .map((f) => {
      const home = f.team_h === el.team;
      const opp = teamsById.get(home ? f.team_a : f.team_h) || { name: 'TBD', short_name: '' };
      return { gw: f.event, opp: opp.name, short: opp.short_name, home, diff: home ? f.team_h_difficulty : f.team_a_difficulty };
    });

  let recentForm: FormGw[] = [];
  try {
    const es = await fpl.getElementSummary(el.id);
    recentForm = ((es.history as any[]) || []).filter((h) => h.minutes != null).slice(-5)
      .map((h) => ({ gw: h.round, pts: h.total_points }));
  } catch { /* pre-season / demo → no per-GW history yet */ }

  return {
    slug, name: `${el.first_name} ${el.second_name}`, webName: el.web_name,
    teamId: el.team, teamName: team.name, teamShort: team.short_name,
    position: POS[el.element_type] || 'Player', positionShort: POS_SHORT[el.element_type] || '',
    price: (el.now_cost / 10).toFixed(1), ownership: el.selected_by_percent,
    totalPoints: el.total_points, goals: el.goals_scored, assists: el.assists,
    ppg: el.points_per_game, form: el.form,
    cleanSheets: el.clean_sheets ?? 0, bonus: el.bonus ?? 0,
    gw: currentGw, xPts: Math.round(proj.perGw * 10) / 10, nextFixtures, recentForm,
  };
}

export interface CaptainPick {
  rank: number; slug: string; webName: string; teamShort: string; positionShort: string;
  price: string; ownership: string; xPts: number; opp: string; home: boolean;
}

/** Top captaincy picks for a gameweek, ranked by projected points. */
export async function getGameweekCaptains(targetGw: number, limit = 12): Promise<CaptainPick[]> {
  const fpl = new FPLApiService();
  const [boot, fixtures] = await Promise.all([fpl.getBootstrapData(), fpl.getFixtures().catch(() => [])]);
  const teamsById = new Map((boot.teams as any[]).map((t) => [t.id, t]));
  // Anchor the fixture context so the target GW's fixtures are the "upcoming" ones.
  const ctx = buildFixtureContext(fixtures as any[], targetGw - 1);

  const oppFor = (teamId: number): { opp: string; home: boolean } => {
    const f = (fixtures as any[]).find((x) => x.event === targetGw && (x.team_h === teamId || x.team_a === teamId));
    if (!f) return { opp: 'TBD', home: true };
    const home = f.team_h === teamId;
    return { opp: (teamsById.get(home ? f.team_a : f.team_h) || {}).short_name || 'TBD', home };
  };

  return (boot.elements as any[])
    .filter((e) => !['i', 's', 'u'].includes(e.status))
    .map((e) => ({ e, proj: projectPlayer(e, ctx).perGw }))
    .sort((a, b) => b.proj - a.proj)
    .slice(0, limit)
    .map(({ e, proj }, i) => {
      const { opp, home } = oppFor(e.team);
      return {
        rank: i + 1, slug: playerSlug(e), webName: e.web_name,
        teamShort: (teamsById.get(e.team) || {}).short_name || '',
        positionShort: POS_SHORT[e.element_type] || '', price: (e.now_cost / 10).toFixed(1),
        ownership: e.selected_by_percent, xPts: Math.round(proj * 10) / 10, opp, home,
      };
    });
}

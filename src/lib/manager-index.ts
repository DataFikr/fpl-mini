// Server-only: imports Prisma. Do not import from a Client Component.
import { prisma } from '@/lib/database';

/**
 * Team name → team ID lookup.
 *
 * People know the name they gave their squad; almost nobody knows their 7-digit
 * FPL team ID, and August 2026 showed that gate costing most of the funnel
 * (51.3% bounce on the landing page against 5.8% once inside, with the "find
 * your team ID" guide the single best-performing content page on the site).
 *
 * Deliberately team name only, never manager name. A manager name is usually a
 * real name, so people hesitate to type it, and a global name-searchable index
 * would turn a mini-league convenience into a people-finder — a different and
 * much worse thing than the per-league visibility FPL already provides. Manager
 * names are stored and shown *alongside* a result so two squads sharing a name
 * can be told apart, but they are not a query surface.
 *
 * The FPL API has no manager-search endpoint — which is why the old
 * `findTeamByName` was a hardcoded mock — so the index is built from data we
 * already fetch: every classic-league standings response names every manager in
 * that league (`entry`, `entry_name`, `player_name`). Each league page a
 * visitor opens therefore contributes its whole roster, and the index compounds
 * with traffic.
 *
 * Consequence worth stating plainly: this can only ever find teams that share a
 * league with someone who has used the site. The team-ID field must stay as the
 * fallback, never be replaced.
 *
 * Data stored is exactly what FPL publishes on a public league table (team name
 * + manager name + entry id) — no email, no private fields.
 */

/** The subset of a standings row the index needs. */
export interface IndexableRow {
  entry: number;
  entry_name: string;
  player_name: string;
}

const isUsable = (r: IndexableRow) =>
  Number.isFinite(r?.entry) && r.entry > 0 && !!r.entry_name?.trim() && !!r.player_name?.trim();

/**
 * Add a league's managers to the index. Insert-only via one `createMany` —
 * `skipDuplicates` makes it idempotent and keeps a 50-manager league to a single
 * round trip, where per-row upserts would be 50. Managers rename rarely enough
 * that refreshing existing rows is not worth the write amplification.
 *
 * Never throws: indexing is a side effect of rendering a league page and must
 * not be able to break it.
 */
export async function indexManagers(rows: IndexableRow[]): Promise<number> {
  try {
    const usable = rows.filter(isUsable);
    if (!usable.length) return 0;

    // De-dupe within the batch; createMany would otherwise conflict on itself.
    const seen = new Map<number, IndexableRow>();
    for (const r of usable) if (!seen.has(r.entry)) seen.set(r.entry, r);

    const res = await prisma.team.createMany({
      data: [...seen.values()].map((r) => ({
        fplId: r.entry,
        name: r.entry_name.trim().slice(0, 120),
        managerName: r.player_name.trim().slice(0, 120),
      })),
      skipDuplicates: true,
    });
    return res.count;
  } catch (e) {
    console.warn('[manager-index] indexing skipped:', e instanceof Error ? e.message : e);
    return 0;
  }
}

/** Fire-and-forget wrapper for request paths that must not wait on the write. */
export function indexManagersInBackground(rows: IndexableRow[]): void {
  void indexManagers(rows).catch(() => {});
}

export interface TeamMatch {
  teamId: number;
  teamName: string;
  /** Shown to disambiguate identical team names — never matched against. */
  managerName: string;
}

/**
 * Rank the likeliest squad first: an exact team-name match, then one starting
 * with the query, then a match on a later word ("The FIFABOY XI"), then any
 * substring. Postgres `contains` can't express that ordering, so the shortlist
 * is over-fetched and scored here — fine at index sizes in the tens of
 * thousands.
 */
function score(m: TeamMatch, q: string): number {
  const team = m.teamName.toLowerCase();
  if (team === q) return 0;
  if (team.startsWith(q)) return 1;
  if (team.split(/\s+/).some((w) => w.startsWith(q))) return 2;
  return 3;
}

export async function searchTeams(query: string, limit = 12): Promise<TeamMatch[]> {
  const q = (query || '').trim().toLowerCase();
  if (q.length < 2) return [];

  const rows = await prisma.team.findMany({
    // Team name only. Matching managerName here would make every FPL player
    // findable by their real name — see the note at the top of this file.
    where: { name: { contains: q, mode: 'insensitive' } },
    select: { fplId: true, name: true, managerName: true },
    // Over-fetch so the ranking below has something to choose from.
    take: Math.max(limit * 8, 80),
  });

  return rows
    .map((r) => ({ teamId: r.fplId, teamName: r.name, managerName: r.managerName }))
    .sort((a, b) => score(a, q) - score(b, q) || a.teamName.localeCompare(b.teamName))
    .slice(0, limit);
}

/** How many teams are searchable — powers the "keep opening leagues" hint. */
export async function indexSize(): Promise<number> {
  try {
    return await prisma.team.count();
  } catch {
    return 0;
  }
}

/**
 * The manager context that follows a visitor around the app.
 *
 * Once someone has entered their FPL team ID, every app screen should keep it —
 * including the ones that don't take a `?teamId=` (Players, Kitbag, Home). The
 * id therefore lives in three places, in priority order:
 *
 *   1. `?teamId=` in the URL — an explicit request (a shared link, a tap on a
 *      rival manager), always wins;
 *   2. a cookie — so server-rendered pages can resolve it without the query;
 *   3. localStorage — the client-side mirror the shell reads to keep nav links
 *      pointing at the right manager.
 *
 * This module holds only what both the client and server halves need; the
 * cookie read lives in `team-id-server.ts` (it imports `next/headers`).
 */
export const TEAM_ID_COOKIE = 'fpl_team_id';

/** One year — the id should outlive a season's worth of visits. */
export const TEAM_ID_MAX_AGE = 60 * 60 * 24 * 365;

/** Parse a team id from a query param/cookie value; undefined if not a valid id. */
export function parseTeamId(raw?: string | number | null): number | undefined {
  if (raw == null) return undefined;
  const v = typeof raw === 'number' ? raw : parseInt(String(raw).trim(), 10);
  return Number.isFinite(v) && v > 0 && v < 1e9 ? v : undefined;
}

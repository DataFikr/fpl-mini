/**
 * The current season, in one place.
 *
 * It used to be written out by hand wherever it was displayed, which is how the
 * share/download/email infographic spent the whole of 2026/27 pre-season
 * stamped "GW1 · 2025/26" — the OG card, the FAQ and the predictions page each
 * carried their own copy and only some of them got updated.
 *
 * Two forms, because the codebase needs both:
 *   SEASON_ID    '2026-27' — storage form; the PlayerPrediction.season key.
 *   SEASON_LABEL '2026/27' — display form; what a human reads.
 *
 * Prefer `seasonLabelFromEvents` anywhere the bootstrap feed is already to
 * hand: it reads the season off the fixture list itself and so cannot go stale
 * in July, which is the failure this module exists to prevent.
 */

/** Storage form ('2026-27'). Override with FPL_SEASON only for backtests. */
export const SEASON_ID = process.env.FPL_SEASON || '2026-27';

/**
 * Display form ('2026/27').
 *
 * Note for client components: FPL_SEASON is not a NEXT_PUBLIC_ var, so in the
 * browser bundle this always resolves to the default above. That is intended —
 * an override is a server-side backtest concern, never something the UI should
 * be rendering.
 */
export const SEASON_LABEL = SEASON_ID.replace('-', '/');

/**
 * The season label derived from the live fixture list — GW1's deadline year.
 *
 * The bootstrap feed carries no season field, so this infers it: a season whose
 * first deadline falls in August 2026 is 2026/27. Falls back to SEASON_LABEL
 * when events are missing or malformed.
 *
 * @param events `bootstrap.events`
 */
export function seasonLabelFromEvents(events: { id?: number; deadline_time?: string }[] | undefined | null): string {
  const gw1 = events?.find((e) => e.id === 1) ?? events?.[0];
  if (!gw1?.deadline_time) return SEASON_LABEL;
  const year = new Date(gw1.deadline_time).getFullYear();
  if (!Number.isFinite(year)) return SEASON_LABEL;
  return `${year}/${String(year + 1).slice(2)}`;
}

/**
 * The season after `label` ('2026/27' → '2027/28').
 *
 * For end-of-season copy that looks ahead ("who dethrones them next year?").
 * Written as a function because that line was hardcoded once and then described
 * the current season rather than the coming one.
 */
export function nextSeasonLabel(label: string = SEASON_LABEL): string {
  const start = parseInt(label.slice(0, 4), 10);
  if (!Number.isFinite(start)) return label;
  return `${start + 1}/${String(start + 2).slice(2)}`;
}

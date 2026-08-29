/**
 * Seed the manager-name index from leagues we already know about.
 *
 * The index normally fills itself: every league page a visitor opens contributes
 * that league's whole roster (src/lib/manager-index.ts). But a search feature
 * that finds nobody on day one is worse than no search feature, so this walks
 * the leagues we can already identify — newsletter subscriptions, and the
 * leagues of every manager who has linked a team — and indexes their members.
 *
 * Safe to re-run: inserts skip duplicates, and nothing is ever updated or
 * deleted. Only public league-table data is stored (team name, manager name,
 * entry id).
 *
 *   node scripts/backfill-manager-index.mjs [--dry] [--max-leagues=N]
 */
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const DRY = process.argv.includes('--dry');
const MAX_LEAGUES = Number(
  (process.argv.find((a) => a.startsWith('--max-leagues=')) || '').split('=')[1] || 60
);

// Next reads .env.local first; Prisma's CLI default (.env) can be stale.
const url = /DATABASE_URL="([^"]+)"/.exec(fs.readFileSync('.env.local', 'utf8'))?.[1];
if (url) process.env.DATABASE_URL = url;

const prisma = new PrismaClient();
const FPL = 'https://fantasy.premierleague.com/api';

/** Global/regional leagues have millions of members and no lookup value. */
const SKIP_LEAGUE_IDS = new Set([314]);
const MAX_PAGES = 4;         // 50 managers per page
const MAX_MEMBERS = 2000;    // stop indexing a league beyond this
const PAUSE_MS = 350;        // be a good citizen with the public API

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fpl(path) {
  const res = await fetch(`${FPL}${path}`, {
    headers: { 'User-Agent': 'FPLRanker/1.0 (+https://fplranker.com)' },
  });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

async function collectLeagueIds() {
  const ids = new Set();

  const subs = await prisma.newsletterSubscription.findMany({ select: { leagueId: true } });
  subs.forEach((s) => s.leagueId && ids.add(s.leagueId));
  console.log(`  ${subs.length} newsletter subscriptions -> ${ids.size} distinct leagues`);

  const users = await prisma.user.findMany({
    where: { fplTeamId: { not: null } },
    select: { fplTeamId: true },
  });
  console.log(`  ${users.length} linked user teams — reading their leagues…`);
  for (const u of users) {
    try {
      const entry = await fpl(`/entry/${u.fplTeamId}/`);
      (entry?.leagues?.classic || []).forEach((l) => l?.id && ids.add(l.id));
      await sleep(PAUSE_MS);
    } catch (e) {
      console.warn(`    entry ${u.fplTeamId}: ${e.message}`);
    }
  }

  // Anything already indexed is a manager whose own leagues are worth walking.
  const seeds = await prisma.team.findMany({ select: { fplId: true }, take: 25 });
  for (const t of seeds) {
    try {
      const entry = await fpl(`/entry/${t.fplId}/`);
      (entry?.leagues?.classic || []).forEach((l) => l?.id && ids.add(l.id));
      await sleep(PAUSE_MS);
    } catch { /* a stale id is not worth reporting */ }
  }

  SKIP_LEAGUE_IDS.forEach((id) => ids.delete(id));
  return [...ids];
}

async function indexLeague(leagueId) {
  const rows = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fpl(`/leagues-classic/${leagueId}/standings/?page_standings=${page}`);
    const results = data?.standings?.results || [];
    const newEntries = data?.new_entries?.results || [];

    for (const r of results) {
      if (r?.entry && r.entry_name && r.player_name) {
        rows.push({ fplId: r.entry, name: String(r.entry_name).slice(0, 120), managerName: String(r.player_name).slice(0, 120) });
      }
    }
    // Pre-season: members sit under new_entries until a gameweek is scored.
    for (const n of newEntries) {
      const mgr = `${n.player_first_name ?? ''} ${n.player_last_name ?? ''}`.trim();
      if (n?.entry && n.entry_name && mgr) {
        rows.push({ fplId: n.entry, name: String(n.entry_name).slice(0, 120), managerName: mgr.slice(0, 120) });
      }
    }

    const more = data?.standings?.has_next && results.length > 0;
    if (!more || rows.length >= MAX_MEMBERS) break;
    await sleep(PAUSE_MS);
  }

  const seen = new Map();
  rows.forEach((r) => { if (!seen.has(r.fplId)) seen.set(r.fplId, r); });
  const data = [...seen.values()];
  if (!data.length || DRY) return { found: data.length, inserted: 0 };

  const res = await prisma.team.createMany({ data, skipDuplicates: true });
  return { found: data.length, inserted: res.count };
}

(async () => {
  const before = await prisma.team.count();
  console.log(`Manager index: ${before} rows before${DRY ? '  (DRY RUN — no writes)' : ''}\n`);

  console.log('Collecting league ids…');
  const leagueIds = (await collectLeagueIds()).slice(0, MAX_LEAGUES);
  console.log(`\n${leagueIds.length} leagues to walk (cap ${MAX_LEAGUES})\n`);

  let found = 0, inserted = 0, failed = 0;
  for (const [i, id] of leagueIds.entries()) {
    try {
      const r = await indexLeague(id);
      found += r.found; inserted += r.inserted;
      console.log(`  [${i + 1}/${leagueIds.length}] league ${id}: ${r.found} members, ${r.inserted} new`);
    } catch (e) {
      failed++;
      console.warn(`  [${i + 1}/${leagueIds.length}] league ${id}: ${e.message}`);
    }
    await sleep(PAUSE_MS);
  }

  const after = await prisma.team.count();
  console.log(`\nseen ${found} members · inserted ${inserted} · ${failed} leagues failed`);
  console.log(`Manager index: ${before} -> ${after} rows`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('FAILED:', e);
  await prisma.$disconnect();
  process.exit(1);
});

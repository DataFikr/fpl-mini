import { NextRequest, NextResponse } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

const fplApi = new FPLApiService();
const MAX_MANAGERS = 30;

/** One ESPN-style storyline. `tag` is the short category chip, `title` the full headline. */
interface HeadlineDetail {
  subhead: string;    // red one-liner under the headline
  body: string;       // dramatic narrative paragraph
  team: string;       // footer team name
  manager: string;    // footer manager name
  stat: number;       // hero number
  statLabel: string;  // hero number label
}

interface Headline {
  tag: string;
  tone: string;   // hex colour the client maps to a chip
  title: string;
  score: number;  // drama ranking — higher floats to the top
  sentiment: 'pos' | 'neg'; // drives the celebrating/dejected manager image
  detail: HeadlineDetail;   // rich content for the click-through modal
}

const TONE = {
  disaster: '#FF5050',
  genius: '#009C54',
  banter: '#150000',
  gossip: '#FFD100',
} as const;

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Drop Unicode replacement chars / orphan variation selectors left by broken emoji in FPL names. */
function clean(s: string): string {
  let out = '';
  for (const ch of s || '') {
    const c = ch.codePointAt(0)!;
    if (c === 0xfffd || c === 0xfe0f) continue;
    out += ch;
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

/** Exact GW points for an element from the live feed (falls back to a manual tally). */
function livePoints(liveEl: any, elementType: number): number {
  const s = liveEl?.stats;
  if (!s) return 0;
  if (typeof s.total_points === 'number') return s.total_points;
  if (!s.minutes) return 0;
  const goal = elementType <= 2 ? 6 : elementType === 3 ? 5 : 4;
  const cs = elementType <= 2 ? 4 : 0;
  return (
    (s.minutes >= 60 ? 2 : 1) +
    s.goals_scored * goal +
    s.assists * 3 +
    (s.clean_sheets ? cs : 0) +
    (s.bonus || 0) +
    (s.penalties_saved || 0) * 5 -
    (s.penalties_missed || 0) * 2 -
    (s.own_goals || 0) * 2 -
    (s.yellow_cards || 0) -
    (s.red_cards || 0) * 3 +
    (elementType === 1 ? Math.floor((s.saves || 0) / 3) : 0)
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const leagueId = parseInt(id);
    if (isNaN(leagueId)) {
      return NextResponse.json({ error: 'Invalid league id' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const reqGw = parseInt(searchParams.get('gw') || '0');

    const [standings, bootstrap, currentGw] = await Promise.all([
      fplApi.getLeagueStandings(leagueId),
      fplApi.getBootstrapData(),
      fplApi.getCurrentGameweek(),
    ]);

    const gw = reqGw > 0 ? reqGw : currentGw;
    const leagueName = standings.league?.name || 'the league';
    const results = (standings.standings?.results || []).slice(0, MAX_MANAGERS);
    const N = results.length;

    if (N === 0) {
      return NextResponse.json({ gw, hero: null, list: [] });
    }

    // Player + team lookups from bootstrap.
    const player: Record<number, { name: string; type: number; own: number }> = {};
    for (const el of bootstrap.elements) {
      player[el.id] = {
        name: el.web_name,
        type: el.element_type,
        own: parseFloat((el as any).selected_by_percent || '0'),
      };
    }

    const live = await fplApi.getLiveGameweekData(gw).catch(() => ({ elements: [] as any[] }));
    const liveById: Record<number, any> = {};
    for (const e of live.elements || []) liveById[e.id] = e;

    // Each manager's picks for this GW (cached, parallel, best-effort).
    const picksResults = await Promise.allSettled(
      results.map((r) => fplApi.getManagerPicks(r.entry, gw))
    );

    interface Mgr {
      entry: number;
      team: string;
      mgr: string;
      rank: number;       // mini-league position after this GW
      prevRank: number;   // mini-league position after GW-1
      total: number;      // cumulative total after this GW
      prevTotal: number;  // cumulative total after GW-1
      gwPts: number;      // points scored this GW
      picks: any | null;
      chip: string | null;
      benchCost: number;
      benchPts: number;
      benchTop: { name: string; pts: number } | null;
      captain: { name: string; pts: number; type: number } | null;
    }

    // League ownership: how many managers hold each element (across all 15 picks).
    const ownCount: Record<number, number> = {};

    const mgrs: Mgr[] = results.map((r, i) => {
      const pr = picksResults[i];
      const picks = pr.status === 'fulfilled' ? pr.value : null;
      const eh = picks?.entry_history;
      let benchPts = 0, benchTop: Mgr['benchTop'] = null;
      let captain: Mgr['captain'] = null;

      if (picks?.picks) {
        for (const p of picks.picks) {
          ownCount[p.element] = (ownCount[p.element] || 0) + 1;
          const info = player[p.element];
          if (!info) continue;
          const pts = livePoints(liveById[p.element], info.type);
          if (p.is_captain) captain = { name: info.name, pts: pts * (p.multiplier || 1), type: info.type };
          if (p.position > 11) {
            benchPts += pts;
            if (!benchTop || pts > benchTop.pts) benchTop = { name: info.name, pts };
          }
        }
      }

      // Per-GW values come from entry_history (accurate for the requested GW);
      // fall back to current-GW standings if a manager's picks failed to load.
      const gwPts = eh?.points ?? r.event_total ?? 0;
      const total = eh?.total_points ?? r.total ?? 0;
      return {
        entry: r.entry,
        team: clean(r.entry_name),
        mgr: clean(r.player_name),
        rank: 0,
        prevRank: 0,
        total,
        prevTotal: total - gwPts, // cumulative total before this GW
        gwPts,
        picks,
        chip: picks?.active_chip ?? null,
        benchCost: eh?.event_transfers_cost ?? 0,
        benchPts,
        benchTop,
        captain,
      };
    });

    // Mini-league rank now and one GW earlier — drives every movement headline.
    [...mgrs].sort((a, b) => b.total - a.total).forEach((m, i) => { m.rank = i + 1; });
    [...mgrs].sort((a, b) => b.prevTotal - a.prevTotal).forEach((m, i) => { m.prevRank = i + 1; });

    const leagueAvg = Math.round(mgrs.reduce((a, m) => a + m.gwPts, 0) / N);
    const out: Headline[] = [];

    // ---- 1. Bench Nightmare ----
    for (const m of mgrs) {
      if (m.benchPts >= 12 && m.benchTop) {
        out.push({
          tag: 'BENCH NIGHTMARE', tone: TONE.disaster, sentiment: 'neg', score: 60 + m.benchPts,
          title: `${m.team} left ${m.benchPts} points on the bench — ${m.benchTop.name} (${m.benchTop.pts}) watched it all from the pine`,
          detail: {
            subhead: `${m.benchPts} points stranded on the bench`,
            body: `${m.mgr}'s ${m.team} left a season-defining ${m.benchPts} points rotting on the bench in GW${gw}. ${m.benchTop.name} alone returned ${m.benchTop.pts} from the sidelines while the starting XI laboured. In a league this tight, points like these are the difference between glory and gut-wrenching regret.`,
            team: m.team, manager: m.mgr, stat: m.benchPts, statLabel: 'pts benched',
          },
        });
      }
    }

    // ---- 2. Captain Calamity ----
    for (const m of mgrs) {
      if (!m.captain) continue;
      const dud = m.captain.pts <= 4;
      const benchExplode = m.benchTop && m.benchTop.pts >= 8;
      if (dud && benchExplode) {
        out.push({
          tag: 'CAPTAIN CALAMITY', tone: TONE.disaster, sentiment: 'neg', score: 70 + (m.benchTop!.pts - m.captain.pts),
          title: `${m.team}'s armband on ${m.captain.name} returns just ${m.captain.pts} while ${m.benchTop!.name} hauled ${m.benchTop!.pts} on the bench`,
          detail: {
            subhead: `The armband backfires in spectacular fashion`,
            body: `${m.mgr} handed ${m.captain.name} the GW${gw} captaincy and got just ${m.captain.pts} back — doubled to heartbreak. To rub salt in the wound, ${m.benchTop!.name} was dropping ${m.benchTop!.pts} on the bench. This is the kind of call that haunts a manager all week long.`,
            team: m.team, manager: m.mgr, stat: m.captain.pts, statLabel: 'captain pts',
          },
        });
      }
    }

    // ---- 3. Differential Masterclass ----
    for (const m of mgrs) {
      if (!m.picks?.picks) continue;
      let best: { name: string; pts: number; own: number } | null = null;
      for (const p of m.picks.picks) {
        if (p.position > 11) continue;
        const info = player[p.element];
        if (!info) continue;
        const leagueOwn = ((ownCount[p.element] || 0) / N) * 100;
        if (leagueOwn >= 15) continue;
        const pts = livePoints(liveById[p.element], info.type) * (p.multiplier || 1);
        if (pts >= 10 && (!best || pts > best.pts)) best = { name: info.name, pts, own: leagueOwn };
      }
      if (best) {
        const ownStr = best.own < 1 ? '<1' : String(Math.round(best.own));
        out.push({
          tag: 'GALAXY BRAIN', tone: TONE.genius, sentiment: 'pos', score: 55 + best.pts,
          title: `${m.team}'s ${ownStr}%-owned ${best.name} explodes for ${best.pts} — the differential that lit up GW${gw}`,
          detail: {
            subhead: `The ${ownStr}%-owned punt that broke the league open`,
            body: `While the rest of ${leagueName} played it safe, ${m.mgr} backed ${best.name} — owned by barely anyone here — and watched it explode for ${best.pts} points in GW${gw}. THIS is how you steal a march on the field: find the player nobody else trusts and let them win you the week. Pure differential genius.`,
            team: m.team, manager: m.mgr, stat: best.pts, statLabel: 'points',
          },
        });
      }
    }

    // ---- 4. Clone Wars (league-wide template) ----
    if (N >= 4) {
      let top: { id: number; count: number } | null = null;
      for (const [idStr, c] of Object.entries(ownCount)) {
        if (!top || c > top.count) top = { id: +idStr, count: c };
      }
      if (top && top.count / N >= 0.9 && player[top.id]) {
        const pct = Math.round((top.count / N) * 100);
        const pname = player[top.id].name;
        out.push({
          tag: 'CLONE WARS', tone: TONE.gossip, sentiment: 'neg', score: 40 + pct / 5,
          title: `${pct}% of ${leagueName} owns ${pname} — the title will be won by the differentials`,
          detail: {
            subhead: `The template tightens its grip`,
            body: `${pct}% of ${leagueName} now owns ${pname}. When almost everyone fields the same player, he stops being an edge and becomes a baseline — captaincy and differentials decide everything from here. The question hanging over the league: who blinks first and sells?`,
            team: leagueName, manager: pname, stat: pct, statLabel: '% own',
          },
        });
      }
    }

    // ---- 5. Chip King ----
    for (const m of mgrs) {
      if (!m.chip) continue;
      const diff = m.gwPts - leagueAvg;
      const label = m.chip === 'freehit' ? 'Free Hit' : m.chip === '3xc' ? 'Triple Captain'
        : m.chip === 'bboost' ? 'Bench Boost' : m.chip === 'wildcard' ? 'Wildcard' : 'chip';
      if (diff >= 20) {
        out.push({
          tag: 'CHIP KING', tone: TONE.genius, sentiment: 'pos', score: 50 + diff,
          title: `${m.team}'s ${label} smashed the GW${gw} average by ${diff} points — a flawless call`,
          detail: {
            subhead: `A chip played to absolute perfection`,
            body: `${m.mgr} unleashed the ${label} in GW${gw} and torched the league average by ${diff} points, banking ${m.gwPts}. Timing is everything in FPL — sit on a chip too long and it's wasted, fire it at the right moment and it wins you the season. This was textbook. The rest of ${leagueName} can only watch.`,
            team: m.team, manager: m.mgr, stat: m.gwPts, statLabel: 'points',
          },
        });
      }
    }

    // ---- 6. Bottle Job ----
    if (gw > 1) for (const m of mgrs) {
      const drop = m.rank - m.prevRank;
      if (drop >= 3) {
        out.push({
          tag: 'BOTTLE JOB', tone: TONE.disaster, sentiment: 'neg', score: 45 + drop * 3,
          title: `${m.team} tumbles ${drop} place${drop > 1 ? 's' : ''} to ${ordinal(m.rank)} — the wheels are coming off`,
          detail: {
            subhead: `From contender to cautionary tale`,
            body: `${m.mgr}'s ${m.team} is in freefall — ${drop} place${drop > 1 ? 's' : ''} surrendered in a single gameweek, sliding to ${ordinal(m.rank)}. Momentum is everything in a mini-league, and right now it has completely deserted them. The chasing pack smells blood.`,
            team: m.team, manager: m.mgr, stat: drop, statLabel: 'places lost',
          },
        });
      }
    }

    // ---- 7. Panic Merchant ----
    for (const m of mgrs) {
      if (m.benchCost >= 8) {
        out.push({
          tag: 'PANIC MERCHANT', tone: TONE.disaster, sentiment: 'neg', score: 35 + m.benchCost,
          title: `${m.team} took a -${m.benchCost} hit chasing the points — desperation or genius?`,
          detail: {
            subhead: `Hits stacked high in a desperate gamble`,
            body: `${m.mgr} swung for the fences in GW${gw}, taking a -${m.benchCost} hit in pursuit of points. Bold strategy or blind panic? When the transfers pay off it's vision; when they don't it's a -${m.benchCost} millstone. The next few gameweeks will deliver the verdict.`,
            team: m.team, manager: m.mgr, stat: m.benchCost, statLabel: 'pts hit',
          },
        });
      }
    }

    // ---- 8. Derby Day (closest pair on total) ----
    {
      const sorted = [...mgrs].sort((a, b) => b.total - a.total);
      let closest: { a: Mgr; b: Mgr; gap: number } | null = null;
      for (let i = 1; i < sorted.length; i++) {
        const gap = sorted[i - 1].total - sorted[i].total;
        if (!closest || gap < closest.gap) closest = { a: sorted[i - 1], b: sorted[i], gap };
      }
      if (closest && closest.gap <= 1) {
        out.push({
          tag: 'DERBY DAY', tone: TONE.banter, sentiment: 'pos', score: 38,
          title: closest.gap === 0
            ? `${closest.a.team} and ${closest.b.team} are dead level on ${closest.a.total} points — every captain pick counts now`
            : `${closest.a.team} and ${closest.b.team} split by a single point — every captain pick counts now`,
          detail: {
            subhead: closest.gap === 0 ? `Dead level — nothing between them` : `One point. Everything to play for.`,
            body: `${closest.a.team} and ${closest.b.team} are locked together near the top of ${leagueName}, split by just ${closest.gap} point${closest.gap === 1 ? '' : 's'}. Every transfer, every captain armband, every bench decision now swings this duel. This is the rivalry the season was crying out for.`,
            team: closest.a.team, manager: closest.a.mgr, stat: closest.gap, statLabel: 'pt gap',
          },
        });
      }
    }

    // ---- 9. On the Charge (biggest climber) ----
    if (gw > 1) {
      const riser = [...mgrs].filter((m) => m.prevRank - m.rank > 0)
        .sort((a, b) => (b.prevRank - b.rank) - (a.prevRank - a.rank))[0];
      if (riser) {
        const up = riser.prevRank - riser.rank;
        out.push({
          tag: 'ON THE CHARGE', tone: TONE.genius, sentiment: 'pos', score: 30 + up * 2,
          title: `${riser.team} surges ${up} place${up > 1 ? 's' : ''} to ${ordinal(riser.rank)} — the green arrows keep coming`,
          detail: {
            subhead: `Green arrows and gathering momentum`,
            body: `${riser.mgr}'s ${riser.team} is surging up ${leagueName} — ${up} place${up > 1 ? 's' : ''} gained in GW${gw}, now ${ordinal(riser.rank)} and climbing. Form like this is how titles are won: quietly, relentlessly, one green arrow at a time. The race just got interesting.`,
            team: riser.team, manager: riser.mgr, stat: up, statLabel: 'places up',
          },
        });
      }
    }

    // ---- 10. Top Score ----
    {
      const top = [...mgrs].sort((a, b) => b.gwPts - a.gwPts)[0];
      if (top) {
        const clear = top.gwPts - leagueAvg;
        out.push({
          tag: 'TOP SCORE', tone: TONE.banter, sentiment: 'pos', score: 25 + clear,
          title: `${top.team} posts the GW${gw} high score — ${top.gwPts} points, ${clear} clear of the league average`,
          detail: {
            subhead: `The gameweek's standout score`,
            body: `${top.mgr} posted the GW${gw} high score of ${top.gwPts}, a full ${clear} clear of the ${leagueName} average. When it mattered most, ${top.team} delivered the kind of week the whole league wishes it had. A genuine statement gameweek.`,
            team: top.team, manager: top.mgr, stat: top.gwPts, statLabel: 'points',
          },
        });
      }
    }

    // ---- 11. Leader (always available — anchors the hero) ----
    {
      const leader = [...mgrs].sort((a, b) => a.rank - b.rank)[0];
      if (leader) {
        out.push({
          tag: `GW${gw} · TOP STORY`, tone: TONE.disaster, sentiment: 'pos', score: 20,
          title: `${leader.team} leads ${leagueName} after GW${gw}`,
          detail: {
            subhead: `Top of the tree after GW${gw}`,
            body: `${leader.mgr}'s ${leader.team} sits proudly atop ${leagueName} after GW${gw} on ${leader.total} points. The view from the summit is sweet — but with the chasing pack lurking and the run-in to come, staying there is the hardest job in fantasy football.`,
            team: leader.team, manager: leader.mgr, stat: leader.total, statLabel: 'total pts',
          },
        });
      }
    }

    out.sort((a, b) => b.score - a.score);
    const hero = out[0] ?? null;

    // Prefer one story per category so the feed reads varied, then backfill.
    const rest = out.slice(1);
    const seen = new Set<string>(hero ? [hero.tag] : []);
    const list: Headline[] = [];
    for (const h of rest) { if (list.length >= 5) break; if (!seen.has(h.tag)) { list.push(h); seen.add(h.tag); } }
    if (list.length < 4) for (const h of rest) { if (list.length >= 5) break; if (!list.includes(h)) list.push(h); }

    return NextResponse.json({ gw, leagueAvg, hero, list });
  } catch (error) {
    console.error('Headlines API error:', error);
    return NextResponse.json({ error: 'Failed to build headlines' }, { status: 500 });
  }
}

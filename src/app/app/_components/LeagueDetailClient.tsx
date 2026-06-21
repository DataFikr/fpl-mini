'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LeagueAppData, AppManager } from '../_lib/league-data';
import { standingsAt, motm, headlinesFrom, ordinal, formatRank, rankMatrix, progressionFor, type StandingRow } from '../_lib/compute';
import { toast } from './Toast';
import { AppShell } from './AppShell';
import { ShareLeagueButton } from './ShareLeagueButton';

type Tab = 'standings' | 'headlines' | 'analytics' | 'monthly';

function Crest({ m, size }: { m: { crestBg: string; crestFg: string; init: string }; size?: number }) {
  return (
    <div className="crest" style={{ background: m.crestBg, color: m.crestFg, ...(size ? { width: size, height: size } : {}) }}>
      {m.init}
    </div>
  );
}

function MoveTag({ mv }: { mv: number }) {
  if (mv > 0) return <span className="mv up">▲ {mv}</span>;
  if (mv < 0) return <span className="mv down">▼ {-mv}</span>;
  return <span className="mv flat">— 0</span>;
}

/* ---------------- Manager of the Month ---------------- */
interface LBEntry { rank: number; teamName: string; managerName: string; entryId: number; totalPoints: number }
interface MonthLB { phaseId: number; phaseName: string; startEvent: number; stopEvent: number; top3: LBEntry[] }
interface Highlight { type: string; icon: string; title: string; description: string; gameweek: number; points?: number }

const cleanName = (s: string) => Array.from(s || '').filter((c) => { const n = c.codePointAt(0)!; return n !== 0xfffd && n !== 0xfe0f; }).join('').replace(/\s{2,}/g, ' ').trim();

const TrophySvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v3a6 6 0 0 1-12 0z" /><path d="M6 5H3v1a3 3 0 0 0 3 3M18 5h3v1a3 3 0 0 1-3 3" /><path d="M9 19h6M10 13v3a2 2 0 0 1-1 2M14 13v3a2 2 0 0 0 1 2" /></svg>
);

function HighlightList({ items, loading }: { items?: Highlight[]; loading: boolean }) {
  if (loading) return <div className="mom-hl-loading">Reading the tactics board…</div>;
  if (!items || items.length === 0) return <div className="mom-hl-loading">No standout storylines this month.</div>;
  return (
    <div className="mom-hls">
      {items.map((h, i) => (
        <div className="mom-hl" key={i}>
          <span className="ic">{h.icon}</span>
          <div className="tx"><div className="ht">{h.title}</div><div className="hd">{h.description}</div></div>
        </div>
      ))}
    </div>
  );
}

function MonthlyTab({ managers, leagueId, focusId }: { managers: AppManager[]; leagueId: number; focusId: number | null }) {
  const [months, setMonths] = useState<MonthLB[] | null>(null);
  const [hls, setHls] = useState<Record<number, Highlight[]>>({});
  const [hlLoading, setHlLoading] = useState<Record<number, boolean>>({});
  const [open, setOpen] = useState<number | null>(null);

  const crestFor = (entryId: number) => managers.find((m) => m.id === entryId);

  const fetchHighlights = (m: MonthLB) => {
    const w = m.top3[0];
    if (!w || hls[m.phaseId] || hlLoading[m.phaseId]) return;
    setHlLoading((p) => ({ ...p, [m.phaseId]: true }));
    fetch(`/api/leagues/${leagueId}/highlights?entryId=${w.entryId}&startEvent=${m.startEvent}&stopEvent=${m.stopEvent}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setHls((p) => ({ ...p, [m.phaseId]: j.highlights || [] })))
      .catch(() => setHls((p) => ({ ...p, [m.phaseId]: [] })))
      .finally(() => setHlLoading((p) => ({ ...p, [m.phaseId]: false })));
  };

  useEffect(() => {
    let alive = true;
    fetch(`/api/leagues/${leagueId}/leaderboard`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!alive) return;
        const sorted: MonthLB[] = (j.months || []).sort((a: MonthLB, b: MonthLB) => b.phaseId - a.phaseId);
        setMonths(sorted);
        if (sorted[0]) fetchHighlights(sorted[0]); // auto-load the current Manager of the Month
      })
      .catch(() => { if (alive) setMonths([]); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  if (months === null) {
    return <div className="mom-skel"><div className="motm" style={{ opacity: .5 }}><div className="trophy"><TrophySvg /></div><div><div className="lbl">Loading…</div><div className="nm">Manager of the Month</div></div></div></div>;
  }
  if (months.length === 0) {
    return <p className="kit-intro" style={{ marginTop: 6 }}>Manager of the Month unlocks once the first month of fixtures is complete. Check back after the August deadline.</p>;
  }

  const [hero, ...rest] = months;
  const hw = hero.top3[0];

  return (
    <>
      <p className="kit-intro" style={{ marginTop: 6 }}>
        Manager of the Month — the FPL phase winner in your mini-league, with the three storylines that drove the surge.
      </p>

      {/* Current Manager of the Month — hero card */}
      {hw && (
        <div className="mom-card" style={hw.entryId === focusId ? { outline: '2px solid var(--red)', outlineOffset: -2 } : undefined}>
          <div className="mom-top">
            <div className="trophy"><TrophySvg /></div>
            <div className="mom-id">
              <div className="lbl">{hero.phaseName} · Manager of the Month</div>
              <div className="nm">{cleanName(hw.teamName)}</div>
              <div className="mt">{cleanName(hw.managerName)} · GW{hero.startEvent}–{hero.stopEvent}</div>
            </div>
            <div className="pts"><div className="v">{hw.totalPoints}</div><div className="l">pts</div></div>
          </div>
          <HighlightList items={hls[hero.phaseId]} loading={!!hlLoading[hero.phaseId]} />
          {hero.top3.length > 1 && (
            <div className="mom-runners">
              {hero.top3.slice(1).map((e) => (
                <div className="mom-runner" key={e.entryId}>
                  <span className="medal">{e.rank === 2 ? '🥈' : '🥉'}</span>
                  <span className="nm">{cleanName(e.teamName)}</span>
                  <span className="pt">{e.totalPoints}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Previous months — tap to reveal that month's highlights */}
      {rest.length > 0 && <div className="lbl-row"><span className="l">PREVIOUS MONTHS</span></div>}
      {rest.map((m) => {
        const w = m.top3[0];
        if (!w) return null;
        const isOpen = open === m.phaseId;
        const cr = crestFor(w.entryId);
        return (
          <div className="mom-prev-wrap" key={m.phaseId}>
            <div className={`mom-prev ${isOpen ? 'is-open' : ''}`} onClick={() => { const next = isOpen ? null : m.phaseId; setOpen(next); if (next) fetchHighlights(m); }}>
              <span className="mtag">{m.phaseName}</span>
              {cr ? <Crest m={cr} size={30} /> : <span className="medal">🏆</span>}
              <div className="who"><div className="nm">{cleanName(w.teamName)}</div><div className="mgr">{cleanName(w.managerName)}</div></div>
              <div className="pts">{w.totalPoints}<small>pts</small></div>
              <span className="exp">{isOpen ? '−' : '+'}</span>
            </div>
            {isOpen && <HighlightList items={hls[m.phaseId]} loading={!!hlLoading[m.phaseId]} />}
          </div>
        );
      })}
    </>
  );
}

export function LeagueDetailClient({ data }: { data: LeagueAppData }) {
  const { managers, currentGameweek, league, focusTeamId } = data;
  const [gw, setGw] = useState(currentGameweek);
  const [tab, setTab] = useState<Tab>('standings');

  const gws = useMemo(() => Array.from({ length: Math.max(currentGameweek, 1) }, (_, i) => i + 1), [currentGameweek]);
  const focus = useMemo<AppManager | undefined>(
    () => managers.find((m) => m.id === focusTeamId) || managers[0],
    [managers, focusTeamId]
  );

  const gwSelect = (
    <span className="gwsel notch">
      GW{gw} <span className="car">▾</span>
      <select aria-label="Gameweek" value={gw} onChange={(e) => setGw(+e.target.value)}>
        {gws.map((g) => <option key={g} value={g}>GW{g}</option>)}
      </select>
    </span>
  );

  // Focus manager's live (latest-GW) rank, for the share card/text.
  const shareInfo = useMemo(() => {
    const s = standingsAt(managers, currentGameweek);
    const f = s.find((m) => m.id === focusTeamId);
    return { rank: f?.rank, size: s.length };
  }, [managers, currentGameweek, focusTeamId]);

  return (
    <AppShell
      navActive="leagues"
      title={league.name}
      backHref={`/app/leagues${focusTeamId ? `?teamId=${focusTeamId}` : ''}`}
      meta={`${league.type} · ${league.size} managers`}
      teamId={focusTeamId ?? undefined}
      youName={focus?.team}
      actions={<ShareLeagueButton leagueId={league.id} leagueName={league.name} teamId={focusTeamId} rank={shareInfo.rank} size={shareInfo.size} />}
    >
      <div className="ld-meta">
        {league.type} · {league.size} managers{focus ? ` · you're tracking ${focus.team}` : ''}{data.partial ? ' · top 30 shown' : ''}
      </div>
      <div className="s-tabs ld-tabs">
        {([['standings', 'Standings'], ['headlines', 'Headlines'], ['analytics', 'Analytics'], ['monthly', 'MOTM']] as [Tab, string][]).map(([id, label]) => (
          <a key={id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{label}</a>
        ))}
      </div>

      {tab === 'standings' && <StandingsTab managers={managers} gw={gw} focusId={focusTeamId} gwSelect={gwSelect} leagueId={league.id} />}
      {tab === 'headlines' && <HeadlinesTab managers={managers} gw={gw} leagueName={league.name} leagueId={league.id} gwSelect={gwSelect} />}
      {tab === 'monthly' && <MonthlyTab managers={managers} leagueId={league.id} focusId={focusTeamId} />}
      {tab === 'analytics' && <AnalyticsTab managers={managers} currentGameweek={currentGameweek} focusId={focusTeamId} />}
    </AppShell>
  );
}

/* ---------------- Standings ---------------- */
function StandingsTab({ managers, gw, focusId, gwSelect, leagueId }: { managers: AppManager[]; gw: number; focusId: number | null; gwSelect: React.ReactNode; leagueId: number }) {
  const router = useRouter();
  const s = standingsAt(managers, gw);
  const podium = [s[1], s[0], s[2]].filter(Boolean) as StandingRow[];
  const rest = s.slice(3);
  const squadHref = (id: number) => `/app/squad?teamId=${id}&leagueId=${leagueId}`;
  return (
    <>
      {s.length >= 3 && (
        <div className="podium" style={{ margin: '4px 0' }}>
          {podium.map((m, i) => (
            <div key={m.id} className={`pod ${['sil', 'gold', 'brz'][i]}`} style={{ cursor: 'pointer' }} onClick={() => router.push(squadHref(m.id))}>
              <div className="pos">{String(m.rank).padStart(2, '0')}</div>
              <Crest m={m} />
              <div className="nm">{m.team}</div>
              <div className="pts">{m.total}<small> pts</small></div>
            </div>
          ))}
        </div>
      )}
      <div className="lbl-row"><span className="l">TABLE</span>{gwSelect}</div>
      <div className="st-head">
        <span className="r">#</span><span /><span>Team</span><span className="c">GW</span><span className="c">Total</span><span className="c">Overall</span><span className="c">Move</span>
      </div>
      <div className="stand">
        {(rest.length ? rest : s).map((m) => {
          const ovr = m.overallRank?.[gw - 1] ?? m.overallRank?.[m.overallRank.length - 1] ?? 0;
          return (
            <div key={m.id} className={`st-row ${m.id === focusId ? 'is-you' : ''}`} onClick={() => router.push(squadHref(m.id))}>
              <div className="r">{m.rank}</div>
              <Crest m={m} size={34} />
              <div className="who"><div className="nm">{m.team}</div><div className="mgr">{m.mgr}</div></div>
              <div className="gw">{m.gw}</div>
              <div className="tot">{m.total.toLocaleString()}</div>
              <div className="ovr">{formatRank(ovr)}</div>
              <MoveTag mv={m.move} />
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Headlines ---------------- */
interface Story { tag: string; tone: string; title: string; sentiment?: 'pos' | 'neg' }

// Celebrating vs dejected manager photos — matched to each story's sentiment.
const HL_POS = ['positive_carrick_fist', 'positive_howie_fist', 'positive_iraola_celebrating', 'positive_maresca_celebrating', 'positive_unai_fist_cheer'];
const HL_NEG = ['negative_carrick_disapoint', 'negative_howie_disapointed', 'negative_iraola_frust', 'negative_maresca_scratch_head', 'negative_unai_disapointed'];
const hlImg = (n: string) => `/images/headlines/${n}.png`;
// Tags that read as bad news, used when an explicit sentiment is missing (fallback stories).
const HL_NEG_TAGS = new Set(['BENCH NIGHTMARE', 'CAPTAIN CALAMITY', 'CLONE WARS', 'BOTTLE JOB', 'PANIC MERCHANT', 'FALLER']);

/** Assign each story a manager photo: positive→celebration, negative→dejection,
 *  cycling through all five per sentiment and shuffling the start per league. */
function headlineImages(stories: Story[], leagueId: number): string[] {
  let p = leagueId % HL_POS.length;
  let n = (Math.floor(leagueId / HL_POS.length) + 1) % HL_NEG.length;
  return stories.map((s) => {
    const neg = s.sentiment ? s.sentiment === 'neg' : HL_NEG_TAGS.has(s.tag);
    return neg ? hlImg(HL_NEG[n++ % HL_NEG.length]) : hlImg(HL_POS[p++ % HL_POS.length]);
  });
}

function HeadlinesTab({ managers, gw, leagueName, leagueId, gwSelect }: { managers: AppManager[]; gw: number; leagueName: string; leagueId: number; gwSelect: React.ReactNode }) {
  // Instant render from already-loaded standings; the richer engine streams in after.
  const fallback = useMemo(() => headlinesFrom(managers, gw, leagueName), [managers, gw, leagueName]);
  const [data, setData] = useState<{ hero: Story; list: Story[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/leagues/${leagueId}/headlines?gw=${gw}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => { if (alive && j?.hero) setData({ hero: j.hero, list: j.list || [] }); })
      .catch(() => { if (alive) setData(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [leagueId, gw]);

  const hero: Story = data?.hero ?? { tag: fallback.tag, tone: '#FF5050', title: fallback.top, sentiment: 'pos' };
  const list: Story[] = data?.list?.length
    ? data.list
    : fallback.list.map((i) => ({ tag: i.tag, tone: i.tone, title: i.t }));

  // One celebrating/dejected manager photo per card, sentiment-matched and shuffled per league.
  const imgs = useMemo(() => headlineImages([hero, ...list], leagueId), [hero, list, leagueId]);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast('Story copied to clipboard');
  };

  return (
    <>
      <div className="lbl-row"><span className="l">TOP STORIES{loading ? ' · updating…' : ''}</span>{gwSelect}</div>
      <div className="hl-hero" onClick={() => copy(hero.title)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="ph"><img src={imgs[0]} alt="" /></div>
        <div className="grad" />
        <div className="ct"><span className="tag tab-cut" style={{ paddingRight: 18, background: hero.tone, ...(hero.tone === '#FFD100' ? { color: '#150000' } : {}) }}>{hero.tag}</span><h3>{hero.title}</h3></div>
      </div>
      <div className="hl-list">
        {list.map((i, idx) => (
          <div key={idx} className="hl-item" onClick={() => copy(i.title)}>
            <div>
              <span className="tag tab-cut" style={{ paddingRight: 16, background: i.tone, ...(i.tone === '#FFD100' ? { color: '#150000' } : {}) }}>{i.tag}</span>
              <h5>{i.title}</h5>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="ph"><img src={imgs[idx + 1]} alt="" /></div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Analytics ---------------- */
type RangeMode = 5 | 10 | 20 | 'custom';

function AnalyticsTab({ managers, currentGameweek, focusId }: { managers: AppManager[]; currentGameweek: number; focusId: number | null }) {
  const size = managers.length;
  const mm = motm(managers, currentGameweek);

  // Rank for every manager, gameweek by gameweek (computed once).
  const matrix = useMemo(() => rankMatrix(managers, currentGameweek), [managers, currentGameweek]);
  // Current standings drive the team-picker order and crests.
  const standings = useMemo(() => standingsAt(managers, currentGameweek), [managers, currentGameweek]);

  const [teamId, setTeamId] = useState<number>(focusId ?? managers[0]?.id ?? 0);
  const [mode, setMode] = useState<RangeMode>(10);
  const [customFrom, setCustomFrom] = useState(Math.max(1, currentGameweek - 5));
  const [customTo, setCustomTo] = useState(currentGameweek);
  const [selGw, setSelGw] = useState<number | null>(null);

  const team = managers.find((m) => m.id === teamId) ?? managers[0];
  const rankRow = matrix.get(team?.id ?? 0) ?? [];

  // Resolve the visible gameweek window from the active filter.
  const [from, to] = useMemo<[number, number]>(() => {
    if (mode === 'custom') {
      const lo = Math.min(customFrom, customTo), hi = Math.max(customFrom, customTo);
      return [Math.max(1, lo), Math.min(currentGameweek, hi)];
    }
    return [Math.max(1, currentGameweek - mode + 1), currentGameweek];
  }, [mode, customFrom, customTo, currentGameweek]);

  const points = useMemo(() => (team ? progressionFor(team, rankRow, from, to) : []), [team, rankRow, from, to]);

  // Keep the selected bubble valid; default to the latest GW in range.
  const sel = useMemo(() => points.find((p) => p.gw === selGw) ?? points[points.length - 1], [points, selGw]);

  // Chart geometry — rank 1 sits at the top. Scale Y to the positions actually held (with padding).
  const W = 300, H = 150, padL = 24, padR = 12, padT = 16, padB = 24;
  const plotW = W - padL - padR, plotH = H - padT - padB, x0 = padL, y0 = padT;
  const ranks = points.map((p) => p.rank);
  let rMin = Math.min(...ranks, Infinity), rMax = Math.max(...ranks, -Infinity);
  if (!isFinite(rMin)) { rMin = 1; rMax = size || 1; }
  if (rMin === rMax) { rMin = Math.max(1, rMin - 1); rMax = Math.min(size || rMax + 1, rMax + 1); }
  const n = points.length;
  const xOf = (i: number) => (n <= 1 ? x0 + plotW / 2 : x0 + (i / (n - 1)) * plotW);
  const yOf = (r: number) => y0 + ((r - rMin) / (rMax - rMin)) * plotH;
  const poly = points.map((p, i) => `${xOf(i).toFixed(1)},${yOf(p.rank).toFixed(1)}`).join(' ');

  // Horizontal rank gridlines/labels: top, middle, bottom of the visible band.
  const ticks = Array.from(new Set([rMin, Math.round((rMin + rMax) / 2), rMax]));
  // Thin out GW labels so they never collide.
  const labelEvery = Math.max(1, Math.ceil(n / 7));

  // Window-aware KPIs.
  const best = ranks.length && isFinite(Math.min(...ranks)) ? Math.min(...ranks) : 0;
  const avg = points.length ? Math.round(points.reduce((a, p) => a + p.gwPts, 0) / points.length) : 0;
  const climbs = points.filter((p, i) => i > 0 && p.rank < points[i - 1].rank).length;
  const maxBar = Math.max(...points.map((p) => p.gwPts), 1);

  return (
    <>
      <div className="motm">
        <div className="trophy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v3a6 6 0 0 1-12 0z" /><path d="M6 5H3v1a3 3 0 0 0 3 3M18 5h3v1a3 3 0 0 1-3 3" /><path d="M9 19h6M10 13v3a2 2 0 0 1-1 2M14 13v3a2 2 0 0 0 1 2" /></svg></div>
        <div><div className="lbl">Manager of the Month</div><div className="nm">{mm?.team}</div><div className="mt">{mm?.mgr} · last 4 GWs</div></div>
        <div className="pts"><div className="v">{(mm as any)?.mpts ?? 0}</div><div className="l">pts</div></div>
      </div>

      {/* Team picker */}
      <label className="an-pick">
        <span className="an-pick-l">Team</span>
        <span className="an-pick-v">{team?.team}</span>
        <select value={teamId} onChange={(e) => { setTeamId(+e.target.value); setSelGw(null); }}>
          {standings.map((m) => <option key={m.id} value={m.id}>{m.rank}. {m.team}</option>)}
        </select>
        <span className="car">▾</span>
      </label>

      {/* Range filter */}
      <div className="an-filter">
        {([[5, 'Last 5'], [10, 'Last 10'], [20, 'Last 20'], ['custom', 'Custom']] as [RangeMode, string][]).map(([m, label]) => (
          <button key={String(m)} className={mode === m ? 'is-active' : ''} onClick={() => { setMode(m); setSelGw(null); }}>{label}</button>
        ))}
      </div>
      {mode === 'custom' && (
        <div className="an-custom">
          <label>From<select value={customFrom} onChange={(e) => { setCustomFrom(+e.target.value); setSelGw(null); }}>
            {Array.from({ length: currentGameweek }, (_, i) => i + 1).map((g) => <option key={g} value={g}>GW{g}</option>)}
          </select></label>
          <span className="dash">–</span>
          <label>To<select value={customTo} onChange={(e) => { setCustomTo(+e.target.value); setSelGw(null); }}>
            {Array.from({ length: currentGameweek }, (_, i) => i + 1).map((g) => <option key={g} value={g}>GW{g}</option>)}
          </select></label>
        </div>
      )}

      {/* Rank progression — mini-league position on the Y axis, clickable bubbles */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span className="chart-lbl">{team?.team} — league position</span>
          <span className="chart-lbl">GW{from}–{to}</span>
        </div>
        {n === 0 ? (
          <div className="an-empty">No gameweek data in this range yet.</div>
        ) : (
          <svg className="an-svg" viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
            {ticks.map((r) => (
              <g key={r}>
                <line x1={x0} y1={yOf(r)} x2={W - padR} y2={yOf(r)} stroke="var(--line-2)" strokeWidth="1" />
                <text x={x0 - 6} y={yOf(r)} textAnchor="end" dominantBaseline="middle" className="an-yl">{r}</text>
              </g>
            ))}
            {n > 1 && <polyline points={poly} fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
            {points.map((p, i) => {
              const active = sel?.gw === p.gw;
              return (
                <g key={p.gw} className="an-node" onClick={() => setSelGw(p.gw)}>
                  <circle cx={xOf(i)} cy={yOf(p.rank)} r="11" fill="transparent" />
                  <circle cx={xOf(i)} cy={yOf(p.rank)} r={active ? 6 : 4.5} fill={active ? 'var(--red)' : '#fff'} stroke="var(--red)" strokeWidth="2.5" />
                  {(i % labelEvery === 0 || i === n - 1) && (
                    <text x={xOf(i)} y={H - 7} textAnchor="middle" className="an-xl">{p.gw}</text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Selected-bubble detail */}
      {sel && team && (
        <div className="an-detail">
          <Crest m={team} size={38} />
          <div className="an-d-team"><div className="nm">{team.team}</div><div className="mt">GW{sel.gw}</div></div>
          <div className="an-d-stat"><div className="v">{sel.rank}<small>/{size}</small></div><div className="l">Rank</div></div>
          <div className="an-d-stat"><div className="v red">{sel.gwPts}</div><div className="l">GW pts</div></div>
          <div className="an-d-stat"><div className="v">{sel.total}</div><div className="l">Total</div></div>
        </div>
      )}

      <div className="kpi" style={{ margin: '14px 0' }}>
        <div className="k"><div className="v red">{best ? formatRank(best) : '—'}</div><div className="l">Best rank</div></div>
        <div className="k"><div className="v">{avg}</div><div className="l">Avg / GW</div></div>
        <div className="k"><div className="v">{climbs}</div><div className="l">Climbs ▲</div></div>
      </div>

      <div className="chart-card barset-wrap">
        <span className="chart-lbl">{team?.team} — GW points</span>
        <div className="barset">
          {points.map((p) => (
            <div key={p.gw} className={`bar ${sel?.gw === p.gw ? 'hi' : ''}`} style={{ height: `${Math.round((p.gwPts / maxBar) * 100)}%`, cursor: 'pointer' }} onClick={() => setSelGw(p.gw)}><span>{p.gwPts}</span></div>
          ))}
        </div>
        <div className="axis">{points.map((p, i) => <b key={p.gw}>{(i % labelEvery === 0 || i === n - 1) ? p.gw : ''}</b>)}</div>
      </div>
    </>
  );
}

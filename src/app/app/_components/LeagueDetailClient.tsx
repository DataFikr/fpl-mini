'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LeagueAppData, AppManager } from '../_lib/league-data';
import { standingsAt, motm, analyticsFor, headlinesFrom, ordinal, type StandingRow } from '../_lib/compute';
import { toast } from './Toast';
import { BottomNav } from './BottomNav';
import { ToastHost } from './Toast';
import { AppMenu } from './AppMenu';
import { ShareLeagueButton } from './ShareLeagueButton';

type Tab = 'standings' | 'headlines' | 'analytics';

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

export function LeagueDetailClient({ data }: { data: LeagueAppData }) {
  const router = useRouter();
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
    <>
      <div className="app-head">
        <div className="ah-left">
          <button className="back" aria-label="Back" onClick={() => router.push('/app')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#150000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="ah-title">{league.name}</div>
        </div>
        <AppMenu />
      </div>

      <div className="app-scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '-2px 0 14px' }}>
          <div className="ld-meta" style={{ margin: 0 }}>
            {league.type} · {league.size} managers{focus ? ` · you're tracking ${focus.team}` : ''}{data.partial ? ' · top 30 shown' : ''}
          </div>
          <ShareLeagueButton leagueId={league.id} leagueName={league.name} teamId={focusTeamId} rank={shareInfo.rank} size={shareInfo.size} />
        </div>
        <div className="s-tabs ld-tabs">
          {(['standings', 'headlines', 'analytics'] as Tab[]).map((id) => (
            <a key={id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
              {id[0].toUpperCase() + id.slice(1)}
            </a>
          ))}
        </div>

        {tab === 'standings' && <StandingsTab managers={managers} gw={gw} focusId={focusTeamId} gwSelect={gwSelect} />}
        {tab === 'headlines' && <HeadlinesTab managers={managers} gw={gw} leagueName={league.name} />}
        {tab === 'analytics' && <AnalyticsTab managers={managers} gw={gw} focus={focus} />}
      </div>

      <BottomNav active="leagues" teamId={focusTeamId ?? undefined} />
      <ToastHost />
    </>
  );
}

/* ---------------- Standings ---------------- */
function StandingsTab({ managers, gw, focusId, gwSelect }: { managers: AppManager[]; gw: number; focusId: number | null; gwSelect: React.ReactNode }) {
  const router = useRouter();
  const s = standingsAt(managers, gw);
  const podium = [s[1], s[0], s[2]].filter(Boolean) as StandingRow[];
  const rest = s.slice(3);
  return (
    <>
      {s.length >= 3 && (
        <div className="podium" style={{ margin: '4px 0' }}>
          {podium.map((m, i) => (
            <div key={m.id} className={`pod ${[ 'sil','gold','brz'][i]}`}>
              <div className="pos">{String(m.rank).padStart(2, '0')}</div>
              <Crest m={m} />
              <div className="nm">{m.team}</div>
              <div className="pts">{m.total}<small> pts</small></div>
            </div>
          ))}
        </div>
      )}
      <div className="lbl-row"><span className="l">TABLE</span>{gwSelect}</div>
      <div className="stand">
        {(rest.length ? rest : s).map((m) => (
          <div key={m.id} className={`st-row ${m.id === focusId ? 'is-you' : ''}`} onClick={() => router.push(`/app/squad?teamId=${m.id}`)}>
            <div className="r">{m.rank}</div>
            <Crest m={m} size={34} />
            <div className="who"><div className="nm">{m.team}</div><div className="mgr">{m.mgr}</div></div>
            <div className="gw">{m.gw}</div>
            <MoveTag mv={m.move} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Headlines ---------------- */
function HeadlinesTab({ managers, gw, leagueName }: { managers: AppManager[]; gw: number; leagueName: string }) {
  const h = headlinesFrom(managers, gw, leagueName);
  return (
    <>
      <div className="hl-hero" onClick={() => toast('Story copied to clipboard')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="ph"><img src={h.heroImg} alt="" /></div>
        <div className="grad" />
        <div className="ct"><span className="tag tab-cut" style={{ paddingRight: 18, background: '#FF5050' }}>{h.tag}</span><h3>{h.top}</h3></div>
      </div>
      <div className="hl-list">
        {h.list.map((i, idx) => (
          <div key={idx} className="hl-item" onClick={() => toast('Story copied to clipboard')}>
            <div>
              <span className="tag tab-cut" style={{ paddingRight: 16, background: i.tone, ...(i.tone === '#FFD100' ? { color: '#150000' } : {}) }}>{i.tag}</span>
              <h5>{i.t}</h5>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="ph"><img src={i.img} alt="" /></div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Analytics ---------------- */
function AnalyticsTab({ managers, gw, focus }: { managers: AppManager[]; gw: number; focus?: AppManager }) {
  const a = analyticsFor(focus, gw);
  const mm = motm(managers, gw);

  // Rank line: lower FPL rank = better, drawn higher (lower y).
  const ranks = a.rankLine;
  const minR = Math.min(...ranks, Infinity), maxR = Math.max(...ranks, -Infinity);
  const yOf = (r: number) => (maxR === minR ? 50 : 12 + ((r - minR) / (maxR - minR)) * 88);
  const n = ranks.length;
  const poly = ranks.map((r, i) => `${(n <= 1 ? 150 : (i / (n - 1)) * 288 + 6).toFixed(0)},${yOf(r).toFixed(0)}`).join(' ');

  const maxBar = Math.max(...a.gwPoints, 1);
  return (
    <>
      <div className="motm">
        <div className="trophy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v3a6 6 0 0 1-12 0z" /><path d="M6 5H3v1a3 3 0 0 0 3 3M18 5h3v1a3 3 0 0 1-3 3" /><path d="M9 19h6M10 13v3a2 2 0 0 1-1 2M14 13v3a2 2 0 0 0 1 2" /></svg></div>
        <div><div className="lbl">Manager of the Month</div><div className="nm">{mm?.team}</div><div className="mt">{mm?.mgr} · last 4 GWs</div></div>
        <div className="pts"><div className="v">{(mm as any)?.mpts ?? 0}</div><div className="l">pts</div></div>
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span className="chart-lbl">{focus?.team ? `${focus.team} — overall rank` : 'Overall rank'}</span>
          <span className="mono" style={{ fontWeight: 700, fontSize: 12, color: 'var(--green)' }}>{a.rankDelta}</span>
        </div>
        <svg viewBox="0 0 300 110" width="100%" height={110} preserveAspectRatio="none">
          <line x1="0" y1="28" x2="300" y2="28" stroke="#eee" /><line x1="0" y1="64" x2="300" y2="64" stroke="#eee" /><line x1="0" y1="100" x2="300" y2="100" stroke="#eee" />
          {n > 1 && <polyline points={poly} fill="none" stroke="#FF5050" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}
          {n >= 1 && <circle cx={n <= 1 ? 150 : 294} cy={yOf(ranks[n - 1])} r="4.5" fill="#FF5050" />}
        </svg>
        <div className="axis">{ranks.map((_, i) => <b key={i}>{i + 1}</b>)}</div>
      </div>

      <div className="kpi" style={{ margin: '12px 0' }}>
        <div className="k"><div className="v red">{a.best}</div><div className="l">Best rank</div></div>
        <div className="k"><div className="v">{a.avg}</div><div className="l">Avg / GW</div></div>
        <div className="k"><div className="v">{a.greens}</div><div className="l">Green ▲</div></div>
      </div>

      <div className="chart-card barset-wrap">
        <span className="chart-lbl">{focus?.team ? `${focus.team} — GW points` : 'GW points'}</span>
        <div className="barset">
          {a.gwPoints.map((p, i) => (
            <div key={i} className={`bar ${i === a.gwPoints.length - 1 ? 'hi' : ''}`} style={{ height: `${Math.round((p / maxBar) * 100)}%` }}><span>{p}</span></div>
          ))}
        </div>
        <div className="axis">{a.gwPoints.map((_, i) => <b key={i}>{i + 1}</b>)}</div>
      </div>
    </>
  );
}

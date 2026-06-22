'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SquadData, PitchPlayer } from '../_lib/squad-data';
import type { PredRow } from '../_lib/prediction';
import { PredictionBlock } from './PredictionBlock';
import { PlayerCard } from './PlayerCard';
import { toast } from './Toast';

type SqTab = 'team' | 'transfers' | 'impact' | 'prediction' | 'rival';

/* ---------------- Rival Watch ---------------- */
interface RWEO { id: number; name: string; team: string; eo: number; ownedPct: number }
interface RWCap { id: number; name: string; team: string; count: number; pct: number }
interface RWChip { key: string; label: string; count: number }
interface RivalData { leagueName: string; gw: number; managers: number; effectiveOwnership: RWEO[]; captaincy: RWCap[]; chips: RWChip[] }

function RivalWatch({ teamId, leagueId, currentGameweek, defaultGw }: { teamId: number; leagueId?: number; currentGameweek: number; defaultGw: number }) {
  const [gw, setGw] = useState(defaultGw);
  const [data, setData] = useState<RivalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true; setLoading(true); setErr(false);
    const q = `gw=${gw}${leagueId ? `&leagueId=${leagueId}` : ''}`;
    fetch(`/api/teams/${teamId}/rival-watch?${q}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => { if (alive) setData(j); })
      .catch(() => { if (alive) setErr(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [teamId, leagueId, gw]);

  const gws = Array.from({ length: Math.max(currentGameweek, 1) }, (_, i) => i + 1);
  const maxEo = data?.effectiveOwnership[0]?.eo || 100;
  const maxCap = data?.captaincy[0]?.count || 1;
  const totalChips = data ? data.chips.reduce((a, c) => a + c.count, 0) : 0;

  return (
    <div style={{ marginTop: 6 }}>
      <div className="lbl-row">
        <span className="l">RIVAL WATCH</span>
        <span className="gwsel notch">
          GW{gw} <span className="car">▾</span>
          <select aria-label="Gameweek" value={gw} onChange={(e) => setGw(+e.target.value)}>
            {gws.map((g) => <option key={g} value={g}>GW{g}</option>)}
          </select>
        </span>
      </div>
      {data && <p className="tp-intro">What the rest of <b>{data.leagueName}</b> is doing in GW{gw} — across {data.managers} managers.</p>}

      {loading && <div className="rw-load">Scouting your rivals…</div>}
      {err && !loading && <div className="info-card"><h3>Rival watch unavailable</h3><p>Couldn&rsquo;t load your mini-league&rsquo;s picks for this gameweek. Open it from a league page to set the rivals.</p></div>}

      {data && !loading && (
        <>
          <div className="lbl-row" style={{ marginTop: 14 }}><span className="l">EFFECTIVE OWNERSHIP · TOP 10</span></div>
          <div className="rw-list">
            {data.effectiveOwnership.map((p, i) => (
              <div className="rw-row" key={p.id}>
                <span className="rw-rk">{i + 1}</span>
                <div className="rw-who"><div className="nm">{p.name}</div><div className="cl">{p.team} · {p.ownedPct}% owned</div></div>
                <div className="rw-bar"><div className="rw-bf" style={{ width: `${Math.min(100, (p.eo / maxEo) * 100)}%` }} /></div>
                <span className="rw-val">{p.eo}%</span>
              </div>
            ))}
          </div>

          <div className="lbl-row" style={{ marginTop: 16 }}><span className="l">MOST CAPTAINED · TOP 10</span></div>
          {data.captaincy.length === 0 ? (
            <div className="rw-load">No captains recorded for GW{gw} yet.</div>
          ) : (
            <div className="rw-list">
              {data.captaincy.map((p, i) => (
                <div className="rw-row" key={p.id}>
                  <span className="rw-rk">{i + 1}</span>
                  <div className="rw-who"><div className="nm">{p.name}</div><div className="cl">{p.team}</div></div>
                  <div className="rw-bar"><div className="rw-bf cap" style={{ width: `${(p.count / maxCap) * 100}%` }} /></div>
                  <span className="rw-val">{p.count}× <small>{p.pct}%</small></span>
                </div>
              ))}
            </div>
          )}

          <div className="lbl-row" style={{ marginTop: 16 }}><span className="l">CHIPS PLAYED · GW{gw}</span></div>
          <div className="rw-chips">
            {data.chips.map((c) => (
              <div className={`rw-chip ${c.count > 0 && c.key !== 'none' ? 'on' : ''}`} key={c.key}>
                <div className="v">{c.count}</div>
                <div className="cl">{c.label}</div>
                <div className="rw-cbar"><div style={{ width: `${totalChips ? (c.count / totalChips) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Shirt({ p, onOpen }: { p: PitchPlayer; onOpen: (p: PitchPlayer) => void }) {
  return (
    <div className="player" onClick={() => onOpen(p)}>
      {p.isCaptain && <span className="capt">C</span>}
      {p.isVice && !p.isCaptain && <span className="capt" style={{ background: '#cfd8e3', color: '#111' }}>V</span>}
      {p.shirt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="shirt" src={p.shirt} alt={`${p.teamShort} kit`} />
      ) : (
        <div className="shirt" style={{ height: 44, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'var(--mono)', fontSize: 10 }}>{p.teamShort}</div>
      )}
      <div className="pn">{p.name}</div>
      <div className="pp">{p.points}</div>
    </div>
  );
}

function TeamIdPrompt() {
  const router = useRouter();
  const [id, setId] = useState('');
  const go = () => {
    const v = id.trim();
    if (!/^\d{1,9}$/.test(v)) { toast('Team IDs are numbers only'); return; }
    router.push(`/app/squad?teamId=${v}`);
  };
  return (
    <div style={{ marginTop: 18, background: 'var(--ink)', color: '#fff', padding: '22px 18px', clipPath: 'polygon(0 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%)' }}>
      <div className="lbl" style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Load your real pitch</div>
      <h3 style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 23, margin: '5px 0 4px' }}>ENTER YOUR FPL TEAM ID</h3>
      <p style={{ fontFamily: 'var(--body)', fontSize: 12.5, color: '#cfc6c6', lineHeight: 1.5, margin: '0 0 14px' }}>
        Your live starting XI, captain and gameweek points — straight from the FPL API.
      </p>
      <form className="id-field" style={{ display: 'inline-flex' }} onSubmit={(e) => { e.preventDefault(); go(); }} noValidate>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>
        <input inputMode="numeric" placeholder="e.g. 6454003" aria-label="FPL team ID" value={id} onChange={(e) => setId(e.target.value)} />
        <button type="submit" className="s-btn s-btn--red hex">Load</button>
      </form>
      <p style={{ fontFamily: 'var(--body)', fontSize: 11, color: '#9a8e8e', margin: '10px 0 0' }}>
        Don&rsquo;t know it? <a href="/app/find-team-id" style={{ color: 'var(--red)', fontWeight: 700 }}>Find your team ID ›</a>
      </p>
    </div>
  );
}

function TransferCard({ r, primary }: { r: PredRow; primary?: boolean }) {
  const f = r.factors!;
  const delta = r.pxp - r.cxp;
  return (
    <div className="tcard">
      <div className="tcard-head">
        <span className="tag tab-cut" style={{ paddingRight: 16, background: primary ? '#FF5050' : 'var(--ink)' }}>{primary ? 'Transfer' : 'Monitor'}</span>
        <span className="tcard-delta">+{delta} xP</span>
      </div>
      <div className="tcard-move">
        <span className="t-side"><span className="dot out" />{r.cur} <small>{r.tm}</small></span>
        <span className="t-arrow">→</span>
        <span className="t-side"><span className="dot in" />{r.pick} <small>{f.pickTm}</small></span>
      </div>
      <div className="tcard-factors">
        <div className="tf"><div className="tf-l">Form · pts/game</div><div className="tf-v"><b className={f.inForm >= f.outForm ? 'up' : 'dn'}>{f.outForm} → {f.inForm}</b></div></div>
        <div className="tf"><div className="tf-l">Season minutes</div><div className="tf-v"><b className={f.inMins >= f.outMins ? 'up' : 'dn'}>{f.outMins.toLocaleString()} → {f.inMins.toLocaleString()}</b></div></div>
        <div className="tf"><div className="tf-l">Price</div><div className="tf-v">£{f.outPrice.toFixed(1)} → £{f.inPrice.toFixed(1)}</div></div>
      </div>
      <p className="tcard-why">{r.why}</p>
      <div className="tcard-tags"><span className="ttag">✓ Within budget</span><span className="ttag">✓ No −4 hit</span></div>
    </div>
  );
}

function TransfersView({ data }: { data: SquadData }) {
  const rows = data.prediction.rows
    .filter((r) => r.factors && r.pick !== r.cur && r.pxp > r.cxp)
    .sort((a, b) => (b.pxp - b.cxp) - (a.pxp - a.cxp));
  const transfer = rows.find((r) => r.act === 'transfer');
  const watch = rows.filter((r) => r !== transfer);
  const seasonOver = data.prediction.horizon.toLowerCase().includes('form');

  return (
    <div style={{ marginTop: 6 }}>
      <p className="tp-intro">
        {seasonOver
          ? `Season complete (GW${data.team.gw}). Suggested moves are ranked on full-season form, minutes and price — fixture difficulty resumes when 2026/27 opens. Every pick fits your budget with a single free transfer (no −4 hit).`
          : `Model-optimal moves for the run — ranked on recent form, fixtures and minutes, within your budget and free transfer (no −4 hit).`}
      </p>
      {rows.length === 0 ? (
        <div className="info-card"><h3>No transfer needed</h3><p>Your XI is within a point or two of the model&rsquo;s best — hold your transfers.</p></div>
      ) : (
        <>
          {transfer && <TransferCard r={transfer} primary />}
          {watch.length > 0 && (
            <>
              <div className="lbl-row" style={{ marginTop: 16 }}><span className="l">ON THE WATCHLIST</span></div>
              {watch.map((r, i) => <TransferCard key={i} r={r} />)}
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Transfer Impact ---------------- */
interface TIPlayer { id: number; name: string; team: string; points: number; cost: number; nowCost: number; epNext: number; form: number }
interface TIDetail { playerIn: TIPlayer; playerOut: TIPlayer; time: string }
interface TIGw { gameweek: number; isCurrent: boolean; count: number; cost: number; details: TIDetail[]; totalPointsIn: number; totalPointsOut: number }
interface TIData { currentGameweek: number; gameweeks: TIGw[] }

function TICard({ gw }: { gw: TIGw }) {
  const inTotal = gw.totalPointsIn;
  const outTotal = gw.totalPointsOut;
  const net = inTotal - outTotal;
  const afterHit = net - gw.cost;
  const badge = afterHit >= 10 ? { k: 'genius', icon: '🟢', t: 'Genius Move' }
    : afterHit <= -8 ? { k: 'costly', icon: '🔴', t: 'Costly' }
    : { k: 'neutral', icon: '🟡', t: 'Neutral' };
  const maxBar = Math.max(inTotal, outTotal, 1);
  const proj5In = Math.round(gw.details.reduce((s, d) => s + d.playerIn.epNext, 0) * 5);
  const proj5Out = Math.round(gw.details.reduce((s, d) => s + d.playerOut.epNext, 0) * 5);
  const priceChange = gw.details.reduce((s, d) => s + (d.playerIn.nowCost - d.playerIn.cost), 0);

  return (
    <div className="ti-card">
      <div className="ti-head">
        <div className="ti-gw">GW{gw.gameweek}{gw.isCurrent && <span className="ti-live">LIVE</span>}</div>
        <div className="ti-meta">{gw.count} transfer{gw.count > 1 ? 's' : ''} · {gw.cost > 0 ? `−${gw.cost} pts hit` : 'no hit'}</div>
      </div>

      <div className="ti-moves">
        {gw.details.map((d, i) => (
          <div className="ti-move" key={i}>
            <div className="ti-side in"><span className="dot" /><span className="nm">{d.playerIn.name}</span><span className="tm">{d.playerIn.team}</span><span className="pt">{d.playerIn.points}</span></div>
            <span className="ti-arrow">↔</span>
            <div className="ti-side out"><span className="dot" /><span className="nm">{d.playerOut.name}</span><span className="tm">{d.playerOut.team}</span><span className="pt">{d.playerOut.points}</span></div>
          </div>
        ))}
      </div>

      <div className="ti-net">
        <div className="ti-net-row"><span>Net transfer gain</span><b className={net >= 0 ? 'up' : 'dn'}>{net >= 0 ? '+' : ''}{net}</b></div>
        <div className="ti-net-row"><span>After {gw.cost > 0 ? `−${gw.cost} hit` : 'hit'}</span><b className={afterHit >= 0 ? 'up' : 'dn'}>{afterHit >= 0 ? '+' : ''}{afterHit} net</b></div>
      </div>

      <div className={`ti-badge ${badge.k}`}>{badge.icon} {badge.t}</div>

      <div className="ti-bars">
        <div className="ti-bar-row"><span className="l">In</span><div className="bar"><div className="bf in" style={{ width: `${(inTotal / maxBar) * 100}%` }} /></div><span className="v">{inTotal} pts</span></div>
        <div className="ti-bar-row"><span className="l">Out</span><div className="bar"><div className="bf out" style={{ width: `${(outTotal / maxBar) * 100}%` }} /></div><span className="v">{outTotal} pts</span></div>
        <div className="ti-diff">Difference <b className={net >= 0 ? 'up' : 'dn'}>{net >= 0 ? '+' : ''}{net}</b></div>
      </div>

      <div className="ti-proj">
        <div className="ti-proj-h">Long-term outlook</div>
        <div className="ti-proj-row"><span>Projected next 5 GWs · in</span><b>{proj5In} pts</b></div>
        <div className="ti-proj-row"><span>Projected next 5 GWs · out</span><b>{proj5Out} pts</b></div>
        <div className="ti-proj-row"><span>Price change since buy</span><b className={priceChange >= 0 ? 'up' : 'dn'}>{priceChange >= 0 ? '+' : '−'}£{Math.abs(priceChange).toFixed(1)}m</b></div>
      </div>
    </div>
  );
}

function TransferImpact({ teamId }: { teamId: number }) {
  const [data, setData] = useState<TIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true; setLoading(true); setErr(false);
    fetch(`/api/teams/${teamId}/transfer-history`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => { if (alive) setData(j); })
      .catch(() => { if (alive) setErr(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [teamId]);

  return (
    <div style={{ marginTop: 6 }}>
      <div className="scr-head" style={{ marginBottom: 8 }}>
        <div><div className="scr-title" style={{ fontSize: 26 }}>🔄 TRANSFER IMPACT</div><div className="scr-sub">Every move, validated</div></div>
      </div>
      <p className="tp-intro">Where the dopamine — or the regret — happens. Each gameweek&rsquo;s transfers scored on what came in versus what went out, the hit you paid, and whether it pays off long term.</p>

      {loading && <div className="rw-load">Crunching your transfers…</div>}
      {err && !loading && <div className="info-card"><h3>Transfer impact unavailable</h3><p>Couldn&rsquo;t load your transfer history right now.</p></div>}
      {data && !loading && data.gameweeks.length === 0 && (
        <div className="info-card"><h3>No transfers yet</h3><p>Once you make transfers, this is where the dopamine (or regret) lands.</p></div>
      )}
      {data && !loading && data.gameweeks.map((gw) => <TICard key={gw.gameweek} gw={gw} />)}
    </div>
  );
}

export function SquadScreen({ data, leagueId }: { data?: SquadData; leagueId?: number }) {
  const router = useRouter();
  const [tab, setTab] = useState<SqTab>('team');
  const [selected, setSelected] = useState<PitchPlayer | null>(null);
  const tabs: [SqTab, string][] = [['team', 'Squad'], ['transfers', 'Planner'], ['impact', 'Transfer Impact'], ['rival', 'Rival watch'], ['prediction', 'Prediction']];

  const sub = data
    ? `${data.team.name} · ${data.team.gwPoints} pts · GW${data.team.gw}`
    : 'Enter a team ID to load your live pitch';

  const gws = data ? Array.from({ length: Math.max(data.currentGameweek, 1) }, (_, i) => i + 1) : [];

  return (
    <>
      <div className="scr-head" style={{ marginBottom: 8 }}>
        <div><div className="scr-title">MY SQUAD</div><div className="scr-sub">{sub}</div></div>
      </div>
      <div className="s-tabs ld-tabs">
        {tabs.map(([id, t]) => <a key={id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{t}</a>)}
      </div>

      {tab === 'team' && (
        !data ? <TeamIdPrompt /> : (
          <>
            <div className="lbl-row" style={{ marginTop: 6, marginBottom: 8 }}>
              <span className="l">STARTING XI</span>
              <span className="gwsel notch">
                GW{data.team.gw} <span className="car">▾</span>
                <select aria-label="Gameweek" value={data.team.gw} onChange={(e) => router.push(`/app/squad?teamId=${data.team.id}&gw=${e.target.value}`)}>
                  {gws.map((g) => <option key={g} value={g}>GW{g}</option>)}
                </select>
              </span>
            </div>
            <div className="pitch">
              <div className="pline" /><div className="circ" />
              <div className="prow">{data.starters.gk.map((p) => <Shirt key={p.id} p={p} onOpen={setSelected} />)}</div>
              <div className="prow">{data.starters.def.map((p) => <Shirt key={p.id} p={p} onOpen={setSelected} />)}</div>
              <div className="prow">{data.starters.mid.map((p) => <Shirt key={p.id} p={p} onOpen={setSelected} />)}</div>
              <div className="prow">{data.starters.fwd.map((p) => <Shirt key={p.id} p={p} onOpen={setSelected} />)}</div>
            </div>
            <div className="lbl-row"><span className="l">BENCH</span>{data.activeChip ? <span className="more">{data.activeChip.replace(/^./, (c) => c.toUpperCase())} active</span> : null}</div>
            <div className="bench-strip">
              {data.bench.map((b) => <div className="b" key={b.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(b)}><div className="bn">{b.name}</div><div className="bp">{b.points}</div></div>)}
            </div>

            <div className="scr-head" style={{ marginTop: 22, marginBottom: 10 }}>
              <div><div className="scr-title" style={{ fontSize: 26 }}>RANK MY TEAM</div><div className="scr-sub">FPL Ranker verdict · GW{data.team.gw}</div></div>
            </div>
            <div className="rmt-verdict">
              <div className="rating"><span className="tag tab-cut" style={{ paddingRight: 16, background: '#FF5050' }}>{data.verdict.tag.toUpperCase()}</span></div>
              <div className="rating" style={{ marginTop: 8 }}><span className="v">{data.verdict.score.toFixed(1)}</span><span className="o">/ 10</span></div>
              <p className="pr" style={{ marginTop: 10, marginBottom: 0, fontFamily: 'var(--mono)', fontSize: 10.5, color: '#cfc6c6', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Full 2025/26 season · {data.verdict.seasonTotal} pts · {data.verdict.seasonPpg}/GW avg
              </p>
              <p className="pr">{data.verdict.summary}</p>
            </div>

            <div className="lbl-row" style={{ marginTop: 6 }}><span className="l">WHAT WE SEE</span></div>
            <div className="rmt-rows">
              {data.verdict.insights.map((r, i) => (
                <div className="rmt-line" key={i}><span className={`dot ${r.k}`} /><div><div className="nm">{r.n}</div><p className="ds">{r.d}</p></div></div>
              ))}
            </div>

            <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', marginTop: 14 }}>
              Live from the FPL API · overall total {data.team.totalPoints} pts
            </p>
          </>
        )
      )}

      {tab === 'transfers' && data && <TransfersView data={data} />}

      {tab === 'impact' && (data ? <TransferImpact teamId={data.team.id} /> : <TeamIdPrompt />)}

      {tab === 'rival' && (data
        ? <RivalWatch teamId={data.team.id} leagueId={leagueId} currentGameweek={data.currentGameweek} defaultGw={data.team.gw} />
        : <TeamIdPrompt />)}

      {tab === 'prediction' && <div style={{ marginTop: 6 }}><PredictionBlock data={data?.prediction} /></div>}

      {selected && <PlayerCard player={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

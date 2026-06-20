'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TPLAN } from '../_lib/screen-data';
import type { SquadData, PitchPlayer } from '../_lib/squad-data';
import { PredictionBlock } from './PredictionBlock';
import { toast } from './Toast';

type SqTab = 'team' | 'transfers' | 'prediction';

function Shirt({ p }: { p: PitchPlayer }) {
  const contribution = p.points * (p.multiplier || 1);
  return (
    <div className="player" onClick={() => toast(`${p.name} — ${contribution} pts${p.isCaptain ? ' (C)' : ''}`)}>
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
        Don&rsquo;t know it? <a href="/find-team-id" style={{ color: 'var(--red)', fontWeight: 700 }}>Find your team ID ›</a>
      </p>
    </div>
  );
}

export function SquadScreen({ data }: { data?: SquadData }) {
  const router = useRouter();
  const [tab, setTab] = useState<SqTab>('team');
  const tabs: [SqTab, string][] = [['team', 'Squad'], ['transfers', 'Transfers'], ['prediction', 'Prediction']];

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
              <div className="prow">{data.starters.gk.map((p) => <Shirt key={p.id} p={p} />)}</div>
              <div className="prow">{data.starters.def.map((p) => <Shirt key={p.id} p={p} />)}</div>
              <div className="prow">{data.starters.mid.map((p) => <Shirt key={p.id} p={p} />)}</div>
              <div className="prow">{data.starters.fwd.map((p) => <Shirt key={p.id} p={p} />)}</div>
            </div>
            <div className="lbl-row"><span className="l">BENCH</span>{data.activeChip ? <span className="more">{data.activeChip.replace(/^./, (c) => c.toUpperCase())} active</span> : null}</div>
            <div className="bench-strip">
              {data.bench.map((b) => <div className="b" key={b.id}><div className="bn">{b.name}</div><div className="bp">{b.points}</div></div>)}
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

      {tab === 'transfers' && (
        <>
          <div className="tp-intro">Your model-optimal moves over the next 3 gameweeks, with the live price overlay on. <b>(demo)</b></div>
          <div className="tp-bank">
            <div><div className="tp-bank-l">In the bank</div><div className="tp-bank-v">{TPLAN.bank}</div></div>
            <div style={{ textAlign: 'right' }}><div className="tp-bank-l">Free transfers</div><div className="tp-bank-v" style={{ color: 'var(--red)' }}>{TPLAN.ft}</div></div>
          </div>
          <div className="tp-cols">
            {TPLAN.cols.map((c, i) => (
              <div className="tp-col" key={i}>
                <div className="gw">GW{(data?.team.gw ?? TPLAN.gwStart) + i}</div>
                {c.moves.map((m, j) => (
                  <div className="tp-move" key={j}>
                    <div className="io"><span className={`dot ${m.io}`} />{m.n}</div>
                    <div className="price">{m.pr} <b className={m.dir}>{m.d}</b></div>
                  </div>
                ))}
                <div className="proj"><div className="v">{c.proj}</div><div className="l">proj pts</div></div>
              </div>
            ))}
          </div>
          <div className="chart-card" style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span className="chart-lbl">Wirtz price trend</span>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 11, color: 'var(--green)' }}>£8.6 ▲</span>
            </div>
            <svg viewBox="0 0 300 50" width="100%" height={46} preserveAspectRatio="none">
              <polyline points="4,40 50,38 96,34 142,30 188,24 234,18 296,10" fill="none" stroke="#009C54" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="296" cy="10" r="4" fill="#009C54" />
            </svg>
          </div>
        </>
      )}

      {tab === 'prediction' && <div style={{ marginTop: 6 }}><PredictionBlock data={data?.prediction} /></div>}
    </>
  );
}

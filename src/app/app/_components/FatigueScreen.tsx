'use client';

import { WC_FATIGUE } from '../_lib/fatigue-data';
import { getKitbagUrlByShort } from '@/utils/kitbag-urls';
import { toast } from './Toast';

const riskLabel = (r: string) => (r === 'hi' ? 'High' : r === 'md' ? 'Med' : 'Low');

export function FatigueScreen() {
  const openKit = (short: string, club: string) => {
    toast(`Opening ${club} on Kitbag`);
    window.open(getKitbagUrlByShort(short), '_blank', 'noopener');
  };

  return (
    <>
      <div className="scr-head">
        <div><div className="scr-title">WC FATIGUE</div><div className="scr-sub">World Cup 2026 · GW1 risk · Premier League</div></div>
        <span className="live"><span className="dot" />Live</span>
      </div>
      <p className="kit-intro">
        Projected tournament load for FPL-relevant Premier League stars at World Cup 2026 — the deeper the run, the bigger the GW1 burnout risk. Tap a player to shop their club kit.
      </p>
      <div>
        {WC_FATIGUE.map((p, i) => (
          <div
            className="np-row"
            key={p.surname}
            style={{ cursor: 'pointer', ...(i === WC_FATIGUE.length - 1 ? { marginBottom: 0 } : {}) }}
            onClick={() => openKit(p.short, p.club)}
            title={`Shop ${p.club} kit on Kitbag`}
          >
            <div className="crest" style={{ background: p.color, color: p.fg || '#fff', width: 34, height: 34, fontSize: 10.5 }}>{p.short}</div>
            <div className="np-info">
              <div className="nm">{p.surname} <span style={{ color: 'var(--t3)', fontWeight: 600 }}>· {p.nation}</span></div>
              <div style={{ marginTop: 3, fontFamily: 'var(--body)', fontSize: 11, lineHeight: 1.4, color: 'var(--t2)' }}>{p.note}</div>
              <div className="heat" style={{ marginTop: 7 }}><div className="hf" style={{ width: `${p.load}%` }} /></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`risk ${p.risk}`}>{riskLabel(p.risk)}</span>
              <div className="mono" style={{ fontSize: 9, color: 'var(--t3)', marginTop: 4 }}>{p.pos} · {p.load}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', marginTop: 14 }}>
        Projected load · editorial model · kit links are affiliate
      </p>
    </>
  );
}

'use client';

import { useState } from 'react';
import { WC_FATIGUE, NATIONS } from '../_lib/fatigue-data';
import { getKitbagUrlByShort } from '@/utils/kitbag-urls';
import { toast } from './Toast';

const riskLabel = (r: string) => (r === 'hi' ? 'High' : r === 'md' ? 'Med' : 'Low');

export function FatigueScreen() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <div className="scr-head">
        <div><div className="scr-title">WC FATIGUE</div><div className="scr-sub">World Cup 2026 · live minutes · GW1 risk</div></div>
        <span className="live"><span className="dot" />Live</span>
      </div>
      <p className="kit-intro">
        Tracking real World Cup 2026 minutes for FPL-relevant Premier League stars — the more they play now, the bigger the GW1 burnout risk in 2026/27. Tap a player for their story and actual World Cup matches.
      </p>

      <div>
        {WC_FATIGUE.map((p, i) => {
          const nat = NATIONS[p.nation];
          const isOpen = open === i;
          return (
            <div key={p.surname}>
              <div className="np-row" style={{ cursor: 'pointer', marginBottom: isOpen ? 0 : 7 }} onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                <div className="crest" style={{ background: p.color, color: p.fg || '#fff', width: 34, height: 34, fontSize: 10.5 }}>{p.short}</div>
                <div className="np-info">
                  <div className="nm">{p.surname} <span style={{ color: 'var(--t3)', fontWeight: 600 }}>· {nat?.flag} {p.nation}</span></div>
                  <div style={{ marginTop: 3, fontFamily: 'var(--body)', fontSize: 11, lineHeight: 1.4, color: 'var(--t2)' }}>{p.note}</div>
                  <div className="heat" style={{ marginTop: 7 }}><div className="hf" style={{ width: `${p.load}%` }} /></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`risk ${p.risk}`}>{riskLabel(p.risk)}</span>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--t3)', marginTop: 4 }}>{p.pos} · {p.load}</div>
                </div>
              </div>

              {isOpen && (
                <div className="fat-detail">
                  <div className="fd-top">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="fd-photo" src={p.photo} alt={p.surname} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    <p className="fd-story">{p.story}</p>
                  </div>

                  {nat && (
                    <>
                      <div className="fat-mlabel">
                        {nat.flag} {nat.name} · World Cup 2026 · {p.mins.reduce((a, b) => a + b, 0)}′ played
                      </div>
                      <div className="fat-matches">
                        {nat.matches.map((m, mi) => {
                          const mins = p.mins[mi] ?? 0;
                          return (
                            <div className="fat-match" key={m.md}>
                              <span className="md">MD{m.md} · {m.date}</span>
                              <span className="sc">{nat.flag} {nat.short} {m.gf}–{m.ga} {m.oppFlag} {m.oppName}</span>
                              <span className={`fmin ${mins === 0 ? 'dnp' : mins >= 85 ? 'hi' : ''}`}>{mins === 0 ? 'DNP' : `${mins}′`}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <a
                    className="s-btn s-btn--red hex"
                    href={getKitbagUrlByShort(p.short)}
                    target="_blank"
                    rel="noopener sponsored"
                    onClick={() => toast(`Opening ${p.club} on Kitbag`)}
                    style={{ marginTop: 16, fontSize: 12, textDecoration: 'none' }}
                  >
                    Shop {p.short} kit
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', marginTop: 14 }}>
        WC matches &amp; minutes are actual results · load &amp; risk are editorial · kit links are affiliate
      </p>
    </>
  );
}

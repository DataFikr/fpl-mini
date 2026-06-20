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
        <div><div className="scr-title">WC FATIGUE</div><div className="scr-sub">World Cup 2026 · GW1 risk · Premier League</div></div>
        <span className="live"><span className="dot" />Live</span>
      </div>
      <p className="kit-intro">
        Projected tournament load for FPL-relevant Premier League stars at World Cup 2026 — the deeper the run, the bigger the GW1 burnout risk. Tap a player for their story and World Cup matches.
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
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', margin: '14px 0 8px' }}>
                        {nat.flag} {nat.name} · World Cup group stage
                      </div>
                      <div className="fat-matches">
                        {nat.matches.map((m) => (
                          <div className="fat-match" key={m.md}>
                            <span className="md">MD{m.md}</span>
                            <span className="fl">{nat.flag}</span>
                            <span className="sc">{p.nation} {m.gf}–{m.ga} {m.opp}</span>
                          </div>
                        ))}
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
        Projected load · editorial model · kit links are affiliate
      </p>
    </>
  );
}

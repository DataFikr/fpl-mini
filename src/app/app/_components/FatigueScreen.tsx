'use client';

import { useState } from 'react';
import { WC_FATIGUE, NATIONS } from '../_lib/fatigue-data';
import { getKitbagUrlByShort } from '@/utils/kitbag-urls';
import { AffiliateLink } from '@/components/ui/affiliate-link';
import { toast } from './Toast';

const riskLabel = (r: string) => (r === 'hi' ? 'High' : r === 'md' ? 'Med' : 'Low');

/**
 * `embedded` drops the screen header and intro — inside a blog article the post
 * already supplies its own title and lead, so repeating them reads as a bug.
 */
export function FatigueScreen({ embedded = false }: { embedded?: boolean } = {}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      {!embedded && (
        <>
          <div className="scr-head">
            <div><div className="scr-title">WC FATIGUE</div><div className="scr-sub">World Cup 2026 · final minutes · GW1 risk</div></div>
            <span className="live"><span className="dot" />Full-time</span>
          </div>
          <p className="kit-intro">
            The 2026 World Cup is done — Spain beat Argentina in the final. Here are the real minutes FPL-relevant Premier League stars racked up, and the GW1 2026/27 burnout risk that follows. Tap a player for their tournament and every match.
          </p>
        </>
      )}

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
                    <p className="fd-story">{p.story}</p>
                  </div>

                  {nat && (
                    <>
                      <div className="fat-mlabel">
                        {nat.flag} {nat.name} · {nat.result} · {p.mins.reduce((a, b) => a + b, 0)}′ played
                      </div>
                      <div className="fat-matches">
                        {nat.matches.map((m, mi) => {
                          const mins = p.mins[mi] ?? 0;
                          return (
                            <div className="fat-match" key={m.md}>
                              <span className="md">{m.round ?? `MD${m.md}`} · {m.date}</span>
                              <span className="sc">{nat.flag} {nat.short} {m.gf}–{m.ga} {m.oppFlag} {m.oppName}</span>
                              <span className={`fmin ${mins === 0 ? 'dnp' : mins >= 85 ? 'hi' : ''}`}>{mins === 0 ? 'DNP' : `${mins}′`}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <AffiliateLink
                    className="s-btn s-btn--red hex"
                    href={getKitbagUrlByShort(p.short)}
                    placement="fatigue-card"
                    item={p.short}
                    onClick={() => toast(`Opening ${p.club} on Kitbag`)}
                    style={{ marginTop: 16, fontSize: 12, textDecoration: 'none' }}
                  >
                    Shop {p.short} kit
                  </AffiliateLink>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', marginTop: 14 }}>
        WC match results are actual · per-match minutes are best-effort estimates · load &amp; risk are editorial · kit links are affiliate
      </p>
    </>
  );
}

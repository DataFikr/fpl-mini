'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { AffiliateLink } from '@/components/ui/affiliate-link';
import { getKitbagUrlByShort } from '@/utils/kitbag-urls';
import { WC_FATIGUE, NATIONS } from '@/app/app/_lib/fatigue-data';

const riskLabel = (r: string) => (r === 'hi' ? 'High' : r === 'md' ? 'Med' : 'Low');

export default function WorldCupFatiguePage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        <div className="container mx-auto px-4 lg:px-8 py-10 max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-fpl-text-secondary/70 font-inter mb-4">
            <Link href="/" className="hover:text-fpl-accent">Home</Link>
            <span className="mx-1.5">›</span>
            <Link href="/blog" className="hover:text-fpl-accent">Blog</Link>
            <span className="mx-1.5">›</span>
            <span className="text-fpl-text-secondary">World Cup Fatigue Watch</span>
          </nav>

          <header className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-fpl-accent/15 text-fpl-accent text-[10px] font-jakarta font-extrabold uppercase tracking-wider">Analysis</span>
              <time dateTime="2026-06-02" className="text-xs text-fpl-text-secondary/70 font-inter">2 June 2026 · Updated 27 July 2026</time>
            </div>
            <h1 className="text-3xl md:text-4xl font-jakarta font-bold text-white leading-tight">
              World Cup Fatigue Watch: which FPL stars came back with the heaviest legs
            </h1>
            <p className="text-lg text-fpl-text-secondary font-inter leading-relaxed mt-4">
              The 2026 World Cup is over — Spain beat Argentina in the final, England reached the semis and Norway stunned Brazil on the way to the quarters. Below is the live-tracker view: each FPL-relevant Premier League star&rsquo;s actual tournament, total minutes, and the Gameweek&nbsp;1 burnout risk that follows. Tap a player to see every match.
            </p>
          </header>

          {/* App-fatigue-themed tracker */}
          <div className="wcf">
            <div className="scr-head">
              <div><div className="scr-title">WC FATIGUE</div><div className="scr-sub">World Cup 2026 · final minutes · GW1 risk</div></div>
              <span className="live"><span className="dot" />Full-time</span>
            </div>
            <p className="kit-intro">
              Spain lifted the trophy; the Premier League contingent is home. The more they played, the bigger the GW1 2026/27 burnout risk. Tap a player for their tournament and every match.
            </p>

            <div>
              {WC_FATIGUE.map((p, i) => {
                const nat = NATIONS[p.nation];
                const isOpen = open === i;
                const total = p.mins.reduce((a, b) => a + b, 0);
                return (
                  <div key={p.surname}>
                    <div className="np-row" style={{ cursor: 'pointer', marginBottom: isOpen ? 0 : 7 }} onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                      <div className="crest" style={{ background: p.color, color: p.fg || '#fff' }}>{p.short}</div>
                      <div className="np-info">
                        <div className="nm">{p.surname} <span style={{ color: 'var(--t3)', fontWeight: 600 }}>· {nat?.flag} {p.nation}</span></div>
                        <div style={{ marginTop: 3, fontFamily: 'var(--body)', fontSize: 11, lineHeight: 1.4, color: 'var(--t2)' }}>{p.note}</div>
                        <div className="heat" style={{ marginTop: 7 }}><div className="hf" style={{ width: `${p.load}%` }} /></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`risk ${p.risk}`}>{riskLabel(p.risk)}</span>
                        <div className="mono" style={{ fontSize: 9, color: 'var(--t3)', marginTop: 4 }}>{p.pos} · {total}′</div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="fat-detail">
                        <div className="fd-top"><p className="fd-story">{p.story}</p></div>

                        {nat && (
                          <>
                            <div className="fat-mlabel">{nat.flag} {nat.name} · {nat.result} · {total}′ played</div>
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
                          className="wcf-kit"
                          href={getKitbagUrlByShort(p.short)}
                          placement="blog-wc-fatigue"
                          item={p.short}
                        >
                          Shop {p.short} kit
                        </AffiliateLink>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="wcf-foot">
              WC match results are actual · per-match minutes are best-effort estimates · load &amp; risk are editorial · kit links are affiliate
            </p>
          </div>

          {/* Keep reading */}
          <div className="mt-10 pt-6 border-t border-fpl-primary/15">
            <div className="text-xs font-jakarta font-semibold text-fpl-text-secondary uppercase tracking-wider mb-3">Keep reading</div>
            <div className="flex flex-wrap gap-3 text-sm font-jakarta font-semibold">
              <Link href="/blog/gw1-template-without-world-cup-players" className="text-fpl-accent hover:underline">GW1 template &amp; fatigue guide →</Link>
              <Link href="/blog/fpl-gw1-team-reveals-2026-27" className="text-fpl-accent hover:underline">GW1 team reveals →</Link>
              <Link href="/app" className="text-fpl-accent hover:underline">Rank my team →</Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

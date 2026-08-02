'use client';

import { useEffect, useState } from 'react';
import { AffiliateLink } from '@/components/ui/affiliate-link';
import { toast } from './Toast';

/**
 * Kitbag 26/27 Kit Drop — affiliate screen (design: Kitbag Affiliate HTML).
 * Uses OFFICIAL Kitbag creatives (Impact display-ad, licensed for affiliates)
 * and the per-product deeplinks. No FPL-CDN kit images (copyright-clean).
 */

interface Kit {
  area: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j';
  club: string;
  item: string;   // affiliate item tag
  heading: string;
  tag?: string;   // "New" / "Full kit"
  pid: string;    // Kitbag/Impact product id
}

// Deeplink + creative both key off the product id:
//   deeplink  https://kitbag.evyy.net/c/7163127/<pid>/11316
//   creative  https://a.impactradius-go.com/display-ad/11316-<pid>
const KITS: Kit[] = [
  { area: 'a', club: 'Arsenal', item: 'ARS', heading: '26/27 Home Shirt', tag: 'New', pid: '3903207' },
  { area: 'b', club: 'Liverpool', item: 'LIV', heading: '26/27 Home Shirt', tag: 'New', pid: '3903226' },
  { area: 'c', club: 'Man City', item: 'MCI', heading: '26/27 Home Kit', pid: '3904780' },
  { area: 'd', club: 'Man United', item: 'MUN', heading: 'Home Shirt', pid: '3898196' },
  { area: 'e', club: 'Man United', item: 'MUN', heading: '26/27 Away Shirt', tag: 'New', pid: '3981927' },
  { area: 'f', club: 'Arsenal', item: 'ARS', heading: '26/27 Away', tag: 'New', pid: '3984656' },
  { area: 'g', club: 'Aston Villa', item: 'AVL', heading: 'Villa Kit', pid: '3914239' },
  { area: 'i', club: 'Man City', item: 'MCI', heading: '26/27 Away Shirt', tag: 'New', pid: '3993114' },
  { area: 'j', club: 'Man City', item: 'MCI', heading: '26/27 Away Kit', tag: 'New', pid: '3993112' },
  { area: 'h', club: 'Man United', item: 'MUN', heading: 'The full away kit — shirt, shorts, socks', tag: 'Full kit', pid: '3981919' },
];

const deeplink = (pid: string) => `https://kitbag.evyy.net/c/7163127/${pid}/11316`;
const creative = (pid: string) => `https://a.impactradius-go.com/display-ad/11316-${pid}`;
const HERO_LINK = deeplink('3903207');

export function KitDropScreen() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const kickoff = new Date('2026-08-15T11:30:00Z').getTime();
    setDays(Math.max(0, Math.ceil((kickoff - Date.now()) / 86_400_000)));
  }, []);

  return (
    <div className="kd">
      {/* Hero */}
      <section className="kd-hero">
        <span className="slab" />
        <div className="kd-wrap">
          <span className="drop-tag"><span className="dot" />26/27 Season Drop · Live Now</span>
          <h1>NEW SEASON.<em>NEW KIT.</em><span className="thin">Same obsession.</span></h1>
          <p className="lede">The 2026/27 Premier League shirts have landed at Kitbag — official kits, full size runs, shipped worldwide. Picked out for managers who take their squad seriously.</p>
          <div className="kd-actions">
            <a className="kbtn kbtn--red" href="#drops">See the drop</a>
            <AffiliateLink className="kbtn kbtn--ghost" href={HERO_LINK} placement="kit-drop-hero" item="ARS" onClick={() => toast('Opening Kitbag')}>Shop at Kitbag →</AffiliateLink>
          </div>
          <div className="kd-meta">
            <div className="hm"><span className="v">{days ?? '—'}</span><span className="l">Days to kick-off</span></div>
            <div className="hm"><span className="v">10<span className="u">kits</span></span><span className="l">In this drop</span></div>
            <div className="hm"><span className="v">100<span className="u">%</span></span><span className="l">Official licensed</span></div>
          </div>
        </div>
      </section>

      {/* Bento kit grid */}
      <section className="kd-drops" id="drops">
        <div className="kd-wrap">
          <div className="shead">
            <span className="kicker">The 26/27 line-up</span>
            <h2>TEN KITS. ONE DROP.</h2>
            <p>Every shirt links straight through to Kitbag&rsquo;s official product page — sizes, kids&rsquo; fits and printing options included.</p>
          </div>
          <div className="grid-kits">
            {KITS.map((k) => (
              <figure className={`kit ${k.area}`} key={k.pid}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="kit-img"
                  src={creative(k.pid)}
                  alt={`${k.club} ${k.heading} — official kit at Kitbag`}
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="veil" />
                <span className="club">{k.club}</span>
                {k.tag && <span className="new">{k.tag}</span>}
                <div className="foot">
                  <h3>{k.heading}</h3>
                  <AffiliateLink
                    className="go"
                    href={deeplink(k.pid)}
                    placement="kit-drop-grid"
                    item={k.item}
                    aria-label={`Shop the ${k.club} ${k.heading} at Kitbag`}
                    onClick={() => toast(`Opening ${k.club} on Kitbag`)}
                  >
                    Shop →
                  </AffiliateLink>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="why" id="how">
        <div className="kd-wrap">
          <span className="kicker">FPL Ranker × Kitbag</span>
          <h2>WE RANK YOUR SQUAD. KITBAG KITS IT OUT.</h2>
          <p className="lede">Kitbag is the official kit partner we send our managers to. You get the real shirt; we get a small cut that keeps FPL Ranker free.</p>
          <div className="steps">
            <div className="step"><div className="n">01</div><h3>PICK YOUR KIT</h3><p>Tap any shirt in the drop and land on the official Kitbag product page with live sizing and stock.</p></div>
            <div className="step"><div className="n">02</div><h3>BUY DIRECT</h3><p>Checkout, delivery and returns are handled entirely by Kitbag — the same price you&rsquo;d pay going direct.</p></div>
            <div className="step"><div className="n">03</div><h3>WE STAY FREE</h3><p>Kitbag pays us a commission on the sale. That funds the rank tracking, headlines and predictions you use every gameweek.</p></div>
          </div>
          <div className="why-note"><span className="ic">i</span><span>Every link on this page is an affiliate link. Prices and availability are set by Kitbag — we never mark anything up.</span></div>
        </div>
      </section>

      {/* Proof band */}
      <section className="proof">
        <div className="kd-wrap">
          <div className="row">
            <div className="pf"><div className="v">10</div><div className="l">26/27 kits in this drop</div></div>
            <div className="pf"><div className="v">5</div><div className="l">Premier League clubs covered</div></div>
            <div className="pf"><div className="v">100%</div><div className="l">Officially licensed</div></div>
            <div className="pf"><div className="v">£0</div><div className="l">Extra cost to you</div></div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="close">
        <span className="slab" />
        <div className="kd-wrap">
          <span className="kicker">Kick-off is close</span>
          <h2>GET THE KIT <em>BEFORE GW1.</em></h2>
          <p>Home and away shirts sell through their size runs fast once the season starts. Pick yours now and have it on your back for Gameweek 1.</p>
          <div className="row">
            <AffiliateLink className="kbtn kbtn--red" href={HERO_LINK} placement="kit-drop-close" item="ARS" onClick={() => toast('Opening Kitbag')}>Shop the 26/27 drop</AffiliateLink>
            <a className="kbtn kbtn--ghost" href="#drops">Back to the kits</a>
          </div>
        </div>
      </section>

      {/* Disclosure */}
      <footer className="kd-foot">
        <div className="kd-wrap">
          <p className="disc"><b>Affiliate disclosure.</b> FPL Ranker is a participant in the Kitbag affiliate programme. We earn a commission on qualifying purchases made through the links on this page, at no extra cost to you. FPL Ranker is not affiliated with the Premier League or any club shown.</p>
        </div>
      </footer>
    </div>
  );
}

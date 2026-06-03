'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import Image from 'next/image';
import Link from 'next/link';
import { getKitbagUrl } from '@/utils/kitbag-urls';
import { ArrowRight, ExternalLink } from 'lucide-react';

// ─── Player Data ─────────────────────────────────────────────

interface Player {
  id: string;
  name: string;
  first: string;
  club: string;
  color: string;
  nation: string;
  pos: string;
  risk: 'High' | 'Medium';
  teamId: number;
  photo: string | null;
  p1: string;
  p2: string;
}

const players: Player[] = [
  { id: 'haaland', name: 'Erling Haaland', first: 'Haaland', club: 'Manchester City', color: '#6CABDD', nation: 'Norway', pos: 'FWD', risk: 'High', teamId: 13, photo: '/images/blog/players/haaland.jpg',
    p1: 'Norway are at a World Cup for the first time since 1998, and they are not there to make up the numbers — Haaland and Odegaard give them genuine knockout ambition. Expect Haaland to play every minute he is fit for as the focal point of the attack.',
    p2: 'That is exactly the problem for early FPL. A premium striker carrying a deep tournament run into a four-week turnaround is the classic slow-starter profile. Pep has history resting returning internationals — back Haaland long-term, but think twice about the GW1 armband.' },
  { id: 'saka', name: 'Bukayo Saka', first: 'Saka', club: 'Arsenal', color: '#EF0107', nation: 'England', pos: 'MID', risk: 'High', teamId: 1, photo: '/images/blog/players/saka.webp',
    p1: "England will fancy a deep run, and Saka is now the first name on the team sheet. He has also carried niggling muscle issues in recent seasons — a heavy summer load is the last thing his hamstrings want.",
    p2: "Arteta protects Saka in pre-season at the best of times. A semi-final or final means he likely returns late, eased in off the bench through August. Elite asset, but his price may be a GW1 trap." },
  { id: 'rice', name: 'Declan Rice', first: 'Rice', club: 'Arsenal', color: '#EF0107', nation: 'England', pos: 'MID', risk: 'Medium', teamId: 1, photo: '/images/blog/players/rice.jpg',
    p1: "Rice is England's engine and almost undroppable — minutes will pile up. The flip side is that his game is built on a freakish physical base that tends to shrug off heavy schedules better than most.",
    p2: "His set-piece threat keeps him FPL-relevant even at 80%. Lower ceiling than the forwards means less captaincy temptation, so the fatigue risk hurts your team less. Monitor, don't panic." },
  { id: 'odegaard', name: 'Martin Odegaard', first: 'Odegaard', club: 'Arsenal', color: '#EF0107', nation: 'Norway', pos: 'MID', risk: 'High', teamId: 1, photo: '/images/blog/players/odegaard.jpg',
    p1: "Norway's captain and creative heartbeat alongside Haaland. If Norway go deep, Odegaard plays the full 90 every round — and he is coming off a season already disrupted by ankle trouble.",
    p2: "A short turnaround for a player whose value is built on rhythm and chance creation is a red flag. His underlying numbers are elite when fresh; the question is simply when \"fresh\" actually arrives this season." },
  { id: 'watkins', name: 'Ollie Watkins', first: 'Watkins', club: 'Aston Villa', color: '#670E36', nation: 'England', pos: 'FWD', risk: 'Medium', teamId: 2, photo: '/images/blog/players/watkins.jpg',
    p1: "Watkins is in England's squad but, realistically, as an impact sub behind the first-choice striker. That rotation is a gift for FPL — tournament involvement without the full 90-minute grind.",
    p2: "A player who banks rest on the bench in June could be the freshest premium forward in the league come GW1. At a friendlier price than the headline names, Watkins is a sharp differential pick." },
  { id: 'bruno', name: 'Bruno Fernandes', first: 'Bruno', club: 'Manchester United', color: '#DA291C', nation: 'Portugal', pos: 'MID', risk: 'High', teamId: 14, photo: '/images/blog/players/bruno.jpg',
    p1: "Portugal are perennial contenders and Bruno never comes off — he is the most reliable 90-minute man in this entire list, club or country. A deep run means maximum minutes in the heat.",
    p2: "The saving grace: Bruno thrives on volume and rarely looks physically spent. But penalties and set pieces only carry you so far if United ease him in. A monitor that leans high." },
  { id: 'gakpo', name: 'Cody Gakpo', first: 'Gakpo', club: 'Liverpool', color: '#C8102E', nation: 'Netherlands', pos: 'MID', risk: 'Medium', teamId: 12, photo: '/images/blog/players/gakpo.jpg',
    p1: "Gakpo is a Netherlands regular but operates in a rotation-heavy front line — minutes are not guaranteed across every knockout tie. That uncertainty actually softens his fatigue exposure.",
    p2: "For FPL, the read is about Liverpool's congested attack as much as the World Cup. If he returns fresh and nails down a starting role, the early-season points are there at a tidy price." },
  { id: 'vandijk', name: 'Virgil van Dijk', first: 'Van Dijk', club: 'Liverpool', color: '#C8102E', nation: 'Netherlands', pos: 'DEF', risk: 'High', teamId: 12, photo: '/images/blog/players/vandijk.jfif',
    p1: "The Netherlands captain plays every minute and marshals the whole defence — no rest, maximum responsibility, and now into his thirties. A deep run is a serious physical ask.",
    p2: "As a premium defender his appeal is clean sheets plus the odd header. Fatigue rarely shows up as a missed game for Van Dijk, but it can dent the attacking threat that justifies his price tag." },
  { id: 'wirtz', name: 'Florian Wirtz', first: 'Wirtz', club: 'Liverpool', color: '#C8102E', nation: 'Germany', pos: 'MID', risk: 'High', teamId: 12, photo: '/images/blog/players/wirtz.jpg',
    p1: "Germany will expect to go far, and Wirtz is central to everything they do. In his first full season adapting to the Premier League, a draining summer is the worst possible preparation.",
    p2: "New league, new intensity, no real pre-season — a lot is stacked against an explosive GW1. The talent is undeniable; patience may be rewarded with a lower entry price once the slow start scares owners off." },
];

const riskStyles = {
  High: { chip: 'bg-rose-500/15 text-rose-300 border border-rose-500/40', dot: 'bg-rose-400' },
  Medium: { chip: 'bg-amber-400/15 text-amber-200 border border-amber-400/40', dot: 'bg-amber-300' },
};

// ─── Kitbag Ad Assets per Team ──────────────────────────────

const kitbagAds: Record<number, { href: string; imgSrc: string; w: number; h: number }> = {
  1:  { href: 'https://kitbag.evyy.net/c/7163127/3903207/11316', imgSrc: '//a.impactradius-go.com/display-ad/11316-3903207', w: 394, h: 206 },   // Arsenal
  2:  { href: 'https://kitbag.evyy.net/c/7163127/3914242/11316', imgSrc: '//a.impactradius-go.com/display-ad/11316-3914242', w: 413, h: 232 },   // Aston Villa
  12: { href: 'https://kitbag.evyy.net/c/7163127/3903226/11316', imgSrc: '//a.impactradius-go.com/display-ad/11316-3903226', w: 424, h: 222 },   // Liverpool
  13: { href: 'https://kitbag.evyy.net/c/7163127/3904780/11316', imgSrc: '//a.impactradius-go.com/display-ad/11316-3904780', w: 300, h: 250 },   // Manchester City
  14: { href: 'https://kitbag.evyy.net/c/7163127/3898196/11316', imgSrc: '//a.impactradius-go.com/display-ad/11316-3898196', w: 398, h: 208 },   // Manchester United
};

// ─── Flag SVGs ───────────────────────────────────────────────

function Flag({ nation }: { nation: string }) {
  const flags: Record<string, React.ReactNode> = {
    Norway: (
      <svg viewBox="0 0 22 16" className="w-full h-full"><rect width="22" height="16" fill="#BA0C2F"/><rect x="6" width="4" height="16" fill="#fff"/><rect y="6" width="22" height="4" fill="#fff"/><rect x="7" width="2" height="16" fill="#00205B"/><rect y="7" width="22" height="2" fill="#00205B"/></svg>
    ),
    England: (
      <svg viewBox="0 0 22 16" className="w-full h-full"><rect width="22" height="16" fill="#fff"/><rect x="9" width="4" height="16" fill="#CE1124"/><rect y="6" width="22" height="4" fill="#CE1124"/></svg>
    ),
    Portugal: (
      <svg viewBox="0 0 22 16" className="w-full h-full"><rect width="22" height="16" fill="#DA291C"/><rect width="9" height="16" fill="#046A38"/><circle cx="9" cy="8" r="2.6" fill="#FFE03A"/></svg>
    ),
    Netherlands: (
      <svg viewBox="0 0 22 16" className="w-full h-full"><rect width="22" height="16" fill="#fff"/><rect width="22" height="5.33" fill="#AE1C28"/><rect y="10.67" width="22" height="5.33" fill="#21468B"/></svg>
    ),
    Germany: (
      <svg viewBox="0 0 22 16" className="w-full h-full"><rect width="22" height="5.33" fill="#000"/><rect y="5.33" width="22" height="5.33" fill="#DD0000"/><rect y="10.67" width="22" height="5.33" fill="#FFCE00"/></svg>
    ),
  };
  return <>{flags[nation] || null}</>;
}

// ─── Club Badge ──────────────────────────────────────────────

function ClubBadge({ club, color, size = 40 }: { club: string; color: string; size?: number }) {
  const initials = club.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  return (
    <div
      style={{ width: size, height: size, background: color }}
      className="rounded-full flex items-center justify-center shadow-fpl ring-2 ring-white/15"
    >
      <span style={{ fontSize: size * 0.32 }} className="font-jakarta font-extrabold text-white tracking-tight">
        {initials}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function WorldCupFatiguePage() {
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const playerRefs = useRef<Record<string, HTMLElement | null>>({});

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      setProgress(Math.min(scrolled * 100, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-spy for TOC
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActivePlayer(e.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    players.forEach((pl) => {
      const el = playerRefs.current[pl.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const highRisk = players.filter(p => p.risk === 'High');
  const medRisk = players.filter(p => p.risk === 'Medium');

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-transparent">
        <div
          className="h-full transition-[width] duration-100"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B5CF6, #78FF9E)' }}
        />
      </div>

      <Header />
      <div className="min-h-screen pt-20" style={{
        background: 'radial-gradient(900px 480px at 12% -4%, rgba(109,40,217,0.20), transparent 60%), radial-gradient(820px 520px at 92% 6%, rgba(120,255,158,0.06), transparent 55%), linear-gradient(160deg, #0C0C0C 0%, #120a26 48%, #0C0C0C 100%)',
      }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
          <ol className="flex items-center gap-2 text-xs font-inter text-fpl-text-secondary">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li className="text-fpl-accent">World Cup Fatigue Watch</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 pb-12">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-700/20 border border-violet-500/30 text-violet-400 text-xs font-jakarta font-semibold uppercase tracking-wider">
                Season Preview
              </span>
              <span className="text-xs text-fpl-text-secondary font-inter">June 2, 2026 · 9 min read</span>
            </div>
            <h1 className="font-jakarta font-extrabold text-white leading-[1.06] text-4xl md:text-5xl lg:text-[3.4rem] mb-6">
              If these Premier League stars go deep at the{' '}
              <span className="text-gradient-primary">2026 World Cup</span>, could fatigue wreck their early FPL season?
            </h1>
            <p className="text-lg md:text-xl text-fpl-text-secondary font-inter leading-relaxed max-w-3xl">
              A summer tournament across the USA, Canada and Mexico means heat, travel and a brutally short pre-season.
              Here&apos;s which big FPL names carry the most burnout risk into Gameweek 1 — and how to play it in your mini-league.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a href="#players" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-fpl-primary to-violet-700 text-white font-jakarta font-semibold rounded-fpl hover:shadow-fpl transition-all">
                Track World Cup fatigue
                <ArrowRight className="w-[18px] h-[18px]" />
              </a>
              <a href="#wrap-up" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/5 border border-fpl-accent/30 text-fpl-accent font-jakarta font-semibold rounded-fpl hover:bg-fpl-accent/10 transition-all">
                See season wrap-up
              </a>
            </div>
          </div>
        </section>

        {/* Main + Sidebar */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">

            {/* MAIN COLUMN */}
            <main className="min-w-0">
              {/* Mobile TOC */}
              <div className="lg:hidden backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-5 mb-8">
                <div className="text-xs font-jakarta font-bold uppercase tracking-wider text-fpl-accent mb-3">Jump to a player</div>
                <div className="flex flex-wrap gap-2">
                  {players.map((pl) => (
                    <a key={pl.id} href={`#${pl.id}`} className="px-3 py-1.5 rounded-full text-xs font-jakarta font-semibold text-fpl-text-secondary bg-white/5 border border-white/10 hover:text-white hover:border-fpl-accent/40 transition-colors">
                      {pl.first}
                    </a>
                  ))}
                </div>
              </div>

              {/* Intro */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-7 md:p-8 mb-8">
                <p className="text-lg text-fpl-text-secondary font-inter leading-relaxed">
                  The 2026/27 FPL season kicks off barely four weeks after the World Cup final. For the managers who reach the latter stages, that means a holiday cut short, a compressed pre-season, and legs that have already played a full club campaign{' '}
                  <span className="text-white font-semibold">plus</span> seven knockout matches in North American heat.
                </p>
                <p className="text-lg text-fpl-text-secondary font-inter leading-relaxed mt-4">
                  In a mini-league, getting your early-season captaincy right is worth more than any wildcard. Below we rank nine premium assets by their fatigue risk — who to back from GW1, who to fade, and who to monitor in the friendlies.
                </p>
              </div>

              {/* Player Modules */}
              <div id="players" className="space-y-8">
                {players.map((pl, i) => {
                  const r = riskStyles[pl.risk];
                  const kitbagUrl = getKitbagUrl(pl.teamId);

                  return (
                    <article
                      key={pl.id}
                      id={pl.id}
                      ref={(el) => { playerRefs.current[pl.id] = el; }}
                      className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-6 md:p-8 scroll-mt-24"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-jakarta font-extrabold text-violet-400/40 text-3xl md:text-4xl leading-none tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <h2 className="font-jakarta font-bold text-white text-xl md:text-2xl truncate">{pl.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                              <ClubBadge club={pl.club} color={pl.color} size={18} />
                              <span className="text-sm text-fpl-text-secondary font-inter truncate">{pl.club}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${r.chip} text-xs font-jakarta font-bold uppercase tracking-wide`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} />
                          {pl.risk} risk
                        </span>
                      </div>

                      {/* Content Grid */}
                      <div className="grid sm:grid-cols-[180px_minmax(0,1fr)] gap-6">
                        {/* Player Card */}
                        <div>
                          <div className="relative rounded-fpl aspect-[3/4] overflow-hidden ring-1 ring-fpl-primary/40" style={{
                            backgroundColor: '#15102b',
                            backgroundImage: 'repeating-linear-gradient(135deg, rgba(139,92,246,0.10) 0 12px, rgba(139,92,246,0) 12px 24px)',
                          }}>
                            {pl.photo && (
                              <Image
                                src={pl.photo}
                                alt={pl.name}
                                fill
                                className="object-cover object-top"
                                sizes="180px"
                              />
                            )}
                            <div className="absolute top-3 left-3 z-10"><ClubBadge club={pl.club} color={pl.color} size={40} /></div>
                            <div className="absolute top-3 right-3 z-10 w-9 h-[26px] rounded-[3px] overflow-hidden ring-1 ring-white/25 shadow-fpl" title={pl.nation}>
                              <Flag nation={pl.nation} />
                            </div>
                            <div className="absolute bottom-0 inset-x-0 z-10" style={{ background: 'linear-gradient(180deg, rgba(12,12,12,0) 35%, rgba(12,12,12,0.85) 100%)' }}>
                              <div className="px-3 py-2.5 flex items-center gap-2">
                                <span className="text-[10px] font-jakarta font-bold text-white/90 px-2 py-0.5 rounded bg-white/10 border border-white/15 uppercase tracking-wide">{pl.pos}</span>
                                <span className="text-[11px] font-inter text-white/80">{pl.club}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Copy */}
                        <div>
                          <p className="text-[15px] md:text-base text-fpl-text-secondary font-inter leading-relaxed">{pl.p1}</p>
                          <p className="text-[15px] md:text-base text-fpl-text-secondary font-inter leading-relaxed mt-3">{pl.p2}</p>
                          <Link href="/" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-gradient-to-r from-fpl-primary to-violet-700 text-white font-jakarta text-sm font-semibold rounded-fpl hover:shadow-fpl transition-all">
                            Track {pl.first} in FPLRanker
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Kitbag Affiliate Card */}
                      {(() => {
                        const ad = kitbagAds[pl.teamId];
                        const href = ad?.href || kitbagUrl;
                        return (
                          <a
                            href={href}
                            rel="sponsored noopener"
                            target="_blank"
                            className="group/kit mt-6 rounded-fpl border border-fpl-accent/20 bg-fpl-dark/40 p-4 flex items-center gap-4 hover:border-fpl-accent/45 hover:bg-fpl-dark/60 transition-all"
                          >
                            <div className="rounded-lg shrink-0 overflow-hidden border border-fpl-accent/25">
                              {ad ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={`https:${ad.imgSrc}`} alt={`${pl.club} kit`} width={80} height={Math.round(80 * ad.h / ad.w)} className="object-contain" />
                              ) : (
                                <div className="w-16 h-16 flex items-center justify-center" style={{
                                  backgroundColor: '#15102b',
                                  backgroundImage: 'repeating-linear-gradient(135deg, rgba(139,92,246,0.10) 0 12px, rgba(139,92,246,0) 12px 24px)',
                                }}>
                                  <span className="text-[8px] uppercase text-fpl-accent/70 text-center leading-tight font-inter tracking-wider">shirt<br/>img</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-jakarta font-bold uppercase tracking-wider text-fpl-accent/80 mb-0.5">Kitbag · Ad</div>
                              <p className="text-sm font-jakarta font-semibold text-white truncate">Back the new season — shop the latest {pl.club} kit</p>
                            </div>
                            <span className="shrink-0 px-4 py-2 bg-fpl-accent/10 border border-fpl-accent/30 text-fpl-accent font-jakarta text-sm font-bold rounded-fpl group-hover/kit:bg-fpl-accent/20 transition-all whitespace-nowrap inline-flex items-center gap-1.5">
                              Shop kit
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          </a>
                        );
                      })()}
                      {/* Impact tracking pixel */}
                      {kitbagAds[pl.teamId] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img height="0" width="0" src={`https://imp.pxf.io/i/7163127/${kitbagAds[pl.teamId].href.split('/').slice(-2).join('/')}`} style={{ position: 'absolute', visibility: 'hidden' }} alt="" />
                      )}
                    </article>
                  );
                })}
              </div>

              {/* Wrap-up Section */}
              <section id="wrap-up" className="mt-8">
                <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-violet-500/30 p-7 md:p-9">
                  <h2 className="font-jakarta font-bold text-white text-2xl md:text-3xl mb-6">The fatigue verdict before GW1</h2>
                  <div className="grid sm:grid-cols-2 gap-4 mb-7">
                    <div className="rounded-fpl p-5 bg-rose-500/10 border border-rose-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                        <span className="font-jakarta font-bold text-rose-300 uppercase text-sm tracking-wide">High risk — fade early</span>
                      </div>
                      <ul className="space-y-1.5 text-sm text-fpl-text-secondary font-inter">
                        {highRisk.map(pl => (
                          <li key={pl.id}><span className="text-white font-semibold">{pl.name}</span> · {pl.club}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-fpl p-5 bg-amber-400/10 border border-amber-400/30">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                        <span className="font-jakarta font-bold text-amber-200 uppercase text-sm tracking-wide">Medium risk — monitor</span>
                      </div>
                      <ul className="space-y-1.5 text-sm text-fpl-text-secondary font-inter">
                        {medRisk.map(pl => (
                          <li key={pl.id}><span className="text-white font-semibold">{pl.name}</span> · {pl.club}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-fpl-text-secondary font-inter leading-relaxed mb-7">
                    <span className="text-white font-semibold">What to watch:</span> pre-season friendly minutes, whether managers hand deep-run players an extra week off, and any pre-tournament injuries that paradoxically leave a star{' '}
                    <span className="text-fpl-accent">fresher</span> than his rivals for GW1.
                  </p>
                  <div className="rounded-fpl p-6 md:p-7 bg-gradient-to-r from-fpl-primary/40 to-violet-700/30 border border-fpl-primary/40 text-center">
                    <h3 className="font-jakarta font-bold text-white text-xl md:text-2xl mb-3">See how World Cup fatigue could change your mini-league season</h3>
                    <p className="text-fpl-text-secondary font-inter mb-5 max-w-xl mx-auto">Build your watchlist, track minutes load and get a gameweek-by-gameweek edge over your rivals.</p>
                    <Link href="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-fpl-accent to-emerald-500 text-fpl-dark font-jakarta font-bold rounded-fpl hover:shadow-fpl transition-all">
                      Start your free trial
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </Link>
                  </div>
                </div>
              </section>
            </main>

            {/* SIDEBAR */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-5">
                {/* TOC */}
                <nav className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-4">
                  <div className="text-xs font-jakarta font-bold uppercase tracking-wider text-fpl-accent px-2 mb-2.5">On this page</div>
                  <ul className="space-y-0.5">
                    {players.map((pl) => {
                      const isActive = activePlayer === pl.id;
                      return (
                        <li key={pl.id}>
                          <a
                            href={`#${pl.id}`}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-r-md text-sm font-inter transition-all border-l-2 ${
                              isActive
                                ? 'border-l-fpl-accent text-white bg-violet-500/10'
                                : 'border-l-transparent text-fpl-text-secondary hover:text-white'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isActive ? 'bg-fpl-accent shadow-[0_0_8px_rgba(120,255,158,0.7)]' : 'bg-fpl-text-secondary/40'}`} />
                            {pl.first}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Sticky CTA */}
                <div className="rounded-fpl p-5 bg-gradient-to-br from-violet-800/50 to-fpl-primary/40 border border-violet-500/30">
                  <div className="text-fpl-accent font-jakarta text-xs font-bold uppercase tracking-wider mb-2">Season wrap-up</div>
                  <p className="text-white font-jakarta font-semibold leading-snug mb-4">Get the full pre-season fatigue report for every Premier League squad.</p>
                  <a href="#wrap-up" className="block text-center px-4 py-2.5 bg-fpl-accent text-fpl-dark font-jakarta font-bold text-sm rounded-fpl hover:shadow-fpl transition-all">See season wrap-up</a>
                </div>
              </div>
            </aside>

          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

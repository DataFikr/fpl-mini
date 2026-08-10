'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from './Toast';
import { DEMO_TEAM } from '../_lib/screen-data';
import { getLocalTeamId, persistTeamId } from '@/lib/use-account';
import { isFreeLaunchWindow } from '@/lib/premium';
import { GameweekCountdown, isBeforeGameweek1 } from './GameweekCountdown';

/**
 * Marketing landing (mockup 01-landing.html) — sticky header, 2-col hero with
 * the product teaser video, a features grid, a premium band (Free-until-GW5
 * during the launch hold) and a footer. Scoped to `.lp` (see landing.css).
 * The Team-ID form stays the #1 above-the-fold CTA.
 */
export function Landing() {
  const router = useRouter();
  const [teamId, setTeamId] = useState('');
  const [gw, setGw] = useState<number | null>(null);
  const [savedTeam, setSavedTeam] = useState<string | null>(null);
  // Resolved after mount so server and client agree on the first paint.
  const [preSeason, setPreSeason] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const free = isFreeLaunchWindow();

  useEffect(() => {
    setPreSeason(isBeforeGameweek1());

    fetch('/api/gameweek/current')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && (d.gameweek || d.currentGameweek)) setGw(d.gameweek || d.currentGameweek); })
      .catch(() => {});

    const local = getLocalTeamId();
    if (local) setSavedTeam(local);
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.authenticated && d.fplTeamId) setSavedTeam(String(d.fplTeamId)); })
      .catch(() => {});
  }, []);

  const analyze = (id: string) => {
    const v = id.trim();
    if (!/^\d{1,9}$/.test(v)) { toast('Team IDs are numbers only'); return; }
    if (v !== String(DEMO_TEAM)) persistTeamId(v);
    router.push(`/app/squad?teamId=${v}`);
  };

  // Click the teaser → restart with sound + go fullscreen (autoplays muted as ambient).
  const watchTeaser = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.currentTime = 0;
    el.play().catch(() => {});
    el.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="lp">
      <header className="site-head">
        <div className="wrap">
          <a className="logo" onClick={() => router.push('/app')} aria-label="FPL Ranker home"><span className="bolt" />FPL RANKER</a>
          <nav aria-label="Primary">
            <a onClick={() => router.push('/predictions')}>Predictions</a>
            <a onClick={() => router.push('/premium')}>Premium</a>
            <a onClick={() => router.push('/app/blog')}>Blog</a>
            <a onClick={() => router.push('/app/find-team-id')}>Find team ID</a>
          </nav>
          <div className="head-actions">
            <a className="s-btn s-btn--ghost" onClick={() => router.push('/auth/login')}>Sign in</a>
            <a className="s-btn s-btn--red hex" onClick={() => router.push('/premium')}>{free ? 'Get started free' : 'Go premium'}</a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div>
            {/* Pre-season, `gw` is the demo season's gameweek — claiming it is
                "Live" would contradict the GW1 countdown directly below. */}
            <span className="live-kicker"><span className="dot" />
              {preSeason || !gw ? '2026/27 season · GW1 Aug 21' : `Gameweek ${gw} · Live`}
            </span>
            <h1><span>Track your mini-league</span><em>like it&rsquo;s matchday</em></h1>
            <GameweekCountdown onTryDemo={() => analyze(String(DEMO_TEAM))} />
            <p className="sub">ESPN-style headlines, live rank movers and AI point predictions for your FPL mini-league. Enter your team ID and get your league&rsquo;s story in seconds — no signup.</p>
            <form className="league-form" onSubmit={(e) => { e.preventDefault(); analyze(teamId); }} noValidate>
              <label className="id-field" aria-label="FPL manager ID">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                <input type="text" inputMode="numeric" placeholder="Enter your FPL manager ID…" aria-label="FPL team ID"
                  autoComplete="off" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
                <button className="s-btn s-btn--red hex" type="submit">Rank my league</button>
              </label>
            </form>
            {savedTeam && (
              <p className="form-hint">Welcome back — <a onClick={() => analyze(savedTeam)}>resume team {savedTeam} &rarr;</a></p>
            )}
            <p className="form-hint">Not sure of your ID? <a onClick={() => router.push('/app/find-team-id')}>Find your team ID &rarr;</a> · try the demo <a onClick={() => analyze(String(DEMO_TEAM))}>{DEMO_TEAM}</a></p>
            <div className="trust">
              <b>Live FPL data</b>
              <b>AI predictions</b>
              <b>{free ? 'Free until GW5' : 'Core stays free'}</b>
            </div>
          </div>

          {/* Product teaser — photo-free app footage. Ambient muted loop; click to watch with sound. */}
          <div className="hero-art" role="button" tabIndex={0} aria-label="Play the FPL Ranker product teaser"
            onClick={watchTeaser} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); watchTeaser(); } }}>
            <video
              ref={videoRef}
              src="/video/FPL%20Teaser%20Video.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="FPL Ranker product teaser"
            />
            <span className="play-hex" aria-hidden="true" />
            <span className="live-pin"><span className="dot" />Watch the 45s teaser</span>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">What you get</span>
            <h2>Built for the group chat argument</h2>
          </div>
          <div className="feat-grid">
            <div className="feat-card">
              <span className="fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 21h8M12 17v4M6 3h12v6a6 6 0 0 1-12 0V3Z" /><path d="M18 5h3v2a4 4 0 0 1-4 4M6 5H3v2a4 4 0 0 0 4 4" /></svg></span>
              <h3>League HQ</h3>
              <p>Standings, podium, movers and a Manager of the Month race for every mini-league you&rsquo;re in.</p>
            </div>
            <div className="feat-card">
              <span className="fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m3 17 6-6 4 4 8-8" /><path d="M21 7v6h-6" /></svg></span>
              <h3>Rank movers</h3>
              <p>Who&rsquo;s climbing, who&rsquo;s sliding — headline-style recaps written for your league every gameweek.</p>
            </div>
            <div className="feat-card">
              <span className="fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /><circle cx="12" cy="12" r="5" /></svg></span>
              <h3>AI predictions</h3>
              <p>A self-learning model projects every player&rsquo;s points each week. Top scorers are free to everyone.</p>
            </div>
            <div className="feat-card">
              <span className="fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7" /></svg></span>
              <h3>Transfer impact</h3>
              <p>See whether the moves you made actually paid off — points in vs points out, every week.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="prem on-ink">
        <span className="red-slab" />
        <div className="wrap">
          <div>
            <span className="kicker">FPL Ranker Premium</span>
            {free ? (
              <>
                <h2>The AI edge is <em>free</em> until GW5</h2>
                <p>Pricing is on hold for launch. AI captain picks, transfer calls and the full points-prediction table are unlocked for every manager through Gameweek&nbsp;5 while we validate the live data and retune the model. No card needed.</p>
                <div className="prem-cta">
                  <a className="s-btn s-btn--red hex" onClick={() => router.push('/premium')}>See what&rsquo;s included</a>
                  <span className="prem-note">Pricing returns after GW5</span>
                </div>
              </>
            ) : (
              <>
                <h2>An AI edge for <em>&pound;15</em>, all season</h2>
                <p>Captain picks and transfer calls tuned to your own squad, powered by the same model behind the predictions table. Launch price until 1 September, then &pound;20.</p>
                <div className="prem-cta">
                  <a className="s-btn s-btn--red hex" onClick={() => router.push('/premium')}>See premium</a>
                  <span className="prem-note">One-off &middot; full 2026/27 season</span>
                </div>
              </>
            )}
          </div>
          <ul className="prem-list">
            <li>AI captain picks for your squad, every gameweek</li>
            <li>Transfer suggestions ranked by expected points gain</li>
            <li>The full points-prediction table, not just the top 10</li>
            <li>Premium gameweek newsletter with your personalised calls</li>
          </ul>
        </div>
      </section>

      <footer className="foot on-ink">
        <div className="wrap">
          <a className="logo" onClick={() => router.push('/app')}><span className="bolt" />FPL RANKER</a>
          <nav aria-label="Footer">
            <a onClick={() => router.push('/predictions')}>Predictions</a>
            <a onClick={() => router.push('/premium')}>Premium</a>
            <a onClick={() => router.push('/app/blog')}>Blog</a>
            <a onClick={() => router.push('/about')}>About</a>
            <a onClick={() => router.push('/contact')}>Contact</a>
            <a onClick={() => router.push('/privacy')}>Privacy</a>
          </nav>
          <p className="fine">&copy; 2026 FPL Ranker. Not affiliated with the Premier League. Predictions are model estimates, not guarantees.</p>
        </div>
      </footer>
    </div>
  );
}

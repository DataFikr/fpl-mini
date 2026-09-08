'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from './Toast';
import { getActiveTeamId } from '@/lib/use-account';
import { extractTeamId } from '@/lib/team-id';
import { markSelfEnteredTeamId } from '@/lib/use-account';
import { TeamNameSearch } from './TeamNameSearch';
import { isFreeLaunchWindow, FREE_WINDOW_GW, FREE_WINDOW_LABEL } from '@/lib/premium';
import { trackPremiumGateClick } from '@/lib/analytics';
import { GameweekCountdown, isBeforeGameweek1 } from './GameweekCountdown';
import { AppMenu, type MenuLink } from './AppMenu';

/** Mirrors the desktop header nav, plus the buttons that drop out below 560px. */
const MENU_PRIMARY: MenuLink[] = [
  { label: 'Predictions', href: '/predictions' },
  { label: 'Players', href: '/app/players' },
  { label: 'Premium', href: '/premium' },
  { label: 'Blog', href: '/app/blog' },
  { label: 'Find team ID', href: '/app/find-team-id' },
];
const MENU_MORE: MenuLink[] = [
  { label: 'Sign in', href: '/auth/login' },
  { label: 'Master the League', href: '/master-the-league' },
  { label: 'FAQ', href: '/app/faq' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
];

/**
 * Marketing landing (mockup 01-landing.html) — sticky header, a single-column
 * hero, the YouTube Shorts band, a features grid, a premium band
 * (free-until-GW{FREE_WINDOW_GW} during the launch hold) and a footer. Scoped to `.lp` (see
 * landing.css). The Team-ID form stays the #1 above-the-fold CTA.
 *
 * `videoSlot` is injected by the server component in page.tsx rather than
 * fetched here: the video titles, links and JSON-LD have to be in the initial
 * HTML for the crawlers that don't run JS.
 */
export function Landing({ videoSlot }: { videoSlot?: React.ReactNode }) {
  const router = useRouter();
  const [teamId, setTeamId] = useState('');
  const [gw, setGw] = useState<number | null>(null);
  const [savedTeam, setSavedTeam] = useState<string | null>(null);
  // Resolved after mount so server and client agree on the first paint.
  const [preSeason, setPreSeason] = useState(true);
  const free = isFreeLaunchWindow();

  useEffect(() => {
    setPreSeason(isBeforeGameweek1());

    fetch('/api/gameweek/current')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && (d.gameweek || d.currentGameweek)) setGw(d.gameweek || d.currentGameweek); })
      .catch(() => {});

    const local = getActiveTeamId();
    if (local) setSavedTeam(local);
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.authenticated && d.fplTeamId) setSavedTeam(String(d.fplTeamId)); })
      .catch(() => {});
  }, []);

  // Landing is the highest-traffic page on the site and holds five routes into
  // /premium, none of which fired anything — so paywall discovery looked like
  // zero interest rather than an unmeasured step. `placement` says which one.
  const goPremium = (placement: string) => {
    trackPremiumGateClick(placement);
    router.push('/premium');
  };

  const analyze = (id: string) => {
    // Accepts a bare id or a pasted FPL team link — see extractTeamId.
    const v = extractTeamId(id);
    if (!v) { toast('Enter your team ID, or paste your FPL team link'); return; }
    // Deliberately not persisted here: the id is unverified at this point, and
    // remembering a typo would follow the visitor around every screen. The app
    // shell stores it once Home has actually resolved the team.
    //
    // The claim is recorded though, so the shell can tell this apart from an id
    // that arrived through someone else's share link and mark it `self`.
    markSelfEnteredTeamId(v);
    router.push(`/app/home?teamId=${v}`);
  };

  return (
    <div className="lp">
      <header className="site-head">
        <div className="wrap">
          <a className="logo" onClick={() => router.push('/app')} aria-label="FPL Ranker home"><span className="bolt" />FPL RANKER</a>
          <nav aria-label="Primary">
            <a onClick={() => router.push('/predictions')}>Predictions</a>
            <a onClick={() => goPremium('landing_nav')}>Premium</a>
            <a onClick={() => router.push('/app/blog')}>Blog</a>
            <a onClick={() => router.push('/app/find-team-id')}>Find team ID</a>
          </nav>
          <div className="head-actions">
            <a className="s-btn s-btn--ghost" onClick={() => router.push('/auth/login')}>Sign in</a>
            <a className="s-btn s-btn--red hex" onClick={() => goPremium('landing_header_cta')}>{free ? 'Get started free' : 'Go premium'}</a>
            {/* Below 900px the inline nav is hidden (and Sign in below 560px);
                this carries those links so the selling points stay reachable. */}
            <AppMenu primary={MENU_PRIMARY} more={MENU_MORE} backHref={null} wide />
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div>
            {/* Before GW1 the API's "current" gameweek is 1 with nothing played —
                claiming it is "Live" would contradict the countdown directly below. */}
            <span className="live-kicker"><span className="dot" />
              {preSeason || !gw ? '2026/27 season · GW1 Aug 21' : `Gameweek ${gw} · Live`}
            </span>
            <h1><span>Track your mini-league</span><em>like it&rsquo;s matchday</em></h1>
            <GameweekCountdown />
            <p className="sub">ESPN-style headlines, live rank movers and AI point predictions for your FPL mini-league. Search your team name and get your league&rsquo;s story in seconds — no signup, no team ID needed.</p>
            <TeamNameSearch />
            <p className="form-hint" style={{ marginTop: 14 }}>Know your team ID? Enter it here:</p>
            <form id="team-id-landing" name="team-id-landing" className="league-form" onSubmit={(e) => { e.preventDefault(); analyze(teamId); }} noValidate>
              <label className="id-field" aria-label="FPL manager ID">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                <input type="text" inputMode="numeric" placeholder="Team ID, or paste your FPL link" aria-label="FPL team ID"
                  autoComplete="off" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
                <button className="s-btn s-btn--red hex" type="submit">Rank my league</button>
              </label>
            </form>
            {savedTeam && (
              <p className="form-hint">Welcome back — <a onClick={() => analyze(savedTeam)}>resume team {savedTeam} &rarr;</a></p>
            )}
            <p className="form-hint">Not sure of your ID? <a onClick={() => router.push('/app/find-team-id')}>Find your team ID &rarr;</a></p>
            <div className="trust">
              <b>Live FPL data</b>
              <b>AI predictions</b>
              <b>{free ? FREE_WINDOW_LABEL : 'Core stays free'}</b>
            </div>
          </div>

        </div>
      </section>

      {videoSlot}

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
                <h2>The AI edge is <em>free</em> until GW{FREE_WINDOW_GW}</h2>
                <p>Pricing is on hold for launch. Rival Watch, the differential breakdown and the AI captain and transfer calls are unlocked for every manager through Gameweek&nbsp;{FREE_WINDOW_GW} while we validate the live data and retune the model. No card needed.</p>
                <div className="prem-cta">
                  <a className="s-btn s-btn--red hex" onClick={() => goPremium('landing_premium_free')}>See what&rsquo;s included</a>
                  <span className="prem-note">Pricing returns after GW{FREE_WINDOW_GW}</span>
                </div>
              </>
            ) : (
              <>
                <h2>An AI edge for <em>&pound;15</em>, all season</h2>
                <p>Captain picks and transfer calls tuned to your own squad, powered by the same model behind the predictions table. Launch price until 1 September, then &pound;20.</p>
                <div className="prem-cta">
                  <a className="s-btn s-btn--red hex" onClick={() => goPremium('landing_premium_paid')}>See premium</a>
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
            <a onClick={() => router.push('/app/players')}>Players</a>
            <a onClick={() => goPremium('landing_footer')}>Premium</a>
            <a onClick={() => router.push('/app/blog')}>Blog</a>
            <a onClick={() => router.push('/app/find-team-id')}>Find team ID</a>
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

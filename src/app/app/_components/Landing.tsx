'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from './Toast';
import { DEMO_TEAM } from '../_lib/screen-data';
import { AppMenu } from './AppMenu';
import { Faq } from './Faq';
import { AppFooter } from './AppFooter';

export function Landing() {
  const router = useRouter();
  const [teamId, setTeamId] = useState('');
  const [gw, setGw] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/gameweek/current')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && (d.gameweek || d.currentGameweek)) setGw(d.gameweek || d.currentGameweek); })
      .catch(() => {});
  }, []);

  const analyze = (id: string) => {
    const v = id.trim();
    if (!/^\d{1,9}$/.test(v)) { toast('Team IDs are numbers only'); return; }
    router.push(`/app/squad?teamId=${v}`);
  };

  return (
    <div className="view-landing">
      <div className="landing-bar">
        <div className="logo" onClick={() => router.push('/app')}><span className="bolt" />FPL RANKER</div>
        <AppMenu light />
      </div>

      <div className="v2-head">
        <div className="v2-title-badge">
          <h1 className="v2-title"><span>YOUR FANTASY TEAM</span><em>BRILLIANTLY</em><span>RANKED</span></h1>
        </div>
      </div>

      <div className="v2-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/redesign/hero-bg-v3.png" alt="Premier League stars" />
        <span className="live-pin"><span className="dot" />{gw ? `GW${gw} · Live` : 'Live'}</span>
        <div className="v2-overlay">
          <form className="id-field" onSubmit={(e) => { e.preventDefault(); analyze(teamId); }} noValidate>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></svg>
            <input type="text" inputMode="numeric" placeholder="Enter your FPL team ID" aria-label="FPL team ID"
              autoComplete="off" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
            <button type="submit" className="s-btn s-btn--red hex">Rank it</button>
          </form>
          <p className="v2-hint">Don&rsquo;t know your ID? Try the demo: <a onClick={() => analyze(String(DEMO_TEAM))}>{DEMO_TEAM}</a> · <a href="/app/find-team-id">find your ID</a></p>
        </div>
      </div>

      <div className="v2-body">
        <p className="v2-sub">Enter your FPL ID to see your live squad, your Rank My Team verdict and your gameweek points — updated with real Fantasy data every week. Free forever.</p>

        <div className="v2-explore" style={{ marginTop: 8 }}>
          <span className="kicker">Explore — no login needed</span>
          <div className="tool-grid">
            <div className="tool-tile" onClick={() => router.push('/app/fatigue')}>
              <span className="live-pin" />
              <div className="ti"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2 6 4-14 2 8h6" /></svg></div>
              <div><h4>WC FATIGUE</h4><p>World Cup 2026 load</p></div>
            </div>
            <div className="tool-tile" onClick={() => router.push('/app/kits')}>
              <div className="ti"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6l3 2v12h12V8l3-2-3-4-4 2a4 4 0 0 1-8 0z" /></svg></div>
              <div><h4>KIT HUB</h4><p>Shop club shirts</p></div>
            </div>
          </div>
        </div>

        <div className="v2-explore" style={{ marginTop: 28 }}>
          <span className="kicker">Frequently asked</span>
          <div style={{ marginTop: 12 }}><Faq /></div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}

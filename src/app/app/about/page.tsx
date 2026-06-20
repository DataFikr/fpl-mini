import { AppShell } from '../_components/AppShell';

export const metadata = {
  title: 'About — FPL Ranker',
  description: 'FPL Ranker helps every manager save time, play smarter and enjoy FPL more with their friends and rivals.',
};

const I = (d: React.ReactNode) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const FEATURES = [
  { h: 'Simple dashboard', p: 'Oversee all your mini-leagues in one engaging place.', i: I(<><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 5-6" /></>) },
  { h: 'Rank progression', p: 'Interactive charts to track your journey week by week.', i: I(<><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6h-6" /></>) },
  { h: 'Rival watch', p: "See exactly who's gaining on you — and who's blanking.", i: I(<><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></>) },
  { h: 'Headlines & banter', p: 'ESPN-style updates and Manager of the Month keep it fun.', i: I(<><path d="M6 4h12v3a6 6 0 0 1-12 0z" /><path d="M9 19h6M10 13v3a2 2 0 0 1-1 2M14 13v3a2 2 0 0 0 1 2" /></>) },
];

const VALUES = [
  ['Free & accessible', 'No hidden fees, no premium paywalls.'],
  ['Community-driven', 'We build what FPL managers actually ask for.'],
  ['Data-powered', 'Real-time updates and stats you can trust.'],
  ['For the love of the game', 'Built by FPL enthusiasts who know the thrill (and agony) of deadlines.'],
];

export default function Page() {
  return (
    <AppShell title="About" backHref="/app/home" meta="Your home for mini-league domination">
      <div className="content">
        <div className="scr-head" style={{ marginBottom: 10 }}>
          <div><div className="scr-title">ABOUT FPL RANKER</div><div className="scr-sub">Your mini-league, brilliantly ranked</div></div>
        </div>
        <p className="lead">
          Fantasy Premier League is fun — but keeping track of all your mini-leagues, rivals and weekly rank changes gets overwhelming. That&rsquo;s why we built FPL Ranker.
        </p>

        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div className="feat-card" key={f.h}>
              <div className="fic">{f.i}</div>
              <div><h3>{f.h}</h3><p>{f.p}</p></div>
            </div>
          ))}
        </div>

        <div className="callout">
          <div className="lbl">Our mission</div>
          <h2>PLAY SMARTER, ENJOY MORE</h2>
          <p>Help every manager save time, play smarter and enjoy FPL even more with their friends and rivals.</p>
        </div>

        <h2>What we stand for</h2>
        {VALUES.map(([h, p]) => (
          <div className="info-card" key={h}><h3>{h}</h3><p>{p}</p></div>
        ))}
      </div>
    </AppShell>
  );
}

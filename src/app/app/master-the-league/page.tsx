import { AppShell } from '../_components/AppShell';

export const metadata = {
  title: 'Master the Mini-League: The Ultimate Strategy Guide to FPL Dominance | FPL Ranker',
  description:
    'The ultimate strategy guide to FPL mini-league dominance. Learn how to use real-time BPS tracking, monthly leaderboards, automated headlines and progression charts to win your league.',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How do I keep my FPL mini-league active after Christmas?', acceptedAnswer: { '@type': 'Answer', text: "Monthly Leaderboards are the most effective way to prevent manager dropout. By resetting the competitive focus every four weeks, managers who have fallen behind get a fresh chance to win 'Manager of the Month' and stay engaged." } },
    { '@type': 'Question', name: 'Which FPL site shows live bonus points (BPS) for my mini-league rivals?', acceptedAnswer: { '@type': 'Answer', text: 'FPL Ranker provides a live bonus point (BPS) tracker for every manager in your mini-league, calculating provisional bonus in real time so you can see the exact points your rivals are gaining before scores are finalised.' } },
    { '@type': 'Question', name: 'How can I find the biggest bench disaster in my FPL league?', acceptedAnswer: { '@type': 'Answer', text: "FPL Ranker's Bench Regret Meter quantifies exactly how much of each manager's potential score is rotting on the bench, surfacing the week's biggest bench disasters automatically." } },
    { '@type': 'Question', name: 'What are the best fun ways to roast FPL rivals using gameweek data?', acceptedAnswer: { '@type': 'Answer', text: "Automated 'Banter Highlights' like 'Captain Calamity' or 'Panic Merchant', plus shareable rank-progression charts showing a rival's steep decline, give you undeniable data-driven ammunition for the group chat." } },
  ],
};

export default function Page() {
  return (
    <AppShell title="Master the League" backHref="/app/home" meta="The ultimate strategy guide">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="content">
        <div className="scr-head" style={{ marginBottom: 10 }}>
          <div><div className="scr-title">MASTER THE MINI-LEAGUE</div><div className="scr-sub">The ultimate strategy guide to FPL dominance</div></div>
        </div>
        <p className="lead">
          For many, FPL isn&rsquo;t about global rankings — it&rsquo;s the fierce rivalries inside your private mini-leagues. We&rsquo;ve moved beyond point-tracking to a high-octane analytics suite that keeps your league engaged, competitive and full of banter. Here&rsquo;s how to weaponise it.
        </p>

        <div className="step">
          <div className="step-h"><div className="step-n">1</div><h2>The psychology of the chase: live rank tracking</h2></div>
          <p>The official app can feel like a static spreadsheet. To win, you need to feel the momentum as it happens.</p>
          <h3>Real-time BPS &amp; live swings</h3>
          <p>Immediate insight into Real-Time BPS (Bonus Point System) and xG. Seeing a live 10-point haul lock in as the clean sheet holds creates a &ldquo;high&rdquo; that static tables can&rsquo;t match.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/strategy/real_time_bps.png" alt="Real-time BPS and live swings dashboard" loading="lazy" />
          <h3 style={{ marginTop: 16 }}>The pivot &amp; the Bench Regret Meter</h3>
          <p>Monitor your Differential Impact — knowing you&rsquo;ve gained +3 from low-ownership picks lets you play defensively or aggressively in real time. Our <strong>Bench Regret Meter</strong> tracks exactly how much potential score is rotting on the pine.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/strategy/team_analysis.png" alt="Team analysis with differential impact and bench regret meter" loading="lazy" />
        </div>

        <div className="step">
          <div className="step-h"><div className="step-n">2</div><h2>The &ldquo;fresh start&rdquo; effect: monthly leaderboards</h2></div>
          <p>A common league-killer is manager dropout — when the leader is 100 points clear by December, casual players stop checking their teams.</p>
          <h3>Gameweek phasing &amp; monthly kings</h3>
          <p>We combat burnout with <strong>Monthly Leaderboards</strong>, giving every manager a fresh start every four weeks. Highlighting the &ldquo;Monthly Top 3&rdquo; keeps the mid-table competitive — being 1st for September is legitimate bragging rights even if you&rsquo;re 10th overall.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/strategy/leaderboard.png" alt="Monthly leaderboard with top-3 performers per month" loading="lazy" />
        </div>

        <div className="step">
          <div className="step-h"><div className="step-n">3</div><h2>Tactical storytelling: automated banter &amp; headlines</h2></div>
          <p>FPL is a social game. Data without context is just numbers; data with a story is banter.</p>
          <h3>ESPN-style headlines</h3>
          <p>Our <strong>Top Headlines</strong> auto-generate dramatic news cards from your league&rsquo;s performance — a &ldquo;GAMEWEEK HERO&rdquo; 96-point masterclass or a &ldquo;CHAMPIONSHIP WAR&rdquo; between rivals turn raw stats into shared experiences. We even flag when a league has gone too &ldquo;template&rdquo;, daring you to be different.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/strategy/banter_updated.png" alt="ESPN-style automated banter headline cards" loading="lazy" />
          <h3 style={{ marginTop: 16 }}>League progression charts</h3>
          <p>Visualise the drama with League Table Progression graphs. Watching a rival implode with a plummeting line is the ultimate ammunition for the group chat.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/strategy/progression.png" alt="League progression chart of rank movement over the season" loading="lazy" />
        </div>

        <div className="callout">
          <div className="lbl">Ready?</div>
          <h2>DOMINATE YOUR LEAGUE</h2>
          <p>Enter your team ID and start exploring real-time analytics, monthly leaderboards and automated banter today.</p>
          <a className="s-btn s-btn--red hex" href="/app" style={{ marginTop: 16, textDecoration: 'none' }}>Get started free</a>
        </div>
      </div>
    </AppShell>
  );
}

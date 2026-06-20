import { AppShell } from '../_components/AppShell';

export const metadata = {
  title: 'How to Find Your FPL Team ID — FPL Ranker',
  description: 'A simple step-by-step guide to finding your Fantasy Premier League Team ID so you can rank your squad and mini-leagues on FPL Ranker.',
};

export default function Page() {
  return (
    <AppShell title="Find Team ID" backHref="/app/home" meta="6 quick steps">
      <div className="content">
        <div className="scr-head" style={{ marginBottom: 10 }}>
          <div><div className="scr-title">FIND YOUR TEAM ID</div><div className="scr-sub">Locate your FPL Team ID in 6 steps</div></div>
        </div>
        <p className="lead">Your Team ID is the number that unlocks your squad, verdict and mini-leagues on FPL Ranker. Here&rsquo;s how to find it.</p>

        <div className="step">
          <div className="step-h"><div className="step-n">1</div><h3>Go to the official FPL website</h3></div>
          <p>Visit <a href="https://fantasy.premierleague.com/" target="_blank" rel="noopener noreferrer">fantasy.premierleague.com</a> using a <strong>web browser</strong> (not the mobile app).</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/find-team-id/find_team_Id_1.png" alt="FPL website homepage" loading="lazy" />
        </div>

        <div className="step">
          <div className="step-h"><div className="step-n">2</div><h3>Log in</h3></div>
          <p>Log in with your usual Fantasy Premier League credentials.</p>
        </div>

        <div className="step">
          <div className="step-h"><div className="step-n">3</div><h3>Open &ldquo;Gameweek History&rdquo;</h3></div>
          <p>Once logged in, click your <strong>Team Name</strong>, then select <strong>Gameweek History</strong> from the menu.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/find-team-id/find_team_Id_2.png" alt="Gameweek History menu" loading="lazy" />
        </div>

        <div className="step">
          <div className="step-h"><div className="step-n">4</div><h3>Locate your Team ID in the URL</h3></div>
          <p>Look at your browser&rsquo;s address bar:</p>
          <div className="code-line">fantasy.premierleague.com/entry/<span className="hl">123456</span>/history</div>
          <p>The <strong>number</strong> between <code>/entry/</code> and <code>/history</code> is your <strong>Team ID</strong>.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/find-team-id/find_team_Id_3.png" alt="Team ID in the URL" loading="lazy" />
        </div>

        <div className="step">
          <div className="step-h"><div className="step-n">5</div><h3>Copy your Team ID</h3></div>
          <p>Highlight and copy those digits (e.g. <code>123456</code>), or just note them down.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/find-team-id/find_team_Id_4.png" alt="Copy your Team ID" loading="lazy" />
        </div>

        <div className="step">
          <div className="step-h"><div className="step-n">6</div><h3>Enter it on FPL Ranker</h3></div>
          <p>Head to <a href="/app">FPL Ranker</a>, paste your Team ID into the field on the home screen and tap <strong>Rank it</strong>. You&rsquo;ll instantly see:</p>
          <ul>
            <li>Your live squad, kit and gameweek points</li>
            <li>All your <strong>mini-leagues</strong> with rank and movement</li>
            <li>A Rank My Team verdict and rank analytics</li>
          </ul>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/find-team-id/find_team_Id_5.png" alt="Enter your Team ID on FPL Ranker" loading="lazy" />
        </div>

        <div className="info-card"><h3>💡 Tip</h3><p>Managing multiple teams? Repeat the steps for each — every team has a unique Team ID, so make sure you use the right one.</p></div>
      </div>
    </AppShell>
  );
}

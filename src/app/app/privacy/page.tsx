import { AppShell } from '../_components/AppShell';

export const metadata = {
  title: 'Privacy Policy — FPL Ranker',
  description: 'How FPL Ranker collects, uses and protects your information.',
};

export default function Page() {
  return (
    <AppShell title="Privacy" backHref="/app/home" meta="Last updated: January 2025">
      <div className="content">
        <div className="scr-head" style={{ marginBottom: 10 }}>
          <div><div className="scr-title">PRIVACY POLICY</div><div className="scr-sub">Last updated: January 2025</div></div>
        </div>
        <p className="lead">At FPL Ranker, we value your privacy. This policy explains how we collect, use and protect your information when you use our website and services.</p>

        <h2>Information we collect</h2>
        <div className="info-card"><h3>Personal information</h3><p>If you create an account, we may collect your email address and display name.</p></div>
        <div className="info-card"><h3>Fantasy Premier League data</h3><p>When you connect your FPL team, we access public FPL API data such as team name, league standings, player selections and gameweek points.</p></div>
        <div className="info-card"><h3>Team name search</h3><p>So people can find their squad without hunting for a numeric team ID, we keep a list of the team names, manager names and team IDs that already appear on the public FPL league tables we load. <strong>Only team names are searchable</strong> — you cannot look a person up by their manager name here. A manager name is shown next to a search result purely so two squads with the same name can be told apart, exactly as the official FPL league table shows it. We store no email addresses, squads or private details for this. If you would like your entry removed, <a href="/contact">contact us</a>.</p></div>
        <div className="info-card"><h3>Cookies &amp; analytics</h3><p>We use cookies and tools like Google Analytics to understand traffic patterns and improve your experience.</p></div>

        <h2>How we use information</h2>
        <ul>
          <li>To display your team and mini-league data</li>
          <li>To provide insights, charts and breaking news related to your leagues</li>
          <li>To improve our website functionality and user engagement</li>
          <li>To communicate with you about service updates and features</li>
        </ul>

        <h2>Data sharing</h2>
        <p>We <strong>do not sell</strong> your personal information to third parties. We only share data:</p>
        <ul>
          <li>With service providers (e.g. hosting, analytics) that help operate FPL Ranker</li>
          <li>When required by law or to protect our legal rights</li>
        </ul>

        <h2>Your rights</h2>
        <ul>
          <li>Access your personal information</li>
          <li>Request correction or deletion of your data</li>
          <li>Opt out of marketing communications</li>
        </ul>

        <h2>Security</h2>
        <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

        <h2>Questions?</h2>
        <p>If you have any questions about this Privacy Policy, contact us at <a href="mailto:support@fplranker.com">support@fplranker.com</a>.</p>

        <p style={{ fontSize: 12, color: 'var(--t3)', borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 8 }}>
          FPL Ranker is an independent tool and is not affiliated with or endorsed by the Premier League or Fantasy Premier League.
        </p>
      </div>
    </AppShell>
  );
}

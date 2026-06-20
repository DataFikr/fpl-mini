import Link from 'next/link';
import { FaXTwitter, FaReddit, FaInstagram } from 'react-icons/fa6';

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="fbrand"><span className="bolt" />FPL RANKER</div>
      <p className="ftag">Your mini-league, brilliantly ranked. Track every gameweek, rank your team and back your club — free forever.</p>

      <div className="fcols">
        <div className="fcol">
          <h4>Company</h4>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="fcol">
          <h4>Support</h4>
          <Link href="/app/faq">FAQ</Link>
          <Link href="/find-team-id">Find Team ID</Link>
          <Link href="/master-the-league">Master the League</Link>
        </div>
        <div className="fcol">
          <h4>Legal</h4>
          <Link href="/privacy">Privacy</Link>
          <Link href="/app/blog">Blog</Link>
        </div>
      </div>

      <div className="fsocial">
        <a href="https://x.com/fplranker" target="_blank" rel="noopener noreferrer" aria-label="FPL Ranker on X"><FaXTwitter /></a>
        <a href="https://www.reddit.com/user/fplranker/" target="_blank" rel="noopener noreferrer" aria-label="FPL Ranker on Reddit"><FaReddit /></a>
        <a href="https://instagram.com/FPLRanker" target="_blank" rel="noopener noreferrer" aria-label="FPL Ranker on Instagram"><FaInstagram /></a>
      </div>

      <div className="fbottom">
        © {new Date().getFullYear()} FPL Ranker. All rights reserved.<br />
        Fantasy Premier League is an official game of the Premier League. FPL Ranker is an independent tool and is not affiliated with or endorsed by the Premier League or FPL.
      </div>
    </footer>
  );
}

import { AppShell } from '../_components/AppShell';
import { Faq } from '../_components/Faq';

export const metadata = {
  title: 'FAQ — FPL Ranker',
  description: 'Answers to common questions about FPL Ranker — finding your team ID, tracking mini-leagues, the Rank My Team verdict, and more.',
};

export default function Page() {
  return (
    <AppShell title="FAQ" backHref="/app">
      <div className="scr-head" style={{ marginBottom: 6 }}>
        <div><div className="scr-title">FAQ</div><div className="scr-sub">Everything you need to get started</div></div>
      </div>
      <p className="kit-intro">Quick answers on team IDs, mini-leagues, the Rank My Team verdict and how FPL Ranker works.</p>
      <Faq />
    </AppShell>
  );
}

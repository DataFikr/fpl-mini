import type { Metadata, Viewport } from 'next';
import './_styles/sportify-fpl.css';
import './_styles/app-screens.css';
import './_styles/redesign.css';

export const metadata: Metadata = {
  title: 'FPL Ranker — Your fantasy team, brilliantly ranked',
  description:
    'Enter your FPL team ID to see your live squad, your Rank My Team verdict and your gameweek points — real Fantasy data, every gameweek. Free forever.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#150000',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="fpl-app">{children}</div>;
}

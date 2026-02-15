import { Metadata } from 'next';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Master the Mini-League: The Ultimate Strategy Guide to FPL Dominance | FPLRanker',
  description:
    'The ultimate strategy guide to FPL mini-league dominance. Learn how to use real-time BPS tracking, monthly leaderboards, automated headlines, and progression charts to win your league.',
  openGraph: {
    title: 'Master the Mini-League: The Ultimate Strategy Guide to FPL Dominance',
    description:
      'Move beyond simple point-tracking. Weaponize analytics to dominate your FPL mini-league.',
  },
};

export default function MasterTheLeaguePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-6">
          <ol className="flex items-center gap-2 text-sm font-inter text-fpl-text-secondary">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/master-the-league" className="hover:text-white transition-colors">
                Master the League
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-fpl-accent" aria-current="page">
              The Ultimate Strategy Guide to FPL Dominance
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-jakarta font-bold text-white mb-6 leading-tight">
                Master the Mini-League: The Ultimate Strategy Guide to{' '}
                <span className="text-gradient-primary">FPL Dominance</span>
              </h1>
              <p className="text-lg md:text-xl text-fpl-text-secondary font-inter leading-relaxed max-w-3xl mx-auto">
                For many, Fantasy Premier League isn&apos;t just about global rankings; it&apos;s about the fierce
                rivalries within your private mini-leagues. At FPLRanker, we&apos;ve moved beyond simple
                point-tracking to provide a high-octane analytics suite designed to keep your league
                engaged, competitive, and&mdash;most importantly&mdash;full of banter.
              </p>
              <p className="text-base text-fpl-text-secondary/80 font-inter mt-4">
                This guide explores the psychological levers of mini-league play and how to weaponize
                our top features to secure that trophy.
              </p>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <main className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* ─── Section 1: Real-Time Live Rank Tracking ─── */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-fpl-accent to-green-500 rounded-full flex items-center justify-center text-white font-jakarta font-bold text-lg flex-shrink-0">
                  1
                </div>
                <h2 className="text-2xl md:text-3xl font-jakarta font-bold text-white">
                  The Psychology of the Chase: Real-Time Live Rank Tracking
                </h2>
              </div>

              <p className="text-fpl-text-secondary font-inter leading-relaxed mb-8">
                The official FPL app can feel like a static spreadsheet. To win, you need to feel the
                momentum of the game as it happens.
              </p>

              {/* Sub-section: Real-Time BPS */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-6 mb-8">
                <h3 className="text-xl font-jakarta font-bold text-fpl-accent mb-3">
                  Real-Time BPS &amp; Live Swings
                </h3>
                <p className="text-fpl-text-secondary font-inter leading-relaxed mb-6">
                  Our platform provides immediate insight into Real-Time BPS (Bonus Point System) and
                  xG data. Seeing a live 10-point haul from a player like Jo&atilde;o Pedro as the clean
                  sheet locks in creates a psychological &ldquo;high&rdquo; that static tables can&apos;t match.
                </p>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-fpl-primary/20">
                  <Image
                    src="/images/strategy/real_time_bps.png"
                    alt="Real-Time BPS and Live Swings dashboard showing live bonus points and xG data"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>

              {/* Sub-section: Differential & Bench */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-6">
                <h3 className="text-xl font-jakarta font-bold text-fpl-accent mb-3">
                  The Power of the Pivot &amp; Bench Regret Meter
                </h3>
                <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                  Use the Team Analysis dashboard to monitor your Differential Impact. Knowing you&apos;ve
                  gained +3 points from low-ownership players like Andersen or Reinildo allows you to
                  play defensively or aggressively in real-time.
                </p>
                <p className="text-fpl-text-secondary font-inter leading-relaxed mb-6">
                  We&apos;ve quantified the &ldquo;pain&rdquo; of FPL. Our <strong className="text-white">Bench Regret Meter</strong> tracks
                  exactly how much of your potential score is rotting on the pine, helping you refine
                  your rotation strategy for future Gameweeks.
                </p>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-fpl-primary/20">
                  <Image
                    src="/images/strategy/team_analysis.png"
                    alt="Team Analysis dashboard showing differential impact and bench regret meter"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
            </section>

            {/* ─── Section 2: Monthly Leaderboards ─── */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-fpl-violet-500 to-fpl-primary rounded-full flex items-center justify-center text-white font-jakarta font-bold text-lg flex-shrink-0">
                  2
                </div>
                <h2 className="text-2xl md:text-3xl font-jakarta font-bold text-white">
                  The &ldquo;Fresh Start&rdquo; Effect: Monthly Leaderboards
                </h2>
              </div>

              <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                A common &ldquo;league-killer&rdquo; is the manager dropout. When the leader is 100 points clear
                by December, casual players often stop checking their teams.
              </p>

              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-6">
                <h3 className="text-xl font-jakarta font-bold text-fpl-accent mb-3">
                  Gameweek Phasing &amp; Monthly Kings
                </h3>
                <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                  FPLRanker combats burnout with <strong className="text-white">Monthly Leaderboards</strong>.
                  By breaking the season into months like August and September, we give every manager a
                  &ldquo;fresh start&rdquo; every four weeks.
                </p>
                <p className="text-fpl-text-secondary font-inter leading-relaxed mb-6">
                  Highlighting the &ldquo;Monthly Top 3 Performers&rdquo; keeps the mid-table competitive. Even
                  if you are 10th overall, being 1st for the month of September gives you legitimate
                  bragging rights and keeps the social engine of the league running.
                </p>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-fpl-primary/20">
                  <Image
                    src="/images/strategy/leaderboard.png"
                    alt="Monthly Leaderboard showing top 3 performers for each month with medal badges"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
            </section>

            {/* ─── Section 3: Tactical Storytelling ─── */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-jakarta font-bold text-lg flex-shrink-0">
                  3
                </div>
                <h2 className="text-2xl md:text-3xl font-jakarta font-bold text-white">
                  Tactical Storytelling: Automated Banter &amp; Headlines
                </h2>
              </div>

              <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                FPL is a social game. Data without context is just numbers; data with a
                &ldquo;story&rdquo; is banter.
              </p>

              {/* Sub-section: ESPN-Style Headlines */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-6 mb-8">
                <h3 className="text-xl font-jakarta font-bold text-fpl-accent mb-3">
                  ESPN-Style Headlines &amp; The &ldquo;Factory Settings&rdquo; Warning
                </h3>
                <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                  Our <strong className="text-white">Top Headlines</strong> feature automatically generates
                  dramatic news cards based on your league&apos;s performance. Whether it&apos;s a
                  &ldquo;GAMEWEEK HERO&rdquo; delivering a 96-point masterclass or a &ldquo;CHAMPIONSHIP
                  WAR&rdquo; breaking out between rivals, these headlines turn raw stats into shared
                  experiences.
                </p>
                <p className="text-fpl-text-secondary font-inter leading-relaxed mb-6">
                  We flag when a league has become too &ldquo;template.&rdquo; Our Automated Headlines will
                  call out managers whose teams are identical, challenging you to &ldquo;dare to be
                  different&rdquo; to break the deadlock.
                </p>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-fpl-primary/20">
                  <Image
                    src="/images/strategy/banter_updated.png"
                    alt="Top Headlines showing ESPN-style automated banter cards for FPL mini-league"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>

              {/* Sub-section: Progression Charts */}
              <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-6">
                <h3 className="text-xl font-jakarta font-bold text-fpl-accent mb-3">
                  League Progression Charts
                </h3>
                <p className="text-fpl-text-secondary font-inter leading-relaxed mb-6">
                  Visualize the drama with League Table Progression graphs. Seeing a rival
                  &ldquo;implode&rdquo; with a plummeting line on the chart is the ultimate ammunition for
                  the group chat.
                </p>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-fpl-primary/20">
                  <Image
                    src="/images/strategy/progression.png"
                    alt="League Progression Chart showing rank movement of all managers over the season"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center backdrop-blur-fpl bg-gradient-to-r from-fpl-primary/20 to-fpl-violet-500/20 rounded-fpl border border-fpl-primary/30 p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-jakarta font-bold text-white mb-4">
                Ready to Dominate Your League?
              </h2>
              <p className="text-fpl-text-secondary font-inter mb-6 max-w-xl mx-auto">
                Enter your league ID and start exploring real-time analytics, monthly leaderboards,
                and automated banter today.
              </p>
              <Link
                href="/#cta"
                className="inline-block px-8 py-3 bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white font-jakarta font-semibold rounded-fpl hover:shadow-fpl-glow-violet transition-all"
              >
                Get Started Free
              </Link>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

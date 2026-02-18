import { Metadata } from 'next';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Top 5 FPL Fixture Difficulty (FDR) Tools | FPLRanker Blog',
  description:
    'Master your long-term FPL planning with the top 5 Fixture Difficulty Rating tools. Compare Fantasy Football Fix, Fantasy Football Hub, FPLRanker, FPL.Team, and FPL Analytics.',
  openGraph: {
    title: 'Top 5 FPL Fixture Difficulty (FDR) Tools',
    description:
      'Navigate blank gameweeks, double gameweeks, and the dreaded fixture turn with these top FDR tools.',
  },
};

export default function FDRToolsBlog() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-fpl-dark via-fpl-primary/5 to-fpl-dark pt-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-6">
          <ol className="flex items-center gap-2 text-sm font-inter text-fpl-text-secondary">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-fpl-accent" aria-current="page">Top 5 FDR Tools</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="text-sm text-fpl-text-secondary font-inter mb-4">February 17, 2026</div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-jakarta font-bold text-white mb-6 leading-tight">
                Master Your Long-Term Planning:{' '}
                <span className="text-gradient-primary">Top 5 FPL Fixture Difficulty (FDR) Tools</span>
              </h1>
              <p className="text-lg md:text-xl text-fpl-text-secondary font-inter leading-relaxed max-w-3xl mx-auto">
                In the world of Fantasy Premier League, information is power, but visualization is king.
                While the official FPL site provides a basic 1-5 difficulty scale, top-tier managers know
                that the official ratings often lag behind real-world form.
              </p>
              <p className="text-base text-fpl-text-secondary/80 font-inter mt-4 max-w-3xl mx-auto">
                To navigate blank gameweeks, double gameweeks, and the dreaded &ldquo;fixture turn,&rdquo;
                you need a dedicated FDR (Fixture Difficulty Rating) tool. Here are the top 5 tools to
                help you spot the green runs before your rivals do.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <main className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Tool 1 */}
            <ToolSection
              number={1}
              name="Fantasy Football Fix"
              tagline="The Defensive Specialist"
              link="https://www.fantasyfootballfix.com/planner"
              imageSrc="/images/blog/blog_fdr_fantasyfootballfix.png"
              imageAlt="Fantasy Football Fix Rotation Planner"
              gradient="from-blue-500 to-cyan-500"
            >
              <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                Fantasy Football Fix is famous for its &ldquo;Rotation Planner,&rdquo; making it the ultimate
                tool for managers looking to rotate two 4.5m defenders.
              </p>
              <Feature title="Key Feature" text='The Rotation Matrix. This tool allows you to select two teams (e.g., Everton and Fulham) and see their combined "best" fixture each week. It&apos;s the easiest way to ensure you never have to start a defender against Manchester City.' />
              <Feature title="Visualization" text='Their "Stats Sandbox" provides a heat-map style FDR that visualizes clean sheet probabilities.' />
              <Feature title='The "Pro" Edge' text='Their AI Assistant provides a "Team Rating" out of 100 based on your upcoming 5-week fixture difficulty.' />
            </ToolSection>

            {/* Tool 2 */}
            <ToolSection
              number={2}
              name="Fantasy Football Hub"
              tagline="The AI-Powered Ticker"
              link="https://www.fantasyfootballhub.co.uk/fixture-ticker"
              imageSrc="/images/blog/blog_fdr_fantasyfootballhub.png"
              imageAlt="Fantasy Football Hub Fixture Ticker"
              gradient="from-purple-500 to-pink-500"
            >
              <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                If you prefer data-backed projections over manual gut feeling, Fantasy Football Hub is the
                heavy hitter in the space.
              </p>
              <Feature title="Key Feature" text='xG-Based Difficulty. Unlike the official 1–5 scale which is based on team standing, the Hub&apos;s FDR uses OPTA stats and expected goals (xG). If a "big team" is struggling defensively, the Hub&apos;s ticker will show them as a "green" fixture for attackers even if they are top of the table.' />
              <Feature title="Visualization" text='An incredibly deep "Fixture Ticker" that you can sort by Attack, Defense, or Overall difficulty.' />
              <Feature title='The "Pro" Edge' text="It factors in Ben Crellin's legendary fixture announcements (double gameweeks and blanks) faster than any other platform." />
            </ToolSection>

            {/* Tool 3 */}
            <ToolSection
              number={3}
              name="FPLRanker"
              tagline='The "Banter-First" Insight Tool'
              link="https://fplranker.com"
              imageSrc="/images/blog/feature_3_fixture_fdr.png"
              imageAlt="FPLRanker Fixture FDR View"
              gradient="from-fpl-accent to-green-500"
            >
              <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                We&apos;ve built FPLRanker to bridge the gap between &ldquo;hard data&rdquo; and
                &ldquo;league rivalry.&rdquo; While other tools focus on world rankings, we focus on helping
                you win your mini-league.
              </p>
              <Feature title="Key Feature" text='The Fixture FDR Key (1–5 Scale). Our dashboard provides a streamlined, high-contrast FDR view. We focus on clarity—instantly showing you which managers in your league are about to hit a "fixture wall" and which ones have a clear run.' />
              <Feature title="Visualization" text='Our fixture view is designed for the "Saturday Morning Ritual." It presents a clean grid of GW26 through GW35, color-coded for immediate "threat assessment" against your rivals.' />
              <Feature title='The "Pro" Edge' text='We combine FDR with our Transfer History tool. You can see not just where a rival is going, but whether their past "disaster transfers" were due to ignoring the fixture difficulty in the first place.' />
            </ToolSection>

            {/* Tool 4 */}
            <ToolSection
              number={4}
              name="FPL.Team"
              tagline="The Planner's Paradise"
              link="https://fpl.team/fdr"
              imageSrc="/images/blog/blog_fdr_fplteam.png"
              imageAlt="FPL.Team FDR Planner"
              gradient="from-yellow-500 to-orange-500"
            >
              <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                FPL.Team has become the gold standard for managers who like to &ldquo;tinker.&rdquo; Its
                interface is less of a static chart and more of a playable game board.
              </p>
              <Feature title="Key Feature" text="Interactive Future Planning. You can make transfers, change captains, and play chips up to 38 weeks in advance. The FDR isn't just a separate tab; it's integrated directly under every player's shirt in your mock draft." />
              <Feature title="Visualization" text='It uses a clean, modern color gradient that shifts dynamically based on your "Transfer Solver" logic.' />
              <Feature title='The "Pro" Edge' text="It syncs your official team automatically, so you can see your specific squad's FDR for the next 10 weeks at a single glance." />
            </ToolSection>

            {/* Tool 5 */}
            <ToolSection
              number={5}
              name="FPL Analytics"
              tagline="The Strategic Deep-Dive"
              link="https://www.fplanalytics.com/fdr.html"
              imageSrc="/images/blog/blog_fdr_fplanalytics.png"
              imageAlt="FPL Analytics FDR Table"
              gradient="from-red-500 to-rose-500"
            >
              <p className="text-fpl-text-secondary font-inter leading-relaxed mb-4">
                For those who want to see every team&apos;s schedule laid out in a clean, expansive grid,
                FPL Analytics is the go-to resource.
              </p>
              <Feature title="Key Feature" text='A comprehensive FDR table that shows the "Fixture Swing" more clearly than almost any other site.' />
              <Feature title="Why it's great" text='It offers a "Difficulty Slider," allowing you to customize how the ratings are calculated based on home/away advantage and recent form.' />
              <Feature title="The Vibe" text="Minimalist and data-heavy; perfect for the manager who loves a good spreadsheet." />
            </ToolSection>

            {/* CTA */}
            <div className="backdrop-blur-fpl bg-gradient-to-r from-fpl-primary/20 to-fpl-violet-700/20 rounded-fpl p-8 border border-fpl-primary/30 text-center">
              <h2 className="text-2xl md:text-3xl font-jakarta font-bold text-white mb-4">
                Ready to Plan Your Fixture Run?
              </h2>
              <p className="text-fpl-text-secondary font-inter mb-6">
                Check out FPLRanker&apos;s Fixture FDR view for your team and dominate the green runs.
              </p>
              <a
                href="/"
                className="inline-block px-8 py-4 bg-gradient-to-r from-fpl-primary to-fpl-violet-700 text-white font-jakarta font-semibold rounded-fpl hover:shadow-fpl-glow-violet transition-all"
              >
                Get Started Now
              </a>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

function ToolSection({
  number,
  name,
  tagline,
  link,
  imageSrc,
  imageAlt,
  gradient,
  children,
}: {
  number: number;
  name: string;
  tagline: string;
  link: string;
  imageSrc: string;
  imageAlt: string;
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <div className="backdrop-blur-fpl bg-fpl-dark/40 rounded-fpl border border-fpl-primary/20 p-6 md:p-8">
      <div className="flex items-start gap-4 md:gap-6">
        <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white font-jakarta font-bold text-xl`}>
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-jakarta font-bold text-white mb-1">
            <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-fpl-accent transition-colors">
              {name}
            </a>
            <span className="text-fpl-text-secondary font-inter text-base font-normal ml-2">— {tagline}</span>
          </h2>

          <div className="mt-4 space-y-3">
            {children}
          </div>

          <div className="mt-6 rounded-xl overflow-hidden border border-fpl-primary/20 shadow-lg">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={800}
              height={450}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <span className="text-white font-jakarta font-semibold">{title}: </span>
      <span className="text-fpl-text-secondary font-inter">{text}</span>
    </div>
  );
}

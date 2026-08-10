import type { Metadata } from 'next';
import Link from 'next/link';
import '@/app/_styles/sportify-pages.css';
import { prisma } from '@/lib/database';
import { getSessionUser, hasActivePremium } from '@/lib/auth';
import { CURRENT_SEASON } from '@/services/predictor-service';
import { SITE_URL, SITE_NAME, absUrl } from '@/lib/seo';
import { FaqStructuredData, BreadcrumbStructuredData, StructuredData } from '@/components/seo/structured-data';
import { PredictionsFaq } from './_faq';
import { getSlugsByFplId } from '@/lib/players';

// Regenerate hourly — predictions change with price/injury refreshes.
export const revalidate = 3600;

const FREE_LIMIT = 10;
const POS: Record<number, string> = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };

export const metadata: Metadata = {
  title: 'FPL Points Predictions — Who to Captain This Gameweek | FPL Ranker',
  description:
    'AI-predicted Fantasy Premier League points for the upcoming gameweek. See the top projected scorers and captaincy picks, ranked by expected points from our self-learning model.',
  alternates: { canonical: `${SITE_URL}/predictions` },
  openGraph: {
    title: 'FPL Points Predictions — Who to Captain This Gameweek',
    description: 'Top projected FPL scorers for the upcoming gameweek, ranked by expected points.',
    url: `${SITE_URL}/predictions`,
  },
};

interface PredRow {
  playerFplId: number; webName: string; teamShort: string;
  position: number; price: number; xPts: number; xMins: number | null;
}

export default async function PredictionsPage() {
  // Degrade to the empty state if predictions aren't available yet (e.g. the
  // table hasn't been seeded / migrated) rather than crashing the page.
  let latest: { gameweek: number } | null = null;
  let rows: PredRow[] = [];
  try {
    latest = await prisma.playerPrediction.findFirst({
      where: { season: CURRENT_SEASON },
      orderBy: { gameweek: 'desc' },
      select: { gameweek: true },
    });
    if (latest) {
      rows = await prisma.playerPrediction.findMany({
        where: { season: CURRENT_SEASON, gameweek: latest.gameweek },
        orderBy: { xPts: 'desc' },
        take: 60,
      });
    }
  } catch {
    latest = null;
    rows = [];
  }

  // Predictions store `playerFplId`; resolve slugs so every name links into the
  // /players cluster. An empty map degrades the rows to plain text.
  const slugs = await getSlugsByFplId();

  const user = await getSessionUser();
  const premium = hasActivePremium(user);
  const gw = latest?.gameweek;
  const free = rows.slice(0, FREE_LIMIT);
  const locked = premium ? rows.slice(FREE_LIMIT) : rows.slice(FREE_LIMIT, FREE_LIMIT + 8);
  const topPick = free[0];

  const faqs = [
    {
      question: gw ? `Who should I captain in FPL Gameweek ${gw}?` : 'Who should I captain in FPL this gameweek?',
      answer: topPick
        ? `Our model's highest projected scorer this gameweek is ${topPick.webName} (${topPick.teamShort}) with ${topPick.xPts.toFixed(1)} expected points. The top captaincy candidates are the players at the top of the expected-points table, filtered for those nailed to start.`
        : 'Captaincy picks are ranked by expected points on this page once the gameweek predictions are generated.',
    },
    {
      question: 'How are FPL points predicted?',
      answer:
        'A self-learning ridge-regression model estimates each player’s expected points from recency-weighted form, expected minutes, underlying stats (xGI, xGC, BPS, saves, defensive contribution), fixture difficulty and opponent form. It re-fits every gameweek on real results, so predictions sharpen as the season progresses. Backtested full-season 2025/26 mean error was ~1.0 points per player.',
    },
    {
      question: 'Are these FPL predictions free?',
      answer:
        'The top projected scorers each gameweek are free. FPL Ranker Premium unlocks the full expected-points table, personalised captain and transfer suggestions for your own squad, and a premium gameweek newsletter.',
    },
  ];

  return (
    <div className="sportify-page">
      <BreadcrumbStructuredData items={[{ name: 'Home', path: '/' }, { name: 'Predictions', path: '/predictions' }]} />
      <FaqStructuredData items={faqs} />
      {gw && (
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `FPL Gameweek ${gw} predicted points`,
            url: absUrl('/predictions'),
            numberOfItems: free.length,
            itemListElement: free.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `${p.webName} (${p.teamShort})`,
            })),
          }}
        />
      )}

      <div className="pagebar pagebar--narrow">
        <div className="in">
          <Link href="/app" className="logo"><span className="bolt" />FPL RANKER</Link>
          <AccountControl email={user?.email} />
        </div>
      </div>

      <main className="wrap wrap--narrow">
        <header className="p-head p-head--left">
          <span className="kicker">{SITE_NAME} · AI predictions</span>
          <h1>{gw ? <>Gameweek {gw} <em>points predictions</em></> : <>FPL <em>points predictions</em></>}</h1>
          <p className="sub">
            Every player&rsquo;s expected points for the upcoming gameweek, ranked by our self-learning
            model. The top {FREE_LIMIT} are free — {premium ? 'you have the full table.' : 'unlock the full table and your personal captain picks with Premium.'}
          </p>
          {gw && (
            <div className="meta">
              <span className="tag">{CURRENT_SEASON.replace('-', '/')} · GW{gw}</span>
              <span className="mono">Refreshes hourly</span>
            </div>
          )}
        </header>

        {rows.length === 0 ? (
          <div className="empty-card">
            <span className="mono">{CURRENT_SEASON.replace('-', '/')} · predictions</span>
            <h2>Back soon</h2>
            <p>Predictions for the new season appear here once Gameweek 1 approaches. Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="ptable" role="table" aria-label="Top predicted scorers">
              <div className="pt-row head" role="row">
                <span>#</span><span>Player</span><span>Pos</span><span className="num-right">£</span><span className="num-right">xPts</span>
              </div>
              {free.map((p, i) => <PredRowView key={p.playerFplId} p={p} rank={i + 1} top={i === 0} slug={slugs.get(p.playerFplId)} />)}
            </div>

            {locked.length > 0 && (
              <div className="locked">
                <div className={`ptable${premium ? '' : ' blurred'}`} aria-hidden={!premium}>
                  {locked.map((p, i) => <PredRowView key={p.playerFplId} p={p} rank={FREE_LIMIT + i + 1} slug={slugs.get(p.playerFplId)} />)}
                </div>
                {!premium && (
                  <div className="lock-overlay">
                    <div>
                      <span className="ic" aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="10" width="16" height="10" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                      </span>
                      <h2>See every projected scorer</h2>
                      <p>Premium unlocks the full expected-points table and personalised captain &amp; transfer advice for your squad.</p>
                      <Link href="/premium" className="s-btn s-btn--red hex">Go premium</Link>
                      <span className="fine">From £15 · one-off · full season</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <h2 className="faq-h">FAQ</h2>
        <PredictionsFaq items={faqs} />

        <p className="footnote">
          Predictions are model estimates, not guarantees — single-gameweek FPL scores are high variance.{' '}
          <Link href="/players">Browse all players →</Link>{' · '}
          <Link href="/app">Open the app</Link> to analyse your own squad.
        </p>
      </main>
    </div>
  );
}

function PredRowView({ p, rank, top, slug }: { p: PredRow; rank: number; top?: boolean; slug?: string }) {
  return (
    <div className={`pt-row${top ? ' top' : ''}`} role="row">
      <span className="rk">{rank}</span>
      <span className="who">
        {/* Falls back to plain text when the slug can't be resolved, so a
            bootstrap failure never produces dead links. */}
        {slug
          ? <Link className="nm" href={`/players/${slug}`}>{p.webName}</Link>
          : <span className="nm">{p.webName}</span>}
        <span className="tm">{p.teamShort}</span>
      </span>
      <span className="pos tag tag--ghost">{POS[p.position]}</span>
      <span className="pr">{(p.price / 10).toFixed(1)}</span>
      <span className="xp">{p.xPts.toFixed(1)}</span>
    </div>
  );
}

function AccountControl({ email }: { email?: string }) {
  if (email) {
    return <Link href="/app" className="chip-badge" aria-label={`Account: ${email}`}>{email[0].toUpperCase()}</Link>;
  }
  return <Link href="/auth/login?next=/predictions" className="s-btn s-btn--ghost">Sign in</Link>;
}

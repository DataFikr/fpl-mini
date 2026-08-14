import type { Metadata } from 'next';
import Link from 'next/link';
import '@/app/_styles/sportify-pages.css';
import { getPlayersIndex, type PlayerIndexRow } from '@/lib/players';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { StructuredData, BreadcrumbStructuredData, FaqStructuredData } from '@/components/seo/structured-data';
import { PredictionsFaq } from '@/app/predictions/_faq';

export const revalidate = 21600; // 6h ISR — matches /players/[slug]

const SEASON = '2026/27';

const GROUPS: { type: number; label: string; anchor: string }[] = [
  { type: 4, label: 'Forwards', anchor: 'forwards' },
  { type: 3, label: 'Midfielders', anchor: 'midfielders' },
  { type: 2, label: 'Defenders', anchor: 'defenders' },
  { type: 1, label: 'Goalkeepers', anchor: 'goalkeepers' },
];

export const metadata: Metadata = {
  title: `FPL Player Prices, Ownership & Predicted Points ${SEASON} | ${SITE_NAME}`,
  description: `Every major Fantasy Premier League player for ${SEASON} — current price, ownership, last-season points and our model's projected points for the next gameweek. Updated from the official FPL API.`,
  alternates: { canonical: `${SITE_URL}/players` },
  openGraph: {
    title: `FPL Player Prices & Predicted Points ${SEASON}`,
    description: `Prices, ownership and projected points for every major FPL player in ${SEASON}.`,
    url: `${SITE_URL}/players`,
  },
};

function PlayerTable({ rows, label }: { rows: PlayerIndexRow[]; label: string }) {
  return (
    <div className="ptable" role="table" aria-label={`${label} — price, ownership and projected points`}>
      <div className="pt-row head" role="row">
        <span>#</span><span>Player</span><span>Own</span>
        <span className="num-right">£</span><span className="num-right">xPts</span>
      </div>
      {rows.map((p, i) => (
        <div className="pt-row" role="row" key={p.slug}>
          <span className="rk">{i + 1}</span>
          <span className="who">
            <Link className="nm" href={`/players/${p.slug}`}>{p.webName}</Link>
            <span className="tm">{p.teamShort}</span>
          </span>
          <span className="pos tag tag--ghost">{p.ownership}%</span>
          <span className="pr">{p.price}</span>
          <span className="xp">{p.xPts}</span>
        </div>
      ))}
    </div>
  );
}

export default async function PlayersHub() {
  const all = await getPlayersIndex(200);
  const nonEmpty = GROUPS.map((g) => ({ ...g, rows: all.filter((p) => p.elementType === g.type) }))
    .filter((g) => g.rows.length > 0);

  const faqs = [
    {
      question: 'How often do FPL player prices update?',
      answer:
        'Fantasy Premier League adjusts prices daily, driven by net transfers in and out. The prices here come from the official FPL API and refresh every six hours, so a player who rose overnight shows their new price the same day.',
    },
    {
      question: 'What does xPts mean on these pages?',
      answer:
        'xPts is our model’s projected points for the player’s next gameweek, built from minutes certainty, underlying attacking and defensive numbers, and fixture difficulty. It is an estimate rather than a guarantee — single-gameweek FPL scores are high variance.',
    },
    {
      question: 'Which players get a page on FPL Ranker?',
      answer:
        `The ${all.length} most-owned players in Fantasy Premier League each have a page covering price, ownership, last-season output, recent form, upcoming fixture difficulty and projected points.`,
    },
    {
      question: 'Is high ownership a reason to buy a player?',
      answer:
        'Not on its own. High ownership tells you what the template looks like — it is a risk measure, not a quality measure. Owning a highly-owned player protects your rank when they haul; owning a low-ownership differential is how you climb. The projected points column is the better buy signal.',
    },
  ];

  return (
    <div className="sportify-page">
      <BreadcrumbStructuredData items={[{ name: 'Home', path: '/' }, { name: 'Players', path: '/players' }]} />
      <FaqStructuredData items={faqs} />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `FPL Player Prices & Predicted Points ${SEASON}`,
          url: `${SITE_URL}/players`,
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: all.length,
            itemListElement: all.slice(0, 100).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: p.webName,
              url: `${SITE_URL}/players/${p.slug}`,
            })),
          },
        }}
      />

      <div className="pagebar pagebar--narrow">
        <div className="in">
          <Link href="/app" className="logo"><span className="bolt" />FPL RANKER</Link>
          {/* Search visitors land here outside the app shell with no bottom nav.
              The predictions table is still linked from the footnote below. */}
          <Link href="/app/players" className="s-btn s-btn--ghost">Open the app</Link>
        </div>
      </div>

      <main className="wrap wrap--narrow">
        <p className="crumb"><Link href="/app">Home</Link> / Players</p>

        <header className="p-head p-head--left">
          <span className="kicker">{SITE_NAME} · player database</span>
          <h1>FPL <em>players</em> {SEASON}</h1>
          <p className="sub">
            Price, ownership and projected points for the {all.length} most-owned players in Fantasy
            Premier League. Every name links to a full page with recent form, fixture difficulty and a
            captaincy verdict.
          </p>
          <div className="meta"><span className="tag">{SEASON}</span><span className="mono">Refreshes every 6 hours</span></div>
        </header>

        {nonEmpty.length === 0 ? (
          <div className="empty-card">
            <span className="mono">players</span>
            <h2>Back soon</h2>
            <p>The player list appears once the official Fantasy Premier League data for {SEASON} is available.</p>
          </div>
        ) : (
          <>
            <nav className="chip-nav" aria-label="Jump to position">
              {nonEmpty.map((g) => (
                <a key={g.anchor} href={`#${g.anchor}`} className="tag tag--ghost">{g.label} ({g.rows.length})</a>
              ))}
            </nav>

            {nonEmpty.map((g) => (
              <section key={g.anchor} id={g.anchor} className="pos-block">
                <h2 className="faq-h">{g.label}</h2>
                <PlayerTable rows={g.rows} label={g.label} />
              </section>
            ))}
          </>
        )}

        <section className="teaser on-ink" style={{ marginTop: 28 }}>
          <div>
            <h2>Which of these belong in YOUR squad?</h2>
            <p>This list ranks every player overall. Premium ranks them against your own 15 and tells you who to captain, bench and sell.</p>
          </div>
          <Link href="/premium" className="s-btn s-btn--red hex">Go premium</Link>
        </section>

        <h2 className="faq-h">FPL players FAQ</h2>
        <PredictionsFaq items={faqs} />

        <p className="footnote">
          Stats from the official FPL API, updated daily. Predictions are model estimates, not guarantees.{' '}
          <Link href="/predictions">See the full predicted-points table →</Link>
        </p>
      </main>
    </div>
  );
}

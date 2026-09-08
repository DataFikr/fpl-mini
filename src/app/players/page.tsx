import type { Metadata } from 'next';
import Link from 'next/link';
import '@/app/_styles/sportify-pages.css';
import { PremiumCta } from '@/components/ui/premium-cta';
import { TeamEntryPrompt } from '@/components/ui/team-entry-prompt';
import { KitbagStrip } from '@/components/ui/kitbag-strip';
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
            {/* prefetch={false}: this table renders 200 rows, and Next prefetches
                every Link that scrolls into view. One visitor scrolling the list fired
                183 RSC requests in 40s — 77% of an hour's traffic and 59% of its
                function compute — and because half came back STALE, each one also
                triggered an on-demand ISR render that calls the FPL API. */}
            <Link className="nm" prefetch={false} href={`/players/${p.slug}`}>{p.webName}</Link>
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

        {/* Primary next-click. This page ranked (68 views) and then leaked 67.5%
            of them, because the only thing under the table was a "Go premium"
            ask aimed at anonymous visitors ~20 seconds old. Team entry is the
            step that actually converts, and it routes into the pages that
            retain rather than the one that sells. */}
        <TeamEntryPrompt
          placement="players_prices"
          kicker="Your squad, ranked"
          heading="Which of these are in YOUR squad?"
          body="This table ranks every player overall. Enter your team ID to see the same numbers against your own 15 — who to captain, who to bench, who to sell."
          cta="Rank my squad"
        />

        <section className="teaser on-ink" style={{ marginTop: 28 }}>
          <div>
            <h2>Want the model&rsquo;s call, not just the table?</h2>
            <p>Premium ranks every player against your own 15 each gameweek and names the captain, the transfer and the bench.</p>
          </div>
          <PremiumCta placement="players_teaser" feature="squad_ranking">Go premium</PremiumCta>
        </section>

        {/* The most-viewed non-landing page on the site and it carried no
            affiliate placement, while /app/kits (6 views) did. Clubs come from
            the table above, so it matches whatever the reader was just scanning. */}
        <KitbagStrip teamShorts={all.map((p) => p.teamShort)} placement="players_index" />

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

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '@/app/_styles/sportify-pages.css';
import { getGameweekCaptains } from '@/lib/players';
import { SITE_URL, SITE_NAME, absUrl } from '@/lib/seo';
import { StructuredData, BreadcrumbStructuredData, FaqStructuredData } from '@/components/seo/structured-data';
import { PredictionsFaq } from '@/app/predictions/_faq';

export const revalidate = 21600; // 6h ISR
export const dynamicParams = true;

const SEASON = '2026/27';
const parseGw = (s: string) => { const n = parseInt(s, 10); return Number.isFinite(n) && n >= 1 && n <= 38 ? n : null; };

export async function generateMetadata({ params }: { params: Promise<{ gw: string }> }): Promise<Metadata> {
  const { gw } = await params;
  const n = parseGw(gw);
  if (!n) return { title: 'Gameweek not found | FPL Ranker' };
  const title = `FPL Gameweek ${n} Captaincy — Who to Captain (${SEASON})`;
  const description = `The best FPL captain picks for Gameweek ${n}, ranked by our model's projected points. Top differentials, template captains and fixtures for GW${n}.`;
  return { title: `${title} | FPL Ranker`, description, alternates: { canonical: `${SITE_URL}/gameweek/${n}/captaincy` }, openGraph: { title, description, url: `${SITE_URL}/gameweek/${n}/captaincy` } };
}

export default async function GameweekCaptaincyPage({ params }: { params: Promise<{ gw: string }> }) {
  const { gw } = await params;
  const n = parseGw(gw);
  if (!n) notFound();
  const picks = await getGameweekCaptains(n, 12);
  const top = picks[0];

  const faqs = [
    {
      question: `Who should I captain in FPL Gameweek ${n}?`,
      answer: top
        ? `Our model's top projected captain for GW${n} is ${top.webName} (${top.teamShort}) with about ${top.xPts} points${top.opp ? ` v ${top.opp} (${top.home ? 'H' : 'A'})` : ''}. The full ranked list is below; Premium ranks these against your own squad.`
        : `Captain picks for GW${n} appear here once the projections are generated.`,
    },
    {
      question: `How are these GW${n} captain picks ranked?`,
      answer: 'Each player is scored by expected points — recent form, expected minutes, fixture difficulty and opponent strength — from our self-learning model, which re-fits every gameweek on real results.',
    },
  ];

  return (
    <div className="sportify-page">
      <BreadcrumbStructuredData items={[{ name: 'Home', path: '/' }, { name: 'Predictions', path: '/predictions' }, { name: `GW${n} Captaincy`, path: `/gameweek/${n}/captaincy` }]} />
      <FaqStructuredData items={faqs} />
      {picks.length > 0 && (
        <StructuredData data={{
          '@context': 'https://schema.org', '@type': 'ItemList',
          name: `FPL Gameweek ${n} captain picks`, url: absUrl(`/gameweek/${n}/captaincy`),
          numberOfItems: picks.length,
          itemListElement: picks.map((p) => ({ '@type': 'ListItem', position: p.rank, name: `${p.webName} (${p.teamShort})` })),
        }} />
      )}

      <div className="pagebar pagebar--narrow">
        <div className="in">
          <Link href="/app" className="logo"><span className="bolt" />FPL RANKER</Link>
          {/* Reverse link into the app shell; the predictions table is still
              linked from the footnote below. */}
          <Link href="/app/players" className="s-btn s-btn--ghost">Open the app</Link>
        </div>
      </div>

      <main className="wrap wrap--narrow">
        <header className="p-head p-head--left">
          <span className="kicker">{SITE_NAME} · AI captaincy</span>
          <h1>Gameweek {n} <em>captain picks</em></h1>
          <p className="sub">The best players to captain in GW{n}, ranked by projected points from our self-learning model. Premium ranks these against your own 15.</p>
          <div className="meta"><span className="tag">{SEASON} · GW{n}</span><span className="mono">Refreshes hourly</span></div>
        </header>

        {picks.length === 0 ? (
          <div className="empty-card"><span className="mono">GW{n} · captaincy</span><h2>Back soon</h2><p>Captain picks for GW{n} appear once the projections are generated.</p></div>
        ) : (
          <div className="ptable" role="table" aria-label={`Top captain picks, Gameweek ${n}`}>
            <div className="pt-row head" role="row">
              <span>#</span><span>Player</span><span>Opp</span><span className="num-right">£</span><span className="num-right">xPts</span>
            </div>
            {picks.map((p) => (
              <div className={`pt-row${p.rank === 1 ? ' top' : ''}`} role="row" key={p.slug}>
                <span className="rk">{p.rank}</span>
                <span className="who"><Link className="nm" href={`/players/${p.slug}`}>{p.webName}</Link><span className="tm">{p.teamShort}</span></span>
                <span className="pos tag tag--ghost">{p.opp} {p.home ? '(H)' : '(A)'}</span>
                <span className="pr">{p.price}</span>
                <span className="xp">{p.xPts}</span>
              </div>
            ))}
          </div>
        )}

        <section className="teaser on-ink" style={{ marginTop: 24 }}>
          <div>
            <h2>Captain the right player for YOUR squad</h2>
            <p>These are the best picks overall. Premium ranks them against your own 15 and flags the safest vice.</p>
          </div>
          <Link href="/premium" className="s-btn s-btn--red hex">Go premium</Link>
        </section>

        <h2 className="faq-h">GW{n} Captaincy FAQ</h2>
        <PredictionsFaq items={faqs} />

        <p className="footnote">Predictions are model estimates, not guarantees — single-gameweek FPL scores are high variance. <Link href="/predictions">See the full predicted-points table →</Link></p>
      </main>
    </div>
  );
}

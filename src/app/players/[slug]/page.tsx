import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '@/app/_styles/sportify-pages.css';
import { getPlayerData, getTopPlayerSlugs } from '@/lib/players';
import { getKitbagUrl } from '@/utils/kitbag-urls';
import { AffiliateLink } from '@/components/ui/affiliate-link';
import { SITE_URL, SITE_NAME, absUrl } from '@/lib/seo';
import { StructuredData, BreadcrumbStructuredData, FaqStructuredData } from '@/components/seo/structured-data';
import { PredictionsFaq } from '@/app/predictions/_faq';

export const revalidate = 21600; // 6h ISR
export const dynamicParams = true;

const SEASON = '2026/27';

export async function generateStaticParams() {
  // Pre-render the most-owned players; the long tail (sitemap lists 200) renders
  // on demand via ISR + dynamicParams — keeps the build fast and API-friendly.
  const slugs = await getTopPlayerSlugs(40);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPlayerData(slug);
  if (!p) return { title: 'Player not found | FPL Ranker' };
  const title = `${p.name} FPL ${SEASON} — Price £${p.price}m, Form, Fixtures & Predicted Points`;
  const description = `${p.name} (${p.teamShort}, ${p.position}) FPL ${SEASON}: £${p.price}m, owned by ${p.ownership}%, ${p.totalPoints} pts last season at ${p.ppg}/match. Projected ${p.xPts} pts for GW${p.gw + 1}, next fixtures and captaincy verdict.`;
  return {
    title: `${title} | FPL Ranker`,
    description,
    alternates: { canonical: `${SITE_URL}/players/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/players/${slug}` },
  };
}

function fdrClass(d: number) { return d <= 1 ? 'd1' : d === 2 ? 'd2' : d === 3 ? 'd3' : 'd4'; }

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPlayerData(slug);
  if (!p) notFound();

  const nextGw = p.gw + 1;
  const firstFix = p.nextFixtures[0];
  const maxForm = Math.max(1, ...p.recentForm.map((f) => f.pts));
  const bestForm = Math.max(...p.recentForm.map((f) => f.pts), -1);

  const faqs = [
    {
      question: `Is ${p.webName} worth £${p.price}m in FPL ${SEASON}?`,
      answer: `${p.webName} scored ${p.totalPoints} points at ${p.ppg} per match, with ${p.goals} goals and ${p.assists} assists. At £${p.price}m and ${p.ownership}% ownership, our model rates the price against his projected ${p.xPts} points for GW${nextGw} — a fair pick for managers who can fit him without weakening the rest of the squad.`,
    },
    {
      question: `What is ${p.webName}'s predicted score this gameweek?`,
      answer: `Our self-learning model projects ${p.webName} for about ${p.xPts} points in GW${nextGw}${firstFix ? ` at home or away to ${firstFix.opp} (${firstFix.home ? 'H' : 'A'}, difficulty ${firstFix.diff})` : ''}. Predictions refresh as team news and prices change.`,
    },
    {
      question: `Should I captain ${p.webName} in GW${nextGw}?`,
      answer: `Captaincy depends on your own 15. Premium ranks ${p.webName} against every player in your squad by expected points, and flags the safest vice-captain. See the full predicted-points table on the predictions page.`,
    },
  ];

  const personLd = {
    '@context': 'https://schema.org', '@type': 'Person',
    name: p.name, jobTitle: `${p.position} — ${p.teamName}`,
    affiliation: { '@type': 'SportsTeam', name: p.teamName },
    url: absUrl(`/players/${p.slug}`),
  };

  return (
    <div className="sportify-page">
      <BreadcrumbStructuredData items={[{ name: 'Home', path: '/' }, { name: 'Players', path: '/players' }, { name: p.name, path: `/players/${p.slug}` }]} />
      <FaqStructuredData items={faqs} />
      <StructuredData data={personLd} />

      <div className="pagebar">
        <div className="in">
          <Link href="/app" className="logo"><span className="bolt" />FPL RANKER</Link>
          <Link href="/app" className="s-btn s-btn--ghost">Open the app</Link>
        </div>
      </div>

      <main className="wrap wide">
        <p className="crumb"><Link href="/predictions">Players</Link> / {p.name}</p>

        <section className="p-hero on-ink">
          <span className="red-slab" />
          <div className="in">
            <div>
              <span className="kick">{p.teamName} · {p.position} · {SEASON}</span>
              <h1>{p.webName.toUpperCase()}</h1>
              <div className="chips">
                <span className="tag tag--ghost">£{p.price}m</span>
                <span className="tag tag--ghost">Owned by {p.ownership}%</span>
                {firstFix && <span className="tag tag--ghost">GW{firstFix.gw} v {firstFix.short} ({firstFix.home ? 'H' : 'A'})</span>}
              </div>
            </div>
            <div className="xp">
              <div className="v">{p.xPts}</div>
              <div className="l">GW{nextGw} xPts · model</div>
            </div>
          </div>
        </section>

        <div className="stat-grid">
          <div className="stat"><div className="l">Total pts</div><div className="v">{p.totalPoints}</div></div>
          <div className="stat"><div className="l">{p.positionShort === 'GKP' || p.positionShort === 'DEF' ? 'Clean sheets' : 'Goals'}</div><div className="v">{p.positionShort === 'GKP' || p.positionShort === 'DEF' ? p.cleanSheets : p.goals}</div></div>
          <div className="stat"><div className="l">Assists</div><div className="v">{p.assists}</div></div>
          <div className="stat"><div className="l">Pts / match</div><div className="v">{p.ppg}</div></div>
        </div>

        <div className="duo">
          <section className="panel">
            <h2>RECENT FORM</h2>
            {p.recentForm.length ? (
              <div className="form-row" role="img" aria-label={`Recent scores: ${p.recentForm.map((f) => f.pts).join(', ')}`}>
                {p.recentForm.map((f) => (
                  <div className={`form-col${f.pts === bestForm ? ' best' : ''}`} key={f.gw}>
                    <span className="pv">{f.pts}</span>
                    <span className="bar" style={{ height: `${Math.max(6, Math.round((f.pts / maxForm) * 100))}%` }} />
                    <span className="gw">GW{f.gw}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="panel-empty">Per-gameweek form appears here once the {SEASON} season is under way.</p>
            )}
          </section>
          <section className="panel">
            <h2>NEXT FIXTURES</h2>
            {p.nextFixtures.length ? (
              <div className="fdr">
                {p.nextFixtures.map((f) => (
                  <div className="fdr-row" key={f.gw}>
                    <span className="gw">GW{f.gw}</span>
                    <span className="op">{f.opp} ({f.home ? 'H' : 'A'})</span>
                    <span className={`d ${fdrClass(f.diff)}`}>{f.diff}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="panel-empty">Fixtures appear once the {SEASON} schedule is confirmed.</p>
            )}
          </section>
        </div>

        <section className="teaser on-ink">
          <div>
            <h2>Should you captain {p.webName} in GW{nextGw}?</h2>
            <p>Our model projects {p.xPts} points. Premium ranks {p.webName} against <em>your</em> squad’s options every gameweek.</p>
          </div>
          <Link href="/app/squad" className="s-btn s-btn--red hex">See my captain picks</Link>
        </section>

        <h2 className="faq-h">{p.webName.toUpperCase()} FAQ</h2>
        <PredictionsFaq items={faqs} />

        <aside className="kitbag">
          <span className="shirt" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3h8l2 3 3 2-3 4v9H6v-9L3 8l3-2 2-3Z" /></svg>
          </span>
          <div>
            <b>Get the {SEASON} {p.teamName} shirt</b>
            <small>Official kit from our partner Kitbag — shirts, printing and more.</small>
            <span className="fine">Affiliate link · supports {SITE_NAME}</span>
          </div>
          <AffiliateLink href={getKitbagUrl(p.teamId)} placement="player_page_kitbag" className="s-btn hex">Shop kit</AffiliateLink>
        </aside>

        <p className="footnote">
          Stats from the official FPL API, updated daily. Predictions are model estimates, not guarantees.{' '}
          <Link href="/predictions">See all player predictions →</Link>
        </p>
      </main>
    </div>
  );
}

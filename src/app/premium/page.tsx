import type { Metadata } from 'next';
import Link from 'next/link';
import '@/app/_styles/sportify-pages.css';
import { getSessionUser, hasActivePremium } from '@/lib/auth';
import { checkoutUrl, PRICING, LAUNCH_OFFER_ENDS } from '@/lib/billing';
import { PlanCta } from './_components/PlanCta';
import { isFreeLaunchWindow, FREE_WINDOW_GW, FREE_WINDOW_LABEL } from '@/lib/premium';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'FPL Ranker Premium — AI Captain & Transfer Picks',
  description:
    `See exactly which players your mini-league owns that you don’t, get rival transfer and captaincy alerts, and AI calls tuned to your own 15 — free for everyone until GW${FREE_WINDOW_GW}.`,
  alternates: { canonical: `${SITE_URL}/premium` },
};

/**
 * What premium is, in the order that decides whether anyone buys.
 *
 * The Sep 2026 diagnostic graded the old bundle 3/4 on the painkiller rubric: it
 * led with captain picks, transfer suggestions and the full prediction table —
 * all of which livefpl.net (3.2M visits) and fplgameweek.com (1.1M) give away
 * free. It failed *un-substitutable*, the test that decides whether someone
 * reaches for a card.
 *
 * The list now leads with the mini-league layer, which nobody at that scale
 * builds because per-league work does not scale for them. The generic tables
 * stay free: they are SEO surface and they feed the team-entry prompts.
 */
const FEATURES = [
  'Rival Watch: exactly which players your league owns that you don’t — and what it costs you',
  'Rival transfer and captaincy alerts across every mini-league you’re in',
  'Your differentials ranked by how much they can actually swing your league',
  'AI captain and transfer calls tuned to your own 15, every gameweek',
  'A premium gameweek newsletter with your personalised calls',
];

/** Kept free on purpose — commodity data that rivals already give away. */
const STAYS_FREE = [
  'The live mini-league table on matchday',
  'Player prices, ownership and the projected-points table',
  'Your squad, your leagues and the gameweek reports',
];

export default async function PremiumPage() {
  const user = await getSessionUser();
  const freeWindow = isFreeLaunchWindow();
  // During the free window everyone is "premium"; only treat as a paid holder
  // once the window has closed so the free-launch card takes precedence.
  const premium = !freeWindow && hasActivePremium(user);
  const launchLive = Date.now() < LAUNCH_OFFER_ENDS.getTime();
  const daysLeft = Math.max(0, Math.ceil((LAUNCH_OFFER_ENDS.getTime() - Date.now()) / 86_400_000));

  const seasonUrl = user ? checkoutUrl('season', { userId: user.id, email: user.email }) : null;
  const annualUrl = user ? checkoutUrl('annual', { userId: user.id, email: user.email }) : null;

  return (
    <div className="sportify-page">
      <div className="pagebar">
        <div className="in">
          <Link href="/app" className="logo"><span className="bolt" />FPL RANKER</Link>
          <AccountControl email={user?.email} />
        </div>
      </div>

      <main className="wrap">
        <header className="p-head">
          <span className="kicker">{SITE_NAME} Premium</span>
          <h1>Know what your <em>rivals</em> are doing</h1>
          <p className="sub">
            The tables and the live matchday scores stay free. Premium is the mini-league edge:
            which players <strong>your</strong> rivals own that you don&rsquo;t, what it costs you, and the
            captain and transfer calls tuned to your own 15.
          </p>
        </header>

        {freeWindow ? (
          <div className="prem-card on-ink">
            <span className="tag tag--yellow">{FREE_WINDOW_LABEL}</span>
            <h2>Premium is <em>free</em> for everyone right now</h2>
            <p>
              We&rsquo;ve put pricing on hold for launch. Rival Watch, the differential breakdown and
              the AI captain and transfer calls are unlocked for every manager through Gameweek {FREE_WINDOW_GW}
              while we validate the live data and retune the model. No card needed.
            </p>
            <div className="prem-cta">
              {user
                ? <Link href="/app/squad" className="s-btn s-btn--red hex">Open my squad</Link>
                : <Link href="/auth/login?next=/app/squad" className="s-btn s-btn--red hex">Sign up free</Link>}
              <span className="prem-note">Pricing returns after GW{FREE_WINDOW_GW} · sign up now to lock in your team</span>
            </div>
            <ul className="feats" style={{ marginTop: 22 }}>
              {FEATURES.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        ) : premium ? (
          <div className="prem-card on-ink">
            <span className="star" aria-hidden="true">★</span>
            <h2>You&rsquo;re premium</h2>
            <p>Thanks for backing {SITE_NAME}. Your AI picks are live across the app.</p>
            <Link href="/app/squad" className="s-btn s-btn--red hex">Open my squad</Link>
          </div>
        ) : (
          <>
            {launchLive && (
              <div className="offer" role="status">
                <span className="tag tag--yellow">Launch offer</span>
                <p>Season Pass is <strong>£15</strong> until 1 September, then £20.</p>
                <span className="count">Ends in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>
              </div>
            )}

            <div className="plans">
              <section className="plan plan--hi" aria-label={PRICING.season.name}>
                <span className="best tag tag--red">Best value</span>
                <span className="pname">{PRICING.season.name}</span>
                <div className="price">
                  <span className="v">{PRICING.season.price}</span>
                  {launchLive && <span className="was">£20</span>}
                </div>
                <span className="cad">{PRICING.season.cadence}</span>
                <p className="blurb">{PRICING.season.blurb}</p>
                <PlanCta plan="season" href={seasonUrl} loggedIn={!!user} variant="red" label="Get Season Pass" amount={PRICING.season.amount} />
              </section>

              <section className="plan" aria-label={PRICING.annual.name}>
                <span className="pname">{PRICING.annual.name}</span>
                <div className="price"><span className="v">{PRICING.annual.price}</span></div>
                <span className="cad">{PRICING.annual.cadence}</span>
                <p className="blurb">{PRICING.annual.blurb}</p>
                <PlanCta plan="annual" href={annualUrl} loggedIn={!!user} variant="navy" label="Get Annual" amount={PRICING.annual.amount} />
              </section>
            </div>

            <ul className="feats">
              {FEATURES.map((f) => <li key={f}>{f}</li>)}
            </ul>

            <div className="stays-free">
              <span className="sf-h">Always free</span>
              <ul>{STAYS_FREE.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>

            <p className="checkout-note">
              Secure checkout by Lemon Squeezy (our merchant of record — VAT handled). Cancel anytime.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function AccountControl({ email }: { email?: string }) {
  if (email) {
    return <Link href="/app" className="chip-badge" aria-label={`Account: ${email}`}>{email[0].toUpperCase()}</Link>;
  }
  return <Link href="/auth/login?next=/premium" className="s-btn s-btn--ghost">Sign in</Link>;
}

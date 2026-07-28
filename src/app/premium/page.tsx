import type { Metadata } from 'next';
import Link from 'next/link';
import '@/app/_styles/sportify-pages.css';
import { getSessionUser, hasActivePremium } from '@/lib/auth';
import { checkoutUrl, PRICING, LAUNCH_OFFER_ENDS } from '@/lib/billing';
import { isFreeLaunchWindow } from '@/lib/premium';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'FPL Ranker Premium — AI Captain & Transfer Picks',
  description:
    'AI captain picks, transfer suggestions, the full points-prediction table and a premium gameweek newsletter for your FPL mini-league — free for everyone until GW5.',
  alternates: { canonical: `${SITE_URL}/premium` },
};

const FEATURES = [
  'AI captain picks tuned to your own squad every gameweek',
  'Transfer suggestions ranked by expected points gain',
  'The full player points-prediction table (not just the top 10)',
  'Premium gameweek newsletter with your personalised calls',
  'Rival transfer alerts across your mini-leagues',
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
          <h1>Win your mini-league <em>with an AI edge</em></h1>
          <p className="sub">
            Everything you already love stays free. Premium adds the AI advisor: captain and
            transfer calls tuned to <strong>your</strong> squad, powered by our self-learning prediction model.
          </p>
        </header>

        {freeWindow ? (
          <div className="prem-card on-ink">
            <span className="tag tag--yellow">Free until GW5</span>
            <h2>Premium is <em>free</em> for everyone right now</h2>
            <p>
              We&rsquo;ve put pricing on hold for launch. AI captain picks, transfer suggestions and the
              full points-prediction table are unlocked for every manager through Gameweek 5 while we
              validate the live data and retune the model. No card needed.
            </p>
            <div className="prem-cta">
              {user
                ? <Link href="/app/squad" className="s-btn s-btn--red hex">Open my squad</Link>
                : <Link href="/auth/login?next=/app/squad" className="s-btn s-btn--red hex">Sign up free</Link>}
              <span className="prem-note">Pricing returns after GW5 · sign up now to lock in your team</span>
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
                <PlanCta plan="season" href={seasonUrl} loggedIn={!!user} variant="red" label="Get Season Pass" />
              </section>

              <section className="plan" aria-label={PRICING.annual.name}>
                <span className="pname">{PRICING.annual.name}</span>
                <div className="price"><span className="v">{PRICING.annual.price}</span></div>
                <span className="cad">{PRICING.annual.cadence}</span>
                <p className="blurb">{PRICING.annual.blurb}</p>
                <PlanCta plan="annual" href={annualUrl} loggedIn={!!user} variant="navy" label="Get Annual" />
              </section>
            </div>

            <ul className="feats">
              {FEATURES.map((f) => <li key={f}>{f}</li>)}
            </ul>

            <p className="checkout-note">
              Secure checkout by Lemon Squeezy (our merchant of record — VAT handled). Cancel anytime.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function PlanCta({ plan, href, loggedIn, variant, label }: {
  plan: 'season' | 'annual'; href: string | null; loggedIn: boolean; variant: 'red' | 'navy'; label: string;
}) {
  const cls = `s-btn s-btn--${variant} hex`;
  if (!loggedIn) return <Link href={`/auth/login?next=/premium`} className="s-btn s-btn--navy hex">Sign in to buy</Link>;
  if (href) return <a href={href} className={cls}>{label}</a>;
  return <span className={cls} style={{ opacity: 0.5, cursor: 'not-allowed' }} aria-disabled="true">Checkout unavailable</span>;
}

function AccountControl({ email }: { email?: string }) {
  if (email) {
    return <Link href="/app" className="chip-badge" aria-label={`Account: ${email}`}>{email[0].toUpperCase()}</Link>;
  }
  return <Link href="/auth/login?next=/premium" className="s-btn s-btn--ghost">Sign in</Link>;
}

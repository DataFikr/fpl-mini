'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PREDICT } from '../_lib/screen-data';
import type { PredictionData, PredRow } from '../_lib/prediction';
import { useAccount } from '@/lib/use-account';
import { trackPremiumGateClick } from '@/lib/analytics';
import { isFreeLaunchWindow } from '@/lib/premium';
import { PremiumFrame } from './PremiumFrame';
import { toast } from './Toast';

// Showcase unlock so the promo video can record the premium UI without a
// seeded premium account. Off in production.
const DEMO_UNLOCK = process.env.NEXT_PUBLIC_DEMO_PREMIUM === '1';

/**
 * Squad → Prediction tab (I4, the premium revenue product). Derives personalized
 * captain picks (your 15 ranked by expected points) and transfer suggestions
 * (in/out pairs ranked by xPts gain) from the squad projection. Mockups 06 & 07.
 *
 * Three states, not two — the middle one is the fix for the Sep 2026
 * diagnostic's most expensive finding:
 *
 *   locked   → blurred content + a gate naming what is withheld
 *   preview  → unlocked content inside a "premium, free right now" frame
 *   premium  → unlocked, unframed
 *
 * `use-account` forces `isPremium = true` for everyone during the launch free
 * window, so the locked state could never render and premium was visually
 * identical to the free tier. Every user was being taught the product is free,
 * with no exposure to what premium withholds, right up until the paywall drops.
 * The preview state keeps the content free while making the value and the price
 * legible — and it is what lets `premium_gate_click` fire from inside the app
 * at all, since entitlement alone cannot distinguish the two.
 */
export function PredictionBlock({ data, gw }: { data?: PredictionData; gw?: number }) {
  const router = useRouter();
  const P = data ?? (PREDICT as unknown as PredictionData);
  const { account } = useAccount();
  // The free window is a pure date check with no network dependency, so it is
  // read directly rather than via `account.isPremium`. Both say the same thing
  // (use-account forces isPremium true for everyone, including anonymous, while
  // the window is open) but the account arrives one fetch later — keying off it
  // would flash the locked gate at every visitor before flipping to the
  // preview, which is the opposite of what this state exists to teach.
  const freeWindow = isFreeLaunchWindow();
  const preview = freeWindow && !DEMO_UNLOCK;
  const entitled = freeWindow || !!account?.isPremium || DEMO_UNLOCK;
  const gwTag = gw ? `GW${gw}` : P.horizon;

  // Captain picks = your players ranked by projected points over the run.
  const captains = useMemo(() => [...P.rows].sort((a, b) => b.cxp - a.cxp).slice(0, 5), [P.rows]);
  // Transfer suggestions = flagged upgrades, ranked by projected gain.
  const transfers = useMemo(
    () => P.rows.filter((r) => r.act === 'transfer').sort((a, b) => (b.pxp - b.cxp) - (a.pxp - a.cxp)),
    [P.rows],
  );

  // Projected gain of the best available move. Shown (as a number) inside the
  // locked gate while the move itself stays hidden — the loss is the point.
  const gain = useMemo(() => {
    const best = transfers[0];
    if (!best) return 0;
    return Math.round((best.pxp - best.cxp) * 10) / 10;
  }, [transfers]);

  const topCxp = captains[0]?.cxp || 1;
  const conf = (cxp: number) => Math.max(35, Math.min(95, Math.round((cxp / topCxp) * 88)));

  const goPremium = (placement: string) => {
    trackPremiumGateClick(placement, 'prediction');
    router.push('/premium');
  };

  return (
    <>
      <p className="pred-note">
        Projected points = recent form × fixture difficulty × minutes certainty, over the {P.horizon.toLowerCase()}.
        {data ? '' : ' (demo)'}
      </p>

      {/* ── Captain Picks ─────────────────────────────────────────── */}
      <div className="lbl-row" style={{ marginTop: 14 }}>
        <span className="l">CAPTAIN PICKS</span>
        <span className="gwtag">{gwTag} · from your 15</span>
      </div>

      {entitled ? (
        <PremiumFrame
          on={preview}
          blurb={`Your captain pick for ${gwTag}, ranked from your own 15.`}
          onGo={() => goPremium('preview_captain_picks')}
        >
          <CaptainContent captains={captains} conf={conf} horizon={P.horizon} />
        </PremiumFrame>
      ) : (
        <div className="gate">
          <div className="blurred" aria-hidden="true">
            <CaptainContent captains={captains} conf={conf} horizon={P.horizon} viceless />
          </div>
          <div className="gate-overlay">
            <div className="gate-card">
              <span className="cbadge" aria-hidden="true">C</span>
              <h3>Your captain call is ready</h3>
              {/* Names the withheld thing and shows its value while hiding its
                  identity. A generic "upgrade" panel gives the user nothing to
                  feel the loss of; a number they cannot see does. */}
              <ul className="withheld">
                <li><span className="lk">Locked</span><span>Your GW{gwTag.replace('GW', '')} captain</span><span className="vv">{captains[0] ? `${captains[0].cxp} xP` : '—'}</span></li>
                <li><span className="lk">Locked</span><span>Safest vice</span><span className="vv">{captains[1] ? `${captains[1].cxp} xP` : '—'}</span></li>
                <li><span className="lk">Locked</span><span>All {P.rows.length} players ranked</span><span className="vv">every GW</span></li>
              </ul>
              <button className="s-btn s-btn--red hex" onClick={() => goPremium('captain_picks')}>Go premium</button>
              <span className="fine">From £15 · one-off · full season</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Transfer Suggestions ──────────────────────────────────── */}
      <div className="lbl-row" style={{ marginTop: 22 }}>
        <span className="l">TRANSFER SUGGESTIONS</span>
        <span className="gwtag">{gwTag}</span>
      </div>

      <div className="pred-bank">
        <div className="b"><span className="bl">Your XI now</span><span className="bv">{P.cur} xP</span></div>
        <div className="b"><span className="bl">Optimal XI</span><span className="bv red">{P.opt} xP</span></div>
      </div>

      {entitled ? (
        <PremiumFrame
          on={preview}
          blurb="Every in/out move for your squad, ranked by projected points gain."
          onGo={() => goPremium('preview_transfer_suggestions')}
        >
          <TransferContent transfers={transfers} />
        </PremiumFrame>
      ) : (
        <div className="gate">
          <div className="blurred" aria-hidden="true">
            <TransferContent transfers={transfers.length ? transfers : captains.slice(0, 2).map(fakeMove)} />
          </div>
          <div className="gate-overlay">
            <div className="gate-card">
              <span className="cbadge" aria-hidden="true" style={{ background: 'var(--red)', color: '#fff' }}>⇄</span>
              <h3>See your best transfers</h3>
              <ul className="withheld">
                <li><span className="lk">Locked</span><span>Your best transfer</span><span className="vv">{gain ? `+${gain} xP` : 'ranked'}</span></li>
                <li><span className="lk">Locked</span><span>Optimal XI gap</span><span className="vv">{Math.max(0, Math.round((P.opt - P.cur) * 10) / 10)} xP</span></li>
                <li><span className="lk">Locked</span><span>The reason for each move</span><span className="vv">every GW</span></li>
              </ul>
              <button className="s-btn s-btn--red hex" onClick={() => goPremium('transfer_suggestions')}>Go premium</button>
              <span className="fine">From £15 · one-off · full season</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CaptainContent({ captains, conf, horizon, viceless }: {
  captains: PredRow[]; conf: (n: number) => number; horizon: string; viceless?: boolean;
}) {
  const top = captains[0];
  if (!top) return <div className="ts-empty"><p>Enter a team to see your captain picks.</p></div>;
  const vice = captains[1];
  return (
    <>
      <article className="cap-hero">
        <span className="red-slab" />
        <div className="top">
          <span className="rk">01</span>
          <div className="who">
            <div className="nm">{top.cur}</div>
            <div className="fx">{top.tm} · proj. over {horizon.toLowerCase()}</div>
          </div>
          <div className="xp"><div className="v">{top.cxp}</div><div className="l">xPts</div></div>
        </div>
        <div className="conf">
          <div className="cl"><span>Model confidence</span><span>{conf(top.cxp)}%</span></div>
          <div className="track"><div className="fill" style={{ width: `${conf(top.cxp)}%` }} /></div>
        </div>
        <div className="band">
          <span className="cbadge" aria-hidden="true">C</span>
          <div><b>Our call: give {top.cur} the armband.</b><br /><small>Highest projected return in your squad this week.</small></div>
        </div>
      </article>

      {captains.slice(1).map((c, i) => (
        <div className="cap-row" key={`${c.cur}-${i}`}>
          <span className="rk">{String(i + 2).padStart(2, '0')}</span>
          <div className="who"><div className="nm">{c.cur}</div><div className="fx">{c.tm} · {c.pos}</div></div>
          <div className="cbar" role="img" aria-label={`Confidence ${conf(c.cxp)}%`}><div style={{ width: `${conf(c.cxp)}%` }} /></div>
          <div className="xp">{c.cxp}<small>xPts</small></div>
        </div>
      ))}

      {!viceless && vice && (
        <div className="vice-note">
          <span className="vb" aria-hidden="true">V</span>
          <span><strong>Vice:</strong> {vice.cur} — safest cover if {top.cur} is a late doubt. Team news lands ~1h before deadline.</span>
        </div>
      )}
    </>
  );
}

function TransferContent({ transfers }: { transfers: PredRow[] }) {
  if (!transfers.length) {
    return (
      <div className="ts-empty">
        <h4>No moves needed</h4>
        <p>Your squad is already close to optimal over the run — hold your transfers and bank them.</p>
      </div>
    );
  }
  return (
    <>
      {transfers.map((r, i) => {
        const f = r.factors;
        const delta = +(r.pxp - r.cxp).toFixed(1);
        const costUp = f ? f.inPrice > f.outPrice : false;
        const costDelta = f ? Math.abs(f.inPrice - f.outPrice).toFixed(1) : null;
        const tags: { t: string; warn?: boolean }[] = [];
        if (f && f.inMins >= 900) tags.push({ t: 'Nailed starter' });
        if (f) tags.push(f.inPrice <= f.outPrice ? { t: 'Fits budget' } : { t: 'Needs funds', warn: true });
        return (
          <article className="tcard" key={`${r.cur}-${i}`}>
            <div className="tcard-head">
              <span className="rk">MOVE {String(i + 1).padStart(2, '0')}</span>
              <span className="tcard-delta">+{delta} xPts / run</span>
            </div>
            <div className="ts-move">
              <div className="ts-side out">
                <span className="io"><span className="dot" />Out</span>
                <span className="nm">{r.cur}</span>
                <span className="mt">{r.tm}{f ? ` · £${f.outPrice.toFixed(1)}m` : ''}</span>
              </div>
              <span className="ts-arrow" aria-hidden="true">→</span>
              <div className="ts-side in">
                <span className="io"><span className="dot" />In</span>
                <span className="nm">{r.pick}</span>
                <span className="mt">{f?.pickTm || ''}{f ? ` · £${f.inPrice.toFixed(1)}m` : ''}</span>
              </div>
            </div>
            {f && (
              <div className="tcard-factors">
                <div className="tf"><div className="tf-l">Form</div><div className="tf-v"><b className={f.inForm >= f.outForm ? 'up' : 'dn'}>{f.inForm.toFixed(1)}</b> vs {f.outForm.toFixed(1)}</div></div>
                <div className="tf"><div className="tf-l">Minutes</div><div className="tf-v"><b className={f.inMins >= f.outMins ? 'up' : 'dn'}>{f.inMins}</b> vs {f.outMins}</div></div>
                <div className="tf"><div className="tf-l">Cost</div><div className="tf-v"><b className={costUp ? 'dn' : 'up'}>{costUp ? '-' : '+'}£{costDelta}m</b></div></div>
              </div>
            )}
            <p className="tcard-why" onClick={() => toast(r.why)}>{r.why}</p>
            <div className="tcard-tags">
              {tags.map((tg) => <span key={tg.t} className={`ttag${tg.warn ? ' ttag--warn' : ''}`}>{tg.t}</span>)}
            </div>
          </article>
        );
      })}
    </>
  );
}

/** Placeholder move built from a captain row, used only to fill the blurred free teaser. */
function fakeMove(r: PredRow): PredRow {
  return { ...r, act: 'transfer', pick: r.pick !== r.cur ? r.pick : 'Upgrade', pxp: r.cxp + 4 };
}

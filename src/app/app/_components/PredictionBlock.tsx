'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PREDICT } from '../_lib/screen-data';
import type { PredictionData, PredRow } from '../_lib/prediction';
import { useAccount } from '@/lib/use-account';
import { trackEvent } from '@/lib/analytics';
import { toast } from './Toast';

// Showcase unlock so the promo video can record the premium UI without a
// seeded premium account. Off in production.
const DEMO_UNLOCK = process.env.NEXT_PUBLIC_DEMO_PREMIUM === '1';

/**
 * Squad → Prediction tab (I4, the premium revenue product). Derives personalized
 * captain picks (your 15 ranked by expected points) and transfer suggestions
 * (in/out pairs ranked by xPts gain) from the squad projection. Premium unlocks
 * both; free/anonymous users see a blurred teaser + upsell. Mockups 06 & 07.
 */
export function PredictionBlock({ data, gw }: { data?: PredictionData; gw?: number }) {
  const router = useRouter();
  const P = data ?? (PREDICT as unknown as PredictionData);
  const { account } = useAccount();
  const premium = !!account?.isPremium || DEMO_UNLOCK;
  const gwTag = gw ? `GW${gw}` : P.horizon;

  // Captain picks = your players ranked by projected points over the run.
  const captains = useMemo(() => [...P.rows].sort((a, b) => b.cxp - a.cxp).slice(0, 5), [P.rows]);
  // Transfer suggestions = flagged upgrades, ranked by projected gain.
  const transfers = useMemo(
    () => P.rows.filter((r) => r.act === 'transfer').sort((a, b) => (b.pxp - b.cxp) - (a.pxp - a.cxp)),
    [P.rows],
  );

  const topCxp = captains[0]?.cxp || 1;
  const conf = (cxp: number) => Math.max(35, Math.min(95, Math.round((cxp / topCxp) * 88)));

  const goPremium = (placement: string) => {
    trackEvent('premium_gate_click', { placement, feature: 'prediction' });
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

      {premium ? (
        <CaptainContent captains={captains} conf={conf} horizon={P.horizon} />
      ) : (
        <div className="gate">
          <div className="blurred" aria-hidden="true">
            <CaptainContent captains={captains} conf={conf} horizon={P.horizon} viceless />
          </div>
          <div className="gate-overlay">
            <div className="gate-card">
              <span className="cbadge" aria-hidden="true">C</span>
              <h3>Your captain call is ready</h3>
              <p>The model has ranked all 15 of your players for {gwTag}. Premium unlocks your captain picks every gameweek.</p>
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

      {premium ? (
        <TransferContent transfers={transfers} />
      ) : (
        <div className="gate">
          <div className="blurred" aria-hidden="true">
            <TransferContent transfers={transfers.length ? transfers : captains.slice(0, 2).map(fakeMove)} />
          </div>
          <div className="gate-overlay">
            <div className="gate-card">
              <span className="cbadge" aria-hidden="true" style={{ background: 'var(--red)', color: '#fff' }}>⇄</span>
              <h3>See your best transfers</h3>
              <p>Premium ranks every in/out move for your squad by projected points gain — with the reasons why.</p>
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

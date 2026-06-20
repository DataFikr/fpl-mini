'use client';

import { PREDICT, ACT } from '../_lib/screen-data';
import type { PredictionData } from '../_lib/prediction';
import { toast } from './Toast';

export function PredictionBlock({ data }: { data?: PredictionData }) {
  // Live projection when supplied (Squad tab); mock fallback (Rank My Team).
  const P = data ?? PREDICT;
  return (
    <>
      <p className="pred-note">
        Projected points = recent form × fixture difficulty × minutes certainty, over the {P.horizon.toLowerCase()}.
        {data ? '' : ' (demo)'}
      </p>
      <div className="pred-sum">
        <div className="ps-col"><div className="l">Your XI now</div><div className="v">{P.cur}</div></div>
        <div className="ps-arrow">→</div>
        <div className="ps-col"><div className="l">Optimal XI</div><div className="v red">{P.opt}</div></div>
        <div className="ps-delta">+{P.opt - P.cur} pts</div>
      </div>
      <div className="pred-tbl">
        <div className="pr-row pr-head"><span>Current</span><span>Predicted pick</span><span>Action</span></div>
        {P.rows.map((r, idx) => {
          const same = r.pick === r.cur;
          const dlt = r.pxp - r.cxp;
          return (
            <div className="pr-row" key={idx} onClick={() => toast(r.why)}>
              <div className="pc">
                <span className="pos">{r.pos}</span>
                <div><div className="nm">{r.cur}</div><div className="mt">{r.tm} · {r.cxp} xP</div></div>
              </div>
              <div className="pc pick">
                <div>
                  <div className="nm">{r.pick}</div>
                  <div className="mt">
                    {same ? (r.act === 'keep' ? 'Best pick' : 'Hold & watch')
                      : <b className={dlt >= 0 ? 'up' : 'dn'}>{r.pxp} xP · {dlt >= 0 ? '+' : ''}{dlt}</b>}
                  </div>
                </div>
              </div>
              <div className="act"><span className={ACT[r.act][1]}>{ACT[r.act][0]}</span></div>
            </div>
          );
        })}
      </div>
    </>
  );
}

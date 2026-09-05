'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActiveTeamId } from '@/lib/use-account';
import { trackEvent } from '@/lib/analytics';

interface LiveManager {
  entry: number;
  name: string;
  manager: string;
  storedRank: number;
  liveRank: number;
  rankDelta: number;
  livePoints: number;
  liveTotal: number;
  gapToAbove: number;
  played: number;
  remaining: number;
  captain: string;
  isYou: boolean;
}

interface LiveData {
  leagueName: string;
  gw: number;
  provisional: boolean;
  updated: string;
  managers: LiveManager[];
}

/** Poll cadence while the page is open and visible. Matches settle slowly; 60s is plenty. */
const POLL_MS = 60_000;

/**
 * The live mini-league table — the matchday surface.
 *
 * Built for the cohort the Sep 2026 diagnostic identified as the deepest and
 * least served: Sunday sessions ran 113s against the pre-deadline peak's 26.7s,
 * with nothing to open. Everything here is framed as movement against the people
 * in your league, because that is the part the official app cannot show you.
 */
export function LiveLeagueScreen({ leagueId }: { leagueId: number }) {
  const search = useSearchParams();
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const tracked = useRef(false);

  const teamId = search.get('teamId') || getActiveTeamId() || '';

  const load = useCallback(async () => {
    try {
      const q = teamId ? `?teamId=${teamId}` : '';
      const res = await fetch(`/api/leagues/${leagueId}/live${q}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
      setErr(false);
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }, [leagueId, teamId]);

  useEffect(() => {
    load();
    if (!tracked.current) {
      trackEvent('live_view', { league_id: String(leagueId) });
      tracked.current = true;
    }
    // Polling pauses when the tab is hidden: a backgrounded matchday tab would
    // otherwise keep hitting the FPL API for hours.
    const tick = () => { if (document.visibilityState === 'visible') load(); };
    const t = setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', tick); };
  }, [load, leagueId]);

  if (loading) {
    return (
      <div className="sk-list" role="status" aria-label="Loading the live table">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="sk-row" key={i}>
            <span className="sk sk-blk h20" /><span className="sk sk-blk w60" /><span className="sk sk-blk w40" />
          </div>
        ))}
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="info-card">
        <h3>Live table unavailable</h3>
        <p>Couldn&rsquo;t load this league&rsquo;s live scores right now. Try again in a minute.</p>
      </div>
    );
  }

  const you = data.managers.find((m) => m.isYou);

  return (
    <>
      <div className="lbl-row">
        <span className="l">LIVE · GW{data.gw}</span>
        <span className="live"><span className="dot" />{data.provisional ? 'In play' : 'Final'}</span>
      </div>
      <p className="tp-intro">
        <b>{data.leagueName}</b> as it stands right now — live points, live positions.
        {data.provisional && ' Bonus is provisional until every fixture finishes.'}
      </p>

      {/* Your own line, pulled out of the table: the answer to the question that
          made someone open this page during a match. */}
      {you && (
        <div className="live-you">
          <div className="ly-rank">
            <span className="v">{ordinal(you.liveRank)}</span>
            <span className="l">of {data.managers.length}</span>
          </div>
          <div className="ly-mid">
            <div className="nm">{you.name}</div>
            <div className="mv">
              {you.rankDelta > 0 && <span className="up">▲ up {you.rankDelta}</span>}
              {you.rankDelta < 0 && <span className="dn">▼ down {Math.abs(you.rankDelta)}</span>}
              {you.rankDelta === 0 && <span className="fl">— no change</span>}
              {you.remaining > 0 && <span className="rem">{you.remaining} still to play</span>}
            </div>
          </div>
          <div className="ly-pts"><span className="v">{you.livePoints}</span><span className="l">GW pts</span></div>
        </div>
      )}

      {you && you.liveRank > 1 && (
        <p className="live-chase">
          <b>{you.gapToAbove} point{you.gapToAbove === 1 ? '' : 's'}</b> from{' '}
          {data.managers[you.liveRank - 2]?.name ?? 'the place above'}.
        </p>
      )}

      <div className="live-list">
        {data.managers.map((m) => (
          <div className={`live-row${m.isYou ? ' me' : ''}`} key={m.entry}>
            <span className="lr-rk">{m.liveRank}</span>
            <span className={`lr-mv ${m.rankDelta > 0 ? 'up' : m.rankDelta < 0 ? 'dn' : 'fl'}`}>
              {m.rankDelta > 0 ? `▲${m.rankDelta}` : m.rankDelta < 0 ? `▼${Math.abs(m.rankDelta)}` : '—'}
            </span>
            <div className="lr-who">
              <div className="nm">{m.name}</div>
              <div className="cl">
                {m.manager}
                {m.captain && <> · <span className="cap">(C) {m.captain}</span></>}
                {m.remaining > 0 && <> · {m.remaining} to play</>}
              </div>
            </div>
            <span className="lr-gw">{m.livePoints}</span>
            <span className="lr-tot">{m.liveTotal}</span>
          </div>
        ))}
      </div>

      <p className="live-foot">
        Updates every minute while this tab is open · last refreshed{' '}
        {new Date(data.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

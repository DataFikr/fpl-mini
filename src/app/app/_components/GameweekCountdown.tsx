'use client';

import { useEffect, useState } from 'react';

/**
 * Countdown to the Gameweek 1 deadline.
 *
 * The deadline is fetched from /api/gameweek/current (live FPL bootstrap) and
 * falls back to the published GW1 deadline if that call fails. Once the season
 * is under way the whole block disappears — it only speaks to the pre-season
 * gap, where the app has no live data to show and the demo league is the way
 * to understand what FPL Ranker does.
 */

/** Published GW1 2026/27 deadline. Only used if the API is unreachable. */
const GW1_FALLBACK = '2026-08-21T17:30:00Z';

/**
 * True while the real 2026/27 season has not kicked off.
 *
 * Callers need this because `/api/gameweek/current` reports the *demo* season
 * (2025/26, GW20) whenever FPL_DEMO_SEASON is set — so the gameweek number
 * coming back from the API cannot be used to decide whether football is on.
 */
export const isBeforeGameweek1 = () => Date.now() < new Date(GW1_FALLBACK).getTime();

interface Remaining { days: number; hours: number; minutes: number; seconds: number; done: boolean }

function remainingUntil(target: number): Remaining {
  const ms = target - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function GameweekCountdown({ onTryDemo }: { onTryDemo?: () => void }) {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [gwNumber, setGwNumber] = useState<number>(1);
  const [left, setLeft] = useState<Remaining | null>(null);

  useEffect(() => {
    let alive = true;
    const fallback = new Date(GW1_FALLBACK).getTime();

    fetch('/api/gameweek/current')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        // Only trust the API deadline if it is actually in the future. Under
        // FPL_DEMO_SEASON the bootstrap serves 2025/26 snapshots whose deadlines
        // are all in the past — without this check the demo data would suppress
        // the countdown on the real site.
        const fromApi = d?.nextDeadline ? new Date(d.nextDeadline).getTime() : NaN;
        if (Number.isFinite(fromApi) && fromApi > Date.now()) {
          setDeadline(fromApi);
          if (d?.nextGameweek) setGwNumber(d.nextGameweek);
        } else {
          setDeadline(fallback);
        }
      })
      .catch(() => { if (alive) setDeadline(fallback); });

    return () => { alive = false; };
  }, []);

  // Tick only once a deadline is known, and stop as soon as it passes.
  useEffect(() => {
    if (deadline == null) return;
    const tick = () => setLeft(remainingUntil(deadline));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  // Nothing to show once the deadline passes. Rendering null until `left` exists
  // also avoids a server/client hydration mismatch, since the value depends on
  // the current clock.
  if (!left || left.done) return null;

  const unit = (value: string, label: string) => (
    <div className="gwc-unit">
      <span className="gwc-num">{value}</span>
      <span className="gwc-lbl">{label}</span>
    </div>
  );

  return (
    <div className="gwc" role="timer" aria-live="off">
      <div className="gwc-head">
        <span className="dot" />
        Gameweek {gwNumber} deadline
      </div>

      <div className="gwc-clock">
        {unit(String(left.days), left.days === 1 ? 'day' : 'days')}
        <span className="gwc-sep">:</span>
        {unit(pad(left.hours), 'hours')}
        <span className="gwc-sep">:</span>
        {unit(pad(left.minutes), 'minutes')}
        <span className="gwc-sep">:</span>
        {unit(pad(left.seconds), 'seconds')}
      </div>

      <p className="gwc-note">
        While GW{gwNumber} is loading, take a look at the{' '}
        {onTryDemo
          ? <a onClick={onTryDemo} role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTryDemo(); } }}>demo data</a>
          : <span>demo data</span>}{' '}
        to understand what FPL Ranker can do for your mini-league.
      </p>
    </div>
  );
}

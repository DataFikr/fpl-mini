'use client';

import { useEffect, useState } from 'react';

/**
 * Countdown to the Gameweek 1 deadline.
 *
 * The deadline is fetched from /api/gameweek/current (live FPL bootstrap) and
 * falls back to the published GW1 deadline if that call fails. Once the season
 * is under way the whole block disappears — it only speaks to the pre-season
 * gap, where no gameweek has been scored yet and there is nothing live to show.
 */

/** Published GW1 2026/27 deadline. Only used if the API is unreachable. */
const GW1_FALLBACK = '2026-08-21T17:30:00Z';

/**
 * True while the real 2026/27 season has not kicked off.
 *
 * Callers need this because the API reports gameweek 1 as "current" from the
 * moment the season is created — the gameweek number alone cannot tell you
 * whether football has actually been played.
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

export function GameweekCountdown() {
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
        // Only trust the API deadline if it is actually in the future — a stale
        // or past deadline from the API must not suppress the countdown.
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
        Enter your team ID now — your league&rsquo;s headlines, rank movers and
        predictions go live the moment GW{gwNumber} is scored.
      </p>
    </div>
  );
}

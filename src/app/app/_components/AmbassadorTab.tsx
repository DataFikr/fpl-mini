'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { standingsAt } from '../_lib/compute';
import type { AppManager } from '../_lib/league-data';
import { useAccount } from '@/lib/use-account';
import { trackEvent } from '@/lib/analytics';
import { toast } from './Toast';

/**
 * Ambassador — the full roster of FPL team IDs in a mini-league, exportable.
 *
 * Answers a question the official Fantasy site cannot: "what are the team IDs of
 * everyone in my league?" The official standings page shows names and links but
 * never the IDs as a list, so people copy them one at a time out of the URL bar.
 *
 * Signed-in only. Not a paywall — a roster of manager names + IDs is exactly the
 * kind of page that should not be anonymously scrapeable in bulk, and an
 * ambassador exporting their own league is a named person doing it.
 */

const csvCell = (v: string | number) => {
  const s = String(v ?? '');
  // Escape per RFC 4180, and neutralise leading =/+/-/@ so a team name cannot
  // execute as a formula when the CSV is opened in Excel or Sheets.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function AmbassadorTab({
  managers, gw, leagueId, leagueName, focusId, gwSelect,
}: {
  managers: AppManager[];
  gw: number;
  leagueId: number;
  leagueName: string;
  focusId: number | null;
  gwSelect: React.ReactNode;
}) {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => standingsAt(managers, gw), [managers, gw]);
  const site = typeof window !== 'undefined' ? window.location.origin : 'https://fplranker.com';

  const download = () => {
    const header = ['Rank', 'Team Name', 'Manager', 'FPL Team ID', 'Total Points', `GW${gw} Points`, 'Official FPL Team', 'FPL Ranker Insight'];
    const body = rows.map((r) => [
      r.rank, r.team, r.mgr, r.id, r.total, r.gw,
      `https://fantasy.premierleague.com/entry/${r.id}/event/${gw}`,
      `${site}/app/squad?teamId=${r.id}`,
    ]);
    // BOM so Excel reads UTF-8 team names (accents, emoji) correctly.
    const csv = '﻿' + [header, ...body].map((line) => line.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${leagueName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-team-ids.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    trackEvent('ambassador_export', { league_id: String(leagueId), managers: String(rows.length) });
    toast(`Exported ${rows.length} team IDs`);
  };

  const copyIds = async () => {
    const text = rows.map((r) => `${r.team} (${r.mgr}) — ${r.id}`).join('\n');
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
    setCopied(true);
    trackEvent('ambassador_copy', { league_id: String(leagueId) });
    toast('Team IDs copied');
    setTimeout(() => setCopied(false), 1600);
  };

  if (loading) {
    return <div className="panel-empty">Checking your account…</div>;
  }

  if (!account?.authenticated) {
    return (
      <>
        <div className="lbl-row"><span className="l">AMBASSADOR</span>{gwSelect}</div>
        <div className="amb-gate">
          <div className="amb-gate-ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="4" y="10" width="16" height="10" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h3>Sign in to see every team ID</h3>
          <p>
            The Ambassador list shows the FPL team ID for all {managers.length} managers in {leagueName},
            ready to export as a CSV. Sign in with your email — no password.
          </p>
          <a className="s-btn s-btn--red hex" onClick={() => router.push('/auth/login')}>Sign in with email</a>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="lbl-row"><span className="l">AMBASSADOR</span>{gwSelect}</div>

      <p className="amb-intro">
        Every FPL team ID in <strong>{leagueName}</strong>. Export it, share it with the league, and
        anyone can paste their ID into FPL Ranker to see their own squad, rank movement and gameweek
        headlines.
      </p>

      <div className="amb-actions">
        <button className="s-btn s-btn--red hex" onClick={download}>Export CSV ({rows.length})</button>
        <button className="s-btn s-btn--ghost hex" onClick={copyIds}>{copied ? 'Copied ✓' : 'Copy list'}</button>
      </div>

      <div className="amb-tbl" role="table" aria-label={`Team IDs in ${leagueName}`}>
        <div className="amb-row amb-head" role="row">
          <span>#</span><span>Team</span><span>Team ID</span><span className="num-right">Pts</span>
        </div>
        {rows.map((r) => (
          <div className={`amb-row${r.id === focusId ? ' is-you' : ''}`} role="row" key={r.id}>
            <span className="rk">{r.rank}</span>
            <span className="who">
              <span className="nm">{r.team}</span>
              <span className="tm">{r.mgr}{r.id === focusId ? ' · you' : ''}</span>
            </span>
            <a
              className="tid"
              href={`https://fantasy.premierleague.com/entry/${r.id}/event/${gw}`}
              target="_blank" rel="noopener noreferrer"
              title="Open on the official Fantasy Premier League site"
            >{r.id}</a>
            <span className="pts num-right">{r.total}</span>
          </div>
        ))}
      </div>

      <p className="amb-foot">
        Team IDs are public — they appear in every manager&rsquo;s Fantasy Premier League URL
        (<span className="mono">/entry/&lt;id&gt;/</span>). The CSV includes each manager&rsquo;s official
        FPL link and their FPL Ranker squad link.
      </p>
    </>
  );
}

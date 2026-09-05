#!/usr/bin/env node
/**
 * parse-ga4.mjs — normalise the analytics exports the fpl-diagnostic skill consumes.
 *
 * GA4 "download CSV" gives you several tables stacked in one file, separated by
 * blank lines and `#` comment banners, and it double-encodes UTF-8 on the way out
 * (an em-dash arrives as "â€"", a pound sign as "Â£"). TikTok and Resend each have
 * their own shape. This walks a directory, splits every file into labelled blocks,
 * repairs the mojibake, and prints one JSON summary with the funnel ratios already
 * divided out — so the analysis reasons about rates, not row counts.
 *
 *   node .claude/skills/fpl-diagnostic/scripts/parse-ga4.mjs <dir> [--raw]
 *
 * --raw also dumps every parsed block, not just the summary.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const dir = process.argv[2] || '.';
const wantRaw = process.argv.includes('--raw');

/** GA4 exports are UTF-8 read back as latin1; round-tripping recovers the original bytes. */
function demojibake(s) {
  if (!/[ÂâÃ]/.test(s)) return s;
  try {
    return Buffer.from(s, 'latin1').toString('utf8');
  } catch {
    return s;
  }
}

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
      else quoted = !quoted;
    } else if (c === ',' && !quoted) {
      out.push(cur); cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out.map((v) => demojibake(v.trim()));
}

const num = (v) => {
  const n = Number(String(v).replace(/[£$,%\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};

/**
 * A block is a contiguous run of data lines with one header row. Comment banners
 * (`# ...`) carry the date range and sometimes a question ("Where do your new
 * users come from?"), so they are captured as the block's context rather than
 * discarded.
 */
function parseBlocks(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const blocks = [];
  let pendingNotes = [];
  let header = null;
  let rows = [];

  const flush = () => {
    if (header && rows.length) {
      blocks.push({
        notes: pendingNotes.filter((n) => n && n !== ' '),
        columns: header,
        rows,
        key: header.join(' / '),
      });
    }
    header = null;
    rows = [];
    pendingNotes = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('#')) {
      const note = demojibake(line.replace(/^#+\s?/, '').trim());
      if (header) flush();            // a banner always begins a new block
      if (note && !/^-+$/.test(note)) pendingNotes.push(note);
      continue;
    }
    if (!line) { if (header) flush(); continue; }

    const cells = splitCsvLine(line);
    if (!header) { header = cells; continue; }
    if (cells.length !== header.length) continue;   // ragged trailer row
    rows.push(cells);
  }
  flush();
  return blocks;
}

/** Blocks whose header repeats across files (page tables, city tables) are deduped by key. */
function collect(files) {
  const byFile = {};
  for (const f of files) {
    const text = readFileSync(f, 'latin1');
    byFile[basename(f)] = parseBlocks(text);
  }
  return byFile;
}

/** Find the first block in any file whose header matches every needle. */
function findBlock(byFile, ...needles) {
  for (const blocks of Object.values(byFile)) {
    for (const b of blocks) {
      const k = b.key.toLowerCase();
      if (needles.every((n) => k.includes(n.toLowerCase()))) return b;
    }
  }
  return null;
}

function asPairs(block, valueIdx = 1) {
  if (!block) return null;
  const out = {};
  for (const r of block.rows) out[r[0]] = num(r[valueIdx]) ?? r[valueIdx];
  return out;
}

function asSeries(block, valueIdx = 1) {
  if (!block) return null;
  return block.rows.map((r) => num(r[valueIdx]));
}

const pct = (a, b) => (b ? +((a / b) * 100).toFixed(2) : null);

/**
 * Social referrers must match on a host boundary. A bare /t\.co/ also matches
 * "chatgpt.com" and "copilot.com", which silently inflates social sessions with
 * AI-assistant traffic — the exact opposite of the Pass 2b conclusion.
 */
const SOCIAL_HOST = /(^|[^a-z0-9.])(tiktok|youtube|youtu\.be|t\.co|instagram|l\.instagram\.com|facebook|lnk\.bio|linktr\.ee|x\.com|reddit)([^a-z0-9]|$)/i;

/**
 * GA4 banners carry the reporting window as `# Start date: 20260829`. A few
 * blocks (retention cohorts, lifetime engagement) deliberately use a longer
 * lookback, so neither the widest nor the narrowest pair is the report window —
 * the modal one is. Ties break toward the later start.
 */
function windowFromNotes(byFile) {
  const tally = new Map();
  for (const blocks of Object.values(byFile)) {
    for (const b of blocks) {
      let s = null;
      let e = null;
      for (const n of b.notes) {
        const ms = /Start date:\s*(\d{8})/.exec(n);
        const me = /End date:\s*(\d{8})/.exec(n);
        if (ms) s = ms[1];
        if (me) e = me[1];
      }
      if (s && e) {
        const k = `${s}:${e}`;
        tally.set(k, (tally.get(k) || 0) + 1);
      }
    }
  }
  if (!tally.size) return { start: null, end: null };
  const [best] = [...tally.entries()].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]));
  const [start, end] = best[0].split(':');
  const iso = (d) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  return { start: iso(start), end: iso(end) };
}

// ---------------------------------------------------------------------------

const files = readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith('.csv'))
  .map((f) => join(dir, f));

if (!files.length) {
  console.error(`No CSVs found in ${dir}`);
  process.exit(1);
}

const byFile = collect(files);
const window = windowFromNotes(byFile);

// --- totals -----------------------------------------------------------------
const totalsBlock = findBlock(byFile, 'Active users', 'New users', 'Event count');
const totals = totalsBlock
  ? Object.fromEntries(totalsBlock.columns.map((c, i) => [c, num(totalsBlock.rows[0][i])]))
  : null;

// --- events -----------------------------------------------------------------
const events = asPairs(findBlock(byFile, 'Event name', 'Event count'));

// --- channels & sources -----------------------------------------------------
const channels = asPairs(findBlock(byFile, 'primary channel group'));
const sessionSrc = asPairs(findBlock(byFile, 'Session source / medium'));
const firstSrc = asPairs(findBlock(byFile, 'First user source / medium'));

// --- pages ------------------------------------------------------------------
const pagesBlock = findBlock(byFile, 'Page title', 'Bounce rate');
const pages = pagesBlock
  ? pagesBlock.rows.map((r) => ({
      title: r[0],
      views: num(r[1]),
      users: num(r[2]),
      events: num(r[3]),
      bounce: num(r[4]),
    })).sort((a, b) => b.views - a.views)
  : null;

const dwellBlock = findBlock(byFile, 'Page title', 'Views per active user');
const dwell = dwellBlock
  ? Object.fromEntries(dwellBlock.rows.map((r) => [r[0], num(r[4])]))
  : {};
if (pages) for (const p of pages) if (dwell[p.title] != null) p.dwellSec = dwell[p.title];

// --- daily series -----------------------------------------------------------
const daily = {
  activeUsers: asSeries(findBlock(byFile, 'Nth day', 'Active users')),
  newUsers: asSeries(findBlock(byFile, 'Nth day', 'New users')),
  returningUsers: asSeries(findBlock(byFile, 'Nth day', 'Returning users')),
  engagementSec: asSeries(findBlock(byFile, 'Nth day', 'Average engagement time per active user')),
  engagedSessionsPerUser: asSeries(findBlock(byFile, 'Nth day', 'Engaged sessions per active user')),
};

// --- retention --------------------------------------------------------------
const weekly = findBlock(byFile, 'Week 0', 'Week 1');
const weeklyRetention = weekly
  ? weekly.rows.map((r) => {
      const w0 = num(r[1]);
      const w1 = num(r[2]);
      return { period: r[0], week0: w0, week1: w1, week1Pct: w1 > 0 ? pct(w1, w0) : 0 };
    })
  : null;

const dayCohort = findBlock(byFile, 'Cohort', 'Day 1', 'Day 7');
const dailyRetention = dayCohort
  ? dayCohort.rows.map((r) => ({ cohort: r[0], day1: num(r[1]), day7: num(r[2]) }))
  : null;

// --- geo --------------------------------------------------------------------
const DATACENTER = new Set([
  'The Dalles', 'Ashburn', 'Council Bluffs', 'Boardman', 'Mayville',
  'Mankato', 'Kansas City', 'Cheyenne', 'Des Moines',
]);
const cities = asPairs(findBlock(byFile, 'City', 'Active users')) || {};
const infraUsers = Object.entries(cities)
  .filter(([c]) => DATACENTER.has(c))
  .reduce((a, [, v]) => a + v, 0);
const countries = asPairs(findBlock(byFile, 'Country', 'Active users')) || {};
const ukIe = (countries.GB || 0) + (countries.IE || 0);

// --- social (TikTok / YouTube Overview.csv) ---------------------------------
const socialBlock = findBlock(byFile, 'Video Views');
const social = socialBlock
  ? socialBlock.rows.map((r) => ({
      date: r[0],
      views: num(r[1]),
      profileViews: num(r[2]),
      likes: num(r[3]),
      comments: num(r[4]),
      shares: num(r[5]),
    }))
  : null;
const socialViews = social ? social.reduce((a, d) => a + (d.views || 0), 0) : 0;

// --- affiliate (Impact / Kitbag) --------------------------------------------
// Impact's Overview export stacks several tables in one file, same shape as GA4.
// It is also called "Overview.csv", so blocks are matched on header content
// rather than filename or the TikTok export would collide with it.
const brandBlock = findBlock(byFile, 'Brand', 'Clicks', 'Actions');
const affDaily = findBlock(byFile, 'Date', 'Clicks', 'Action Earnings');
const affDomains = findBlock(byFile, 'Domain', 'Clicks', 'Total Earnings');

let affiliate = null;
if (brandBlock || affDomains) {
  const brand = brandBlock
    ? { brand: brandBlock.rows[0][0], clicks: num(brandBlock.rows[0][1]), actions: num(brandBlock.rows[0][2]) }
    : null;

  const daily = affDaily
    ? affDaily.rows.map((r) => ({
        date: r[0],
        clicks: num(r[1]),
        actions: num(r[2]),
        earnings: num(r[4] ?? r[3]),
      })).filter((d) => d.clicks !== null)
    : [];

  const domains = affDomains
    ? affDomains.rows.map((r) => ({
        domain: r[1],
        clicks: num(r[2]),
        actions: num(r[3]),
        earnings: num(r[r.length - 1]),
      }))
    : [];

  const totalClicks = brand?.clicks ?? domains.reduce((a, d) => a + (d.clicks || 0), 0);

  // A click from a real browser on the site carries a Referer, because the
  // affiliate anchors use rel="sponsored noopener" — NOT noreferrer. So clicks
  // filed under "No referring domain" did not come from a page view in a
  // browser: they are crawlers, link scanners or direct URL fetches. Splitting
  // these is the difference between "nobody buys" and "almost nobody clicked".
  const isNoReferrer = (d) => /^no referring domain$/i.test(d.domain || '');
  const isLocal = (d) => /^(localhost|127\.0\.0\.1)/i.test(d.domain || '');
  const unattributed = domains.filter(isNoReferrer).reduce((a, d) => a + (d.clicks || 0), 0);
  const localDev = domains.filter(isLocal).reduce((a, d) => a + (d.clicks || 0), 0);
  const referred = domains.filter((d) => !isNoReferrer(d) && !isLocal(d)).reduce((a, d) => a + (d.clicks || 0), 0);

  affiliate = {
    brand: brand?.brand ?? null,
    totalClicks,
    actions: brand?.actions ?? domains.reduce((a, d) => a + (d.actions || 0), 0),
    earnings: domains.reduce((a, d) => a + (d.earnings || 0), 0),
    daily,
    domains,
    attribution: {
      referred,
      localDev,
      unattributed,
      unattributedPct: pct(unattributed, totalClicks),
      // The only clicks that can be attributed to a human on the site.
      realSitePct: pct(referred, totalClicks),
    },
  };
  affiliate.conversionPct = pct(affiliate.actions, totalClicks);
}

// --- email (Resend) ---------------------------------------------------------
const emailFile = Object.keys(byFile).find((f) => /emails?-sent/i.test(f));
let email = null;
if (emailFile) {
  const rowsAll = byFile[emailFile].flatMap((b) => b.rows.map((r) => ({ b, r })));
  const hdr = byFile[emailFile][0]?.columns || [];
  const iSub = hdr.indexOf('subject');
  const iTo = hdr.indexOf('to');
  const iEvt = hdr.indexOf('last_event');
  const iAt = hdr.indexOf('created_at');
  const all = rowsAll.map(({ r }) => ({
    subject: r[iSub] || '',
    to: (r[iTo] || '').toLowerCase(),
    event: r[iEvt] || '',
    date: (r[iAt] || '').slice(0, 10),
  }));

  // Resend exports cover a longer span than the GA4 window. Scoring signup
  // conversion means dividing signups by the new users of the SAME days, so the
  // in-window slice is what feeds `derived`; all-time is kept for context.
  const inWindow = (x) =>
    !window.start || !window.end || (x.date >= window.start && x.date <= window.end);

  const shape = (recs) => {
    const m = (re) => recs.filter((x) => re.test(x.subject));
    const o = {
      totalSent: recs.length,
      bounced: recs.filter((x) => x.event === 'bounced').length,
      uniqueRecipients: new Set(recs.map((x) => x.to).filter(Boolean)).size,
      magicLinks: m(/sign in/i).length,
      magicLinkUsers: new Set(m(/sign in/i).map((x) => x.to)).size,
      confirmRequests: m(/confirm your spot/i).length,
      confirmed: m(/you're in|youre in/i).length,
      deadlineReminders: m(/deadline reminder/i).length,
      gwSummaries: m(/gameweek \d+ summary|team analysis summary/i).length,
    };
    o.confirmRatePct = pct(o.confirmed, o.confirmRequests);
    return o;
  };

  email = {
    window: { start: window.start, end: window.end },
    inWindow: shape(all.filter(inWindow)),
    allTime: { ...shape(all), span: [all[0]?.date, all[all.length - 1]?.date] },
  };
}

// --- derived funnel ratios --------------------------------------------------
const sessions = events?.session_start ?? null;
const derived = {
  sessionsPerNewUser: totals && sessions ? +(sessions / totals['New users']).toFixed(2) : null,
  newUserSharePct: totals ? pct(totals['New users'], totals['Active users']) : null,
  formCompletionPct: events ? pct(events.subscribe_newsletter || 0, events.form_start || 0) : null,
  sharePerSessionPct: events && sessions ? pct(events.share_league || 0, sessions) : null,
  scrollPerViewPct: events ? pct(events.scroll || 0, events.page_view || 0) : null,
  signupConversionPct:
    email && totals ? pct(email.inWindow.magicLinkUsers, totals['New users']) : null,
  socialViews,
  socialSessions: sessionSrc
    ? Object.entries(sessionSrc)
        .filter(([k]) => SOCIAL_HOST.test(k))
        .reduce((a, [, v]) => a + v, 0)
    : null,
  ukIeSharePct: totals ? pct(ukIe, totals['Active users']) : null,
  affiliateClicks: affiliate?.totalClicks ?? null,
  affiliateRealSiteClicks: affiliate?.attribution.referred ?? null,
  affiliateUnattributedPct: affiliate?.attribution.unattributedPct ?? null,
  affiliateConversionPct: affiliate?.conversionPct ?? null,
  affiliateEarnings: affiliate?.earnings ?? null,
  infraContaminationPct: totals ? pct(infraUsers, totals['Active users']) : null,
  keyEvents: 0,
};
derived.socialCtrPct = socialViews ? pct(derived.socialSessions || 0, socialViews) : null;

const summary = {
  generatedFrom: Object.keys(byFile),
  totals,
  derived,
  channels,
  sessionSources: sessionSrc,
  firstUserSources: firstSrc,
  events,
  daily,
  retention: { daily: dailyRetention, weekly: weeklyRetention },
  geo: { countries, ukIeUsers: ukIe, infraUsers, topCities: cities },
  pages: pages ? pages.slice(0, 40) : null,
  social,
  affiliate,
  email,
};

if (wantRaw) summary.rawBlocks = byFile;

console.log(JSON.stringify(summary, null, 2));

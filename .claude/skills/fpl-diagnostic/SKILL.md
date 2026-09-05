---
name: fpl-diagnostic
description: Revenue diagnostic for fplranker.com — ingests GA4, TikTok/YouTube, Resend email and Impact/Kitbag affiliate exports, traces the full funnel (impression → view → landing → activation → retention → payment), grades every feature as painkiller or vitamin, and returns a dated plan to switch monetization on.
use-when: The user drops analytics exports (GA4 CSVs, TikTok/YouTube Overview.csv, Resend emails-sent CSV, Impact affiliate Overview CSV) and wants to know where traffic comes from, where it leaks, what to build next, or whether the app is ready to charge.
---

# FPL Diagnostic — Revenue & Funnel Autopsy

## Role
You are the **sales manager** for fplranker.com. Your single objective is to shorten the distance to first revenue. You are not a report generator — every section you write must end in a decision. You are allowed to be blunt: if a feature is a vitamin, say so and propose deferring or killing it.

Governing constraint: freemium premium tier, magic-link auth, merchant-of-record payments, **$1,000 by Oct 31 2026**. The free-launch window is hard-coded in `src/lib/premium.ts` (`PREMIUM_FREE_UNTIL`, default 22 Sep 2026 / end of GW5). Every diagnostic must state how many days remain on that clock and whether the funnel can survive the paywall turning on.

## Data Sources

**Always ingest (user-supplied exports):**

| File pattern | Source | What it answers |
|---|---|---|
| `Reports_snapshot*.csv` | GA4 | Totals, per-page bounce rate, source/medium, new vs returning |
| `Understand_web*traffic_overview*.csv` | GA4 | Geo, engagement time by day, **event counts** |
| `View_user_engagement*retention*.csv` | GA4 | Day-1/Day-7 cohorts, DAU/WAU/MAU |
| `Generate_leads_overview*.csv` | GA4 | Weekly retention cohorts, qualified/converted leads |
| `Pages_and_screens*.csv` | GA4 | Per-page dwell time and views-per-user |
| `Overview.csv` | TikTok / YouTube Studio | Video views, profile views, likes, shares by day |
| `emails-sent-*.csv` | Resend | Magic-link signups, newsletter confirm rate, deliverability |
| `*Overview*.csv` with a `Brand,Clicks,Actions` block | Impact (Kitbag) | Affiliate clicks, actions, earnings, **referring domain** |

**Always cross-reference (in-repo):**
- `src/lib/premium.ts`, `src/lib/billing.ts` — paywall date, pricing, MoR wiring
- Wherever `trackEvent` is defined — the event vocabulary you are allowed to reason about
- `docs/marketing/organic-growth-plan.md`, `docs/marketing/social-traffic-plan-2026.md`
- `docs/research/competitor_gap_analysis.md`, `docs/research/preseason_intent.md`
- `references/baseline-2026-09.md` — the frozen prior period; **every metric you report must be stated as a delta against it**

**Parse with the helper, not by eye:**

```bash
node .claude/skills/fpl-diagnostic/scripts/parse-ga4.mjs <dir-with-csvs>
```

GA4 exports are multi-block CSVs (several tables stacked under one header). The script splits blocks, repairs the UTF-8 mojibake (`â€"` → `—`, `Â£` → `£`), and emits one JSON summary with the funnel ratios pre-computed. Read that JSON; do not hand-count rows.

---

## The Seven Passes

Run all seven in order — later passes depend on earlier ones. Never skip a pass because data is thin; write "no data, instrument X" as the finding.

### Pass 1 — Acquisition: where does traffic actually come from?

Split **first-user channel** (who they are) from **session source** (how they came back). Compute:

- Organic vs Direct vs AI-assistant vs Referral share of new users
- Sessions per new user — a proxy for whether anyone comes back at all
- **AI-assistant share and its growth rate** — chatgpt.com / copilot.com / perplexity referrals are the leading indicator that AEO work is landing. Call it out even at n=10.
- **Bot and infra contamination** — strip datacenter cities before drawing any conclusion about market: The Dalles OR (Google), Ashburn VA (AWS), Council Bluffs, Boardman, Mayville/Mankato. Also treat a large `(direct)/(none)` block with near-zero engagement as suspect.
- **Geo vs market fit** — if non-UK/IE users outnumber UK/IE, the content is ranking for generic queries, not buyer queries. FPL money is UK/IE-weighted.

Output a channel table with a **Verdict** column: `Scale` · `Fix` · `Ignore`.

### Pass 2 — Content: which keywords convert to views, and do views convert to landings?

Two separate funnels. Never merge them.

**2a. Search → page (organic).** Group pages into clusters: `pSEO player pages` · `blog posts` · `tools` · `league share pages` · `core app`. For each cluster report views, users, views/user, dwell, bounce. The question you are answering: *does this cluster produce a second pageview?* A cluster at 100% bounce is a ranking win and a product failure — the keyword converts to a view but the view converts to nothing.

**2b. Social → site (paid attention).** Take video views from `Overview.csv` and look for the matching referral in GA4 session source (`tiktok`, `t.co`, `youtube`, `lnk.bio`, `instagram`, `l.instagram.com`). Compute:

```
social CTR = social-referred sessions / video views
```

If GA4 shows **zero** social sessions against non-zero video views, the finding is not "low conversion" — it is **"the link is not clickable or not tagged"**. Check in this order: bio link present and pointing at a UTM-tagged URL? Does the video *say* the domain out loud? Is the on-screen URL legible for ≥3s? Is there a comment-pinned link? Fixing attribution is worth more than another ten videos.

Then correlate by day: a video spike on day N should produce a session bump on day N or N+1. If it does not, the audience is watching, not travelling — and the content is entertainment, not acquisition.

**2c. Affiliate → revenue.** Impact reports clicks by **referring domain**, and that column is the whole analysis. Affiliate anchors carry `rel="sponsored noopener"` — *not* `noreferrer` — so a real browser click from a page on the site arrives with the site as its referrer. Clicks filed under **"No referring domain" did not come from a human on a page**: they are crawlers, link scanners, or direct URL fetches.

Compute three numbers before saying anything about conversion:

```
real site clicks  = clicks whose referring domain is your site
unattributed      = clicks under "No referring domain"
click → action     = actions / real site clicks   ← NOT actions / total clicks
```

A 0% conversion on 500 total clicks means nothing if 495 were bots. Report the human denominator or do not report a rate at all. Cross-check the total against GA4's `affiliate_click`: if Impact shows hundreds and GA4 shows near-zero, the gap **is** the bot volume, because GA4 only fires on a real browser click.

Also correlate the daily click series against deploys (`git log`) rather than against traffic. A spike that lands a day or two after a release touching affiliate URLs, on a day with no matching traffic, is re-crawl — not demand.

### Pass 3 — In-app: dwell, leaks and bounce

Rank every page and place it on a 2×2:

|  | Low bounce | High bounce |
|---|---|---|
| **High traffic** | **Engine** — protect it, monetize here | **Leak** — highest-priority fix |
| **Low traffic** | **Pocket** — promote it | **Dead** — deprecate or redirect |

For each **Leak**, name the specific missing next-click. A high-bounce page is almost never a content problem; it is a missing internal CTA.

**Bounce-trend check.** Compare each page's bounce against `references/baseline-2026-09.md`. State plainly improved / flat / regressed, with both numbers. If a fix shipped in the window, find it (`git log --oneline --since=<start>`), name it, and say whether the number moved. Never claim a fix worked without the two numbers side by side.

**Micro-funnel leaks.** Compare event counts pairwise — this is where real money leaks:

- `form_start` → `subscribe_newsletter` — form abandonment
- `first_visit` → magic-link email sent — signup conversion
- "Confirm your spot" → "You're in" — double opt-in confirm rate
- `page_view` → `premium_gate_click` → checkout — paywall discovery
- Any event sitting at **0** that should not be is either a dead feature or missing instrumentation. Decide which, explicitly, and say how you can tell.

### Pass 4 — Retention: the matchday rhythm

FPL demand is a **sawtooth keyed to the deadline, not to the match**. Label each day in the window:

`DEADLINE-2` · `DEADLINE-1` · `DEADLINE` · `MATCHDAY` · `POST-GW` · `DEAD-WEEK`

Then compute per phase: active users, new users, **average engagement time**, engaged sessions per user.

The critical read is the **inversion**: pre-deadline traffic is high-volume and shallow (people checking prices and captains), matchday traffic is low-volume and deep (people watching their rank move). Deep users are the ones who will pay. If the product is optimized for the shallow peak and abandoned during the deep trough, monetization is aimed at the wrong cohort.

Report Day-1 and Day-7 cohorts and weekly Week-0 → Week-1. Benchmarks in `references/benchmarks.md`. Anything under 5% Week-1 means **the site is a search destination, not a product** — write those words.

### Pass 5 — Painkiller vs vitamin

Grade every shipped and proposed feature with the rubric in `references/painkiller-framework.md`. A feature is a **painkiller** only if it clears all four tests:

1. **Recurring pain** — felt every gameweek, not once a season
2. **Deadline-coupled** — there is a cost to not using it *before a specific time*
3. **Un-substitutable** — the official FPL site or a rival does not already do it well and free
4. **Loss-framed** — it prevents a bad outcome (wrong captain, missed deadline, rival overtaking you) rather than adding a nice number

3/4 or less is a **vitamin**. Vitamins are not worthless — they are SEO surface — but they must never be the thing behind the paywall.

Output: `Feature | Route | Grade | Test it fails | Keep / Paywall / Defer / Kill`.

### Pass 6 — The build plan

Propose 3–5 features maximum. Each must be a painkiller by the Pass-5 rubric **and** tied to a specific leak found in Passes 1–4. For each:

```
Feature · Route · Painkiller test it passes · Leak it plugs ·
Effort (S/M/L) · Instrumented by (event name) · Success metric + threshold
```

Order by `(leak size × painkiller score) / effort`. Then explicitly list what you are **not** building and why — the cut list is the valuable half.

Bias hard toward features that fire **during the phases the data shows are dead**. Owning a dead phase is cheaper than out-competing everyone on the crowded pre-deadline peak.

### Pass 7 — Monetization readiness

Walk the gates in `references/monetization-gates.md`. Return a go/no-go with a date. Always compute:

- Days until `PREMIUM_FREE_UNTIL`
- Buyers needed at current price to hit the revenue goal
- Implied conversion rate required at current traffic — and whether that rate is sane (>3% of raw traffic is not)
- Whether the top of funnel is large enough at all, or whether the honest answer is **"monetize the audience you can reach, not the traffic you have"** (newsletter list, league commissioners, affiliate) while the funnel is rebuilt

---

## Output Format

Write the report to `docs/marketing/diagnostics/YYYY-MM-DD-diagnostic.md`, and lead the chat reply with the three findings that change what gets built this week.

```markdown
# FPL Ranker Revenue Diagnostic — <period>
**Verdict:** <one sentence — can we charge, and if not what blocks it>
**Days to paywall:** <n> · **Revenue to date:** <£> · **Gap to goal:** <£>

## 1. Scoreboard              <- metrics vs baseline, delta column mandatory
## 2. Acquisition             <- Pass 1: channel table + verdicts
## 3. Content conversion      <- Pass 2: search cluster table + social CTR
## 4. In-app leaks            <- Pass 3: 2x2 + micro-funnel + bounce trend
## 5. The matchday rhythm     <- Pass 4: phase table + retention cohorts
## 6. Painkillers vs vitamins <- Pass 5: grading table
## 7. Build next              <- Pass 6: ranked, with cut list
## 8. Monetization gates      <- Pass 7: gate checklist + go/no-go date
## 9. This week               <- max 5 actions, ordered, each with a number to hit
```

## Rules

- **Every number gets a denominator.** "9 shares" is noise; "9 shares / 275 sessions = 3.3%" is a finding.
- **Small-n honesty.** Under ~30 samples, label it `directional`. Do not build a roadmap on n=2.
- **Never report a rate without its trend.** A 47% bounce means nothing without last period's number.
- **Zeroes are the headline.** `Key events: 0` and `Total revenue: 0` are the story, not a footnote.
- **Separate "nobody wants it" from "nobody can find it".** Opposite fixes, and the most common misdiagnosis in this dataset.
- **Name the cohort you are selling to** before recommending a price or a paywall position.
- After each run, append a new dated block to `references/baseline-2026-09.md` so the next run has a comparison. Never overwrite an old block.

## Related skills
- `fpl-competitor-gap` — supplies the competitor traffic weights used in Pass 5 test 3 (un-substitutable)
- `fpl-content` — owns the social funnel this skill audits in Pass 2b
- `fpl-retention-builder` / `fpl-feature-builder` — build the painkillers this skill selects in Pass 6
- `fpl-newsletter` — owns the email funnel audited in Pass 3

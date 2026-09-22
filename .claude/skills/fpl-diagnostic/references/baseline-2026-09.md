# Baseline Ledger

Append a new dated block after every diagnostic run. **Never overwrite an earlier block** — the trend is the product of this file.

Source of truth is the parser output:
`node .claude/skills/fpl-diagnostic/scripts/parse-ga4.mjs <dir>`

---

## 2026-08-29 → 2026-09-04 (GW2 played / GW3 build-up) — FIRST BASELINE

### Scoreboard
| Metric | Value | Note |
|---|---|---|
| Active users | 225 | |
| New users | 207 | 92% of actives — almost nobody returns |
| Sessions | 275 | 1.33 per new user |
| Events | 1,578 | |
| Avg engagement / active user | 50.7s | |
| **Key events** | **0** | conversion tracking not configured |
| **Total revenue** | **£0** | |

### Acquisition (new users by first channel)
| Channel | New users | Share |
|---|---|---|
| Organic Search | 95 | 45.9% |
| Direct | 94 | 45.4% |
| AI Assistant | 10 | 4.8% |
| Cross-network | 6 | 2.9% |
| Unassigned | 2 | 1.0% |

Session sources: direct 115 · google 103 · bing 22 · chatgpt.com 12 · header(internal) 5 · duckduckgo 4 · copilot.com 2 · banner(internal) 1 · yahoo.dk 1 · ecosia 1

### Geo
- UK+IE: 51 / 225 = **22.7%**
- Datacenter contamination: 18 users (The Dalles 12, Ashburn 2, Mankato 2, Mayville 2) = **8.0%**
- US raw 52 → ~34 after stripping infra

### Events
`page_view 720 · session_start 275 · first_visit 207 · user_engagement 154 · scroll 130 · form_start 73 · share_league 9 · capture_dismiss 4 · click 2 · subscribe_newsletter 2 · ambassador_copy 1 · ambassador_export 1`

Absent entirely (never fired): `premium_gate_click` · `affiliate_click` · `view_league` · `compare_teams` · `use_feature` · `change_gameweek` · `search` · `conversion`

### Micro-funnel
| Step | Rate | Benchmark |
|---|---|---|
| `form_start` → `subscribe_newsletter` | **2.7%** (2/73) | crisis (<20%) |
| new users → magic-link signup | 2.9% (6/207) | workable |
| "Confirm your spot" → "You're in" (all-time) | 20% (1/5) | crisis (<40%) |
| `share_league` / session | 3.3% (9/275) | — |
| landing users → /premium view | 2.0% (2/101) | crisis |
| /premium views / sessions | 0.7% (2/275) | crisis (<5%) |
| social video views → sessions | **0%** (0/568) | crisis |

### Page bounce (the trend anchor — compare every future run to this)
| Page | Views | Users | Bounce |
|---|---|---|---|
| Landing (`/`) | 159 | 101 | **47.5%** |
| Home (`/app/home`) | 108 | 43 | 23.6% |
| My Squad | 85 | 31 | 12.5% |
| **Player Prices/Ownership** | 68 | 36 | **67.5%** |
| My Leagues | 56 | 17 | 4.5% |
| Find Team ID | 15 | 14 | 21.4% |
| League share page (Kelab Belia Houston) | 15 | 11 | 33.3% |
| Players index | 14 | 8 | 0% |
| Blog index | 7 | 5 | 16.7% |
| Predictions | 7 | 1 | 25.0% |
| Kitbag | 6 | 5 | 0% |
| **Premium** | **2** | **1** | 0% |
| Blog: Top 5 FPL Tools | 5 | 5 | **100%** |
| Blog: GW2 Captain Picks | 4 | 4 | **100%** |
| pSEO player pages (~60 pages) | ~110 | — | 60–100% |

### Retention
| Weekly cohort | Week 0 | Week 1 | Week-1 % |
|---|---|---|---|
| Jul 19–25 | 49 | 0 | 0% |
| Jul 26–Aug 1 | 68 | 2 | 2.9% |
| Aug 2–8 | 111 | 1 | 0.9% |
| Aug 9–15 | 186 | 3 | 1.6% |
| Aug 16–22 | 372 | 9 | **2.4%** |
| Aug 23–29 | 201 | pending | — |

Day-1 cohorts: 0–8.7% · **Day-7: 0% across every cohort.**
DAU/MAU 2.0–5.3% · WAU/MAU 22–26%.

### Matchday rhythm (the inversion)
| Day | Phase | Active | New | Engagement |
|---|---|---|---|---|
| Sat 29 Aug | MATCHDAY | 18 | 15 | **85.7s** |
| Sun 30 Aug | MATCHDAY | 26 | 23 | **113.0s** |
| Mon 31 Aug | POST-GW | 41 | 36 | 35.5s |
| Tue 1 Sep | DEADLINE-2 | **52** | 44 | 41.0s |
| Wed 2 Sep | DEADLINE-1 | 48 | **45** | 26.7s |
| Thu 3 Sep | DEADLINE | 27 | 22 | 55.3s |
| Fri 4 Sep | MATCHDAY-eve | 29 | 22 | 19.3s |

Peak traffic (Tue/Wed) carries the **shallowest** sessions; the matchday trough carries **4.2× deeper** sessions.

### Social (TikTok)
568 video views over 7 days (Aug 30 spike 201, Sep 3 spike 323) · 6 profile views · 15 likes · **0 shares** · **0 attributable sessions**.

### Email (Resend)
All-time span Aug 17 – Sep 3: 48 sent, 1 bounced, 19 unique recipients, **16 magic-link users**, 5 confirm requests → 1 confirmed, 5 deadline reminders, 11 GW summaries.
In-window: 23 sent, 6 magic-link users, 3 confirm requests → 1 confirmed.

### Warm audience (Gate 2)
16 registered · 1 confirmed newsletter subscriber · ~4 leagues connected. **Requirement for £790 goal: ~400.** At 4% of target.

### Standing verdict
NO-GO on the 22 Sep paywall. Blocking gates: 6 (measurement), 1 (discoverability), 2 (warm audience), 3 (retention).

### Affiliate (Impact / Kitbag) — 6 Aug → 4 Sep 2026
| Metric | Value |
|---|---|
| Total clicks | 532 |
| Actions / earnings | **0 / £0.00** |
| Referred by `fplranker.com` | **4** |
| `localhost` (dev) | 4 |
| "No referring domain" | **524 (98.5%)** |
| GA4 `affiliate_click` | **absent from the event list** |

Daily: Aug 6: 6 · Aug 7/9/11/12/13: 1 each · Aug 29: 1 · **Aug 31: 309** · **Sep 3: 190** · Sep 4: 0.

Both spikes are crawl sweeps, not demand — they follow `1f63cb6` (27 Aug, rewrote every club URL) and `e89b81a` (29 Aug), and land on days with 41 and 27 site users respectively. Real human click base is **4**.

---

## 2026-08-01 → 2026-09-21 (52 days: preseason through GW5) — SECOND RUN

**Window is 52 days, not 7.** Compare per-day or by rate against the 29 Aug – 4 Sep block above.
Only `Reports_snapshot` was re-exported: **no event-name breakdown, no retention cohorts** this run.

### Scoreboard
| Metric | Value | Per day | Baseline/day | Delta |
|---|---|---|---|---|
| Active users | 1,585 | 30.5 | 32.1 | −5% |
| New users | 1,573 | 30.3 | 29.6 | +2% |
| Sessions | 1,913 | 36.8 | 39.3 | −6% |
| Events | 9,924 | 190.8 | 225.4 | −15% |
| New-user share | 99.2% | — | 92.0% | worse |
| Sessions / new user | 1.22 | — | 1.33 | −8% |
| Avg engagement / active user | **35.0s** | — | 50.7s | **−31%** |
| **Key events** | **16** | — | 0 | **first ever** |
| **Total revenue** | **£0** | — | £0 | flat |

**Last 7 days (15–21 Sep): 10.7 new/day — down 64% vs the baseline week, 79% off the 17 Aug peak.**

### Weekly new/returning
| Week (Mon) | New | Returning | New/day | Returning share |
|---|---|---|---|---|
| Aug 3 | 119 | 11 | 17.0 | 8.5% |
| Aug 10 | 208 | 25 | 29.7 | 10.7% |
| Aug 17 | 353 | 52 | **50.4** | 12.8% |
| Aug 24 | 199 | 41 | 28.4 | 17.1% |
| Aug 31 | 270 | 41 | 38.6 | 13.2% |
| Sep 7 | 297 | 19 | 42.4 | 6.0% |
| Sep 14 | 91 | 17 | **13.0** | 15.7% |
| Sep 21 (1d) | 7 | 3 | 7.0 | 30.0% |

### The 268-user scraper asterisk
6–7 Sep contributed 268 new users (84 + 184), the two largest days. Commit `4db1fcb` states a
JS-rendering scraper walked ~122 of the sitemap's 200 player URLs over those two days; such a
scraper executes gtag and lands in GA4 as real users. Corroborating: Singapore 307 users (19.4%,
3.4× London's 91); pSEO 317 pages at 1.07 views/user with 213 pages at exactly 100% bounce.
**Bot-adjusted actives ~1,200–1,320.** Treat every denominator in this block as an upper bound.

### Acquisition (new users by first source)
| Channel | New users | Share | Prior share |
|---|---|---|---|
| Organic Search | 835 | 52.7% | 45.9% |
| Direct | 684 | 43.2% | 45.4% |
| AI assistant | 57 | 3.6% | 4.8% |
| Referral | 8 | 0.5% | — |

Session sources: google 805 · direct 782 · bing 144 · chatgpt 54 · header(internal) 42 ·
duckduckgo 26 · yahoo 13 · banner(internal) 8 · ecosia 8 · copilot 7 · facebook 4 · reddit 2 ·
perplexity 2 · vercel 2.

**AI assistant is shrinking, not compounding: 1.10/day vs the prior 1.43/day = −23%.**

### Geo
- UK+IE: 404 / 1,585 = **25.5%** (prior 22.7%); ~33.7% bot-adjusted
- Singapore (suspect): 307 = 19.4%
- Datacenter: 80 = 5.0% (prior 8.0%)
- China region: 46 = 2.9%

### Page clusters
| Cluster | Pages | Views | Users | Views/user | Bounce | @100% |
|---|---|---|---|---|---|---|
| Landing `/` | 1 | 1,272 | 799 | 1.59 | 47.9% | — |
| **Core app** | 8 | 1,239 | 414 | **2.99** | **8.0%** | 0 |
| pSEO player | 317 | 533 | 500 | 1.07 | **70.7%** | **213** |
| Blog / guides | 21 | 381 | 240 | 1.59 | **22.8%** | 1 |
| Tools | 3 | 358 | 232 | 1.54 | 52.5% | 0 |
| League share | 89 | 183 | 111 | 1.65 | 9.9% | 3 |
| Premium | 1 | 54 | 31 | 1.74 | 10.8% | 0 |
| Legacy hubs | 21 | 25 | 21 | 1.19 | 20.0% | 7 |
| Static | 4 | 9 | 9 | 1.00 | 44.4% | 0 |

### Page bounce (the trend anchor)
| Page | Prior | Now | Verdict |
|---|---|---|---|
| Landing `/` | 47.5% | 47.9% | flat |
| Home | 23.6% | 10.5% | improved |
| My Squad | 12.5% | 6.4% | improved |
| My Leagues | 4.5% | 5.7% | flat |
| Player Prices | 67.5% | 65.2% | **flat — the CTA did not work here** |
| Find Team ID | 21.4% | 16.8% | improved |
| Blog: Top 5 FPL Tools | 100% | **50.0%** | **improved** |
| Blog: GW2 Captain Picks | 100% | 80.0% | improved |
| Blog cluster | ~100% | **22.8%** | **improved — TeamEntryPrompt landed here** |
| pSEO player pages | 60–100% | 70.7% | flat |
| Premium | 0% (n=1) | 10.8% (n=31) | now measurable |

Key events 0 → 16 can move sitewide bounce by at most 0.8pp across 1,913 sessions, so the blog
improvement is not a measurement artefact.

### Micro-funnel
| Step | Rate | Prior | Band |
|---|---|---|---|
| New users → magic-link signup | **12/1,573 = 0.76%** | 2.9% | crisis |
| — same, 5–21 Sep only | **2/496 = 0.40%** | — | crisis |
| "Confirm your spot" → "You're in" | 1/5 = 20% | 20% | crisis (stale denominator) |
| /premium views / sessions | **54/1,913 = 2.82%** | 0.7% | **4× better, still FAIL** |
| Key events / sessions | 16/1,913 = 0.84% | 0% | first signal |
| `form_start` → `subscribe_newsletter` | **unattributable** | 2.7% (bad denom) | — |
| TikTok view → session | **0/3,328 = 0.00%** | 0/568 | crisis |
| Affiliate site-referred clicks / affiliate-page views | **0/358 = 0.00%** | — | crisis |

### The dead cron
Resend export runs to 14 Sep (not truncated). Last deadline reminder **2 Sep (GW3)**; last GW
summary **3 Sep (GW2)**. No GW4 or GW5 reminder, no GW3/GW4 summary. `vercel.json` schedules one
job (`/api/cron/daily`, `0 8 * * *`) which matches the 08:07Z send times, so the cron fires; the
route catches the summary exception into `results.summary.error` and still returns
`{ success: true }`. **The only pushed return mechanic has been silently dead for 19 days.**

### Retention
**Not exported this run — UNKNOWN, converted to a task.** Last measured values stand: Week-1 2.4%,
Day-7 0%. Returning share over the window 212/1,785 = 11.9%; highest in the final 8 days at 18.3%.

### Phase rhythm (from new/returning only; no engagement series this run)
| Phase | Days | New/day | Returning share |
|---|---|---|---|
| Pre-season (1–16 Aug) | 16 | 21.9 | 9.3% |
| GW1–GW2 peak (17–28 Aug) | 12 | 42.0 | 14.4% |
| GW3 + scraper (29 Aug – 9 Sep) | 12 | 39.9 | 9.8% |
| Int'l break (10–13 Sep) | 4 | 12.8 | 17.6% |
| GW4/GW5 return (14–21 Sep) | 8 | **12.3** | **18.3%** |

The rhythm did not resume after the break.

### Social (TikTok)
15 videos, **3,328 views**, 84 likes (2.5%), 25 comments, **1 share (0.03%)**,
**0 attributable sessions (0.00% CTR)**. Non-TikTok social in GA4: facebook 4, reddit 2.
Two videos carry a CTA (433 views combined); one deliberately withholds the domain
("comment if you want me to drop the app name"), the other says "link in bio" untagged.

### Email (Resend, 24 Aug – 14 Sep)
48 sent, 1 bounced, 15 unique recipients, 12 magic-link users, 5 confirm requests → 1 confirmed,
4 deadline reminders, 11 GW summaries. Only 2 new registrations after 5 Sep.

### Warm audience (Gate 2)
~17 registered · 1 confirmed subscriber. Requirement for the £790 goal: **≥530.**
At **3.2%** of target, growing at 2 per 16 days.

### Affiliate (Impact / Kitbag, 3–21 Sep)
| Metric | Value |
|---|---|
| Total clicks | 196 |
| "No referring domain" | **190 (96.9%)** — all on 3 Sep |
| kitbag.evyy.net (network redirect hop) | 5 |
| www.facebook.com | 1 |
| **Referred by fplranker.com** | **0** |
| Actions / earnings | 0 / £0.00 |

The 3 Sep spike is the same crawl sweep logged in the prior block. Affiliate surfaces shipped
5 Sep (KitbagStrip on /players and /predictions, plus /kits): those pages drew 358 views from
232 users and produced zero site-attributed clicks.

### Standing verdict
**NO-GO on the 27 Oct paywall.** Blocking gates: 0 (rails unverified), 2 (warm audience at 3.2%),
3 (retention + dead push), then 1 (discoverability at 2.82%). Gate 5 defect: `LAUNCH_OFFER_ENDS`
= 1 Sep 2026 has already passed, so the enforced launch-offer deadline is dead code.

**The paywall opens 27 Oct; the revenue goal is 31 Oct. Four days.** £790 = 53 buyers, which is
12.4% of all cold traffic to 31 Oct at the current run rate — 4× past the "not sane" line.
**Decision: declare $1,000-by-31-Oct missed and reset to £790 by 31 Jan 2027 (GW20).** Hold
27 Oct only if Gate 2 reaches 150 warm by 20 Oct; otherwise extend to GW20 publicly. Run the £1
Gate 0 test this week regardless. Affiliate is not a viable fallback: 0 human clicks, and the goal
would need ~10,000.

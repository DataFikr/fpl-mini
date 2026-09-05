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

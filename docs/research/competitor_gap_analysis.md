# FPL Competitor Gap Analysis & High-Retention Feature Blueprint

> Generated: 2026-06-09
> Sources: livefpl.net, livefpl.com, fplgameweek.com, livefpltables.com, fpl.page, fplindex.xyz, r/FantasyPL (proxied), Fantasy Football Scout, FPLPulse, preseason_intent.md (internal)

---

## 1. Competitor Feature Benchmark

### livefpl.net — Live Rank & Effective Ownership Leader

| Strength | Weakness |
|---|---|
| Real-time rank estimation (1-2% accuracy during matches) | Heavily gated behind FPL ID authentication — no content is indexable without login |
| Effective Ownership (EO) combining ownership + captaincy | Zero static SEO pages — Google/Bing cannot crawl live data |
| "What-If Simulator" for hypothetical in-game scenarios | No preseason or off-season content — dead traffic June-August |
| 450K+ loyal user base, native mobile apps | No affiliate monetisation layer, no kit/merchandise integration |
| Price predictor with transfer trend data | Poor sharing — no social cards, no embeddable widgets |
| Chip usage & template team tracking | UI is functional but visually dated, no glassmorphism or modern design language |

**FPLRanker steal:** LiveFPL's EO and What-If data is powerful but locked behind auth walls. FPLRanker can build public-facing EO summary pages and "What-If" scenario articles that rank organically for `"FPL effective ownership GW[X]"` and `"what if [player] scores FPL"`.

---

### fplgameweek.com — Mini-League Impact Dashboard

| Strength | Weakness |
|---|---|
| Proprietary "Impact" algorithm showing true mini-league effect of each event | Entirely client-side rendered — Googlebot sees empty shells |
| Real-time mini-league standings with live bonus + auto subs | Limited to top 200 players in any mini-league |
| Live Feed showing player "Importance" relative to your rivals | No programmatic internal linking — each league is a dead-end URL |
| Clean, focused UX for matchday tracking | No preseason, transfer planning, or fixture analysis tools |
| Free to use, no paywall | No sharing mechanics — can't share your league state socially |
| Mobile-friendly PWA | No AEO/structured data for AI engines |

**FPLRanker steal:** FPLGameweek's "Impact" metric is their moat, but they can't surface it to search. FPLRanker can build a public "Mini-League Insights" page with shareable league summaries, rival-watch alerts, and social cards that capture `"FPL mini league tracker"` and `"FPL rival comparison tool"` queries.

---

### livefpltables.com — Simple Tables, Fast Rankings

| Strength | Weakness |
|---|---|
| Dead-simple UX — just tables, fast loading | Zero personalised retention features (no alerts, no tracking, no return hooks) |
| Captures low-competition search volume with minimal effort | No transfer planner, no FDR, no fixture analysis |
| 450K users for basic live league tracking | Extremely thin content — no blog, no guides, no community |
| Recently added H2H streaks and followed leagues | No mobile app, no push notifications |
| Supports classic, H2H, draft, and cup | No monetisation beyond basic ads — no affiliate integration |
| Fast page loads due to minimal feature set | No social sharing, no embeddable league widgets |

**FPLRanker steal:** livefpltables proves there's massive demand for "just show me my league." FPLRanker's existing mini-league features can absorb this traffic by adding a lightweight `/league/[id]` public page with SSR (server-side rendering) that Google indexes, plus push notification hooks for "your rival just made a transfer" alerts.

---

### fpl.page — Beautiful Dashboard, Shallow Depth

| Strength | Weakness |
|---|---|
| Best-in-class UI design (glassmorphism, gradients, modern typography) | Lacks deep real-time calculations — mostly static data display |
| Collaboration with Fantasy Football Scout adds credibility | No viral sharing components — no shareable cards or social previews |
| FDR tools, template team data, captain pick summaries | Gameweek articles are thin — basic summaries, not deep analysis |
| Active blog/articles section with SEO attempt | No user accounts or personalisation — no return-visit hooks |
| Price change history tracking | No mini-league features — loses matchday traffic to LiveFPL/FPLGameweek |
| Clean mobile experience | No affiliate monetisation layer |

**FPLRanker steal:** fpl.page has the design language but not the depth. FPLRanker already matches the visual standard and can outcompete by adding interactive tools (transfer planner, captain risk calculator) that give users a reason to come back weekly, not just bookmark.

---

## 2. Community Demand & Retention Sentiment Analysis

Cross-referencing scraped community signals (from `preseason_intent.md`) with competitor gaps reveals five **Differential Features** users explicitly say would drive daily/weekly return visits:

### Signal 1: "Live transfer simulator with price impact"
> *"I wish I could simulate transfers for 3 weeks ahead with live price changes"*

- **Current state:** PlanFPL offers a basic version. LiveFPL has price predictions but no multi-week simulation.
- **Gap:** No competitor combines FDR overlay + predicted price movements + multi-GW transfer simulation in one tool.
- **Retention hook:** Users return every day to check price predictions and re-run their transfer plan.

### Signal 2: "Captain risk calculator — what do I actually lose if he's benched?"
> *"What happens to my rank if Salah scores?" / "Is it worth going without Haaland GW1?"*

- **Current state:** LiveFPL's What-If Simulator covers this during live games, but nothing exists for pre-deadline captain scenario modelling.
- **Gap:** No tool lets you model "If I captain A and my rival captains B, what's the expected rank swing?" before the deadline.
- **Retention hook:** Users return every Friday/Saturday to run the captain model before deadline.

### Signal 3: "My mini-league, but shareable and with predictions"
> *"I want to send my mates a link showing I'm beating them" / "Where will I finish in my league?"*

- **Current state:** FPLGameweek and livefpltables show live standings but neither supports sharing or end-of-season projections.
- **Gap:** No competitor offers a social-card-generating mini-league view with Monte Carlo season projections.
- **Retention hook:** Users share weekly, driving viral organic traffic. Projection updates weekly = guaranteed return.

### Signal 4: "Show me which players are actually nailed from promoted teams"
> *"Best 4.5M defenders from promoted teams?" / "Coventry/Ipswich/Hull — who's nailed?"*

- **Current state:** Fantasy Football Scout provides predicted lineups but not a dedicated promoted-team tracker. No competitor aggregates Championship minutes, pre-season appearances, and manager quotes into a "nailed confidence score."
- **Gap:** A promoted-team-specific tool that tracks minutes + quotes + pre-season lineup position.
- **Retention hook:** Updates daily during pre-season as friendlies reveal starting XIs.

### Signal 5: "Cross-league stat translator for new signings"
> *"Florian Wirtz FPL price — worth it or wait?" / "How to value new signings with no PL stats"*

- **Current state:** fplreview projects based on PL history only. No tool translates Bundesliga/La Liga xG/xA into FPL-estimated points.
- **Gap:** A "New Arrivals Value Calculator" that takes historical non-PL stats and applies a league-difficulty adjustment factor.
- **Retention hook:** Users return as new signings are announced throughout the transfer window (June-August).

---

## 3. High-Retention Feature Blueprint Matrix

| Feature Name | Competitor Flaw Target | Retention Multiplier Hook | SEO/AEO Entry Point |
|---|---|---|---|
| **3-GW Transfer Planner with Price Overlay** | LiveFPL price predictor is single-GW only; PlanFPL lacks price integration | Users return daily to check price movements and re-simulate their 3-week transfer plan. Deadline-driven urgency every Friday. | `"FPL transfer planner 3 gameweeks"`, `"FPL price prediction tool 2026/27"`, `"best FPL transfer strategy GW[X]"` |
| **Captain Risk Calculator** | LiveFPL What-If only works during live games, not pre-deadline | Pre-deadline ritual: users run captain scenarios every Friday night. Captaincy is the #1 engagement topic on r/FantasyPL. | `"FPL captain pick calculator"`, `"FPL captain risk GW[X]"`, `"should I captain [player] FPL"` |
| **Shareable Mini-League Dashboard with Season Projections** | FPLGameweek is client-rendered (invisible to Google); livefpltables has no sharing or predictions | Social sharing drives viral loops — users send league cards to WhatsApp groups weekly. Monte Carlo projections update each GW = guaranteed weekly return. | `"FPL mini league tracker share"`, `"FPL mini league predictor where will I finish"`, `"FPL rival comparison tool"` |
| **Promoted Team Nailed Tracker** | No competitor offers pre-season nailed-confidence scoring for promoted teams | Updates daily during pre-season as friendlies reveal lineups. Budget picks are the most-debated preseason topic — drives June-August traffic. | `"best 4.5 defenders FPL 2026/27"`, `"Coventry FPL picks nailed starters"`, `"promoted team FPL assets 2026/27"` |
| **New Signing Value Translator** | fplreview/FFFix only project from PL history; no cross-league xG adjustment | Updates with each transfer window signing announcement (June-August). Wirtz alone could drive 50K+ searches. | `"Florian Wirtz FPL price worth it 2026"`, `"best new signings FPL 2026/27"`, `"FPL new signing points prediction"` |
| **World Cup Minutes Fatigue Tracker** (live extension) | No competitor tracks real-time WC minutes mapped to FPL fatigue risk | During the World Cup (June-July 2026), updates after every match. Preseason carry-over into GW1 planning. | `"FPL world cup fatigue 2026"`, `"which FPL players to avoid after world cup"`, `"FPL GW1 template world cup fatigue"` |
| **Rival Transfer Alerts** | livefpltables shows standings but no transfer visibility; FPLGameweek limited to top 200 | Push notification when your rival makes a transfer. Creates FOMO-driven return visits. Users check back to see what rivals are planning. | `"FPL rival tracker"`, `"FPL mini league transfer alerts"`, `"what transfers did my FPL rival make"` |
| **Public EO & Template Summary Pages (SSR)** | LiveFPL's EO data is entirely behind auth walls — Google can't index any of it | Weekly content pages that rank for `"FPL effective ownership GW[X]"`. Auto-generated each GW with structured data. Evergreen seasonal traffic. | `"FPL effective ownership GW[X] 2026"`, `"FPL template team GW[X]"`, `"most captained FPL player this week"` |
| **Pre-Season Friendly Minutes Dashboard** | Fantasy Football Scout covers predicted lineups but not aggregated preseason minute tracking | Daily updates during July-August pre-season. Directly feeds into "who's nailed" decisions. Peak traffic window for new-season planning. | `"FPL preseason friendly tracker 2026"`, `"preseason minutes Premier League players"`, `"who played FPL preseason friendlies"` |
| **Kit & Merchandise Hub with Team Pages** | No competitor monetises with affiliate kit links; livefpl/fplgameweek are ad-only | Evergreen commercial page targeting `"new Premier League kits 2026/27 buy online"`. Kit releases drive seasonal search spikes every May-July. Kitbag CTAs on every team page. | `"Arsenal 2026/27 kit buy online"`, `"Liverpool new kit Wirtz shirt"`, `"Man City 2026/27 home jersey Puma"` |

---

## 4. Priority Ranking (Retention ROI)

| Priority | Feature | Why First |
|---|---|---|
| **P0 — Ship Now** | World Cup Minutes Fatigue Tracker (live extension) | World Cup is happening RIGHT NOW. Static blog exists; extend to live minute-tracking tool. Peak seasonal relevance. |
| **P0 — Ship Now** | Kit & Merchandise Hub | Kit releases are live. Commercial revenue from day one. Already have Kitbag integration. |
| **P1 — Pre-Season** | Promoted Team Nailed Tracker | Pre-season friendlies start in ~3 weeks. Must be live before first friendly. |
| **P1 — Pre-Season** | New Signing Value Translator | Transfer window opens June 15. Wirtz content already ranks. Extend to tool. |
| **P1 — Pre-Season** | Pre-Season Friendly Minutes Dashboard | Feeds into P1 Nailed Tracker. Same data source, different view. |
| **P2 — GW1 Launch** | Captain Risk Calculator | Must be live before GW1 deadline. Captaincy is the #1 weekly engagement driver. |
| **P2 — GW1 Launch** | 3-GW Transfer Planner with Price Overlay | Core weekly-return tool. Requires FPL API to be live (typically 2-3 weeks before GW1). |
| **P2 — GW1 Launch** | Shareable Mini-League Dashboard | Requires active leagues. Social sharing mechanics drive viral growth from GW1. |
| **P3 — In-Season** | Public EO & Template Summary Pages | Auto-generated weekly. High SEO volume but needs season data. |
| **P3 — In-Season** | Rival Transfer Alerts | Requires active season. Push notifications need user opt-in flow. |

---

## 5. Competitive Moat Summary

| Competitor | Their Moat | FPLRanker Counter-Moat |
|---|---|---|
| **livefpl.net** | 450K users, EO data, What-If Simulator | Public SSR pages that index EO data Google can't get from LiveFPL; pre-deadline captain calculator |
| **fplgameweek.com** | "Impact" algorithm for mini-league events | Shareable league cards + Monte Carlo predictions — turns their locked data into viral social content |
| **livefpltables.com** | Simplicity + fast load + 450K users | Same simplicity but with push notifications, sharing, and predictions layered on top |
| **fpl.page** | Design quality + FFS partnership | Match the design (already done), exceed the depth with interactive tools and weekly-return hooks |

**FPLRanker's unique position:** The only competitor combining (1) modern glassmorphism UI, (2) server-rendered SEO-indexable content, (3) affiliate monetisation via Kitbag, (4) social sharing mechanics, and (5) preseason content pipeline. No competitor covers more than 2 of these 5 pillars.

---

*Next update: Post-WC Group Stage + Transfer Window Opening (June 15-20, 2026)*

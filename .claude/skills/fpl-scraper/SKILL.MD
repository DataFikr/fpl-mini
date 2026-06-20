---
name: fpl-scraper
description: Actively searches the web for FPL community discussions, competitor complaints, trending topics, and kit/transfer intent to extract feature ideas, keywords, and monetization signals.
use-when: The user wants to gather fresh community intelligence, track competitor sentiment, or identify trending FPL topics for the current season phase.
---

# FPL Community Scraper & Intent Analyzer

## Role
You are a community intelligence gatherer for fplranker.com. You actively search the web for FPL community signals, competitor complaints, and trending topics. You produce structured intelligence that feeds directly into the fpl-researcher and fpl-competitor-gap skills.

## Tools
Use the **WebSearch** tool for all searches. Do NOT rely on curl or user-supplied text dumps. Run multiple searches per session to triangulate signals.

## Instructions

### Step 1: Seasonal Context Check
Determine the current FPL season phase and adjust search queries accordingly:

| Phase | Months | Search Focus |
|-------|--------|-------------|
| **World Cup / International Tournament** | Jun-Jul (tournament years) | Fatigue, minutes tracking, squad rotation, "who to avoid GW1" |
| **Transfer Window** | Jun-Aug | New signings, price predictions, "is [player] worth it", kit launches |
| **Pre-Season** | Jul-Aug | Friendly lineups, nailed starters, promoted team assets, template teams |
| **Early Season** | Aug-Oct | GW1 templates, wildcard timing, captain picks, early differentials |
| **Mid-Season** | Nov-Feb | Chip strategy, blank/double gameweeks, fixture swings |
| **Run-In** | Mar-May | Free Hit targets, bench boost timing, mini-league chases |

### Step 2: Community Signal Search
Run these WebSearch queries (adapt phrasing to current season phase):

**Reddit / Forum signals:**
- `site:reddit.com/r/FantasyPL [current topic] 2026`
- `FPL community [feature request / frustration / tool] reddit 2026`
- `"I wish" OR "is there a tool" OR "why can't" FPL reddit`

**Competitor-specific complaints:**
- `"livefpl" slow OR broken OR down OR not working`
- `"fplgameweek" problems OR complaints OR alternative`
- `"livefpltables" missing OR wish OR need`
- `"fpl.page" issues OR lacks OR alternative`
- `"premierfantasytools" review OR comparison`

**Trending topics:**
- `FPL [current gameweek or event] trending discussion 2026`
- `Fantasy Premier League most discussed topics this week`

**Kit and transfer intent:**
- `Premier League new kit 2026/27 buy`
- `[marquee signing name] shirt buy online`
- `FPL new signing price prediction [transfer window]`

### Step 3: Signal Extraction
From search results, extract and categorize:

1. **Feature Gaps** — Tools or stats users say are missing, slow, or broken on competitor sites
2. **Long-Tail Keywords** — Exact phrases users type when asking questions (these become SEO targets)
3. **Competitor Pain Points** — Specific complaints about livefpl, fplgameweek, livefpltables, fpl.page, or premierfantasytools
4. **Hot Kit Intent** — Which clubs/players have the highest merchandise buzz right now
5. **Seasonal Urgency Signals** — Topics with a time-limited window (e.g., "GW1 template" only matters in Aug)

### Step 4: Structured Output
Append findings to `docs/research/preseason_intent.md` in this format:

```markdown
## [N]. Scrape Log — [Date]

> Sources: [list URLs/forums searched]
> Season Phase: [current phase from Step 1]

### Feature Gaps Identified

| Feature Requested | Community Signal (quote or paraphrase) | Competitor Affected | Urgency (Now/Soon/Later) |
|---|---|---|---|

### Competitor Complaints

| Competitor | Complaint | Frequency Signal (one-off vs recurring) | FPLRanker Opportunity |
|---|---|---|---|

### Trending Keywords

| Keyword Phrase | Search Intent | Volume Signal (High/Med/Low) | Content Type (Blog/Tool/Page) |
|---|---|---|---|

### Kit & Transfer Intent

| Club/Player | Hype Signal | Kitbag CTA Opportunity |
|---|---|---|
```

### Step 5: Priority Tagging
Tag each finding with a pipeline action:
- **[RESEARCH]** — Needs deeper analysis by fpl-researcher
- **[GAP]** — Feeds into fpl-competitor-gap analysis
- **[BUILD]** — Ready for fpl-feature-builder
- **[CONTENT]** — Ready for fpl-marketing-agent content brief
- **[AFFILIATE]** — Immediate Kitbag/Impact opportunity

## Key Principles
- Always run at least 5 different WebSearch queries per session
- Quote exact community language — these become keyword targets
- Prioritize recency — signals from the last 7 days are 10x more valuable than older ones
- Track competitor complaints specifically — each complaint is a traffic capture opportunity
- Flag any signal that has BOTH high community demand AND competitor weakness

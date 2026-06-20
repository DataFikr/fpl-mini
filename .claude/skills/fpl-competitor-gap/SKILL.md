---
name: fpl-competitor-gap
description: Data-driven competitive analysis using real traffic metrics (visits, authority, bounce rate) for 5 FPL competitors. Produces a traffic-weighted feature matrix with priority scoring based on capturable traffic opportunity.
use-when: The user wants to map competitor features against community demand, identify traffic capture opportunities, or update the competitive intelligence benchmark.
---

# FPL Competitor Gap Analyzer — Traffic-Weighted Feature Intelligence

## Role
You are a competitive intelligence analyst for fplranker.com. You combine real traffic metrics with community demand signals to identify exactly which features to build and which competitor traffic they will capture. Your output is the strategic foundation that drives the fpl-feature-builder skill.

## Data Sources
Before producing any analysis, read and cross-reference:

1. **`docs/research/preseason_intent.md`** — Community feature gaps, keywords, kit intent, Research Cards from fpl-researcher
2. **`docs/marketing/organic-growth-plan.md`** — Current marketing plan, KPIs, traffic audit data
3. **WebSearch results** — Current competitor feature sets and community sentiment

## Real Competitor Traffic Metrics (April 2026)

| Competitor | Monthly Visits | Authority Score | Bounce Rate | Dissatisfied Pool (Visits x Bounce) |
|------------|---------------|-----------------|-------------|--------------------------------------|
| **livefpl.net** | 3.23M | 38 | 57.56% | ~1,859,000 |
| **fplgameweek.com** | 1.14M | 34 | 54.98% | ~627,000 |
| **livefpltables.com** | 281K | 18 | 61.32% | ~172,000 |
| **fpl.page** | 230K | 36 | 67.52% | ~155,000 |
| **premierfantasytools.com** | NEW | TBD | TBD | TBD — monitor |

**FPLRanker current:** ~195 visits/month, ~1,562 total users over 8 months.

## Instructions

### Step 1: Refresh Competitor Feature Profiles
Use **WebSearch** to get current information about each competitor. Run:

- `site:[competitor domain] features OR tools`
- `"[competitor name]" review features 2026`
- `"[competitor name]" new feature OR update OR launch 2026`

For each competitor, produce:

```markdown
### [Competitor] — [Monthly Visits] visits, [Authority] authority, [Bounce]% bounce

**Core Features:**
- [Feature 1]: [brief description]
...

**Technical Profile:**
- Rendering: [SSR / CSR / Static]
- SEO indexability: [Good / Poor / None]
- Auth requirement: [Yes — FPL ID / No / Partial]
- AEO readiness: [JSON-LD? / FAQPage schema? / Semantic HTML?]
- Affiliate monetization: [Yes — what / No]
- Social sharing: [Yes — how / No]
- Mobile: [App / PWA / Responsive / Poor]

**Key Weaknesses (traffic leakage points):**
1. [Weakness] — estimated [X]% of bounce traffic attributable to this
2. [Weakness] — estimated [X]% of bounce traffic attributable to this
```

### Step 2: Community Demand Cross-Reference
Read `docs/research/preseason_intent.md` and extract every Feature Gap and Research Card. For each one:

1. Check which competitors currently address it (fully, partially, or not at all)
2. Check which competitors' users are complaining about it
3. Estimate the traffic pool: `competitor_visits * bounce_rate * relevance_factor`

The `relevance_factor` (0.01 to 0.20) estimates what fraction of bounced users left because of this specific gap:
- 0.15-0.20: Core missing feature (e.g., livefpl has no preseason content = 20% of June bounce)
- 0.05-0.14: Secondary gap (e.g., fplgameweek has no sharing = 10% frustration-driven bounce)
- 0.01-0.04: Marginal improvement (e.g., fpl.page design could be slightly better)

### Step 3: Traffic-Weighted Feature Matrix
Generate the core output table:

| Rank | Feature | Competitor Target | Their Flaw | Monthly Bounce Pool | Relevance Factor | Capturable Traffic | Community Demand (1-10) | SEO/AEO Entry Point | Affiliate Angle | Priority |
|------|---------|------------------|------------|---------------------|------------------|--------------------|------------------------|---------------------|-----------------|----------|

**Capturable Traffic** = Bounce Pool * Relevance Factor * 0.05 (conservative 5% capture rate)

**Priority levels:**
- **P0 — Ship Now**: Capturable traffic > 500/month AND seasonal urgency (expires within 30 days)
- **P1 — Pre-Season**: Capturable traffic > 200/month AND needed before GW1
- **P2 — GW1 Launch**: Capturable traffic > 100/month AND enhances weekly retention
- **P3 — In-Season**: Everything else, sorted by capturable traffic descending

### Step 4: Feature Specification Briefs
For each P0 and P1 feature, produce:

```markdown
### [Feature Name] — Priority [P0/P1]

**Traffic Target:** [X] capturable monthly visits from [competitor]
**Competitor Flaw:** [specific weakness being exploited]
**Community Validation:** [quote or reference from preseason_intent.md]

**Implementation:**
- Route: `/[path]`
- Rendering: SSR (required for SEO indexing)
- Existing patterns to reuse:
  - JSON-LD: `components/seo/structured-data.tsx` (StructuredData component)
  - Affiliate: `utils/kitbag-urls.ts` (getKitbagUrl function)
  - Blog layout: `src/app/blog/[slug]/layout.tsx` for metadata pattern
- Estimated effort: [Small / Medium / Large]

**SEO Requirements:**
- Primary keyword: `[exact phrase]`
- Secondary keywords: `[2-3 phrases]`
- JSON-LD type: [FAQPage / HowTo / WebApplication / Dataset]
- Meta title: `[60-70 chars]`
- Meta description: `[150-160 chars]`

**Affiliate Integration:**
- Kitbag CTA: [contextual placement description]
- Team ID(s): [from utils/kitbag-urls.ts]
- Impact tracking: `rel="sponsored nofollow"` on all affiliate links

**Retention Hook:** [why users return weekly]
```

### Step 5: Competitive Moat Summary
Update the moat analysis:

| Pillar | livefpl | fplgameweek | livefpltables | fpl.page | premierfantasytools | FPLRanker |
|--------|---------|-------------|---------------|----------|---------------------|-----------|
| SSR SEO indexing | No | No | Partial | Yes | TBD | **Yes** |
| AEO / JSON-LD | No | No | No | No | TBD | **Yes** |
| Affiliate monetization | No | No | No | No | TBD | **Yes (Kitbag)** |
| Social sharing | No | No | No | No | TBD | **Yes** |
| Preseason content | No | No | No | Partial | TBD | **Yes** |
| Modern UI | Dated | Clean | Minimal | **Best** | TBD | **Yes** |
| Interactive tools | **Strong** | Strong | Weak | Medium | TBD | Building |

### Step 6: Save Output
Save the complete analysis to `docs/research/competitor_gap_analysis.md`, replacing the previous version. Include all sections above plus timestamp and data source citations.

## Key Principles
- All traffic numbers must reference the real metrics in this skill — never invent visit counts
- Always use WebSearch to verify current competitor features before assuming profiles are accurate
- The "Dissatisfied Pool" (visits * bounce rate) is the addressable market
- premierfantasytools.com is a new entrant — use WebSearch to discover their features and monitor growth
- Every feature in the matrix must trace back to a community demand signal in preseason_intent.md
- Capturable traffic estimates use 5% capture rate — conservative to maintain credibility
- Feature specs must reference existing codebase patterns (structured-data.tsx, kitbag-urls.ts, blog layout)

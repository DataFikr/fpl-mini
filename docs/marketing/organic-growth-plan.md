# FPLRanker Organic Growth Plan

> Generated: 2026-06-11
> Data period: Oct 1, 2025 - Jun 11, 2026
> Sources: GA4 (Generate Leads Overview, User Engagement & Retention Overview), docs/research/preseason_intent.md, docs/research/competitor_gap_analysis.md

---

## A. Traffic Audit Summary

### Headline Numbers

| Metric | Value |
|--------|-------|
| Total active users | 1,562 |
| New users | ~1,560 |
| Returning user sessions | ~450 |
| Qualified leads | 0 |
| Converted leads | 0 |
| Week 1 retention | 3-6% |
| Week 2 retention | ~0-3% |

### Channel Attribution (New Users)

| Channel | New Users | Share |
|---------|-----------|-------|
| Direct | 785 | 50.3% |
| Organic Search | 539 | 34.5% |
| Organic Social | 155 | 9.9% |
| Referral | 44 | 2.8% |
| Unassigned | 35 | 2.2% |
| AI Assistant | 2 | 0.1% |

### Session Sources (Ranked)

| Source | Sessions | Type |
|--------|----------|------|
| Google | 783 | Search |
| reddit.com + old.reddit.com | 222 | Social/Referral |
| Bing | 91 | Search |
| chatgpt.com | 82 | AI |
| t.co (Twitter/X) | 32 | Social |
| vercel.com | 23 | Referral |
| Facebook (m + desktop + l) | 33 | Social |
| Yahoo (uk + general) | 18 | Search |
| DuckDuckGo | 7 | Search |
| copilot.com | 6 | AI |
| claude.ai | 1 | AI |
| gemini.google.com | 1 | AI |

**AI traffic combined: 90 sessions (6.5% of all search-adjacent traffic)**. This is an emerging channel growing faster than traditional search for niche query types.

### Top Geographies

| City | Users | Priority |
|------|-------|----------|
| London | 136 | Core UK market |
| Singapore | 70 | APAC FPL hub |
| Bath | 43 | UK cluster |
| Dublin | 36 | UK/IE |
| Kuala Lumpur | 32 | Malaysia FPL community |
| Sydney | 22 | Australia |
| Birmingham | 18 | UK |
| Dallas | 18 | US emerging |
| Manchester | 17 | UK |
| Oslo | 17 | Scandinavia FPL hub |

**Insight:** User base is overwhelmingly English-speaking with strong UK core. Malaysia/Singapore represent a disproportionately large APAC cluster - likely driven by active FPL communities in those regions.

### Page Performance

| Page Type | Top Example | Views |
|-----------|-------------|-------|
| Homepage | FPL Ranker - Fantasy Premier League Mini-League Analytics | 3,038 |
| League Hub (top) | Jogha Bonito | 154 |
| League Hub (2nd) | Best Man League | 145 |
| Blog Hub | Blog - FPL Tips and Content | 31 |
| Blog Post (FDR) | Top 5 FPL Fixture Difficulty (FDR) Tools | 9 |
| Blog Post (Fatigue) | FPL 2026/27 World Cup Fatigue Tracker & Official New Kit Guide | 4 |
| About Page | About Us - FPLRanker | 2 |

**Critical insight:** League Hub pages collectively drive the majority of non-homepage traffic, but blog/content pages account for less than 3% of all views. The blog is functionally invisible to search. The homepage captures 55%+ of all pageviews, indicating users arrive directly and don't navigate deeper.

### Retention Crisis

| Cohort | Week 0 | Week 1 | Week 2 | Week 3 |
|--------|--------|--------|--------|--------|
| Apr 26 - May 2 | 36 | 2 (5.6%) | 1 (2.8%) | 0 |
| May 3 - May 9 | 31 | 0 (0%) | 0 (0%) | 2 (6.5%) |
| May 10 - May 16 | 49 | 3 (6.1%) | 3 (6.1%) | 0 |
| May 17 - May 23 | 66 | 11 (16.7%) | 2 (3.0%) | - |
| May 24 - May 30 | 297 | 1 (0.3%) | - | - |
| May 31 - Jun 6 | 53 | - | - | - |

**May 24-30 spike** (297 users, likely a Reddit post) had the worst retention of any cohort (0.3% Week 1). Viral traffic without retention hooks is wasted traffic.

### Traffic Spike Analysis

Two major acquisition spikes visible in the daily data:
1. **Days 147-158** (~Feb 24 - Mar 7): Peak day 157 = 239 new users. Likely a Reddit post or viral share.
2. **Days 231-237** (~May 20 - May 26): Peak day 236 = 119 new users. Coincides with end-of-season FPL activity.

Both spikes decayed within 3-5 days with no sustained traffic lift. No retention infrastructure captured these users.

---

## B. Three Critical Problems

### Problem 1: Content is invisible to search engines

Blog pages account for <3% of total views. The FDR blog post has 9 lifetime views. The World Cup Fatigue post has 4 views. League Hub pages drive traffic but are client-rendered (invisible to Googlebot) and gated behind FPL IDs (no public crawlable content).

**Root cause:** No programmatic SEO pages targeting long-tail queries. Blog posts exist but have no internal linking, no backlink strategy, and no structured data for AI search engines.

**Impact:** 539 organic search users in 8 months = ~67/month. Competitors like livefpltables.com attract 450K users with simpler features because their pages are indexable.

### Problem 2: Retention is catastrophic (97% single-session bounce)

Average Week 1 retention across all cohorts is ~5%. By Week 2, it's effectively zero. The site has no mechanism to bring users back: no email capture, no push notifications, no personalized alerts, no "reason to return" beyond checking a league table.

**Root cause:** The product is a lookup tool (check league → leave), not a habit-forming platform. No weekly rituals or notification hooks exist.

**Impact:** 1,562 users acquired, ~75 ever returned. Customer acquisition cost is wasted 95% of the time.

### Problem 3: Affiliate funnel produces zero conversions

Zero qualified leads and zero converted leads across the entire 8-month data period. The Kitbag/Impact affiliate integration exists on the World Cup Fatigue blog post, but either: (a) Impact tracking pixels aren't firing correctly in production, (b) GA4 isn't configured to capture affiliate click events, or (c) no one is clicking (4 blog views).

**Root cause:** Affiliate CTAs are buried on a page with 4 views. No dedicated commercial landing page exists. No click tracking events configured in GA4.

**Impact:** Zero revenue from 1,562 users despite having Kitbag partnership active.

---

## C. Organic Search Strategy

### C1. Programmatic SEO - Long-Tail Landing Pages

Build indexable, SSR landing pages targeting high-intent keyword clusters identified in the research docs.

**Priority pages (P0 - ship immediately):**

| Route | Target Keyword Cluster | Wireframe |
|-------|----------------------|-----------|
| `/tools/fatigue-tracker` | `FPL world cup fatigue 2026`, `which FPL players to avoid after world cup`, `FPL GW1 template world cup fatigue` | Ready (`docs/wireframes/fatigue-tracker.html`) |
| `/kits` | `new Premier League kits 2026/27 buy online`, `Arsenal 2026/27 kit buy`, `Liverpool 2026/27 kit Wirtz shirt` | Ready (`docs/wireframes/kits-hub.html`) |

**P1 pages (pre-season):**

| Route | Target Keyword Cluster |
|-------|----------------------|
| `/tools/nailed-tracker` | `best 4.5 defenders FPL 2026/27 promoted teams`, `Coventry FPL picks nailed starters` |
| `/tools/new-arrivals` | `Florian Wirtz FPL price 2026/27 worth it`, `best new signings FPL 2026/27` |
| `/players/[slug]` | `[Player name] FPL 2026/27` (programmatic, 50+ pages) |

**P2 pages (GW1 launch):**

| Route | Target Keyword Cluster |
|-------|----------------------|
| `/tools/captain-calculator` | `FPL captain pick calculator`, `should I captain [player] FPL` |
| `/tools/transfer-planner` | `FPL transfer planner 3 gameweeks`, `FPL price prediction tool 2026/27` |
| `/league/[id]` | `FPL mini league tracker`, SSR public league pages for Google indexing |

**Implementation requirements for all pages:**
- Server-side rendered (SSR) with Next.js App Router
- `<title>` and `<meta description>` matching primary keyword cluster
- JSON-LD structured data (see C2)
- Internal links to related blog posts and tools
- Kitbag affiliate CTA where relevant (see Section D)

### C2. Answer Engine Optimization (AEO)

ChatGPT already sends 82 sessions — 6.5% of search-adjacent traffic. Combined with Copilot (6) and Claude (1), AI referrals total 89 sessions. This channel is growing and competitors have zero AEO optimization.

**Actions:**

1. **FAQPage schema** on every tool and blog page. Structure 3-5 Q&A pairs per page using actual community questions from `preseason_intent.md`:
   - "Which FPL players should I avoid after the World Cup?"
   - "Is Florian Wirtz worth his FPL price?"
   - "What are the best 4.5M defenders from promoted teams?"
   - "When should I wildcard after the World Cup?"

2. **HowTo schema** on tool pages:
   - "How to use the FPL World Cup Fatigue Tracker"
   - "How to plan FPL transfers 3 gameweeks ahead"

3. **Clean semantic HTML** — AI scrapers extract content from well-structured headings, lists, and tables. Every tool page should include:
   - A `<h1>` matching the primary query
   - A summary paragraph (50-80 words) answering the query directly
   - A data table or structured list with the actual answer
   - A FAQ section at the bottom

4. **`robots.txt` and `sitemap.xml`** — Ensure all SSR pages are crawlable. Current client-rendered league pages should be excluded from sitemap (they require auth context).

### C3. Blog Content Pipeline

**Phase 1 — NOW (World Cup active, June 2026):**

| Post Title | Primary Keyword | Kitbag CTA | Internal Link To |
|------------|----------------|------------|------------------|
| "Best FPL Differentials After the 2026 World Cup" | `best FPL differentials after world cup 2026` | Per-player kit CTAs (Watkins→Villa, Gakpo→Liverpool) | `/tools/fatigue-tracker`, `/blog/world-cup-fatigue` |
| "FPL GW1 Captain Pick: Who to Trust After the World Cup" | `FPL GW1 captain pick world cup fatigue 2026` | Haaland→City, Saka→Arsenal kit CTAs | `/tools/fatigue-tracker`, `/tools/captain-calculator` |
| "Florian Wirtz FPL Guide: Is Liverpool's 116M Man Worth His Price?" | `Florian Wirtz FPL price 2026/27 worth it` | Liverpool kit + Wirtz shirt CTA | `/kits`, `/tools/new-arrivals` |

**Phase 2 — Pre-season (July-August 2026):**

| Post Title | Primary Keyword | Kitbag CTA |
|------------|----------------|------------|
| "Promoted Teams FDR Guide: Coventry, Ipswich & Hull" | `FPL promoted teams fixture difficulty 2026/27` | Budget kit CTAs |
| "Best 4.5M Defenders FPL 2026/27" | `best 4.5 defenders FPL 2026/27` | Promoted team kit CTAs |
| "When to Wildcard After the World Cup — GW2, GW3, or GW4?" | `when to wildcard after world cup FPL 2026` | N/A |
| "12 FPL-Safe GW1 Picks With No World Cup Risk" | `FPL safe picks GW1 no world cup risk` | Per-player kit CTAs |

**Content structure for every blog post:**
- 1,500-2,500 words
- JSON-LD `Article` schema with `mentions` for players
- FAQPage schema with 3 community questions
- 2-3 internal links to tool pages
- 1-2 Kitbag affiliate CTAs with Impact tracking
- Social sharing meta tags (og:title, og:image, og:description)
- Descriptive alt text on all images (AI carousel indexing)

### C4. Retention Hooks

**Immediate (reduce 97% bounce):**

1. **Email capture** — Newsletter signup CTA on every blog post footer and tool page sidebar. Offer: "Get weekly FPL insights before deadline." Use existing cron email infrastructure.
2. **Bookmark prompt** — After first visit to a league page, prompt "Add to home screen" (PWA) or "Bookmark this page for matchday."
3. **Content freshness signals** — Add "Last updated" timestamps and "Next update: [day]" to tool pages. Creates expectation of return.

**Mid-term (P2/P3):**

4. **Push notifications** — "Your rival just made a transfer" alerts
5. **Weekly email digest** — Auto-generated GW summary with league position changes
6. **Shareable social cards** — League standing cards for WhatsApp/Twitter sharing (viral loop)

---

## D. Kitbag Affiliate Optimization

### Current State
- Impact/Kitbag integration exists on World Cup Fatigue blog post only
- 5 team ad assets configured (Arsenal, Liverpool, Man City, Man Utd, Villa)
- Display ad images served via `a.impactradius-go.com`
- Tracking pixels via `imp.pxf.io`
- Zero conversions tracked in GA4

### Fix Tracking
1. Verify Impact tracking pixel fires on page load (check Network tab in production)
2. Add GA4 `click` events on all `<a>` tags with `rel="sponsored"` pointing to Impact/Kitbag URLs
3. Configure GA4 conversions for `affiliate_click` event
4. Set up Impact postback URL for server-side conversion tracking

### Expand Coverage
1. **`/kits` landing page** — Wireframe ready. All 20 PL clubs with Kitbag deep-links. Target commercial keywords.
2. **Blog post CTAs** — Every blog post mentioning a specific club gets a contextual kit CTA. Example: In a Wirtz analysis post, embed "Get the Wirtz 10 Liverpool shirt" with Impact tracking link.
3. **Player profile pages** — Each `/players/[slug]` page gets a "Buy [Player] Shirt" CTA linked to Kitbag.
4. **Seasonal landing pages** — "Champions Kit" CTA for Arsenal, "New Signing Kit" for Liverpool/Wirtz, "New Era Kit" for Man City post-Guardiola.

### Revenue Projection (conservative)
- Current: 0 clicks, 0 conversions
- With `/kits` page (500 monthly visitors) at 5% CTR and 2% conversion: ~5 sales/month
- With blog CTAs across 6 posts (1,000 monthly visitors) at 3% CTR and 2% conversion: ~6 sales/month
- Total: ~11 Kitbag sales/month at estimated 5-8% commission = baseline revenue

---

## E. 90-Day Roadmap

### Weeks 1-2: Ship P0 Pages
- Build and deploy `/tools/fatigue-tracker` (wireframe ready)
- Build and deploy `/kits` hub page (wireframe ready)
- Fix Impact tracking pixel verification
- Add GA4 affiliate click events
- **Target:** +500 organic sessions/month from long-tail queries

### Weeks 2-3: Content Blitz
- Publish "Best FPL Differentials After the 2026 World Cup"
- Publish "FPL GW1 Captain Pick: Who to Trust After the World Cup"
- Publish "Florian Wirtz FPL Guide"
- Add FAQPage schema to all new content
- **Target:** +200 organic sessions/month

### Weeks 3-4: AEO Foundation
- Add FAQPage and HowTo schema to all tool and blog pages
- Create sitemap.xml including all SSR pages
- Submit updated sitemap to Google Search Console and Bing Webmaster Tools
- **Target:** +50 AI referral sessions/month (from 89 baseline)

### Weeks 4-6: Programmatic Player Pages
- Build `/players/[slug]` template
- Generate 50+ player profile pages with JSON-LD Person schema
- Each page: stats, FDR overlay, Kitbag CTA, FAQ pairs
- **Target:** +1,000 long-tail sessions/month

### Weeks 6-8: P2 Tools
- Build captain risk calculator
- Build 3-GW transfer planner
- Add email newsletter signup CTAs across all pages
- **Target:** +300 returning users/month

### Weeks 8-12: Retention Infrastructure
- Push notification system for rival transfer alerts
- Weekly auto-generated EO/template summary pages
- Newsletter email digest automation
- **Target:** Week 1 retention from 3% to 15%

---

## F. KPIs to Track

| Metric | Current | 30-Day Target | 90-Day Target |
|--------|---------|---------------|---------------|
| Monthly organic search users | ~67 | 200 | 1,500 |
| Monthly AI referral users | ~11 | 25 | 100 |
| Blog page views (monthly) | ~5 | 100 | 1,000 |
| Week 1 retention | 3-5% | 8% | 15% |
| Kitbag affiliate clicks | 0 | 50 | 300 |
| Kitbag conversions | 0 | 5 | 30 |
| Email subscribers | 0 | 50 | 500 |
| Indexed pages (GSC) | ~5 | 20 | 75 |

---

*Next review: Post-World Cup Group Stage (June 20-25, 2026)*

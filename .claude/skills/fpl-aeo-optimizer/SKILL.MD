---
name: fpl-aeo-optimizer
description: Transforms site pages into AI-scraper-optimized content with structured JSON-LD, visually attractive FAQ accordions, semantic heading hierarchies, and clean QA layouts that serve both LLM extraction and human readability.
use-when: The user wants to optimize code or text components for AI engine retrieval, voice search, or structured data validation.
---

# AEO Optimizer — AI Search & Visual Design

## Design System Reference
Read `tailwind.config.ts` and `src/app/globals.css` for FR-DLS tokens. Read `docs/design/analytics_wireframe_feed.md` for existing AEO semantic patterns. (FR-DLS / Tailwind applies to public marketing + pSEO pages; the `/app` shell uses a separate CSS-variable system — don't mix them.)

## Codebase Guardrails (READ FIRST)

These come from the 2026 SEO/AEO audit. AEO content is worthless if a crawler/LLM can't fetch a clean, single-entity, server-rendered page. Enforce these before any visual work:

1. **Canonical & domain discipline (highest priority).** The repo historically hard-codes THREE domains (`fplranker.com`, `fpl-mini.vercel.app`, `fpl-league-hub.vercel.app`). The canonical home is **`fplranker.com`**. Every URL, OG tag, and JSON-LD `url`/`@id` MUST come from the shared constant `SITE_URL` (and `SITE_NAME='FPL Ranker'`) in `src/lib/seo.ts`. Never hard-code a `*.vercel.app` host. Every page's `generateMetadata` MUST set `alternates: { canonical: '<absolute fplranker.com URL>' }`.

2. **Crawlability prerequisite.** Answer content MUST be server-rendered HTML. Never put the h1, summary paragraph, FAQ answers, or key facts behind a `'use client'` component with no SSR fallback — crawlers and LLM scrapers see empty HTML. For an interactive page, add a sibling **server `layout.tsx`** that exports `metadata` (+ canonical) and JSON-LD, and render an SSR answer-first block (h1 + 50–80 word summary + key facts) ABOVE the client island. Working example to copy: `src/app/blog/world-cup-fatigue/layout.tsx`.

3. **Discovery files must include the page.** After optimizing a page: (a) add its route to `src/app/sitemap.ts` (currently lists only a few stale URLs — fix to `SITE_URL`); (b) ensure it's listed/summarized in `public/llms.txt`; (c) ensure `src/app/robots.ts` explicitly allows answer-engine agents — `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `anthropic-ai`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Amazonbot`, `Bingbot` — and points `sitemap` at `${SITE_URL}/sitemap.xml`.

4. **Current JSON-LD state.** `src/components/seo/structured-data.tsx` ships ONLY `WebSite` + `Organization`, both with the wrong name ("FPL League Hub") and wrong domain, injected on the homepage only. Treat fixing/extending it (see §4) as part of the job, not a given.

## Instructions

### 1. Heading Restructure
Analyze the target page and rewrite headers as direct, high-volume questions:
- Change "Expected Minutes Model" → "Who is predicted to play the most minutes in Gameweek 1?"
- Change "Price Changes" → "Which FPL players are rising and falling in price this week?"
- Maintain single `<h1>` as primary keyword query, `<h2>` for sections, `<h3>` for sub-topics
- No skipped heading levels (h1 → h2 → h3, never h1 → h3)

### 2. Summary Paragraph (AI Extraction Target)
Every page must have a 50-80 word summary paragraph immediately after `<h1>`:
- Position: first content element, before any interactive components
- Styling: `font-inter text-lg text-fpl-text-secondary leading-relaxed max-w-2xl`
- Purpose: AI scrapers (ChatGPT, Copilot, Gemini) extract this for featured answers
- Must directly answer the primary query without preamble

### 3. FAQ Accordion Design

> **Reuse + fix:** the existing FAQ component `src/app/app/_components/Faq.tsx` currently renders an accordion with **no FAQPage JSON-LD**. When touching FAQs, emit `FAQPage` schema (via the shared builder, §4) AND keep every answer in the rendered DOM. Use `max-height`/visually-hidden collapse only — never `display:none`, `hidden`, or conditional unmount, or the answer is invisible to scrapers and AI extraction. Working FAQPage reference: `src/app/master-the-league/page.tsx`.

#### Visual Design: `<FaqAccordion />`
```
Container: glass-card-dark, divide-y divide-slate-700/30, overflow-hidden, rounded-fpl
Each item:
  Header (closed): px-5 py-4, flex justify-between items-center, cursor-pointer
    Question: font-jakarta font-semibold text-sm text-white
    Chevron: w-4 h-4 text-fpl-text-secondary, rotate-180 transition-transform duration-200 when open
  Header (open): bg-fpl-primary/10 border-l-2 border-fpl-accent
  Body: px-5 py-4 font-inter text-sm text-fpl-text-secondary leading-relaxed
    Max-height animation: 0 -> auto with overflow-hidden, transition-[max-height] duration-300
```

#### Semantic HTML Structure
```html
<section itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Question text?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div itemprop="text">Answer text.</div>
    </div>
  </div>
</section>
```

### 4. JSON-LD Schema Injection
Use the reusable builders in `src/components/seo/structured-data.tsx`. Today it only has `WebSite` + `Organization` (wrong name/domain) — extend it with shared, `SITE_URL`-based builders and reuse them everywhere: `OrganizationStructuredData`, `WebsiteStructuredData`, `WebApplicationStructuredData`, `ArticleStructuredData` (BlogPosting), `FaqStructuredData` (FAQPage), `BreadcrumbStructuredData` (BreadcrumbList), `DefinedTermSetStructuredData` (glossary).

**Rules:**
- All `url`/`@id`/`logo`/`sameAs` values derive from `SITE_URL` (`src/lib/seo.ts`); `Organization` uses `SITE_NAME='FPL Ranker'` and real `sameAs` socials (pull from `src/components/ui/footer.tsx`).
- Inject `Organization` + `WebSite` + `WebApplication` **sitewide** in `src/app/layout.tsx` (not just the homepage).
- `WebApplication`: free tool → `applicationCategory: 'SportsApplication'`, `offers: { price: '0', priceCurrency: 'USD' }`.

**Schema selection per page type** (always pair the page type with `FAQPage` + `BreadcrumbList`):
- Tools/calculators: `WebApplication` + `FAQPage`
- Data dashboards: `Dataset` + `FAQPage`
- Blog posts: `Article`/`BlogPosting` + `FAQPage`
- Player pages: `Person` + `Dataset` + `FAQPage`
- Glossary/definition content: `DefinedTermSet` (see §5b)

### 5. Table Semantic Enhancement
For data tables:
- `<table itemscope itemtype="https://schema.org/Table">`
- `<caption class="sr-only" itemprop="description">` with descriptive content
- `<th itemprop="name" scope="col">` on all header cells
- `<thead>` / `<tbody>` separation with `sticky top-0` header
- Cell formatting per FR-DLS: numeric columns `text-right font-mono`, positive `text-emerald-400`, negative `text-red-400`

### 5b. FPL Glossary / DefinedTerm (high citation value)
Answer engines love quotable, unambiguous definitions. For any page that uses FPL jargon, define the terms inline (term + one-sentence definition) and emit a `DefinedTermSet`. Maintain a canonical glossary (a `/glossary` page is ideal) covering at least: FPL, mini-league, GW (gameweek), BPS (Bonus Point System), xG, FDR (Fixture Difficulty Rating), EO (effective ownership), differential, and the chips (Wildcard, Free Hit, Bench Boost, Triple Captain). Mirror the same definitions in `public/llms.txt` so they're available without rendering.

### 6. Validation Checklist
After optimization, verify:
- [ ] Single `<h1>` matching primary search query
- [ ] 50-80 word summary paragraph directly below `<h1>`, **server-rendered** (visible in no-JS `curl`)
- [ ] `<link rel="canonical">` present and absolute on `SITE_URL`; no `*.vercel.app` anywhere
- [ ] `FAQPage` JSON-LD with 3-5 community-sourced Q&A pairs; answers present in the DOM (not `display:none`/unmounted)
- [ ] Page added to `src/app/sitemap.ts` and reflected in `public/llms.txt`
- [ ] `robots.ts` allows answer-engine agents and points to `${SITE_URL}/sitemap.xml`
- [ ] All tables use semantic `<table>` markup (not div grids)
- [ ] `aria-live="polite"` on dynamic content regions
- [ ] `Dataset` or `WebApplication` schema where applicable, all URLs on `SITE_URL`
- [ ] Heading hierarchy: h1 → h2 → h3 (no skipped levels)

## Pipeline Integration
- **Input from:** `fpl-feature-builder` (completed pages needing AEO optimization)
- **Input from:** `fpl-researcher` (community questions for FAQ pairs)
- **Output:** Optimized page code + JSON-LD blocks, route added to sitemap + `llms.txt`
- **Coordinates with:** the shared `src/lib/seo.ts` constants and the foundation discovery files (`robots.ts`, `sitemap.ts`, `public/llms.txt`)
- **Validation:** no-JS `curl` shows the answer text + canonical + JSON-LD; then Google Rich Results Test and Schema.org validator (zero errors, correct domain + name)

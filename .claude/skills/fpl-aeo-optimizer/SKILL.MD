---
name: fpl-aeo-optimizer
description: Transforms site pages into AI-scraper-optimized content with structured JSON-LD, visually attractive FAQ accordions, semantic heading hierarchies, and clean QA layouts that serve both LLM extraction and human readability.
use-when: The user wants to optimize code or text components for AI engine retrieval, voice search, or structured data validation.
---

# AEO Optimizer — AI Search & Visual Design

## Design System Reference
Read `tailwind.config.ts` and `src/app/globals.css` for FR-DLS tokens. Read `docs/design/analytics_wireframe_feed.md` for existing AEO semantic patterns.

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
Use `StructuredData` from `src/components/seo/structured-data.tsx`. Schema selection:
- Tools/calculators: `WebApplication` + `FAQPage`
- Data dashboards: `Dataset` + `FAQPage`
- Blog posts: `Article` + `FAQPage`
- Player pages: `Person` + `Dataset` + `FAQPage`

### 5. Table Semantic Enhancement
For data tables:
- `<table itemscope itemtype="https://schema.org/Table">`
- `<caption class="sr-only" itemprop="description">` with descriptive content
- `<th itemprop="name" scope="col">` on all header cells
- `<thead>` / `<tbody>` separation with `sticky top-0` header
- Cell formatting per FR-DLS: numeric columns `text-right font-mono`, positive `text-emerald-400`, negative `text-red-400`

### 6. Validation Checklist
After optimization, verify:
- [ ] Single `<h1>` matching primary search query
- [ ] 50-80 word summary paragraph directly below `<h1>`
- [ ] `FAQPage` JSON-LD with 3-5 community-sourced Q&A pairs
- [ ] All tables use semantic `<table>` markup (not div grids)
- [ ] `aria-live="polite"` on dynamic content regions
- [ ] `Dataset` or `WebApplication` schema where applicable
- [ ] Heading hierarchy: h1 → h2 → h3 (no skipped levels)

## Pipeline Integration
- **Input from:** `fpl-feature-builder` (completed pages needing AEO optimization)
- **Input from:** `fpl-researcher` (community questions for FAQ pairs)
- **Output:** Optimized page code + JSON-LD blocks
- **Validation:** Test against Google Rich Results Test and Schema.org validator

# DRAFT — review before promoting to src/

> Refreshed with live research 2026-07-26 (WebSearch/WebFetch). Each line-up renders on a pitch via the new `lineups` field + `LineupPitch` component (copyright-clean generic jerseys).
>
> ⚠️ **Verify before publish — extraction confidence varies:**
> - **Official FPL Scout Selection** — HIGH confidence, cleanly extracted from premierleague.com.
> - **Onside Arena** — MEDIUM. The automated fetch labelled "Rogers (Leicester)" — Leicester is not in the 2026/27 PL, so this is a parse error; I've provisionally set Rogers → CHE (Chelsea). Source states 4-3-3 but the extracted XI reads as a 4-4-2 shape. **Confirm the XI against the source link.**
> - **Fantasy Football Fix (Dan Bennett)** — MEDIUM. Only 10 of 11 named in the free preview (4th midfielder undisclosed). Rendered with 10; confirm the missing MID.
> - **FPL General / Dan Wright (Fantasy Football Scout)** — member-only; LINK provided, XI not rendered. Offer to render once you supply the XIs.

---

## BlogPost fields

- **slug:** `fpl-gw1-team-reveals-2026-27`
- **title:** FPL GW1 Team Reveals 2026/27: Official Scout Pick + Creator Drafts
- **category:** Line-ups
- **date:** 2026-07-26
- **kitTeams:** _(none)_

**summary** (50–80 words):
These FPL GW1 team reveals for 2026/27 gather the official Premier League Scout Selection alongside leading content-creator drafts, each rendered on a pitch. The picks agree on a spine of Haaland, Bruno Fernandes and Gabriel, then diverge on formation, budget defenders and differentials. Use them to sanity-check your own Gameweek 1 draft — follow each source link for the full reasoning behind every XI.

**description** (~150 chars):
FPL GW1 team reveals for 2026/27 — the official Scout Selection plus content-creator drafts, each shown on a pitch, with links to every pick.

### sections

**What the GW1 drafts agree on**
- A premium spine recurs across almost every reveal: Erling Haaland up top, Bruno Fernandes in midfield and Gabriel in defence, with Manchester United assets boosted by a soft opening run against promoted sides.
- Promoted-team £4.0m defenders (Charlie Hughes, Bobby Thomas) show up as budget enablers in multiple squads.
- The disagreement is in shape and differentials — 4-4-2 vs 3-4-3, and which mid-priced attacker to back — which is exactly where you can find your edge.

**How to use these line-ups**
- Treat the official Scout Selection as the baseline, then see where the creators deviate and why. Each pitch links to the original pick so you can read the full reasoning.
- Don't copy a draft wholesale — align it with your own captaincy plan and mini-league position. A differential that suits a rank-chaser may not suit a leader protecting a lead.

### lineups (rendered on pitches)

```ts
lineups: [
  {
    source: 'Official FPL — Early Scout Selection',
    sourceUrl: 'https://www.premierleague.com/en/news/4681112/early-scout-selection-the-best-fantasy-squad-for-202627',
    formation: '4-4-2',
    note: 'Attacks Man United’s soft opener (Hull, Ipswich) and uses £4.0m promoted defenders as enablers.',
    players: [
      { name: 'Kinsky', team: 'TOT', position: 'GK' },
      { name: 'Gabriel', team: 'ARS', position: 'DEF' },
      { name: 'Maguire', team: 'MUN', position: 'DEF' },
      { name: 'Calafiori', team: 'ARS', position: 'DEF' },
      { name: 'Hughes', team: 'HUL', position: 'DEF' },
      { name: 'B. Fernandes', team: 'MUN', position: 'MID' },
      { name: 'Cunha', team: 'MUN', position: 'MID' },
      { name: 'Stach', team: 'LEE', position: 'MID' },
      { name: 'Xhaka', team: 'SUN', position: 'MID' },
      { name: 'Haaland', team: 'MCI', position: 'FWD', isCaptain: true },
      { name: 'João Pedro', team: 'CHE', position: 'FWD' },
    ],
  },
  {
    source: 'Onside Arena — FPL Cheat Sheet 2026/27',
    sourceUrl: 'https://onsidearena.com/tips/fpl-cheat-sheet-2026-27',
    formation: '4-4-2', // ⚠️ source states 4-3-3 — verify
    note: 'Captain Haaland; differential Isak; flags Palmer as a trap.',
    players: [
      { name: 'Roefs', team: 'SUN', position: 'GK' },
      { name: 'Gabriel', team: 'ARS', position: 'DEF' },
      { name: 'Robinson', team: 'FUL', position: 'DEF' },
      { name: 'Tarkowski', team: 'EVE', position: 'DEF' },
      { name: 'Murillo', team: 'NFO', position: 'DEF' },
      { name: 'Saka', team: 'ARS', position: 'MID' },
      { name: 'B. Fernandes', team: 'MUN', position: 'MID' },
      { name: 'Semenyo', team: 'BOU', position: 'MID' },
      { name: 'Rogers', team: 'CHE', position: 'MID' }, // ⚠️ fetch said "Leicester" (parse error) — verify club
      { name: 'Haaland', team: 'MCI', position: 'FWD', isCaptain: true },
      { name: 'Watkins', team: 'AVL', position: 'FWD' },
    ],
  },
  {
    source: 'Fantasy Football Fix — Dan Bennett’s draft',
    sourceUrl: 'https://www.fantasyfootballfix.com/blog-index/best-fpl-gameweek-1-team-expert-draft/',
    formation: '3-4-3', // ⚠️ 10 of 11 named; 4th MID undisclosed in free preview
    note: 'Captain Haaland; Anderson as a budget-mid enabler.',
    players: [
      { name: 'Verbruggen', team: 'BHA', position: 'GK' },
      { name: 'Gabriel', team: 'ARS', position: 'DEF' },
      { name: 'Mosquera', team: 'ARS', position: 'DEF' },
      { name: 'Shaw', team: 'MUN', position: 'DEF' },
      { name: 'B. Fernandes', team: 'MUN', position: 'MID' },
      { name: 'Anderson', team: 'MCI', position: 'MID' },
      { name: 'Xhaka', team: 'ARS', position: 'MID' },
      { name: 'Haaland', team: 'MCI', position: 'FWD', isCaptain: true },
      { name: 'João Pedro', team: 'CHE', position: 'FWD' },
      { name: 'Calvert-Lewin', team: 'EVE', position: 'FWD' },
    ],
  },
]
```

**More creator drafts (member-only — links only)** ⚠️ not rendered
- FPL General — first 2026/27 draft, 3-4-3 with Ødegaard: https://www.fantasyfootballscout.co.uk/2026/07/26/fpl-generals-first-2026-27-draft-3-4-3-with-odegaard
- Dan Wright (Hall of Famer) — first draft: https://www.fantasyfootballscout.co.uk/2026/07/24/fpl-2026-27-team-reveals-hall-of-famer-dan-wrights-first-draft

### faq (3–5)

- **Q:** What is the official FPL Scout Selection for GW1 2026/27?
  **A:** A 4-4-2 built around Haaland, Bruno Fernandes and Gabriel, using £4.0m promoted-team defenders (like Hull's Charlie Hughes) as enablers and leaning on Manchester United's soft opening fixtures. See the full XI and reasoning via the Premier League link above.

- **Q:** Which FPL content creators have published GW1 2026/27 drafts?
  **A:** Fantasy Football Fix, Onside Arena and Fantasy Football Scout writers (FPL General, Dan Wright) have all shared early drafts. This page renders the accessible ones on a pitch and links out to each pick, including the member-only reveals.

- **Q:** What do the GW1 drafts have in common?
  **A:** A premium spine of Haaland, Bruno Fernandes and Gabriel, plus £4.0m promoted-team defenders as budget enablers. They differ mainly on formation (4-4-2 vs 3-4-3) and which mid-priced attacker and differentials to back.

- **Q:** Should I copy a creator's FPL team?
  **A:** Use them as a sanity check, not a template. Align any draft with your own captaincy plan and mini-league position — a differential that suits a rank-chaser can be the wrong call for a leader protecting a lead.

### mentions
- Fantasy Premier League — https://en.wikipedia.org/wiki/Fantasy_Premier_League
- Erling Haaland — https://en.wikipedia.org/wiki/Erling_Haaland
- Bruno Fernandes — https://en.wikipedia.org/wiki/Bruno_Fernandes

### sources
- https://www.premierleague.com/en/news/4681112/early-scout-selection-the-best-fantasy-squad-for-202627
- https://onsidearena.com/tips/fpl-cheat-sheet-2026-27
- https://www.fantasyfootballfix.com/blog-index/best-fpl-gameweek-1-team-expert-draft/
- https://www.fantasyfootballscout.co.uk/2026/07/26/fpl-generals-first-2026-27-draft-3-4-3-with-odegaard
- https://www.fantasyfootballscout.co.uk/2026/07/24/fpl-2026-27-team-reveals-hall-of-famer-dan-wrights-first-draft

### internal links
- GW1 template & fatigue guide: `/blog/gw1-template-without-world-cup-players`
- Best £4.0m defenders: `/blog/best-4-5m-defenders-promoted-teams-2026-27`
- Rank my team: `/app`

# FPL Blog Content Log

Provenance and angle decisions for posts authored by the `fpl-blog` skill.

---

## 2026-07-26 — Preseason batch (5 posts) — REVISED with live web research

> **Research basis:** live WebSearch/WebFetch on 2026-07-26, cross-referenced with `docs/research/preseason_intent.md` + `docs/research/competitor_gap_analysis.md`.
> **Season phase:** Pre-season, ~3 weeks before the GW1 deadline.
> **Revisions this session:** dropped the Wirtz transfers post (not a 2026/27 new signing); consolidated World Cup fatigue into the Strategy post (captaincy folded in as a section); rebuilt the Line-ups post around the official FPL Scout Selection + content-creator drafts, each rendered on a pitch via the new `lineups` field.
> **Beat change:** replaced the gameweek-bound **Injuries** beat with an evergreen **Competitor Top-5** beat (draft `best-fpl-tools-2026-27`). This is now a recurring **monthly** mode in the skill — each month, run a fresh competitor analysis and publish a new "Top 5 of X" listicle with outbound editorial links to earn backlinks. New engine field `lists` powers it.

### Live facts captured (with verify flags)
- **Most-owned GW1:** Haaland ≈71.4%, B. Fernandes ≈46.1%, João Pedro ≈45.9%, Szoboszlai ≈37.5%, Rogers ≈36.7%. ⚠️ moves daily.
- **Marquee new signings:** Morgan Rogers (Aston Villa → Chelsea, £118.7m, biggest known fee); Elliot Anderson (Nottingham Forest → Man City, €135m, British record). Chelsea busiest attacking market (Emegha, Garnacho loan). ⚠️ verify prices/positions.
- **Promoted trio:** Coventry, Hull, Ipswich — every promoted-team defender priced at £4.0m (26 of the 46 cheapest defenders). Standouts: Bobby Thomas (COV), Charlie Hughes (HUL, 11.8 defensive contributions/90), Milan van Ewijk (COV). DEFCON scoring central. ⚠️ verify nailed status + threshold.
- **Traps/fatigue:** Cole Palmer flagged as a template trap (prior collapse, unconfirmed bounce under new management); Reece James post-WC fitness concern; deep WC runners get ~3 weeks off. ⚠️ verify.
- **Injuries:** Amadou Onana (AVL) ACL — confirmed long-term out. ⚠️ re-verify all at deadline.
- **Line-up sources:** Official FPL "Early Scout Selection" (premierleague.com) — full XI extracted; Onside Arena cheat sheet; Fantasy Football Fix (Dan Bennett); FPL General & Dan Wright (Fantasy Football Scout, member-only → link only).

### Posts (one long-tail cluster each; five beats)

| # | Slug | Beat | Primary long-tail phrase | Kitbag | Line-up pitches |
|---|------|------|--------------------------|--------|-----------------|
| 1 | `gw1-template-without-world-cup-players` | Strategy | `FPL GW1 template 2026/27 world cup fatigue` | — | — |
| 2 | `best-new-signings-fpl-2026-27` | Transfers | `best new signings FPL 2026/27` | CHE | — |
| 3 | `best-4-5m-defenders-promoted-teams-2026-27` | Tips | `best 4.0m defenders FPL 2026/27 promoted teams` | — | — |
| 4 | `fpl-gw1-team-reveals-2026-27` | Line-ups | `FPL GW1 team reveals 2026/27` | — | Official + Onside + FFFix (3 rendered) |
| 5 | `best-fpl-tools-2026-27` | Evergreen / Competitor Top-5 | `best FPL tools 2026/27` | — | — (uses `lists` block, 5 outbound links) |

### Engine changes made this session (src/)
- `src/content/blog-posts.ts` — added `LineupPlayer` / `BlogLineup` types + optional `lineups` on `BlogPost`.
- `src/components/blog/lineup-pitch.tsx` — new server-rendered pitch (reuses copyright-clean `GenericJersey`).
- `src/app/blog/[slug]/page.tsx` — renders `post.lineups`.
- `src/components/ui/generic-jersey.tsx` — added COV + HUL colours (promoted clubs).

### Extraction-confidence notes (Line-ups post)
- Official FPL Scout Selection — HIGH (clean).
- Onside Arena — MEDIUM (Rogers club parse error "Leicester" → set CHE provisionally; formation label 4-3-3 vs extracted 4-4-2).
- Fantasy Football Fix / Dan Bennett — MEDIUM (10 of 11 named; 4th MID undisclosed).
- FPL General / Dan Wright — member-only, link only (not rendered).

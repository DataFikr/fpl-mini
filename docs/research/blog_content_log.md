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

---

## 2026-08-27 — Gameweek batch (GW1 played → GW2 deadline) — 2 posts

> **Mode:** Gameweek (skill default: exactly 2 posts — 1 reactive, 1 forward).
> **GW detection:** live `bootstrap-static` — GW1 `is_current: true, finished: true, data_checked: true`; GW2 `is_next: true`, deadline `2026-08-28T17:30:00Z` (18:30 BST). Not hard-coded.
> **Research basis:** live FPL API (bootstrap-static, `event/1/live`, `fixtures`) + 11 WebSearch/WebFetch calls on 2026-08-27.

### Sources consulted
- https://www.fantasyfootballscout.co.uk/2026/08/26/two-up-two-down-fpls-first-price-changes-of-2026-27 (fetched — risers/fallers)
- https://www.premierleague.com/en/news/2884829 (fetched — GW2 price changes + top transfers)
- https://www.premierleague.com/en/news/4698173/the-scouts-fpl-gw2-squad-for-wildcarders-and-new-starters (fetched — partial squad only)
- https://sports.yahoo.com/articles/fpl-gameweek-2-scout-picks-173343311.html (fetched — full 15 + 3-5-2 XI + captain)
- https://www.nevermanagealone.com/playerpicks/16409/fpl-gameweek-2-scout-picks-the-best-100m-squad-for-gw2 (403 to WebFetch; Yahoo syndication used instead)
- https://www.nevermanagealone.com/premier-league-preview/16389/premier-league-gw1-review-7-biggest-takeaways-from-a-stunning-opening-weekend
- https://www.fantasyfootballscout.co.uk/2026/08/23/fpl-notes-de-cuyper-hinshelwood-haul-villa-injury-latest
- https://www.fantasyfootballscout.co.uk/2026/08/19/best-fpl-defenders-midfielders-for-defcon-the-ultimate-guide
- https://www.premierleague.com/en/news/4361991/whats-new-in-202526-fantasy-defensive-contributions (DEFCON thresholds, reconfirmed for 2026/27 on 20 Jul 2026)
- https://www.premierleague.com/en/news/4689647/who-is-the-best-fpl-captain-for-gameweek-1 (pre-GW1 captaincy consensus — the thing that went wrong)
- https://www.rotowire.com/soccer/article/fpl-gameweek-2-rankings-best-players-captain-picks-gw2-129843
- https://www.sportsmole.co.uk/football/chelsea/top-four-race/preview/brighton-vs-chelsea-prediction-team-news-lineups_595998.html (BHA team news)
- https://www.fantasyfootballhub.co.uk/fpl-defcon-points-watch (member-only — not used)

### Community phrasing worth targeting (→ keywords + FAQ questions)
- "who scored the most DefCon points in Gameweek 1"
- "Haaland blank" / "one blank is not enough to remove Haaland"
- "stick or twist" (GW2 transfer framing)
- "is De Cuyper a must-buy" / "De Cuyper OOP" (out-of-position)
- "should I take a hit in GW2"
- "biggest talking points" (GW1 review)
- "differentials at 10% ownership or lower"

### Live facts captured (all cross-checked against the FPL API on 2026-08-27)
- **GW1 averages:** average entry score **50**, highest score **131**. Most-captained + most-selected: Haaland.
- **Chips already burned in GW1:** 814,606 Bench Boosts, 250,816 Triple Captains.
- **Template punished:** Haaland (68.0% owned) 2 pts; B. Fernandes (48.6%) 2; Mbeumo (36.1%) 2; Semenyo (24.4%) 2; O'Reilly (21.0%) 2; Kinsky (22.8%) 2; Calvert-Lewin (28.9%) 1.
- **Non-starters that hurt:** Gyökeres (7.1%) 0 mins, Watkins (8.1%) 0 mins, Pedro Porro (13.6%) 0 mins.
- **GW1 top scores:** De Cuyper (BHA, DEF, £4.6, 7.5%) **17**; Hinshelwood (BHA, MID, £6.0, 2.6%) **16**; Mendy (HUL, DEF, £4.0, 3.4%) **15**; Sangaré (BRE, MID, £5.6, 8.0%) **14**; Ajayi (HUL, DEF, £4.0, 1.7%) **14**; Kayode (BRE, DEF, £4.6) 13; Palmer (CHE, £9.5, 15.2%) **13 and a GW-high 60 BPS**; Stach (LEE, MID, £6.0, 2.2%) 13.
- **DEFCON leaders GW1:** Egan (HUL, £4.0) 21; O'Shea (IPS, £4.0) 18; Richards (CRY) / Armstrong (EVE) / Stach (LEE) / Senesi (TOT) 16; Sangaré (BRE) / Mendy (HUL) 13. Thresholds: DEF 10 CBIT, MID/FWD 12 CBIRT, capped at 2 pts.
- **GW1 results:** ARS 3-0 COV, HUL 2-0 MUN, EVE 2-0 CRY, IPS 2-1 SUN, NFO 0-1 LEE, BRE 3-0 TOT, BHA 4-0 AVL, MCI 2-1 BOU, NEW 2-2 LIV, FUL 2-3 CHE.
- **Price changes (first of the season):** ↑ De Cuyper £4.6, Sangaré £5.6, João Pedro £7.6, Calafiori £5.6, Kayode £4.6, Ødegaard £6.6. ↓ Gyökeres £7.4, Martinelli £6.4, Dowman £5.4, Watkins £7.9, Amad £5.9.
- **GW2 transfers in:** De Cuyper +421k, Sangaré +359k, João Pedro +326k, Palmer +292k, Calafiori +276k, Kayode +270k, Ødegaard +253k.
- **GW2 transfers out:** Porro -293k, Gibbs-White -228k, Watkins -212k, Konsa -199k, Gyökeres -193k, B. Fernandes -188k, Mbeumo -175k.
- **GW2 flags (API `status`):** Gibbs-White (NFO) 75%; Caicedo (CHE) 75%; Bruno G. (ARS) 75%; Hinshelwood (BHA) 75%; Palestra (CHE) 75%; Matheus N. (MCI) 75%; Amad (MUN) 75%; Maddison (TOT) 75%; Sarr (CRY) injured, no return date; Burn (NEW) back 14 Sep; Doku (MCI) back 5 Sep. ⚠️ re-verify at deadline.
- **BHA team news for GW2 (Chelsea away):** Minteh out ~2 weeks; Baleba, Mitoma, Tzimas doubts (Sports Mole).
- **GW2 fixtures / FDR:** best-rated home sides are CHE v BHA (2), MUN v IPS (2), TOT v NEW (2), SUN v FUL (2), COV v HUL (2). GW2–GW5 average FDR: LIV 2.50 (best), LEE/MCI/NEW/TOT 2.75, ARS 3.50 (AVL a, CHE a, SUN h, BHA a).

### Posts

| # | Slug | Type | Primary long-tail phrase | Kitbag | Pitches |
|---|------|------|--------------------------|--------|---------|
| 1 | `fpl-gameweek-1-review-2026-27` | Reactive (GW1 fallout) | `FPL gameweek 1 review 2026/27` | BHA | — |
| 2 | `fpl-gameweek-2-captain-transfer-targets-2026-27` | Forward (GW2) | `FPL gameweek 2 captain picks 2026/27` | CHE | 1 (Scout GW2 £100m XI, 3-5-2) |

### Kitbag note
HUL, COV and IPS are **not** in `kitbagPathByShort` (`src/utils/kitbag-urls.ts`) — a `kitTeams: ['HUL']` would silently fall back to the base affiliate link. Post 1 therefore uses **BHA** (De Cuyper/Hinshelwood are the actual story), post 2 uses **CHE**. Worth adding the three promoted clubs to the map before any Hull-centric post.

### Extraction-confidence notes
- Scout GW2 £100m XI (Yahoo syndication) — **HIGH**: all 15 named with formation (3-5-2) and captain. Every club/position/price re-verified against `bootstrap-static`; the article's Calafiori £5.5m and João Pedro £7.5m were **stale** (both rose to £5.6m/£7.6m on 27 Aug) and Sangaré is £5.6m not £5.5m — draft uses live prices.
- Official premierleague.com Scout GW2 article — **LOW**: two WebFetch passes returned a partial squad with mangled positions (João Pedro and Haaland listed as midfielders, Stach as a forward, Konsa as Aston Villa when the API has him at Arsenal). **Link only — not rendered as a pitch.**

### Promotion (2026-08-27)
- **Promoted:** post 2 only (`fpl-gameweek-2-captain-transfer-targets-2026-27`) → `BLOG_POSTS` + `public/llms.txt`. Verified prerendered at `/app/blog/fpl-gameweek-2-captain-transfer-targets-2026-27`.
- **Held:** post 1 (`fpl-gameweek-1-review-2026-27`) remains a draft at the user's instruction.
- **Renderer constraint discovered:** `AppArticle` renders section bodies as `{para}` — plain text, no markdown or HTML parsing. Markdown links in a draft would render literally. Prose was rewritten to name tools inline; the required internal linking is carried by the automatic "MORE LIKE THIS" block (`getBlogIndex`). **Future drafts must not use markdown link syntax in `sections[].body`.**
- Accents restored (Sangaré, Gyökeres, Ødegaard, Le Fée, Dúbravka, Guimarães, Moisés, Ismaïla, Jérémy, João) — the registry and pitch renderer handle them.
- Draft-1 cross-link removed from post 2 (it would 404 while post 1 is unpublished).

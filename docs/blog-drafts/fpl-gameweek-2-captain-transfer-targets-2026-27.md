# Draft — Post 2 of 2 (Gameweek batch, GW2 forward)

- **Beat:** Forward — captaincy, predicted line-ups and transfer targets for the gameweek ahead
- **Primary long-tail phrase:** `FPL gameweek 2 captain picks 2026/27`
- **Secondary:** `FPL GW2 transfer targets`, `stick or twist GW2`, `is De Cuyper a must buy`, `FPL GW2 differentials`
- **Competitor gap:** fpl.page and livefpltables publish thin or no gameweek previews; LiveFPL's transfer-trend data is auth-gated. This post makes the transfer-market read crawlable.
- **Deadline this post is written against:** Friday 28 August 2026, 18:30 BST (17:30 UTC) — 90 minutes before Crystal Palace v Man City.
- **Status:** awaiting review. Nothing written to `src/`.

---

```ts
{
  slug: 'fpl-gameweek-2-captain-transfer-targets-2026-27',
  title: 'FPL Gameweek 2 Captain Picks and Transfer Targets 2026/27',
  summary:
    'For FPL Gameweek 2, Haaland remains the safest armband despite his opening blank, with Joao Pedro and Cole Palmer the strongest alternatives at home to a depleted Brighton. Bruno Fernandes and Bryan Mbeumo face Ipswich at Old Trafford. The most-bought players are De Cuyper, Sangare and Joao Pedro; the most-sold is Pedro Porro. The deadline is Friday 28 August at 18:30 BST.',
  description:
    'FPL Gameweek 2 captain picks, transfer targets and differentials for 2026/27 — plus the Scout GW2 XI and the deadline you need to hit.',
  date: '2026-08-27',
  category: 'Tips',
  gameweek: 2,
  kitTeams: ['CHE'],
  sections: [
    {
      heading: 'Gameweek 2 deadline and fixtures',
      body: [
        'The Gameweek 2 deadline is Friday 28 August 2026 at 18:30 BST, 90 minutes before Crystal Palace host Manchester City to open the round. The gameweek then runs across four days and closes with Aston Villa v Arsenal on the Monday night.',
        'On the official Fixture Difficulty Ratings, the softest assignments belong to the home sides in Chelsea v Brighton (2), Man Utd v Ipswich (2), Tottenham v Newcastle (2), Sunderland v Fulham (2) and Coventry v Hull (2). The hardest single fixture on the slate is Aston Villa v Arsenal, rated 4 for both teams.',
        'The full round: Crystal Palace v Man City (Fri), Liverpool v Nottingham Forest, Bournemouth v Everton, Coventry v Hull, Tottenham v Newcastle (Sat), Chelsea v Brighton, Leeds v Brentford, Sunderland v Fulham, Man Utd v Ipswich (Sun), Aston Villa v Arsenal (Mon).',
      ],
    },
    {
      heading: 'Gameweek 2 captain picks',
      body: [
        'Haaland (£15.5m) is still the default. One blank against Bournemouth does not undo the profile — he took five shots in that match, and he is captained by more managers than anyone else in the game for a reason. Crystal Palace away is rated 3 rather than 2, which is the only real argument against him, and it is a thin one. If you are happy taking the field-average outcome, this is the pick.',
        'Joao Pedro (£7.6m) is the aggressive alternative. Chelsea are at home to a Brighton side missing Yankuba Minteh for at least a fortnight, with Carlos Baleba, Kaoru Mitoma and Stefanos Tzimas all doubts, and the fixture is rated 2. Joao Pedro scored and assisted in the 3-2 win at Fulham and is now owned by 67.6% of managers, so this is a low-risk pivot rather than a punt.',
        'Cole Palmer (£9.5m) is the higher-variance version of the same fixture. He is on penalties and set pieces, he recorded the highest BPS total of Gameweek 1 (60), and he is owned by only 15.2% — captaining him is a genuine differential inside a soft home fixture. Bruno Fernandes (£12.0m) and Bryan Mbeumo (£8.0m) are the contrarian route: Ipswich at Old Trafford is a 2, and both are coming off a two-point return that has driven roughly 188,000 and 175,000 managers to sell them.',
        'The uncomfortable read is that Haaland, Joao Pedro and Fernandes are all owned by a third or more of the game, so none of them is a rank-mover in a big mini-league. Palmer at 15.2% is. Which of those matters depends on whether you are protecting a lead or chasing one — the [mini-league ranker](/) will tell you which of the two you actually are before you set the armband.',
      ],
    },
    {
      heading: 'The Scout GW2 squad',
      body: [
        'The Scout squad for Gameweek 2 lines up 3-5-2 and lands at just under the £100m budget, built around a triple Arsenal spine at the back and the two Manchester United attackers at home to Ipswich. Haaland takes the armband.',
        'The bench is deliberately cheap — Dubravka in goal, Drameh and Slater from Hull, and Walle Egeli from Ipswich — which is the standard early-season shape: spend the money on eleven starters and accept that the bench is there for autosubs rather than for Bench Boost value. The official Premier League version of the Scout selection is published as a Wildcard-and-new-starter template and is [worth reading alongside it](https://www.premierleague.com/en/news/4698173/the-scouts-fpl-gw2-squad-for-wildcarders-and-new-starters).',
      ],
    },
    {
      heading: 'Transfer targets: who the market is buying',
      body: [
        'Maxim De Cuyper (Brighton, £4.6m) is the most-bought player in the game with roughly 421,000 moves in after his 17-point opener. He has already risen 0.1m. The caveat is the fixture: Brighton travel to Chelsea in Gameweek 2, which is the hardest assignment on their card for weeks, and Brighton are missing several attackers. He is a good buy on role and price; Gameweek 2 is not his best entry point.',
        'Mamadou Sangare (Brentford, £5.6m) is second with roughly 359,000 moves in, and he is the more fixture-proof of the two. Two assists plus 13 defensive contributions in Gameweek 1 is exactly the dual-route profile that DEFCON rewards — his floor does not depend on Brentford keeping a clean sheet. Leeds away is rated 3.',
        'Behind them, Joao Pedro (roughly 326,000 in), Palmer (292,000), Riccardo Calafiori (276,000), Michael Kayode (270,000) and Martin Odegaard (253,000) are all being bought. Calafiori, Kayode, Odegaard, De Cuyper, Sangare and Joao Pedro all rose in price on 27 August — the first price changes of the season.',
        'If you are choosing between them on fixtures rather than form, Liverpool have the best run in the game from Gameweek 2 to Gameweek 5 (average difficulty 2.50), followed by Leeds, Man City, Newcastle and Tottenham on 2.75. Arsenal have the worst of the big six at 3.50, with trips to Aston Villa, Chelsea and Brighton in that window — which is worth weighing before you buy a third Arsenal defender.',
      ],
    },
    {
      heading: 'Who to sell, and who is flagged',
      body: [
        'Pedro Porro (Tottenham, £5.5m) is the most-sold player in the game at roughly 293,000 moves out after recording zero minutes in Gameweek 1. Ollie Watkins (roughly 212,000 out) and Viktor Gyokeres (193,000) are in the same boat and have both dropped in price.',
        'Morgan Gibbs-White (Nottingham Forest, £8.0m) is second on the sold list with a knee injury and a 75% chance of playing, away at Liverpool. That is a straightforward move if you can make it without a hit.',
        'Other flags to check before the deadline: Moises Caicedo and Marc Palestra (Chelsea), Bruno Guimaraes (Arsenal), Jack Hinshelwood (Brighton), Matheus Nunes (Man City), Amad (Man Utd) and James Maddison (Tottenham) are all listed at 75%. Ismaila Sarr (Crystal Palace) is injured with no return date, Dan Burn (Newcastle) is expected back on 14 September and Jeremy Doku (Man City) on 5 September. Hinshelwood is the one that stings — he scored 16 points in Gameweek 1 and is now doubtful.',
        'On hits: with the market this active it is tempting to take a -4, but Gameweek 2 is early enough that most of what looks broken is a squad-shape problem rather than a one-player problem. Fix it on a Wildcard once minutes settle. If you want a read on which of your own players are genuinely underperforming rather than merely unlucky, the [Rank My Team verdict](/) grades your XI on form, minutes and fixtures. The companion piece to this post, [the full Gameweek 1 review](/blog/fpl-gameweek-1-review-2026-27), covers what the opening weekend actually proved.',
      ],
    },
  ],
  lineups: [
    {
      source: 'Scout Squad — Gameweek 2 £100m team',
      sourceUrl: 'https://sports.yahoo.com/articles/fpl-gameweek-2-scout-picks-173343311.html',
      formation: '3-5-2',
      note: 'Bench: Dubravka (TOT), Drameh (HUL), Slater (HUL), Walle Egeli (IPS). Prices verified against the live FPL API on 27 August 2026.',
      players: [
        { name: 'Raya', team: 'ARS', position: 'GK' },
        { name: 'White', team: 'ARS', position: 'DEF' },
        { name: 'Calafiori', team: 'ARS', position: 'DEF' },
        { name: 'Thomas', team: 'COV', position: 'DEF' },
        { name: 'Mbeumo', team: 'MUN', position: 'MID' },
        { name: 'B. Fernandes', team: 'MUN', position: 'MID' },
        { name: 'Szoboszlai', team: 'LIV', position: 'MID' },
        { name: 'Le Fee', team: 'SUN', position: 'MID' },
        { name: 'Sangare', team: 'BRE', position: 'MID' },
        { name: 'Haaland', team: 'MCI', position: 'FWD', isCaptain: true },
        { name: 'Joao Pedro', team: 'CHE', position: 'FWD' },
      ],
    },
  ],
  faq: [
    {
      question: 'When is the FPL Gameweek 2 deadline?',
      answer:
        'The Gameweek 2 deadline is Friday 28 August 2026 at 18:30 BST (17:30 UTC), 90 minutes before Crystal Palace host Manchester City. Any transfers, captain changes or chip activations have to be confirmed before that time.',
    },
    {
      question: 'Who should I captain in FPL Gameweek 2?',
      answer:
        'Haaland is the safest pick despite his Gameweek 1 blank — he played 90 minutes and took five shots against Bournemouth, and Manchester City travel to a Crystal Palace side rated 3 for difficulty. Joao Pedro and Cole Palmer are the strongest alternatives, both at home to a Brighton team missing Minteh and carrying doubts over Baleba, Mitoma and Tzimas in a fixture rated 2. Palmer is the differential of the three at 15.2% ownership.',
    },
    {
      question: 'Is De Cuyper a must-buy for Gameweek 2?',
      answer:
        'He is the most-transferred-in player in the game with around 421,000 moves in, and at £4.6m playing on the left wing while priced as a defender, the role is genuinely rare. But Brighton travel to Chelsea in Gameweek 2, which is their hardest fixture for some time, and they are missing attackers. The player is a good buy; the timing is not ideal, so this is a case for waiting a week rather than paying a hit.',
    },
    {
      question: 'Should I take a hit in Gameweek 2?',
      answer:
        'Usually not. A -4 in Gameweek 2 is being paid to correct one week of variance, and most squads that look broken after the opening weekend have a shape problem — too many non-playing budget defenders, not enough DEFCON coverage — that a single transfer cannot fix. Take the free transfer, roll if nothing is urgent, and fix the structure on a Wildcard once minutes have settled.',
    },
    {
      question: 'Which FPL players are flagged for Gameweek 2?',
      answer:
        'Morgan Gibbs-White (knee), Moises Caicedo, Marc Palestra, Bruno Guimaraes, Jack Hinshelwood, Matheus Nunes, Amad and James Maddison are all listed at a 75% chance of playing. Ismaila Sarr is injured with no return date, Dan Burn is expected back on 14 September and Jeremy Doku on 5 September. Injury flags change right up to the deadline, so check again before you confirm your team.',
    },
  ],
  mentions: [
    { name: 'Erling Haaland', sameAs: 'https://en.wikipedia.org/wiki/Erling_Haaland' },
    { name: 'Cole Palmer', sameAs: 'https://en.wikipedia.org/wiki/Cole_Palmer' },
    { name: 'Bruno Fernandes', sameAs: 'https://en.wikipedia.org/wiki/Bruno_Fernandes' },
    { name: 'Chelsea F.C.', sameAs: 'https://en.wikipedia.org/wiki/Chelsea_F.C.' },
    { name: 'Manchester City F.C.', sameAs: 'https://en.wikipedia.org/wiki/Manchester_City_F.C.' },
  ],
  sources: [
    'https://fantasy.premierleague.com/api/bootstrap-static/',
    'https://fantasy.premierleague.com/api/fixtures/?event=2',
    'https://sports.yahoo.com/articles/fpl-gameweek-2-scout-picks-173343311.html',
    'https://www.premierleague.com/en/news/4698173/the-scouts-fpl-gw2-squad-for-wildcarders-and-new-starters',
    'https://www.premierleague.com/en/news/2884829',
    'https://www.fantasyfootballscout.co.uk/2026/08/26/two-up-two-down-fpls-first-price-changes-of-2026-27',
    'https://www.rotowire.com/soccer/article/fpl-gameweek-2-rankings-best-players-captain-picks-gw2-129843',
    'https://www.sportsmole.co.uk/football/chelsea/top-four-race/preview/brighton-vs-chelsea-prediction-team-news-lineups_595998.html',
  ],
}
```

---

## Reviewer notes

- **This post has a hard shelf life.** It is written against a deadline roughly 24 hours away. Ownership, transfer counts, prices and injury flags all move until 18:30 BST on 28 August — if it is not promoted today, the numbers need re-pulling.
- **Pitch source:** the Yahoo syndication of the Scout GW2 £100m squad was the only version that returned a complete XI with a formation and a captain. Two WebFetch passes at the official premierleague.com Scout article returned a **partial squad with mangled positions** (Joao Pedro and Haaland as midfielders, Stach as a forward, Konsa listed at Aston Villa when the API has him at Arsenal), so it is **linked in prose but not rendered as a pitch**. Same call the preseason batch made for the member-only sources.
- **I corrected three stale prices from the source article** against the live API: Calafiori is £5.6m (not £5.5m), Joao Pedro £7.6m (not £7.5m), Sangare £5.6m (not £5.5m). All three rose on 27 August.
- **Accents stripped** in `lineups[].players[].name` and in body prose for Sangare, Gyokeres, Odegaard, Le Fee, Dubravka, Guimaraes and Moises to avoid encoding drift through the pitch renderer — **restore them if the renderer handles diacritics cleanly** (the existing preseason lineup entries would tell you).
- `kitTeams: ['CHE']` — Chelsea is the club two of the three captain candidates play for, and they are the home side in the pivotal fixture.
- Three internal links (mini-league ranker, Rank My Team, sibling GW1 post). The first two point at `/` — **swap for the real routes** if those tools have dedicated paths.
- Verify `COV` and `SUN` render correctly in `GenericJersey` — both are in the colour map (`COV: #6CB4EE`, `SUN: #EB172B`), so the pitch should be clean.

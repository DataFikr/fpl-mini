# Painkiller vs Vitamin — Grading Rubric

## Why this exists
FPL tools die from building vitamins. A "prettier league table" is a vitamin: pleasant, substitutable, and nobody sets a reminder for it. A "your rival just captained someone different, deadline in 40 minutes" alert is a painkiller: it costs you points not to have it.

Only painkillers go behind the paywall. Vitamins earn their keep as SEO surface and as the free layer that makes the painkiller discoverable.

## The four tests

Score 1 point each. **4/4 = painkiller. 3 or fewer = vitamin.**

### 1. Recurring pain
Does the user feel this every gameweek, or once a season?

- ✅ Captain choice, transfer decision, rival tracking, deadline pressure — 38× a season
- ❌ "Find your team ID", season kit picker, historical archive — once, ever

Once-a-season features can still be excellent acquisition (a find-team-ID page ranks and converts a first visit). They just cannot be the retention or revenue engine.

### 2. Deadline-coupled
Is there a cost to *not* using it before a specific time?

- ✅ Anything that must be acted on before the gameweek deadline locks
- ❌ Anything a user can read next Tuesday with equal value

This is the test that generates the return visit. A feature with no clock has no reason to be opened twice.

### 3. Un-substitutable
Does the official FPL site, or a competitor with more traffic, already do this well and free?

Check against `docs/research/competitor_gap_analysis.md`. livefpl.net (3.2M visits) and fplgameweek.com (1.1M) set the substitution bar. If they do it, you are not selling the feature — you are selling a marginally better version of a free thing, which does not convert.

- ✅ Mini-league-specific, personalised-to-your-squad, or cross-referenced in a way the big tools do not bother with
- ❌ Generic price change lists, generic ownership tables, generic predicted points — all commodity

### 4. Loss-framed
Does it prevent a bad outcome, or add a nice number?

- ✅ "You are about to captain the third-best option" · "Your rival has a differential you do not own" · "You have not made your transfer and the deadline is in 2 hours"
- ❌ "Here is your season xG chart" · "Your league has had 47 captaincy changes"

Loss aversion is roughly 2× the pull of equivalent gain. Every paid feature should be phrased as protection, not decoration — in the UI copy as much as the spec.

## Grading table format

```
| Feature | Route | Recurring | Deadline | Un-sub | Loss | Score | Verdict |
|---------|-------|-----------|----------|--------|------|-------|---------|
```

Verdicts:
- **Keep free** — vitamin, but valuable as SEO surface or as the top of the funnel
- **Paywall** — 4/4, and the user can already feel the pain today
- **Defer** — would be 4/4 but depends on an unbuilt prerequisite
- **Kill** — vitamin with maintenance cost and no traffic

## The trap to avoid
A feature can be a genuine painkiller and still earn nothing if it is **undiscoverable**. Before grading a low-usage feature as a vitamin, check its pageviews. Zero usage on a 4/4 feature is a distribution bug, not a product verdict. This is the single most common misread of this dataset — see the SKILL.md rule *"separate nobody wants it from nobody can find it"*.

## Converting a vitamin into a painkiller
Usually one of three moves:
1. **Add a clock** — recompute it against the next deadline and notify
2. **Make it personal** — bind it to the user's own squad/league instead of the global dataset
3. **Invert the frame** — show what they are about to lose rather than what they have

A generic predicted-points table (vitamin) becomes "3 of your starting XI are predicted to blank this week — deadline 11:30" (painkiller) with all three moves and no new data.

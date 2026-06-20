---
name: fpl-newsletter
description: Builds and maintains the FPL mini-league email newsletter system — ESPN-style breaking-news storytelling, Resend delivery, official Premier League player/club imagery, and the twice-per-gameweek (pre-deadline reminder + post-gameweek summary) cron cadence that drives email stickiness.
use-when: The user wants to fix, extend, or design the newsletter / breaking news / rival watch emails, the subscribe flow, Resend delivery, action imagery, or the reminder/summary cron jobs.
---

# FPL Newsletter — ESPN-Style Email System

You are a newsletter creator and ESPN-style sports reporter. Every email should capture the **drama** of the mini-league gameweek: monster hauls, captaincy masterstrokes, bench blunders, and title-race rivalries — and back it with **real player action photos**.

## System Map (read before editing)

| Concern | File |
| --- | --- |
| Resend wrapper + all HTML templates | `src/services/email-service.ts` |
| Subscribe endpoint (newsletter / team-analysis / rival-analysis) | `src/app/api/newsletter/subscribe/route.ts` |
| Pre-deadline reminder cron | `src/app/api/cron/thursday-reminder/route.ts` |
| Post-gameweek summary cron | `src/app/api/cron/weekly-summary/route.ts` |
| Cron schedules | `vercel.json` (`crons[]`) |
| Official PL image helpers | `src/lib/fpl-images.ts` |
| Player-name → photo lookup API | `src/app/api/players/photo/route.ts` |
| On-site breaking-news ticker | `src/components/ui/breaking-news.tsx` |
| ESPN story templates | `src/app/api/leagues/[id]/storytelling/route.ts` |
| Subscribe UI (newsletter) | `src/components/ui/enhanced-league-storytelling.tsx` |
| Subscribe UI (rival watch) | `src/components/squad/enhanced-squad-table.tsx` |

## Imagery — official, public, current-season

Source action imagery from the **Premier League resources CDN** (no API key, always current club/kit). Always go through `src/lib/fpl-images.ts`; never hardcode CDN URLs in components.

- `getPlayerPhotoUrl(code, size?)` — headshot in current kit. `code` is the bootstrap `element.code` (or the `photo` field minus extension), **not** `id`.
- `getClubBadgeUrl(teamCode, size?)` — official club badge.
- `findPlayerPhotoByName(name, elements)` — single name → photo, returns `null` if no confident match (fall back to badge/themed art, never a wrong face).
- `findPlayerPhotoInText(text, elements)` — scans ESPN copy ("Haaland delivers MONSTER haul") for the first PL player and returns `{ photoUrl, playerName }`.
- `getStoryTheme(type)` — gradient + emoji fallback when no photo resolves.

**Rules:**
- Emails: inline styles only, absolute `https://` URLs, `width`/`height` on every `<img>`, always provide `alt`, and a themed-circle fallback for when an image fails to load.
- Browser code cannot hit the FPL bootstrap (CORS) — resolve photos through `/api/players/photo?name=` or `?names=a,b,c`.
- Do not hotlink third-party/agency action shots (licensing + link rot). Official PL headshots are the safe "recent, public" default.

## Resend delivery — the failure modes

`EmailService` (singleton) gates on `isConfigured = RESEND_API_KEY && FROM_EMAIL && key !== placeholder`. When unconfigured it returns `{ success:false, error:'not configured' }` and the subscribe route responds `isDemo:true` (HTTP 200) — emails silently don't send. The two real-world causes:

1. **`RESEND_API_KEY` / `FROM_EMAIL` missing** in the deploy env → demo mode.
2. **`FROM_EMAIL` domain not verified in Resend** → Resend rejects the send (the most common "it says subscribed but no email arrives").

When debugging "subscribe is broken": check env vars first, then the Resend Domains tab, then the server logs (`❌ Email sending failed`). Keep templates defensive — `performanceAnalysis` may be a string **or** an array of `{icon,text}` insights; flatten arrays so they never render as `[object Object]`.

Batch sends use `resend.batch.send` (≤100/call) via `EmailService.sendBatch`.

## Cron cadence — twice per gameweek (the stickiness loop)

Vercel Cron invokes endpoints with a **GET** request and attaches `Authorization: Bearer ${CRON_SECRET}` when `CRON_SECRET` is set. **Both GET and POST must run the job** — if GET is blocked the cron silently never fires (this was the original "no reminders" bug). Each route self-gates on timing and de-dupes per GW via Redis (`cron:reminder:sent:gw:*`, `cron:summary:sent:gw:*`, 7-day TTL).

1. **Pre-deadline reminder** (`thursday-reminder`, daily `0 8 * * *`): fires when the next deadline is **36–60h** away. Checklist + community poll + deadline countdown → drives managers back before the deadline.
2. **Post-gameweek summary** (`weekly-summary`, daily `0 10 * * *`): fires once a GW is `finished && data_checked` (bonus points final) and the next deadline is 24–144h out. ESPN headlines enriched with player photos via `findPlayerPhotoInText`.

Required env: `CRON_SECRET`, `NEXT_PUBLIC_BASE_URL` (cron calls internal APIs with it), `REDIS_URL` (dedup; degrades gracefully if absent).

## Email templates (all in `email-service.ts`)

`generateGameweekSummaryHTML` · `generateThursdayReminderHTML` · `generateRivalAnalysisHTML` · `generateTeamAnalysisHTML` · `generateContactFormHTML`. Shared shell: 600–800px container, gradient header, branded footer with recipient + unsubscribe line.

**Story object shape** consumed by the summary template:
```ts
{ type, headline, subheadline, details, teamName, managerName, points?,
  imageUrl?,      // official player photo (auto-attached when copy names a PL player)
  playerName? }   // resolved player, used as <img alt>
```
When adding a story type, register a matching theme in `STORY_THEME` so the fallback art stays on-brand.

## Editorial voice
Lead with the drama, name names, use the gameweek number, keep one clear CTA back to `fplranker.com/league/{id}`. Headlines: `🚨 BREAKING`, `⚡ MASTERCLASS`, `💔 NIGHTMARE`, `🔥 TITLE RACE`. Never fabricate stats — every number comes from FPL API / storytelling data.

## Pipeline integration
- **Input from:** `fpl-researcher` (community pain points → email angles), storytelling route (stories).
- **Feeds into:** `fpl-impact-linker` (contextual Kitbag/Fanatics CTA in email footers), `fpl-retention-builder` (poll + streak hooks in the reminder).

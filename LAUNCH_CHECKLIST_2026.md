# FPLRanker — Launch Checklist (I6, pre-GW1)
_Season 2026/27 GW1 ~Aug 15. This is the final gate: automated smoke + the manual steps only the founder can do (prod DB, real payment, email blast)._

---

## 1. Automated smoke — `tests/e2e/i6-launch-smoke.spec.ts`

Run against a running app (browsers already installed):

```bash
# point the tests at your running server
BASE_URL=http://localhost:3000 npx playwright test tests/e2e/i6-launch-smoke.spec.ts --project=chromium
```

Covers:
- ✅ Admin API 401s anonymously (`/api/admin/emails`)
- ✅ Billing webhook rejects a forged signature (401)
- ✅ Webhook logic: `order_created`→grant, `order_refunded`/`subscription_expired`→revoke, cancel→ignore
- ✅ Funnel visual continuity `/app · /predictions · /premium · /auth/login` (light Sportify + wordmark; screenshots in `tests/screenshots/`)
- ✅ Premium launch pricing (£15 Season Pass) renders
- ✅ Predictions FAQ + login magic-link form render
- ✅ Player pSEO page renders with JSON-LD
- ✅ Squad Prediction tab renders Captain Picks (run with `NEXT_PUBLIC_DEMO_PREMIUM=1` for the premium view)

> Note: the older `tests/e2e/home-page.spec.ts` asserts the retired FR-DLS marketing home (`/` now 307s to `/app`) — update or retire it separately; it is not part of the launch gate.

---

## 2. Founder manual gates (cannot be automated)

### Environment / data
- [ ] `npx prisma db push` against the **production** database (creates User/Session/LoginToken/UserLeague/PlayerPrediction/PredictorState/NewsletterSubscription).
- [ ] Set Vercel env: `DATABASE_URL`, `REDIS_URL`, `RESEND_API_KEY`, `FROM_EMAIL`, `CRON_SECRET`, `ADMIN_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- [ ] Set Lemon Squeezy env: `LS_CHECKOUT_SEASON_URL`, `LS_CHECKOUT_ANNUAL_URL`, `LEMONSQUEEZY_WEBHOOK_SECRET`. Optional: `NEWSLETTER_SECRET`.
- [ ] **Turn OFF demo flags in prod**: `FPL_DEMO_SEASON`, `FPL_DEMO_GW`, `FPL_SEASON`, `NEXT_PUBLIC_DEMO_PREMIUM` must be UNSET.
- [ ] Trigger the first `/api/cron/daily` (with `Authorization: Bearer $CRON_SECRET`) to seed predictions + confirm the cron dispatcher.

### Payments (live)
- [ ] Lemon Squeezy store **activated** + products live; webhook endpoint set to `https://fplranker.com/api/webhooks/billing`.
- [ ] **Live £15 Season Pass test purchase** → confirm the webhook flips `isPremium=true` (check the account chip shows ★, `/premium` shows the premium card, captain picks unblur).
- [ ] **Refund** that test order → confirm `isPremium` flips back to false (`order_refunded`→revoke).
- [ ] GA4 DebugView shows the `purchase` event; `premium_gate_click` fires from the prediction gate.

### Content / SEO
- [ ] `sitemap.xml` live with `/players/*` + `/gameweek/*`; submit to Search Console.
- [ ] Spot-check 2–3 player pages in Google's Rich Results test (Person + FAQPage).
- [ ] `llms.txt` + robots reachable.

### Newsletter
- [ ] Subscribe from a league page → receive the **confirm** email → click → verify page shows "confirmed" and `verifiedAt` is set.
- [ ] Send a test bulk newsletter → only the verified address receives it; a premium account sees the AI captain-picks block prepended.

### Launch
- [ ] Announce to the email list with the launch offer (£15 until 1 Sep, then £20).
- [ ] Post the teaser video + share infographic to the seed channels (Reddit/WhatsApp/Discord).

---

## 3. Revenue checkpoints (from LAUNCH_PLAN §5)
- 10 sales by **Sep 1** · 20 by **Oct 1** · 30 by **Oct 31** (→ ~$1k).
- If < 5 by Sep 1, the constraint is traffic → shift effort to SEO/content, not features.

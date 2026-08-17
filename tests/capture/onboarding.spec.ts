import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

/**
 * FR-10 — measures and records the real onboarding flow.
 *
 * The brief asserts "ten seconds, no password". This test exists to find out
 * whether that is true rather than assert it: it stopwatches from the moment
 * "Rank my league" is clicked to the moment the squad view is actually usable,
 * and writes the number where the composition can read it.
 *
 * If the measured time is materially worse than the claim, the video says the
 * measured number — or the product gets fixed first. It must never say ten
 * seconds because ten seconds sounded good.
 */
const DEMO_TEAM = '6454003';

test('onboarding: team ID to squad view', async ({ page }) => {
  // Pre-seed consent so the cookie banner never renders. It is gated on
  // localStorage['cookie-consent'] (src/components/analytics/CookieConsent.tsx),
  // and clicking Accept after load proved unreliable — the banner still covered
  // the bottom third of every recorded frame. Setting the key before any page
  // script runs removes it deterministically.
  await page.addInitScript(() => {
    try {
      localStorage.setItem('cookie-consent', 'accepted');
    } catch {
      /* storage blocked — banner will show, footage unusable, test still measures */
    }
  });

  await page.goto('/app', { waitUntil: 'networkidle' });

  const input = page.getByLabel('FPL team ID');
  await expect(input).toBeVisible({ timeout: 30_000 });

  // Type at a human cadence — the recording is footage, not a benchmark, and an
  // instant fill would look fake. Typing time is excluded from the stopwatch and
  // reported separately so both numbers are honest.
  const typeStart = Date.now();
  await input.click();
  await input.pressSequentially(DEMO_TEAM, { delay: 110 });
  const typeMs = Date.now() - typeStart;

  const submit = page.getByRole('button', { name: /rank my league/i });
  await expect(submit).toBeVisible();

  const t0 = Date.now();
  await submit.click();

  // "Usable" = the squad screen's tab row has rendered, which is the first
  // moment the visitor can actually do something.
  await expect(page).toHaveURL(/\/app\/squad/, { timeout: 60_000 });
  await expect(page.getByText('Transfer Impact', { exact: false }).first()).toBeVisible({
    timeout: 60_000,
  });
  const loadMs = Date.now() - t0;

  // Let the view settle on camera before the recording ends.
  await page.waitForTimeout(2500);

  const result = {
    measuredAt: new Date().toISOString(),
    teamId: DEMO_TEAM,
    typeMs,
    loadMs,
    totalMs: typeMs + loadMs,
    note: 'loadMs = click "Rank my league" -> squad tabs visible. Local dev server, demo season.',
  };

  mkdirSync('video/src/data', { recursive: true });
  writeFileSync('video/src/data/fr10-onboarding.json', JSON.stringify(result, null, 2) + '\n');

  console.log(
    `\n  typing: ${(typeMs / 1000).toFixed(1)}s  |  load: ${(loadMs / 1000).toFixed(1)}s  |  total: ${(
      result.totalMs / 1000
    ).toFixed(1)}s\n`
  );
});

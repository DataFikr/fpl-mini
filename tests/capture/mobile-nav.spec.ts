import { test, expect } from '@playwright/test';

test('landing hamburger shows every link on a phone', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'Open menu' }).click();

  const overlay = page.getByRole('dialog');
  await expect(overlay).toBeVisible();

  // The overlay must fill the viewport, not the 68px sticky header.
  const box = await overlay.boundingBox();
  console.log('overlay box', box);
  expect(box!.height).toBeGreaterThan(600);

  for (const label of ['Predictions', 'Players', 'Premium', 'Blog', 'Find team ID', 'FAQ', 'Privacy']) {
    const link = overlay.locator('.menu-link', { hasText: label }).first();
    await expect(link).toBeVisible();
    // Everything past the fold must be reachable by scrolling the overlay.
    await link.scrollIntoViewIfNeeded();
  }
  await page.screenshot({ path: 'tests/capture/out/menu.png' });
});

test('ambassador tab exports without signing in', async ({ page }) => {
  await page.goto('/app/leagues?teamId=6454003', { waitUntil: 'networkidle' });
  await page.locator('a[href*="/app/league/"], .lg-card, [class*="lg-"]').first().click();
  await page.getByText('Ambassador', { exact: true }).click();

  await expect(page.getByRole('button', { name: /Export CSV/ })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Sign in to see every team ID/)).toHaveCount(0);
  await page.screenshot({ path: 'tests/capture/out/ambassador.png', fullPage: true });
});

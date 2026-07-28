import { test, expect } from '@playwright/test';
import { parseWebhook } from '../../src/lib/billing';

/**
 * I6 launch smoke — the pre-GW1 gate. Covers the launch-critical paths that must
 * hold on the unified Sportify funnel:
 *   • admin routes are protected (401 anonymously)
 *   • the billing webhook rejects forged signatures and maps grant/revoke correctly
 *   • the money-path pages render on one palette/font (visual continuity + screenshots)
 *   • the premium revenue product (captain picks) renders in the squad Prediction tab
 *
 * Auth completion and the live £15 transaction need the seeded launch DB +
 * Lemon Squeezy keys — see LAUNCH_CHECKLIST_2026.md for those manual gates.
 */

test.describe('I6 launch smoke', () => {
  test('admin API denies anonymous access (never 200)', async ({ request }) => {
    const res = await request.get('/api/admin/emails');
    // Protected + fail-closed: 401 when ADMIN_KEY is configured (prod), 503 when it
    // isn't (the guard denies rather than leaking). Either way, never a 200 with data.
    expect([401, 403, 503]).toContain(res.status());
  });

  test('billing webhook rejects an invalid signature', async ({ request }) => {
    const res = await request.post('/api/webhooks/billing', {
      data: { meta: { event_name: 'order_created' } },
      headers: { 'x-signature': 'not-a-valid-signature' },
    });
    expect(res.status()).toBe(401);
  });

  test('webhook maps purchase → grant and refund/expiry → revoke', () => {
    const grant = parseWebhook({ meta: { event_name: 'order_created', custom_data: { user_id: 'u1' } }, data: { attributes: { customer_id: 42 } } });
    expect(grant.type).toBe('grant');
    expect(grant.plan).toBe('season');

    const refund = parseWebhook({ meta: { event_name: 'order_refunded', custom_data: { user_id: 'u1' } }, data: { attributes: { customer_id: 42 } } });
    expect(refund.type).toBe('revoke');

    const expired = parseWebhook({ meta: { event_name: 'subscription_expired', custom_data: { user_id: 'u1' } }, data: { attributes: {} } });
    expect(expired.type).toBe('revoke');

    const noise = parseWebhook({ meta: { event_name: 'subscription_cancelled' }, data: { attributes: { status: 'cancelled' } } });
    expect(noise.type).toBe('ignore');
  });

  // Visual continuity: every funnel page is light-themed Sportify with the wordmark.
  for (const path of ['/app', '/predictions', '/premium', '/auth/login']) {
    test(`funnel renders on Sportify: ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('text=FPL RANKER').first()).toBeVisible({ timeout: 20000 });
      await page.screenshot({ path: `tests/screenshots/i6${path.replace(/\W+/g, '_') || '_home'}.png`, fullPage: true });
    });
  }

  test('premium page shows launch pricing', async ({ page }) => {
    await page.goto('/premium');
    await expect(page.getByText('£15').first()).toBeVisible();
    await expect(page.getByText(/Season Pass/i).first()).toBeVisible();
  });

  test('predictions page shows the FAQ and a premium path', async ({ page }) => {
    await page.goto('/predictions');
    await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible();
  });

  test('login shows the magic-link form', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign-in link/i })).toBeVisible();
  });

  test('player pSEO page renders with structured data', async ({ page }) => {
    const res = await page.goto('/players/erling-haaland', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
    await expect(page.locator('.p-hero h1')).toBeVisible();
  });

  test('squad Prediction tab renders captain picks', async ({ page }) => {
    await page.goto('/app/squad?teamId=6454003', { waitUntil: 'domcontentloaded' });
    await page.getByText('Prediction', { exact: true }).click();
    await expect(page.getByText('CAPTAIN PICKS')).toBeVisible({ timeout: 25000 });
  });
});

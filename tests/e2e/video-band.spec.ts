import { test, expect } from '@playwright/test';

/**
 * The landing page's YouTube Shorts band, which replaced a 12.85 MB autoplaying
 * teaser MP4.
 *
 * The band is server-rendered, so `page.route('**\/api/videos')` would not
 * intercept anything — the feed read happens in Node. The thumbnails are real
 * browser requests, so those can be intercepted (see the fallback test).
 */
test.describe('Landing — YouTube Shorts band', () => {
  test('never requests the deleted teaser video', async ({ page }) => {
    const media: string[] = [];
    page.on('request', (r) => {
      if (/\.(mp4|webm|mov)(\?|$)/i.test(r.url())) media.push(r.url());
    });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    expect(media).toEqual([]);
  });

  test('loads no YouTube iframe until a card is clicked', async ({ page }) => {
    const yt: string[] = [];
    page.on('request', (r) => {
      if (/youtube(-nocookie)?\.com/.test(r.url())) yt.push(r.url());
    });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.lp .vs-card')).not.toHaveCount(0);
    await expect(page.locator('.lp iframe')).toHaveCount(0);
    expect(yt).toEqual([]);
  });

  test('cards are 9:16', async ({ page }) => {
    await page.goto('/app');
    const box = await page.locator('.lp .vs-card').first().boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(9 / 16, 2);
  });

  test('clicking the centre card injects one titled, autoplaying, cookieless iframe', async ({ page }) => {
    await page.goto('/app');
    await page.locator('.lp .vs-play-btn[aria-label^="Play:"]').click();

    const frame = page.locator('.lp iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/.+autoplay=1/);
    await expect(frame).toHaveAttribute('src', /playsinline=1/);
    const title = await frame.getAttribute('title');
    expect(title).toBeTruthy();
  });

  test('focus follows into the player, and moving on tears it down', async ({ page }) => {
    await page.goto('/app');
    await page.locator('.lp .vs-play-btn[aria-label^="Play:"]').click();
    await expect(page.locator('.lp iframe')).toHaveCount(1);

    // The button that had focus is unmounted; without an explicit move, a
    // keyboard user would be dropped back to <body>.
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.tagName))
      .toBe('IFRAME');

    // Advancing must not leave a video playing off-centre.
    await page.getByRole('button', { name: 'Next video' }).click();
    await expect(page.locator('.lp iframe')).toHaveCount(0);
  });

  test('the title link is a sibling of the play button, not nested inside it', async ({ page }) => {
    await page.goto('/app');
    // Nested interactive controls fail the axe scan this page already runs.
    await expect(page.locator('.lp .vs-play-btn a')).toHaveCount(0);
    await expect(page.locator('.lp .vs-title').first()).toHaveAttribute('href', /youtube\.com\/shorts\//);
  });

  test('a missing thumbnail falls back without looping', async ({ page }) => {
    await page.route(/frame0\.jpg/, (r) => r.fulfill({ status: 404, body: '' }));
    await page.goto('/app');
    const img = page.locator('.lp .vs-thumb').first();
    // The thumbnails are loading="lazy" and sit below the fold, so nothing is
    // fetched — and no error can fire — until the band is scrolled into view.
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.getAttribute('data-fb')).not.toBe('0');
    await expect.poll(() => img.getAttribute('src')).toContain('maxresdefault');
  });

  test('server-renders the video structured data', async ({ page }) => {
    await page.goto('/app');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const ld = blocks.join('');
    expect(ld).toContain('VideoObject');
    expect(ld).toContain('uploadDate');
    expect(ld).toContain('embedUrl');
  });

  test('arrows move the centre card', async ({ page }) => {
    await page.goto('/app');
    const centreTitle = () => page.locator('.lp .vs-card.is-centre .vs-title').innerText();
    const first = await centreTitle();

    await page.getByRole('button', { name: 'Next video' }).click();
    await expect.poll(centreTitle).not.toBe(first);

    await page.getByRole('button', { name: 'Previous video' }).click();
    await expect.poll(centreTitle).toBe(first);
  });

  test('exactly one card is centred, and it is the only one offering play', async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('.lp .vs-card.is-centre')).toHaveCount(1);
    // Flanking cards bring themselves forward instead of playing.
    await expect(page.locator('.lp .vs-play-btn[aria-label^="Play:"]')).toHaveCount(1);
    await expect(page.locator('.lp .vs-play')).toHaveCount(1);
  });

  test('clicking a flanking card centres it rather than playing it', async ({ page }) => {
    await page.goto('/app');
    const before = await page.locator('.lp .vs-card.is-centre .vs-title').innerText();
    await page.locator('.lp .vs-play-btn[aria-label^="Show:"]').first().click();
    await expect(page.locator('.lp iframe')).toHaveCount(0);
    await expect
      .poll(() => page.locator('.lp .vs-card.is-centre .vs-title').innerText())
      .not.toBe(before);
  });

  test('the carousel wraps rather than dead-ending', async ({ page }) => {
    await page.goto('/app');
    const n = await page.locator('.lp .vs-card').count();
    const first = await page.locator('.lp .vs-card.is-centre .vs-title').innerText();
    for (let i = 0; i < n; i++) await page.getByRole('button', { name: 'Next video' }).click();
    await expect
      .poll(() => page.locator('.lp .vs-card.is-centre .vs-title').innerText())
      .toBe(first);
  });

  test.describe('mobile', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('the flanking cards do not spill the page sideways', async ({ page }) => {
      await page.goto('/app');
      await expect(page.locator('.lp .vs-card.is-centre')).toHaveCount(1);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflows).toBe(false);
    });

    test('arrows are reachable and large enough to tap', async ({ page }) => {
      await page.goto('/app');
      for (const name of ['Previous video', 'Next video']) {
        const box = await page.getByRole('button', { name }).boundingBox();
        expect(Math.min(box!.width, box!.height)).toBeGreaterThanOrEqual(40);
      }
    });
  });
});

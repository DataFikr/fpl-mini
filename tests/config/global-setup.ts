import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Launch browser to warm up the application
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Pre-warm the application
    console.log('🔥 Warming up the application...');
    await page.goto('http://localhost:3002', {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });
    console.log('✅ Application warmed up successfully');

    // You can add more global setup here like:
    // - Database seeding
    // - Authentication state setup
    // - Test data preparation

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✅ Global setup completed');
}

export default globalSetup;
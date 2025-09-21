# 🎭 Playwright Testing Framework

Comprehensive UI testing setup for FPL Ranker using Playwright with TypeScript.

## 📁 Project Structure

```
tests/
├── e2e/                          # End-to-end test files
│   ├── home-page.spec.ts         # Home page tests
│   ├── team-page.spec.ts         # Team page tests
│   ├── league-page.spec.ts       # League page tests
│   ├── navigation.spec.ts        # Navigation and routing tests
│   ├── mobile-responsiveness.spec.ts # Mobile/responsive tests
│   ├── visual-regression.spec.ts # Visual regression tests
│   ├── accessibility.spec.ts     # Accessibility tests
│   └── api-mocking.spec.ts       # API mocking tests
├── pages/                        # Page Object Model classes
│   ├── base-page.ts             # Base page with common utilities
│   ├── home-page.ts             # Home page object
│   ├── team-page.ts             # Team page object
│   └── league-page.ts           # League page object
├── utils/                        # Test utilities and helpers
│   └── test-helpers.ts          # Common test functions
├── fixtures/                     # Test fixtures and setup
│   └── test-fixtures.ts         # Custom fixtures
├── config/                       # Test configuration
│   ├── global-setup.ts          # Global test setup
│   └── global-teardown.ts       # Global test cleanup
├── reports/                      # Test reports
│   ├── html/                    # HTML reports
│   ├── json/                    # JSON reports
│   └── junit/                   # JUnit XML reports
├── screenshots/                  # Test screenshots
├── visual-regression/           # Visual regression baselines
└── test-results/               # Test output files
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Application running on `localhost:3000`

### Installation

The testing framework is already installed. If you need to reinstall:

```bash
npm install --save-dev @playwright/test @axe-core/playwright pixelmatch
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with browser UI
npm run test:headed

# Run tests with Playwright UI mode
npm run test:ui

# Run specific test file
npx playwright test tests/e2e/home-page.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium

# Run mobile tests only
npm run test:mobile

# Run visual regression tests
npm run test:visual

# Run accessibility tests
npm run test:accessibility
```

### Debugging Tests

```bash
# Debug mode (opens browser with dev tools)
npm run test:debug

# Debug specific test
npx playwright test tests/e2e/home-page.spec.ts --debug

# Run with trace viewer
npx playwright test --trace on
```

### View Test Reports

```bash
# Show HTML report
npm run test:report

# Reports are also available at:
# - HTML: tests/reports/html/index.html
# - JSON: tests/reports/json/results.json
# - JUnit: tests/reports/junit/results.xml
```

## 🧪 Test Categories

### 1. Core Functionality Tests

**Home Page (`home-page.spec.ts`)**
- Page loading and basic elements
- Branding verification (FPLRanker)
- Search functionality
- Question cards section
- CTA section
- Mobile responsiveness
- Accessibility compliance

**Team Page (`team-page.spec.ts`)**
- Team information display
- Manager card functionality
- Statistics cards
- Mini leagues section
- Navigation (home icon)
- Gameweek 6 data verification
- Mobile layout

**League Page (`league-page.spec.ts`)**
- League information display
- Tab navigation (Headlines, Team Ranking, etc.)
- League statistics
- Navigation links
- Tab content verification
- Mobile responsiveness

### 2. Navigation Tests (`navigation.spec.ts`)

- Page-to-page navigation
- Browser back/forward
- URL structure validation
- Invalid route handling
- Cross-platform navigation
- Consistent branding

### 3. Mobile Responsiveness (`mobile-responsiveness.spec.ts`)

- Multiple device testing
- Touch target sizing
- Viewport handling
- Orientation changes
- No horizontal scroll
- Readable text sizes

### 4. Visual Regression (`visual-regression.spec.ts`)

- Full page screenshots
- Component-level screenshots
- Mobile vs desktop comparison
- Dark mode testing
- Loading states
- Error states
- Interactive states

### 5. Accessibility (`accessibility.spec.ts`)

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus management
- Touch accessibility

### 6. API Integration (`api-mocking.spec.ts`)

- API response mocking
- Error handling
- Slow response testing
- Network failures
- Rate limiting
- Data validation

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../fixtures/test-fixtures';

test.describe('Feature Name', () => {
  test('should do something', async ({ homePage }) => {
    await homePage.navigateToHome();
    await homePage.verifyHomePageLoaded();

    // Your test logic here
    await expect(homePage.logo).toBeVisible();
  });
});
```

### Using Page Objects

```typescript
// Good: Using page objects
test('should navigate correctly', async ({ homePage, teamPage }) => {
  await homePage.navigateToHome();
  await homePage.searchForTeam('5100818');
  await teamPage.verifyTeamPageLoaded();
});

// Avoid: Direct page interactions
test('should navigate correctly', async ({ page }) => {
  await page.goto('/');
  await page.fill('input', '5100818');
  // Don't do this - use page objects instead
});
```

### API Mocking

```typescript
test('should handle API errors', async ({ page }) => {
  // Mock API response
  await page.route('**/api/teams/**', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Server Error' })
    });
  });

  await page.goto('/team/5100818');
  // Test error handling
});
```

### Visual Testing

```typescript
test('should match visual baseline', async ({ homePage }) => {
  await homePage.navigateToHome();

  await expect(homePage.page).toHaveScreenshot('home-page.png', {
    threshold: 0.3, // Allow 30% pixel difference
    fullPage: true
  });
});
```

### Accessibility Testing

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## 🔧 Configuration

### Browser Configuration

Tests run on multiple browsers:
- **Chromium** (Google Chrome)
- **Firefox**
- **WebKit** (Safari)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)
- **Tablet** (iPad Pro)
- **Microsoft Edge**

### Test Environment

- **Base URL**: `http://localhost:3000`
- **Timeout**: 60 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Video**: On failure only
- **Trace**: On first retry

### Environment Variables

```bash
# Run in CI mode
CI=true npm test

# Specific browser
BROWSER=firefox npm test

# Headless mode
HEADLESS=false npm test
```

## 📊 Test Data

### Test Team IDs
- `5100818` - Primary test team
- `5093819` - Secondary test team
- `6463870` - Alternative test team

### Test League IDs
- `150789` - Best Man League (primary)
- `150788` - Alternative league
- `523651` - Toon Army Malaysia League

### Mock Data Generation

```typescript
import { generateTestTeamData, generateTestLeagueData } from '../utils/test-helpers';

const mockTeam = generateTestTeamData();
const mockLeague = generateTestLeagueData();
```

## 🐛 Common Issues & Solutions

### 1. Test Timeouts

```typescript
// Increase timeout for slow operations
await page.waitForLoadState('networkidle', { timeout: 30000 });

// Or use global timeout in config
timeout: 60 * 1000
```

### 2. Flaky Tests

```typescript
// Add retry logic
await clickWithRetry(locator, 3);

// Wait for stable state
await page.waitForFunction(() => !document.querySelector('.loading'));
```

### 3. API Dependency Issues

```typescript
// Mock all API calls
await mockFPLApiResponses(page);

// Or test with real API
// (no mocking - tests real integration)
```

### 4. Visual Test Failures

```bash
# Update visual baselines
npm run test:update-snapshots

# Or update specific test
npx playwright test visual-regression.spec.ts --update-snapshots
```

## 🏗️ CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: tests/reports/
```

### Docker Integration

```dockerfile
FROM mcr.microsoft.com/playwright:v1.55.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "test"]
```

## 📋 Best Practices

### 1. Test Organization

- ✅ Group related tests with `test.describe()`
- ✅ Use descriptive test names
- ✅ Keep tests independent
- ✅ Use page objects for reusability

### 2. Assertions

- ✅ Use specific assertions (`toContainText` vs `toBeVisible`)
- ✅ Assert on meaningful elements
- ✅ Avoid hardcoded waits, use `waitFor*` methods

### 3. Test Data

- ✅ Use mock data for consistent results
- ✅ Test with realistic data
- ✅ Clean up test data between tests

### 4. Performance

- ✅ Run tests in parallel when possible
- ✅ Use efficient locators
- ✅ Mock external APIs
- ✅ Skip unnecessary UI interactions

## 🔍 Debugging Tips

### 1. Browser DevTools

```bash
# Run with browser open
npm run test:headed

# Debug mode with devtools
npm run test:debug
```

### 2. Screenshots

```typescript
// Take screenshot at any point
await page.screenshot({ path: 'debug.png' });

// Take screenshot on failure (automatic)
screenshot: 'only-on-failure'
```

### 3. Console Logs

```typescript
// Monitor console errors
page.on('console', msg => console.log(msg.text()));
page.on('pageerror', error => console.log(error.message));
```

### 4. Trace Viewer

```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## 📈 Reporting

### HTML Reports

- Interactive test results
- Screenshots and videos
- Error details and stack traces
- Available at `tests/reports/html/index.html`

### JSON Reports

- Machine-readable results
- Integration with external tools
- Available at `tests/reports/json/results.json`

### JUnit Reports

- CI/CD integration
- Test management tools
- Available at `tests/reports/junit/results.xml`

## 🎯 Coverage Goals

- **Functional Coverage**: All major user flows
- **Browser Coverage**: Chrome, Firefox, Safari, Mobile
- **Accessibility**: WCAG 2.1 AA compliance
- **Visual Regression**: Key pages and components
- **Performance**: Load times under 3 seconds
- **Mobile**: All features work on mobile devices

## 🤝 Contributing

### Adding New Tests

1. Create test file in appropriate directory
2. Use existing page objects or create new ones
3. Follow naming conventions
4. Add to appropriate test suite
5. Update documentation

### Updating Page Objects

1. Keep page objects focused and cohesive
2. Use descriptive locator names
3. Add helper methods for common actions
4. Document public methods

### Test Guidelines

- Write tests from user perspective
- Test behavior, not implementation
- Keep tests simple and focused
- Use appropriate test types (unit, integration, e2e)

---

## 📞 Support

For issues with the testing framework:

1. Check the [Playwright documentation](https://playwright.dev/)
2. Review test logs and screenshots
3. Use debug mode to investigate failures
4. Check for known issues in this README

Happy Testing! 🎭✨
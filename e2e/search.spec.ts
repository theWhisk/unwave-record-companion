import { test, expect } from '@playwright/test';

const MOCK_CURRENCY_RATES = {
  GBP: 0.79, EUR: 0.92, USD: 1, RSD: 110.5, CHF: 0.9,
  CAD: 1.36, AUD: 1.53, JPY: 150.5, CNY: 7.24, KRW: 1340,
  INR: 83.2, BRL: 4.97, MXN: 17.2, SEK: 10.5,
};

const MOCK_RELEASE_DATA = {
  image: 'https://i.discogs.com/test-abbey-road.jpg',
  title: 'Abbey Road',
  artists: ['The Beatles'],
  year: 1969,
  noOfTracks: 17,
  noForSale: 500,
  originalPriceSuggestion: {
    'Mint (M)': { currency: 'USD', value: 50 },
    'Near Mint (NM or M-)': { currency: 'USD', value: 40 },
    'Very Good Plus (VG+)': { currency: 'USD', value: 30 },
    'Very Good (VG)': { currency: 'USD', value: 20 },
    'Good Plus (G+)': { currency: 'USD', value: 15 },
    'Good (G)': { currency: 'USD', value: 10 },
    'Fair (F)': { currency: 'USD', value: 5 },
    'Poor (P)': { currency: 'USD', value: 2 },
  },
  latestPriceSuggestion: 0,
  genres: ['Rock', 'Classic Rock'],
  summary: 'Abbey Road is the eleventh studio album by the Beatles.',
  rating: { count: 5000, average: 4.5 },
};

// React Flight wire format for a Next.js server action that returns a plain object.
// Row 1: the ReleaseData payload (JSON-serialised).
// Row 0: the [actionResult, [, actionFlightData]] tuple the router reducer expects.
//   "$@1" is a React Flight promise-reference that resolves to row 1.
//   The outer Promise returned by callServer chains to this reference, so
//   `await findRelease(...)` ultimately resolves to the ReleaseData value.
const RSC_ACTION_BODY = [
  `1:${JSON.stringify(MOCK_RELEASE_DATA)}`,
  `0:["$@1",[null,null]]`,
].join('\n') + '\n';

test.beforeEach(async ({ page }) => {
  await page.route('/api/currency', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CURRENCY_RATES),
    })
  );
});

test('page loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    // Ignore noise from Next.js dev-mode HMR and browser-injected scripts.
    const url = msg.location().url ?? '';
    if (url && !url.includes('localhost')) return;
    errors.push(msg.text());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors).toHaveLength(0);
});

test('search form input and submit button are visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#search')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test('camera button is visible and contains a hidden file input', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /scan a cover/i })).toBeVisible();
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toHaveAttribute('accept', 'image/*');
  await expect(fileInput).toHaveAttribute('capture', 'environment');
  await expect(fileInput).toBeHidden();
});

test('submitting a search triggers loading state then renders AlbumTile', async ({ page }) => {
  // Intercept the server action POST (Next-Action header identifies it).
  // Delay 100 ms so the loading spinner is observable before the response lands.
  await page.route('/', async (route) => {
    if (
      route.request().method() === 'POST' &&
      route.request().headers()['next-action']
    ) {
      await new Promise((r) => setTimeout(r, 100));
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': 'text/x-component',
          'x-action-revalidated': '[[],0,0]',
        },
        body: RSC_ACTION_BODY,
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.fill('#search', 'Abbey Road');
  await page.click('button[type="submit"]');

  await expect(page.locator('button[type="submit"] .loading')).toBeVisible();
  await expect(page.locator('.card-title')).toHaveText('Abbey Road', { timeout: 10_000 });
});

test('currency selector is visible and changing it does not crash the page', async ({ page }) => {
  await page.goto('/');
  const select = page.locator('select');
  await expect(select).toBeVisible();
  await select.selectOption('GBP');
  await expect(page.locator('#search')).toBeVisible();
});

test('layout has no horizontal overflow at 390×844 (iPhone 14)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const { docScrollWidth, innerWidth } = await page.evaluate(() => ({
    docScrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(docScrollWidth).toBeLessThanOrEqual(innerWidth);
});

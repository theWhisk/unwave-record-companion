import { test, expect } from '@playwright/test';

test('CI overflow debug — find offending element', async ({ page }) => {
  await page.route('/api/currency', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ USD: 1 }) })
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const data = await page.evaluate(() => {
    const overflowing: string[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const e = el as HTMLElement;
      if (e.scrollWidth > e.offsetWidth + 2) {
        overflowing.push(
          `${e.tagName}[class="${e.className.toString().slice(0, 40)}"] sw=${e.scrollWidth} ow=${e.offsetWidth} outerHTML="${e.outerHTML.slice(0, 120)}"`
        );
      }
    });
    return {
      htmlScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflowing: overflowing.slice(0, 20),
    };
  });

  // Log as assertion message so it appears in CI logs even on pass
  expect(data.htmlScrollWidth, JSON.stringify(data, null, 2)).toBeLessThanOrEqual(data.innerWidth);
});

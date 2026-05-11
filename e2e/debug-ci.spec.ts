import { test, expect } from '@playwright/test';

test('CI overflow debug v3', async ({ page }) => {
  await page.route('/api/currency', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ USD: 1 }) })
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const data = await page.evaluate(() => {
    const layout = document.querySelector('.cm-layout') as HTMLElement | null;
    const searchCol = document.querySelector('.cm-search-col') as HTMLElement | null;
    const resultCol = document.querySelector('.cm-result-col') as HTMLElement | null;
    const computedLayout = layout ? window.getComputedStyle(layout) : null;
    const mqFired = window.matchMedia('(max-width: 1080px)').matches;

    const overflowing: string[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const e = el as HTMLElement;
      if (e.scrollWidth > e.offsetWidth + 2) {
        const computed = window.getComputedStyle(e);
        overflowing.push(
          `${e.tagName}[${e.className.toString().slice(0, 30)}] sw=${e.scrollWidth} ow=${e.offsetWidth} overflow=${computed.overflow} w=${computed.width}`
        );
      }
    });

    // Check all children of cm-layout
    const layoutChildren: string[] = [];
    layout?.querySelectorAll('*').forEach((el) => {
      const e = el as HTMLElement;
      if (e.scrollWidth > e.offsetWidth + 2) {
        layoutChildren.push(
          `${e.tagName}[${e.className.toString().slice(0, 30)}] sw=${e.scrollWidth} ow=${e.offsetWidth} outerHTML="${e.outerHTML.slice(0, 100)}"`
        );
      }
    });

    return {
      htmlScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      mqFired,
      layoutGridCols: computedLayout?.gridTemplateColumns ?? 'N/A',
      layoutOW: layout?.offsetWidth ?? -1,
      layoutSW: layout?.scrollWidth ?? -1,
      searchColOW: searchCol?.offsetWidth ?? -1,
      resultColOW: resultCol?.offsetWidth ?? -1,
      overflowing: overflowing.slice(0, 10),
      layoutChildren: layoutChildren.slice(0, 10),
    };
  });

  expect(data.htmlScrollWidth, JSON.stringify(data, null, 2)).toBeLessThanOrEqual(data.innerWidth);
});

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint via next lint
npm test          # Run Jest test suite
npm run test:e2e  # Run Playwright e2e suite (starts dev server automatically)
```

Copy `.env.local.example` to `.env.local` before running locally:

```
DISCOGS_TOKEN=               # from discogs.com/settings/developers
EXCHANGE_RATE_API_KEY=       # from exchangerate-api.com
EXCHANGE_RATE_CACHE_DURATION=86400000
```

## Architecture

**Crate Mole** is a Next.js 14 App Router app. Users search for a vinyl record; the app returns pricing by condition, ratings, genre tags, album art, and a Wikipedia summary.

### Request flow

1. `app/page.tsx` (client) renders `LookUpForm` and `CameraButton`; both call the `findRelease` server action in `app/search/search-service.ts`
2. `findRelease` makes sequential Discogs calls:
   - `searchDiscogs` → finds matching releases, takes the first result with a `master_id`
   - `getDiscogsMasterRelease(master_id)` → gets the canonical master release
   - `getPriceSuggestion(master.main_release)` → price suggestions by condition (uses `main_release` ID, not master ID)
   - `getRating(master.main_release)` → community rating
3. Wikipedia: `searchWiki` then `getWikiSummary` for the album's extract
4. The assembled `ReleaseData` object is returned to the client and rendered by `AlbumTile`

All Discogs and Wikipedia calls happen server-side — the `DISCOGS_TOKEN` is never sent to the browser.

### Currency

`CurrencyProvider` (`app/currency-provider.tsx`) fetches exchange rates from `/api/currency` on app load and exposes them via the `useCurrency()` hook. The `/api/currency` route (Route Handler) caches rates in memory for `EXCHANGE_RATE_CACHE_DURATION` ms to stay within the ExchangeRate-API free tier. `AlbumTile` converts Discogs USD prices to the user's selected currency at render time.

### Key types

- `DiscogsMaster` / `DiscogsItem` / `ConditionValues` — in `types/discogs.ts`
- `ReleaseData` — the shape returned by `findRelease`, defined in `search-service.ts`
- `Currency` enum + `currencyOptions` map — in `types/currency.ts`

### Testing

Jest via `next/jest` (SWC transformer, node environment). Test files are colocated alongside source as `*.test.ts`.

When testing code that calls external APIs, mock these three modules at the top of the test file:

```ts
jest.mock('@/libs/discogs');
jest.mock('@/libs/wiki');
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
```

`ConditionValues` fixture objects must include all 8 `Condition` enum keys, each with `{ currency: string; value: number }`.

Playwright e2e tests live in `e2e/search.spec.ts` and exercise the full UI at `/`. Run them with `npm run test:e2e` — the Playwright config starts the dev server automatically. The server-action intercept in those tests targets `'/'` (not `'/search'`) because `findRelease` is a server action and Next.js posts it to the current page URL. To simulate a server action failure, use `route.abort('failed')` — a `route.fulfill({ status: 500 })` response is silently resolved by Next.js's `fetchServerAction` rather than rejected, so the form's `catch` block never runs. When mocking components in Jest render tests, use named function expressions (`function Foo() { return <div />; }`) rather than anonymous arrows to satisfy the `react/display-name` ESLint rule.

### Styling

TailwindCSS with DaisyUI component classes. Theme is set via `data-theme` on `<html>` — driven by `config.colors.theme` from `config.ts`. Global styles are in `app/globals.css`.

## Vision

The long-term goal is frictionless vinyl pricing: point a camera at an album cover and get an estimated price. The intended approach is to send a captured frame to a vision LLM (e.g. Claude Haiku) server-side, extract artist and title, then pass that as a free-text query to the existing Discogs pipeline. Text search is an interim input method on the way to that goal.

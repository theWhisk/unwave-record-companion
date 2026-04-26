# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint via next lint
npm test          # Run Jest test suite
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

1. `RecordSearchForm` (client) calls the `findRelease` server action in `app/search/search-service.ts`
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

### Styling

TailwindCSS with DaisyUI component classes. Theme is set via `data-theme` on `<html>` — driven by `config.colors.theme` from `config.ts`. Global styles are in `app/globals.css`.

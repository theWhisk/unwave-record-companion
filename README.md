# Crate Mole

A vinyl pricing companion for record collectors. Point your phone at an album cover — or type a search — to get Discogs price suggestions by condition, alongside ratings, genre tags, album art, and a Wikipedia summary.

Live at: https://unwave.net

Built by William (william@thewhisk.dev)

---

## What it does

1. **Camera scan** — point your phone at an album cover; a vision model identifies the record automatically
2. **Text search** — type an album title, artist, or both (e.g. "Dark Side of the Moon Pink Floyd")
3. The app queries Discogs to find the master release
4. Returns: album art, tracklist count, copies for sale, price suggestions by condition (Mint → Poor), ratings, genres
5. Fetches a Wikipedia summary for the album
6. Converts prices to the user's selected currency via ExchangeRate-API

## Stack

- **Next.js 14** (App Router, TypeScript, server actions)
- **TailwindCSS** + **DaisyUI** for styling
- **Discogs API** — record database, marketplace pricing, ratings
- **Anthropic API** — vision model for album cover identification
- **Wikipedia npm package** — album summaries
- **ExchangeRate-API** — currency conversion (cached 24h)
- **Jest** (via `next/jest`) + **Playwright** — test suite

## Local development

```bash
npm install
npm run dev         # localhost:3000
npm test            # Jest unit tests
npm run test:e2e    # Playwright end-to-end tests
```

Copy `.env.local.example` to `.env.local` and fill in the required values:

```
DISCOGS_TOKEN=               # from discogs.com/settings/developers
EXCHANGE_RATE_API_KEY=       # from exchangerate-api.com
EXCHANGE_RATE_CACHE_DURATION=86400000
ANTHROPIC_API_KEY=           # from console.anthropic.com
```

## Project structure

```
app/
  page.tsx                  # Root — search form + camera button + results
  search/
    search-service.ts       # Server action: orchestrates Discogs + Wiki
    components/
      RecordSearchForm.tsx  # Text search input
      CameraButton.tsx      # Camera capture → vision model → search
      AlbumTile.tsx         # Result card
  api/
    currency/route.ts       # Exchange rate endpoint (keeps API key server-side)
    identify/route.ts       # Album cover identification (Anthropic vision)
libs/
  discogs.ts                # Discogs API client
  wiki.ts                   # Wikipedia client
types/
  discogs.ts                # Discogs API types
  currency.ts               # Currency types
```

## Key design notes

- All external API calls (Discogs, Anthropic, ExchangeRate) go through Next.js server actions or API routes — tokens are never sent to the browser.
- Exchange rates are cached for 24 hours (`EXCHANGE_RATE_CACHE_DURATION`) to stay within the free tier.
- Currency selection is stored in React state in `app/page.tsx` and passed down, so it persists across searches without a page reload.
- `/search` permanently redirects to `/` — the full UI (text search + camera) lives at the root.

# Crate Mole

A vinyl record companion tool. Search any album by title (and optionally artist) to get pricing data, condition breakdowns, ratings, and a Wikipedia summary — all in one place.

Live at: https://unwave.net

Built by William (william@thewhisk.dev)

---

## What it does

1. User enters an album title (e.g. "Dark Side of the Moon, Pink Floyd")
2. The app queries the Discogs API to find the master release
3. Returns: album art, tracklist count, copies for sale, price suggestions by condition (Mint → Good), ratings, genres
4. Fetches a Wikipedia summary for the album
5. Converts prices to the user's selected currency via ExchangeRate-API

## Stack

- **Next.js 14** (App Router, TypeScript)
- **TailwindCSS** + **DaisyUI** for styling
- **Discogs API** — record database, marketplace pricing, ratings
- **Wikipedia npm package** — album summaries
- **ExchangeRate-API** — currency conversion (cached 24h)

## Local development

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in the three required values:

```
DISCOGS_TOKEN=           # from discogs.com/settings/developers
EXCHANGE_RATE_API_KEY=   # from exchangerate-api.com
EXCHANGE_RATE_CACHE_DURATION=86400000
```

## Project structure

```
app/
  page.tsx                  # Root — renders the search form
  search/
    page.tsx                # /search route (alternate entry point)
    search-service.ts       # Server action: orchestrates Discogs + Wiki + currency
    components/
      RecordSearchForm.tsx  # Search input form
      AlbumTile.tsx         # Result card
  api/
    currency/route.ts       # Exchange rate endpoint (keeps API key server-side)
    discogs/
      search/route.ts       # Discogs search proxy
      master/route.ts       # Discogs master release proxy
libs/
  discogs.ts                # Discogs API client
  wiki.ts                   # Wikipedia client
  seo.tsx                   # SEO tag helpers
types/
  discogs.ts                # Discogs API types
  currency.ts               # Currency types
```

## Key design notes

- The Discogs token and ExchangeRate API key are never exposed to the browser — all external API calls go through Next.js server actions or API routes.
- Exchange rates are cached for 24 hours (`EXCHANGE_RATE_CACHE_DURATION`) to avoid hammering the free tier.
- Currency selection is stored in React context (`app/currency-provider.tsx`) so it persists across searches without a page reload.

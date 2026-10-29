---
author: agents
status: normative
last_reviewed: 2026-10-28
---

# rwa-frontend AGENTS.md

Root rules: [`../../AGENTS.md`](../../AGENTS.md) (global safety, workflow, and verification baseline).
This file: rwa-frontend app-specific commands only.

## App commands

- Start dev server: `pnpm start:rwa`
- Build: `pnpm build:rwa`
- Lint: `pnpx nx run rwa-frontend:lint` (runs `lint-fsd` first)
- FSD check: `pnpx nx run rwa-frontend:lint-fsd` ([steiger](https://github.com/feature-sliced/steiger))
- Test: `pnpx nx run rwa-frontend:test`
- Typecheck: `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit`
- Rebuild `data/RWAs.json` from the CoinGecko RWA API: `pnpm --filter @cowprotocol/rwa-frontend update-registry` (run manually, needs `COINGECKO_API_KEY`)

## Environment

- `COINGECKO_API_KEY`: CoinGecko key (server-only). Without it the keyless public API is used, which is heavily rate limited.
- `COINGECKO_API_PLAN`: `pro` for `pro-api.coingecko.com`; any other value uses the Demo API.
- `COW_API_KEY`: CoW Partner API key (server-only), used by `/api/v1/quotes`. Without it the public order book API is used.
- `ONDO_API_KEY`: Ondo GM API key (server-only), for Ondo shares multipliers. Without it Ondo equivalent shares are estimated from the token price.
- `NEXT_PUBLIC_WC_PROJECT_ID`: Reown project id (defaults to the cowswap-frontend one).
- `NEXT_PUBLIC_ENABLE_SW=true`: register the service worker in dev (production always registers it).
- `NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL`: balances watcher API (defaults to `https://balances-watcher.cow.fi`).
- `NEXT_PUBLIC_SITE_ORIGIN`: origin that serves the app under `/rwa`, used for canonical links, Open Graph and the sitemap (defaults to `https://swap.cow.fi`). Only `VERCEL_ENV=production` is indexable: other deployments get `noindex`.
- `NEXT_PUBLIC_RWA_TOKEN_LIST_URL`: hosted copy of `/api/v1/token-list` for the balances watcher, which only accepts lists from `files.cow.fi` and `raw.githubusercontent.com`. Without it the list's tokens are sent as `customTokens`.

## App rules

- `data/RWAs.json` is the asset registry, rebuilt with `update-registry`. It holds stocks, ETFs and commodities (`RwaAsset.type`), with tokens of Ondo, xStocks, Coinbase, bStocks, Reality, Paxos and Tether only: the script skips other issuers and the assets left without tokens, and `validateRegistry` rejects them. Change the allowlist in both `scripts/updateRegistry.mjs` and `validateRegistry.ts`. Every asset has a unique `coingeckoId` (the CoinGecko RWA id). `validateRegistry.test.ts` validates it, so run the tests after editing it.
- Don't geoblock tokens in this app. The CoW Swap widget enforces geoblocking from its restricted token lists (`libs/core/src/cms`), so a new issuer needs its list there.
- `RwaAsset.newsFeed` is hand-edited and kept by `update-registry`. Use only an RSS or Atom feed on the issuer's own domain (newsroom or IR), never an aggregator. Before adding one, check that it returns XML to a non-browser User-Agent: many IR sites (Q4-hosted ones, for example) are behind Cloudflare or Akamai bot protection. When the feed fails, the asset page hides Related news.
- The asset logo (`RwaAsset.logoUrl`) is static registry data written by `update-registry`; token logos come from `/coins/markets` on the asset page.
- Price, 24h change, day range, market cap and volume of an asset come from CoinGecko `/rwas/markets` (the tokenized market over every chain and issuer), keyed by `coingeckoId`. Per-token data (`/coins/markets`) is loaded for the asset page and for tickers-filtered `/api/v1/assets` (the portfolio, to value each token at its own price); onchain stats only for the asset page. The table and top-movers 1D sparklines are the last 24 points of the `/rwas/markets` 7d sparkline, so they cost no extra request. Its last point lags `updatedAt` by up to an hour, so a 25th point would start the 24h change up to 26 hours back. That sparkline has no timestamps and CoinGecko drops the hours a token didn't trade, so only a full one (169 hourly points) is used (`buildDailySeries`, `buildMarketCapSeries`); a thin asset gets no table sparkline and is left out of the market cap chart, and a thin top mover takes its sparkline from its 1D chart (`getAssetChart`), at most one request per mover. The first token with a `coingeckoId` is the reference for the asset page price chart, divided by its shares per token (`getAssetChart`) so the chart is per share like `market.price`. The asset page derives the 24h change and day range from that chart (`useAssetMarket`), from 24h before `market.updatedAt` because the chart is cached longer than the price, and the other pages derive the 24h change from the 1D sparkline (`getDailyChange`), falling back to `/rwas/markets` without a full one, because a bad tick of one token in `/rwas/markets` skews the aggregate ones.
- Styling uses CSS Modules (`*.module.css`) instead of `styled-components/macro`: Turbopack does not run Babel macros.
- Import `@cowprotocol/common-*` libs through side-effect-free subpaths (e.g. `@cowprotocol/common-utils/errors`). Their root entries pull Lingui macros.
- Market data must come through `entities/asset/api/assetsService.ts`. Do not call providers from routes directly.
- Shares per token (`RwaMarketData.sharesPerToken`) come from `entities/asset/api/sharesMultipliers.ts`: Ondo's `sharesMultiplier` (it includes stock splits, so it can be below 1), 1 for rebasing xStocks (EVM `balanceOf()` is already scaled), 1 for commodity tokens (`isCommodityIssuer`: Paxos and Tether have no dividends, one token is one troy ounce), and onchain `convertToAssets` for wrapped xStocks (never the xStocks multiplier: v1 wrappers are anchored at their first deposit). Equivalent shares are balance × multiplier. A position is valued at stock price × multiplier when the multiplier is known, and at the token price only without one (`getTokenUsdPrice`): a CoinGecko token id is shared by every network, while wrapped xStocks rates differ per network. Quote/token prices are shown and ranked per share. The dividend model is per token (`getDividendModel(token)`), not per issuer.
- `/api/v1/token-list` is the token list of `data/RWAs.json`. Balances come from the balances watcher for the tokens in that list: the asset page streams them (`useAccountBalances`), the portfolio loads one snapshot per chain, cached for a minute, with a manual refresh (`useAccountBalanceSnapshots`).
- Every balances watcher SSE stream holds one of the browser's 6 HTTP/1.1 connections to its host. Every watcher request goes through the pool in `widgets/account/model/watcherConnections.ts`: snapshot loads with `withWatcherConnection`, live streams with `holdWatcherConnection`. An asset on more than 6 networks streams 5 and loads the rest once (`splitWatchedChains`).
- Account activity must come through `ActivityProvider` (`widgets/account/api/activity`). It is backed by the CoW order book trades for now; swap the implementation there, not in the UI.
- Data fetching uses Jotai: `atomWithQuery` from `jotai-tanstack-query`, with `atomFamily` from `jotai-family` for per-ticker queries. SWR is banned by ESLint. Query options live in `entities/asset/api/assetsQueries.ts`, and every query key starts with `RWA_QUERY_KEY_ROOT`.
- There is one `QueryClient` per app instance (`_app/layout/Providers.tsx`), shared by Jotai (`queryClientAtom`) and wagmi.
- `_app/offline/persistQueryCache.ts` persists app queries to IndexedDB and restores each query when it enters the cache. Don't add a second client-side cache for API data.
- When an API response changes shape, bump `STORE_NAME` in `persistQueryCache.ts` and add the old name to `PREVIOUS_STORE_NAMES`. Otherwise data saved in the old shape is restored as the new type.
- When `RwaAggregateMarket` changes shape, bump `RWA_MARKETS_CACHE_KEY` in `entities/asset/api/marketData.ts`: the Next data cache outlives deployments.
- Every CoinGecko response is cached per URL with `unstable_cache` (`shared/api/coingecko/coingeckoClient.ts`), never with `fetch` `next.revalidate`. Next serves an expired entry once before refreshing it, however old it is, so `fetchCachedJson` refetches an entry older than two `revalidate` periods and serves the old one only when that fails. Next keeps serving a stale entry when its refresh fails, and `withRetryBackoff` spaces the upstream retries of a failing URL: 60s, 120s, 240s and so on, up to an hour, per server instance. Concurrent requests for a URL share one upstream call, which times out after 10s. Only OHLCV treats a 404 as data (`allowNotFound`); elsewhere it's a failure, so it never replaces a good entry. When a cached CoinGecko payload changes shape, bump `RESPONSE_CACHE_KEY` there.
- `/coins/markets` and onchain `tokens/multi` are requested in batches cut from every registry coin id (250) or token address on a network (30), so assets of the same batch share one cache entry. Pass the registry list as `batchIds`/`batchAddresses`, not the ids of a single asset.
- A response built without upstream data sets `degraded: true` (`DegradableResponse` in `@/shared/api`). `jsonResponse` sends it with `no-store`, and the IndexedDB query persistence never saves it, so an outage can't overwrite the last good data.
- The app is served at `https://swap.cow.fi/rwa` (`basePath`, `BASE_PATH` in `shared/config`), on the CoW Swap origin, to share localStorage and the wallet connection. Next.js prefixes `Link`, router and asset URLs, but not `fetch`, `next/image` `src` or metadata URLs: wrap those with `withBasePath`. Local dev runs at `http://localhost:3000/rwa`.
- The wagmi storage key is `WALLET_STORAGE_KEY` from `@cowprotocol/common-const/wallet`, the one CoW Swap uses, so a wallet connected in one app is reconnected in the other. Don't give the wagmi adapter its own storage.
- `robots.txt` belongs to the CoW Swap origin, so this app has none: `swap.cow.fi/robots.txt` must list `https://swap.cow.fi/rwa/sitemap.xml`.
- Icons (`/icons/[size]`) and Open Graph images (`/og-image`, `/asset/[ticker]/og-image`) are static route handlers, not the `icon`/`apple-icon`/`opengraph-image` file conventions: Next.js leaves the `basePath` out of their links, and resolves social images against the branch URL on Vercel previews. `buildPageMetadata` links them with absolute URLs (`DEPLOYMENT_URL`).
- Asset pages are prerendered for upper-case tickers only (`dynamicParams = false`). `proxy.ts` redirects other casings.
- The service worker (`public/sw.js`) is registered as `/rwa/sw.js?v=<NEXT_PUBLIC_APP_VERSION>` with the `/rwa` scope (allowed by the `Service-Worker-Allowed` header in `next.config.ts`), so each deploy gets fresh caches. It never caches `/api/`, because IndexedDB holds that data.

## CoinGecko website vs this app

The app shows the tokenized market; coingecko.com stock pages lead with the underlying stock. Expect these differences, and don't "fix" them by mixing sources:

- The coingecko.com headline price and 24h change are the stock's ("Pre-Market • NASDAQ"), with the tokenized price shown separately. The API has no stock price: `/rwas/markets`, `/rwas/{id}` and `/rwas/{id}/market_chart` return tokenized data only (`tokenized_market_data`, `tokenized_prices`). Thin or off-hours tokens drift from the stock (ENLV on 2026-10-28: $2.78 tokenized vs $2.53 stock).
- coingecko.com top gainers rank by the stock change over every RWA; ours rank by the tokenized change over the registry. An asset with stale tokenized data (Ultra Clean Holdings, frozen since 2026-10-16) has a `null` change and no chart here while coingecko.com still lists it; an asset missing from `/rwas/markets` (Critical Metals) isn't here at all.
- coingecko.com "Tokenized Mcap" sums every `/rwas/markets` asset (gold alone is most of it); `totals.marketCap` sums the registry only.
- Bad ticks in a token feed reach both (ENLV on 2026-10-27, `/rwas/markets` 24h change about +1,590%). They roll off with the 24h window.
- Ondo's `/v1/assets/all/market` `underlyingMarket.price` is a stock price for Ondo assets only, without history, and doesn't always match coingecko.com. It isn't used.
- A stock price for the header and chart needs a new source (CoinGecko adding it to the RWA API, or a stock data provider). Until then `market.price` is the tokenized price per share.

## Architecture: Feature-Sliced Design

Follows [FSD for Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs), enforced by steiger (`steiger.config.ts`).

- `app/` (project root) is Next.js routing only. Every file re-exports from `src/_app` or `src/_pages`, including API routes (`export { getAssetsHandler as GET } from '@/_app/api-routes'`).
- `src/` layers, top to bottom: `_app` → `_pages` → `widgets` → `features` → `entities` → `shared`. A layer imports only from layers below it. Slices on the same layer do not import each other.
- `_app` and `_pages` carry the `_` prefix so they don't clash with Next.js `app`/`pages`.
- Import other slices only through their public API (`index.ts`), e.g. `@/entities/asset`. Inside a slice, use relative imports.
- Server-only code has a separate public API, `index.server.ts` (e.g. `@/entities/asset/index.server`, `@/shared/api/index.server`), and starts with `import 'server-only'`, so a client import fails the build.
- Segments are named by purpose (`ui`, `model`, `api`, `lib`, `config`), not by kind (`components`, `hooks`, `providers`).
- Pages first: keep code in the page slice until a second consumer needs it, then extract a feature or widget. steiger's `insignificant-slice` rule flags slices with a single consumer.

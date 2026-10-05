---
author: agents
status: normative
last_reviewed: 2026-09-29
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
- `NEXT_PUBLIC_WC_PROJECT_ID`: Reown project id (defaults to the cowswap-frontend one).
- `NEXT_PUBLIC_ENABLE_SW=true`: register the service worker in dev (production always registers it).
- `NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL`: balances watcher API (defaults to `https://balances-watcher.cow.fi`).
- `NEXT_PUBLIC_RWA_TOKEN_LIST_URL`: hosted copy of `/api/v1/token-list` for the balances watcher, which only accepts lists from `files.cow.fi` and `raw.githubusercontent.com`. Without it the list's tokens are sent as `customTokens`.

## App rules

- `data/RWAs.json` is the asset registry, rebuilt with `update-registry`. Every asset has a unique `coingeckoId` (the CoinGecko RWA id). `validateRegistry.test.ts` validates it, so run the tests after editing it.
- The asset logo (`RwaAsset.logoUrl`) is static registry data written by `update-registry`; token logos come from `/coins/markets` on the asset page.
- Price, 24h change, day range, market cap and volume of an asset come from CoinGecko `/rwas/markets` (the tokenized market over every chain and issuer), keyed by `coingeckoId`. Per-token data (`/coins/markets`) and onchain stats are loaded only for the asset page. The table and top-movers 1D sparklines are the last 24h of the `/rwas/markets` 7d sparkline, so they cost no extra request. The first token with a `coingeckoId` is the reference for the asset page price chart.
- Styling uses CSS Modules (`*.module.css`) instead of `styled-components/macro`: Turbopack does not run Babel macros.
- Import `@cowprotocol/common-*` libs through side-effect-free subpaths (e.g. `@cowprotocol/common-utils/errors`). Their root entries pull Lingui macros.
- Market data must come through `entities/asset/api/assetsService.ts`. Do not call providers from routes directly.
- `/api/v1/token-list` is the token list of `data/RWAs.json`. Balances come from the balances watcher for the tokens in that list: the asset page streams them (`useAccountBalances`), the portfolio loads one snapshot per chain, cached for a minute, with a manual refresh (`useAccountBalanceSnapshots`).
- Every balances watcher SSE stream holds one of the browser's 6 HTTP/1.1 connections to its host. Snapshot loads go through the shared `limitConcurrency` slot pool in `balanceSnapshotAtoms.ts`; don't open watcher streams outside it on pages that load many chains.
- Account activity must come through `ActivityProvider` (`widgets/account/api/activity`). It is backed by the CoW order book trades for now; swap the implementation there, not in the UI.
- Data fetching uses Jotai: `atomWithQuery` from `jotai-tanstack-query`, with `atomFamily` from `jotai-family` for per-ticker queries. SWR is banned by ESLint. Query options live in `entities/asset/api/assetsQueries.ts`, and every query key starts with `RWA_QUERY_KEY_ROOT`.
- There is one `QueryClient` per app instance (`_app/layout/Providers.tsx`), shared by Jotai (`queryClientAtom`) and wagmi.
- `_app/offline/persistQueryCache.ts` persists app queries to IndexedDB and restores each query when it enters the cache. Don't add a second client-side cache for API data.
- When an API response changes shape, bump `STORE_NAME` in `persistQueryCache.ts` and add the old name to `PREVIOUS_STORE_NAMES`. Otherwise data saved in the old shape is restored as the new type.
- When `RwaAggregateMarket` changes shape, bump `RWA_MARKETS_CACHE_KEY` in `entities/asset/api/marketData.ts`: the Next data cache outlives deployments.
- A response built without upstream data sets `degraded: true` (`DegradableResponse` in `@/shared/api`). `jsonResponse` sends it with `no-store`, and the IndexedDB query persistence never saves it, so an outage can't overwrite the last good data.
- Asset pages are prerendered for upper-case tickers only (`dynamicParams = false`). `proxy.ts` redirects other casings.
- The service worker (`public/sw.js`) is registered as `/sw.js?v=<NEXT_PUBLIC_APP_VERSION>`, so each deploy gets fresh caches. It never caches `/api/`, because IndexedDB holds that data.

## Architecture: Feature-Sliced Design

Follows [FSD for Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs), enforced by steiger (`steiger.config.ts`).

- `app/` (project root) is Next.js routing only. Every file re-exports from `src/_app` or `src/_pages`, including API routes (`export { getAssetsHandler as GET } from '@/_app/api-routes'`).
- `src/` layers, top to bottom: `_app` → `_pages` → `widgets` → `features` → `entities` → `shared`. A layer imports only from layers below it. Slices on the same layer do not import each other.
- `_app` and `_pages` carry the `_` prefix so they don't clash with Next.js `app`/`pages`.
- Import other slices only through their public API (`index.ts`), e.g. `@/entities/asset`. Inside a slice, use relative imports.
- Server-only code has a separate public API, `index.server.ts` (e.g. `@/entities/asset/index.server`, `@/shared/api/index.server`), and starts with `import 'server-only'`, so a client import fails the build.
- Segments are named by purpose (`ui`, `model`, `api`, `lib`, `config`), not by kind (`components`, `hooks`, `providers`).
- Pages first: keep code in the page slice until a second consumer needs it, then extract a feature or widget. steiger's `insignificant-slice` rule flags slices with a single consumer.

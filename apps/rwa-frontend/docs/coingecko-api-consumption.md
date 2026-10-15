# CoinGecko API consumption estimate (rwa-frontend)

Estimated CoinGecko Pro API usage for two traffic profiles:

- **A.** 10,000 site visitors per day, no wallet connected
- **B.** 5,000 active traders per day, wallet connected, 10 trades each (50,000 trades per day)

Based on the code at `feat/rwa/asset-news` (2026-10-15), with registry-wide batches and retry backoff. See also [`coingecko-data-flow.puml`](./coingecko-data-flow.puml).

## TL;DR

| Profile | Calls / day | Calls / month (30 d) | Range (sensitivity) |
|---|---|---|---|
| A: 10k visitors | ~28k | ~0.84M | 0.43M – 0.84M |
| B: 5k traders, alone | ~41k | ~1.24M | 0.61M – 1.24M |
| **A + B together** | **~47k** | **~1.4M** | **0.67M – 1.4M** |

- Every CoinGecko call is made **server-side** and goes through the Next.js data cache (`unstable_cache` per URL). The browser never calls CoinGecko.
- Most endpoints are **capped by the registry, not the traffic**. Token prices and onchain stats are fetched in registry-wide batches, so a few thousand users already hit the ceiling and more users cost nothing. Only `market_chart` still grows with traffic.
- **Trading itself adds no CoinGecko calls.** Quotes and orders go to the CoW order book, balances come from the balances watcher, and activity comes from CoW trades. Traders cost more only because they open more price charts.
- A + B fits the **Lite plan (2M credits, 500 calls/min)** with ~30% headroom. Peaks stay well under 100 calls/min.
- During a CoinGecko outage, a failing URL is retried after 60 s, 120 s, 240 s and so on, up to an hour, while users keep seeing the last good data.

## Which endpoints are called, and when

All calls go through `src/shared/api/coingecko/coingeckoClient.ts` → `entities/asset/api/marketData.ts` → `assetsService.ts`. Every response is cached per URL with `unstable_cache` behind `withRetryBackoff` (see [Retry backoff](#retry-backoff)).

| # | CoinGecko endpoint | Cache key | Revalidate | Calls per refresh | Triggered by (app route → UI) |
|---|---|---|---|---|---|
| 1 | `GET /rwas/markets?per_page=250&page=N&sparkline=true` | one global snapshot | 180 s | **4** (CoinGecko lists 988 RWAs today: 2 concurrent pages, then 2 sequential until a short page) | `/assets`, `/assets-search`, `/market-overview`, `/asset/{t}`: home table, search, portfolio, asset page |
| 2 | `GET /coins/markets?ids=<batch of 250>` | per batch of the 601 sorted registry coin ids (3 batches) | 60 s | 1 per batch holding the asset's ids (1 for most assets) | `/asset/{t}` and `/network-stats/{t}`: asset page, polled every 60 s |
| 3 | `GET /coins/{id}/market_chart?days=…` | per asset × range | 1D: 900 s; 1W: 1800 s (CDN 3600 s); 1M/1Y/ALL: 3600 s | 1 | `/chart/{t}?range`: asset page chart, no polling, 1D by default |
| 4 | `GET /onchain/networks/{net}/tokens/multi/{batch of 30}` | per batch of the sorted registry addresses on the chain (47 batches over all chains) | 300 s | 1 per batch holding the asset's addresses on the chain (0 on Ink, which isn't indexed) | `/network-stats/{t}?chainId`: trade widget, polled every 60 s, **with or without a wallet** |
| 5 | `GET /onchain/networks/{net}/tokens/{addr}/ohlcv/hour` | per token | 900 s | 1 per token of the 3 most-traded assets (~19 today) | `/market-overview`: home "Most traded" card, polled every 60 s. Paid plan only |

What `/rwas/markets` provides: per RWA, the price, 24h change, 24h high/low, market cap, 24h volume, last update time and a 7-day hourly sparkline, aggregated over every tokenized version of the asset. Its `current_price` is the headline price of the home table and the asset page, so the snapshot is kept at 3 minutes.

Not CoinGecko: `/quotes` (CoW order book), `/news` (issuer RSS), `/token-list` (static registry), balances (balances watcher), activity (CoW trades), SSR / `generateStaticParams` (registry only). Logos are CoinGecko **CDN** image URLs (`coin-images.coingecko.com`) and don't use API credits.

`update-registry` (manual script) makes ~1,000–1,100 calls per run: `/rwas/list`, `/rwas/{id}` per RWA, `/rwas/markets`, `/coins/markets` batches, and token lists. That's negligible unless it's automated.

## Calculation model

Data cache semantics: once a key's window expires, the next request is served stale and triggers **one** background refresh. So for one key:

```
calls/day = N × (1 − e^(−D/N))     N = active minutes / window minutes,  D = server demand per day for that key
```

This is Poisson occupancy of the windows: low demand gives ≈ D calls, high demand saturates at N. For a batch key, D is the sum of the demand of every asset in the batch.

The CDN (`s-maxage` = revalidate, SWR = 5×) only reduces D. It never pushes calls above N, so the model is an upper bound for a single function region.

### Fixed cost (independent of users, saturated by any steady traffic)

| Endpoint | Per day |
|---|---|
| #1 `/rwas/markets`: 4 calls × 480 windows | 1,920 |
| #5 OHLCV: 19 tokens × 96 windows (max 21–24 if the top 3 change) | 1,824 |
| **Total** | **~3,700** (~110k / month) |

Any open home tab polls `/market-overview` every 60 s, so 10k visitors per day keep both of these saturated around the clock.

### Capped by the registry

| Endpoint | Ceiling per day | Reached by |
|---|---|---|
| #2 `/coins/markets`: 3 batches × 1,440 windows | 4,320 | A alone: every batch holds a popular asset |
| #4 onchain `tokens/multi`: 47 batches × 288 windows | 13,536 | B gets close (~12.6k), A reaches ~9k |

Every batch is hit at least once a day in every scenario, so these two cost almost the same at 10k or 100k users. They grow with the registry: one more batch per 250 coins, or per 30 tokens on a chain.

### Variable cost (price charts)

Inputs:

- Registry: 486 assets, 1,268 tokens, 2.2 chains per asset on average, up to 7 networks.
- Popularity: Zipf (s = 1) over registry `priority`. The top asset (AAPL) gets 15% of views, the top 10 get 43%.
- Traffic spread evenly over 24 h. This is the pessimistic case, since more concentrated traffic shares more windows.

| Assumption | A: visitors | B: traders |
|---|---|---|
| Asset page views per day | 10k × 2 = 20k | 50k (one per trade) |
| Time on asset page (60 s polls) | 2 min → 40k page-minutes | 3 min (quote, sign, wait) → 150k page-minutes |
| Chart range other than 1D | 20% of views | 20% of views |
| Trade widget network | default chain (90%), 10% switch | wallet chain, spread over the asset's chains |

### Totals

| Endpoint | A | B alone | A + B (shared cache) |
|---|---|---|---|
| #1 `/rwas/markets` | 1,920 | 1,920 | 1,920 |
| #2 `/coins/markets` | 4,320 | 4,320 | 4,320 |
| #3 `market_chart` | 10,856 | 20,744 | 25,810 |
| #4 onchain `tokens/multi` | 8,976 | 12,550 | 12,651 |
| #5 OHLCV | 1,824 | 1,824 | 1,824 |
| **Total / day** | **~27.9k** | **~41.4k** | **~46.5k** |
| **Total / month** | **~0.84M** | **~1.24M** | **~1.4M** |

A + B is much less than A plus B, because both profiles hit the same cache keys. Only the charts of assets the visitors didn't open are new.

### Sensitivity (A + B, per day)

| Traffic window | Zipf s = 1.0 (flat) | Zipf s = 1.3 (concentrated) |
|---|---|---|
| 24 h | 46.5k | 36.3k |
| 12 h (e.g. US hours, nothing outside) | 29.9k | 22.4k |

The monthly range is **0.67M – 1.4M**. A alone is 0.43M – 0.84M, B alone 0.61M – 1.24M.

`market_chart` is the only endpoint that keeps growing with traffic. Its ceiling is ~93k/day (every asset × range in every window: 96 + 96 + 3 × 24 + 24 per asset, the 1W route is gated by its 3600 s CDN cache), but reaching it would take far more traffic than these profiles.

### Rate limit

At ~47k/day the average is ~32 calls/min, or ~42/min when all traffic falls in 12 h. The worst burst is every batch and OHLCV token refreshing in the same minute: 3 + 47 + 4 + 19 < 100 calls, plus the charts being opened. That's well under the 500/min of Lite.

## Plan fit (coingecko.com/en/api/pricing, checked 2026-10-15)

| Plan | Credits / month | Rate limit | Fits |
|---|---|---|---|
| Analyst ($129) | 500k | 500/min | none: the fixed cost and capped batches alone are ~0.6M |
| Lite ($499) | 2M | 500/min | A, B, **A + B (~1.4M)** |
| Pro ($999) | 5M (8M / 10M / 15M options) | 1,000/min | everything, with room for traffic growth on `market_chart` |

1 call = 1 credit for every endpoint, including onchain and RWA. Overage is $0.0005/call, so 1M calls over the limit cost ~$500/month.

## Optimizations, compared with the earlier code

The earlier code requested `/coins/markets` and onchain `tokens/multi` per asset, refreshed every minute, so each popular asset had its own cache keys.

| Change | A + B / day: before → now |
|---|---|
| **#2: `/coins/markets` in registry-wide batches.** The 601 registry coin ids are sorted and cut into batches of 250. An asset requests only the batches holding its ids, and every asset of a batch shares the URL (`getTokenMarkets` → `fetchCoinsMarkets(ids, 60, registryIds)`) | 102k → **4.3k** |
| **#4: onchain `tokens/multi` in registry-wide batches per chain, revalidate 60 s → 300 s.** Same batching over the addresses of each chain (583 + 542 + 102 + … = 47 batches of 30). Onchain cap and 24h DEX volume don't need minute freshness | 126k → **12.7k** |
| #5: OHLCV revalidate 300 s → 900 s (an hourly series) | 5.5k → 1.8k |
| #1: `/rwas/markets` revalidate 60 s → 180 s | 5.8k → 1.9k |
| #3: `market_chart` 1D revalidate 300 s → 900 s, route `s-maxage` too. The 1D chart (5-minute points) may lag up to 15 min at its right edge; the headline price above it comes from `/rwas/markets` | 34k → 25.8k |
| **Total** | **274k → 46.5k / day (8.2M → 1.4M / month)** |

Before, A + B needed the Pro plan with the 8M or 10M credit option, and peaks of ~400–600 calls/min ruled out Lite. Apart from the 1D chart route, the `/api/v1/*` `s-maxage` values and the client polls are unchanged. A `/network-stats` poll inside the 300 s window is a cache hit.

## Retry backoff

`shared/api/coingecko/retryBackoff.ts` (`withRetryBackoff`). Every CoinGecko URL, and the `/rwas/markets` snapshot as a whole, is a backoff key:

- After a failure (HTTP error, network error, or an HTTP 200 with an error `status`, which is how GeckoTerminal reports rate limiting), the next upstream attempt for that key waits **60 s**, then **120 s**, **240 s** and so on, capped at **1 hour**. A success resets it.
- During the wait, requests for that key throw `RetryBackoffError` without calling CoinGecko.
- Responses are cached with `unstable_cache` instead of `fetch` `next.revalidate`. That matters because Next only caches a `fetch` with HTTP 200, and its background refresh can't be skipped. With `unstable_cache`, a failed or skipped refresh keeps serving the stale entry, so users see the last good data while CoinGecko is down. Only a key with no cached entry at all returns `degraded: true`.
- 404 is cached like a success (`null`), so it's not retried in a loop either.

The backoff state is in memory, **per server instance**. Each Vercel function instance retries on its own schedule, so an outage costs at most one attempt per key per instance per backoff step.

## Risks not covered by the model

- **Cache stampede.** Concurrent misses on different function instances aren't deduplicated, so a hot key can refresh 2–3 times at the edge of a window.
- **Multi-region.** The model assumes one Vercel function region, which is the default. Each extra function region has its own data cache and multiplies the cost.
- **Shared key.** Preview deployments and local `pnpm start:rwa` with the production `COINGECKO_API_KEY` spend the same credits. Use a separate (Demo) key for them.
- **New deployments** don't reset the data cache (`RWA_MARKETS_CACHE_KEY` and `RESPONSE_CACHE_KEY` note it outlives deployments), so deploys add no cost.
- **Registry growth.** `/rwas/markets` grows with CoinGecko's total RWA count (988 today, paged by 250), not with our registry. The #2 and #4 ceilings grow with our registry.
- **Chart-heavy traffic.** If users browse many assets and ranges, `market_chart` grows toward its ~93k/day ceiling. With the ~22k/day of the other endpoints that would be ~3.5M/month, beyond Lite.

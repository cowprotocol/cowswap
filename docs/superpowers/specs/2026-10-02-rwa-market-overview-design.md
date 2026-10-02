# RWA home: Market overview section

Date: 2026-10-02
App: `apps/rwa-frontend`
Design: [Figma, node 3505:9018](https://www.figma.com/proto/Y8OXmctyXUjT5rHbE6orMb/CoW-Swap-%E2%80%94-Unified-Journey-Screens?node-id=3505-9018)

## Goal

Add the top section of the home page: a new heading and three cards (Market overview, Most traded, Top movers) above
the existing assets explorer. All numbers describe the assets in `data/RWAs.json`, not the whole tokenized-stock
market.

## Decisions

| Topic | Decision |
| --- | --- |
| Totals scope | Sum over every registry token on every network |
| Onchain market cap | Σ token onchain supply × CoinGecko coin price (same formula as `getNetworkStats`) |
| 24h DEX volume | Σ onchain API `volume_usd.h24` of every registry token |
| 7D chart (Market overview) | Onchain market cap history: CoinGecko `market_chart?days=7` price of each coin × the token's **current** onchain supply. Supply history is not available, so the chart shows price-driven change only |
| Most traded ranking | Top 3 assets by summed 24h DEX volume, all networks. Assets with `0`/`null` volume are excluded |
| Most traded preview | Line sparkline of hourly DEX volume, last 24h, from Pro token OHLCV (`/onchain/networks/{n}/tokens/{a}/ohlcv/hour`), summed over the asset's tokens |
| Top movers price | `RwaMarketData.change24h` of the reference token (labelled "Underlying price change" in the design) |
| Gainers / losers | Strict sign: gainers `change24h > 0` desc, losers `change24h < 0` asc, max 3 each. A list can be shorter or empty |
| Movers preview | Line sparkline of the 1D price chart (`getChart(asset, '1D')`) |
| Market status | "US market open/closed" from the registry `allowedTradingTime` (13:30–20:00 UTC, Mon–Fri). Holidays are ignored |
| "Ref." line | Time of the last market data update (`updatedAt`), formatted as `HH:mm` plus the viewer's time zone city |
| Heading | Replace "Tokenized stocks" with "Explore tokenized real-world assets" plus the issuers subtitle |
| No 24h deltas | The totals show current values only |

### Pro API requirement

Token OHLCV is available only on the CoinGecko Analyst plan or higher. `COINGECKO_API_PLAN=pro` with
`COINGECKO_API_KEY` enables it. Without Pro, `fetchOnchainTokenOhlcv` returns `null` and every Most traded item has
`series: null`, so the card renders the rows without sparklines. This is not a degraded response.

### Known data quirks

- Token OHLCV comes from the token's most liquid pool only, so the sparkline can sum to less than the 24h DEX volume
  shown beside it. The number comes from the token stats; the sparkline only shows the shape.
- Hourly candles exist only for hours with trades. The series is a fixed 24-hour window with missing hours filled
  with `0`.

## API

`GET /api/v1/market-overview`, cached with `jsonResponse(body, 60)`.

```ts
interface RwaMarketOverview extends DegradableResponse {
  totals: {
    /** USD */
    onchainCap: number | null
    /** USD */
    dexVolume24h: number | null
    /** Onchain cap history, 7 days */
    onchainCapSeries: RwaChartPoint[] | null
  }
  /** Max 3 */
  mostTraded: RwaMarketOverviewItem[]
  /** Max 3, `change24h > 0` */
  gainers: RwaMarketOverviewItem[]
  /** Max 3, `change24h < 0` */
  losers: RwaMarketOverviewItem[]
  /** ISO 8601, latest `RwaMarketData.updatedAt` */
  updatedAt: string | null
  /** `allowedTradingTime` of the first registry asset that has one; the client computes open/closed from it */
  tradingTime: RwaTradingTime | null
}

interface RwaMarketOverviewItem {
  ticker: string
  title: string
  /** `RwaTokenMarketData.logoUrl` of the reference token */
  logoUrl: string | null
  /** Percent */
  change24h: number | null
  /** USD, all networks */
  dexVolume24h: number | null
  /** Hourly DEX volume for `mostTraded`, 1D price for movers */
  series: RwaChartPoint[] | null
}
```

`series` points use the existing `RwaChartPoint` (`time` in Unix seconds, `value` in USD).

## Server

All new code lives in `entities/asset`, behind `assetsService` (the app rule: market data goes only through
`assetsService.ts`).

- `shared/api/coingecko/coingeckoClient.ts`
  - `fetchOnchainTokenOhlcv(chainId, address, timeframe, limit, revalidateSeconds)`: returns `null` when the plan is
    not `pro` or the network is not indexed.
  - The existing `fetchMarketChart` is reused for the 7D price history. Its response type gains no new fields; only
    `prices` is read.
- `entities/asset/api/marketData.ts`: `MarketDataProvider` gains
  - `getHourlyDexVolume(tokens: RwaToken[]): Promise<RwaChartPoint[] | null>`
  - `getPriceHistory(coingeckoIds: string[], days: '7'): Promise<Map<string, RwaChartPoint[]>>`
- `entities/asset/model/marketOverview.ts` (pure, unit tested):
  - `aggregateNetworkStats(assets, statsByChain)` → per-asset and total onchain cap and DEX volume
  - `rankMostTraded(items, limit)`, `splitMovers(items, limit)`
  - `buildOnchainCapSeries(supplies, priceHistories)`: aligns hourly price points onto one time grid, sums
    `supply × price` and skips coins with no history
  - `fillHourlySeries(candles, now, hours)`: 24 buckets, missing hours become `0`
- `entities/asset/api/assetsService.ts`: `getMarketOverview()`
  1. `loadMarketData()` (existing)
  2. `getNetworkStats` for each registry chain, in parallel, then `aggregateNetworkStats`
  3. In parallel: volume series for the top 3, 1D charts for the movers, 7D price histories for the cap series
- `_app/api-routes/marketOverview.ts` plus `app/api/v1/market-overview/route.ts` re-export.

### Failure handling

- Market data or any network stats call fails → `degraded: true`. The affected numbers are `null`, so the response is
  sent with `no-store` and never persisted to IndexedDB.
- A single series fails → only that `series` is `null`. The failure is logged and the response is not degraded.
- Token OHLCV answers 404 for a token without pools. That token contributes no candles; it is not a failure.
- `TokenLogo` moves from `_pages/asset/ui` to `shared/ui/token-logo`: the home cards are its second consumer.
- Upstream revalidation: OHLCV hourly 300s, 7D price history 3600s, 1D chart reuses the existing 300s (shared with
  the asset page through the Next `fetch` cache).

## Client

Page-first (FSD): the UI stays in `_pages/home` until another page needs it.

- `entities/asset/api/assetsApi.ts`: `getMarketOverviewUrl()`
- `entities/asset/api/assetsQueries.ts`: `marketOverviewQueryOptions()`, key `[RWA_QUERY_KEY_ROOT, 'market-overview']`,
  60s refetch interval, `placeholderData: keepPreviousData`
- `_pages/home/model/marketOverviewQueryAtom.ts`
- `_pages/home/model/topMoversTabAtom.ts`: `'gainers' | 'losers'`, default `'gainers'`
- `_pages/home/lib/usMarketStatus.ts` (pure, unit tested): open/closed from an `RwaTradingTime` and a `Date`
- `_pages/home/ui/`
  - `HomeHero.tsx`: heading and the issuers subtitle with Ondo and xStocks logos. Logo SVGs go in `public/issuers/`
  - `MarketOverview.tsx`: three-card grid. Three columns on desktop, one column under the tablet breakpoint
  - `MarketTotalsCard.tsx`: two numbers, 7D area chart, "7 days ago / Today" axis labels, market status, "Ref." line,
    info tooltip on "24h DEX volume"
  - `MostTradedCard.tsx`: rows with logo, title, ticker, compact USD volume, sparkline. Rows link to `/asset/[ticker]`
  - `TopMoversCard.tsx`: Gainers/Losers segmented toggle, rows with `+0.80%` change and sparkline, linked to `/asset/[ticker]`, empty state text
    when the selected list is empty
  - `Sparkline.tsx`: inline SVG polyline, no axes, green or red stroke for movers and neutral for volume. No
    `lightweight-charts`, to keep nine small charts cheap
  - `MarketOverview.module.css`: CSS Modules, existing color tokens
- Loading uses skeleton rows sized like the final content. A request error shows `StatusMessage` in place of the cards.
- `HomePage.tsx` renders `HomeHero`, `MarketOverview`, then the existing `AssetsExplorer`.

The persisted query cache needs no `STORE_NAME` bump: this is a new query key, and no existing response changes
shape.

## Testing

- `marketOverview.test.ts`: aggregation with `null` parts, ranking with ties and zero volume, strict-sign movers,
  the hourly fill, cap series alignment.
- `marketData.test.ts`: OHLCV mapping, `null` without Pro.
- `assetsService` test: degraded when network stats fail; a single series failure is not degraded.
- `usMarketStatus.test.ts`: open, before open, after close, weekend.
- `HomePage.test.tsx`: updated heading; cards render from a mocked query.
- Verification: `pnpx nx run rwa-frontend:lint` (includes `lint-fsd`), `pnpx nx run rwa-frontend:test`, the app
  typecheck.

## Out of scope

- The "All assets" table redesign shown below the cards in the same frame.
- Market holiday calendars.
- Supply history for the onchain cap chart.

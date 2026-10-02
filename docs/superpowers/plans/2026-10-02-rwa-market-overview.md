# RWA Market Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the home page hero ("Explore tokenized real-world assets") and three cards (Market overview, Most traded, Top movers) above the assets explorer. The cards get their data from a new `GET /api/v1/market-overview`.

**Architecture:** The server aggregates registry-wide data in `entities/asset` and exposes it only through `assetsService.getMarketOverview()`. That function uses CoinGecko markets, per-network onchain stats, Pro token OHLCV, and the 7D/1D price charts. Pure aggregation lives in `entities/asset/model/marketOverview.ts`. The client reads the route through a Jotai `atomWithQuery`. The UI stays in `_pages/home`, and the sparklines are plain inline SVG.

**Tech Stack:** Next.js 15 route handlers, TypeScript, Jotai + `jotai-tanstack-query`, CSS Modules, Jest + Testing Library, steiger (FSD lint).

**Spec:** `docs/superpowers/specs/2026-10-02-rwa-market-overview-design.md`
**Design:** Figma file `Y8OXmctyXUjT5rHbE6orMb`, node `3505:9018`

## Global Constraints

- **Do not run `git commit`.** The user asked for no commits. Leave every change in the working tree. `git mv` is allowed.
- `MUST NOT` use `any` or non-null assertions (`!`). `noUncheckedIndexedAccess` is on, so array indexing returns `T | undefined`.
- `MUST NOT` run `pnpm lint --fix`.
- Compare addresses with `areAddressesEqual` and key maps with `getAddressKey` (both from `@cowprotocol/cow-sdk`). Never use `toLowerCase()` or `===` on addresses.
- Catch rejections as `(err: unknown)`, then `const error = normalizeError(err)` (`@cowprotocol/common-utils/errors`).
- Comments only for workarounds or difficult math. Exported API doc comments only for range, default, or unit.
- Market data goes only through `entities/asset/api/assetsService.ts`. Routes never call providers.
- FSD: `app/` files only re-export. A layer imports only from layers below it. Import other slices only through their public API (`index.ts` / `index.server.ts`). Use relative imports inside a slice.
- Styling: CSS Modules with the existing tokens in `src/_app/styles/globals.css` (`--color-*`, `--radius`). No `styled-components`.
- Totals scope: sum over every registry token on every network.
- Lists: max 3 items each. Gainers `change24h > 0` desc, losers `change24h < 0` asc. Most traded excludes `0`/`null` volume.
- Cache: route `jsonResponse(body, 60)`. Upstream revalidation: OHLCV hourly 300s, 7D price history 3600s, 1D chart keeps its existing 300s.
- No `STORE_NAME` bump in `persistQueryCache.ts`: this adds a new query key, and no existing response changes shape.
- Copy, verbatim from the design: heading `Explore tokenized real-world assets`. Subtitle `Trade tokenized stocks and ETFs from Ondo, xStocks and other issuers across chains, powered by CoW Protocol.` Card titles `Market overview` (hint `7D`), `Most traded` (subtitle `24h DEX volume · All networks`), `Top movers` (subtitle `Underlying price change · 24h`). Labels `Onchain market cap`, `24h DEX volume`, `7 days ago`, `Today`, `US market open` / `US market closed`, `Ref. HH:mm <City>`. Toggle `Gainers` / `Losers`.

### Deviation from the spec (justified)

`MarketDataProvider.getNetworkStats(chainId, tokens, market: RwaMarketData | null)` changes its third parameter to `tokenMarkets: Record<string, RwaTokenMarketData>`, keyed by `coingeckoId`. The overview requests stats once per network for the tokens of all assets ("`getNetworkStats` for each registry chain" in the spec), so the prices must come from many assets. The method only ever read `market.tokens`. The `/network-stats` response shape does not change.

## Review Focus

1. **No Pro plan (keyless or Demo key):** every `mostTraded[].series` is `null`. The Most traded rows must still render logo, name and volume, with an empty fixed-width sparkline slot and no layout jump. Pinned in Task 5 (`renders rows without sparklines when series is null`).
2. **One network stats call fails:** the totals must show `—`, not a partial sum. Most traded must be empty, and the response must be `degraded` (so `no-store`). Pinned in Task 3 (`degrades and nulls the totals when one network fails`) and Task 5 (`shows dashes for null totals`).
3. **Weekend or a flat market, so an empty movers list:** the selected tab shows its empty text instead of an empty card. Pinned in Task 5 (`shows the empty text for an empty list`).
4. **Market status at the edges:** 13:30 UTC is open, 20:00 UTC is closed, Saturday is closed. Pinned in Task 4 (`usMarketStatus.test.ts`).
5. **Assets with `null` change or volume:** they never appear in gainers, losers or most traded, and never break sorting. Pinned in Task 1 (`rankMostTraded` / `splitMovers` tests).

---

## File Map

| File | Change | Responsibility |
| --- | --- | --- |
| `apps/rwa-frontend/src/entities/asset/model/types.ts` | Modify | `RwaMarketOverview*` types |
| `apps/rwa-frontend/src/entities/asset/lib/sumNullable.ts` | Create | `sumNullable`, moved out of `marketData.ts` |
| `apps/rwa-frontend/src/entities/asset/model/marketOverview.ts` (+ `.test.ts`) | Create | Pure aggregation, ranking, series alignment |
| `apps/rwa-frontend/src/shared/api/coingecko/coingeckoClient.ts` | Modify | `fetchOnchainTokenOhlcv`, `isProPlan`, 404-tolerant fetch |
| `apps/rwa-frontend/src/shared/api/index.server.ts` | Modify | Export the new client API |
| `apps/rwa-frontend/src/entities/asset/api/marketData.ts` (+ test) | Modify | `getHourlyDexVolume`, `getPriceHistory`, `getNetworkStats` param |
| `apps/rwa-frontend/src/entities/asset/api/assetsService.ts` (+ test) | Modify | `getMarketOverview`, shared network stats loader |
| `apps/rwa-frontend/src/entities/asset/index.ts`, `index.server.ts` | Modify | Public API |
| `apps/rwa-frontend/src/_app/api-routes/marketOverview.ts`, `index.ts` | Create/Modify | Route handler |
| `apps/rwa-frontend/app/api/v1/market-overview/route.ts` | Create | Next re-export |
| `apps/rwa-frontend/src/entities/asset/api/assetsApi.ts`, `assetsQueries.ts` | Modify | URL and query options |
| `apps/rwa-frontend/src/shared/ui/token-logo/*` | Move | `TokenLogo` from `_pages/asset/ui` |
| `apps/rwa-frontend/src/_pages/home/model/marketOverviewQueryAtom.ts`, `topMoversTabAtom.ts` | Create | Atoms |
| `apps/rwa-frontend/src/_pages/home/lib/usMarketStatus.ts`, `formatRefTime.ts`, `sparklinePoints.ts` (+ tests) | Create | Pure UI helpers |
| `apps/rwa-frontend/src/_pages/home/ui/*` | Create/Modify | Hero, cards, sparkline, `HomePage` |
| `apps/rwa-frontend/public/issuers/ondo.svg`, `xstocks.svg` | Create | Issuer logos from Figma |

All commands below run from the repo root (`/Users/shoom/IdeaProjects/cowswap2`). A single test file runs with:
`pnpx nx run rwa-frontend:test --testFile=<file name>`

---

### Task 1: Overview types and pure aggregation

**Files:**
- Modify: `apps/rwa-frontend/src/entities/asset/model/types.ts`
- Create: `apps/rwa-frontend/src/entities/asset/lib/sumNullable.ts`
- Modify: `apps/rwa-frontend/src/entities/asset/api/marketData.ts` (import `sumNullable`, delete the local copy)
- Create: `apps/rwa-frontend/src/entities/asset/model/marketOverview.ts`
- Test: `apps/rwa-frontend/src/entities/asset/model/marketOverview.test.ts`

**Interfaces:**
- Consumes: `RwaAsset`, `RwaChartPoint`, `RwaMarketData`, `RwaTokenNetworkStats` from `model/types.ts`
- Produces:
  - Types `RwaMarketOverview`, `RwaMarketOverviewItem`, `RwaMarketOverviewTotals`
  - `sumNullable(values: (number | null)[]): number | null`
  - `interface ChainNetworkStats { chainId: number; tokens: RwaTokenNetworkStats[] }`
  - `interface AssetStatsTotals { onchainCap: number | null; dexVolume24h: number | null }`
  - `interface NetworkStatsAggregate extends AssetStatsTotals { byTicker: Map<string, AssetStatsTotals>; supplyByCoin: Map<string, number> }`
  - `aggregateNetworkStats(assets: RwaAsset[], stats: ChainNetworkStats[], marketByTicker: Map<string, RwaMarketData>): NetworkStatsAggregate`
  - `toOverviewItem(asset: RwaAsset, market: RwaMarketData | undefined, totals: AssetStatsTotals | undefined): RwaMarketOverviewItem` (`series: null`)
  - `rankMostTraded(items: RwaMarketOverviewItem[], limit: number): RwaMarketOverviewItem[]`
  - `splitMovers(items: RwaMarketOverviewItem[], limit: number): { gainers: RwaMarketOverviewItem[]; losers: RwaMarketOverviewItem[] }`
  - `fillHourlySeries(points: RwaChartPoint[], nowSeconds: number, hours: number): RwaChartPoint[]`
  - `buildOnchainCapSeries(supplyByCoin: Map<string, number>, priceHistories: Map<string, RwaChartPoint[]>): RwaChartPoint[] | null`
  - `latestUpdatedAt(markets: RwaMarketData[]): string | null`

- [ ] **Step 1: Add the types**

Add to `types.ts`, after `RwaMarketData`:

```ts
export interface RwaMarketOverview extends DegradableResponse {
  totals: RwaMarketOverviewTotals
  /** Max 3, by 24h DEX volume */
  mostTraded: RwaMarketOverviewItem[]
  /** Max 3, `change24h > 0` */
  gainers: RwaMarketOverviewItem[]
  /** Max 3, `change24h < 0` */
  losers: RwaMarketOverviewItem[]
  /** ISO 8601, latest `RwaMarketData.updatedAt` */
  updatedAt: string | null
  /** `allowedTradingTime` of the first registry asset that has one */
  tradingTime: RwaTradingTime | null
}

export interface RwaMarketOverviewItem {
  ticker: string
  title: string
  /** `RwaTokenMarketData.logoUrl` of the reference token */
  logoUrl: string | null
  /** Percent */
  change24h: number | null
  /** USD, all networks */
  dexVolume24h: number | null
  /** Hourly DEX volume in `mostTraded`, 1D price in movers */
  series: RwaChartPoint[] | null
}

export interface RwaMarketOverviewTotals {
  /** USD */
  onchainCap: number | null
  /** USD */
  dexVolume24h: number | null
  /** 7 days */
  onchainCapSeries: RwaChartPoint[] | null
}
```

- [ ] **Step 2: Move `sumNullable`**

Create `entities/asset/lib/sumNullable.ts`:

```ts
export function sumNullable(values: (number | null)[]): number | null {
  const defined = values.filter((value): value is number => value !== null)

  return defined.length ? defined.reduce((acc, value) => acc + value, 0) : null
}
```

In `marketData.ts`, delete the local `sumNullable` function and add `import { sumNullable } from '../lib/sumNullable'` to the relative-import group, above `import type ... '../model/types'`.

- [ ] **Step 3: Write the failing tests**

Create `entities/asset/model/marketOverview.test.ts`:

```ts
import {
  aggregateNetworkStats,
  buildOnchainCapSeries,
  fillHourlySeries,
  latestUpdatedAt,
  rankMostTraded,
  splitMovers,
  toOverviewItem,
} from './marketOverview'

import type { RwaAsset, RwaMarketData, RwaMarketOverviewItem, RwaToken } from './types'

const HOUR = 3600

function token(chainId: number, address: string, coingeckoId?: string): RwaToken {
  return { chainId, address, symbol: 'T', name: 'Token', decimals: 18, issuer: 'Ondo', coingeckoId }
}

function asset(ticker: string, tokens: RwaToken[]): RwaAsset {
  return { ticker, title: ticker, type: 'stock', priority: 0, tokens }
}

function market(overrides: Partial<RwaMarketData>): RwaMarketData {
  return {
    price: null,
    change24h: null,
    dayLow: null,
    dayHigh: null,
    marketCap: null,
    volume24h: null,
    tokens: {},
    updatedAt: null,
    ...overrides,
  }
}

function item(ticker: string, change24h: number | null, dexVolume24h: number | null): RwaMarketOverviewItem {
  return { ticker, title: ticker, logoUrl: null, change24h, dexVolume24h, series: null }
}

const A1 = '0x1111111111111111111111111111111111111111'
const A56 = '0x2222222222222222222222222222222222222222'
const B1 = '0x3333333333333333333333333333333333333333'

describe('aggregateNetworkStats', () => {
  const assets = [asset('A', [token(1, A1, 'a-coin'), token(56, A56, 'a-coin')]), asset('B', [token(1, B1, 'b-coin')])]
  const marketByTicker = new Map([
    ['A', market({ tokens: { 'a-coin': { price: 50, marketCap: null, volume24h: null, logoUrl: null } } })],
  ])

  it('sums per asset and in total, skipping null parts', () => {
    const result = aggregateNetworkStats(
      assets,
      [
        { chainId: 1, tokens: [{ address: A1.toUpperCase().replace('0X', '0x'), onchainCap: 100, dexVolume24h: 10 }] },
        { chainId: 56, tokens: [{ address: A56, onchainCap: null, dexVolume24h: null }] },
      ],
      marketByTicker,
    )

    expect(result.byTicker.get('A')).toEqual({ onchainCap: 100, dexVolume24h: 10 })
    expect(result.byTicker.get('B')).toEqual({ onchainCap: null, dexVolume24h: null })
    expect(result.onchainCap).toBe(100)
    expect(result.dexVolume24h).toBe(10)
  })

  it('derives the onchain supply per coin from cap and price', () => {
    const result = aggregateNetworkStats(
      assets,
      [
        { chainId: 1, tokens: [{ address: A1, onchainCap: 100, dexVolume24h: 0 }] },
        { chainId: 56, tokens: [{ address: A56, onchainCap: 50, dexVolume24h: 0 }] },
      ],
      marketByTicker,
    )

    expect(result.supplyByCoin).toEqual(new Map([['a-coin', 3]]))
  })
})

describe('toOverviewItem', () => {
  it('takes the logo of the reference token and the asset DEX volume', () => {
    const nvda = asset('NVDA', [token(1, A1), token(1, A56, 'ref-coin')])
    const nvdaMarket = market({
      change24h: 1.5,
      tokens: { 'ref-coin': { price: 1, marketCap: null, volume24h: null, logoUrl: 'ref.png' } },
    })

    expect(toOverviewItem(nvda, nvdaMarket, { onchainCap: 1, dexVolume24h: 7 })).toEqual({
      ticker: 'NVDA',
      title: 'NVDA',
      logoUrl: 'ref.png',
      change24h: 1.5,
      dexVolume24h: 7,
      series: null,
    })
    expect(toOverviewItem(nvda, undefined, undefined)).toMatchObject({ logoUrl: null, change24h: null, dexVolume24h: null })
  })
})

describe('rankMostTraded', () => {
  it('sorts by volume desc, breaks ties by ticker and drops zero and null volume', () => {
    const ranked = rankMostTraded(
      [item('C', 0, 5), item('A', 0, 5), item('B', 0, 9), item('Z', 0, 0), item('N', 0, null), item('D', 0, 1)],
      3,
    )

    expect(ranked.map(({ ticker }) => ticker)).toEqual(['B', 'A', 'C'])
  })
})

describe('splitMovers', () => {
  it('uses the strict sign and sorts by magnitude', () => {
    const { gainers, losers } = splitMovers(
      [
        item('A', 1, null),
        item('B', 3, null),
        item('C', 0, null),
        item('D', -2, null),
        item('E', null, null),
        item('F', -0.5, null),
        item('G', 3, null),
      ],
      3,
    )

    expect(gainers.map(({ ticker }) => ticker)).toEqual(['B', 'G', 'A'])
    expect(losers.map(({ ticker }) => ticker)).toEqual(['D', 'F'])
  })

  it('returns empty lists when nothing moved', () => {
    expect(splitMovers([item('A', 0, null), item('B', null, null)], 3)).toEqual({ gainers: [], losers: [] })
  })
})

describe('fillHourlySeries', () => {
  const now = 100 * HOUR + 1800

  it('returns a fixed window ending at the current hour and fills missing hours with 0', () => {
    const series = fillHourlySeries(
      [
        { time: 100 * HOUR + 10, value: 4 },
        { time: 100 * HOUR + 20, value: 6 },
        { time: 98 * HOUR, value: 1 },
        { time: 90 * HOUR, value: 99 },
      ],
      now,
      3,
    )

    expect(series).toEqual([
      { time: 98 * HOUR, value: 1 },
      { time: 99 * HOUR, value: 0 },
      { time: 100 * HOUR, value: 10 },
    ])
  })
})

describe('buildOnchainCapSeries', () => {
  it('aligns coins on one hourly grid, carries prices forward and backfills late starts', () => {
    const series = buildOnchainCapSeries(
      new Map([
        ['a', 2],
        ['b', 1],
        ['no-history', 1000],
      ]),
      new Map([
        [
          'a',
          [
            { time: 10 * HOUR + 5, value: 100 },
            { time: 11 * HOUR + 10, value: 110 },
          ],
        ],
        ['b', [{ time: 11 * HOUR + 20, value: 50 }]],
        ['no-history', []],
      ]),
    )

    expect(series).toEqual([
      { time: 10 * HOUR, value: 250 },
      { time: 11 * HOUR, value: 270 },
    ])
  })

  it('returns null when no coin has history', () => {
    expect(buildOnchainCapSeries(new Map([['a', 1]]), new Map())).toBeNull()
  })
})

describe('latestUpdatedAt', () => {
  it('picks the latest timestamp and ignores nulls', () => {
    expect(
      latestUpdatedAt([
        market({ updatedAt: '2026-09-28T13:00:00.000Z' }),
        market({ updatedAt: null }),
        market({ updatedAt: '2026-09-28T13:05:00.000Z' }),
      ]),
    ).toBe('2026-09-28T13:05:00.000Z')
    expect(latestUpdatedAt([])).toBeNull()
  })
})
```

Note: in the first `aggregateNetworkStats` test the address is upper-cased on purpose. This proves the match goes through `areAddressesEqual`.

- [ ] **Step 4: Run tests to verify they fail**

Run: `pnpx nx run rwa-frontend:test --testFile=marketOverview.test.ts`
Expected: FAIL with `Cannot find module './marketOverview'`.

- [ ] **Step 5: Implement `marketOverview.ts`**

Create `entities/asset/model/marketOverview.ts`:

```ts
import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { sumNullable } from '../lib/sumNullable'

import type {
  RwaAsset,
  RwaChartPoint,
  RwaMarketData,
  RwaMarketOverviewItem,
  RwaTokenNetworkStats,
} from './types'

const HOUR_SECONDS = 3600

export interface ChainNetworkStats {
  chainId: number
  tokens: RwaTokenNetworkStats[]
}

export interface AssetStatsTotals {
  /** USD */
  onchainCap: number | null
  /** USD */
  dexVolume24h: number | null
}

export interface NetworkStatsAggregate extends AssetStatsTotals {
  byTicker: Map<string, AssetStatsTotals>
  /** Token units over all networks, keyed by `RwaToken.coingeckoId` */
  supplyByCoin: Map<string, number>
}

interface Movers {
  gainers: RwaMarketOverviewItem[]
  losers: RwaMarketOverviewItem[]
}

export function aggregateNetworkStats(
  assets: RwaAsset[],
  stats: ChainNetworkStats[],
  marketByTicker: Map<string, RwaMarketData>,
): NetworkStatsAggregate {
  const byTicker = new Map<string, AssetStatsTotals>()
  const supplyByCoin = new Map<string, number>()

  for (const asset of assets) {
    const market = marketByTicker.get(asset.ticker)
    const tokenStats = asset.tokens.map((token) => ({
      token,
      stat: stats
        .find(({ chainId }) => chainId === token.chainId)
        ?.tokens.find(({ address }) => areAddressesEqual(address, token.address)),
    }))

    byTicker.set(asset.ticker, {
      onchainCap: sumNullable(tokenStats.map(({ stat }) => stat?.onchainCap ?? null)),
      dexVolume24h: sumNullable(tokenStats.map(({ stat }) => stat?.dexVolume24h ?? null)),
    })

    for (const { token, stat } of tokenStats) {
      const coinId = token.coingeckoId
      const price = coinId ? market?.tokens[coinId]?.price : null
      const onchainCap = stat?.onchainCap

      if (!coinId || !price || onchainCap === null || onchainCap === undefined) continue

      // `onchainCap` is supply × price, see `MarketDataProvider.getNetworkStats`
      supplyByCoin.set(coinId, (supplyByCoin.get(coinId) ?? 0) + onchainCap / price)
    }
  }

  const totals = [...byTicker.values()]

  return {
    byTicker,
    supplyByCoin,
    onchainCap: sumNullable(totals.map(({ onchainCap }) => onchainCap)),
    dexVolume24h: sumNullable(totals.map(({ dexVolume24h }) => dexVolume24h)),
  }
}

export function toOverviewItem(
  asset: RwaAsset,
  market: RwaMarketData | undefined,
  totals: AssetStatsTotals | undefined,
): RwaMarketOverviewItem {
  const referenceId = asset.tokens.find((token) => token.coingeckoId)?.coingeckoId

  return {
    ticker: asset.ticker,
    title: asset.title,
    logoUrl: referenceId ? (market?.tokens[referenceId]?.logoUrl ?? null) : null,
    change24h: market?.change24h ?? null,
    dexVolume24h: totals?.dexVolume24h ?? null,
    series: null,
  }
}

export function rankMostTraded(items: RwaMarketOverviewItem[], limit: number): RwaMarketOverviewItem[] {
  return items
    .filter(({ dexVolume24h }) => (dexVolume24h ?? 0) > 0)
    .sort((a, b) => (b.dexVolume24h ?? 0) - (a.dexVolume24h ?? 0) || byTicker(a, b))
    .slice(0, limit)
}

export function splitMovers(items: RwaMarketOverviewItem[], limit: number): Movers {
  const gainers = items
    .filter(({ change24h }) => (change24h ?? 0) > 0)
    .sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0) || byTicker(a, b))
  const losers = items
    .filter(({ change24h }) => (change24h ?? 0) < 0)
    .sort((a, b) => (a.change24h ?? 0) - (b.change24h ?? 0) || byTicker(a, b))

  return { gainers: gainers.slice(0, limit), losers: losers.slice(0, limit) }
}

/** `hours` buckets ending at the hour of `nowSeconds`; values in the same hour are summed */
export function fillHourlySeries(points: RwaChartPoint[], nowSeconds: number, hours: number): RwaChartPoint[] {
  const lastHour = floorToHour(nowSeconds)
  const firstHour = lastHour - (hours - 1) * HOUR_SECONDS
  const values = new Map<number, number>()

  for (const { time, value } of points) {
    const hour = floorToHour(time)

    if (hour < firstHour || hour > lastHour) continue

    values.set(hour, (values.get(hour) ?? 0) + value)
  }

  return Array.from({ length: hours }, (_, index) => {
    const time = firstHour + index * HOUR_SECONDS

    return { time, value: values.get(time) ?? 0 }
  })
}

/** Σ supply × price per hour. Coins without history are skipped, `null` when none has one */
export function buildOnchainCapSeries(
  supplyByCoin: Map<string, number>,
  priceHistories: Map<string, RwaChartPoint[]>,
): RwaChartPoint[] | null {
  const coins = [...supplyByCoin].flatMap(([coinId, supply]) => {
    const history = priceHistories.get(coinId)

    return history?.length ? [{ supply, prices: toHourlyPoints(history) }] : []
  })

  if (!coins.length) return null

  const grid = [...new Set(coins.flatMap(({ prices }) => prices.map(({ time }) => time)))].sort((a, b) => a - b)
  const sampled = coins.map(({ supply, prices }) => ({ supply, values: sampleAt(prices, grid) }))

  return grid.map((time, index) => ({
    time,
    value: sampled.reduce((acc, { supply, values }) => acc + supply * (values[index] ?? 0), 0),
  }))
}

export function latestUpdatedAt(markets: RwaMarketData[]): string | null {
  return markets.reduce<string | null>(
    (latest, { updatedAt }) =>
      updatedAt && (!latest || Date.parse(updatedAt) > Date.parse(latest)) ? updatedAt : latest,
    null,
  )
}

function byTicker(a: RwaMarketOverviewItem, b: RwaMarketOverviewItem): number {
  return a.ticker.localeCompare(b.ticker)
}

function floorToHour(seconds: number): number {
  return Math.floor(seconds / HOUR_SECONDS) * HOUR_SECONDS
}

/** Last value of every hour, ascending. `history` must be ascending */
function toHourlyPoints(history: RwaChartPoint[]): RwaChartPoint[] {
  const byHour = new Map<number, number>()

  for (const { time, value } of history) byHour.set(floorToHour(time), value)

  return [...byHour].map(([time, value]) => ({ time, value }))
}

/** Latest price at or before each grid time; grid times before the first price use the first price */
function sampleAt(prices: RwaChartPoint[], grid: number[]): number[] {
  let index = 0

  return grid.map((time) => {
    while ((prices[index + 1]?.time ?? Infinity) <= time) index++

    return prices[index]?.value ?? 0
  })
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpx nx run rwa-frontend:test --testFile=marketOverview.test.ts`
Expected: PASS (all suites)

Run: `pnpx nx run rwa-frontend:test --testFile=marketData.test.ts`
Expected: PASS. This checks that the `sumNullable` move didn't break anything.

---

### Task 2: CoinGecko OHLCV client and provider methods

**Files:**
- Modify: `apps/rwa-frontend/src/shared/api/coingecko/coingeckoClient.ts`
- Modify: `apps/rwa-frontend/src/shared/api/index.server.ts`
- Modify: `apps/rwa-frontend/src/entities/asset/api/marketData.ts`
- Test: `apps/rwa-frontend/src/entities/asset/api/marketData.test.ts`

**Interfaces:**
- Consumes: `fillHourlySeries` (Task 1), `toChartPoints` (existing)
- Produces:
  - `type CoingeckoOhlcvCandle = [number, number, number, number, number, number]` (`[timestamp s, open, high, low, close, volume USD]`)
  - `type CoingeckoOhlcvTimeframe = 'day' | 'hour' | 'minute'`
  - `fetchOnchainTokenOhlcv(chainId: number, address: string, timeframe: CoingeckoOhlcvTimeframe, limit: number, revalidateSeconds: number): Promise<CoingeckoOhlcvCandle[] | null>`
  - `MarketDataProvider.getHourlyDexVolume(tokens: RwaToken[]): Promise<RwaChartPoint[] | null>`
  - `MarketDataProvider.getPriceHistory(coingeckoIds: string[], days: '7'): Promise<Map<string, RwaChartPoint[]>>`
  - `MarketDataProvider.getNetworkStats(chainId: number, tokens: RwaToken[], tokenMarkets: Record<string, RwaTokenMarketData>): Promise<RwaTokenNetworkStats[]>` (signature change, see Global Constraints)

- [ ] **Step 1: Write the failing tests**

In `marketData.test.ts`:

(a) In `describe('coingeckoProvider.getNetworkStats')`, change both calls to pass `MARKET.tokens` instead of `MARKET` (`getNetworkStats(1, [...], MARKET.tokens)` and `getNetworkStats(57073, ..., MARKET.tokens)`). Rename the constant to `TOKEN_MARKETS = { 'nvidia-ondo-tokenized-stock': { price: 230, marketCap: null, volume24h: null, logoUrl: null } }` and delete the unused fields.

(b) Append:

```ts
describe('coingeckoProvider.getHourlyDexVolume', () => {
  const NOW_SECONDS = 1_790_000_000
  const LAST_HOUR = 1_789_999_200
  const env = { ...process.env }

  beforeEach(() => {
    process.env.COINGECKO_API_KEY = 'key'
    process.env.COINGECKO_API_PLAN = 'pro'
    jest.spyOn(Date, 'now').mockReturnValue(NOW_SECONDS * 1000)
  })

  afterEach(() => {
    process.env = { ...env }
    jest.restoreAllMocks()
  })

  const [ondoEth, ondoBsc] = NVDA.tokens
  const tokens = [ondoEth, ondoBsc].filter((t) => t !== undefined)

  it('sums hourly candle volumes of every token into a 24h window', async () => {
    const fetchMock = mockFetch({
      data: {
        attributes: {
          ohlcv_list: [
            [LAST_HOUR, 1, 1, 1, 1, 10],
            [LAST_HOUR - 3600, 1, 1, 1, 1, 5],
          ],
        },
      },
    })

    const series = await coingeckoProvider.getHourlyDexVolume(tokens)

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      `https://pro-api.coingecko.com/api/v3/onchain/networks/eth/tokens/${ondoEth?.address}/ohlcv/hour?aggregate=1&limit=24&currency=usd`,
    )
    expect(series).toHaveLength(24)
    expect(series?.[23]).toEqual({ time: LAST_HOUR, value: 20 })
    expect(series?.[22]).toEqual({ time: LAST_HOUR - 3600, value: 10 })
    expect(series?.[0]).toEqual({ time: LAST_HOUR - 23 * 3600, value: 0 })
  })

  it('treats 404 as a token without candles', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) })

    const series = await coingeckoProvider.getHourlyDexVolume(tokens)

    expect(series).toHaveLength(24)
    expect(series?.every(({ value }) => value === 0)).toBe(true)
  })

  it('returns null without the Pro plan', async () => {
    process.env.COINGECKO_API_PLAN = 'demo'
    const fetchMock = mockFetch({})

    expect(await coingeckoProvider.getHourlyDexVolume(tokens)).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws on other upstream errors', async () => {
    mockFetch({}, false)

    await expect(coingeckoProvider.getHourlyDexVolume(tokens)).rejects.toThrow('responded with 429')
  })
})

describe('coingeckoProvider.getPriceHistory', () => {
  it('maps every coin to its 7D price points', async () => {
    const fetchMock = mockFetch({ prices: [[1_000, 1], [2_000, 2]] })

    const histories = await coingeckoProvider.getPriceHistory(['a', 'b'], '7')

    expect(String(fetchMock.mock.calls[0][0])).toContain('/coins/a/market_chart?vs_currency=usd&days=7')
    expect(histories).toEqual(
      new Map([
        ['a', [{ time: 1, value: 1 }, { time: 2, value: 2 }]],
        ['b', [{ time: 1, value: 1 }, { time: 2, value: 2 }]],
      ]),
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpx nx run rwa-frontend:test --testFile=marketData.test.ts`
Expected: FAIL. `getHourlyDexVolume` / `getPriceHistory` are not functions, and TS errors on the changed `getNetworkStats` argument.

- [ ] **Step 3: Implement the client**

In `coingeckoClient.ts`:

Add the exported types after `CoingeckoOnchainToken`:

```ts
/** `[timestamp s, open, high, low, close, volume]`, USD */
export type CoingeckoOhlcvCandle = [number, number, number, number, number, number]

export type CoingeckoOhlcvTimeframe = 'day' | 'hour' | 'minute'
```

Add the response interface next to `OnchainTokensResponse`:

```ts
interface OnchainOhlcvResponse {
  data?: { attributes: { ohlcv_list: CoingeckoOhlcvCandle[] } }
}
```

Add after `fetchOnchainTokens`:

```ts
/**
 * Candles of the token's most liquid pool, Pro plan only.
 * `null` without the Pro plan or when the onchain API doesn't index the network, empty for a token without pools.
 */
export async function fetchOnchainTokenOhlcv(
  chainId: number,
  address: string,
  timeframe: CoingeckoOhlcvTimeframe,
  limit: number,
  revalidateSeconds: number,
): Promise<CoingeckoOhlcvCandle[] | null> {
  const network = ONCHAIN_NETWORKS[chainId]

  if (!network || !isProPlan()) return null

  const { baseUrl, headers } = getOnchainConfig()
  const response = await fetchJsonOrNotFound<OnchainOhlcvResponse>(
    `${baseUrl}/networks/${network}/tokens/${address}/ohlcv/${timeframe}?aggregate=1&limit=${limit}&currency=usd`,
    headers,
    revalidateSeconds,
  )

  return response?.data?.attributes.ohlcv_list ?? []
}
```

Replace `fetchJson` with these four functions:

```ts
async function fetchJson<T>(url: string, headers: Record<string, string>, revalidate: number): Promise<T> {
  return readJson<T>(url, await request(url, headers, revalidate))
}

/** `null` when the upstream answers 404 */
async function fetchJsonOrNotFound<T>(url: string, headers: Record<string, string>, revalidate: number): Promise<T | null> {
  const response = await request(url, headers, revalidate)

  return response.status === 404 ? null : readJson<T>(url, response)
}

function request(url: string, headers: Record<string, string>, revalidate: number): Promise<Response> {
  return fetch(url, { headers: { accept: 'application/json', ...headers }, next: { revalidate } })
}

function readJson<T>(url: string, response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`CoinGecko ${new URL(url).pathname} responded with ${response.status}`)
  }

  return response.json() as Promise<T>
}
```

Add `isProPlan` and use it in `getConfig`:

```ts
function isProPlan(): boolean {
  return Boolean(process.env.COINGECKO_API_KEY) && process.env.COINGECKO_API_PLAN === 'pro'
}
```

In `getConfig`, replace `if (process.env.COINGECKO_API_PLAN === 'pro') {` with `if (isProPlan()) {`.

In `shared/api/index.server.ts`, extend the coingecko export with `type CoingeckoOhlcvCandle`, `type CoingeckoOhlcvTimeframe` and `fetchOnchainTokenOhlcv`, keeping alphabetical order.

- [ ] **Step 4: Implement the provider methods**

In `marketData.ts`:

Imports (`RwaTokenMarketData` is already imported): add `import { fillHourlySeries } from '../model/marketOverview'` (relative group, after `../lib/sumNullable`). Extend the `@/shared/api/index.server` import with `type CoingeckoOhlcvCandle` and `fetchOnchainTokenOhlcv`.

Interface:

```ts
export interface MarketDataProvider {
  /** Missing tickers in the result mean the provider has no data for them */
  getMarketData(assets: RwaAsset[]): Promise<Map<string, RwaMarketData>>
  getChart(asset: RwaAsset, range: RwaChartRange): Promise<RwaChartPoint[]>
  /** `tokens` are on `chainId`, `tokenMarkets` (keyed by `coingeckoId`) gives their prices */
  getNetworkStats(
    chainId: number,
    tokens: RwaToken[],
    tokenMarkets: Record<string, RwaTokenMarketData>,
  ): Promise<RwaTokenNetworkStats[]>
  /** USD per hour over the last 24h summed over `tokens`, `null` when the provider has no candles for any of them */
  getHourlyDexVolume(tokens: RwaToken[]): Promise<RwaChartPoint[] | null>
  /** Keyed by coin id */
  getPriceHistory(coingeckoIds: string[], days: '7'): Promise<Map<string, RwaChartPoint[]>>
}
```

Constants (next to the existing ones):

```ts
const OHLCV_REVALIDATE_SECONDS = 300
const PRICE_HISTORY_REVALIDATE_SECONDS = 3600
const DEX_VOLUME_HOURS = 24
```

In `getNetworkStats`, rename the parameter to `tokenMarkets` and change the price line to:

```ts
const price = token.coingeckoId ? (tokenMarkets[token.coingeckoId]?.price ?? null) : null
```

Add to `coingeckoProvider`:

```ts
  async getHourlyDexVolume(tokens) {
    const candleLists = await Promise.all(
      tokens.map((token) =>
        fetchOnchainTokenOhlcv(token.chainId, token.address, 'hour', DEX_VOLUME_HOURS, OHLCV_REVALIDATE_SECONDS),
      ),
    )
    const indexed = candleLists.filter((candles): candles is CoingeckoOhlcvCandle[] => candles !== null)

    if (!indexed.length) return null

    const volumes = indexed.flat().map(([time, , , , , volume]) => ({ time, value: volume }))

    return fillHourlySeries(volumes, Math.floor(Date.now() / 1000), DEX_VOLUME_HOURS)
  },

  async getPriceHistory(coingeckoIds, days) {
    const histories = await Promise.all(
      coingeckoIds.map(async (id) => {
        const chart = await fetchMarketChart(id, days, PRICE_HISTORY_REVALIDATE_SECONDS)

        return [id, toChartPoints(chart.prices)] as const
      }),
    )

    return new Map(histories)
  },
```

In `assetsService.ts` `getAssetNetworkStats`, change the provider call's third argument from `byTicker.get(asset.ticker) ?? null` to `byTicker.get(asset.ticker)?.tokens ?? {}`. Task 3 restructures this function, but this keeps the typecheck green now.

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpx nx run rwa-frontend:test --testFile=marketData.test.ts`
Expected: PASS

Run: `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit`
Expected: no errors

---

### Task 3: `getMarketOverview` service and route

**Files:**
- Modify: `apps/rwa-frontend/src/entities/asset/api/assetsService.ts`
- Modify: `apps/rwa-frontend/src/entities/asset/index.server.ts`
- Create: `apps/rwa-frontend/src/_app/api-routes/marketOverview.ts`
- Modify: `apps/rwa-frontend/src/_app/api-routes/index.ts`
- Create: `apps/rwa-frontend/app/api/v1/market-overview/route.ts`
- Test: `apps/rwa-frontend/src/entities/asset/api/assetsService.test.ts`

**Interfaces:**
- Consumes: Task 1 (`aggregateNetworkStats`, `toOverviewItem`, `rankMostTraded`, `splitMovers`, `buildOnchainCapSeries`, `latestUpdatedAt`, `ChainNetworkStats`) and Task 2 provider methods
- Produces: `getMarketOverview(): Promise<RwaMarketOverview>` (server public API), `getMarketOverviewHandler(): Promise<Response>`, `GET /api/v1/market-overview`

- [ ] **Step 1: Write the failing tests**

In `assetsService.test.ts`:

Replace the mock factory and add mock handles:

```ts
jest.mock('./marketData', () => ({
  coingeckoProvider: {
    getMarketData: jest.fn(),
    getChart: jest.fn(),
    getNetworkStats: jest.fn(),
    getHourlyDexVolume: jest.fn(),
    getPriceHistory: jest.fn(),
  },
}))

const getMarketDataMock = coingeckoProvider.getMarketData as jest.Mock
const getChartMock = coingeckoProvider.getChart as jest.Mock
const getNetworkStatsMock = coingeckoProvider.getNetworkStats as jest.Mock
const getHourlyDexVolumeMock = coingeckoProvider.getHourlyDexVolume as jest.Mock
const getPriceHistoryMock = coingeckoProvider.getPriceHistory as jest.Mock
```

Change the import to `import { getAsset, getMarketOverview, listAssets } from './assetsService'`, and add `import type { RwaToken } from '../model/types'`. The new `describe` below is a top-level sibling of the existing one, so it has its own `afterEach`.

Append:

```ts
describe('getMarketOverview', () => {
  const NVDA_OVERVIEW_MARKET = {
    ...NVDA_MARKET,
    tokens: { 'nvidia-ondo-tokenized-stock': { price: 200, marketCap: null, volume24h: null, logoUrl: 'nvda.png' } },
  }
  const AAPL_MARKET = { ...NVDA_MARKET, change24h: -1, tokens: {}, updatedAt: '2026-09-28T13:05:00.000Z' }

  function volumeOf({ symbol }: RwaToken): number {
    if (symbol.startsWith('NVDA')) return 1000
    if (symbol.startsWith('SPY')) return 500

    return 0
  }

  function statsOf(_chainId: number, tokens: RwaToken[]): object[] {
    return tokens.map((token) => ({ address: token.address, onchainCap: 100, dexVolume24h: volumeOf(token) }))
  }

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    getMarketDataMock.mockResolvedValue(
      new Map([
        ['NVDA', NVDA_OVERVIEW_MARKET],
        ['AAPL', AAPL_MARKET],
      ]),
    )
    getNetworkStatsMock.mockImplementation(async (chainId: number, tokens: RwaToken[]) => statsOf(chainId, tokens))
    getHourlyDexVolumeMock.mockResolvedValue([{ time: 1, value: 1 }])
    getChartMock.mockResolvedValue([{ time: 1, value: 2 }])
    getPriceHistoryMock.mockResolvedValue(new Map([['nvidia-ondo-tokenized-stock', [{ time: 3600, value: 210 }]]]))
  })

  afterEach(() => {
    jest.restoreAllMocks()
    ;[getMarketDataMock, getChartMock, getNetworkStatsMock, getHourlyDexVolumeMock, getPriceHistoryMock].forEach((mock) =>
      mock.mockReset(),
    )
  })

  it('aggregates the whole registry', async () => {
    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(false)
    expect(getNetworkStatsMock).toHaveBeenCalledTimes(3)
    expect(overview.totals.dexVolume24h).toBe(6000)
    expect(overview.totals.onchainCap).toBe(3100)
    expect(getPriceHistoryMock).toHaveBeenCalledWith(['nvidia-ondo-tokenized-stock'], '7')
    expect(overview.totals.onchainCapSeries).toEqual([{ time: 3600, value: 210 }])
    expect(overview.mostTraded.map(({ ticker }) => ticker)).toEqual(['NVDA', 'SPY'])
    expect(overview.mostTraded[0]).toMatchObject({ logoUrl: 'nvda.png', dexVolume24h: 5000, series: [{ time: 1, value: 1 }] })
    expect(overview.gainers.map(({ ticker }) => ticker)).toEqual(['NVDA'])
    expect(overview.gainers[0]?.series).toEqual([{ time: 1, value: 2 }])
    expect(overview.losers.map(({ ticker }) => ticker)).toEqual(['AAPL'])
    expect(overview.updatedAt).toBe('2026-09-28T13:05:00.000Z')
    expect(overview.tradingTime).toEqual({ title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' })
  })

  it('degrades and nulls the totals when one network fails', async () => {
    getNetworkStatsMock.mockRejectedValueOnce(new Error('GeckoTerminal responded with 429'))

    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(true)
    expect(overview.totals).toEqual({ onchainCap: null, dexVolume24h: null, onchainCapSeries: null })
    expect(overview.mostTraded).toEqual([])
    expect(overview.gainers.map(({ ticker }) => ticker)).toEqual(['NVDA'])
  })

  it('degrades when market data fails', async () => {
    getMarketDataMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(true)
    expect(overview.gainers).toEqual([])
    expect(overview.losers).toEqual([])
  })

  it('nulls only the failed series without degrading', async () => {
    getHourlyDexVolumeMock.mockRejectedValue(new Error('CoinGecko responded with 500'))
    getChartMock.mockResolvedValue([])

    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(false)
    expect(overview.mostTraded.every(({ series }) => series === null)).toBe(true)
    expect(overview.gainers[0]?.series).toBeNull()
    expect(overview.totals.onchainCapSeries).not.toBeNull()
  })
})
```

Expected numbers come from `data/RWAs.json`: 31 tokens on chains 1, 56 and 42161. NVDA has 5 tokens × 1000, and SPY has 2 tokens × 500. NVDA supply is 2 Ondo tokens × 100 / 200 = 1, so the series point is 1 × 210. If the registry changes, recompute these numbers.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpx nx run rwa-frontend:test --testFile=assetsService.test.ts`
Expected: FAIL. `getMarketOverview` is not exported.

- [ ] **Step 3: Implement the service**

In `assetsService.ts`:

Imports: add these to the relative group:

```ts
import {
  aggregateNetworkStats,
  buildOnchainCapSeries,
  type ChainNetworkStats,
  latestUpdatedAt,
  rankMostTraded,
  splitMovers,
  toOverviewItem,
} from '../model/marketOverview'
```

Also extend the types import with `RwaMarketOverview`, `RwaMarketOverviewItem`, `RwaToken`, `RwaTokenMarketData`, `RwaTokenNetworkStats`.

Constant: `const MARKET_OVERVIEW_LIST_LIMIT = 3`

Replace `getAssetNetworkStats`:

```ts
/** `chainId` must have tokens of the asset */
export async function getAssetNetworkStats(asset: RwaAsset, chainId: number): Promise<RwaNetworkStats> {
  const tokens = asset.tokens.filter((token) => token.chainId === chainId)
  const { byTicker, degraded } = await loadMarketData()
  const stats = await loadNetworkStats(chainId, tokens, byTicker.get(asset.ticker)?.tokens ?? {})

  if (stats) return { ticker: asset.ticker, chainId, tokens: stats, degraded }

  const empty = tokens.map(({ address }) => ({ address, onchainCap: null, dexVolume24h: null }))

  return { ticker: asset.ticker, chainId, tokens: empty, degraded: true }
}
```

Add the exported function (keep exports alphabetical: after `getAssetQuotes`, before `listAssets`):

```ts
export async function getMarketOverview(): Promise<RwaMarketOverview> {
  const assets = getAssets()
  const { byTicker: marketByTicker, degraded: marketDegraded } = await loadMarketData()
  const tokenMarkets: Record<string, RwaTokenMarketData> = Object.fromEntries(
    [...marketByTicker.values()].flatMap((market) => Object.entries(market.tokens)),
  )
  const tokensByChain = groupByChain(assets.flatMap((asset) => asset.tokens))
  const statsResults = await Promise.all(
    [...tokensByChain].map(async ([chainId, tokens]): Promise<ChainNetworkStats | null> => {
      const stats = await loadNetworkStats(chainId, tokens, tokenMarkets)

      return stats ? { chainId, tokens: stats } : null
    }),
  )
  const stats = statsResults.filter((result): result is ChainNetworkStats => result !== null)
  const statsComplete = stats.length === statsResults.length
  const aggregate = aggregateNetworkStats(assets, stats, marketByTicker)
  const items = assets.map((asset) =>
    toOverviewItem(asset, marketByTicker.get(asset.ticker), aggregate.byTicker.get(asset.ticker)),
  )
  const { gainers, losers } = splitMovers(items, MARKET_OVERVIEW_LIST_LIMIT)
  const mostTraded = statsComplete ? rankMostTraded(items, MARKET_OVERVIEW_LIST_LIMIT) : []
  const loadPriceChart = (asset: RwaAsset): Promise<RwaChartPoint[]> => marketDataProvider.getChart(asset, '1D')

  const [mostTradedWithSeries, gainersWithSeries, losersWithSeries, onchainCapSeries] = await Promise.all([
    withSeries(mostTraded, (asset) => marketDataProvider.getHourlyDexVolume(asset.tokens)),
    withSeries(gainers, loadPriceChart),
    withSeries(losers, loadPriceChart),
    statsComplete ? loadOnchainCapSeries(aggregate.supplyByCoin) : null,
  ])

  return {
    totals: {
      onchainCap: statsComplete ? aggregate.onchainCap : null,
      dexVolume24h: statsComplete ? aggregate.dexVolume24h : null,
      onchainCapSeries,
    },
    mostTraded: mostTradedWithSeries,
    gainers: gainersWithSeries,
    losers: losersWithSeries,
    updatedAt: latestUpdatedAt([...marketByTicker.values()]),
    tradingTime: assets.find((asset) => asset.allowedTradingTime)?.allowedTradingTime ?? null,
    degraded: marketDegraded || !statsComplete,
  }
}
```

Add the private helpers at the bottom (alphabetical with the existing `loadMarketData` / `withMarketData`):

```ts
function groupByChain(tokens: RwaToken[]): Map<number, RwaToken[]> {
  const byChain = new Map<number, RwaToken[]>()

  for (const token of tokens) byChain.set(token.chainId, [...(byChain.get(token.chainId) ?? []), token])

  return byChain
}

async function loadNetworkStats(
  chainId: number,
  tokens: RwaToken[],
  tokenMarkets: Record<string, RwaTokenMarketData>,
): Promise<RwaTokenNetworkStats[] | null> {
  try {
    return await marketDataProvider.getNetworkStats(chainId, tokens, tokenMarkets)
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load network stats', error)

    return null
  }
}

async function loadOnchainCapSeries(supplyByCoin: Map<string, number>): Promise<RwaChartPoint[] | null> {
  try {
    const histories = await marketDataProvider.getPriceHistory([...supplyByCoin.keys()], '7')

    return buildOnchainCapSeries(supplyByCoin, histories)
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load the onchain cap history', error)

    return null
  }
}

async function loadSeries(
  ticker: string,
  load: (asset: RwaAsset) => Promise<RwaChartPoint[] | null>,
): Promise<RwaChartPoint[] | null> {
  const asset = getAssetByTicker(ticker)

  if (!asset) return null

  try {
    const series = await load(asset)

    return series?.length ? series : null
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error(`[rwa] Failed to load the ${ticker} overview series`, error)

    return null
  }
}

async function withSeries(
  items: RwaMarketOverviewItem[],
  load: (asset: RwaAsset) => Promise<RwaChartPoint[] | null>,
): Promise<RwaMarketOverviewItem[]> {
  return Promise.all(items.map(async (item) => ({ ...item, series: await loadSeries(item.ticker, load) })))
}
```

In `index.server.ts`, add `getMarketOverview` to the `./api/assetsService` export list (alphabetical, after `getAssetQuotes`).

- [ ] **Step 4: Add the route**

Create `src/_app/api-routes/marketOverview.ts`:

```ts
import { getMarketOverview } from '@/entities/asset/index.server'
import { jsonResponse } from '@/shared/lib/http'

const MARKET_OVERVIEW_MAX_AGE_SECONDS = 60

/** Registry-wide totals, most traded assets and top movers */
export async function getMarketOverviewHandler(): Promise<Response> {
  return jsonResponse(await getMarketOverview(), MARKET_OVERVIEW_MAX_AGE_SECONDS)
}
```

In `src/_app/api-routes/index.ts`, add `export { getMarketOverviewHandler } from './marketOverview'` after the `chart` line.

Create `app/api/v1/market-overview/route.ts`:

```ts
export { getMarketOverviewHandler as GET } from '@/_app/api-routes'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpx nx run rwa-frontend:test --testFile=assetsService.test.ts`
Expected: PASS (existing and new)

Run: `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit`
Expected: no errors

- [ ] **Step 6: Smoke test the route**

Run `pnpm start:rwa` in the background, then: `curl -s localhost:3000/api/v1/market-overview | head -c 600` and `curl -sI localhost:3000/api/v1/market-overview | grep -i cache-control`. Check the port the dev server prints.
Expected: JSON with `totals`, `mostTraded`, `gainers`, `losers`, `tradingTime`. `Cache-Control` is `public, s-maxage=60, stale-while-revalidate=300`, or `no-store` when degraded. Without Pro, every `mostTraded[].series` is `null`. Stop the server afterwards.

---

### Task 4: Client query, `TokenLogo` move and pure UI helpers

**Files:**
- Modify: `apps/rwa-frontend/src/entities/asset/api/assetsApi.ts`, `assetsQueries.ts`, `index.ts`
- Move: `apps/rwa-frontend/src/_pages/asset/ui/TokenLogo.tsx` → `apps/rwa-frontend/src/shared/ui/token-logo/TokenLogo.tsx`; `TokenLogo.module.css` likewise
- Create: `apps/rwa-frontend/src/shared/ui/token-logo/index.ts`
- Modify: `apps/rwa-frontend/src/_pages/asset/ui/StockTokens.tsx`, `TradeTokenSelector.tsx` (imports)
- Create: `apps/rwa-frontend/src/_pages/home/model/marketOverviewQueryAtom.ts`, `topMoversTabAtom.ts`
- Create: `apps/rwa-frontend/src/_pages/home/lib/usMarketStatus.ts`, `formatRefTime.ts`, `sparklinePoints.ts`
- Test: `apps/rwa-frontend/src/_pages/home/lib/usMarketStatus.test.ts`, `formatRefTime.test.ts`, `sparklinePoints.test.ts`

**Interfaces:**
- Consumes: `RwaMarketOverview`, `RwaChartPoint`, `RwaTradingTime` (Task 1, via `@/entities/asset`)
- Produces:
  - `marketOverviewQueryOptions(): RwaQueryOptions<RwaMarketOverview>`, exported from `@/entities/asset`
  - `TokenLogo` from `@/shared/ui/token-logo` (same props as before)
  - `marketOverviewQueryAtom`, `topMoversTabAtom: PrimitiveAtom<TopMoversTab>`, `type TopMoversTab = 'gainers' | 'losers'`
  - `isUsMarketOpen(tradingTime: RwaTradingTime, now: Date): boolean`
  - `formatRefTime(updatedAt: string, timeZone: string): string | null`
  - `toSparklinePoints(series: RwaChartPoint[], width: number, height: number): string | null`

- [ ] **Step 1: Write the failing helper tests**

`_pages/home/lib/usMarketStatus.test.ts` (2026-10-01 is a Thursday, 2026-10-03 a Saturday):

```ts
import { isUsMarketOpen } from './usMarketStatus'

const US_HOURS = { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' }

describe('isUsMarketOpen', () => {
  it.each([
    ['2026-10-01T14:00:00Z', true],
    ['2026-10-01T13:30:00Z', true],
    ['2026-10-01T13:29:59Z', false],
    ['2026-10-01T19:59:00Z', true],
    ['2026-10-01T20:00:00Z', false],
    ['2026-10-03T15:00:00Z', false],
  ])('%s → %s', (now, expected) => {
    expect(isUsMarketOpen(US_HOURS, new Date(now))).toBe(expected)
  })

  it('is closed for an unparsable trading time', () => {
    expect(isUsMarketOpen({ ...US_HOURS, start: '9am' }, new Date('2026-10-01T14:00:00Z'))).toBe(false)
  })
})
```

`_pages/home/lib/formatRefTime.test.ts`:

```ts
import { formatRefTime } from './formatRefTime'

describe('formatRefTime', () => {
  it.each([
    ['Europe/Lisbon', '15:00 Lisbon'],
    ['America/New_York', '10:00 New York'],
    ['UTC', '14:00 UTC'],
  ])('formats in %s', (timeZone, expected) => {
    expect(formatRefTime('2026-10-01T14:00:00.000Z', timeZone)).toBe(expected)
  })

  it('returns null for an invalid date', () => {
    expect(formatRefTime('not a date', 'UTC')).toBeNull()
  })
})
```

`_pages/home/lib/sparklinePoints.test.ts`:

```ts
import { toSparklinePoints } from './sparklinePoints'

describe('toSparklinePoints', () => {
  it('scales the series to the box with y growing downwards', () => {
    expect(
      toSparklinePoints(
        [
          { time: 0, value: 1 },
          { time: 1, value: 3 },
          { time: 2, value: 2 },
        ],
        100,
        20,
      ),
    ).toBe('0,20 50,0 100,10')
  })

  it('draws a flat series in the middle', () => {
    expect(
      toSparklinePoints(
        [
          { time: 0, value: 5 },
          { time: 1, value: 5 },
        ],
        100,
        20,
      ),
    ).toBe('0,10 100,10')
  })

  it('returns null with less than two points', () => {
    expect(toSparklinePoints([{ time: 0, value: 1 }], 100, 20)).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpx nx run rwa-frontend:test --testFile=_pages/home/lib`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the helpers**

`_pages/home/lib/usMarketStatus.ts`:

```ts
import type { RwaTradingTime } from '@/entities/asset'

const MINUTES_PER_HOUR = 60
const SUNDAY = 0
const SATURDAY = 6

/** Weekdays within `tradingTime`, market holidays are not taken into account */
export function isUsMarketOpen(tradingTime: RwaTradingTime, now: Date): boolean {
  const day = now.getUTCDay()

  if (day === SUNDAY || day === SATURDAY) return false

  const start = parseUtcMinutes(tradingTime.start)
  const end = parseUtcMinutes(tradingTime.end)

  if (start === null || end === null) return false

  const minutes = now.getUTCHours() * MINUTES_PER_HOUR + now.getUTCMinutes()

  return minutes >= start && minutes < end
}

/** `HH:mm UTC` to minutes since midnight */
function parseUtcMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2}) UTC$/.exec(time)

  if (!match) return null

  return Number(match[1]) * MINUTES_PER_HOUR + Number(match[2])
}
```

`_pages/home/lib/formatRefTime.ts`:

```ts
/** `HH:mm` in `timeZone` followed by its city, e.g. `15:00 Lisbon` */
export function formatRefTime(updatedAt: string, timeZone: string): string | null {
  const date = new Date(updatedAt)

  if (Number.isNaN(date.getTime())) return null

  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).format(
    date,
  )
  const city = (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ')

  return `${time} ${city}`
}
```

`_pages/home/lib/sparklinePoints.ts`:

```ts
import type { RwaChartPoint } from '@/entities/asset'

/** SVG polyline `points` filling `width` × `height`, `null` with less than two points */
export function toSparklinePoints(series: RwaChartPoint[], width: number, height: number): string | null {
  if (series.length < 2) return null

  const times = series.map(({ time }) => time)
  const values = series.map(({ value }) => value)
  const minTime = Math.min(...times)
  const minValue = Math.min(...values)
  const timeSpan = Math.max(...times) - minTime || 1
  const valueSpan = Math.max(...values) - minValue

  return series
    .map(({ time, value }) => {
      const x = ((time - minTime) / timeSpan) * width
      const y = valueSpan ? height - ((value - minValue) / valueSpan) * height : height / 2

      return `${round(x)},${round(y)}`
    })
    .join(' ')
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
```

- [ ] **Step 4: Run helper tests to verify they pass**

Run: `pnpx nx run rwa-frontend:test --testFile=_pages/home/lib`
Expected: PASS

- [ ] **Step 5: Query options and atoms**

`assetsApi.ts`, add (alphabetical, after `getChartUrl`):

```ts
export function getMarketOverviewUrl(): string {
  return `${RWA_API_PREFIX}market-overview`
}
```

`assetsQueries.ts`: import `getMarketOverviewUrl` and `RwaMarketOverview`, then add after `assetsSearchQueryOptions`:

```ts
/** `/api/v1/market-overview` caches the overview for the same interval */
export function marketOverviewQueryOptions(): RwaQueryOptions<RwaMarketOverview> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'market-overview'],
    queryFn: () => rwaFetcher<RwaMarketOverview>(getMarketOverviewUrl()),
    placeholderData: keepPreviousData,
    refetchInterval: MARKET_REFRESH_INTERVAL_MS,
  }
}
```

`entities/asset/index.ts`: add `marketOverviewQueryOptions` to the `./api/assetsQueries` export, and add `type RwaMarketOverview`, `type RwaMarketOverviewItem`, `type RwaMarketOverviewTotals` to the types export (alphabetical, after `RwaMarketData`).

`_pages/home/model/marketOverviewQueryAtom.ts`:

```ts
import { atomWithQuery } from 'jotai-tanstack-query'

import { marketOverviewQueryOptions } from '@/entities/asset'

export const marketOverviewQueryAtom = atomWithQuery(() => marketOverviewQueryOptions())
```

`_pages/home/model/topMoversTabAtom.ts`:

```ts
import { atom } from 'jotai'

export type TopMoversTab = 'gainers' | 'losers'

export const topMoversTabAtom = atom<TopMoversTab>('gainers')
```

- [ ] **Step 6: Move `TokenLogo`**

```bash
mkdir -p apps/rwa-frontend/src/shared/ui/token-logo
git mv apps/rwa-frontend/src/_pages/asset/ui/TokenLogo.tsx apps/rwa-frontend/src/shared/ui/token-logo/TokenLogo.tsx
git mv apps/rwa-frontend/src/_pages/asset/ui/TokenLogo.module.css apps/rwa-frontend/src/shared/ui/token-logo/TokenLogo.module.css
```

Create `shared/ui/token-logo/index.ts`:

```ts
export { TokenLogo } from './TokenLogo'
```

The file content stays unchanged: it already imports `@/shared/lib/chain` and `@/shared/lib/theme`. In `StockTokens.tsx` and `TradeTokenSelector.tsx`, delete `import { TokenLogo } from './TokenLogo'` and add `import { TokenLogo } from '@/shared/ui/token-logo'` at the end of the `@/` import group. In `StockTokens.tsx`, that is after `@/shared/ui/status-message`. Let the lint import-order rule confirm the placement. Do not use `--fix`.

- [ ] **Step 7: Verify**

Run: `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit`
Expected: no errors

Run: `pnpx nx run rwa-frontend:lint`
Expected: PASS. steiger may flag `topMoversTabAtom`/`marketOverviewQueryAtom` as unused until Task 5. If it does, continue and re-check in Task 5.

---

### Task 5: Home UI (hero, cards, sparkline) and `HomePage`

**Files:**
- Create: `apps/rwa-frontend/public/issuers/ondo.svg`, `apps/rwa-frontend/public/issuers/xstocks.svg`
- Create: `apps/rwa-frontend/src/_pages/home/ui/HomeHero.tsx`, `HomeHero.module.css`
- Create: `apps/rwa-frontend/src/_pages/home/ui/Sparkline.tsx`
- Create: `apps/rwa-frontend/src/_pages/home/ui/OverviewAssetRows.tsx`
- Create: `apps/rwa-frontend/src/_pages/home/ui/MarketTotalsCard.tsx`, `MostTradedCard.tsx`, `TopMoversCard.tsx`
- Create: `apps/rwa-frontend/src/_pages/home/ui/MarketOverview.tsx`, `MarketOverview.module.css`
- Modify: `apps/rwa-frontend/src/_pages/home/ui/HomePage.tsx`
- Test: `apps/rwa-frontend/src/_pages/home/ui/HomePage.test.tsx`

**Interfaces:**
- Consumes: everything from Task 4, `formatCompactUsd` / `formatPercent` (`@/shared/lib/format`), `StatusMessage`, `TokenLogo`
- Produces: `HomePage` (unchanged export) rendering `HomeHero`, `MarketOverview`, `AssetsExplorer`

- [ ] **Step 1: Write the failing tests**

Replace `HomePage.test.tsx`:

```tsx
import { QueryClient } from '@tanstack/query-core'
import { fireEvent, render, screen } from '@testing-library/react'

import { createStore, Provider } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'

import { HomePage } from './HomePage'

import type { RwaMarketOverview, RwaMarketOverviewItem } from '@/entities/asset'

const NVDA: RwaMarketOverviewItem = {
  ticker: 'NVDA',
  title: 'NVIDIA',
  logoUrl: null,
  change24h: 0.8,
  dexVolume24h: 12_400_000,
  series: [
    { time: 0, value: 1 },
    { time: 1, value: 2 },
  ],
}

const OVERVIEW: RwaMarketOverview = {
  totals: {
    onchainCap: 526_000_000,
    dexVolume24h: 29_000_000,
    onchainCapSeries: [
      { time: 0, value: 1 },
      { time: 1, value: 2 },
    ],
  },
  mostTraded: [{ ...NVDA, series: null }],
  gainers: [NVDA],
  losers: [],
  updatedAt: '2026-10-01T14:00:00.000Z',
  tradingTime: { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' },
  degraded: false,
}

function mockApi(overview: RwaMarketOverview | null): void {
  global.fetch = jest.fn((url: string) =>
    Promise.resolve(
      url.endsWith('/market-overview') && overview
        ? { ok: true, status: 200, json: () => Promise.resolve(overview) }
        : { ok: false, status: 500, json: () => Promise.resolve({ error: 'Upstream failed' }) },
    ),
  ) as unknown as typeof fetch
}

function renderHomePage(): void {
  const store = createStore()
  store.set(queryClientAtom, new QueryClient({ defaultOptions: { queries: { retry: false } } }))

  render(
    <Provider store={store}>
      <HomePage />
    </Provider>,
  )
}

describe('HomePage', () => {
  beforeAll(() => {
    // jsdom has no matchMedia, `TokenLogo` reads the color scheme through it
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }),
    })
  })

  it('renders the heading and the search', () => {
    mockApi(OVERVIEW)
    renderHomePage()

    expect(screen.getByRole('heading', { level: 1, name: 'Explore tokenized real-world assets' })).toBeTruthy()
    expect(screen.getByRole('searchbox', { name: 'Search assets' })).toBeTruthy()
  })

  it('renders the cards from the overview', async () => {
    mockApi(OVERVIEW)
    renderHomePage()

    expect(await screen.findByText('$526M')).toBeTruthy()
    expect(screen.getByText('$29M')).toBeTruthy()
    expect(screen.getByText('$12.4M')).toBeTruthy()
    expect(screen.getByText('+0.80%')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /NVIDIA/ })[0]?.getAttribute('href')).toBe('/asset/NVDA')
  })

  it('renders rows without sparklines when series is null', async () => {
    mockApi(OVERVIEW)
    renderHomePage()

    const mostTraded = await screen.findByRole('region', { name: 'Most traded' })

    expect(mostTraded.querySelector('svg')).toBeNull()
    expect(mostTraded.textContent).toContain('NVIDIA')
  })

  it('shows the empty text for an empty list', async () => {
    mockApi(OVERVIEW)
    renderHomePage()

    fireEvent.click(await screen.findByRole('button', { name: 'Losers' }))

    expect(screen.getByText('No losers in the last 24 hours')).toBeTruthy()
  })

  it('shows dashes for null totals', async () => {
    mockApi({ ...OVERVIEW, totals: { onchainCap: null, dexVolume24h: null, onchainCapSeries: null }, degraded: true })
    renderHomePage()

    const totals = await screen.findByRole('region', { name: 'Market overview' })

    expect(await screen.findAllByText('—')).toHaveLength(2)
    expect(totals.querySelector('svg')).toBeNull()
  })

  it('shows an error when the overview fails', async () => {
    mockApi(null)
    renderHomePage()

    expect(await screen.findByText(/Failed to load the market overview/)).toBeTruthy()
  })
})
```

The cards are `<section aria-labelledby>` elements so `getByRole('region', { name })` finds them. In `shows dashes for null totals`, scope the `—` query with `within(totals)` if the assets table also renders dashes. Import `within` from `@testing-library/react` in that case.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpx nx run rwa-frontend:test --testFile=HomePage.test.tsx`
Expected: FAIL, the heading is still "Tokenized stocks".

- [ ] **Step 3: Issuer logos**

Load the `figma-design-to-code` guidance, as the Figma MCP requires before `get_design_context`. Then call `get_design_context` with `fileKey: Y8OXmctyXUjT5rHbE6orMb` and `nodeId: 3505:9018`. Download the Ondo and xStocks logo assets from the subtitle into `apps/rwa-frontend/public/issuers/ondo.svg` and `xstocks.svg`. If the export is a PNG, save it as `.png` and use that extension in `HomeHero.tsx`. If the logos cannot be downloaded, drop the `<Image>` from `Issuer` and render the names only, then report it.

- [ ] **Step 4: Hero**

`HomeHero.tsx`:

```tsx
import type { ReactNode } from 'react'

import Image from 'next/image'

import styles from './HomeHero.module.css'

const ISSUER_LOGO_SIZE = 18

export function HomeHero(): ReactNode {
  return (
    <header className={styles.hero}>
      <h1 className={styles.heading}>Explore tokenized real-world assets</h1>
      <p className={styles.subtitle}>
        Trade tokenized stocks and ETFs from <Issuer name="Ondo" logo="/issuers/ondo.svg" />,{' '}
        <Issuer name="xStocks" logo="/issuers/xstocks.svg" /> and other issuers across chains, powered by CoW Protocol.
      </p>
    </header>
  )
}

function Issuer({ name, logo }: { name: string; logo: string }): ReactNode {
  return (
    <span className={styles.issuer}>
      <Image src={logo} alt="" width={ISSUER_LOGO_SIZE} height={ISSUER_LOGO_SIZE} unoptimized />
      {name}
    </span>
  )
}
```

`HomeHero.module.css`:

```css
.hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.heading {
  margin: 0;
  font-size: 36px;
  line-height: 1.2;
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 17px;
}

.issuer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text);
  vertical-align: bottom;
}
```

- [ ] **Step 5: Sparkline and shared rows**

`Sparkline.tsx`:

```tsx
import type { ReactNode } from 'react'

import styles from './MarketOverview.module.css'

import { toSparklinePoints } from '../lib/sparklinePoints'

import type { RwaChartPoint } from '@/entities/asset'

const VIEWBOX_WIDTH = 100
const VIEWBOX_HEIGHT = 32

export type SparklineTone = 'positive' | 'negative' | 'neutral'

interface SparklineProps {
  series: RwaChartPoint[] | null
  tone: SparklineTone
  /** Fills the area under the line */
  area?: boolean
  className?: string
}

export function Sparkline({ series, tone, area = false, className }: SparklineProps): ReactNode {
  const points = series ? toSparklinePoints(series, VIEWBOX_WIDTH, VIEWBOX_HEIGHT) : null

  if (!points) return null

  return (
    <svg
      className={[styles.sparkline, styles[tone], className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {area && (
        <polygon className={styles.sparklineArea} points={`0,${VIEWBOX_HEIGHT} ${points} ${VIEWBOX_WIDTH},${VIEWBOX_HEIGHT}`} />
      )}
      <polyline className={styles.sparklineLine} points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
```

`OverviewAssetRows.tsx`:

```tsx
import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './MarketOverview.module.css'
import { Sparkline, type SparklineTone } from './Sparkline'

import type { RwaMarketOverviewItem } from '@/entities/asset'
import { TokenLogo } from '@/shared/ui/token-logo'

const SKELETON_ROWS = 3

interface OverviewAssetRowsProps {
  /** `undefined` while loading */
  items: RwaMarketOverviewItem[] | undefined
  emptyText: string
  tone: SparklineTone
  valueClassName?: string
  renderValue(item: RwaMarketOverviewItem): ReactNode
}

export function OverviewAssetRows({ items, emptyText, tone, valueClassName, renderValue }: OverviewAssetRowsProps): ReactNode {
  if (!items) {
    return (
      <ul className={styles.rows} aria-busy="true">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className={styles.row}>
            <span className={`${styles.skeleton} ${styles.skeletonLogo}`} />
            <span className={`${styles.skeleton} ${styles.skeletonText}`} />
          </li>
        ))}
      </ul>
    )
  }

  if (!items.length) return <p className={styles.empty}>{emptyText}</p>

  return (
    <ul className={styles.rows}>
      {items.map((item) => (
        <li key={item.ticker}>
          <Link className={styles.row} href={`/asset/${item.ticker}`}>
            <TokenLogo symbol={item.ticker} logoUrl={item.logoUrl} />
            <span className={styles.asset}>
              <span className={styles.assetTitle}>{item.title}</span>
              <span className={styles.assetTicker}>{item.ticker}</span>
            </span>
            <span className={[styles.rowValue, valueClassName].filter(Boolean).join(' ')}>{renderValue(item)}</span>
            <span className={styles.rowSparkline}>
              <Sparkline series={item.series} tone={tone} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 6: Cards**

`MarketTotalsCard.tsx`:

```tsx
'use client'

import type { ReactNode } from 'react'

import styles from './MarketOverview.module.css'
import { Sparkline } from './Sparkline'

import { formatRefTime } from '../lib/formatRefTime'
import { isUsMarketOpen } from '../lib/usMarketStatus'

import type { RwaMarketOverview, RwaTradingTime } from '@/entities/asset'
import { formatCompactUsd } from '@/shared/lib/format'

const DEX_VOLUME_HINT = 'DEX trades of every listed token on every network over the last 24 hours'

interface MarketTotalsCardProps {
  /** `undefined` while loading */
  overview: RwaMarketOverview | undefined
}

export function MarketTotalsCard({ overview }: MarketTotalsCardProps): ReactNode {
  const refTime = overview?.updatedAt
    ? formatRefTime(overview.updatedAt, Intl.DateTimeFormat().resolvedOptions().timeZone)
    : null

  return (
    <section className={styles.card} aria-labelledby="market-totals-title">
      <header className={styles.cardHeader}>
        <h2 id="market-totals-title" className={styles.cardTitle}>
          Market overview
        </h2>
        <span className={styles.cardHint}>7D</span>
      </header>
      <div className={styles.totals}>
        <Total label="Onchain market cap" value={overview && formatCompactUsd(overview.totals.onchainCap)} />
        <Total
          label={
            <>
              24h DEX volume{' '}
              <span className={styles.info} role="img" aria-label={DEX_VOLUME_HINT} title={DEX_VOLUME_HINT}>
                ⓘ
              </span>
            </>
          }
          value={overview && formatCompactUsd(overview.totals.dexVolume24h)}
        />
      </div>
      <div className={styles.capChart}>
        {overview ? (
          <Sparkline series={overview.totals.onchainCapSeries} tone="neutral" area />
        ) : (
          <span className={`${styles.skeleton} ${styles.skeletonChart}`} />
        )}
      </div>
      <div className={styles.axis}>
        <span>7 days ago</span>
        <span>Today</span>
      </div>
      <footer className={styles.cardFooter}>
        {overview?.tradingTime && <MarketStatus tradingTime={overview.tradingTime} />}
        {refTime && <span>Ref. {refTime}</span>}
      </footer>
    </section>
  )
}

function Total({ label, value }: { label: ReactNode; value: string | undefined }): ReactNode {
  return (
    <div className={styles.total}>
      {value === undefined ? (
        <span className={`${styles.skeleton} ${styles.skeletonValue}`} />
      ) : (
        <span className={styles.totalValue}>{value}</span>
      )}
      <span className={styles.totalLabel}>{label}</span>
    </div>
  )
}

function MarketStatus({ tradingTime }: { tradingTime: RwaTradingTime }): ReactNode {
  const open = isUsMarketOpen(tradingTime, new Date())

  return (
    <span className={open ? styles.statusOpen : styles.statusClosed}>US market {open ? 'open' : 'closed'}</span>
  )
}
```

`MostTradedCard.tsx`:

```tsx
import type { ReactNode } from 'react'

import styles from './MarketOverview.module.css'
import { OverviewAssetRows } from './OverviewAssetRows'

import type { RwaMarketOverviewItem } from '@/entities/asset'
import { formatCompactUsd } from '@/shared/lib/format'

interface MostTradedCardProps {
  /** `undefined` while loading */
  items: RwaMarketOverviewItem[] | undefined
}

export function MostTradedCard({ items }: MostTradedCardProps): ReactNode {
  return (
    <section className={styles.card} aria-labelledby="most-traded-title">
      <header className={styles.cardHeader}>
        <div>
          <h2 id="most-traded-title" className={styles.cardTitle}>
            Most traded
          </h2>
          <p className={styles.cardSubtitle}>24h DEX volume · All networks</p>
        </div>
      </header>
      <OverviewAssetRows
        items={items}
        emptyText="No DEX trades in the last 24 hours"
        tone="neutral"
        renderValue={(item) => formatCompactUsd(item.dexVolume24h)}
      />
    </section>
  )
}
```

`TopMoversCard.tsx`:

```tsx
'use client'

import { useAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './MarketOverview.module.css'
import { OverviewAssetRows } from './OverviewAssetRows'

import { type TopMoversTab, topMoversTabAtom } from '../model/topMoversTabAtom'

import type { RwaMarketOverviewItem } from '@/entities/asset'
import { formatPercent } from '@/shared/lib/format'

const TABS: { value: TopMoversTab; label: string; emptyText: string }[] = [
  { value: 'gainers', label: 'Gainers', emptyText: 'No gainers in the last 24 hours' },
  { value: 'losers', label: 'Losers', emptyText: 'No losers in the last 24 hours' },
]

interface TopMoversCardProps {
  /** `undefined` while loading */
  gainers: RwaMarketOverviewItem[] | undefined
  losers: RwaMarketOverviewItem[] | undefined
}

export function TopMoversCard({ gainers, losers }: TopMoversCardProps): ReactNode {
  const [tab, setTab] = useAtom(topMoversTabAtom)
  const isGainers = tab === 'gainers'

  return (
    <section className={styles.card} aria-labelledby="top-movers-title">
      <header className={styles.cardHeader}>
        <div>
          <h2 id="top-movers-title" className={styles.cardTitle}>
            Top movers
          </h2>
          <p className={styles.cardSubtitle}>Underlying price change · 24h</p>
        </div>
        <div className={styles.segmented} role="group" aria-label="Top movers list">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={value === tab ? styles.segmentActive : undefined}
              aria-pressed={value === tab}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <OverviewAssetRows
        items={isGainers ? gainers : losers}
        emptyText={TABS.find(({ value }) => value === tab)?.emptyText ?? ''}
        tone={isGainers ? 'positive' : 'negative'}
        valueClassName={isGainers ? styles.positive : styles.negative}
        renderValue={(item) => formatPercent(item.change24h)}
      />
    </section>
  )
}
```

`MarketOverview.tsx`:

```tsx
'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import { MarketTotalsCard } from './MarketTotalsCard'
import styles from './MarketOverview.module.css'
import { MostTradedCard } from './MostTradedCard'
import { TopMoversCard } from './TopMoversCard'

import { marketOverviewQueryAtom } from '../model/marketOverviewQueryAtom'

import { StatusMessage } from '@/shared/ui/status-message'

export function MarketOverview(): ReactNode {
  const { data, error } = useAtomValue(marketOverviewQueryAtom)

  if (error && !data) return <StatusMessage>Failed to load the market overview: {error.message}</StatusMessage>

  return (
    <div className={styles.grid}>
      <MarketTotalsCard overview={data} />
      <MostTradedCard items={data?.mostTraded} />
      <TopMoversCard gainers={data?.gainers} losers={data?.losers} />
    </div>
  )
}
```

`MarketOverview.module.css`:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius) * 2);
  background: var(--color-bg);
}

.cardHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.cardTitle {
  margin: 0;
  font-size: 17px;
}

.cardSubtitle,
.cardHint,
.totalLabel,
.axis,
.cardFooter,
.assetTicker,
.empty {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.totals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.total {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.totalValue {
  font-size: 24px;
  font-weight: 600;
}

.info {
  cursor: help;
}

.capChart {
  height: 56px;
  border-bottom: 1px solid var(--color-border);
}

.capChart .sparkline {
  width: 100%;
  height: 100%;
}

.axis,
.cardFooter {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.statusOpen,
.statusClosed {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
}

.statusOpen::before,
.statusClosed::before {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  content: '';
}

.statusOpen::before {
  background: var(--color-positive);
}

.statusClosed::before {
  background: var(--color-text-secondary);
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  color: inherit;
  text-decoration: none;
}

.row:hover .assetTitle {
  text-decoration: underline;
}

.asset {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.assetTitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rowValue {
  font-variant-numeric: tabular-nums;
}

.rowSparkline {
  display: inline-flex;
  flex-shrink: 0;
  width: 56px;
  height: 24px;
}

.rowSparkline .sparkline {
  width: 100%;
  height: 100%;
}

.sparkline {
  display: block;
  overflow: visible;
}

.sparklineLine {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}

.sparklineArea {
  fill: currentColor;
  opacity: 0.15;
}

.neutral {
  color: var(--color-accent);
}

.positive {
  color: var(--color-positive);
}

.negative {
  color: var(--color-negative);
}

.segmented {
  display: flex;
  padding: 2px;
  border-radius: var(--radius);
  background: var(--color-surface);
}

.segmented button {
  padding: 2px 8px;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.segmented .segmentActive {
  background: var(--color-bg);
  color: var(--color-text);
}

.skeleton {
  display: block;
  border-radius: var(--radius);
  background: var(--color-surface);
  animation: pulse 1.2s ease-in-out infinite;
}

.skeletonValue {
  width: 96px;
  height: 30px;
}

.skeletonChart {
  width: 100%;
  height: 100%;
}

.skeletonLogo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.skeletonText {
  flex: 1;
  height: 28px;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
```

The `.positive` / `.negative` classes do double duty: the sparkline tone (`color` → `currentColor` stroke) and the change value text.

- [ ] **Step 7: `HomePage`**

```tsx
import type { ReactNode } from 'react'

import { AssetsExplorer } from './AssetsExplorer'
import { HomeHero } from './HomeHero'
import { MarketOverview } from './MarketOverview'

export function HomePage(): ReactNode {
  return (
    <>
      <HomeHero />
      <MarketOverview />
      <AssetsExplorer />
    </>
  )
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `pnpx nx run rwa-frontend:test --testFile=HomePage.test.tsx`
Expected: PASS. If `next/image` fails to render in jsdom, check the error first. The asset page components already use it in the app, but no test rendered it before. Mock `next/image` in this test file only, as a plain `<img>`, and only if needed.

- [ ] **Step 9: Full verification**

Run: `pnpx nx run rwa-frontend:lint`
Expected: PASS (includes `lint-fsd`)

Run: `pnpx nx run rwa-frontend:test`
Expected: PASS (all suites)

Run: `pnpm exec tsc -p apps/rwa-frontend/tsconfig.app.json --noEmit`
Expected: no errors

- [ ] **Step 10: Visual check**

Run `pnpm start:rwa`, then open the home page next to the Figma node `3505:9018` (desktop width 1440 and a width under 900px). Check that:
- the three cards sit in one row on desktop and stack under 900px;
- the gainers/losers toggle switches lists;
- rows link to `/asset/<TICKER>`;
- dark mode keeps the contrast readable;
- without Pro, Most traded rows have no sparklines and the columns still align.

Report anything that differs from the design. Do not commit.

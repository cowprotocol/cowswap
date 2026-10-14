import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { sumNullable } from '../lib/sumNullable'

import type {
  RwaAsset,
  RwaChartPoint,
  RwaMarketData,
  RwaMarketOverviewItem,
  RwaToken,
  RwaTokenNetworkStats,
} from './types'

const HOUR_SECONDS = 3600

export interface AssetStatsTotals {
  /** USD */
  onchainCap: number | null
  /** USD */
  dexVolume24h: number | null
}

export interface ChainNetworkStats {
  chainId: number
  tokens: RwaTokenNetworkStats[]
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

interface TokenStats {
  token: RwaToken
  stat: RwaTokenNetworkStats | undefined
}

export function aggregateNetworkStats(
  assets: RwaAsset[],
  stats: ChainNetworkStats[],
  marketByTicker: Map<string, RwaMarketData>,
): NetworkStatsAggregate {
  const byTicker = new Map<string, AssetStatsTotals>()
  const supplyByCoin = new Map<string, number>()

  for (const asset of assets) {
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
    addSupplies(supplyByCoin, tokenStats, marketByTicker.get(asset.ticker))
  }

  const totals = [...byTicker.values()]

  return {
    byTicker,
    supplyByCoin,
    onchainCap: sumNullable(totals.map(({ onchainCap }) => onchainCap)),
    dexVolume24h: sumNullable(totals.map(({ dexVolume24h }) => dexVolume24h)),
  }
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

export function latestUpdatedAt(markets: RwaMarketData[]): string | null {
  return markets.reduce<string | null>(
    (latest, { updatedAt }) =>
      updatedAt && (!latest || Date.parse(updatedAt) > Date.parse(latest)) ? updatedAt : latest,
    null,
  )
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

function addSupplies(
  supplyByCoin: Map<string, number>,
  tokenStats: TokenStats[],
  market: RwaMarketData | undefined,
): void {
  for (const { token, stat } of tokenStats) {
    const coinId = token.coingeckoId
    const supply = coinId ? getSupply(stat, market?.tokens[coinId]?.price) : null

    if (coinId && supply !== null) supplyByCoin.set(coinId, (supplyByCoin.get(coinId) ?? 0) + supply)
  }
}

function byTicker(a: RwaMarketOverviewItem, b: RwaMarketOverviewItem): number {
  return a.ticker.localeCompare(b.ticker)
}

function floorToHour(seconds: number): number {
  return Math.floor(seconds / HOUR_SECONDS) * HOUR_SECONDS
}

// `onchainCap` is supply × price, see `MarketDataProvider.getNetworkStats`
function getSupply(stat: RwaTokenNetworkStats | undefined, price: number | null | undefined): number | null {
  const onchainCap = stat?.onchainCap

  return price && onchainCap !== null && onchainCap !== undefined ? onchainCap / price : null
}

/** Latest price at or before each grid time; grid times before the first price use the first price */
function sampleAt(prices: RwaChartPoint[], grid: number[]): number[] {
  let index = 0

  return grid.map((time) => {
    while ((prices[index + 1]?.time ?? Infinity) <= time) index++

    return prices[index]?.value ?? 0
  })
}

/** Last value of every hour, ascending. `history` must be ascending */
function toHourlyPoints(history: RwaChartPoint[]): RwaChartPoint[] {
  const byHour = new Map<number, number>()

  for (const { time, value } of history) byHour.set(floorToHour(time), value)

  return [...byHour].map(([time, value]) => ({ time, value }))
}

import type { RwaAggregateMarket, RwaAsset, RwaChartPoint, RwaMarketData, RwaMarketOverviewItem } from './types'

const HOUR_SECONDS = 3600
const DAILY_SERIES_HOURS = 24

interface Movers {
  gainers: RwaMarketOverviewItem[]
  losers: RwaMarketOverviewItem[]
}

/** The last 24 hours of `sparkline7d`, ending at the hour of `updatedAt` */
export function buildDailySeries({ sparkline7d, updatedAt }: RwaAggregateMarket): RwaChartPoint[] | null {
  const updatedSeconds = updatedAt ? Date.parse(updatedAt) / 1000 : NaN

  if (!Number.isFinite(updatedSeconds)) return null

  const lastHour = floorToHour(updatedSeconds)
  const points = sparkline7d
    .slice(-(DAILY_SERIES_HOURS + 1))
    .flatMap((value, index, window) =>
      Number.isFinite(value) ? [{ time: lastHour - (window.length - 1 - index) * HOUR_SECONDS, value }] : [],
    )

  return points.length ? points : null
}

/**
 * Σ (market cap / price) × sparkline price, per hour: supply is assumed constant.
 * Every sparkline ends at the hour of the latest `updatedAt`, so assets updated around an hour boundary
 * stay aligned; sparklines differ in length and an asset counts only in the hours it covers
 */
export function buildMarketCapSeries(markets: RwaAggregateMarket[]): RwaChartPoint[] | null {
  const included = markets.flatMap(({ price, marketCap, sparkline7d, updatedAt }) => {
    const updatedSeconds = updatedAt ? Date.parse(updatedAt) / 1000 : NaN

    if (!isPositive(price) || !isPositive(marketCap) || !sparkline7d.length || !Number.isFinite(updatedSeconds)) {
      return []
    }

    return [{ supply: marketCap / price, sparkline7d, updatedSeconds }]
  })

  if (!included.length) return null

  const lastHour = floorToHour(Math.max(...included.map(({ updatedSeconds }) => updatedSeconds)))
  const values = new Map<number, number>()

  for (const { supply, sparkline7d } of included) {
    sparkline7d.forEach((point, index) => {
      if (!Number.isFinite(point)) return

      const hour = lastHour - (sparkline7d.length - 1 - index) * HOUR_SECONDS

      values.set(hour, (values.get(hour) ?? 0) + supply * point)
    })
  }

  return [...values].sort(([a], [b]) => a - b).map(([time, value]) => ({ time, value }))
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

export function latestUpdatedAt(markets: Pick<RwaMarketData, 'updatedAt'>[]): string | null {
  return markets.reduce<string | null>(
    (latest, { updatedAt }) =>
      updatedAt && (!latest || Date.parse(updatedAt) > Date.parse(latest)) ? updatedAt : latest,
    null,
  )
}

export function rankMostTraded(items: RwaMarketOverviewItem[], limit: number): RwaMarketOverviewItem[] {
  return items
    .filter(({ volume24h }) => (volume24h ?? 0) > 0)
    .sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0) || byTicker(a, b))
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

export function toOverviewItem(asset: RwaAsset, market: RwaAggregateMarket): RwaMarketOverviewItem {
  return {
    ticker: asset.ticker,
    title: asset.title,
    logoUrl: asset.logoUrl ?? null,
    change24h: market.change24h,
    volume24h: market.volume24h,
    series: null,
  }
}

function byTicker(a: RwaMarketOverviewItem, b: RwaMarketOverviewItem): number {
  return a.ticker.localeCompare(b.ticker)
}

function floorToHour(seconds: number): number {
  return Math.floor(seconds / HOUR_SECONDS) * HOUR_SECONDS
}

function isPositive(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0
}

import 'server-only'

import type { RwaAsset, RwaChartPoint, RwaChartRange, RwaMarketData } from '../model/types'

import {
  type CoingeckoChartDays,
  type CoingeckoMarket,
  fetchCoinsMarkets,
  fetchMarketChart,
} from '@/shared/api/index.server'

export interface MarketDataProvider {
  /** Missing tickers in the result mean the provider has no data for them */
  getMarketData(assets: RwaAsset[]): Promise<Map<string, RwaMarketData>>
  getChart(asset: RwaAsset, range: RwaChartRange): Promise<RwaChartPoint[]>
}

const MARKETS_REVALIDATE_SECONDS = 60

const CHART_DAYS: Record<RwaChartRange, CoingeckoChartDays> = {
  '1D': '1',
  '1W': '7',
  '1M': '30',
  '1Y': '365',
  ALL: 'max',
}

const CHART_REVALIDATE_SECONDS: Record<RwaChartRange, number> = {
  '1D': 300,
  '1W': 900,
  '1M': 3600,
  '1Y': 3600,
  ALL: 3600,
}

export const coingeckoProvider: MarketDataProvider = {
  async getMarketData(assets) {
    const idsByTicker = new Map(assets.map((asset) => [asset.ticker, getCoingeckoIds(asset)]))
    const allIds = [...new Set([...idsByTicker.values()].flat())]

    if (!allIds.length) return new Map()

    const markets = await fetchCoinsMarkets(allIds, MARKETS_REVALIDATE_SECONDS)
    const marketsById = new Map(markets.map((market) => [market.id, market]))
    const result = new Map<string, RwaMarketData>()

    idsByTicker.forEach((ids, ticker) => {
      const marketData = toMarketData(ids, marketsById)

      if (marketData) result.set(ticker, marketData)
    })

    return result
  },

  async getChart(asset, range) {
    const [primaryId] = getCoingeckoIds(asset)

    if (!primaryId) return []

    const chart = await fetchMarketChart(primaryId, CHART_DAYS[range], CHART_REVALIDATE_SECONDS[range])

    return toChartPoints(chart.prices)
  },
}

export function toChartPoints(prices: [number, number][]): RwaChartPoint[] {
  const points: RwaChartPoint[] = []

  for (const [timestampMs, value] of prices) {
    const time = Math.floor(timestampMs / 1000)
    const last = points[points.length - 1]

    // lightweight-charts requires strictly ascending time
    if (last && last.time >= time) {
      last.value = value
      continue
    }

    points.push({ time, value })
  }

  return points
}

function getCoingeckoIds(asset: RwaAsset): string[] {
  const ids = asset.tokens.flatMap((token) => (token.coingeckoId ? [token.coingeckoId] : []))

  return [...new Set(ids)]
}

function sumNullable(values: (number | null)[]): number | null {
  const defined = values.filter((value): value is number => value !== null)

  return defined.length ? defined.reduce((acc, value) => acc + value, 0) : null
}

function toMarketData(ids: string[], marketsById: Map<string, CoingeckoMarket>): RwaMarketData | null {
  const markets = ids.flatMap((id) => marketsById.get(id) ?? [])

  if (!markets.length) return null

  // The first token with a coingeckoId in RWAs.json is the reference one for price and chart, even when it has no data
  const [primaryId] = ids
  const primary = primaryId ? marketsById.get(primaryId) : undefined

  return { ...toPriceData(primary), marketCap: sumNullable(markets.map((market) => market.market_cap)) }
}

function toPriceData(market: CoingeckoMarket | undefined): Omit<RwaMarketData, 'marketCap'> {
  if (!market) return { price: null, change24h: null, dayLow: null, dayHigh: null, updatedAt: null }

  return {
    price: market.current_price,
    change24h: market.price_change_percentage_24h,
    dayLow: market.low_24h,
    dayHigh: market.high_24h,
    updatedAt: market.last_updated,
  }
}

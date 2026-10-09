import 'server-only'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { unstable_cache } from 'next/cache'

import { fillHourlySeries } from '../model/marketOverview'

import type {
  RwaAggregateMarket,
  RwaAsset,
  RwaChartPoint,
  RwaChartRange,
  RwaToken,
  RwaTokenMarketData,
  RwaTokenNetworkStats,
} from '../model/types'

import {
  type CoingeckoChartDays,
  type CoingeckoMarket,
  type CoingeckoOhlcvCandle,
  type CoingeckoRwaMarket,
  fetchCoinsMarkets,
  fetchMarketChart,
  fetchOnchainTokenOhlcv,
  fetchOnchainTokens,
  fetchRwaMarkets,
} from '@/shared/api/index.server'

export interface MarketDataProvider {
  getChart(asset: RwaAsset, range: RwaChartRange): Promise<RwaChartPoint[]>
  /** `tokens` are on `chainId`, `tokenMarkets` (keyed by `coingeckoId`) gives their prices */
  getNetworkStats(
    chainId: number,
    tokens: RwaToken[],
    tokenMarkets: Record<string, RwaTokenMarketData>,
  ): Promise<RwaTokenNetworkStats[]>
  /** USD per hour over the last 24h summed over `tokens`, `null` when the provider has no candles for any of them */
  getHourlyDexVolume(tokens: RwaToken[]): Promise<RwaChartPoint[] | null>
  /** Keyed by RWA id (`RwaAsset.coingeckoId`). `expectedCount` sizes the concurrent page requests */
  getRwaMarkets(expectedCount: number): Promise<Map<string, RwaAggregateMarket>>
  /** Keyed by `RwaToken.coingeckoId`. Coins without data are missing */
  getTokenMarkets(tokens: RwaToken[]): Promise<Record<string, RwaTokenMarketData>>
}

const MARKETS_REVALIDATE_SECONDS = 60
const ONCHAIN_REVALIDATE_SECONDS = 60
const OHLCV_REVALIDATE_SECONDS = 300
const DEX_VOLUME_HOURS = 24
const RWA_MARKETS_REVALIDATE_SECONDS = 60
/** Bump when `RwaAggregateMarket` changes shape: the data cache outlives deployments */
const RWA_MARKETS_CACHE_KEY = ['coingecko-rwa-markets', 'v2']

const EMPTY_TOKENIZED_MARKET_DATA: NonNullable<CoingeckoRwaMarket['tokenized_market_data']> = {
  current_price: null,
  market_cap: null,
  total_volume: null,
  high_24h: null,
  low_24h: null,
  price_change_percentage_24h: null,
  last_updated: null,
}

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
  async getChart(asset, range) {
    const [primaryId] = getCoingeckoIds(asset)

    if (!primaryId) return []

    const chart = await fetchMarketChart(primaryId, CHART_DAYS[range], CHART_REVALIDATE_SECONDS[range])

    return toChartPoints(chart.prices)
  },

  async getNetworkStats(chainId, tokens, tokenMarkets) {
    const onchainTokens = await fetchOnchainTokens(
      chainId,
      tokens.map((token) => token.address),
      ONCHAIN_REVALIDATE_SECONDS,
    )
    const byAddress = new Map(
      (onchainTokens ?? []).map(({ attributes }) => [getAddressKey(attributes.address), attributes]),
    )

    return tokens.map((token) => {
      const attributes = byAddress.get(getAddressKey(token.address))
      const price = token.coingeckoId ? (tokenMarkets[token.coingeckoId]?.price ?? null) : null
      const supply = toFiniteNumber(attributes?.normalized_total_supply)

      return {
        address: token.address,
        onchainCap: supply !== null && price !== null ? supply * price : null,
        dexVolume24h: toFiniteNumber(attributes?.volume_usd.h24),
      }
    })
  },

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

  async getRwaMarkets(expectedCount) {
    return new Map(await loadRwaMarketsSnapshot(expectedCount))
  },

  async getTokenMarkets(tokens) {
    const ids = [...new Set(tokens.flatMap((token) => (token.coingeckoId ? [token.coingeckoId] : [])))]

    if (!ids.length) return {}

    const markets = await fetchCoinsMarkets(ids, MARKETS_REVALIDATE_SECONDS)

    return Object.fromEntries(markets.map((market) => [market.id, toTokenMarketData(market)]))
  },
}

const loadRwaMarketsSnapshot = unstable_cache(
  async (expectedCount: number): Promise<[string, RwaAggregateMarket][]> => {
    const markets = await fetchRwaMarkets(expectedCount)

    return markets.map((market) => [market.id, toAggregateMarket(market)])
  },
  RWA_MARKETS_CACHE_KEY,
  { revalidate: RWA_MARKETS_REVALIDATE_SECONDS },
)

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

function orNull<T>(value: T | null | undefined): T | null {
  return value ?? null
}

function toAggregateMarket({ tokenized_market_data }: CoingeckoRwaMarket): RwaAggregateMarket {
  const data = tokenized_market_data ?? EMPTY_TOKENIZED_MARKET_DATA

  return {
    price: orNull(data.current_price),
    change24h: orNull(data.price_change_percentage_24h),
    dayLow: orNull(data.low_24h),
    dayHigh: orNull(data.high_24h),
    marketCap: orNull(data.market_cap),
    volume24h: orNull(data.total_volume),
    updatedAt: orNull(data.last_updated),
    sparkline7d: data.sparkline_in_7d?.price ?? [],
  }
}

function toFiniteNumber(value: string | null | undefined): number | null {
  const number = Number(value ?? undefined)

  return Number.isFinite(number) ? number : null
}

function toTokenMarketData(market: CoingeckoMarket): RwaTokenMarketData {
  return {
    price: market.current_price,
    marketCap: market.market_cap,
    volume24h: market.total_volume,
    logoUrl: market.image,
  }
}

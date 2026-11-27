import 'server-only'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { unstable_cache } from 'next/cache'

import { fillHourlySeries } from '../model/marketOverview'
import { getAllAssets } from '../model/registry'

import type {
  RwaAggregateMarket,
  RwaCandle,
  RwaChartPoint,
  RwaChartRange,
  RwaToken,
  RwaTokenMarketData,
  RwaTokenNetworkStats,
} from '../model/types'

import {
  type CoingeckoChartDays,
  type CoingeckoMarket,
  type CoingeckoOhlc,
  type CoingeckoOhlcvCandle,
  type CoingeckoRwaMarket,
  fetchCoinsMarkets,
  fetchMarketChart,
  fetchOhlc,
  fetchOnchainTokenOhlcv,
  fetchOnchainTokens,
  fetchRwaMarketChart,
  fetchRwaMarkets,
  withRetryBackoff,
} from '@/shared/api/index.server'

export interface MarketDataProvider {
  /** `coingeckoId` is a `RwaToken.coingeckoId`, empty when the coin has no prices in `range` */
  getChart(coingeckoId: string, range: RwaChartRange): Promise<RwaChartPoint[]>
  /** `coingeckoId` is a `RwaToken.coingeckoId`, empty when the coin has no prices in `range` */
  getCandles(coingeckoId: string, range: RwaChartRange): Promise<RwaCandle[]>
  /** Per share over every issuer of the RWA `rwaId` (`RwaAsset.coingeckoId`), `null` when the provider has none */
  getRwaChart(rwaId: string, range: RwaChartRange): Promise<RwaChartPoint[] | null>
  /** Built from `getRwaChart`, which has no candle endpoint */
  getRwaCandles(rwaId: string, range: RwaChartRange): Promise<RwaCandle[] | null>
  /** `tokens` are on `chainId` */
  getNetworkStats(chainId: number, tokens: RwaToken[]): Promise<RwaTokenNetworkStats[]>
  /** USD per hour over the last 24h summed over `tokens`, `null` when the provider has no candles for any of them */
  getHourlyDexVolume(tokens: RwaToken[]): Promise<RwaChartPoint[] | null>
  /** Keyed by RWA id (`RwaAsset.coingeckoId`). `expectedCount` sizes the concurrent page requests */
  getRwaMarkets(expectedCount: number): Promise<Map<string, RwaAggregateMarket>>
  /** Keyed by `RwaToken.coingeckoId`. Coins without data are missing */
  getTokenMarkets(tokens: RwaToken[]): Promise<Record<string, RwaTokenMarketData>>
}

const MARKETS_REVALIDATE_SECONDS = 60
const ONCHAIN_REVALIDATE_SECONDS = 300
const OHLCV_REVALIDATE_SECONDS = 900
const DEX_VOLUME_HOURS = 24
const RWA_MARKETS_REVALIDATE_SECONDS = 180
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

/** CoinGecko picks the `/ohlc` candle size from `days` */
const CANDLE_SECONDS: Record<RwaChartRange, number> = {
  '1D': 30 * 60,
  '1W': 4 * 60 * 60,
  '1M': 4 * 60 * 60,
  '1Y': 4 * 24 * 60 * 60,
  ALL: 4 * 24 * 60 * 60,
}

/** Also the CDN max-age of `/api/v1/chart` and `/api/v1/candles`, so the route never outlives the data cache */
export const CHART_REVALIDATE_SECONDS: Record<RwaChartRange, number> = {
  '1D': 900,
  '1W': 1800,
  '1M': 3600,
  '1Y': 3600,
  ALL: 3600,
}

export const coingeckoProvider: MarketDataProvider = {
  async getChart(coingeckoId, range) {
    const chart = await fetchMarketChart(coingeckoId, CHART_DAYS[range], CHART_REVALIDATE_SECONDS[range])

    return toChartPoints(chart.prices)
  },

  async getCandles(coingeckoId, range) {
    const ohlc = await fetchOhlc(coingeckoId, CHART_DAYS[range], CHART_REVALIDATE_SECONDS[range])

    return toCandles(ohlc, CANDLE_SECONDS[range])
  },

  getRwaChart: loadRwaChart,

  async getRwaCandles(rwaId, range) {
    const points = await loadRwaChart(rwaId, range)

    return points && toCandlesFromPoints(points, CANDLE_SECONDS[range])
  },

  async getNetworkStats(chainId, tokens) {
    const onchainTokens = await fetchOnchainTokens(
      chainId,
      tokens.map((token) => token.address),
      ONCHAIN_REVALIDATE_SECONDS,
      getRegistryAddresses(chainId),
    )
    const byAddress = new Map(
      (onchainTokens ?? []).map(({ attributes }) => [getAddressKey(attributes.address), attributes]),
    )

    return tokens.map((token) => ({
      address: token.address,
      dexVolume24h: toFiniteNumber(byAddress.get(getAddressKey(token.address))?.volume_usd.h24),
    }))
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
    const ids = getTokenCoingeckoIds(tokens)

    if (!ids.length) return {}

    const requested = new Set(ids)
    const markets = await fetchCoinsMarkets(ids, MARKETS_REVALIDATE_SECONDS, getRegistryCoingeckoIds())

    return Object.fromEntries(
      markets.filter((market) => requested.has(market.id)).map((market) => [market.id, toTokenMarketData(market)]),
    )
  },
}

const loadRwaMarketsSnapshot = unstable_cache(
  (expectedCount: number): Promise<[string, RwaAggregateMarket][]> =>
    withRetryBackoff('coingecko /rwas/markets', async () => {
      const markets = await fetchRwaMarkets(expectedCount)

      return markets.map((market): [string, RwaAggregateMarket] => [market.id, toAggregateMarket(market)])
    }),
  RWA_MARKETS_CACHE_KEY,
  { revalidate: RWA_MARKETS_REVALIDATE_SECONDS },
)

/** CoinGecko stamps a candle with its close time, TradingView with its open time */
export function toCandles(ohlc: CoingeckoOhlc[], candleSeconds: number): RwaCandle[] {
  const candles: RwaCandle[] = []

  for (const [closeTimeMs, open, high, low, close] of ohlc) {
    const time = Math.floor(closeTimeMs / 1000) - candleSeconds
    const last = candles[candles.length - 1]

    if (last && last.time >= time) continue

    candles.push({ time, open, high, low, close })
  }

  return candles
}

/** Candles of `candleSeconds` stamped with their open time, like TradingView. `points` must be ascending */
export function toCandlesFromPoints(points: RwaChartPoint[], candleSeconds: number): RwaCandle[] {
  const candles: RwaCandle[] = []

  for (const { time, value } of points) {
    const candleTime = Math.floor(time / candleSeconds) * candleSeconds
    const last = candles[candles.length - 1]

    if (last?.time === candleTime) {
      last.high = Math.max(last.high, value)
      last.low = Math.min(last.low, value)
      last.close = value
      continue
    }

    candles.push({ time: candleTime, open: value, high: value, low: value, close: value })
  }

  return candles
}

export function toChartPoints(prices: [number, number][]): RwaChartPoint[] {
  const points: RwaChartPoint[] = []

  for (const [timestampMs, value] of prices) {
    const time = Math.floor(timestampMs / 1000)
    const last = points[points.length - 1]

    // TradingView requires strictly ascending time
    if (last && last.time >= time) {
      last.value = value
      continue
    }

    points.push({ time, value })
  }

  return points
}

/** Every token address on `chainId`, the batches `getNetworkStats` requests are cut from */
function getRegistryAddresses(chainId: number): string[] {
  return getAllAssets().flatMap((asset) =>
    asset.tokens.filter((token) => token.chainId === chainId).map((token) => token.address),
  )
}

/** Every token coin, the batches `getTokenMarkets` requests are cut from */
function getRegistryCoingeckoIds(): string[] {
  return getTokenCoingeckoIds(getAllAssets().flatMap((asset) => asset.tokens))
}

function getTokenCoingeckoIds(tokens: RwaToken[]): string[] {
  return [...new Set(tokens.flatMap((token) => (token.coingeckoId ? [token.coingeckoId] : [])))]
}

async function loadRwaChart(rwaId: string, range: RwaChartRange): Promise<RwaChartPoint[] | null> {
  const chart = await fetchRwaMarketChart(rwaId, CHART_DAYS[range], CHART_REVALIDATE_SECONDS[range])

  return chart && toChartPoints(chart.tokenized_prices)
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

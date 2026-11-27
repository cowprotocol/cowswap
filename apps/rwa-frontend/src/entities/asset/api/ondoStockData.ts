import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'

import { CHART_REVALIDATE_SECONDS } from './marketData'

import type { StockDataProvider } from './stockData'
import type { RwaAsset, RwaCandle, RwaChartRange, RwaStockMarket } from '../model/types'

import {
  fetchOndoUnderlyingCandles,
  fetchOndoUnderlyingMarket,
  type OndoCandle,
  type OndoOhlcPeriod,
} from '@/shared/api/index.server'

const HOUR_SECONDS = 3600
const DAY_SECONDS = 24 * HOUR_SECONDS
/** Ondo caches market snapshots for a minute */
const MARKET_REVALIDATE_SECONDS = 60
const DAY_PERIOD: OndoOhlcPeriod = '15min/1day'

const CHART_PERIODS: Record<RwaChartRange, OndoOhlcPeriod> = {
  '1D': DAY_PERIOD,
  '1W': '1hour/1month',
  '1M': '4hour/1month',
  '1Y': '1day/1year',
  ALL: '1day/all',
}

const CANDLE_SECONDS: Record<OndoOhlcPeriod, number> = {
  '15min/1day': 15 * 60,
  '1hour/1month': HOUR_SECONDS,
  '4hour/1month': 4 * HOUR_SECONDS,
  '1day/1year': DAY_SECONDS,
  '1day/all': DAY_SECONDS,
}

/** Ranges Ondo has no period for, cut from a longer one */
const RANGE_SECONDS: Partial<Record<RwaChartRange, number>> = { '1W': 7 * DAY_SECONDS }

/** Looked up by the asset's Ondo token: Ondo has no endpoint by stock ticker */
export const ondoStockDataProvider: StockDataProvider = {
  name: 'Ondo',

  async getMarket(asset) {
    const symbol = getOndoSymbol(asset)

    if (!symbol) return null

    const [snapshot, dayCandles] = await Promise.all([
      fetchOndoUnderlyingMarket(symbol, MARKET_REVALIDATE_SECONDS),
      fetchOndoUnderlyingCandles(symbol, DAY_PERIOD, MARKET_REVALIDATE_SECONDS).then(
        (candles) => ({ candles }),
        (err: unknown) => {
          const error = normalizeError(err)
          console.warn(`[rwa] Ondo ${symbol} day candles failed, the stock market has no 24h stats`, error)

          return null
        },
      ),
    ])
    const price = toNumber(snapshot?.underlyingMarket.price)

    if (!snapshot || price === null || price <= 0) return null

    const { underlyingMarket } = snapshot

    return {
      market: {
        price,
        ...getDayStats(price, toCandles(dayCandles?.candles ?? [])),
        yearLow: toNumber(underlyingMarket.priceLow52w),
        yearHigh: toNumber(underlyingMarket.priceHigh52w),
        marketCap: toNumber(underlyingMarket.marketCap),
        volume24h: toUsdVolume(toNumber(underlyingMarket.volume), price),
        updatedAt: new Date(snapshot.timestamp).toISOString(),
        provider: 'Ondo',
      },
      degraded: dayCandles === null,
    }
  },

  async getChart(asset, range) {
    const candles = await getRangeCandles(asset, range)

    if (!candles) return null

    const candleSeconds = CANDLE_SECONDS[CHART_PERIODS[range]]
    const now = Math.floor(Date.now() / 1000)

    // A close is the price at the end of its candle, and the last candle is still open
    return candles.map(({ time, close }) => ({ time: Math.min(time + candleSeconds, now), value: close }))
  },

  getCandles: getRangeCandles,
}

function getDayStats(price: number, candles: RwaCandle[]): Pick<RwaStockMarket, 'change24h' | 'dayLow' | 'dayHigh'> {
  const first = candles[0]

  if (!first) return { change24h: null, dayLow: null, dayHigh: null }

  return {
    change24h: ((price - first.open) / first.open) * 100,
    dayLow: Math.min(price, ...candles.map(({ low }) => low)),
    dayHigh: Math.max(price, ...candles.map(({ high }) => high)),
  }
}

function getOndoSymbol(asset: RwaAsset): string | null {
  return asset.tokens.find((token) => token.issuer === 'Ondo')?.symbol ?? null
}

async function getRangeCandles(asset: RwaAsset, range: RwaChartRange): Promise<RwaCandle[] | null> {
  const symbol = getOndoSymbol(asset)

  if (!symbol) return null

  const response = await fetchOndoUnderlyingCandles(symbol, CHART_PERIODS[range], CHART_REVALIDATE_SECONDS[range])
  const candles = toCandles(response ?? [])
  const last = candles.at(-1)
  const rangeSeconds = RANGE_SECONDS[range]

  if (!last) return null
  if (rangeSeconds === undefined) return candles

  return candles.filter(({ time }) => time >= last.time - rangeSeconds)
}

/** Skips candles with a missing or non-positive price */
function toCandles(candles: OndoCandle[]): RwaCandle[] {
  return candles.flatMap(({ timestamp, ...prices }) => {
    const open = toNumber(prices.open)
    const high = toNumber(prices.high)
    const low = toNumber(prices.low)
    const close = toNumber(prices.close)

    if (open === null || high === null || low === null || close === null) return []
    if (Math.min(open, high, low, close) <= 0) return []

    return [{ time: Math.floor(timestamp / 1000), open, high, low, close }]
  })
}

function toNumber(value: string | undefined): number | null {
  const number = Number(value)

  return value !== undefined && value !== '' && Number.isFinite(number) ? number : null
}

/** Ondo reports shares; at the current price, as Ondo has no traded value */
function toUsdVolume(shares: number | null, price: number): number | null {
  return shares === null ? null : shares * price
}

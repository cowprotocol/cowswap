import type { RwaCandle, RwaChartPoint, RwaChartRange, RwaChartType } from '../model/types'

const DAY_SECONDS = 24 * 3600

/**
 * TradingView resolution of each series: `market_chart` points are 5-minutely for 1 day, hourly up to 90 days and
 * daily above, `/ohlc` candles are 30-minute, 4-hour, then 4-day. 4-day candles are charted as daily bars:
 * CoinGecko doesn't align them to the TradingView 4D grid
 */
export const CHART_RESOLUTIONS: Record<RwaChartType, Record<RwaChartRange, string>> = {
  line: { '1D': '5', '1W': '60', '1M': '60', '1Y': '1D', ALL: '1D' },
  candles: { '1D': '30', '1W': '240', '1M': '240', '1Y': '1D', ALL: '1D' },
}

/** Moves ascending `candles` to the start of their `resolution` bar, merging the ones that land in the same bar */
export function alignCandles(candles: RwaCandle[], resolution: string): RwaCandle[] {
  const step = getResolutionSeconds(resolution)
  const aligned: RwaCandle[] = []

  for (const candle of candles) {
    const time = Math.floor(candle.time / step) * step
    const last = aligned[aligned.length - 1]

    if (last && last.time === time) {
      last.high = Math.max(last.high, candle.high)
      last.low = Math.min(last.low, candle.low)
      last.close = candle.close
      continue
    }

    aligned.push({ ...candle, time })
  }

  return aligned
}

/** Points as flat candles, so both series share one datafeed */
export function pointsToCandles(points: RwaChartPoint[]): RwaCandle[] {
  return points.map(({ time, value }) => ({ time, open: value, high: value, low: value, close: value }))
}

/**
 * Ends ascending `candles` at `price`, which refreshes more often than the cached chart: a flat candle at `updatedAt`,
 * or the last candle closed at `price` when `updatedAt` is missing or within that candle. A candle lasts the shortest
 * gap between candles, since the series doesn't state its interval
 */
export function withLatestPrice(candles: RwaCandle[], price: number | null, updatedAt: string | null): RwaCandle[] {
  const last = candles[candles.length - 1]

  if (!last || price === null || price <= 0) return candles

  const updatedSeconds = updatedAt ? Math.floor(Date.parse(updatedAt) / 1000) : NaN

  if (Number.isFinite(updatedSeconds) && updatedSeconds >= last.time + getShortestGap(candles)) {
    return [...candles, { time: updatedSeconds, open: price, high: price, low: price, close: price }]
  }

  const closed = { ...last, high: Math.max(last.high, price), low: Math.min(last.low, price), close: price }

  return [...candles.slice(0, -1), closed]
}

function getResolutionSeconds(resolution: string): number {
  return resolution.endsWith('D') ? (Number(resolution.slice(0, -1)) || 1) * DAY_SECONDS : Number(resolution) * 60
}

function getShortestGap(candles: RwaCandle[]): number {
  let gap = Infinity

  for (let i = 1; i < candles.length; i++) {
    gap = Math.min(gap, candles[i].time - candles[i - 1].time)
  }

  return Number.isFinite(gap) ? gap : 1
}

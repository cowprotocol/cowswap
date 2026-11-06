import type { RwaCandle, RwaChartPoint, RwaChartRange, RwaChartType } from '../model/types'

const DAY_SECONDS = 24 * 3600

/**
 * TradingView resolution of each series: `market_chart` points are 5-minutely for 1 day, hourly up to 90 days and
 * daily above, `/ohlc` candles are 30-minute, 4-hour, then 4-day. 4-day candles are charted as daily bars: CoinGecko
 * doesn't align them to the TradingView 4D grid
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

function getResolutionSeconds(resolution: string): number {
  return resolution.endsWith('D') ? (Number(resolution.slice(0, -1)) || 1) * DAY_SECONDS : Number(resolution) * 60
}

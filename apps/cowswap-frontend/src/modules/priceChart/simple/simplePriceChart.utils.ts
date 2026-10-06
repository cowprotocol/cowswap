import type { Candle, CandleInterval } from '../lib/chart.types'
import type { PriceFormatBuiltIn } from 'lightweight-charts'

const DAY_SECONDS = 24 * 60 * 60

interface TimeRangeConfig {
  from: number
  interval: CandleInterval
  to: number
}

export const TIME_RANGES = ['1H', '1D', '1W', '1M', '1Y', 'All'] as const

export type ChartType = 'candles' | 'line'

export type TimeRange = (typeof TIME_RANGES)[number]

export function getCandlePriceFormat(bars: Candle[]): PriceFormatBuiltIn {
  const smallestPrice = bars.reduce((smallest, bar) => (bar.low > 0 ? Math.min(smallest, bar.low) : smallest), Infinity)
  const precision = smallestPrice < 1 ? Math.min(18, 3 - Math.floor(Math.log10(smallestPrice))) : 2

  return { minMove: 1 / 10 ** precision, precision, type: 'price' }
}

export function getTimeRangeConfig(period: TimeRange, nowSeconds: number): TimeRangeConfig {
  const to = Math.floor(nowSeconds)

  switch (period) {
    case '1H':
      return { from: to - 60 * 60, interval: '1m', to }
    case '1D':
      return { from: to - DAY_SECONDS, interval: '5m', to }
    case '1W':
      return { from: to - 7 * DAY_SECONDS, interval: '15m', to }
    case '1M':
      return { from: to - 30 * DAY_SECONDS, interval: '1h', to }
    case '1Y':
      return { from: to - 365 * DAY_SECONDS, interval: '1d', to }
    case 'All':
      return { from: 0, interval: '7d', to }
  }
}

import { FIAT_PRECISION, PERCENTAGE_PRECISION } from '@cowprotocol/common-const'
import { createCowLogger, formatLocaleNumber } from '@cowprotocol/common-utils'

import type { Candle, CandleInterval, TimeRange } from './priceChart.types'
import type { PriceFormatBuiltIn } from 'lightweight-charts'

export const logPriceChart = createCowLogger('PriceChart')

const DAY_SECONDS = 24 * 60 * 60

interface TimeRangeConfig {
  from: number
  interval: CandleInterval
  to: number
}

export function formatPercentageChange(change: number, locale: string): string {
  return formatLocaleNumber({
    number: change,
    locale,
    options: {
      maximumFractionDigits: PERCENTAGE_PRECISION,
      minimumFractionDigits: PERCENTAGE_PRECISION,
      signDisplay: 'always',
      style: 'percent',
    },
  })
}

export function formatPriceChartValue(value: number, locale: string): string {
  const absoluteValue = Math.abs(value)
  const isCompact = absoluteValue >= 1_000_000
  const usesSignificantDigits = absoluteValue > 0 && absoluteValue < 1

  return formatLocaleNumber({
    fixedDecimals: usesSignificantDigits ? undefined : FIAT_PRECISION,
    locale,
    number: value,
    options: {
      currency: 'USD',
      notation: isCompact ? 'compact' : 'standard',
      style: 'currency',
    },
    sigFigs: usesSignificantDigits ? 4 : undefined,
  })
}

export function getCandlePriceFormat(bars: Candle[]): PriceFormatBuiltIn {
  const smallestPrice = bars.reduce((smallest, bar) => (bar.low > 0 ? Math.min(smallest, bar.low) : smallest), Infinity)
  const precision = smallestPrice < 1 ? Math.min(18, 3 - Math.floor(Math.log10(smallestPrice))) : FIAT_PRECISION

  return { minMove: 1 / 10 ** precision, precision, type: 'price' }
}

export function getPriceChartSummary(bars: Candle[]): { change: number; price: number } | undefined {
  const firstPrice = bars[0]?.open
  const latestPrice = bars[bars.length - 1]?.close

  if (!firstPrice || latestPrice === undefined) {
    return undefined
  }

  return {
    change: (latestPrice - firstPrice) / firstPrice,
    price: latestPrice,
  }
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

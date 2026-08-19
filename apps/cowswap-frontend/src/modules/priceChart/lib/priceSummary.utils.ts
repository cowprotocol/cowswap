import { formatLocaleNumber } from '@cowprotocol/common-utils'

import type { PriceChartBar, PriceChartSummary } from './priceChart.types'

export function formatPriceChartValue(value: number, locale: string): string {
  const absoluteValue = Math.abs(value)
  const isCompact = absoluteValue >= 1_000_000
  const usesSignificantDigits = absoluteValue > 0 && absoluteValue < 1

  return formatLocaleNumber({
    fixedDecimals: usesSignificantDigits ? undefined : 2,
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

export function getPriceChartSummary(bars: PriceChartBar[]): PriceChartSummary | undefined {
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

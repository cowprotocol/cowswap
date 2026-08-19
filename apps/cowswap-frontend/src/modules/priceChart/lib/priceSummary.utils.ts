import type { PriceChartBar, PriceChartSummary } from './priceChart.types'

export function formatUsdMarketCap(marketCap: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    currency: 'USD',
    maximumFractionDigits: 2,
    notation: 'compact',
    style: 'currency',
  }).format(marketCap)
}

export function formatUsdPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    currency: 'USD',
    maximumFractionDigits: price < 1 ? 4 : 2,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(price)
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

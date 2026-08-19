import type { PriceChartBar, PriceChartResolution, SimplePriceChartPeriod } from './priceChart.types'
import type { PriceFormatBuiltIn } from 'lightweight-charts'

const DAY_SECONDS = 24 * 60 * 60

interface SimplePriceChartPeriodConfig {
  from: number
  resolution: PriceChartResolution
  to: number
}

export const SIMPLE_PRICE_CHART_PERIODS: SimplePriceChartPeriod[] = ['1H', '1D', '1W', '1M', '1Y', 'All']

export function getSimplePriceChartPeriodConfig(
  period: SimplePriceChartPeriod,
  nowSeconds: number,
): SimplePriceChartPeriodConfig {
  const to = Math.floor(nowSeconds)

  switch (period) {
    case '1H':
      return { from: to - 60 * 60, resolution: '1', to }
    case '1D':
      return { from: to - DAY_SECONDS, resolution: '5', to }
    case '1W':
      return { from: to - 7 * DAY_SECONDS, resolution: '15', to }
    case '1M':
      return { from: to - 30 * DAY_SECONDS, resolution: '60', to }
    case '1Y':
      return { from: to - 365 * DAY_SECONDS, resolution: '1D', to }
    case 'All':
      return { from: 0, resolution: '7D', to }
  }
}

export function getSimplePriceChartPriceFormat(bars: PriceChartBar[]): PriceFormatBuiltIn {
  const smallestPrice = bars.reduce((smallest, bar) => (bar.low > 0 ? Math.min(smallest, bar.low) : smallest), Infinity)
  const precision = smallestPrice < 1 ? Math.min(18, 3 - Math.floor(Math.log10(smallestPrice))) : 2

  return { minMove: 1 / 10 ** precision, precision, type: 'price' }
}

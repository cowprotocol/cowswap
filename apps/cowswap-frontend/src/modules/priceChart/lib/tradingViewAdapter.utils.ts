import type { Bar, ResolutionString } from './charting_library'
import type { PriceChartBar, PriceChartResolution } from './priceChart.types'

const RESOLUTION_TO_PRICE_CHART: Partial<Record<string, PriceChartResolution>> = {
  '1': '1',
  '5': '5',
  '15': '15',
  '60': '60',
  '240': '240',
  '1D': '1D',
  '1W': '7D',
}

export function mapPriceChartBarsToTradingViewBars(bars: PriceChartBar[]): Bar[] {
  return bars.map((bar) => ({
    close: bar.close,
    high: bar.high,
    low: bar.low,
    open: bar.open,
    time: bar.timestamp * 1000,
  }))
}

export function mapResolutionToPriceChartResolution(resolution: ResolutionString): PriceChartResolution | null {
  return RESOLUTION_TO_PRICE_CHART[String(resolution)] || null
}

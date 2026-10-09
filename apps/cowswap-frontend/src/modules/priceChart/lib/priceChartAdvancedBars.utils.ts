import type { Candle, CandleInterval } from './priceChart.types'
import type { Bar, ResolutionString } from './priceChartAdvancedApi.types'

const RESOLUTION_TO_PRICE_CHART: Partial<Record<string, CandleInterval>> = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '60': '1h',
  '240': '4h',
  '1D': '1d',
  '1W': '7d',
}

export function mapCandlesToTradingViewBars(bars: Candle[]): Bar[] {
  return bars.map((bar) => ({
    close: bar.close,
    high: bar.high,
    low: bar.low,
    open: bar.open,
    time: bar.timestamp * 1000,
    ...(bar.volume === undefined ? {} : { volume: bar.volume }),
  }))
}

export function mapResolutionToCandleInterval(resolution: ResolutionString): CandleInterval | null {
  return RESOLUTION_TO_PRICE_CHART[String(resolution)] || null
}

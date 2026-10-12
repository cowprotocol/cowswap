import { ADVANCED_CHART_CANDLE_INTERVALS } from '../config/priceChartAdvanced.constants'

import type { Candle, CandleInterval } from './priceChart.types'
import type { Bar, ResolutionString } from 'charting_library'

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
  return ADVANCED_CHART_CANDLE_INTERVALS[resolution] || null
}

import type { Candle } from '../lib/chart.types'
import type { HistogramData, UTCTimestamp } from 'lightweight-charts'

export function mapPriceChartBarsToVolumeData(bars: Candle[]): HistogramData<UTCTimestamp>[] {
  return bars.flatMap((bar) =>
    bar.volume === undefined ? [] : [{ time: bar.timestamp as UTCTimestamp, value: bar.volume }],
  )
}

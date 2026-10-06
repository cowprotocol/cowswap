import type { PriceChartBar } from '../lib/priceChart.types'
import type { HistogramData, UTCTimestamp } from 'lightweight-charts'

export function hasPriceChartVolume(bars: PriceChartBar[]): boolean {
  return bars.some((bar) => bar.volume !== undefined)
}

export function mapPriceChartBarsToVolumeData(bars: PriceChartBar[]): HistogramData<UTCTimestamp>[] {
  return bars.flatMap((bar) =>
    bar.volume === undefined ? [] : [{ time: bar.timestamp as UTCTimestamp, value: bar.volume }],
  )
}

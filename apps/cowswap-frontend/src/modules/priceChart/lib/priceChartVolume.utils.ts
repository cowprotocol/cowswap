import type { IChartingLibraryWidget } from './charting_library'
import type { PriceChartBar } from './priceChart.types'
import type { HistogramData, UTCTimestamp } from 'lightweight-charts'

const VOLUME_STUDY_NAME = 'Volume'

export function hasPriceChartVolume(bars: PriceChartBar[]): boolean {
  return bars.some((bar) => bar.volume !== undefined)
}

export function mapPriceChartBarsToVolumeData(bars: PriceChartBar[]): HistogramData<UTCTimestamp>[] {
  return bars.flatMap((bar) =>
    bar.volume === undefined ? [] : [{ time: bar.timestamp as UTCTimestamp, value: bar.volume }],
  )
}

export function syncTradingViewVolumeStudy(widget: IChartingLibraryWidget, hasVolume: boolean): void {
  const chart = widget.activeChart()
  const volumeStudies = chart.getAllStudies().filter((study) => study.name === VOLUME_STUDY_NAME)

  if (hasVolume) {
    if (!volumeStudies.length) {
      void chart.createStudy(VOLUME_STUDY_NAME, false, false)
    }

    return
  }

  volumeStudies.forEach((study) => chart.removeEntity(study.id, { disableUndo: true }))
}

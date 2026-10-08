import type { IChartingLibraryWidget } from './loadChartingLibrary'
import type { Candle } from './priceChart.types'

const VOLUME_STUDY_NAME = 'Volume'

export function hasPriceChartVolume(bars: Candle[]): boolean {
  return bars.some((bar) => bar.volume !== undefined)
}

export function syncTradingViewVolumeStudy(widget: IChartingLibraryWidget, hasVolume: boolean): void {
  const chart = widget.activeChart()
  const volumeStudies = chart.getAllStudies().filter((study) => study.name === VOLUME_STUDY_NAME)

  if (hasVolume) {
    if (!volumeStudies.length) {
      void chart.createStudy(VOLUME_STUDY_NAME, true, false)
    }

    volumeStudies.forEach((study) => chart.getStudyById(study.id).mergeUp())
    return
  }

  volumeStudies.forEach((study) => chart.removeEntity(study.id, { disableUndo: true }))
}

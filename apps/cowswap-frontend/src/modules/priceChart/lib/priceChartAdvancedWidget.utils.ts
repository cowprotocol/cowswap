import type { useTheme } from 'common/hooks/useTheme'

import { ADVANCED_CHART_OPTIONS } from '../config/priceChartAdvanced.constants'

import type { ChartPropertiesOverrides, IChartingLibraryWidget, Overrides } from 'charting_library'

export function getThemeOverrides(theme: ReturnType<typeof useTheme>): Partial<ChartPropertiesOverrides> & Overrides {
  const { paper: backgroundColor, primary: primaryColor, text: textColor, border: gridColor } = theme

  return {
    ...ADVANCED_CHART_OPTIONS.overrides,
    'paneProperties.background': backgroundColor,
    'paneProperties.backgroundType': 'solid',
    'paneProperties.vertGridProperties.color': gridColor,
    'paneProperties.horzGridProperties.color': gridColor,
    'scalesProperties.textColor': textColor,
    'scalesProperties.lineColor': gridColor,
    'symbolWatermarkProperties.color': primaryColor,
  }
}

const VOLUME_STUDY_NAME = 'Volume'

export function syncTradingViewVolumeStudy(widget: IChartingLibraryWidget, hasVolume: boolean): void {
  const chart = widget.activeChart()
  const volumeStudies = chart.getAllStudies().filter((study) => study.name === VOLUME_STUDY_NAME)

  if (hasVolume) {
    if (!volumeStudies.length) {
      chart.createStudy(VOLUME_STUDY_NAME, true, false)
    }

    volumeStudies.forEach((study) => chart.getStudyById(study.id).mergeUp())
    return
  }

  volumeStudies.forEach((study) => chart.removeEntity(study.id, { disableUndo: true }))
}

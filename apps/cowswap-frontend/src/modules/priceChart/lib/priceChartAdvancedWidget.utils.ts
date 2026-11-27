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

// `widget.remove()` destroys the TradingView iframe, but the React state pointing at the widget is cleared in
// the same cleanup, so a later render can still run subscription teardown against the dead instance. Any
// widget-level call then throws inside the library: "Cannot read properties of null (reading 'doWhenApiIsReady')".
const removedWidgets = new WeakSet<IChartingLibraryWidget>()

export function isChartWidgetRemoved(widget: IChartingLibraryWidget): boolean {
  return removedWidgets.has(widget)
}

export function removeChartWidget(widget: IChartingLibraryWidget): void {
  removedWidgets.add(widget)
  widget.remove()
}

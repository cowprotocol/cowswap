import { getReferenceLineColor } from './priceChartReferenceLine.utils'

import { BASE_LINE_STYLES } from '../config/priceChart.constants'

import type { PriceChartReferenceLine } from './priceChart.types'
import type { IChartingLibraryWidget } from 'charting_library'
import type { DefaultTheme } from 'styled-components'

export function createHorizontalLines(
  widget: IChartingLibraryWidget,
  referenceLines: PriceChartReferenceLine<number>[],
  theme: DefaultTheme,
): () => void {
  const chart = widget.activeChart()
  const entities = referenceLines.map((line) => {
    const lineColor = getReferenceLineColor(line.variant, theme)
    return chart.createShape(
      { price: line.price, time: Math.floor(Date.now() / 1000) },
      {
        disableSave: true,
        disableSelection: true,
        disableUndo: true,
        lock: true,
        text: line.label,
        overrides: {
          linecolor: lineColor,
          linestyle: BASE_LINE_STYLES.lineStyle,
          linewidth: BASE_LINE_STYLES.lineWidth,
          horzLabelsAlign: 'right',
          vertLabelsAlign: 'top',
          showPrice: true,
          textcolor: lineColor,
        },
        shape: 'horizontal_line',
        showInObjectsTree: false,
        zOrder: 'top',
      },
    )
  })
  return () => {
    entities.forEach((entity) => {
      entity.then((id) => chart.removeEntity(id, { disableUndo: true })).catch(() => undefined)
    })
  }
}

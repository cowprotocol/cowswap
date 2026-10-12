import { REFERENCE_LINE_STYLE } from '../config/priceChart.constants'

import type { PriceChartReferenceLine } from './priceChart.types'
import type { IChartingLibraryWidget } from 'charting_library'

export function createHorizontalLines(
  widget: IChartingLibraryWidget,
  referenceLines: PriceChartReferenceLine<number>[],
  color: string,
): () => void {
  const chart = widget.activeChart()
  const entities = referenceLines.map((line) => {
    return chart.createShape(
      { price: line.price, time: Math.floor(Date.now() / 1000) },
      {
        disableSave: true,
        disableSelection: true,
        disableUndo: true,
        lock: true,
        text: line.label,
        overrides: {
          'linetoolhorzline.linecolor': color,
          'linetoolhorzline.linestyle': REFERENCE_LINE_STYLE.lineStyle,
          'linetoolhorzline.linewidth': REFERENCE_LINE_STYLE.lineWidth,
          'linetoolhorzline.showLabel': true,
          'linetoolhorzline.showPrice': true,
          'linetoolhorzline.textcolor': color,
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

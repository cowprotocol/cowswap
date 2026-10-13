import { getReferenceLineStyle } from './priceChartReferenceLine.utils'

import type { PriceChartReferenceLine } from './priceChart.types'
import type { IChartingLibraryWidget } from 'charting_library'

export function createHorizontalLines(
  widget: IChartingLibraryWidget,
  referenceLines: PriceChartReferenceLine<number>[],
  color: string,
  textColor: string = color,
): () => void {
  const chart = widget.activeChart()
  const entities = referenceLines.map((line) => {
    const style = getReferenceLineStyle(line.variant, color, textColor)
    return chart.createShape(
      { price: line.price, time: Math.floor(Date.now() / 1000) },
      {
        disableSave: true,
        disableSelection: true,
        disableUndo: true,
        lock: true,
        text: line.label,
        overrides: {
          linecolor: style.color,
          linestyle: style.lineStyle,
          linewidth: style.lineWidth,
          horzLabelsAlign: 'right',
          vertLabelsAlign: 'top',
          showPrice: true,
          textcolor: style.color,
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

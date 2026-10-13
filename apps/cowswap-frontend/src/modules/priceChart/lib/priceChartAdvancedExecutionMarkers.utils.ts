import { CANDLE_DOWN_COLOR, CANDLE_UP_COLOR } from '../config/priceChart.constants'

import type { AttachedPriceChartExecutionMarker } from './priceChartExecutionMarker.utils'
import type { IChartingLibraryWidget } from 'charting_library'

export function createExecutionMarkers(
  widget: IChartingLibraryWidget,
  markers: AttachedPriceChartExecutionMarker[],
): () => void {
  const chart = widget.activeChart()
  const entities = markers.map((marker) => {
    const isBuy = marker.side === 'buy'
    const color = isBuy ? CANDLE_UP_COLOR : CANDLE_DOWN_COLOR
    const tool = isBuy ? 'linetoolarrowmarkup' : 'linetoolarrowmarkdown'
    return chart.createShape(
      { price: marker.barPrice, time: marker.barTimestamp },
      {
        disableSave: true,
        disableSelection: true,
        disableUndo: true,
        lock: true,
        overrides: {
          [`${tool}.arrowColor`]: color,
          [`${tool}.color`]: color,
          [`${tool}.showLabel`]: false,
        },
        shape: isBuy ? 'arrow_up' : 'arrow_down',
        showInObjectsTree: false,
        text: marker.title,
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

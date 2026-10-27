import { CANDLE_DOWN_COLOR, CANDLE_UP_COLOR } from '../config/priceChart.constants'

import type { AttachedPriceChartExecutionMarker } from './priceChartExecutionMarker.utils'
import type { Mark } from 'charting_library'

export function getExecutionMarks(markers: AttachedPriceChartExecutionMarker[], from: number, to: number): Mark[] {
  return markers
    .filter(({ barTimestamp }) => barTimestamp >= from && barTimestamp <= to)
    .map((marker) => {
      const isBuy = marker.side === 'buy'
      const color = isBuy ? CANDLE_UP_COLOR : CANDLE_DOWN_COLOR
      return {
        id: marker.id,
        time: marker.barTimestamp,
        color: { background: color, border: color },
        label: isBuy ? '↑' : '↓',
        labelFontColor: '#ffffff',
        minSize: 20,
        text: marker.title,
      }
    })
}

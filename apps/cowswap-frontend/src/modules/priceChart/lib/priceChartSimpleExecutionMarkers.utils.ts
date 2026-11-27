import { CANDLE_DOWN_COLOR, CANDLE_UP_COLOR } from '../config/priceChart.constants'

import type { AttachedPriceChartExecutionMarker } from './priceChartExecutionMarker.utils'
import type { SeriesMarker, UTCTimestamp } from 'lightweight-charts'

export function getSimpleExecutionMarkers(markers: AttachedPriceChartExecutionMarker[]): SeriesMarker<UTCTimestamp>[] {
  return markers.map((marker) => ({
    id: marker.id,
    time: marker.barTimestamp as UTCTimestamp,
    position: marker.side === 'buy' ? 'belowBar' : 'aboveBar',
    shape: marker.side === 'buy' ? 'arrowUp' : 'arrowDown',
    color: marker.side === 'buy' ? CANDLE_UP_COLOR : CANDLE_DOWN_COLOR,
    text: '',
  }))
}

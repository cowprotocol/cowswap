import type { PriceChartBar } from './priceChart.types'
import type { PriceChartExecutionMarker } from './tradingView.types'

export interface AttachedPriceChartExecutionMarker extends PriceChartExecutionMarker {
  barPrice: number
  barTimestamp: number
  stackIndex: number
}

export function attachExecutionMarkersToBars(
  markers: PriceChartExecutionMarker[],
  bars: PriceChartBar[],
): AttachedPriceChartExecutionMarker[] {
  const stackCounts = new Map<string, number>()

  return markers.flatMap((marker) => {
    const bar = findContainingBar(marker.timestamp, bars)

    if (!bar) return []

    const stackKey = `${bar.timestamp}:${marker.side}`
    const stackIndex = stackCounts.get(stackKey) || 0
    stackCounts.set(stackKey, stackIndex + 1)

    return [{ ...marker, barPrice: bar.close, barTimestamp: bar.timestamp, stackIndex }]
  })
}

function findContainingBar(timestamp: number, bars: PriceChartBar[]): PriceChartBar | undefined {
  if (!bars.length || timestamp < bars[0].timestamp) return undefined

  let low = 0
  let high = bars.length - 1

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)

    if (bars[middle].timestamp <= timestamp) low = middle + 1
    else high = middle - 1
  }

  const bar = bars[high]
  const previousBar = bars[high - 1]
  const nextBar = bars[high + 1]
  const endTimestamp =
    nextBar?.timestamp || (previousBar ? bar.timestamp + bar.timestamp - previousBar.timestamp : bar.timestamp)

  return timestamp < endTimestamp ? bar : undefined
}

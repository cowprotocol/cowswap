import { useLayoutEffect } from 'react'

import { createExecutionMarkers } from '../lib/priceChartAdvancedExecutionMarkers.utils'

import type { AttachedPriceChartExecutionMarker } from '../lib/priceChartExecutionMarker.utils'
import type { IChartingLibraryWidget } from 'charting_library'

export function usePriceChartAdvancedExecutionMarkers(
  widget: IChartingLibraryWidget | null,
  activeTicker: string,
  markers: AttachedPriceChartExecutionMarker[],
): void {
  // Detach TradingView subscriptions before React removes the iframe.
  useLayoutEffect(() => {
    if (!widget) return
    const chart = widget.activeChart()
    let removeMarkers: (() => void) | undefined
    let cancelled = false
    const syncMarkers = (): void => {
      if (!cancelled && !removeMarkers && chart.symbol() === activeTicker) {
        removeMarkers = createExecutionMarkers(widget, markers)
      }
    }
    chart.onDataLoaded().subscribe(null, syncMarkers)
    syncMarkers()
    return () => {
      cancelled = true
      chart.onDataLoaded().unsubscribe(null, syncMarkers)
      removeMarkers?.()
    }
  }, [widget, activeTicker, markers])
}

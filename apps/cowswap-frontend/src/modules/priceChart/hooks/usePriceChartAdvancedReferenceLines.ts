import { useLayoutEffect } from 'react'

import { createHorizontalLines } from '../lib/priceChartAdvancedReferenceLines.utils'

import type { PriceChartReferenceLine } from '../lib/priceChart.types'
import type { IChartingLibraryWidget } from 'charting_library'

export function usePriceChartAdvancedReferenceLines(
  widget: IChartingLibraryWidget | null,
  activeTicker: string,
  referenceLines: PriceChartReferenceLine<number>[],
  color: string,
): void {
  // Detach TradingView subscriptions before React removes the iframe.
  useLayoutEffect(() => {
    if (!widget) return
    const chart = widget.activeChart()
    let removeLines: (() => void) | undefined
    let cancelled = false
    const syncLines = (): void => {
      if (!cancelled && !removeLines && chart.symbol() === activeTicker) {
        removeLines = createHorizontalLines(widget, referenceLines, color)
      }
    }
    chart.onDataLoaded().subscribe(null, syncLines)
    syncLines()
    return () => {
      cancelled = true
      chart.onDataLoaded().unsubscribe(null, syncLines)
      removeLines?.()
    }
  }, [widget, activeTicker, referenceLines, color])
}

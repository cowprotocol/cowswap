import { useLayoutEffect } from 'react'

import { createHorizontalLines } from '../lib/priceChartAdvancedReferenceLines.utils'

import type { PriceChartReferenceLine } from '../lib/priceChart.types'
import type { IChartingLibraryWidget } from 'charting_library'
import type { DefaultTheme } from 'styled-components'

export function usePriceChartAdvancedReferenceLines(
  widget: IChartingLibraryWidget | null,
  activeTicker: string,
  referenceLines: PriceChartReferenceLine<number>[],
  theme: DefaultTheme,
): void {
  // Detach TradingView subscriptions before React removes the iframe.
  useLayoutEffect(() => {
    if (!widget) return
    const chart = widget.activeChart()
    let removeLines: (() => void) | undefined
    let cancelled = false
    const syncLines = (): void => {
      if (!cancelled && !removeLines && chart.symbol() === activeTicker) {
        removeLines = createHorizontalLines(widget, referenceLines, theme)
      }
    }
    chart.onDataLoaded().subscribe(null, syncLines)
    syncLines()
    return () => {
      cancelled = true
      chart.onDataLoaded().unsubscribe(null, syncLines)
      removeLines?.()
    }
  }, [widget, activeTicker, referenceLines, theme])
}

import { useEffect } from 'react'

import { useTheme } from 'common/hooks/useTheme'

import { syncHorizontalLines } from '../lib/priceChartAdvancedReferenceLines.utils'

import type { PriceChartReferenceLine } from '../lib/priceChart.types'
import type { HorizontalLineEntity } from '../lib/priceChartAdvancedReferenceLines.utils'
import type { IChartingLibraryWidget } from 'charting_library'

export function usePriceChartAdvancedLimitPrice(
  widget: IChartingLibraryWidget | null,
  activeTicker: string,
  referenceLines: PriceChartReferenceLine<number>[],
  onSelectPrice: ((price: number) => void) | undefined,
): void {
  const theme = useTheme()
  useEffect(() => {
    if (!widget) return
    const chart = widget.activeChart()
    const entities = new Map<string, HorizontalLineEntity>()
    let cancelled = false
    const syncLines = (): void => {
      if (!cancelled && chart.symbol() === activeTicker) {
        syncHorizontalLines({ widget, entities, referenceLines, ticker: activeTicker })
      }
    }
    chart.onDataLoaded().subscribe(null, syncLines)
    syncLines()
    return () => {
      cancelled = true
      chart.onDataLoaded().unsubscribe(null, syncLines)
      syncHorizontalLines({ widget, entities, referenceLines: [], ticker: activeTicker })
    }
  }, [widget, activeTicker, referenceLines, theme])

  useEffect(() => {
    if (!widget || !onSelectPrice) return
    const chart = widget.activeChart()
    let price: number | undefined
    const handleCrosshair = (event: { price: number }): void => {
      price = Number.isFinite(event.price) && event.price > 0 ? event.price : undefined
    }
    const handleClick = (): void => {
      if (price !== undefined && chart.symbol() === activeTicker) onSelectPrice(price)
    }
    chart.crossHairMoved().subscribe(null, handleCrosshair)
    widget.subscribe('mouse_up', handleClick)
    return () => {
      chart.crossHairMoved().unsubscribe(null, handleCrosshair)
      widget.unsubscribe('mouse_up', handleClick)
    }
  }, [widget, activeTicker, onSelectPrice])
}

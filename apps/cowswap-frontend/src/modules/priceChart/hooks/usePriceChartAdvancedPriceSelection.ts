import { useLayoutEffect } from 'react'

import { isChartWidgetRemoved } from '../lib/priceChartAdvancedWidget.utils'

import type { IChartingLibraryWidget } from 'charting_library'

export function usePriceChartAdvancedPriceSelection(
  widget: IChartingLibraryWidget | null,
  activeTicker: string,
  onSelectPrice: ((price: number) => void) | undefined,
): void {
  // Detach TradingView subscriptions before React removes the iframe.
  useLayoutEffect(() => {
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
      // The widget may already be gone: clearing the chart state and destroying the iframe are two separate
      // steps, and `remove()` takes every subscription with it anyway.
      if (!isChartWidgetRemoved(widget)) widget.unsubscribe('mouse_up', handleClick)
    }
  }, [widget, activeTicker, onSelectPrice])
}

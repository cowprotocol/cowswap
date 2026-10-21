import { useEffect } from 'react'

import { syncTradingViewVolumeStudy } from '../lib/priceChartAdvancedWidget.utils'

import type { IChartingLibraryWidget } from 'charting_library'

export function usePriceChartAdvancedSeries(
  widget: IChartingLibraryWidget | null,
  activeTicker: string,
  hasVolume: boolean | undefined,
): void {
  useEffect(() => {
    if (!widget) return
    let cancelled = false
    const syncVolume = (): void => {
      if (!cancelled && hasVolume !== undefined) syncTradingViewVolumeStudy(widget, hasVolume)
    }
    if (activeTicker && widget.activeChart().symbol() !== activeTicker) {
      widget.activeChart().setSymbol(activeTicker, syncVolume)
    } else {
      syncVolume()
    }
    return () => {
      cancelled = true
    }
  }, [widget, activeTicker, hasVolume])
}

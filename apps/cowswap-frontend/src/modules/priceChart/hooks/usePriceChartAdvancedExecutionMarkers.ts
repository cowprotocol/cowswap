import { useLayoutEffect } from 'react'

import type { PriceChartDatafeedController } from '../lib/priceChartAdvancedDatafeed.service'
import type { AttachedPriceChartExecutionMarker } from '../lib/priceChartExecutionMarker.utils'
import type { IChartingLibraryWidget } from 'charting_library'

export function usePriceChartAdvancedExecutionMarkers(
  widget: IChartingLibraryWidget | null,
  activeTicker: string,
  markers: AttachedPriceChartExecutionMarker[],
  controller: PriceChartDatafeedController,
): void {
  useLayoutEffect(() => {
    controller.setExecutionMarkers(activeTicker, markers)
    widget?.activeChart().refreshMarks()
  }, [widget, activeTicker, markers, controller])
}

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import { findFreeSpot } from './freeSpot.utils'
import { CANVAS } from './raster.utils'
import { DEFAULT_PLOT_HEIGHT, DEFAULT_PLOT_WIDTH } from './wall.constants'

import type { CanvasInfo } from './graffiti.service'
import type { Plot, PlotDims, WallRefs } from './wall.types'

export interface PlotState {
  plot: Plot | null
  setPlot: Dispatch<SetStateAction<Plot | null>>
  plotDims: PlotDims
  /** The backend's per-draw bounding box: long side, short side. */
  maxBoxWidth: number
  maxBoxHeight: number
}

/**
 * The fixed drawing frame: auto-placed at the first free spot once the wall has
 * loaded, draggable while the draft is empty, locked once you paint.
 */
export function usePlot(refs: WallRefs, info: CanvasInfo | null, loaded: boolean): PlotState {
  const { freeSpotRef, pixelsRef } = refs
  const maxBoxWidth = info?.maxBoxWidth ?? DEFAULT_PLOT_WIDTH
  const maxBoxHeight = info?.maxBoxHeight ?? DEFAULT_PLOT_HEIGHT
  const [plot, setPlot] = useState<Plot | null>(null)

  const plotDims = useCallback<PlotDims>(
    (p) => (p?.vertical ? [maxBoxHeight, maxBoxWidth] : [maxBoxWidth, maxBoxHeight]),
    [maxBoxHeight, maxBoxWidth],
  )

  useEffect(() => {
    if (!loaded || freeSpotRef.current) return

    const spot = findFreeSpot(pixelsRef.current, CANVAS, { w: maxBoxWidth, h: maxBoxHeight })

    freeSpotRef.current = spot
    setPlot((current) => current ?? { ...spot, vertical: false })
  }, [freeSpotRef, loaded, maxBoxHeight, maxBoxWidth, pixelsRef])

  return { plot, setPlot, plotDims, maxBoxWidth, maxBoxHeight }
}

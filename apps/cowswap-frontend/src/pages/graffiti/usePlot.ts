import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import { findFreeSpot } from './freeSpot.utils'
import { CANVAS } from './raster.utils'
import { DEFAULT_PLOT_HEIGHT, DEFAULT_PLOT_WIDTH } from './wall.constants'

import type { CanvasInfo } from './graffiti.service'
import type { Plot, PlotDims, WallRefs } from './wall.types'

export interface PlotState {
  plot: Plot | null
  setPlot: Dispatch<SetStateAction<Plot | null>>
  /** Move the frame to a free spot other than where it is, keeping its orientation. */
  placeAtFreeSpot: () => void
  plotDims: PlotDims
  /** The backend's per-draw bounding box: long side, short side. */
  maxBoxWidth: number
  maxBoxHeight: number
}

/** Auto-placed at a free spot once the wall has loaded; `placeAtFreeSpot` moves it to another one. */
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

  const placeAtFreeSpot = useCallback((): void => {
    setPlot((current) => {
      const vertical = current?.vertical ?? false
      const [w, h] = plotDims({ vertical })

      return { ...findFreeSpot(pixelsRef.current, CANVAS, { w, h }, { avoid: current ?? undefined }), vertical }
    })
  }, [pixelsRef, plotDims])

  return { plot, setPlot, placeAtFreeSpot, plotDims, maxBoxWidth, maxBoxHeight }
}

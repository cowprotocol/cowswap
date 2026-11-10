import { useCallback, useEffect, useLayoutEffect } from 'react'

import { useFullscreen } from './useFullscreen'
import { clampScale, computeMinScale, fitView, frameView, zoomAround } from './viewport.utils'

import type { PlotDims, WallRefs } from './wall.types'

export interface UseViewportParams {
  canvasEl: HTMLCanvasElement | null
  plotDims: PlotDims
  plotReady: boolean
  plotLocked: boolean
}

export interface Viewport {
  zoomBy: (factor: number) => void
  /** Fit the whole wall in view. */
  resetView: () => void
  /** Centre on the drawing frame, large enough to grab. */
  zoomToPlot: () => void
  isFullscreen: boolean
  toggleFullscreen: () => void
}

export function useViewport(
  refs: WallRefs,
  { canvasEl, plotDims, plotReady, plotLocked }: UseViewportParams,
): Viewport {
  const { viewRef, minScaleRef, snapshotRef, requestRenderRef } = refs

  // Zoom-out floor for the gesture handlers, which read it without a re-render.
  useLayoutEffect(() => {
    minScaleRef.current = computeMinScale(canvasEl)
  })

  const zoomBy = useCallback(
    (factor: number): void => {
      if (!canvasEl) return

      const view = viewRef.current
      const next = clampScale(view.scale * factor, computeMinScale(canvasEl))

      zoomAround(view, canvasEl.clientWidth / 2, canvasEl.clientHeight / 2, next)
      requestRenderRef.current()
    },
    [canvasEl, requestRenderRef, viewRef],
  )

  const resetView = useCallback((): void => {
    if (canvasEl) viewRef.current = fitView(canvasEl)

    requestRenderRef.current()
  }, [canvasEl, requestRenderRef, viewRef])

  const zoomToPlot = useCallback((): void => {
    const { plot } = snapshotRef.current

    if (canvasEl && plot) frameView(viewRef.current, canvasEl, plot, plotDims, minScaleRef.current)

    requestRenderRef.current()
  }, [canvasEl, minScaleRef, plotDims, requestRenderRef, snapshotRef, viewRef])

  // The frame becomes movable on first placement and after a full undo.
  useEffect(() => {
    if (plotReady && !plotLocked) zoomToPlot()
  }, [plotLocked, plotReady, zoomToPlot])

  useEffect(() => {
    if (!canvasEl) return

    const observer = new ResizeObserver(() => {
      if (viewRef.current.scale === 1 && viewRef.current.offsetX === 0) resetView()

      requestRenderRef.current()
    })

    observer.observe(canvasEl)

    if (canvasEl.clientWidth > 0) resetView()

    return () => observer.disconnect()
  }, [canvasEl, requestRenderRef, resetView, viewRef])

  const { isFullscreen, toggleFullscreen } = useFullscreen(refs, resetView)

  return { zoomBy, resetView, zoomToPlot, isFullscreen, toggleFullscreen }
}

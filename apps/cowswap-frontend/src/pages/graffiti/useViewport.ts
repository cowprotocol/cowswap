import { useCallback, useEffect, useLayoutEffect } from 'react'

import { useFullscreen } from './useFullscreen'
import { clampScale, computeMinScale, coverView, fitView, frameView, zoomAround } from './viewport.utils'

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
  /** Whether this browser can fullscreen an element at all. */
  canFullscreen: boolean
  toggleFullscreen: () => void
}

export function useViewport(
  refs: WallRefs,
  { canvasEl, plotDims, plotReady, plotLocked }: UseViewportParams,
): Viewport {
  const { viewRef, minScaleRef, autoViewRef, snapshotRef, requestRenderRef } = refs

  // Zoom-out floor for the gesture handlers, which read it without a re-render.
  useLayoutEffect(() => {
    minScaleRef.current = computeMinScale(canvasEl)
  })

  const zoomBy = useCallback(
    (factor: number): void => {
      if (!canvasEl) return

      const view = viewRef.current
      const next = clampScale(view.scale * factor, computeMinScale(canvasEl))

      autoViewRef.current = null
      zoomAround(view, canvasEl.clientWidth / 2, canvasEl.clientHeight / 2, next)
      requestRenderRef.current()
    },
    [autoViewRef, canvasEl, requestRenderRef, viewRef],
  )

  const resetView = useCallback((): void => {
    autoViewRef.current = 'contain'

    if (canvasEl) viewRef.current = fitView(canvasEl)

    requestRenderRef.current()
  }, [autoViewRef, canvasEl, requestRenderRef, viewRef])

  const zoomToPlot = useCallback((): void => {
    const { plot } = snapshotRef.current

    autoViewRef.current = 'frame'

    if (canvasEl && plot) frameView(viewRef.current, canvasEl, plot, plotDims, minScaleRef.current)

    requestRenderRef.current()
  }, [autoViewRef, canvasEl, minScaleRef, plotDims, requestRenderRef, snapshotRef, viewRef])

  // The frame becomes movable on first placement and after a full undo.
  useEffect(() => {
    if (plotReady && !plotLocked) zoomToPlot()
  }, [plotLocked, plotReady, zoomToPlot])

  // Re-apply whichever view the stage is tracking, so a resize, a rotation, a
  // sidebar toggle or leaving fullscreen keeps using the whole stage.
  const applyAutoView = useCallback((): void => {
    const mode = autoViewRef.current
    const { plot } = snapshotRef.current

    if (canvasEl && mode === 'cover') viewRef.current = coverView(canvasEl)
    if (canvasEl && mode === 'contain') viewRef.current = fitView(canvasEl)
    if (canvasEl && mode === 'frame' && plot) {
      frameView(viewRef.current, canvasEl, plot, plotDims, computeMinScale(canvasEl))
    }

    requestRenderRef.current()
  }, [autoViewRef, canvasEl, plotDims, requestRenderRef, snapshotRef, viewRef])

  useEffect(() => {
    if (!canvasEl) return

    const observer = new ResizeObserver(applyAutoView)

    observer.observe(canvasEl)

    if (canvasEl.clientWidth > 0) applyAutoView()

    return () => observer.disconnect()
  }, [applyAutoView, canvasEl])

  // Entering or leaving fullscreen is a deliberate reframe, and fullscreen is
  // the view-the-whole-wall mode: fit the new stage rather than fill it, which
  // would crop the axis the wall overflows on.
  const { isFullscreen, canFullscreen, toggleFullscreen } = useFullscreen(refs, resetView)

  return { zoomBy, resetView, zoomToPlot, isFullscreen, canFullscreen, toggleFullscreen }
}

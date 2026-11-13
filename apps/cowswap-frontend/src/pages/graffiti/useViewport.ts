import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

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
  /** Go fullscreen centred on the drawing frame rather than on the whole wall. */
  openPlotFullscreen: () => void
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

  // Entering fullscreen is a deliberate reframe, and fullscreen is the
  // view-the-whole-wall mode: fit the new stage rather than fill it, which would
  // crop the axis the wall overflows on. Opened to show one plot, it frames that
  // instead.
  const enterFramed = useRef(false)
  const applyFullscreenView = useCallback((): void => {
    if (enterFramed.current) zoomToPlot()
    else resetView()

    enterFramed.current = false
  }, [resetView, zoomToPlot])

  const { isFullscreen, canFullscreen, toggleFullscreen } = useFullscreen(refs, applyFullscreenView)

  const openPlotFullscreen = useCallback((): void => {
    if (!isFullscreen) enterFramed.current = true

    toggleFullscreen()
  }, [isFullscreen, toggleFullscreen])

  return { zoomBy, resetView, zoomToPlot, openPlotFullscreen, isFullscreen, canFullscreen, toggleFullscreen }
}

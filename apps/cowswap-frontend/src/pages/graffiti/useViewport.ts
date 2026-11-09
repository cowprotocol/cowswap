import { useCallback, useEffect, useLayoutEffect } from 'react'

import { useFullscreen } from './useFullscreen'
import { attachViewportListeners, clampScale, computeMinScale, fitView, frameView, zoomAround } from './viewport.utils'

import type { PlotDims, WallRefs } from './wall.types'

export interface UseViewportParams {
  onSolana: boolean
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
  { onSolana, plotDims, plotReady, plotLocked }: UseViewportParams,
): Viewport {
  const { canvasElRef, viewRef, minScaleRef, plotRef } = refs

  // Zoom-out floor for the gesture handlers, which read it without a re-render.
  useLayoutEffect(() => {
    minScaleRef.current = computeMinScale(canvasElRef.current)
  })

  const zoomBy = useCallback(
    (factor: number): void => {
      const canvasEl = canvasElRef.current

      if (!canvasEl) return

      const view = viewRef.current
      const next = clampScale(view.scale * factor, computeMinScale(canvasEl))

      zoomAround(view, canvasEl.clientWidth / 2, canvasEl.clientHeight / 2, next)
    },
    [canvasElRef, viewRef],
  )

  const resetView = useCallback((): void => {
    const canvasEl = canvasElRef.current

    if (canvasEl) viewRef.current = fitView(canvasEl)
  }, [canvasElRef, viewRef])

  const zoomToPlot = useCallback((): void => {
    const canvasEl = canvasElRef.current
    const plot = plotRef.current

    if (canvasEl && plot) frameView(viewRef.current, canvasEl, plot, plotDims, minScaleRef.current)
  }, [canvasElRef, minScaleRef, plotDims, plotRef, viewRef])

  // The frame becomes movable on first placement and after a full undo.
  useEffect(() => {
    if (plotReady && !plotLocked) zoomToPlot()
  }, [plotLocked, plotReady, zoomToPlot])

  // The canvas mounts only once past the network gate, so re-attach when that
  // flips or the listeners never bind (trackpad pinch and wheel pan go dead).
  useEffect(() => {
    const canvasEl = canvasElRef.current

    if (!canvasEl) return

    return attachViewportListeners(refs, canvasEl)
  }, [canvasElRef, onSolana, refs])

  useEffect(() => {
    const canvasEl = canvasElRef.current

    if (!canvasEl) return

    const observer = new ResizeObserver(() => {
      if (viewRef.current.scale === 1 && viewRef.current.offsetX === 0) resetView()
    })

    observer.observe(canvasEl)

    if (canvasEl.clientWidth > 0) resetView()

    return () => observer.disconnect()
    // Re-run when the gate flips: the canvas only exists once on Solana.
  }, [canvasElRef, onSolana, resetView, viewRef])

  const { isFullscreen, toggleFullscreen } = useFullscreen(refs, resetView)

  return { zoomBy, resetView, zoomToPlot, isFullscreen, toggleFullscreen }
}

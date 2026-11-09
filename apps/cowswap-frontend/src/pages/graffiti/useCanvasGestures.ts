import { useGesture } from '@use-gesture/react'

import { MAX_SCALE, zoomAround } from './viewport.utils'

import type { WallRefs } from './wall.types'

/**
 * Pinch-zoom and wheel-pan on the wall, via @use-gesture.
 *
 * The library unifies the three ways a zoom arrives: two fingers on touch,
 * ctrl/⌘+wheel on mice, and trackpad pinch (which browsers surface as a
 * ctrl+wheel, or as Safari's gesture* events). We only translate its output
 * into the wall's view: the zoom is anchored on the gesture's origin and the
 * two-finger midpoint drags the view along.
 */
export function useCanvasGestures(
  { viewRef, minScaleRef, pinchActiveRef, requestRenderRef }: WallRefs,
  canvasEl: HTMLCanvasElement | null,
  onPinchStart: () => void,
): void {
  useGesture(
    {
      onPinchStart: () => {
        pinchActiveRef.current = true
        onPinchStart()
      },
      onPinchEnd: () => {
        pinchActiveRef.current = false
      },
      onPinch: ({ offset: [scale], origin: [ox, oy], first, memo }) => {
        if (!canvasEl) return memo

        const view = viewRef.current
        const rect = canvasEl.getBoundingClientRect()
        const previous = memo as [number, number] | undefined

        if (previous && !first) {
          view.offsetX += ox - previous[0]
          view.offsetY += oy - previous[1]
        }

        zoomAround(view, ox - rect.left, oy - rect.top, scale)
        requestRenderRef.current()

        return [ox, oy]
      },
      onWheel: ({ delta: [dx, dy], pinching, event }) => {
        // ctrl+wheel is a pinch and has already been handled above.
        if (pinching) return

        event.preventDefault()
        viewRef.current.offsetX -= dx
        viewRef.current.offsetY -= dy
        requestRenderRef.current()
      },
    },
    {
      target: canvasEl ?? undefined,
      eventOptions: { passive: false },
      pinch: {
        // `offset[0]` is then the absolute scale, bounded, rather than a ratio
        // we would have to multiply in ourselves.
        from: () => [viewRef.current.scale, 0],
        scaleBounds: () => ({ min: minScaleRef.current, max: MAX_SCALE }),
        pinchOnWheel: true,
      },
    },
  )
}

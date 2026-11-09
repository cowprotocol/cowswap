import { CANVAS } from './raster.utils'

import type { Plot, PlotDims, View, WallRefs } from './wall.types'

export const MAX_SCALE = 40
/** Zoom-out floor for trackpad gestures, which ignore the fit-to-wall floor. */
const GESTURE_MIN_SCALE = 0.5
const FALLBACK_MIN_SCALE = 0.06

/** Fraction of the canvas the frame should fill when zoomed to it. */
const FRAME_FILL = 0.8

type GestureEvent = Event & { scale?: number; clientX?: number; clientY?: number }

/** Wheel and trackpad-gesture zoom/pan on the canvas. Returns the cleanup. */
export function attachViewportListeners(refs: WallRefs, canvasEl: HTMLCanvasElement): () => void {
  const detachWheel = attachWheel(refs, canvasEl)
  const detachGestures = attachGestures(refs, canvasEl)

  return () => {
    detachWheel()
    detachGestures()
  }
}

export function clampScale(scale: number, min: number): number {
  return Math.min(MAX_SCALE, Math.max(min, scale))
}

/** Zoom-out floor: at least the whole wall fits. */
export function computeMinScale(canvasEl: HTMLCanvasElement | null): number {
  if (!canvasEl) return FALLBACK_MIN_SCALE

  return Math.min(canvasEl.clientWidth / (CANVAS.w * 1.05), canvasEl.clientHeight / (CANVAS.h * 1.05))
}

/** A view that fits the whole wall, centred. */
export function fitView(canvasEl: HTMLCanvasElement): View {
  const scale = Math.min(canvasEl.clientWidth / (CANVAS.w * 1.02), canvasEl.clientHeight / (CANVAS.h * 1.05))

  return {
    scale,
    offsetX: (canvasEl.clientWidth - CANVAS.w * scale) / 2,
    offsetY: (canvasEl.clientHeight - CANVAS.h * scale) / 2,
  }
}

/** Centre the view on the frame, large enough to grab. Mutates `view`. */
export function frameView(view: View, canvasEl: HTMLCanvasElement, plot: Plot, dims: PlotDims, minScale: number): void {
  const [pw, ph] = dims(plot)
  const scale = Math.min(
    Math.min(MAX_SCALE, (canvasEl.clientWidth * FRAME_FILL) / pw),
    Math.min(MAX_SCALE, (canvasEl.clientHeight * FRAME_FILL) / ph),
  )

  view.scale = Math.max(minScale, scale)
  view.offsetX = canvasEl.clientWidth / 2 - (plot.x + pw / 2) * view.scale
  view.offsetY = canvasEl.clientHeight / 2 - (plot.y + ph / 2) * view.scale
}

/**
 * Rescale the view to `nextScale` while keeping the wall point under (mx, my)
 * fixed on screen. Mutates `view`: it lives in a ref and changes every frame.
 */
export function zoomAround(view: View, mx: number, my: number, nextScale: number): void {
  view.offsetX = mx - ((mx - view.offsetX) / view.scale) * nextScale
  view.offsetY = my - ((my - view.offsetY) / view.scale) * nextScale
  view.scale = nextScale
}

/**
 * Safari/macOS trackpad pinch arrives as gesture* events, not wheel: intercept
 * them so the page itself doesn't zoom.
 */
function attachGestures({ viewRef }: WallRefs, canvasEl: HTMLCanvasElement): () => void {
  const swallow = (event: Event): void => {
    if (isInside(canvasEl, event.target)) event.preventDefault()
  }

  const onChange = (event: Event): void => {
    if (!isInside(canvasEl, event.target)) return

    event.preventDefault()

    const { scale, clientX = 0, clientY = 0 } = event as GestureEvent

    if (!scale || scale <= 0) return

    const view = viewRef.current
    const rect = canvasEl.getBoundingClientRect()

    zoomAround(view, clientX - rect.left, clientY - rect.top, clampScale(view.scale * scale, GESTURE_MIN_SCALE))
  }

  window.addEventListener('gesturestart', swallow, { passive: false })
  window.addEventListener('gesturechange', onChange, { passive: false })
  window.addEventListener('gestureend', swallow, { passive: false })

  return () => {
    window.removeEventListener('gesturestart', swallow)
    window.removeEventListener('gesturechange', onChange)
    window.removeEventListener('gestureend', swallow)
  }
}

function attachWheel({ viewRef, minScaleRef }: WallRefs, canvasEl: HTMLCanvasElement): () => void {
  const onWheel = (event: WheelEvent): void => {
    if (!isInside(canvasEl, event.target)) return

    event.preventDefault()

    const view = viewRef.current

    if (event.ctrlKey || event.metaKey) {
      // pinch (trackpad) or ctrl+wheel: zoom at the cursor
      const rect = canvasEl.getBoundingClientRect()
      const next = clampScale(view.scale * Math.exp(-event.deltaY * 0.0015), minScaleRef.current)

      zoomAround(view, event.clientX - rect.left, event.clientY - rect.top, next)
    } else {
      // plain wheel / two-finger scroll: pan
      view.offsetX -= event.deltaX
      view.offsetY -= event.deltaY
    }
  }

  // Window level (gated to the canvas) so trackpad pinch over the page chrome
  // doesn't zoom the whole page — the canvas alone handles it.
  window.addEventListener('wheel', onWheel, { passive: false })

  return () => window.removeEventListener('wheel', onWheel)
}

function isInside(canvasEl: HTMLCanvasElement, target: EventTarget | null): boolean {
  return target === canvasEl || (target instanceof Node && canvasEl.contains(target))
}

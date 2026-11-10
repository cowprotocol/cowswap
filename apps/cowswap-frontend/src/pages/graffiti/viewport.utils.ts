import { CANVAS } from './raster.utils'

import type { Plot, PlotDims, View } from './wall.types'

export const MAX_SCALE = 40
const FALLBACK_MIN_SCALE = 0.06

/** Fraction of the canvas the frame should fill when zoomed to it. */
const FRAME_FILL = 0.8

export function clampScale(scale: number, min: number): number {
  return Math.min(MAX_SCALE, Math.max(min, scale))
}

/** Zoom-out floor: at least the whole wall fits. */
export function computeMinScale(canvasEl: HTMLCanvasElement | null): number {
  if (!canvasEl) return FALLBACK_MIN_SCALE

  return Math.min(canvasEl.clientWidth / CANVAS.w, canvasEl.clientHeight / CANVAS.h)
}

/**
 * A view that fills the stage on both axes, centred. The wall is 2:1 and the stage
 * rarely is, so the longer axis overflows and is reached by panning.
 */
export function coverView(canvasEl: HTMLCanvasElement): View {
  return centredView(canvasEl, Math.max(canvasEl.clientWidth / CANVAS.w, canvasEl.clientHeight / CANVAS.h))
}

/** A view that fits the whole wall, centred. Letterboxes the axis the wall is shorter on. */
export function fitView(canvasEl: HTMLCanvasElement): View {
  return centredView(canvasEl, computeMinScale(canvasEl))
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

function centredView(canvasEl: HTMLCanvasElement, scale: number): View {
  return {
    scale,
    offsetX: (canvasEl.clientWidth - CANVAS.w * scale) / 2,
    offsetY: (canvasEl.clientHeight - CANVAS.h * scale) / 2,
  }
}

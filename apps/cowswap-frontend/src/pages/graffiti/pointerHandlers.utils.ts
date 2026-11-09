import type { Dispatch, PointerEvent as ReactPointerEvent, SetStateAction } from 'react'

import { CANVAS, hexToColor, type Point, rasterizeStroke, rasterizeText, textFontSize } from './raster.utils'
import { clampScale, zoomAround } from './viewport.utils'

import type { Draft, Plot, PlotDims, Tool, WallRefs } from './wall.types'

export type CanvasPointerEvent = ReactPointerEvent<HTMLCanvasElement>

/** What the handlers need besides the refs: the latest tool state and setters. */
export interface PointerContext {
  refs: WallRefs
  tool: Tool
  busy: boolean
  loaded: boolean
  brushSize: number
  color: string
  label: string
  plotDims: PlotDims
  wallColorAt: (x: number, y: number) => number
  pushHistory: () => void
  setDraft: Dispatch<SetStateAction<Draft>>
  setPlot: Dispatch<SetStateAction<Plot | null>>
  setLiveCost: (cost: number) => void
  resetPhase: () => void
}

/** Wheel zoom feel: spreading +100px ≈ ×1.42 regardless of how close the fingers started. */
const PINCH_SENSITIVITY = 0.0035
/** Cap on how far one pinch sample may change the scale. */
const PINCH_STEP_LIMIT = 1.05
/** Extra grab margin around the frame, in wall cells. */
const FRAME_GRAB_MARGIN = 8
/** Ignore pointer moves shorter than this, in wall cells. */
const MIN_STROKE_STEP = 0.75
const ERASE_COLOR = '#000000'

export function handlePointerDown(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { pointersRef, pinchActiveRef, panningRef } = ctx.refs

  // Multi-touch bookkeeping: two fingers = pinch-zoom + pan, never draw.
  pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointersRef.current.size >= 2) return beginPinch(ctx)
  if (pinchActiveRef.current) return

  if (ctx.tool === 'text') return stampText(event, ctx)
  if (tryGrabPlot(event, ctx)) return

  if (ctx.tool === 'pan' || event.button === 1 || event.button === 2) {
    panningRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)

    return
  }

  beginStroke(event, ctx)
}

export function handlePointerMove(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { pointersRef, pinchActiveRef, pinchPrevRef, movingPlotRef, panningRef, viewRef } = ctx.refs

  if (pointersRef.current.has(event.pointerId)) {
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
  }

  if (pinchActiveRef.current && pointersRef.current.size >= 2) {
    if (pinchPrevRef.current) applyPinch(ctx, pinchPrevRef.current)

    return
  }

  if (movingPlotRef.current) return moveFrame(event, ctx)

  if (panningRef.current) {
    viewRef.current.offsetX += event.movementX
    viewRef.current.offsetY += event.movementY

    return
  }

  extendStroke(event, ctx)
}

export function handlePointerUp(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { pointersRef, pinchActiveRef, pinchPrevRef, movingPlotRef, panningRef, drawingRef } = ctx.refs

  // multi-touch teardown
  pointersRef.current.delete(event.pointerId)

  if (pointersRef.current.size < 2) {
    pinchActiveRef.current = false
    pinchPrevRef.current = null
  }

  try {
    event.currentTarget.releasePointerCapture(event.pointerId)
  } catch {
    // pointer wasn't captured (e.g. second finger of a pinch) — fine
  }

  if (movingPlotRef.current) {
    movingPlotRef.current = null

    return
  }

  if (pinchActiveRef.current || pointersRef.current.size > 0) return

  if (panningRef.current) {
    panningRef.current = false

    return
  }

  if (!drawingRef.current) return

  drawingRef.current = false
  finishStroke(ctx)
}

export function screenToCanvas({ canvasElRef, viewRef }: WallRefs, clientX: number, clientY: number): Point {
  const canvasEl = canvasElRef.current

  if (!canvasEl) return { x: 0, y: 0 }

  const rect = canvasEl.getBoundingClientRect()
  const view = viewRef.current

  return {
    x: (clientX - rect.left - view.offsetX) / view.scale,
    y: (clientY - rect.top - view.offsetY) / view.scale,
  }
}

/** Two-finger pinch zooms by pixels moved, and pans by the midpoint delta. */
function applyPinch(ctx: PointerContext, prev: { dist: number; midX: number; midY: number }): void {
  const { pointersRef, canvasElRef, viewRef, minScaleRef, pinchPrevRef } = ctx.refs
  const [a, b] = Array.from(pointersRef.current.values())
  const dist = Math.hypot(a.x - b.x, a.y - b.y)
  const midX = (a.x + b.x) / 2
  const midY = (a.y + b.y) / 2
  const canvasEl = canvasElRef.current
  const view = viewRef.current

  if (canvasEl) {
    const target = clampScale(view.scale * Math.exp((dist - prev.dist) * PINCH_SENSITIVITY), minScaleRef.current)
    const next = Math.min(view.scale * PINCH_STEP_LIMIT, Math.max(view.scale / PINCH_STEP_LIMIT, target))
    const rect = canvasEl.getBoundingClientRect()

    zoomAround(view, midX - rect.left, midY - rect.top, next)
  }

  view.offsetX += midX - prev.midX
  view.offsetY += midY - prev.midY
  pinchPrevRef.current = { dist, midX, midY }
}

/** A second finger cancels any stroke: the pinch owns two-finger input from here. */
function beginPinch(ctx: PointerContext): void {
  const { drawingRef, strokePointsRef, panningRef, pinchActiveRef, pinchPrevRef, pointersRef } = ctx.refs
  const [a, b] = Array.from(pointersRef.current.values())

  drawingRef.current = false
  strokePointsRef.current = []
  ctx.setLiveCost(0)
  panningRef.current = false
  pinchActiveRef.current = true
  pinchPrevRef.current = {
    dist: Math.hypot(a.x - b.x, a.y - b.y),
    midX: (a.x + b.x) / 2,
    midY: (a.y + b.y) / 2,
  }
}

function beginStroke(event: CanvasPointerEvent, ctx: PointerContext): void {
  if (event.button !== 0 || ctx.busy || !ctx.loaded) return
  if (!ctx.refs.plotLockedRef.current) return // frame not confirmed yet

  ctx.refs.drawingRef.current = true
  ctx.refs.strokePointsRef.current = [screenToCanvas(ctx.refs, event.clientX, event.clientY)]
  ctx.resetPhase()
  ctx.setLiveCost(0)
  event.currentTarget.setPointerCapture(event.pointerId)
}

/**
 * Add cells to the draft. Only cells inside the frame that change the wall are
 * kept: no-op writes (erasing black, repainting the same colour) are free, so
 * they are never drafted.
 */
function commitCells(ctx: PointerContext, cells: Array<Point>, colorNum: number): void {
  const plot = ctx.refs.plotRef.current
  const dims = ctx.plotDims(plot)
  const changing = cells.filter((c) => isInsidePlot(c, plot, dims) && ctx.wallColorAt(c.x, c.y) !== colorNum)

  if (changing.length === 0) return

  ctx.pushHistory()
  ctx.setDraft((prev) => {
    const next = new Map(prev)

    for (const c of changing) next.set(c.y * CANVAS.w + c.x, colorNum)

    return next
  })
}

function extendStroke(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { drawingRef, strokePointsRef } = ctx.refs

  if (!drawingRef.current) return

  const point = screenToCanvas(ctx.refs, event.clientX, event.clientY)
  const points = strokePointsRef.current
  const last = points[points.length - 1]

  if (last && Math.hypot(point.x - last.x, point.y - last.y) < MIN_STROKE_STEP) return

  points.push(point)
  ctx.setLiveCost(rasterizeStroke(points, ctx.brushSize, CANVAS).cells.length)
}

function finishStroke(ctx: PointerContext): void {
  const { strokePointsRef } = ctx.refs
  const { cells } = rasterizeStroke(strokePointsRef.current, ctx.brushSize, CANVAS)

  ctx.setLiveCost(0)

  if (cells.length > 0) commitCells(ctx, cells, hexToColor(ctx.tool === 'erase' ? ERASE_COLOR : ctx.color))

  strokePointsRef.current = []
}

function isInsidePlot(cell: Point, plot: Plot | null, dims: [number, number]): boolean {
  return !plot || (cell.x >= plot.x && cell.x < plot.x + dims[0] && cell.y >= plot.y && cell.y < plot.y + dims[1])
}

/** Drag the unconfirmed frame, kept inside the wall. */
function moveFrame(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { movingPlotRef, plotRef, canvasElRef } = ctx.refs
  const moving = movingPlotRef.current

  if (!moving || !canvasElRef.current) return

  const at = screenToCanvas(ctx.refs, event.clientX, event.clientY)
  const plot = plotRef.current
  const [pw, ph] = ctx.plotDims(plot)

  ctx.setPlot({
    x: Math.max(0, Math.min(CANVAS.w - pw, Math.round(at.x - moving.dx))),
    y: Math.max(0, Math.min(CANVAS.h - ph, Math.round(at.y - moving.dy))),
    vertical: plot?.vertical,
  })
}

/** Stamp the label as wall cells at the tap point, clipped to the frame. */
function stampText(event: CanvasPointerEvent, ctx: PointerContext): void {
  if (event.button !== 0 || ctx.busy || !ctx.loaded || !ctx.refs.plotLockedRef.current) return

  const text = ctx.label.trim()

  if (!text) return

  const at = screenToCanvas(ctx.refs, event.clientX, event.clientY)
  const cells = rasterizeText(text, at.x, at.y, textFontSize(ctx.brushSize), CANVAS)

  commitCells(ctx, cells, hexToColor(ctx.color))
}

/**
 * Before confirmation the frame is freely draggable by grabbing anywhere inside
 * it. Returns true when a drag started.
 */
function tryGrabPlot(event: CanvasPointerEvent, ctx: PointerContext): boolean {
  const { plotRef, plotLockedRef, movingPlotRef } = ctx.refs
  const plot = plotRef.current

  if (plotLockedRef.current || !plot || !ctx.refs.canvasElRef.current) return false

  const at = screenToCanvas(ctx.refs, event.clientX, event.clientY)
  const [pw, ph] = ctx.plotDims(plot)
  const inside =
    at.x >= plot.x - FRAME_GRAB_MARGIN &&
    at.x <= plot.x + pw + FRAME_GRAB_MARGIN &&
    at.y >= plot.y - FRAME_GRAB_MARGIN &&
    at.y <= plot.y + ph + FRAME_GRAB_MARGIN

  if (!inside) return false

  movingPlotRef.current = { dx: at.x - plot.x, dy: at.y - plot.y }
  event.currentTarget.setPointerCapture(event.pointerId)

  return true
}

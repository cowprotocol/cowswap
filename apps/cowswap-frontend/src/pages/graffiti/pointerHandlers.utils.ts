import type { Dispatch, PointerEvent as ReactPointerEvent, SetStateAction } from 'react'

import { CANVAS, hexToColor, type Point, rasterizeStroke, rasterizeText, textFontSize } from './raster.utils'

import type { Draft, Plot, WallRefs } from './wall.types'

export type CanvasPointerEvent = ReactPointerEvent<HTMLCanvasElement>

/**
 * What the handlers need besides the live refs. Tool and session state is read
 * from `refs.snapshotRef`, so this object is stable for the page's lifetime.
 */
export interface PointerContext {
  refs: WallRefs
  wallColorAt: (x: number, y: number) => number
  pushHistory: () => void
  setDraft: Dispatch<SetStateAction<Draft>>
  setPlot: Dispatch<SetStateAction<Plot | null>>
  setLiveCost: (cost: number) => void
  resetPhase: () => void
}

/** Extra grab margin around the frame, in wall cells. */
const FRAME_GRAB_MARGIN = 8
/** Ignore pointer moves shorter than this, in wall cells. */
const MIN_STROKE_STEP = 0.75
/** Abandon any stroke, pan or frame drag in progress. */
export function cancelInteraction(ctx: PointerContext): void {
  const { drawingRef, strokePointsRef, panningRef, movingPlotRef } = ctx.refs

  drawingRef.current = false
  strokePointsRef.current = []
  panningRef.current = false
  movingPlotRef.current = null
  ctx.setLiveCost(0)
  ctx.refs.requestRenderRef.current()
}

export function handlePointerDown(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { activePointersRef, pinchActiveRef, panningRef, requestRenderRef } = ctx.refs
  const { tool } = ctx.refs.snapshotRef.current

  activePointersRef.current.add(event.pointerId)

  // Two fingers are a pinch (owned by useCanvasGestures), never a stroke.
  if (activePointersRef.current.size >= 2) return cancelInteraction(ctx)
  if (pinchActiveRef.current) return

  if (tool === 'text') return stampText(event, ctx)
  if (tryGrabPlot(event, ctx)) return

  if (tool === 'pan' || event.button === 1 || event.button === 2) {
    panningRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)

    return
  }

  beginStroke(event, ctx)
  requestRenderRef.current()
}

export function handlePointerMove(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { activePointersRef, pinchActiveRef, movingPlotRef, panningRef, viewRef, requestRenderRef } = ctx.refs

  if (activePointersRef.current.size >= 2 || pinchActiveRef.current) return

  if (movingPlotRef.current) return moveFrame(event, ctx)

  if (panningRef.current) {
    viewRef.current.offsetX += event.movementX
    viewRef.current.offsetY += event.movementY
    requestRenderRef.current()

    return
  }

  extendStroke(event, ctx)
  requestRenderRef.current()
}

export function handlePointerUp(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { activePointersRef, pinchActiveRef, movingPlotRef, panningRef, drawingRef } = ctx.refs

  activePointersRef.current.delete(event.pointerId)

  try {
    event.currentTarget.releasePointerCapture(event.pointerId)
  } catch {
    // pointer wasn't captured (e.g. second finger of a pinch) — fine
  }

  if (movingPlotRef.current) {
    movingPlotRef.current = null

    return
  }

  // Fingers still down belong to a pinch that is winding down.
  if (pinchActiveRef.current || activePointersRef.current.size > 0) return

  if (panningRef.current) {
    panningRef.current = false

    return
  }

  if (!drawingRef.current) return

  drawingRef.current = false
  finishStroke(ctx)
  ctx.refs.requestRenderRef.current()
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

function beginStroke(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { busy, loaded, plotLocked } = ctx.refs.snapshotRef.current

  if (event.button !== 0 || busy || !loaded) return
  if (!plotLocked) return // frame not confirmed yet

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
  const { plot, plotDims } = ctx.refs.snapshotRef.current
  const dims = plotDims(plot)
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
  ctx.setLiveCost(rasterizeStroke(points, ctx.refs.snapshotRef.current.brushSize, CANVAS).cells.length)
}

function finishStroke(ctx: PointerContext): void {
  const { strokePointsRef } = ctx.refs
  const { brushSize, color } = ctx.refs.snapshotRef.current
  const { cells } = rasterizeStroke(strokePointsRef.current, brushSize, CANVAS)

  ctx.setLiveCost(0)

  if (cells.length > 0) commitCells(ctx, cells, hexToColor(color))

  strokePointsRef.current = []
}

function isInsidePlot(cell: Point, plot: Plot | null, dims: [number, number]): boolean {
  return !plot || (cell.x >= plot.x && cell.x < plot.x + dims[0] && cell.y >= plot.y && cell.y < plot.y + dims[1])
}

/** Drag the unconfirmed frame, kept inside the wall. */
function moveFrame(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { movingPlotRef, canvasElRef } = ctx.refs
  const { plot, plotDims } = ctx.refs.snapshotRef.current
  const moving = movingPlotRef.current

  if (!moving || !canvasElRef.current) return

  const at = screenToCanvas(ctx.refs, event.clientX, event.clientY)
  const [pw, ph] = plotDims(plot)

  ctx.setPlot({
    x: Math.max(0, Math.min(CANVAS.w - pw, Math.round(at.x - moving.dx))),
    y: Math.max(0, Math.min(CANVAS.h - ph, Math.round(at.y - moving.dy))),
    vertical: plot?.vertical,
  })
}

/** Stamp the label as wall cells at the tap point, clipped to the frame. */
function stampText(event: CanvasPointerEvent, ctx: PointerContext): void {
  const { busy, loaded, plotLocked, label, brushSize, color } = ctx.refs.snapshotRef.current

  if (event.button !== 0 || busy || !loaded || !plotLocked) return

  const text = label.trim()

  if (!text) return

  const at = screenToCanvas(ctx.refs, event.clientX, event.clientY)
  const cells = rasterizeText(text, at.x, at.y, textFontSize(brushSize), CANVAS)

  commitCells(ctx, cells, hexToColor(color))
}

/**
 * Before confirmation the frame is freely draggable by grabbing anywhere inside
 * it. Returns true when a drag started.
 */
function tryGrabPlot(event: CanvasPointerEvent, ctx: PointerContext): boolean {
  const { movingPlotRef, canvasElRef } = ctx.refs
  const { plot, plotLocked, plotDims } = ctx.refs.snapshotRef.current

  if (plotLocked || !plot || !canvasElRef.current) return false

  const at = screenToCanvas(ctx.refs, event.clientX, event.clientY)
  const [pw, ph] = plotDims(plot)
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

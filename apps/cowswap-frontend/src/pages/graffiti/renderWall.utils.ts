// The wall's requestAnimationFrame render pass.
//
// Everything it needs arrives through refs: the loop runs for the page's
// lifetime and must not be torn down each time a tool or colour changes, so it
// may never close over state directly.

import { CANVAS, colorToHex, rasterizeStroke } from './raster.utils'

import type { View, WallRefs } from './wall.types'

export type Plot = { x: number; y: number; vertical?: boolean }

export type Session = 'start' | 'place' | 'paint'
export type Tool = 'draw' | 'pan' | 'erase' | 'text'
/** The slice of the shared refs the render pass reads and writes. */
export type WallRenderRefs = Pick<
  WallRefs,
  | 'canvasElRef'
  | 'wrapElRef'
  | 'offscreenRef'
  | 'pixelsRef'
  | 'dirtyRef'
  | 'viewRef'
  | 'draftRef'
  | 'drawingRef'
  | 'strokePointsRef'
  | 'brushSizeRef'
  | 'colorRef'
  | 'toolRef'
  | 'plotRef'
  | 'plotDimsRef'
  | 'plotLockedRef'
  | 'plotOverlayRef'
  | 'patternRef'
  | 'sessionRef'
  | 'fullscreenRef'
>

/** Grid lines appear only once cells are big enough to see between them. */
const GRID_MIN_SCALE = 6
const GRID_STEP = 8

/** Fill a run of wall cells as screen-space rectangles. */
export function fillCellRects(ctx: CanvasRenderingContext2D, cells: Array<{ x: number; y: number }>, view: View): void {
  ctx.beginPath()

  for (const c of cells) {
    ctx.rect(
      view.offsetX + c.x * view.scale,
      view.offsetY + c.y * view.scale,
      Math.ceil(view.scale),
      Math.ceil(view.scale),
    )
  }

  ctx.fill()
}

/** One frame of the wall. Safe to call when nothing is mounted yet. */
export function renderWall(refs: WallRenderRefs): void {
  const canvasEl = refs.canvasElRef.current
  const wrapEl = refs.wrapElRef.current
  const offscreen = refs.offscreenRef.current

  if (!canvasEl || !wrapEl || !offscreen) return

  if (canvasEl.width !== wrapEl.clientWidth || canvasEl.height !== wrapEl.clientHeight) {
    canvasEl.width = wrapEl.clientWidth
    canvasEl.height = wrapEl.clientHeight
    refs.dirtyRef.current = true
  }

  syncOffscreen(refs)

  const ctx = canvasEl.getContext('2d')

  if (!ctx) return

  const view = refs.viewRef.current

  ctx.fillStyle = '#0a0a12'
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)
  ctx.imageSmoothingEnabled = false

  if (!refs.patternRef.current) refs.patternRef.current = backdropPattern(ctx)

  if (refs.patternRef.current) {
    ctx.fillStyle = refs.patternRef.current
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)
  }

  ctx.drawImage(offscreen, view.offsetX, view.offsetY, CANVAS.w * view.scale, CANVAS.h * view.scale)

  drawGrid(ctx, view)
  drawDraft(ctx, refs.draftRef.current, view)
  drawPlotFrame(ctx, refs)
  drawStrokePreview(ctx, refs)
}

/** Diagonal hatch marking everything that is not the wall. */
function backdropPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const tile = document.createElement('canvas')

  tile.width = 16
  tile.height = 16

  const tctx = tile.getContext('2d')

  if (!tctx) return null

  tctx.fillStyle = '#12121f'
  tctx.fillRect(0, 0, 16, 16)
  tctx.strokeStyle = 'rgba(255,255,255,0.09)'
  tctx.beginPath()
  tctx.moveTo(-4, 20)
  tctx.lineTo(20, -4)
  tctx.moveTo(-4, 4)
  tctx.lineTo(4, -4)
  tctx.moveTo(12, 20)
  tctx.lineTo(20, 12)
  tctx.stroke()

  return ctx.createPattern(tile, 'repeat')
}

/** Dim everything outside the plot so the painter's area reads clearly. */
function dimOutsidePlot(
  ctx: CanvasRenderingContext2D,
  box: { sx: number; sy: number; sw: number; sh: number },
  canvasW: number,
  canvasH: number,
): void {
  const { sx, sy, sw, sh } = box

  ctx.save()

  for (const fill of ['rgba(0,0,0,0.55)', 'rgba(255,255,255,0.05)']) {
    ctx.fillStyle = fill
    ctx.fillRect(0, 0, canvasW, sy)
    ctx.fillRect(0, sy + sh, canvasW, canvasH - sy - sh)
    ctx.fillRect(0, sy, sx, sh)
    ctx.fillRect(sx + sw, sy, canvasW - sx - sw, sh)
  }

  ctx.restore()
}

/** Cells committed to the draft but not yet burned, grouped by colour. */
function drawDraft(ctx: CanvasRenderingContext2D, draft: Map<number, number>, view: View): void {
  if (draft.size === 0) return

  ctx.globalAlpha = 0.95

  const byColor = new Map<number, Array<{ x: number; y: number }>>()

  draft.forEach((color, idx) => {
    const arr = byColor.get(color) ?? []

    arr.push({ x: idx % CANVAS.w, y: Math.floor(idx / CANVAS.w) })
    byColor.set(color, arr)
  })

  byColor.forEach((cells, color) => {
    ctx.fillStyle = colorToHex(color)
    fillCellRects(ctx, cells, view)
  })

  ctx.globalAlpha = 1
}

function drawGrid(ctx: CanvasRenderingContext2D, view: View): void {
  if (view.scale < GRID_MIN_SCALE) return

  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  ctx.beginPath()

  for (let i = 0; i <= CANVAS.w; i += GRID_STEP) {
    const gx = view.offsetX + i * view.scale

    ctx.moveTo(gx, view.offsetY)
    ctx.lineTo(gx, view.offsetY + CANVAS.h * view.scale)
  }

  for (let j = 0; j <= CANVAS.h; j += GRID_STEP) {
    const gy = view.offsetY + j * view.scale

    ctx.moveTo(view.offsetX, gy)
    ctx.lineTo(view.offsetX + CANVAS.w * view.scale, gy)
  }

  ctx.stroke()
}

function drawPlotFrame(ctx: CanvasRenderingContext2D, refs: WallRenderRefs): void {
  const plot = refs.plotRef.current
  const canvasEl = refs.canvasElRef.current

  if (!plot || !canvasEl) return
  if (refs.toolRef.current === 'pan' || refs.sessionRef.current === 'start' || refs.fullscreenRef.current) return

  const view = refs.viewRef.current
  const [plotW, plotH] = refs.plotDimsRef.current(plot)
  const box = {
    sx: view.offsetX + plot.x * view.scale,
    sy: view.offsetY + plot.y * view.scale,
    sw: plotW * view.scale,
    sh: plotH * view.scale,
  }
  const canvasW = canvasEl.clientWidth
  const canvasH = canvasEl.clientHeight

  dimOutsidePlot(ctx, box, canvasW, canvasH)

  const locked = refs.plotLockedRef.current

  ctx.save()
  ctx.lineWidth = 2

  if (locked) {
    ctx.strokeStyle = 'rgba(0,255,163,0.9)'
    ctx.setLineDash([])
  } else {
    ctx.strokeStyle = 'rgba(0,208,255,0.9)'
    ctx.setLineDash([8, 6])
    // Marching ants: the dash offset advances with wall-clock time.
    ctx.lineDashOffset = (Date.now() / 60) % 14
  }

  ctx.strokeRect(box.sx, box.sy, box.sw, box.sh)
  ctx.restore()

  // Keep the balance chip + confirm button pinned just above the frame.
  const overlay = refs.plotOverlayRef.current

  if (overlay) {
    overlay.style.left = `${Math.max(6, Math.min(canvasW - 240, box.sx))}px`
    overlay.style.top = `${Math.max(6, box.sy - 44)}px`
  }

  if (!locked) {
    ctx.save()
    ctx.font = '12px sans-serif'
    ctx.fillStyle = 'rgba(200,200,221,0.9)'
    ctx.fillText(
      'drag the frame to position it · ✓ to lock',
      box.sx + 8,
      box.sy - 6 > 12 ? box.sy - 6 : box.sy + box.sh + 14,
    )
    ctx.restore()
  }
}

/** The in-progress stroke, clipped to the plot so it cannot preview outside. */
function drawStrokePreview(ctx: CanvasRenderingContext2D, refs: WallRenderRefs): void {
  const live = refs.strokePointsRef.current

  if (live.length === 0 || !refs.drawingRef.current) return

  const { outline } = rasterizeStroke(live, refs.brushSizeRef.current, CANVAS)
  const view = refs.viewRef.current
  const plot = refs.plotRef.current

  if (plot) {
    const [plotW, plotH] = refs.plotDimsRef.current(plot)

    ctx.save()
    ctx.beginPath()
    ctx.rect(
      view.offsetX + plot.x * view.scale,
      view.offsetY + plot.y * view.scale,
      plotW * view.scale,
      plotH * view.scale,
    )
    ctx.clip()
  }

  ctx.globalAlpha = 0.6
  ctx.fillStyle = refs.colorRef.current
  ctx.beginPath()

  outline.forEach((p, idx) => {
    const sx = view.offsetX + p.x * view.scale
    const sy = view.offsetY + p.y * view.scale

    if (idx === 0) ctx.moveTo(sx, sy)
    else ctx.lineTo(sx, sy)
  })

  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  if (plot) ctx.restore()
}

/** Push the wall's pixel buffer into the offscreen canvas when it changed. */
function syncOffscreen(refs: WallRenderRefs): void {
  const offscreen = refs.offscreenRef.current

  if (!refs.dirtyRef.current || !offscreen) return

  // The wall size is only known once /v1/info arrives, after the canvas was created.
  if (offscreen.width !== CANVAS.w || offscreen.height !== CANVAS.h) {
    offscreen.width = CANVAS.w
    offscreen.height = CANVAS.h
  }

  const octx = offscreen.getContext('2d')

  if (octx) {
    const imageData = octx.createImageData(CANVAS.w, CANVAS.h)

    imageData.data.set(refs.pixelsRef.current)
    octx.putImageData(imageData, 0, 0)
  }

  refs.dirtyRef.current = false
}

// The wall's requestAnimationFrame render pass.
//
// Everything it needs arrives through refs: the pass runs outside React and
// must never close over state directly. React state reaches it through
// `snapshotRef`, published after every commit.
//
// Two stacked canvases. The paint layer holds only wall pixels, so it can carry
// a CSS blend mode and mix with the CoW Swap background behind the page; the
// chrome layer above it stays unblended, keeping the grid, the plot frame and
// its dimming readable whatever the paint layer does.

import { CANVAS, colorToHex, rasterizeStroke } from './raster.utils'

import type { View, WallRefs, WallSnapshot } from './wall.types'

/** The slice of the shared refs the render pass reads and writes. */
export type WallRenderRefs = Pick<
  WallRefs,
  | 'snapshotRef'
  | 'canvasElRef'
  | 'paintCanvasElRef'
  | 'wrapElRef'
  | 'offscreenRef'
  | 'pixelsRef'
  | 'dirtyRef'
  | 'viewRef'
  | 'drawingRef'
  | 'strokePointsRef'
  | 'plotOverlayRef'
  | 'plotConfirmRef'
  | 'patternRef'
>

/** Whether the frame outline is on screen, which is the only drawn animation. */
export function needsContinuousRender(snapshot: WallSnapshot): boolean {
  return isPlotFrameVisible(snapshot) && !snapshot.plotLocked
}

function isPlotFrameVisible(snapshot: WallSnapshot): boolean {
  return snapshot.plot !== null && snapshot.tool !== 'pan' && snapshot.session !== 'start' && !snapshot.fullscreen
}

/** Half the centred confirm button, so clamping it to the canvas keeps it whole. */
const CONFIRM_MARGIN_X = 90
const CONFIRM_MARGIN_Y = 28

/** Grid lines appear only once cells are big enough to see between them. */
const GRID_MIN_SCALE = 6
const GRID_STEP = 8

/** The eraser's colour. Erased cells fall back to the page background, not to black. */
const ERASED = 0

/**
 * Where the confirm button sits: the centre of the frame, pulled back inside the
 * canvas by half the button's footprint so it stays whole and clickable when the
 * frame is dragged past an edge or is larger than the viewport.
 */
export function confirmAnchor(
  box: { sx: number; sy: number; sw: number; sh: number },
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  return {
    x: clamp(box.sx + box.sw / 2, CONFIRM_MARGIN_X, Math.max(CONFIRM_MARGIN_X, canvasW - CONFIRM_MARGIN_X)),
    y: clamp(box.sy + box.sh / 2, CONFIRM_MARGIN_Y, Math.max(CONFIRM_MARGIN_Y, canvasH - CONFIRM_MARGIN_Y)),
  }
}

/**
 * Capped at 2: every frame redraws a 4096x2048 offscreen, and a 3x backing store
 * on a large display costs more fill than the extra sharpness is worth.
 */
export function devicePixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, 2)
}

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
  const chromeEl = refs.canvasElRef.current
  const paintEl = refs.paintCanvasElRef.current
  const wrapEl = refs.wrapElRef.current
  const offscreen = refs.offscreenRef.current

  if (!chromeEl || !paintEl || !wrapEl || !offscreen) return

  const dpr = devicePixelRatio()
  const width = wrapEl.clientWidth
  const height = wrapEl.clientHeight

  // `||` would short-circuit and leave the second canvas at the stale size.
  if ([resizeCanvas(chromeEl, width, height, dpr), resizeCanvas(paintEl, width, height, dpr)].some(Boolean)) {
    refs.dirtyRef.current = true
  }

  syncOffscreen(refs)

  const paint = paintEl.getContext('2d')
  const chrome = chromeEl.getContext('2d')

  if (!paint || !chrome) return

  // Both layers draw in CSS pixels, which is what the view maths and the pointer
  // hit-testing use; the transform is what turns the extra device pixels into
  // sharper edges rather than a different coordinate space.
  paint.setTransform(dpr, 0, 0, dpr, 0, 0)
  chrome.setTransform(dpr, 0, 0, dpr, 0, 0)

  const view = refs.viewRef.current

  paint.clearRect(0, 0, width, height)
  paint.imageSmoothingEnabled = false
  paint.drawImage(offscreen, view.offsetX, view.offsetY, CANVAS.w * view.scale, CANVAS.h * view.scale)
  drawDraft(paint, refs.snapshotRef.current.draft, view)
  drawStrokePreview(paint, refs)

  chrome.clearRect(0, 0, width, height)
  chrome.imageSmoothingEnabled = false
  drawBackdrop(chrome, refs, view)
  drawGrid(chrome, view)
  drawPlotFrame(chrome, refs)
}

/** Diagonal hatch marking everything that is not the wall. */
function backdropPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const tile = document.createElement('canvas')

  tile.width = 16
  tile.height = 16

  const tctx = tile.getContext('2d')

  if (!tctx) return null

  // The tile stays transparent apart from the hatch so the page shows through.
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
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
function drawBackdrop(ctx: CanvasRenderingContext2D, refs: WallRenderRefs, view: View): void {
  if (!refs.patternRef.current) refs.patternRef.current = backdropPattern(ctx)

  const pattern = refs.patternRef.current

  if (!pattern) return

  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight)
  ctx.clearRect(view.offsetX, view.offsetY, CANVAS.w * view.scale, CANVAS.h * view.scale)
}

function drawDraft(ctx: CanvasRenderingContext2D, draft: Map<number, number>, view: View): void {
  if (draft.size === 0) return

  const byColor = new Map<number, Array<{ x: number; y: number }>>()

  draft.forEach((color, idx) => {
    const arr = byColor.get(color) ?? []

    arr.push({ x: idx % CANVAS.w, y: Math.floor(idx / CANVAS.w) })
    byColor.set(color, arr)
  })

  byColor.forEach((cells, color) => {
    ctx.save()

    if (color === ERASED) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = '#000000'
    } else {
      ctx.globalAlpha = 0.95
      ctx.fillStyle = colorToHex(color)
    }

    fillCellRects(ctx, cells, view)
    ctx.restore()
  })
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
  const snapshot = refs.snapshotRef.current
  const plot = snapshot.plot
  const canvasEl = refs.canvasElRef.current

  if (!plot || !canvasEl || !isPlotFrameVisible(snapshot)) return

  const view = refs.viewRef.current
  const [plotW, plotH] = snapshot.plotDims(plot)
  const box = {
    sx: view.offsetX + plot.x * view.scale,
    sy: view.offsetY + plot.y * view.scale,
    sw: plotW * view.scale,
    sh: plotH * view.scale,
  }
  const canvasW = canvasEl.clientWidth
  const canvasH = canvasEl.clientHeight

  dimOutsidePlot(ctx, box, canvasW, canvasH)

  const locked = snapshot.plotLocked

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

  // Keep the balance chip + rotate button pinned just above the frame.
  const overlay = refs.plotOverlayRef.current

  if (overlay) {
    overlay.style.left = `${Math.max(6, Math.min(canvasW - 240, box.sx))}px`
    overlay.style.top = `${Math.max(6, box.sy - 44)}px`
  }

  const confirm = refs.plotConfirmRef.current

  if (confirm) {
    const anchor = confirmAnchor(box, canvasW, canvasH)

    confirm.style.left = `${anchor.x}px`
    confirm.style.top = `${anchor.y}px`
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

  const snapshot = refs.snapshotRef.current
  const { outline } = rasterizeStroke(live, snapshot.brushSize, CANVAS)
  const view = refs.viewRef.current
  const plot = snapshot.plot

  ctx.save()

  if (plot) {
    const [plotW, plotH] = snapshot.plotDims(plot)

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

  if (snapshot.tool === 'erase') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = '#000000'
  } else {
    ctx.fillStyle = snapshot.color
  }

  ctx.beginPath()

  outline.forEach((p, idx) => {
    const sx = view.offsetX + p.x * view.scale
    const sy = view.offsetY + p.y * view.scale

    if (idx === 0) ctx.moveTo(sx, sy)
    else ctx.lineTo(sx, sy)
  })

  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/** Match a canvas to the wrapper, reporting whether it had to change. */
function resizeCanvas(el: HTMLCanvasElement, width: number, height: number, dpr: number): boolean {
  const deviceWidth = Math.round(width * dpr)
  const deviceHeight = Math.round(height * dpr)

  if (el.width === deviceWidth && el.height === deviceHeight) return false

  el.width = deviceWidth
  el.height = deviceHeight

  return true
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

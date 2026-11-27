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
  | 'patternRef'
>

/** Whether the frame outline is on screen, which is the only drawn animation. */
export function needsContinuousRender(snapshot: WallSnapshot): boolean {
  return isPlotFrameVisible(snapshot) && !snapshot.plotLocked
}

function isPlotFrameVisible(snapshot: WallSnapshot): boolean {
  return snapshot.plot !== null && snapshot.tool !== 'pan' && snapshot.session !== 'start' && !snapshot.fullscreen
}

/** Grid lines appear only once cells are big enough to see between them. */
const GRID_MIN_SCALE = 6
const GRID_STEP = 8

/** The eraser's colour. Erased cells fall back to the page background, not to black. */
const ERASED = 0

/** The frame in screen pixels. */
interface ScreenBox {
  sx: number
  sy: number
  sw: number
  sh: number
}

/** Mutes the page beyond the wall, which carries diagonal stripes of its own. */
const OFF_WALL_VEIL = 'rgba(5,6,11,0.82)'
const WALL_EDGE = 'rgba(0,255,163,0.85)'
const WALL_EDGE_GLOW = 'rgba(0,255,163,0.45)'

/** Veil over everything outside the plot. Alpha leaves the surrounding wall art readable. */
const OUTSIDE_VEIL = 'rgba(10,11,14,0.68)'

/** Tallest child of the control row, which hangs above the frame. */
const OVERLAY_HEIGHT = 46

const FRAME_HINT = '✥ drag the frame to move your drawing area · ✓ draw here when it fits'
const HINT_HEIGHT = 26
const HINT_GAP = 10
/** Below this the frame is too small on screen to hold the move cross legibly. */
const MOVE_GLYPH_MIN = 26
const MOVE_GLYPH_MAX = 72

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
  drawWallEdge(chrome, view)
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

/**
 * Dim everything outside the plot so the painter's area reads clearly. A neutral
 * grey rather than black: the page background is already near-black, so a black
 * veil only drains its blue channel and leaves the luminance unchanged.
 */
function dimOutsidePlot(
  ctx: CanvasRenderingContext2D,
  box: { sx: number; sy: number; sw: number; sh: number },
  canvasW: number,
  canvasH: number,
): void {
  const { sx, sy, sw, sh } = box

  ctx.save()
  ctx.fillStyle = OUTSIDE_VEIL
  ctx.fillRect(0, 0, canvasW, sy)
  ctx.fillRect(0, sy + sh, canvasW, canvasH - sy - sh)
  ctx.fillRect(0, sy, sx, sh)
  ctx.fillRect(sx + sw, sy, canvasW - sx - sw, sh)
  ctx.restore()
}

/** Cells committed to the draft but not yet burned, grouped by colour. */
function drawBackdrop(ctx: CanvasRenderingContext2D, refs: WallRenderRefs, view: View): void {
  if (!refs.patternRef.current) refs.patternRef.current = backdropPattern(ctx)

  const pattern = refs.patternRef.current

  if (!pattern) return

  const canvasW = ctx.canvas.clientWidth
  const canvasH = ctx.canvas.clientHeight

  // The page behind the canvas is itself diagonally striped, so the hatch alone does
  // not separate wall from void. The veil flattens the page outside the wall, and
  // `clearRect` lets it through at full strength inside; that step is the boundary.
  ctx.fillStyle = OFF_WALL_VEIL
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, canvasW, canvasH)
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

/** Centred under the frame, or above it when the frame sits against the bottom edge. */
function drawFrameHint(ctx: CanvasRenderingContext2D, box: ScreenBox, canvasW: number, canvasH: number): void {
  ctx.save()
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const width = Math.min(canvasW - 12, ctx.measureText(FRAME_HINT).width + 28)
  const below = box.sy + box.sh + HINT_GAP + HINT_HEIGHT / 2
  const preferred = below < canvasH - HINT_HEIGHT / 2 ? below : box.sy - HINT_GAP - HINT_HEIGHT / 2
  const cy = clamp(preferred, HINT_HEIGHT / 2 + 6, Math.max(HINT_HEIGHT / 2 + 6, canvasH - HINT_HEIGHT / 2 - 6))
  const cx = clamp(box.sx + box.sw / 2, width / 2 + 6, Math.max(width / 2 + 6, canvasW - width / 2 - 6))

  roundedRectPath(ctx, cx - width / 2, cy - HINT_HEIGHT / 2, width, HINT_HEIGHT, HINT_HEIGHT / 2)
  ctx.fillStyle = 'rgba(10,10,16,0.85)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,208,255,0.55)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = 'rgba(226,226,240,0.95)'
  ctx.fillText(FRAME_HINT, cx, cy)
  ctx.restore()
}

/** Corner brackets, so the dashed outline reads as an object you can pick up. */
function drawGrabHandles(ctx: CanvasRenderingContext2D, box: ScreenBox): void {
  const arm = Math.min(Math.min(box.sw, box.sh) * 0.28, 26)

  if (arm < 3) return

  const corners: Array<[number, number, number, number]> = [
    [box.sx, box.sy, 1, 1],
    [box.sx + box.sw, box.sy, -1, 1],
    [box.sx, box.sy + box.sh, 1, -1],
    [box.sx + box.sw, box.sy + box.sh, -1, -1],
  ]

  ctx.save()
  ctx.strokeStyle = 'rgba(0,208,255,0.95)'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()

  for (const [x, y, dx, dy] of corners) {
    ctx.moveTo(x + dx * arm, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * arm)
  }

  ctx.stroke()
  ctx.restore()
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

/** The move cross at the frame's centre. Drawn, never a DOM node, so it cannot swallow the drag. */
function drawMoveGlyph(ctx: CanvasRenderingContext2D, box: ScreenBox): void {
  const span = Math.min(box.sw, box.sh) * 0.32

  if (span < MOVE_GLYPH_MIN) return

  const r = Math.min(span, MOVE_GLYPH_MAX) / 2
  const head = r * 0.4
  const cx = box.sx + box.sw / 2
  const cy = box.sy + box.sh / 2
  // Arrow tips sit on the axis ends; each base corner steps off by the perpendicular.
  const tips: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r + head, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(10,10,16,0.45)'
  ctx.fill()

  ctx.strokeStyle = 'rgba(0,208,255,0.95)'
  ctx.fillStyle = 'rgba(0,208,255,0.95)'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - r, cy)
  ctx.lineTo(cx + r, cy)
  ctx.moveTo(cx, cy - r)
  ctx.lineTo(cx, cy + r)
  ctx.stroke()

  for (const [dx, dy] of tips) {
    const tx = cx + dx * r
    const ty = cy + dy * r

    ctx.beginPath()
    ctx.moveTo(tx + dx * head, ty + dy * head)
    ctx.lineTo(tx - dy * head * 0.6, ty + dx * head * 0.6)
    ctx.lineTo(tx + dy * head * 0.6, ty - dx * head * 0.6)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
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

  // Keep the balance chip + confirm button pinned just above the frame.
  const overlay = refs.plotOverlayRef.current

  if (overlay) {
    overlay.style.left = `${Math.max(6, Math.min(canvasW - 240, box.sx))}px`
    overlay.style.top = `${Math.max(6, box.sy - OVERLAY_HEIGHT - 6)}px`
  }

  if (!locked) {
    drawGrabHandles(ctx, box)
    drawMoveGlyph(ctx, box)
    drawFrameHint(ctx, box, canvasW, canvasH)
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

/** The wall's own boundary. Drawn last so the plot veil cannot wash it out. */
function drawWallEdge(ctx: CanvasRenderingContext2D, view: View): void {
  ctx.save()
  ctx.lineWidth = 2
  ctx.strokeStyle = WALL_EDGE
  ctx.shadowColor = WALL_EDGE_GLOW
  ctx.shadowBlur = 12
  ctx.strokeRect(view.offsetX, view.offsetY, CANVAS.w * view.scale, CANVAS.h * view.scale)
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
/** `ctx.roundRect` is too new for some supported browsers. */
function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2)

  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

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

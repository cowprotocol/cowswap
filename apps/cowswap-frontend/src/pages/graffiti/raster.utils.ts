// Rasterization for the graffiti wall.
//
// A stroke is a list of {x, y} float points in canvas (cell) coordinates plus
// a brush size. We compute the perfect-freehand outline polygon, then set
// every grid cell whose CENTER falls inside that polygon. The same function is
// used for the live preview, the live cost counter and the final draw payload,
// so quoted cost === painted cells exactly.
//
// `rasterizeStroke` is pure and unit-testable; `rasterizeText` needs a DOM
// 2d context to measure glyphs.

import { getStroke } from 'perfect-freehand'

/** Canvas geometry — defaults match the backend. */
export const CANVAS_W_DEFAULT = 4096
export const CANVAS_H_DEFAULT = 2048

export interface CanvasSize {
  w: number
  h: number
}

/**
 * Wall geometry in use, replaced once GET /v1/info arrives. Rasterizing takes
 * the size explicitly instead of reading this, so a call made before /v1/info
 * lands cannot silently rasterize against the wrong grid.
 */
export const CANVAS: CanvasSize = { w: CANVAS_W_DEFAULT, h: CANVAS_H_DEFAULT }

/** A cell as sent to/from the backend: x, y and a 24-bit RGB color. */
export interface Cell {
  x: number
  y: number
  color: number
}

export interface Point {
  x: number
  y: number
}

export interface RasterizedStroke {
  /** Covered cells, deduped, row-major sorted — this list IS the cost. */
  cells: Array<{ x: number; y: number }>
  /** Perfect-freehand outline polygon, for painting the preview. */
  outline: Array<Point>
}

/** 24-bit number → `#rrggbb`, for canvas rendering and swatches. */
export function colorToHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`
}

/** `#rrggbb` → 24-bit number, for the draw payload. Invalid input → black. */
export function hexToColor(hex: string): number {
  const parsed = Number.parseInt(hex.replace('#', ''), 16)

  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 0xffffff) : 0
}

/**
 * Rasterize one stroke to the grid of covered cells.
 *
 * `simulatePressure` keeps the outline smooth for mouse/touch input (no real
 * pen pressure), matching how the preview is rendered.
 */
export function rasterizeStroke(points: Array<Point>, brushSize: number, size: CanvasSize): RasterizedStroke {
  if (points.length === 0) return { cells: [], outline: [] }

  const outline: Array<Point> = getStroke(
    points.map((p) => [p.x, p.y] as [number, number]),
    {
      size: brushSize,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: true,
      last: true,
    },
  ).map(([x, y]) => ({ x, y }))

  // Bounding box of the outline, clamped to the canvas — only cell centers
  // inside the bbox can be inside the polygon.
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const p of outline) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  const x0 = Math.max(0, Math.floor(minX))
  const y0 = Math.max(0, Math.floor(minY))
  const x1 = Math.min(size.w - 1, Math.ceil(maxX))
  const y1 = Math.min(size.h - 1, Math.ceil(maxY))

  const cells: Array<{ x: number; y: number }> = []

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (pointInPolygon(x + 0.5, y + 0.5, outline)) {
        cells.push({ x, y })
      }
    }
  }

  return { cells, outline }
}

/**
 * Rasterize a text label into wall cells, centered on the tap point.
 * fontPx is the glyph height in canvas cells; coverage = alpha > 128.
 */
export function rasterizeText(
  text: string,
  cx: number,
  cy: number,
  fontPx: number,
  size: CanvasSize,
): Array<{ x: number; y: number }> {
  const c = document.createElement('canvas')
  const pad = Math.ceil(fontPx * 0.35)
  c.width = Math.min(size.w, Math.ceil(text.length * fontPx * 0.75) + pad * 2)
  c.height = Math.ceil(fontPx * 1.6) + pad * 2
  const ctx = c.getContext('2d')
  if (!ctx) return []
  ctx.font = `bold ${fontPx}px sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(text, c.width / 2, c.height / 2)
  const data = ctx.getImageData(0, 0, c.width, c.height).data
  const cells: Array<{ x: number; y: number }> = []
  const ox = Math.round(cx - c.width / 2)
  const oy = Math.round(cy - c.height / 2)
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (data[(y * c.width + x) * 4 + 3] > 128) {
        const gx = ox + x
        const gy = oy + y
        if (gx >= 0 && gx < size.w && gy >= 0 && gy < size.h) cells.push({ x: gx, y: gy })
      }
    }
  }
  return cells
}

export function setCanvasSize(w: number, h: number): void {
  CANVAS.w = w
  CANVAS.h = h
}

/** Number of cells a stroke would cover — the PIXEL-token cost of painting it. */
export function strokeCost(points: Array<Point>, brushSize: number, size: CanvasSize): number {
  return rasterizeStroke(points, brushSize, size).cells.length
}

/** Glyph height, in wall cells, of stamped text for a brush size. */
export function textFontSize(brushSize: number): number {
  return Math.max(8, brushSize * 6)
}

/**
 * Ray-casting point-in-polygon test. `polygon` is a flat loop of points
 * (perfect-freehand outlines are already closed shapes).
 */
function pointInPolygon(px: number, py: number, polygon: Array<Point>): boolean {
  let inside = false
  const n = polygon.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

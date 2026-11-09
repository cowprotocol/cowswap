import { CANVAS_HEIGHT, CANVAS_WIDTH, MAX_BOX_HEIGHT, MAX_BOX_WIDTH } from './config.js'

import type { CellInput, Store } from './store.js'

export type ValidateResult = { ok: true; cells: ValidCell[] } | { ok: false; reason: string }

export interface ValidCell {
  x: number
  y: number
  rgb: number
}

interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * In-memory canvas: a CANVAS_WIDTH * CANVAS_HEIGHT * 3 RGB buffer, latest
 * write wins. Seeded from the store on boot; every accepted draw is persisted
 * with a monotonically increasing seq number before being applied.
 */
export class CanvasState {
  readonly width = CANVAS_WIDTH
  readonly height = CANVAS_HEIGHT
  readonly buf: Buffer
  /** Bumped on every applied draw, so renders can be cached against it. */
  private revision = 0

  constructor(private readonly store: Store) {
    this.buf = Buffer.alloc(this.width * this.height * 3, 0)
    // Replay history in order so the buffer matches what clients saw.
    for (const row of store.getCellsSince(0)) this.setPixel(row.x, row.y, row.rgb)
  }

  get seq(): number {
    return this.store.maxSeq()
  }

  get version(): number {
    return this.revision
  }

  private getPixel(x: number, y: number): number {
    const i = (y * this.width + x) * 3
    return (this.buf[i] << 16) | (this.buf[i + 1] << 8) | this.buf[i + 2]
  }

  private setPixel(x: number, y: number, rgb: number): void {
    const i = (y * this.width + x) * 3
    this.buf[i] = (rgb >> 16) & 0xff
    this.buf[i + 1] = (rgb >> 8) & 0xff
    this.buf[i + 2] = rgb & 0xff
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  /** Parse and bounds-check one raw cell from a request body. */
  private parseCell(raw: unknown): { ok: true; cell: ValidCell } | { ok: false; reason: string } {
    if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'invalid cell' }

    const { x, y, color } = raw as Record<string, unknown>
    const xi = Number(x)
    const yi = Number(y)
    const rgb = typeof color === 'string' ? Number.parseInt(color, 16) : Number(color)

    if (![xi, yi, rgb].every(Number.isInteger)) return { ok: false, reason: 'x, y and color must be integers' }
    if (!this.inBounds(xi, yi)) return { ok: false, reason: `cell (${xi},${yi}) out of bounds` }
    if (rgb < 0 || rgb > 0xffffff) return { ok: false, reason: 'color must be 24-bit RGB' }

    return { ok: true, cell: { x: xi, y: yi, rgb } }
  }

  /** Parse and bounds-check raw cells from a request body. */
  private parseCells(raw: unknown): ValidateResult {
    if (!Array.isArray(raw) || raw.length === 0) return { ok: false, reason: 'cells must be a non-empty array' }

    const cells: ValidCell[] = []
    for (const item of raw) {
      const parsed = this.parseCell(item)
      if (!parsed.ok) return parsed
      cells.push(parsed.cell)
    }
    return { ok: true, cells }
  }

  /**
   * Bounding box of the drawing. Accumulated in a loop rather than
   * `Math.max(...xs)`, which overflows the argument limit on large draws.
   */
  private bounds(cells: ValidCell[]): Bounds {
    const b: Bounds = {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    }
    for (const c of cells) {
      if (c.x < b.minX) b.minX = c.x
      if (c.x > b.maxX) b.maxX = c.x
      if (c.y < b.minY) b.minY = c.y
      if (c.y > b.maxY) b.maxY = c.y
    }
    return b
  }

  /** Validate raw cells; returns the chargeable cells or a reason. */
  validateCells(raw: unknown): ValidateResult {
    const parsed = this.parseCells(raw)
    if (!parsed.ok) return parsed
    const cells = parsed.cells

    const { minX, maxX, minY, maxY } = this.bounds(cells)
    const boxW = maxX - minX + 1
    const boxH = maxY - minY + 1
    // Frames come in landscape OR portrait: allow either orientation, but
    // never both dimensions large.
    if (Math.max(boxW, boxH) > MAX_BOX_WIDTH || Math.min(boxW, boxH) > MAX_BOX_HEIGHT) {
      return {
        ok: false,
        reason: `drawing too large: ${boxW}×${boxH} cells (max ${MAX_BOX_WIDTH}×${MAX_BOX_HEIGHT} or ${MAX_BOX_HEIGHT}×${MAX_BOX_WIDTH})`,
      }
    }

    // Dedupe by coordinate, last write winning, then drop no-op writes: cells
    // already showing the requested colour are free.
    const byCoord = new Map<number, ValidCell>()
    for (const c of cells) byCoord.set(c.y * this.width + c.x, c)
    const chargeable = [...byCoord.values()].filter((c) => this.getPixel(c.x, c.y) !== c.rgb)

    return { ok: true, cells: chargeable }
  }

  /** Persist and apply a validated draw. Returns the new seq. */
  applyDraw(cells: CellInput[]): number {
    const seq = this.store.appendCells(cells)
    for (const c of cells) this.setPixel(c.x, c.y, c.rgb)
    this.revision++
    return seq
  }
}

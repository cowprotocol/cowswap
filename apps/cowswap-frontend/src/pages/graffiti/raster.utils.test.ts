import { colorToHex, hexToColor, rasterizeStroke, strokeCost, type CanvasSize, type Point } from './raster.utils'

const SIZE: CanvasSize = { w: 256, h: 256 }

/** A straight horizontal stroke, sampled densely enough to be continuous. */
function line(from: Point, to: Point, steps = 20): Array<Point> {
  return Array.from({ length: steps + 1 }, (_, i) => ({
    x: from.x + ((to.x - from.x) * i) / steps,
    y: from.y + ((to.y - from.y) * i) / steps,
  }))
}

describe('rasterizeStroke', () => {
  it('returns nothing for an empty stroke', () => {
    const res = rasterizeStroke([], 10, SIZE)

    expect(res.cells).toHaveLength(0)
    expect(res.outline).toHaveLength(0)
  })

  it('covers cells along the stroke', () => {
    const res = rasterizeStroke(line({ x: 20, y: 40 }, { x: 80, y: 40 }), 8, SIZE)

    expect(res.cells.length).toBeGreaterThan(0)
  })

  it('never returns a cell outside the canvas', () => {
    const res = rasterizeStroke(line({ x: -50, y: -50 }, { x: 300, y: 300 }), 30, SIZE)

    for (const c of res.cells) {
      expect(c.x).toBeGreaterThanOrEqual(0)
      expect(c.x).toBeLessThan(SIZE.w)
      expect(c.y).toBeGreaterThanOrEqual(0)
      expect(c.y).toBeLessThan(SIZE.h)
    }
  })

  it('never returns duplicate cells, because each cell costs a token', () => {
    const res = rasterizeStroke(line({ x: 10, y: 10 }, { x: 200, y: 120 }, 200), 14, SIZE)
    const keys = res.cells.map((c) => `${c.x},${c.y}`)

    expect(new Set(keys).size).toBe(keys.length)
  })

  it('is deterministic, so the quote matches what is painted', () => {
    const points = line({ x: 30, y: 30 }, { x: 120, y: 90 })

    expect(rasterizeStroke(points, 10, SIZE).cells).toEqual(rasterizeStroke(points, 10, SIZE).cells)
  })

  it('costs more as the brush grows', () => {
    const points = line({ x: 40, y: 40 }, { x: 160, y: 40 })

    expect(strokeCost(points, 16, SIZE)).toBeGreaterThan(strokeCost(points, 4, SIZE))
  })

  it('respects a smaller canvas', () => {
    const points = line({ x: 0, y: 0 }, { x: 200, y: 200 })
    const small = rasterizeStroke(points, 10, { w: 32, h: 32 })

    for (const c of small.cells) {
      expect(c.x).toBeLessThan(32)
      expect(c.y).toBeLessThan(32)
    }
  })
})

describe('colour conversion', () => {
  it('round-trips a colour', () => {
    expect(hexToColor(colorToHex(0x00ffa3))).toBe(0x00ffa3)
  })

  it('pads short values', () => {
    expect(colorToHex(0x0000ff)).toBe('#0000ff')
  })

  it('falls back to black for malformed input rather than NaN', () => {
    expect(hexToColor('#zzzzzz')).toBe(0)
    expect(hexToColor('')).toBe(0)
  })

  it('clamps out-of-range input to 24-bit', () => {
    expect(hexToColor('ffffffff')).toBe(0xffffff)
  })
})

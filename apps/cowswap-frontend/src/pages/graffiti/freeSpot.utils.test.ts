import { findFreeSpot } from './freeSpot.utils'

const WALL = { w: 600, h: 400 }
const BOX = { w: 256, h: 128 }

/** `SAFE_AREA_INSET` (0.125) applied to `WALL` — the first spot the scan can offer on an empty wall. */
const SAFE_ORIGIN = { x: 75, y: 50 }
const SAFE_AREA = { minX: 75, minY: 50, maxX: WALL.w - 75, maxY: WALL.h - 50 }

/** Draws the first free spot, where a test needs one exact answer. */
const first = (): number => 0

function blankWall(wall = WALL): Uint8ClampedArray {
  return new Uint8ClampedArray(wall.w * wall.h * 4)
}

function paint(pixels: Uint8ClampedArray, x: number, y: number, wall = WALL): void {
  const i = (y * wall.w + x) * 4

  pixels[i] = 255
}

describe('findFreeSpot', () => {
  it('starts at the safe-area corner on an empty wall', () => {
    expect(findFreeSpot(blankWall(), WALL, BOX, first)).toEqual(SAFE_ORIGIN)
  })

  it('spreads claims over the free spots of the safe area', () => {
    const spots = [0, 0.33, 0.66, 0.999].map((draw) => findFreeSpot(blankWall(), WALL, BOX, () => draw))

    expect(new Set(spots.map(({ x, y }) => `${x},${y}`)).size).toBe(spots.length)

    for (const spot of spots) {
      expect(spot.x).toBeGreaterThanOrEqual(SAFE_AREA.minX)
      expect(spot.y).toBeGreaterThanOrEqual(SAFE_AREA.minY)
      expect(spot.x + BOX.w).toBeLessThanOrEqual(SAFE_AREA.maxX)
      expect(spot.y + BOX.h).toBeLessThanOrEqual(SAFE_AREA.maxY)
    }
  })

  it('draws with Math.random by default', () => {
    const spot = findFreeSpot(blankWall(), WALL, BOX)

    expect(spot.x).toBeGreaterThanOrEqual(SAFE_AREA.minX)
    expect(spot.y).toBeGreaterThanOrEqual(SAFE_AREA.minY)
  })

  it('moves past a painted area', () => {
    const pixels = blankWall()

    paint(pixels, SAFE_ORIGIN.x + 32, SAFE_ORIGIN.y + 32)

    const spot = findFreeSpot(pixels, WALL, BOX)

    expect(spot).not.toEqual(SAFE_ORIGIN)
    // The chosen frame must not contain the painted point.
    const painted = { x: SAFE_ORIGIN.x + 32, y: SAFE_ORIGIN.y + 32 }
    const covers =
      spot.x <= painted.x && painted.x <= spot.x + BOX.w && spot.y <= painted.y && painted.y <= spot.y + BOX.h

    expect(covers).toBe(false)
  })

  it('spills outside the safe area once that is full', () => {
    const wall = { w: 2000, h: 1200 }
    const pixels = blankWall(wall)
    const inset = { x: 250, y: 150 }

    for (let y = inset.y; y < wall.h - inset.y; y++) {
      for (let x = inset.x; x < wall.w - inset.x; x++) paint(pixels, x, y, wall)
    }

    const spot = findFreeSpot(pixels, wall, BOX, first)

    expect(spot).toEqual({ x: 8, y: 8 })
  })

  it('falls back to the centre when the wall is full', () => {
    const pixels = new Uint8ClampedArray(WALL.w * WALL.h * 4).fill(255)

    expect(findFreeSpot(pixels, WALL, BOX)).toEqual({ x: (WALL.w - BOX.w) / 2, y: (WALL.h - BOX.h) / 2 })
  })

  it('treats pure black as unpainted', () => {
    expect(findFreeSpot(blankWall(), WALL, BOX, first)).toEqual(SAFE_ORIGIN)
  })

  it('respects a portrait box', () => {
    const spot = findFreeSpot(blankWall(), WALL, { w: 128, h: 256 }, first)

    expect(spot).toEqual(SAFE_ORIGIN)
  })

  it('never returns a frame that overflows the wall', () => {
    const pixels = blankWall()

    for (let y = 0; y < 150; y++) paint(pixels, 10, y)

    const spot = findFreeSpot(pixels, WALL, BOX)

    expect(spot.x + BOX.w).toBeLessThanOrEqual(WALL.w)
    expect(spot.y + BOX.h).toBeLessThanOrEqual(WALL.h)
  })
})

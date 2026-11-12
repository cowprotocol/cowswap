import { findFreeSpot } from './freeSpot.utils'

const WALL = { w: 600, h: 400 }
const BOX = { w: 256, h: 128 }

/** `SAFE_AREA_INSET_X` (0.125) and `SAFE_AREA_INSET_Y` (0.16) applied to `WALL`. */
const SAFE_ORIGIN = { x: 75, y: 64 }

function blankWall(wall = WALL): Uint8ClampedArray {
  return new Uint8ClampedArray(wall.w * wall.h * 4)
}

function paint(pixels: Uint8ClampedArray, x: number, y: number, wall = WALL): void {
  const i = (y * wall.w + x) * 4

  pixels[i] = 255
}

describe('findFreeSpot', () => {
  it('starts at the safe-area corner on an empty wall', () => {
    expect(findFreeSpot(blankWall(), WALL, BOX)).toEqual(SAFE_ORIGIN)
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

    const spot = findFreeSpot(pixels, wall, BOX)

    expect(spot).toEqual({ x: 8, y: 8 })
  })

  it('falls back to the centre when the wall is full', () => {
    const pixels = new Uint8ClampedArray(WALL.w * WALL.h * 4).fill(255)

    expect(findFreeSpot(pixels, WALL, BOX)).toEqual({ x: (WALL.w - BOX.w) / 2, y: (WALL.h - BOX.h) / 2 })
  })

  it('treats pure black as unpainted', () => {
    expect(findFreeSpot(blankWall(), WALL, BOX)).toEqual(SAFE_ORIGIN)
  })

  it('respects a portrait box', () => {
    const spot = findFreeSpot(blankWall(), WALL, { w: 128, h: 256 })

    expect(spot).toEqual(SAFE_ORIGIN)
  })

  it('insets the top further than the sides, for the band the app header covers', () => {
    const wall = { w: 1000, h: 1000 }
    const spot = findFreeSpot(blankWall(wall), wall, BOX)

    expect(spot).toEqual({ x: 125, y: 160 })
    expect(spot.y).toBeGreaterThan(spot.x)
  })

  it('scales the top inset with the wall height', () => {
    const wall = { w: 1600, h: 900 }
    const spot = findFreeSpot(blankWall(wall), wall, BOX)

    expect(spot.y).toBe(Math.round(wall.h * 0.16))
  })

  it('never returns a frame that overflows the wall', () => {
    const pixels = blankWall()

    for (let y = 0; y < 150; y++) paint(pixels, 10, y)

    const spot = findFreeSpot(pixels, WALL, BOX)

    expect(spot.x + BOX.w).toBeLessThanOrEqual(WALL.w)
    expect(spot.y + BOX.h).toBeLessThanOrEqual(WALL.h)
  })
})

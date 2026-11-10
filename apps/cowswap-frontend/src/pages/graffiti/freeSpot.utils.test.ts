import { findFreeSpot } from './freeSpot.utils'

const WALL = { w: 600, h: 400 }
const BOX = { w: 256, h: 128 }

function blankWall(): Uint8ClampedArray {
  return new Uint8ClampedArray(WALL.w * WALL.h * 4)
}

function paint(pixels: Uint8ClampedArray, x: number, y: number): void {
  const i = (y * WALL.w + x) * 4

  pixels[i] = 255
}

describe('findFreeSpot', () => {
  it('starts at the top-left margin on an empty wall', () => {
    expect(findFreeSpot(blankWall(), WALL, BOX)).toEqual({ x: 8, y: 8 })
  })

  it('moves past a painted area', () => {
    const pixels = blankWall()

    paint(pixels, 40, 40)

    const spot = findFreeSpot(pixels, WALL, BOX)

    expect(spot).not.toEqual({ x: 8, y: 8 })
    // The chosen frame must not contain the painted point.
    const covers = spot.x <= 40 && 40 <= spot.x + BOX.w && spot.y <= 40 && 40 <= spot.y + BOX.h

    expect(covers).toBe(false)
  })

  it('falls back to the centre when the wall is full', () => {
    const pixels = new Uint8ClampedArray(WALL.w * WALL.h * 4).fill(255)

    expect(findFreeSpot(pixels, WALL, BOX)).toEqual({ x: (WALL.w - BOX.w) / 2, y: (WALL.h - BOX.h) / 2 })
  })

  it('treats pure black as unpainted', () => {
    expect(findFreeSpot(blankWall(), WALL, BOX)).toEqual({ x: 8, y: 8 })
  })

  it('respects a portrait box', () => {
    const spot = findFreeSpot(blankWall(), WALL, { w: 128, h: 256 })

    expect(spot).toEqual({ x: 8, y: 8 })
  })

  it('never returns a frame that overflows the wall', () => {
    const pixels = blankWall()

    for (let y = 0; y < 150; y++) paint(pixels, 10, y)

    const spot = findFreeSpot(pixels, WALL, BOX)

    expect(spot.x + BOX.w).toBeLessThanOrEqual(WALL.w)
    expect(spot.y + BOX.h).toBeLessThanOrEqual(WALL.h)
  })
})

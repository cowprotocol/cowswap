const SCAN_STEP = 32
const SAMPLE_STEP = 16
const SCAN_MARGIN = 8

/**
 * Fraction of each edge to keep claims out of, so a fresh claim lands where the swap page can
 * actually show it.
 *
 * That page draws the wall as a `cover`-scaled backdrop, which crops whatever doesn't fit its own
 * aspect ratio: a viewport wider than the wall's 16:9 loses `(1 - 16/9 / viewportRatio) / 2` of the
 * height off each of the top and bottom, a taller one loses the same of the width off each side
 * with the ratios swapped. 0.125 is the worst of the two across the range this targets — 11.8% at
 * 21:9, 12.5% at 4:3. A phone-shaped viewport crops far more (34% per side at 9:16) and is
 * deliberately not covered: insetting that far would cost two thirds of the wall.
 */
const SAFE_AREA_INSET = 0.125

export interface FreeSpotOptions {
  /** Draws a unit in [0, 1) like `Math.random`, which it defaults to. */
  random?: () => number
  /** A spot not to return again while any other free one exists: where the frame already is. */
  avoid?: Spot
}

export interface Size {
  w: number
  h: number
}

export interface Spot {
  x: number
  y: number
}

interface Area {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * A random spot where a `box`-sized frame lands on untouched wall: inside the area the swap page's
 * backdrop never crops while that has one, anywhere on the wall once it is full, and the centre
 * once the whole wall is. Never `avoid` while any other free spot exists. Reads the pixel buffer
 * directly, so it never depends on render timing.
 */
export function findFreeSpot(
  pixels: Uint8ClampedArray,
  wall: Size,
  box: Size,
  { random = Math.random, avoid }: FreeSpotOptions = {},
): Spot {
  const insetX = Math.round(wall.w * SAFE_AREA_INSET)
  const insetY = Math.round(wall.h * SAFE_AREA_INSET)

  const safeArea: Area = { minX: insetX, minY: insetY, maxX: wall.w - insetX, maxY: wall.h - insetY }
  const wholeWall: Area = { minX: SCAN_MARGIN, minY: SCAN_MARGIN, maxX: wall.w, maxY: wall.h }

  const pick = (spots: Spot[]): Spot => spots[Math.min(spots.length - 1, Math.floor(random() * spots.length))]
  const isAvoided = (spot: Spot): boolean => !!avoid && spot.x === avoid.x && spot.y === avoid.y

  const safeSpots = scanArea(pixels, wall, box, safeArea)
  const safeOthers = safeSpots.filter((spot) => !isAvoided(spot))

  if (safeOthers.length > 0) return pick(safeOthers)

  const wallSpots = scanArea(pixels, wall, box, wholeWall)
  const wallOthers = wallSpots.filter((spot) => !isAvoided(spot))

  if (wallOthers.length > 0) return pick(wallOthers)

  const onlyFree = safeSpots[0] ?? wallSpots[0]

  return onlyFree ?? { x: (wall.w - box.w) / 2, y: (wall.h - box.h) / 2 }
}

/** True when no sampled point of the box at (x, y) is already painted. */
function isBoxFree(pixels: Uint8ClampedArray, wall: Size, box: Size, x: number, y: number): boolean {
  for (let sy = 0; sy <= box.h; sy += SAMPLE_STEP) {
    for (let sx = 0; sx <= box.w; sx += SAMPLE_STEP) {
      if (isPainted(pixels, wall.w, x + sx, y + sy)) return false
    }
  }

  return true
}

function isPainted(pixels: Uint8ClampedArray, width: number, x: number, y: number): boolean {
  const i = (y * width + x) * 4

  return pixels[i] !== 0 || pixels[i + 1] !== 0 || pixels[i + 2] !== 0
}

/** Every spot within `area` (scanning left to right, top to bottom) where the box lands on unpainted wall. */
function scanArea(pixels: Uint8ClampedArray, wall: Size, box: Size, area: Area): Spot[] {
  const spots: Spot[] = []

  for (let y = area.minY; y + box.h < area.maxY; y += SCAN_STEP) {
    for (let x = area.minX; x + box.w < area.maxX; x += SCAN_STEP) {
      if (isBoxFree(pixels, wall, box, x, y)) spots.push({ x, y })
    }
  }

  return spots
}

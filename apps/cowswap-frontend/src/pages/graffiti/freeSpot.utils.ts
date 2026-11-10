const SCAN_STEP = 32
const SAMPLE_STEP = 16
const SCAN_MARGIN = 8

export interface Size {
  w: number
  h: number
}

/**
 * First spot (scanning left to right, top to bottom) where a `box`-sized frame
 * lands on untouched wall. Falls back to the centre when the wall is full.
 * Reads the pixel buffer directly, so it never depends on render timing.
 */
export function findFreeSpot(pixels: Uint8ClampedArray, wall: Size, box: Size): { x: number; y: number } {
  for (let y = SCAN_MARGIN; y + box.h < wall.h; y += SCAN_STEP) {
    for (let x = SCAN_MARGIN; x + box.w < wall.w; x += SCAN_STEP) {
      if (isBoxFree(pixels, wall, box, x, y)) return { x, y }
    }
  }

  return { x: (wall.w - box.w) / 2, y: (wall.h - box.h) / 2 }
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

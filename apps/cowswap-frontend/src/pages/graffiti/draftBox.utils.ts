import type { Draft } from './wall.types'

export interface DraftBox {
  x: number
  y: number
  w: number
  h: number
}

/** Bounding box of the draft cells, or null when the draft is empty. */
export function computeDraftBox(draft: Draft, canvasWidth: number): DraftBox | null {
  if (draft.size === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  draft.forEach((_color, idx) => {
    const x = idx % canvasWidth
    const y = Math.floor(idx / canvasWidth)

    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  })

  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

/**
 * Same rule the backend enforces: the long side may reach `maxBoxWidth`, the
 * short side only `maxBoxHeight`, so the frame can be landscape or portrait
 * but never large in both directions.
 */
export function isDraftTooBig(box: DraftBox | null, maxBoxWidth: number, maxBoxHeight: number): boolean {
  if (!box) return false

  return Math.max(box.w, box.h) > maxBoxWidth || Math.min(box.w, box.h) > maxBoxHeight
}

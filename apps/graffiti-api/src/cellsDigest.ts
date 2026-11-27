import crypto from 'node:crypto'

import type { ValidCell } from './canvas.js'

/**
 * The cells of one draw as a single string, ordered so that the same set of
 * cells always produces the same text whatever order they arrived in.
 *
 * The frontend builds this string too (`pages/graffiti/cellsDigest.utils.ts`).
 * The two must stay byte-identical: a divergence rejects every draw.
 */
export function canonicalCells(cells: readonly ValidCell[]): string {
  return [...cells]
    .sort((a, b) => a.y - b.y || a.x - b.x || a.rgb - b.rgb)
    .map((cell) => `${cell.x},${cell.y},${cell.rgb}`)
    .join(';')
}

/** SHA-256 of `canonicalCells`, hex. This is what a v2 burn memo commits to. */
export function cellsDigest(cells: readonly ValidCell[]): string {
  return crypto.createHash('sha256').update(canonicalCells(cells)).digest('hex')
}

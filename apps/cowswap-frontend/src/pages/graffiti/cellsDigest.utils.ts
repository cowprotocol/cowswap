import type { Cell } from './raster.utils'

/**
 * The cells of one draw as a single string, ordered so that the same set of
 * cells always produces the same text whatever order they were drawn in.
 *
 * The wall builds this string too (`apps/graffiti-api/src/cellsDigest.ts`).
 * The two must stay byte-identical: a divergence rejects every draw.
 */
export function canonicalCells(cells: Array<Cell>): string {
  return [...cells]
    .sort((a, b) => a.y - b.y || a.x - b.x || a.color - b.color)
    .map((cell) => `${cell.x},${cell.y},${cell.color}`)
    .join(';')
}

/**
 * SHA-256 of `canonicalCells`, hex.
 *
 * The burn memo carries this so the wall can tell that this burn paid for
 * these cells. Without it a burn's signature — public the moment it lands —
 * can be spent by anyone watching the chain on a drawing of their own.
 */
export async function cellsDigest(cells: Array<Cell>): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalCells(cells))
  const hash = await crypto.subtle.digest('SHA-256', bytes)

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

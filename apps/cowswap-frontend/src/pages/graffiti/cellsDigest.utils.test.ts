import { canonicalCells, cellsDigest } from './cellsDigest.utils'

import type { Cell } from './raster.utils'

// Shared with apps/graffiti-api/src/cellsDigest.test.ts. Both sides must agree
// on this vector, or a burn minted here is rejected by the wall.
const CELLS: Array<Cell> = [
  { x: 2, y: 1, color: 0x0000ff },
  { x: 0, y: 0, color: 0xff0000 },
  { x: 1, y: 0, color: 0x00ff00 },
]
const CANONICAL = '0,0,16711680;1,0,65280;2,1,255'
const DIGEST = '107174f4ced222066045ee70aa06e44392d717816c81fcaf4e568b088302f123'

describe('canonicalCells', () => {
  it('orders by row, then column, then colour', () => {
    expect(canonicalCells(CELLS)).toBe(CANONICAL)
  })

  it('does not depend on the order the cells were drawn in', () => {
    expect(canonicalCells([...CELLS].reverse())).toBe(CANONICAL)
  })

  it('keeps a repeated coordinate, so both sides count it the same way', () => {
    const cell: Cell = { x: 0, y: 0, color: 1 }

    expect(canonicalCells([cell, cell])).toBe('0,0,1;0,0,1')
  })
})

describe('cellsDigest', () => {
  it('matches the vector the wall tests against', async () => {
    await expect(cellsDigest(CELLS)).resolves.toBe(DIGEST)
  })

  it('changes when a colour changes', async () => {
    const repainted = CELLS.map((cell, i) => (i === 0 ? { ...cell, color: 0x0000fe } : cell))

    await expect(cellsDigest(repainted)).resolves.not.toBe(DIGEST)
  })

  it('changes when a cell moves', async () => {
    const moved = CELLS.map((cell, i) => (i === 0 ? { ...cell, x: 3 } : cell))

    await expect(cellsDigest(moved)).resolves.not.toBe(DIGEST)
  })
})

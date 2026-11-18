import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { canonicalCells, cellsDigest } from './cellsDigest.js'

import type { ValidCell } from './canvas.js'

// Shared with the frontend's cellsDigest.utils.test.ts. Both sides must agree
// on this vector, or a burn minted by the app is rejected by the wall.
const CELLS: ValidCell[] = [
  { x: 2, y: 1, rgb: 0x0000ff },
  { x: 0, y: 0, rgb: 0xff0000 },
  { x: 1, y: 0, rgb: 0x00ff00 },
]
const CANONICAL = '0,0,16711680;1,0,65280;2,1,255'
const DIGEST = '107174f4ced222066045ee70aa06e44392d717816c81fcaf4e568b088302f123'

describe('canonicalCells', () => {
  test('orders by row, then column, then colour', () => {
    assert.equal(canonicalCells(CELLS), CANONICAL)
  })

  test('does not depend on the order the cells arrived in', () => {
    assert.equal(canonicalCells([...CELLS].reverse()), CANONICAL)
  })

  test('keeps a repeated coordinate, so both sides count it the same way', () => {
    const cell: ValidCell = { x: 0, y: 0, rgb: 1 }
    assert.equal(canonicalCells([cell, cell]), '0,0,1;0,0,1')
  })
})

describe('cellsDigest', () => {
  test('matches the vector the frontend tests against', () => {
    assert.equal(cellsDigest(CELLS), DIGEST)
  })

  test('changes when a colour changes', () => {
    const repainted = CELLS.map((cell, i) => (i === 0 ? { ...cell, rgb: 0x0000fe } : cell))
    assert.notEqual(cellsDigest(repainted), DIGEST)
  })

  test('changes when a cell moves', () => {
    const moved = CELLS.map((cell, i) => (i === 0 ? { ...cell, x: 3 } : cell))
    assert.notEqual(cellsDigest(moved), DIGEST)
  })
})

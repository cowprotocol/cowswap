import assert from 'node:assert/strict'
import { test, describe } from 'node:test'

import { CanvasState } from './canvas.js'
import { CANVAS_HEIGHT, CANVAS_WIDTH, MAX_BOX_HEIGHT, MAX_BOX_WIDTH } from './config.js'

import type { CellInput, CellRow, ClaimRow, ClientErrorInput, Store } from './store.js'

/** Minimal in-memory Store for canvas tests. */
function stubStore(): Store {
  const cells: CellRow[] = []
  let seq = 0
  return {
    kind: 'json',
    getCellsSince: (since, limit) => {
      const rows = cells.filter((c) => c.seq > since)
      return limit === undefined ? rows : rows.slice(0, limit)
    },
    maxSeq: () => seq,
    appendCells: (list: CellInput[]) => {
      seq += 1
      for (const c of list) cells.push({ seq, ...c })
      return seq
    },
    claimSignature: () => true,
    releaseSignature: () => undefined,
    claimMemo: () => true,
    releaseMemo: () => undefined,
    getClaim: (): ClaimRow | null => null,
    insertClaim: () => undefined,
    reserveClaim: () => true,
    settleClaim: () => undefined,
    releaseClaim: () => undefined,
    failClaim: () => undefined,
    listFailedClaims: () => [],
    logClientError: (_e: ClientErrorInput) => undefined,
    close: () => undefined,
  }
}

const cell = (x: number, y: number, color = 0xff0000): Record<string, number> => ({ x, y, color })

describe('CanvasState.validateCells', () => {
  test('rejects non-array and empty input', () => {
    const canvas = new CanvasState(stubStore())
    assert.equal(canvas.validateCells(null).ok, false)
    assert.equal(canvas.validateCells([]).ok, false)
  })

  test('rejects out-of-bounds coordinates', () => {
    const canvas = new CanvasState(stubStore())
    assert.equal(canvas.validateCells([cell(-1, 0)]).ok, false)
    assert.equal(canvas.validateCells([cell(CANVAS_WIDTH, 0)]).ok, false)
    assert.equal(canvas.validateCells([cell(0, CANVAS_HEIGHT)]).ok, false)
  })

  test('rejects colours outside 24-bit RGB', () => {
    const canvas = new CanvasState(stubStore())
    assert.equal(canvas.validateCells([cell(0, 0, -1)]).ok, false)
    assert.equal(canvas.validateCells([cell(0, 0, 0x1000000)]).ok, false)
  })

  test('accepts hex colour strings', () => {
    const canvas = new CanvasState(stubStore())
    const res = canvas.validateCells([{ x: 1, y: 1, color: '00ff00' }])
    assert.equal(res.ok, true)
    assert.equal(res.ok && res.cells[0].rgb, 0x00ff00)
  })

  test('dedupes repeated coordinates so cost counts unique cells', () => {
    const canvas = new CanvasState(stubStore())
    const res = canvas.validateCells([cell(5, 5), cell(5, 5), cell(5, 5)])
    assert.equal(res.ok, true)
    assert.equal(res.ok && res.cells.length, 1)
  })

  test('no-op writes are free', () => {
    const canvas = new CanvasState(stubStore())
    canvas.applyDraw([{ x: 7, y: 7, rgb: 0xff0000 }])
    const res = canvas.validateCells([cell(7, 7, 0xff0000)])
    assert.equal(res.ok, true)
    assert.equal(res.ok && res.cells.length, 0, 'repainting the same colour must cost nothing')
  })

  test('enforces the bounding box in both orientations', () => {
    const canvas = new CanvasState(stubStore())
    const landscape = canvas.validateCells([cell(0, 0), cell(MAX_BOX_WIDTH - 1, MAX_BOX_HEIGHT - 1)])
    assert.equal(landscape.ok, true)

    const portrait = canvas.validateCells([cell(0, 0), cell(MAX_BOX_HEIGHT - 1, MAX_BOX_WIDTH - 1)])
    assert.equal(portrait.ok, true)

    const tooWide = canvas.validateCells([cell(0, 0), cell(MAX_BOX_WIDTH, 0)])
    assert.equal(tooWide.ok, false)

    const bothLarge = canvas.validateCells([cell(0, 0), cell(MAX_BOX_WIDTH - 1, MAX_BOX_WIDTH - 1)])
    assert.equal(bothLarge.ok, false, 'a square at max width must be rejected')
  })

  test('handles a large draw without blowing the call stack', () => {
    const canvas = new CanvasState(stubStore())
    // Math.max(...xs) throws RangeError around this size.
    const many = Array.from({ length: 150_000 }, (_, i) => cell(i % MAX_BOX_HEIGHT, 0))
    const res = canvas.validateCells(many)
    assert.equal(res.ok, true)
  })

  test('applyDraw bumps the revision so renders can be cached', () => {
    const canvas = new CanvasState(stubStore())
    const before = canvas.version
    canvas.applyDraw([{ x: 2, y: 2, rgb: 0x0000ff }])
    assert.equal(canvas.version, before + 1)
  })
})

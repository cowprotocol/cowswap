import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test, describe } from 'node:test'

import { generateClaimCode } from './claimCode.js'
import { JsonStore } from './jsonStore.js'

const BASE58 = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{22}$/

function tempStore(): JsonStore {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graffiti-test-'))
  return new JsonStore(path.join(dir, 'test.db'))
}

describe('generateClaimCode', () => {
  test('produces 22-char base58 codes', () => {
    for (let i = 0; i < 100; i++) assert.match(generateClaimCode(), BASE58)
  })

  test('does not repeat across many draws', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 5000; i++) seen.add(generateClaimCode())
    assert.equal(seen.size, 5000, 'claim codes must be unique')
  })

  test('covers the alphabet roughly uniformly', () => {
    // Rejection sampling exists so the first 24 letters are not favoured; a
    // modulo-only implementation skews them by ~12%.
    const counts = new Map<string, number>()
    for (let i = 0; i < 20_000; i++) {
      for (const ch of generateClaimCode()) counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
    const values = [...counts.values()]
    const expected = (20_000 * 22) / 58
    for (const v of values) {
      assert.ok(Math.abs(v - expected) / expected < 0.1, `character frequency skew: ${v} vs ${expected}`)
    }
  })
})

describe('claim state machine', () => {
  test('a code can only be reserved once', () => {
    const store = tempStore()
    store.insertClaim('code-a', 1000)
    assert.equal(store.reserveClaim('code-a'), true)
    assert.equal(store.reserveClaim('code-a'), false, 'second reservation must fail')
  })

  test('settling makes the code permanently unusable', () => {
    const store = tempStore()
    store.insertClaim('code-b', 1000)
    store.reserveClaim('code-b')
    store.settleClaim('code-b', 'sig-1')

    const row = store.getClaim('code-b')
    assert.equal(row?.state, 'used')
    assert.equal(row?.txSignature, 'sig-1')
    assert.equal(store.reserveClaim('code-b'), false)
  })

  test('releasing returns the code to circulation', () => {
    const store = tempStore()
    store.insertClaim('code-c', 1000)
    store.reserveClaim('code-c')
    store.releaseClaim('code-c')

    assert.equal(store.getClaim('code-c')?.state, 'unused')
    assert.equal(store.reserveClaim('code-c'), true)
  })

  test('a failed claim is never re-released, so the treasury cannot pay twice', () => {
    const store = tempStore()
    store.insertClaim('code-d', 1000)
    store.reserveClaim('code-d')
    store.failClaim('code-d', 'unconfirmed sig-2')

    assert.equal(store.getClaim('code-d')?.state, 'failed')
    assert.equal(store.reserveClaim('code-d'), false)
    store.releaseClaim('code-d')
    assert.equal(store.getClaim('code-d')?.state, 'failed', 'release must not resurrect a failed claim')
    assert.equal(store.listFailedClaims(10).length, 1)
  })
})

describe('replay protection', () => {
  test('a signature can only be claimed once', () => {
    const store = tempStore()
    assert.equal(store.claimSignature('sig'), true)
    assert.equal(store.claimSignature('sig'), false)
  })

  test('releasing a signature allows a genuine retry', () => {
    const store = tempStore()
    store.claimSignature('sig')
    store.releaseSignature('sig')
    assert.equal(store.claimSignature('sig'), true)
  })

  test('memos behave the same way', () => {
    const store = tempStore()
    assert.equal(store.claimMemo('graffiti:v1:wallet:1700000000'), true)
    assert.equal(store.claimMemo('graffiti:v1:wallet:1700000000'), false)
  })
})

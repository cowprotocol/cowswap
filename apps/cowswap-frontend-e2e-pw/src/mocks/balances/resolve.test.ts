import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { hasAnyEntry, isOwnerConfigured, resolveBalancesSnapshot } from './resolve'
import { balanceKey, type BalanceLookup } from './types'

const OWNER = '0x1111111111111111111111111111111111111111'
const OTHER = '0x2222222222222222222222222222222222222222'
const TOKEN = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'
const OTHER_TOKEN = '0x0625afb445c3b6b7b929342a04a22599fd5dbb59'
const CHAIN = 11155111

function lookupOf(entries: Array<[string, bigint]>): BalanceLookup {
  return new Map(entries)
}

const EMPTY: BalanceLookup = new Map()

test('an unconfigured owner resolves to an empty snapshot', () => {
  assert.deepEqual(resolveBalancesSnapshot(EMPTY, EMPTY, OWNER, CHAIN), {})
})

test('returns the fixture snapshot as decimal strings', () => {
  const fixture = lookupOf([[balanceKey(OWNER, CHAIN, TOKEN), 5000000n]])

  assert.deepEqual(resolveBalancesSnapshot(fixture, EMPTY, OWNER, CHAIN), { [TOKEN]: '5000000' })
})

test('merges multiple tokens for the same owner/chain', () => {
  const fixture = lookupOf([
    [balanceKey(OWNER, CHAIN, TOKEN), 1n],
    [balanceKey(OWNER, CHAIN, OTHER_TOKEN), 2n],
  ])

  assert.deepEqual(resolveBalancesSnapshot(fixture, EMPTY, OWNER, CHAIN), { [TOKEN]: '1', [OTHER_TOKEN]: '2' })
})

test('an override wins over the fixture for the same token', () => {
  const fixture = lookupOf([[balanceKey(OWNER, CHAIN, TOKEN), 5000000n]])
  const overrides = lookupOf([[balanceKey(OWNER, CHAIN, TOKEN), 0n]])

  assert.deepEqual(resolveBalancesSnapshot(fixture, overrides, OWNER, CHAIN), { [TOKEN]: '0' })
})

test('an override for a different token adds to, not replaces, the fixture snapshot', () => {
  const fixture = lookupOf([[balanceKey(OWNER, CHAIN, TOKEN), 1n]])
  const overrides = lookupOf([[balanceKey(OWNER, CHAIN, OTHER_TOKEN), 2n]])

  assert.deepEqual(resolveBalancesSnapshot(fixture, overrides, OWNER, CHAIN), { [TOKEN]: '1', [OTHER_TOKEN]: '2' })
})

test('ignores entries for a different owner or chain', () => {
  const fixture = lookupOf([
    [balanceKey(OTHER, CHAIN, TOKEN), 1n],
    [balanceKey(OWNER, 1, TOKEN), 1n],
  ])

  assert.deepEqual(resolveBalancesSnapshot(fixture, EMPTY, OWNER, CHAIN), {})
})

test('isOwnerConfigured sees owners from either map, scoped to chain', () => {
  const fixture = lookupOf([[balanceKey(OWNER, CHAIN, TOKEN), 1n]])
  const overrides = lookupOf([[balanceKey(OTHER, CHAIN, TOKEN), 1n]])

  assert.equal(isOwnerConfigured(fixture, overrides, OWNER, CHAIN), true)
  assert.equal(isOwnerConfigured(fixture, overrides, OTHER, CHAIN), true)
  assert.equal(isOwnerConfigured(fixture, overrides, OWNER, 1), false)
})

test('hasAnyEntry is false only when both maps are empty', () => {
  assert.equal(hasAnyEntry(EMPTY, EMPTY), false)
  assert.equal(hasAnyEntry(lookupOf([[balanceKey(OWNER, CHAIN, TOKEN), 0n]]), EMPTY), true)
  assert.equal(hasAnyEntry(EMPTY, lookupOf([[balanceKey(OWNER, CHAIN, TOKEN), 0n]])), true)
})

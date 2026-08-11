import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { hasAnyEntry, isOwnerConfigured, resolveAllowance } from './resolve'
import { allowanceKey, type AllowanceLookup } from './types'

const OWNER = '0x1111111111111111111111111111111111111111'
const OTHER = '0x2222222222222222222222222222222222222222'
const TOKEN = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'
const OTHER_TOKEN = '0x0625afb445c3b6b7b929342a04a22599fd5dbb59'
const CHAIN = 11155111

function lookupOf(entries: Array<[string, bigint]>): AllowanceLookup {
  return new Map(entries)
}

const EMPTY: AllowanceLookup = new Map()

// Real addresses never have an uppercase "0X" prefix — EIP-55 checksumming only varies the hex
// body's case. `address.toUpperCase()` on the whole string corrupts the prefix instead, which
// `getAddressKey` treats as not an EVM address at all (it requires a literal lowercase "0x").
function upperHex(address: string): string {
  return `0x${address.slice(2).toUpperCase()}`
}

test('returns the fixture value', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])

  assert.equal(resolveAllowance(fixture, EMPTY, OWNER, CHAIN, TOKEN), 5000000n)
})

test('matches regardless of address case', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 42n]])

  assert.equal(resolveAllowance(fixture, EMPTY, upperHex(OWNER), CHAIN, upperHex(TOKEN)), 42n)
})

test('an override wins over the fixture', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])
  const overrides = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 0n]])

  assert.equal(resolveAllowance(fixture, overrides, OWNER, CHAIN, TOKEN), 0n)
})

test('an unlisted token resolves to 0', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])

  assert.equal(resolveAllowance(fixture, EMPTY, OWNER, CHAIN, OTHER_TOKEN), 0n)
})

test('an unlisted chain resolves to 0', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])

  assert.equal(resolveAllowance(fixture, EMPTY, OWNER, 100, TOKEN), 0n)
})

test('an unlisted owner resolves to 0', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 5000000n]])

  assert.equal(resolveAllowance(fixture, EMPTY, OTHER, CHAIN, TOKEN), 0n)
})

test('isOwnerConfigured sees owners from either map', () => {
  const fixture = lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 1n]])
  const overrides = lookupOf([[allowanceKey(OTHER, CHAIN, TOKEN), 1n]])

  assert.equal(isOwnerConfigured(fixture, overrides, OWNER), true)
  assert.equal(isOwnerConfigured(fixture, overrides, upperHex(OTHER)), true)
  assert.equal(isOwnerConfigured(fixture, overrides, '0x3333333333333333333333333333333333333333'), false)
})

test('hasAnyEntry is false only when both maps are empty', () => {
  assert.equal(hasAnyEntry(EMPTY, EMPTY), false)
  assert.equal(hasAnyEntry(lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 0n]]), EMPTY), true)
  assert.equal(hasAnyEntry(EMPTY, lookupOf([[allowanceKey(OWNER, CHAIN, TOKEN), 0n]])), true)
})

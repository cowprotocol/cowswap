import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { parseAllowanceValue, parseAllowancesFixture } from './fixture'
import { allowanceKey } from './types'

const OWNER = '0x1111111111111111111111111111111111111111'
const TOKEN = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'

test('flattens owner -> chain -> token into a keyed map', () => {
  const lookup = parseAllowancesFixture({ [OWNER]: { '11155111': { [TOKEN]: '5000000' } } }, 'test')

  assert.equal(lookup.get(allowanceKey(OWNER, 11155111, TOKEN)), 5000000n)
  assert.equal(lookup.size, 1)
})

test('lowercases owner and token keys', () => {
  const lookup = parseAllowancesFixture(
    { [OWNER.toUpperCase().replace('0X', '0x')]: { '100': { [TOKEN.toUpperCase().replace('0X', '0x')]: '1' } } },
    'test',
  )

  assert.equal(lookup.get(allowanceKey(OWNER, 100, TOKEN)), 1n)
})

test('accepts a safe-integer number', () => {
  const lookup = parseAllowancesFixture({ [OWNER]: { '1': { [TOKEN]: 10000 } } }, 'test')

  assert.equal(lookup.get(allowanceKey(OWNER, 1, TOKEN)), 10000n)
})

test('an empty object is a valid fixture', () => {
  assert.equal(parseAllowancesFixture({}, 'test').size, 0)
})

test('rejects a number that is not a safe integer, naming the path', () => {
  assert.throws(
    () => parseAllowancesFixture({ [OWNER]: { '1': { [TOKEN]: 1e21 } } }, 'test'),
    (error: Error) => {
      assert.match(error.message, /test/)
      assert.match(error.message, /safe integer/)
      assert.match(error.message, new RegExp(TOKEN))
      return true
    },
  )
})

test('rejects a negative value', () => {
  assert.throws(() => parseAllowancesFixture({ [OWNER]: { '1': { [TOKEN]: '-1' } } }, 'test'), /negative/i)
})

test('rejects a non-integer decimal string', () => {
  assert.throws(() => parseAllowancesFixture({ [OWNER]: { '1': { [TOKEN]: '1.5' } } }, 'test'), /raw atoms/i)
})

test('rejects a malformed owner address', () => {
  assert.throws(() => parseAllowancesFixture({ nope: { '1': { [TOKEN]: '1' } } }, 'test'), /owner address/i)
})

test('rejects a malformed token address', () => {
  assert.throws(() => parseAllowancesFixture({ [OWNER]: { '1': { wat: '1' } } }, 'test'), /token address/i)
})

test('rejects a non-numeric chain key', () => {
  assert.throws(() => parseAllowancesFixture({ [OWNER]: { mainnet: { [TOKEN]: '1' } } }, 'test'), /chain id/i)
})

test('rejects a non-object fixture', () => {
  assert.throws(() => parseAllowancesFixture([], 'test'), /object/i)
})

test('parseAllowanceValue accepts bigint and decimal string', () => {
  assert.equal(parseAllowanceValue(7n, 'x'), 7n)
  assert.equal(parseAllowanceValue('7', 'x'), 7n)
})

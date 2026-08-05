import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { CHAIN_IDS } from './constants'
import { resolveToken } from './tokens'

test('resolves a known symbol on a known chain', () => {
  const weth = resolveToken(CHAIN_IDS.SEPOLIA, 'WETH')

  assert.equal(weth.address, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14')
  assert.equal(weth.decimals, 18)
})

test('throws with the known symbols when the symbol is not registered', () => {
  assert.throws(
    () => resolveToken(CHAIN_IDS.SEPOLIA, 'DAI'),
    /unknown token symbol "DAI".*WETH.*USDC|unknown token symbol "DAI".*USDC.*WETH/,
  )
})

test('throws when the chain has no tokens registered', () => {
  assert.throws(() => resolveToken(CHAIN_IDS.MAINNET, 'WETH'), /no tokens registered for chain 1/)
})

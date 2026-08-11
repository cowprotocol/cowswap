import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { CHAIN_IDS } from './constants'
import { resolveToken } from './tokens'

test('resolves a known symbol on a known chain', () => {
  const weth = resolveToken(CHAIN_IDS.SEPOLIA, 'WETH')

  assert.equal(weth.address, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14')
  assert.equal(weth.decimals, 18)
})

test('resolves Sepolia USDC with 18 decimals (this test token is not the real 6-decimal USDC)', () => {
  const usdc = resolveToken(CHAIN_IDS.SEPOLIA, 'USDC')

  assert.equal(usdc.address, '0xbe72E441BF55620febc26715db68d3494213D8Cb')
  assert.equal(usdc.decimals, 18)
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

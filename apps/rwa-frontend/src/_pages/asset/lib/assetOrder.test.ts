import { isAssetSwap, isAssetToken } from './assetOrder'

import type { RwaTokenSummary } from '@/entities/asset'

const XAUT = { chainId: 1, address: '0x68749665FF8D2d112Fa859AA293F07A622782F38' } as RwaTokenSummary
const TOKENS = [XAUT]
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

describe('isAssetToken', () => {
  it('matches an asset token on its chain in any letter case', () => {
    expect(isAssetToken(TOKENS, 1, '0x68749665ff8d2d112fa859aa293f07a622782f38')).toBe(true)
  })

  it('does not match the same address on another chain', () => {
    expect(isAssetToken(TOKENS, 8453, XAUT.address)).toBe(false)
  })
})

describe('isAssetSwap', () => {
  it.each([
    ['buys', USDC, XAUT.address],
    ['sells', XAUT.address, USDC],
  ])('is true for an order that %s an asset token', (_, sellToken, buyToken) => {
    expect(isAssetSwap(TOKENS, { chainId: 1, order: { sellToken, buyToken } })).toBe(true)
  })

  it('is false for an order of other tokens, such as the source order of a bridged buy', () => {
    expect(isAssetSwap(TOKENS, { chainId: 8453, order: { sellToken: USDC, buyToken: USDC } })).toBe(false)
  })
})

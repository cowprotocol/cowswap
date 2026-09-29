import { EvmChains } from '@cowprotocol/cow-sdk'

import { getPublicClient } from './getPublicClient.utils'

describe('getPublicClient', () => {
  it('returns the same client instance for the same chain', () => {
    const first = getPublicClient(EvmChains.MAINNET)
    const second = getPublicClient(EvmChains.MAINNET)

    expect(second).toBe(first)
  })

  it('returns different clients for different chains', () => {
    const mainnet = getPublicClient(EvmChains.MAINNET)
    const gnosis = getPublicClient(EvmChains.GNOSIS_CHAIN)

    expect(gnosis).not.toBe(mainnet)
  })
})

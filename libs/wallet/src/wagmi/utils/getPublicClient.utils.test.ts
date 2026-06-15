import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getPublicClient } from './getPublicClient.utils'

describe('getPublicClient', () => {
  it('returns the same client instance for the same chain', () => {
    const first = getPublicClient(SupportedChainId.MAINNET)
    const second = getPublicClient(SupportedChainId.MAINNET)

    expect(second).toBe(first)
  })

  it('returns different clients for different chains', () => {
    const mainnet = getPublicClient(SupportedChainId.MAINNET)
    const gnosis = getPublicClient(SupportedChainId.GNOSIS_CHAIN)

    expect(gnosis).not.toBe(mainnet)
  })
})

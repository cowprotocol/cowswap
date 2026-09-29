import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { isSameChainFamily } from './isSameChainFamily'

describe('isSameChainFamily', () => {
  it('returns true for two EVM chains', () => {
    expect(isSameChainFamily(SupportedChainId.MAINNET, SupportedChainId.ARBITRUM_ONE)).toBe(true)
  })

  it('returns true for the same chain', () => {
    expect(isSameChainFamily(SupportedChainId.SOLANA, SupportedChainId.SOLANA)).toBe(true)
    expect(isSameChainFamily(SupportedChainId.MAINNET, SupportedChainId.MAINNET)).toBe(true)
  })

  it('returns false when crossing between EVM and non-EVM', () => {
    expect(isSameChainFamily(SupportedChainId.MAINNET, SupportedChainId.SOLANA)).toBe(false)
    expect(isSameChainFamily(SupportedChainId.SOLANA, SupportedChainId.MAINNET)).toBe(false)
  })
})

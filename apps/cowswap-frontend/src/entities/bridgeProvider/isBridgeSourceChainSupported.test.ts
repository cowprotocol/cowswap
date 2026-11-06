import { ALL_SUPPORTED_CHAINS, SupportedChainId } from '@cowprotocol/cow-sdk'

import { isBridgeSourceChainSupported } from './isBridgeSourceChainSupported'

describe('isBridgeSourceChainSupported', () => {
  it('returns true for a bridge-supported network', () => {
    expect(isBridgeSourceChainSupported(SupportedChainId.GNOSIS_CHAIN, ALL_SUPPORTED_CHAINS)).toBe(true)
  })

  it('returns false for Solana even when it is a bridge-supported network', () => {
    expect(isBridgeSourceChainSupported(SupportedChainId.SOLANA, ALL_SUPPORTED_CHAINS)).toBe(false)
  })

  it('returns false for a network the bridge does not support', () => {
    const networks = ALL_SUPPORTED_CHAINS.filter((chain) => chain.id !== SupportedChainId.SEPOLIA)

    expect(isBridgeSourceChainSupported(SupportedChainId.SEPOLIA, networks)).toBe(false)
  })

  it('returns false while bridge-supported networks are unknown', () => {
    expect(isBridgeSourceChainSupported(SupportedChainId.MAINNET, undefined)).toBe(false)
  })
})

import { ALL_SUPPORTED_CHAINS_MAP, SupportedChainId } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCIES } from './nativeAndWrappedTokens'

describe('NATIVE_CURRENCIES', () => {
  it('carries the logo the SDK publishes for the chain', () => {
    expect(NATIVE_CURRENCIES[SupportedChainId.SOLANA].logoURI).toBe(
      ALL_SUPPORTED_CHAINS_MAP[SupportedChainId.SOLANA].nativeCurrency.logoUrl,
    )
  })

  it('has a logo for every supported chain', () => {
    const withoutLogo = Object.values(SupportedChainId)
      .filter((chainId): chainId is SupportedChainId => typeof chainId === 'number')
      .filter((chainId) => !NATIVE_CURRENCIES[chainId].logoURI)

    expect(withoutLogo).toEqual([])
  })
})

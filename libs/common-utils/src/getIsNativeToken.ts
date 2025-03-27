import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, NativeCurrency } from '@uniswap/sdk-core'

import { doesTokenMatchSymbolOrAddress } from './doesTokenMatchSymbolOrAddress'

/**
 * TODO: Eventually, we should get rid of uniswap entities and use our own
 */
export function getIsNativeToken(currency: Currency): currency is NativeCurrency
export function getIsNativeToken(currency: TokenWithLogo): boolean
export function getIsNativeToken(chainId: SupportedChainId, tokenId: string): boolean
export function getIsNativeToken(chainIdOrTokenParams: SupportedChainId | Currency, _tokenId?: string): boolean {
  if (chainIdOrTokenParams instanceof NativeCurrency) return chainIdOrTokenParams.isNative

  if (typeof chainIdOrTokenParams === 'number') {
    const nativeToken = NATIVE_CURRENCIES[chainIdOrTokenParams as SupportedChainId]

    if (!nativeToken) return false

    return doesTokenMatchSymbolOrAddress(nativeToken, _tokenId)
  }

  const chainId = chainIdOrTokenParams.chainId
  const tokenId = chainIdOrTokenParams.address

  const nativeToken = NATIVE_CURRENCIES[chainId as SupportedChainId]

  // When token is from Bridge, it's not in the list of native tokens
  if (!nativeToken) return false

  return doesTokenMatchSymbolOrAddress(nativeToken, tokenId)
}

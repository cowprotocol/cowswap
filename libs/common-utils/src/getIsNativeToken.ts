import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, NativeCurrency } from '@uniswap/sdk-core'

import { doesTokenMatchSymbolOrAddress } from './doesTokenMatchSymbolOrAddress'

const getIsCurrency = (params: any): params is Currency =>
  typeof params !== 'number' && 'chainId' in params && 'symbol' in params

/**
 * TODO: Eventually, we should get rid of uniswap entities and use our own
 */
export function getIsNativeToken(currency: Currency): currency is NativeCurrency
export function getIsNativeToken(chainId: SupportedChainId, tokenId: string): boolean
export function getIsNativeToken(chainIdOrTokenParams: SupportedChainId | Currency, _tokenId?: string): boolean {
  const isCurrency = getIsCurrency(chainIdOrTokenParams)
  const chainId = isCurrency ? chainIdOrTokenParams.chainId : chainIdOrTokenParams
  const tokenId = isCurrency ? chainIdOrTokenParams.symbol : _tokenId

  if (!tokenId) return false

  const nativeToken = NATIVE_CURRENCIES[chainId as SupportedChainId]

  return doesTokenMatchSymbolOrAddress(nativeToken, tokenId)
}

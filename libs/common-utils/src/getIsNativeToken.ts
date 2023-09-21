import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCY_BUY_TOKEN } from '@cowprotocol/common-const'

import { doesTokenMatchSymbolOrAddress } from './doesTokenMatchSymbolOrAddress'

export function getIsNativeToken(chainId: SupportedChainId, tokenId: string): boolean {
  const nativeToken = NATIVE_CURRENCY_BUY_TOKEN[chainId]

  return doesTokenMatchSymbolOrAddress(nativeToken, tokenId)
}

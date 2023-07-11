import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCY_BUY_TOKEN } from 'legacy/constants'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { doesTokenMatchSymbolOrAddress } from './doesTokenMatchSymbolOrAddress'

export function getIsNativeToken(chainId: SupportedChainId, tokenId: string): boolean {
  const nativeToken = NATIVE_CURRENCY_BUY_TOKEN[chainId]

  if (!supportedChainId(chainId)) {
    return false
  }

  return doesTokenMatchSymbolOrAddress(nativeToken, tokenId)
}

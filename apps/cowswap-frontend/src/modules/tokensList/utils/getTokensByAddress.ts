import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { NATIVE_CURRENCY_BUY_TOKEN } from '@cowswap/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowswap/common-utils'
import { Token } from '@uniswap/sdk-core'

import { TokensByAddress } from '../state/tokensListAtom'

export function getTokensByAddress(
  chainId: SupportedChainId,
  tokenId: string,
  tokensByAddress: TokensByAddress
): Token {
  const nativeToken = NATIVE_CURRENCY_BUY_TOKEN[chainId]

  if (doesTokenMatchSymbolOrAddress(nativeToken, tokenId)) {
    return nativeToken
  }

  return tokensByAddress[tokenId.toLowerCase()]
}

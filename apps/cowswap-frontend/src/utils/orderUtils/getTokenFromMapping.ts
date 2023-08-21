import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getAddress } from '@ethersproject/address'
import { Token } from '@uniswap/sdk-core'

import { NATIVE_CURRENCY_BUY_TOKEN } from 'legacy/constants'

import { getIsNativeToken } from '../getIsNativeToken'

export function getTokenFromMapping(
  address: string,
  chainId: SupportedChainId,
  tokens: { [p: string]: Token }
): Token | null {
  if (getIsNativeToken(chainId, address)) {
    return NATIVE_CURRENCY_BUY_TOKEN[chainId]
  }
  // Some tokens are checksummed, some are not. Search both ways
  return tokens[getAddress(address)] || tokens[address] || null
}

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import { TokensByAddress } from '@cowprotocol/tokens'
import { getAddress } from '@ethersproject/address'

export function getTokenFromMapping(address: string, chainId: SupportedChainId, tokens: TokensByAddress): Token | null {
  if (getIsNativeToken(chainId, address)) {
    return NATIVE_CURRENCIES[chainId]
  }
  // Some tokens are checksummed, some are not. Search both ways
  return tokens[getAddress(address)] || tokens[address] || null
}

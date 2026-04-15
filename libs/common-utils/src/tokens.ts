import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { doesTokenMatchSymbolOrAddress } from './doesTokenMatchSymbolOrAddress'

export function isNativeAddress(tokenAddress: string, chainId: ChainId): boolean {
  if (!tokenAddress || !chainId) return false

  const tokenAddressLower = tokenAddress.toLowerCase()

  if (tokenAddressLower === 'eth') return true

  const native = NATIVE_CURRENCIES[chainId]

  return native && doesTokenMatchSymbolOrAddress(native, tokenAddressLower)
}

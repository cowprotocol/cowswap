import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import type { RwaTokenSummary } from '@/entities/asset'

interface ChainOrder {
  chainId: number
  order: { sellToken: string; buyToken: string }
}

/** `true` when the order sells or buys an asset token on its own chain, which a bridged buy doesn't */
export function isAssetSwap(tokens: RwaTokenSummary[], { chainId, order }: ChainOrder): boolean {
  return isAssetToken(tokens, chainId, order.sellToken) || isAssetToken(tokens, chainId, order.buyToken)
}

export function isAssetToken(tokens: RwaTokenSummary[], chainId: number, address: string): boolean {
  return tokens.some((token) => token.chainId === chainId && areAddressesEqual(token.address, address))
}

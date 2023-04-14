import type { ChainId } from '@uniswap/smart-order-router'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function toSupportedChainId(chainId: ChainId): SupportedChainId | undefined {
  const numericChainId: number = chainId
  if (SupportedChainId[numericChainId]) return numericChainId
  return undefined
}
export function isSupportedChainId(chainId: ChainId | undefined): boolean {
  if (chainId === undefined) return false
  return toSupportedChainId(chainId) !== undefined
}

export function isSupportedChainIdType(chainId: number): chainId is SupportedChainId {
  return isSupportedChainId(chainId)
}

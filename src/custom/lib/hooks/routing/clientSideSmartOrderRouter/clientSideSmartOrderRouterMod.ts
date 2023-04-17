import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cow/types'

export function toSupportedChainId(chainId: number): SupportedChainId | undefined {
  const numericChainId: number = chainId
  if (SupportedChainId[numericChainId]) return numericChainId
  return undefined
}
export function isSupportedChainId(chainId: Nullish<number>): chainId is SupportedChainId {
  if (!chainId) return false

  return toSupportedChainId(chainId) !== undefined
}

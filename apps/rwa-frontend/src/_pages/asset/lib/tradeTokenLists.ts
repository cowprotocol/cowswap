import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { DEFAULT_TOKENS_LISTS } from '@cowprotocol/tokens/lists'

/**
 * The widget shows only the lists it is given once any is given, so the RWA lists are passed with the
 * other lists CoW Swap ships for the network rather than alone.
 */
export function getTradeTokenLists(chainId: SupportedChainId): string[] {
  return (DEFAULT_TOKENS_LISTS[chainId] || []).map((list) => list.source)
}

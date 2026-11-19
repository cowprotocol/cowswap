import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { DEFAULT_TOKENS_LISTS } from '@cowprotocol/tokens/lists'

export const COW_SWAP_TOKENS_LIST = 'https://files.cow.fi/tokens/CowSwap.json'

/**
 * The widget shows only the lists it is given once any is given, so the RWA lists are passed with the
 * CoW Swap list (USDC and the other quote tokens) rather than alone.
 */
export function getTradeTokenLists(chainId: SupportedChainId): string[] {
  return (DEFAULT_TOKENS_LISTS[chainId] || [])
    .filter((list) => list.category === 'RWA' || list.source === COW_SWAP_TOKENS_LIST)
    .map((list) => list.source)
}

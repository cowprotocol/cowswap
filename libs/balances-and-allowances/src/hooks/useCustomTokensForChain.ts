import { useMemo } from 'react'

import { AddressKey, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useUserAddedTokens, useVirtualLists } from '@cowprotocol/tokens'

const EMPTY_CUSTOM_TOKENS: AddressKey[] = []

/**
 * Normalized addresses of user-imported tokens and widget-provided custom tokens (virtual lists,
 * e.g. `widgetCustomTokens`) for the given chain. Virtual lists aren't fetchable URLs (see
 * `useEnabledTokensListsUrls`), so their tokens are tracked by address here instead. Sorted so the
 * result is deterministic regardless of source insertion order, keeping `useStableStringList`
 * (index-sensitive) from treating a reordered-but-unchanged set as a change.
 */
export function useCustomTokensForChain(chainId: SupportedChainId): AddressKey[] {
  const userAddedTokens = useUserAddedTokens()
  const virtualLists = useVirtualLists()

  return useMemo(() => {
    const addresses = new Set<AddressKey>()

    for (const token of userAddedTokens) {
      if (token.chainId === chainId) {
        addresses.add(getAddressKey(token.address))
      }
    }

    for (const list of Object.values(virtualLists)) {
      for (const token of list.list.tokens) {
        if (token.chainId === chainId) {
          addresses.add(getAddressKey(token.address))
        }
      }
    }

    return addresses.size === 0 ? EMPTY_CUSTOM_TOKENS : Array.from(addresses).sort()
  }, [userAddedTokens, virtualLists, chainId])
}

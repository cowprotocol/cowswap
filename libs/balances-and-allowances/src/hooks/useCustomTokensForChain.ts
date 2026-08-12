import { useMemo } from 'react'

import { AddressKey, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useUserAddedTokens, useVirtualLists } from '@cowprotocol/tokens'

const EMPTY_CUSTOM_TOKENS: AddressKey[] = []

/**
 * Normalized addresses of user-imported tokens for the given chain. The
 * reference is stable as long as the source atom does not recompute.
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

    return addresses.size === 0 ? EMPTY_CUSTOM_TOKENS : Array.from(addresses)
  }, [userAddedTokens, virtualLists, chainId])
}

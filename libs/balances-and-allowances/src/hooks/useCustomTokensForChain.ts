import { useMemo } from 'react'

import { AddressKey, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useUserAddedTokens } from '@cowprotocol/tokens'

const EMPTY_CUSTOM_TOKENS: AddressKey[] = []

/**
 * Normalized addresses of user-imported tokens for the given chain. The
 * reference is stable as long as the source atom does not recompute.
 */
export function useCustomTokensForChain(chainId: SupportedChainId): AddressKey[] {
  const userAddedTokens = useUserAddedTokens()

  return useMemo(() => {
    const addresses: AddressKey[] = []
    for (const token of userAddedTokens) {
      if (token.chainId !== chainId) continue
      addresses.push(getAddressKey(token.address))
    }
    return addresses.length === 0 ? EMPTY_CUSTOM_TOKENS : addresses
  }, [userAddedTokens, chainId])
}

import { useMemo } from 'react'

import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useUserAddedTokens } from '@cowprotocol/tokens'

/**
 * Returns the sorted, normalized addresses of user-imported tokens for the
 * given chain. The reference is stable as long as the source atom does not
 * recompute.
 */
export function useCustomTokensForChain(chainId: SupportedChainId): string[] {
  const userAddedTokens = useUserAddedTokens()

  return useMemo(
    () =>
      userAddedTokens
        .filter((token) => token.chainId === chainId)
        .map((token) => getAddressKey(token.address))
        .sort(),
    [userAddedTokens, chainId],
  )
}

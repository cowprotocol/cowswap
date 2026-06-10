import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useUserAddedTokens } from '@cowprotocol/tokens'

import { useStableStringArray } from './useStableStringArray'

/**
 * Returns the sorted, normalized addresses of user-imported tokens for the
 * given chain. Identity is stable across renders unless the set of addresses
 * changes.
 */
export function useCustomTokensForChain(chainId: SupportedChainId): string[] {
  const userAddedTokens = useUserAddedTokens()
  const computed = userAddedTokens
    .filter((token) => token.chainId === chainId)
    .map((token) => getAddressKey(token.address))
    .sort()
  return useStableStringArray(computed)
}

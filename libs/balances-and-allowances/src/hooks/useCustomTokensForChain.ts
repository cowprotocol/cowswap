import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useUserAddedTokens } from '@cowprotocol/tokens'

/**
 * Returns the sorted, normalized addresses of user-imported tokens for the
 * given chain.
 */
export function useCustomTokensForChain(chainId: SupportedChainId): string[] {
  const userAddedTokens = useUserAddedTokens()
  return userAddedTokens
    .filter((token) => token.chainId === chainId)
    .map((token) => getAddressKey(token.address))
    .sort()
}

import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { NATIVE_CURRENCY_ADDRESS, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { listsStatesByChainAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { TokensByAddress } from '../../state/tokens/allTokensAtom'
import { ListState } from '../../types'

/**
 * Returns a map of tokens by address for a specific chain.
 * Unlike useTokensByAddressMap, this hook allows fetching tokens for any chain,
 * not just the current active chain.
 *
 * Lists are processed in priority order (lower priority value = higher precedence).
 * Useful for bridge scenarios where you need tokens from the destination chain.
 */
export function useTokensByAddressMapForChain(chainId: SupportedChainId | undefined): TokensByAddress {
  const listsStatesByChain = useAtomValue(listsStatesByChainAtom)

  return useMemo(() => {
    if (!chainId) return {}

    const chainLists = listsStatesByChain[chainId]
    if (!chainLists) return {}

    // Filter out deleted lists and sort by priority (lower is better)
    const sortedLists = Object.values(chainLists)
      .filter((listState): listState is ListState => listState !== 'deleted' && !!listState.list?.tokens)
      .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER))

    const tokensByAddress: TokensByAddress = {}

    for (const listState of sortedLists) {
      for (const token of listState.list.tokens) {
        if (token.chainId !== chainId) continue

        const addressKey = token.address.toLowerCase()

        if (tokensByAddress[addressKey] || NATIVE_CURRENCY_ADDRESS.toLowerCase() === addressKey) continue

        tokensByAddress[addressKey] = TokenWithLogo.fromToken(token as TokenInfo, token.logoURI)
      }
    }

    return tokensByAddress
  }, [chainId, listsStatesByChain])
}

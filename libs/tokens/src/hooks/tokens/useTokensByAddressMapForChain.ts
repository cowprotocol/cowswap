import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import {
  areAddressesEqual,
  getAddressKey,
  isAdditionalTargetChain,
  SupportedChainId,
  TargetChainId,
} from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { additionalChainTokenListsStateAtom } from '../../state/additionalChainTokenLists/additionalChainTokenListsState.atoms'
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
 *
 * For SupportedChainId chains, reads from listsStatesByChainAtom.
 * For AdditionalTargetChainId chains, reads from additionalChainTokenListsStateAtom.
 */
export function useTokensByAddressMapForChain(chainId: SupportedChainId | undefined): TokensByAddress
export function useTokensByAddressMapForChain(chainId: TargetChainId | undefined): TokensByAddress
export function useTokensByAddressMapForChain(chainId: TargetChainId | undefined): TokensByAddress {
  const listsStatesByChain = useAtomValue(listsStatesByChainAtom)
  const additionalChainTokenListsState = useAtomValue(additionalChainTokenListsStateAtom)

  return useMemo(() => {
    if (!chainId) return {}

    if (isAdditionalTargetChain(chainId)) {
      return buildTokensByAddress(additionalChainTokenListsState[chainId], chainId)
    }

    return buildTokensByAddress(listsStatesByChain[chainId as SupportedChainId], chainId)
  }, [chainId, listsStatesByChain, additionalChainTokenListsState])
}

function buildTokensByAddress(
  chainLists: { [source: string]: ListState | 'deleted' } | undefined,
  chainId: TargetChainId,
): TokensByAddress {
  if (!chainLists) return {}

  const sortedLists = Object.values(chainLists)
    .filter((listState): listState is ListState => listState !== 'deleted' && !!listState.list?.tokens)
    .sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER))

  const tokensByAddress: TokensByAddress = {}

  for (const listState of sortedLists) {
    for (const token of listState.list.tokens) {
      const addressKey = getAddressKey(token.address)
      if (tokensByAddress[addressKey] || areAddressesEqual(token.address, NATIVE_CURRENCIES[chainId].address)) continue

      tokensByAddress[addressKey] = TokenWithLogo.fromToken(token as TokenInfo, token.logoURI)
    }
  }

  return tokensByAddress
}

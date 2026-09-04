import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { getAddressKey, Nullish, SupportedChainId } from '@cowprotocol/cow-sdk'

import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'

export function useAreThereTokensWithSameSymbol(): (
  tokenAddressOrSymbol: Nullish<string>,
  chainId: SupportedChainId,
) => boolean {
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)

  return useCallback(
    (tokenAddressOrSymbol: Nullish<string>, chainId: SupportedChainId) => {
      if (!tokenAddressOrSymbol || isAddress(tokenAddressOrSymbol)) return false

      if (tokensBySymbol.chainId !== chainId) return false

      const key = isAddress(tokenAddressOrSymbol)
        ? getAddressKey(tokenAddressOrSymbol)
        : tokenAddressOrSymbol.toLowerCase()
      const tokens = tokensBySymbol.tokens[key]
      const hasDuplications = tokens?.length > 1

      if (hasDuplications) {
        console.debug('There are tokens with the same symbol:', tokens)
      }

      return hasDuplications
    },
    [tokensBySymbol],
  )
}

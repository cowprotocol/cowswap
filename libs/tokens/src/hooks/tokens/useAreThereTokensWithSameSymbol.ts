import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { isAddress } from '@cowprotocol/common-utils'

import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'

export function useAreThereTokensWithSameSymbol(): (tokenAddressOrSymbol: string | null | undefined) => boolean {
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)

  return useCallback(
    (tokenAddressOrSymbol: string | null | undefined) => {
      if (!tokenAddressOrSymbol || isAddress(tokenAddressOrSymbol)) return false

      const tokens = tokensBySymbol[tokenAddressOrSymbol.toLowerCase()]
      const hasDuplications = tokens?.length > 1

      if (hasDuplications) {
        console.debug('There are tokens with the same symbol:', tokens)
      }

      return hasDuplications
    },
    [tokensBySymbol]
  )
}

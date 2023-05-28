import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'

import { tokensBySymbolAtom } from 'modules/tokensList/state/tokensListAtom'

import { isAddress } from 'legacy/utils'

export function useAreThereTokensWithSameSymbol(): (tokenAddressOrSymbol: string | null | undefined) => boolean {
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)

  return useCallback(
    (tokenAddressOrSymbol: string | null | undefined) => {
      if (!tokenAddressOrSymbol || isAddress(tokenAddressOrSymbol)) return false

      return tokensBySymbol[tokenAddressOrSymbol.toLowerCase()]?.length > 1
    },
    [tokensBySymbol]
  )
}

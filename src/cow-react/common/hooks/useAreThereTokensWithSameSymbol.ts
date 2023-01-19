import { isAddress } from 'utils'
import { useCallback } from 'react'
import { useAtomValue } from 'jotai/utils'
import { tokensBySymbolAtom } from '@cow/modules/tokensList/state/tokensListAtom'

export function useAreThereTokensWithSameSymbol(): (tokenAddressOrSymbol: string | null | undefined) => boolean {
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)

  return useCallback(
    (tokenAddressOrSymbol: string | null | undefined) => {
      if (!tokenAddressOrSymbol || isAddress(tokenAddressOrSymbol)) return false

      return tokensBySymbol[tokenAddressOrSymbol]?.length > 1
    },
    [tokensBySymbol]
  )
}

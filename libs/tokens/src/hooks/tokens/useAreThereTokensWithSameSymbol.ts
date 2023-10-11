import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'

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

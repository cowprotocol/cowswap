import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAreThereTokensWithSameSymbol() {
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)

  return useCallback(
    (tokenAddressOrSymbol: string | null | undefined, chainId: SupportedChainId) => {
      if (!tokenAddressOrSymbol || isAddress(tokenAddressOrSymbol)) return false

      if (tokensBySymbol.chainId !== chainId) return false

      const tokens = tokensBySymbol.tokens[tokenAddressOrSymbol.toLowerCase()]
      const hasDuplications = tokens?.length > 1

      if (hasDuplications) {
        console.debug('There are tokens with the same symbol:', tokens)
      }

      return hasDuplications
    },
    [tokensBySymbol],
  )
}

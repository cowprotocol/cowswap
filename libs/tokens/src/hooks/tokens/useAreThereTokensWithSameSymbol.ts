import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { useCallback } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'

const tokensBySymbolLoadableAtom = loadable(tokensBySymbolAtom)

export function useAreThereTokensWithSameSymbol(): (
  tokenAddressOrSymbol: string | null | undefined,
  chainId: SupportedChainId,
) => boolean {
  const tokensBySymbolLoadable = useAtomValue(tokensBySymbolLoadableAtom)
  const tokensBySymbol = tokensBySymbolLoadable.state === 'hasData' ? tokensBySymbolLoadable.data : null

  return useCallback(
    (tokenAddressOrSymbol: string | null | undefined, chainId: SupportedChainId) => {
      if (!tokenAddressOrSymbol || isAddress(tokenAddressOrSymbol)) return false
      if (!tokensBySymbol || tokensBySymbol.chainId !== chainId) return false

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

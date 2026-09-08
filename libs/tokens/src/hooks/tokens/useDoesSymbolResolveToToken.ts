import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'
import { doesSymbolResolveToAddress } from '../../utils/tokenIdentity'

export type DoesSymbolResolveToToken = (
  symbol: string | null | undefined,
  address: string | null | undefined,
  chainId: SupportedChainId,
) => boolean

/**
 * Whether a token can be referred to by its symbol, i.e. the symbol resolves back to that same address
 * among the active tokens. See `doesSymbolResolveToAddress` for why that can be false.
 *
 * Returns `true` when the active token set is for another chain, so callers keep their previous
 * behaviour instead of treating "cannot tell" as "does not resolve".
 */
export function useDoesSymbolResolveToToken(): DoesSymbolResolveToToken {
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)

  return useCallback(
    (symbol, address, chainId) => {
      if (tokensBySymbol.chainId !== chainId) return true

      return doesSymbolResolveToAddress(tokensBySymbol.tokens, symbol, address)
    },
    [tokensBySymbol],
  )
}

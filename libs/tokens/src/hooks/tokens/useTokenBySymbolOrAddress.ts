import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'

import { useTokensByAddressMap } from './useTokensByAddressMap'

import { environmentAtom } from '../../state/environmentAtom'
import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'

/**
 *
 * @param symbolOrAddress a key to search a token
 * @param chainId (optional) when specified, then it will match tokens only for that chain
 */
export function useTokenBySymbolOrAddress(
  symbolOrAddress?: string | null,
  chainId?: Nullish<SupportedChainId>,
): TokenWithLogo | null {
  const { chainId: currentEnvChainId } = useAtomValue(environmentAtom)
  const tokensByAddress = useTokensByAddressMap()
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom).tokens
  const networkMismatch = !!chainId && chainId !== currentEnvChainId

  return useMemo(() => {
    if (!symbolOrAddress || networkMismatch) {
      return null
    }

    const foundByAddress = tokensByAddress[getAddressKey(symbolOrAddress)]

    if (foundByAddress) return foundByAddress

    // Symbol lookup stays case-insensitive: `tokensBySymbolAtom` is keyed by the lower-cased symbol.
    const foundBySymbol = tokensBySymbol[symbolOrAddress.toLowerCase()]

    if (foundBySymbol) return foundBySymbol[0]

    return null
  }, [networkMismatch, symbolOrAddress, tokensByAddress, tokensBySymbol])
}

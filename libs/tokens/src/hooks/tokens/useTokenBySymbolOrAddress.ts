import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useTokensByAddressMap } from './useTokensByAddressMap'

import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): TokenWithLogo | null {
  const tokensByAddress = useTokensByAddressMap()
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom).tokens

  return useMemo(() => {
    if (!symbolOrAddress) {
      return null
    }

    const symbolOrAddressLowerCase = symbolOrAddress.toLowerCase()

    const foundByAddress = tokensByAddress[symbolOrAddressLowerCase]

    if (foundByAddress) return foundByAddress

    const foundBySymbol = tokensBySymbol[symbolOrAddressLowerCase]

    if (foundBySymbol) return foundBySymbol[0]

    return null
  }, [symbolOrAddress, tokensByAddress, tokensBySymbol])
}

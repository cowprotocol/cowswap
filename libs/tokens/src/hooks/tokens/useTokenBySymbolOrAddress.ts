import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { tokensByAddressAtom, tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): TokenWithLogo | null {
  const tokensByAddress = useAtomValue(tokensByAddressAtom)
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)

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
